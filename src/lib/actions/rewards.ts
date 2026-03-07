"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { purchaseAirtime, purchaseData } from "@/lib/providers/vtpass";
import { initiateTransfer, resolveAccount } from "@/lib/providers/paystack";
import type { Database } from "@/types/database";

// ── Conversion rate: 1 point = N1 ────────────────────────────
const POINTS_TO_NAIRA = 1;

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
  if (nairaAmount < 50) return { error: "Minimum airtime is N50 (50 points)." };
  if (nairaAmount > 5000) return { error: "Maximum airtime is N5,000 (5000 points)." };

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

  // Create redemption as pending
  const { data: redemption, error: redemptionError } = await adminClient
    .from("redemptions")
    .insert({
      user_id: user.id,
      reward_id: null, // no fixed reward
      points_spent: amount,
      delivery_details: { type: "airtime", phoneNumber, amount: String(nairaAmount), network },
    })
    .select("id")
    .single();

  if (redemptionError) {
    console.error("Error creating redemption:", redemptionError);
    return { error: "Failed to create redemption." };
  }

  // Attempt VTPass purchase
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  const result = await purchaseAirtime(cleanPhone, nairaAmount, network);

  if (result.success) {
    // Deduct points only on success
    await adminClient
      .from("profiles")
      .update({ points: profile.points - amount })
      .eq("id", user.id);

    await adminClient.from("point_transactions").insert({
      user_id: user.id,
      action: `Airtime: N${nairaAmount} to ${phoneNumber}`,
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

    revalidatePath("/rewards");
    revalidatePath("/profile");
    return { success: true };
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

  const { data: redemption, error: redemptionError } = await adminClient
    .from("redemptions")
    .insert({
      user_id: user.id,
      reward_id: null,
      points_spent: pointsCost,
      delivery_details: { type: "data", phoneNumber, variationCode, network, amount: String(planCostNaira) },
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
      action: `Data: ${variationCode} to ${phoneNumber}`,
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

    revalidatePath("/rewards");
    revalidatePath("/profile");
    return { success: true };
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
  if (nairaAmount < 100) return { error: "Minimum transfer is N100 (100 points)." };
  if (nairaAmount > 10000) return { error: "Maximum transfer is N10,000 (10000 points)." };

  const adminClient = getAdminClient();

  const { data: profile } = await adminClient
    .from("profiles")
    .select("points")
    .eq("id", user.id)
    .single();

  if (!profile || profile.points < amount) {
    return { error: "You don't have enough points." };
  }

  const { data: redemption, error: redemptionError } = await adminClient
    .from("redemptions")
    .insert({
      user_id: user.id,
      reward_id: null,
      points_spent: amount,
      delivery_details: { type: "bank_transfer", accountNumber, bankCode, accountName, amount: String(nairaAmount) },
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
    nairaAmount,
    `WasteMap cashout: ${amount} pts`
  );

  if (transferResult.success) {
    await adminClient
      .from("profiles")
      .update({ points: profile.points - amount })
      .eq("id", user.id);

    await adminClient.from("point_transactions").insert({
      user_id: user.id,
      action: `Cash: N${nairaAmount} to ${accountName}`,
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

    revalidatePath("/rewards");
    revalidatePath("/profile");
    return { success: true };
  } else {
    await adminClient
      .from("redemptions")
      .update({ status: "failed", failure_reason: transferResult.error })
      .eq("id", redemption.id);

    return { error: transferResult.error || "Bank transfer failed." };
  }
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
