"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { purchaseAirtime, purchaseData } from "@/lib/providers/vtpass";
import { initiateTransfer, resolveAccount } from "@/lib/providers/paystack";
import type { Database } from "@/types/database";

import { PLATFORM_FEE_PERCENT } from "@/lib/constants";

// ── Conversion rate: 1 point = ₦1 ────────────────────────────
const POINTS_TO_NAIRA = 1;

/**
 * Calculate platform fee. Premium users pay 0%.
 */
async function calculateFee(adminClient: ReturnType<typeof getAdminClient>, userId: string, amount: number): Promise<{ fee: number; netAmount: number }> {
  const { data: sub } = await adminClient
    .from("premium_subscriptions")
    .select("status, expires_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  const isPremium = sub && new Date(sub.expires_at) > new Date();
  const feePercent = isPremium ? 0 : PLATFORM_FEE_PERCENT;
  const fee = Math.round((amount * feePercent) / 100);
  return { fee, netAmount: amount - fee };
}

async function recordFee(adminClient: ReturnType<typeof getAdminClient>, fee: number, referenceId: string) {
  if (fee <= 0) return;
  await adminClient.from("platform_revenue").insert({
    source: "redemption_fee",
    amount_naira: fee,
    reference_id: referenceId,
    reference_type: "redemption",
    description: `${PLATFORM_FEE_PERCENT}% redemption fee`,
  });
}

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Server configuration missing. SUPABASE_SERVICE_ROLE_KEY is required.");
  }
  return createServiceClient<Database>(supabaseUrl, serviceKey);
}

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Redeem points for airtime.
 */
export async function redeemAirtime(
  phoneNumber: string,
  amount: number,
  network: string
) {
  const user = await getAuthUser();
  if (!user) return { error: "You must be signed in." };

  // Validate inputs
  if (!phoneNumber || phoneNumber.replace(/\D/g, "").length < 10) {
    return { error: "Enter a valid phone number." };
  }
  const nairaAmount = amount * POINTS_TO_NAIRA;
  if (nairaAmount < 50) return { error: "Minimum airtime is ₦50 (50 points)." };
  if (nairaAmount > 5000) return { error: "Maximum airtime is ₦5,000 (5000 points)." };

  const adminClient = getAdminClient();

  // Check user has enough points
  const { data: profile } = await adminClient
    .from("profiles")
    .select("points")
    .eq("id", user.id)
    .single();

  if (!profile || profile.points < amount) {
    return { error: "You don't have enough points." };
  }

  // Calculate platform fee
  const { fee, netAmount } = await calculateFee(adminClient, user.id, nairaAmount);

  // Create redemption as pending
  const { data: redemption, error: redemptionError } = await adminClient
    .from("redemptions")
    .insert({
      user_id: user.id,
      reward_id: null,
      points_spent: amount,
      delivery_details: { type: "airtime", phoneNumber, amount: String(netAmount), fee: String(fee), network },
    })
    .select("id")
    .single();

  if (redemptionError) {
    console.error("Error creating redemption:", redemptionError);
    return { error: "Failed to create redemption." };
  }

  // Attempt VTPass purchase (send net amount after fee)
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  const result = await purchaseAirtime(cleanPhone, netAmount, network);

  if (result.success) {
    // Deduct points only on success
    await adminClient
      .from("profiles")
      .update({ points: profile.points - amount })
      .eq("id", user.id);

    await adminClient.from("point_transactions").insert({
      user_id: user.id,
      action: `Airtime: ₦${netAmount} to ${phoneNumber}${fee > 0 ? ` (fee: ₦${fee})` : ""}`,
      points: -amount,
    });

    await adminClient
      .from("redemptions")
      .update({
        status: "completed",
        provider_reference: result.requestId,
        completed_at: new Date().toISOString(),
      })
      .eq("id", redemption.id);

    // Record platform revenue from fee
    await recordFee(adminClient, fee, redemption.id);

    revalidatePath("/rewards");
    revalidatePath("/profile");
    return { success: true, fee };
  } else {
    await adminClient
      .from("redemptions")
      .update({ status: "failed", failure_reason: result.error })
      .eq("id", redemption.id);

    return { error: result.error || "Airtime purchase failed." };
  }
}

/**
 * Redeem points for data bundle.
 */
