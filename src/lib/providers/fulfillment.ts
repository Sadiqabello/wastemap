/**
 * Reward fulfillment engine.
 *
 * Routes redemptions to the correct provider based on reward.provider and reward.category.
 * Updates redemption status in the database after processing.
 */

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { purchaseAirtime, purchaseData } from "./vtpass";
import { initiateTransfer, resolveAccount } from "./paystack";
import type { Database } from "@/types/database";

// Use service role client for server-side fulfillment (bypasses RLS)
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for fulfillment");
  }

  return createServiceClient<Database>(url, serviceKey);
}

interface FulfillmentResult {
  success: boolean;
  providerReference?: string;
  error?: string;
}

/**
 * Process a redemption by routing to the appropriate provider.
 */
export async function fulfillRedemption(redemptionId: string): Promise<FulfillmentResult> {
  const supabase = getServiceClient();

  // Fetch redemption with reward details
  const { data: redemption, error: fetchError } = await supabase
    .from("redemptions")
    .select("*, rewards(*)")
    .eq("id", redemptionId)
    .single();

  if (fetchError || !redemption) {
    console.error("Fulfillment: redemption not found", fetchError);
    return { success: false, error: "Redemption not found" };
  }

  // Skip if already processed
  if (redemption.status !== "pending") {
    return { success: false, error: `Redemption already ${redemption.status}` };
  }

  // Mark as processing
  await supabase
    .from("redemptions")
    .update({ status: "processing" })
    .eq("id", redemptionId);

  const reward = redemption.rewards as Database["public"]["Tables"]["rewards"]["Row"];
  const details = redemption.delivery_details as Record<string, string>;
  let result: FulfillmentResult;

  try {
    switch (reward.provider) {
      case "vtpass":
        result = await fulfillVTPass(reward, details);
        break;

      case "paystack":
        result = await fulfillPaystack(reward, details);
        break;

      case "manual":
        // Manual fulfillment — leave as pending for admin to handle
        await supabase
          .from("redemptions")
          .update({ status: "pending", provider_reference: "awaiting_admin" })
          .eq("id", redemptionId);
        return { success: true, providerReference: "manual_pending" };

      default:
        result = { success: false, error: `Unknown provider: ${reward.provider}` };
    }
  } catch (err) {
    console.error("Fulfillment error:", err);
    result = { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }

  // Update redemption status
  if (result.success) {
    await supabase
      .from("redemptions")
      .update({
        status: "completed",
        provider_reference: result.providerReference || null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", redemptionId);
  } else {
    await supabase
      .from("redemptions")
      .update({
        status: "failed",
        failure_reason: result.error || "Unknown error",
      })
      .eq("id", redemptionId);
    // No refund needed — points are only deducted after successful fulfillment
  }

  return result;
}

/**
 * Fulfill via VTPass (airtime, data, electricity).
 */
async function fulfillVTPass(
  reward: Database["public"]["Tables"]["rewards"]["Row"],
  details: Record<string, string>
): Promise<FulfillmentResult> {
  const phone = details.phoneNumber;
  if (!phone) {
    return { success: false, error: "Phone number required" };
  }

  const config = (reward.provider_config || {}) as Record<string, string>;

  switch (reward.category) {
    case "airtime": {
      const network = config.network || detectNetwork(phone);
      const amount = config.amount ? Number(config.amount) : reward.point_cost; // default: 1 pt = ₦1
      const res = await purchaseAirtime(phone, amount, network);
      return {
        success: res.success,
        providerReference: res.requestId,
        error: res.error,
      };
    }

    case "data": {
      const network = config.network || detectNetwork(phone);
      const variationCode = config.variation_code;
      if (!variationCode) {
        return { success: false, error: "Data plan variation_code not configured on reward" };
      }
      const res = await purchaseData(phone, variationCode, network);
      return {
        success: res.success,
        providerReference: res.requestId,
        error: res.error,
      };
    }

    case "utility": {
      // Electricity handled separately if needed
      return { success: false, error: "Utility fulfillment via VTPass not yet automated" };
    }

    default:
      return { success: false, error: `VTPass doesn't handle category: ${reward.category}` };
  }
}

/**
 * Fulfill via Paystack (bank transfers).
 */
async function fulfillPaystack(
  reward: Database["public"]["Tables"]["rewards"]["Row"],
  details: Record<string, string>
): Promise<FulfillmentResult> {
  const { accountNumber, bankCode } = details;
  if (!accountNumber || !bankCode) {
    return { success: false, error: "Account number and bank code required" };
  }

  // Resolve account name
  const resolveResult = await resolveAccount(accountNumber, bankCode);
  if (!resolveResult.success) {
    return { success: false, error: resolveResult.error || "Could not verify account" };
  }

  const config = (reward.provider_config || {}) as Record<string, string>;
  const amountNaira = config.amount ? Number(config.amount) : reward.point_cost; // default: 1 pt = ₦1

  const transferResult = await initiateTransfer(
    accountNumber,
    bankCode,
    resolveResult.accountName!,
    amountNaira,
    `WasteMapNaija reward: ${reward.name}`
  );

  if (!transferResult.success) {
    return { success: false, error: transferResult.error };
  }

  // Paystack transfers are async — they may still be "pending"
  // The webhook will update to "completed" when Paystack confirms
  return {
    success: true,
    providerReference: transferResult.transferCode || transferResult.reference,
  };
}

/**
 * Simple network detection from Nigerian phone prefix.
 * Returns VTPass serviceID: "mtn", "airtel", "glo", "etisalat"
 */
function detectNetwork(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  // Normalize to local format starting with 0
  const local = cleaned.startsWith("234")
    ? "0" + cleaned.slice(3)
    : cleaned.startsWith("0")
    ? cleaned
    : "0" + cleaned;

  const prefix = local.slice(0, 4);

  const mtnPrefixes = ["0803", "0806", "0703", "0706", "0813", "0816", "0810", "0814", "0903", "0906", "0913", "0916"];
  const airtelPrefixes = ["0802", "0808", "0708", "0812", "0701", "0902", "0901", "0907"];
  const gloPrefixes = ["0805", "0807", "0705", "0815", "0811", "0905", "0915"];
  const nineMobilePrefixes = ["0809", "0818", "0817", "0908", "0909"];

  if (mtnPrefixes.includes(prefix)) return "mtn";
  if (airtelPrefixes.includes(prefix)) return "airtel";
  if (gloPrefixes.includes(prefix)) return "glo";
  if (nineMobilePrefixes.includes(prefix)) return "etisalat";

  return "mtn"; // fallback
}