export async function redeemData(
  phoneNumber: string,
  variationCode: string,
  network: string,
  planCostNaira: number
) {
  const user = await getAuthUser();
  if (!user) return { error: "You must be signed in." };

  if (!phoneNumber || phoneNumber.replace(/\D/g, "").length < 10) {
    return { error: "Enter a valid phone number." };
  }
  if (!variationCode) return { error: "Select a data plan." };

  const pointsCost = Math.ceil(planCostNaira / POINTS_TO_NAIRA);

  const adminClient = getAdminClient();

  const { data: profile } = await adminClient
    .from("profiles")
    .select("points")
    .eq("id", user.id)
    .single();

  if (!profile || profile.points < pointsCost) {
    return { error: "You don't have enough points for this plan." };
  }

  // Calculate platform fee
  const { fee } = await calculateFee(adminClient, user.id, planCostNaira);

  const { data: redemption, error: redemptionError } = await adminClient
    .from("redemptions")
    .insert({
      user_id: user.id,
      reward_id: null,
      points_spent: pointsCost,
      delivery_details: { type: "data", phoneNumber, variationCode, network, amount: String(planCostNaira), fee: String(fee) },
    })
    .select("id")
    .single();

  if (redemptionError) {
    console.error("Error creating redemption:", redemptionError);
    return { error: "Failed to create redemption." };
  }

  const cleanPhone = phoneNumber.replace(/\D/g, "");
  const result = await purchaseData(cleanPhone, variationCode, network);

  if (result.success) {
    await adminClient
      .from("profiles")
      .update({ points: profile.points - pointsCost })
      .eq("id", user.id);

    await adminClient.from("point_transactions").insert({
      user_id: user.id,
      action: `Data: ${variationCode} to ${phoneNumber}${fee > 0 ? ` (fee: ₦${fee})` : ""}`,
      points: -pointsCost,
    });

    await adminClient
      .from("redemptions")
      .update({
        status: "completed",
        provider_reference: result.requestId,
        completed_at: new Date().toISOString(),
      })
      .eq("id", redemption.id);

    // Record platform revenue from fee
    await recordFee(adminClient, fee, redemption.id);

    revalidatePath("/rewards");
    revalidatePath("/profile");
    return { success: true, fee };
  } else {
    await adminClient
      .from("redemptions")
      .update({ status: "failed", failure_reason: result.error })
      .eq("id", redemption.id);

    return { error: result.error || "Data purchase failed." };
  }
}

/**
 * Redeem points for bank transfer (cash).
 */
export async function redeemCash(
  accountNumber: string,
  bankCode: string,
  accountName: string,
  amount: number
) {
  const user = await getAuthUser();
  if (!user) return { error: "You must be signed in." };

  if (!accountNumber || accountNumber.length !== 10) {
    return { error: "Enter a valid 10-digit account number." };
  }
  if (!bankCode) return { error: "Select a bank." };
  if (!accountName) return { error: "Account not verified." };

  const nairaAmount = amount * POINTS_TO_NAIRA;
  if (nairaAmount < 100) return { error: "Minimum transfer is ₦100 (100 points)." };
  if (nairaAmount > 10000) return { error: "Maximum transfer is ₦10,000 (10000 points)." };

  const adminClient = getAdminClient();

  const { data: profile } = await adminClient
    .from("profiles")
    .select("points")
    .eq("id", user.id)
    .single();

  if (!profile || profile.points < amount) {
    return { error: "You don't have enough points." };
  }

  // Calculate platform fee
  const { fee, netAmount } = await calculateFee(adminClient, user.id, nairaAmount);

  const { data: redemption, error: redemptionError } = await adminClient
    .from("redemptions")
    .insert({
      user_id: user.id,
      reward_id: null,
      points_spent: amount,
      delivery_details: { type: "bank_transfer", accountNumber, bankCode, accountName, amount: String(netAmount), fee: String(fee) },
    })
    .select("id")
    .single();

  if (redemptionError) {
    console.error("Error creating redemption:", redemptionError);
    return { error: "Failed to create redemption." };
  }

  // Verify account first
  const verifyResult = await resolveAccount(accountNumber, bankCode);
  if (!verifyResult.success) {
    await adminClient
      .from("redemptions")
      .update({ status: "failed", failure_reason: "Account verification failed" })
      .eq("id", redemption.id);
    return { error: verifyResult.error || "Could not verify account." };
  }

  const transferResult = await initiateTransfer(
    accountNumber,
    bankCode,
    verifyResult.accountName!,
    netAmount, // send net amount after fee
    `WasteMapNaija cashout: ${amount} pts`
  );

  if (transferResult.success) {
    await adminClient
      .from("profiles")
      .update({ points: profile.points - amount })
      .eq("id", user.id);

    await adminClient.from("point_transactions").insert({
      user_id: user.id,
      action: `Cash: ₦${netAmount} to ${accountName}${fee > 0 ? ` (fee: ₦${fee})` : ""}`,
      points: -amount,
    });

    await adminClient
      .from("redemptions")
      .update({
        status: "completed",
        provider_reference: transferResult.transferCode || transferResult.reference,
        completed_at: new Date().toISOString(),
      })
      .eq("id", redemption.id);

    // Record platform revenue from fee
    await recordFee(adminClient, fee, redemption.id);

    revalidatePath("/rewards");
    revalidatePath("/profile");
    return { success: true, fee };
  } else {
    await adminClient
      .from("redemptions")
      .update({ status: "failed", failure_reason: transferResult.error })
      .eq("id", redemption.id);

    return { error: transferResult.error || "Bank transfer failed." };
  }
}

/**
 * Redeem a catalog reward by ID. Used by the RedeemDialog component.
 */
export async function redeemReward(
  rewardId: string,
  details: Record<string, string>
) {
  const user = await getAuthUser();
  if (!user) return { error: "You must be signed in." };

  const adminClient = getAdminClient();

  // Look up the reward
  const { data: reward, error: rewardError } = await adminClient
    .from("rewards")
    .select("*")
    .eq("id", rewardId)
    .single();

  if (rewardError || !reward) return { error: "Reward not found." };
  if (!reward.is_active) return { error: "This reward is no longer available." };
  if (reward.stock !== null && reward.stock <= 0) return { error: "This reward is out of stock." };

  // Check user has enough points
  const { data: profile } = await adminClient
    .from("profiles")
    .select("points")
    .eq("id", user.id)
    .single();

  if (!profile || profile.points < reward.point_cost) {
    return { error: "You don't have enough points." };
  }

  const nairaAmount = reward.point_cost * POINTS_TO_NAIRA;
  const { fee, netAmount } = await calculateFee(adminClient, user.id, nairaAmount);

  // Create redemption record
  const { data: redemption, error: redemptionError } = await adminClient
    .from("redemptions")
    .insert({
      user_id: user.id,
      reward_id: rewardId,
      points_spent: reward.point_cost,
      delivery_details: { ...details, category: reward.category, fee: String(fee) },
    })
    .select("id")
    .single();

  if (redemptionError) {
    console.error("Error creating redemption:", redemptionError);
    return { error: "Failed to create redemption." };
  }

  // Try auto-fulfillment for supported categories
  let fulfilled = false;
  let providerRef: string | undefined;
  let failureReason: string | undefined;

  if (reward.category === "airtime" && details.phoneNumber) {
    const cleanPhone = details.phoneNumber.replace(/\D/g, "");
    const result = await purchaseAirtime(cleanPhone, netAmount, details.network || "mtn");
    if (result.success) {
      fulfilled = true;
      providerRef = result.requestId;
    } else {
      failureReason = result.error;
    }
  } else if (reward.category === "data" && details.phoneNumber) {
    const cleanPhone = details.phoneNumber.replace(/\D/g, "");
    const result = await purchaseData(cleanPhone, details.variationCode || "", details.network || "mtn");
    if (result.success) {
      fulfilled = true;
      providerRef = result.requestId;
    } else {
      failureReason = result.error;
    }
  } else if (reward.category === "bank_transfer" && details.accountNumber && details.bankCode) {
    const result = await initiateTransfer(
      details.accountNumber,
      details.bankCode,
      details.accountName || "",
      netAmount,
      `Reward: ${reward.name}`
    );
    if (result.success) {
      fulfilled = true;
      providerRef = result.transferCode;
    } else {
      failureReason = result.error;
    }
  }

  // For auto-fulfillable categories that failed, mark failed and don't deduct
  if (["airtime", "data", "bank_transfer"].includes(reward.category) && !fulfilled) {
    await adminClient
      .from("redemptions")
      .update({ status: "failed", failure_reason: failureReason || "Fulfillment failed" })
      .eq("id", redemption.id);
    return { error: failureReason || "Fulfillment failed. No points were deducted." };
  }

  // Deduct points
  await adminClient
    .from("profiles")
    .update({ points: profile.points - reward.point_cost })
    .eq("id", user.id);

  await adminClient.from("point_transactions").insert({
    user_id: user.id,
    action: `Redeemed: ${reward.name}${fee > 0 ? ` (fee: ₦${fee})` : ""}`,
    points: -reward.point_cost,
  });

  // Decrement stock if applicable
  if (reward.stock !== null) {
    await adminClient
      .from("rewards")
      .update({ stock: reward.stock - 1 })
      .eq("id", rewardId);
  }

  // Update redemption status
  await adminClient
    .from("redemptions")
    .update({
      status: fulfilled ? "completed" : "pending",
      provider_reference: providerRef || null,
      completed_at: fulfilled ? new Date().toISOString() : null,
    })
    .eq("id", redemption.id);

  // Record platform fee
  await recordFee(adminClient, fee, redemption.id);

  revalidatePath("/rewards");
  revalidatePath("/profile");
  return { success: true, fee };
}

export async function updatePhoneNumber(phoneNumber: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ phone_number: phoneNumber })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating phone number:", error);
    return { error: "Failed to update phone number." };
  }

  revalidatePath("/profile");
  revalidatePath("/rewards");
  return { success: true };
}
