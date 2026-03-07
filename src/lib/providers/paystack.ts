/**
 * Paystack API integration for bank transfers.
 *
 * API docs: https://paystack.com/docs/api/transfer
 *
 * Environment variables required:
 *   PAYSTACK_SECRET_KEY – your Paystack secret key
 */

const BASE_URL = "https://api.paystack.co";
const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${SECRET_KEY}`,
  };
}

export interface PaystackBank {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  country: string;
  currency: string;
  type: string;
  is_deleted: boolean;
  active: boolean;
}

export interface TransferRecipient {
  recipient_code: string;
  name: string;
  details: {
    account_number: string;
    account_name: string;
    bank_code: string;
    bank_name: string;
  };
}

export interface TransferResult {
  success: boolean;
  transferCode?: string;
  reference?: string;
  recipientCode?: string;
  error?: string;
}

/**
 * Fetch list of Nigerian banks.
 */
export async function getBanks(): Promise<PaystackBank[]> {
  try {
    const res = await fetch(`${BASE_URL}/bank?country=nigeria&perPage=100`, {
      headers: headers(),
    });

    const data = await res.json();

    if (data.status && data.data) {
      return data.data.filter((b: PaystackBank) => b.active && !b.is_deleted);
    }

    return [];
  } catch (err) {
    console.error("Paystack banks error:", err);
    return [];
  }
}

/**
 * Resolve/verify an account number to get the account name.
 */
export async function resolveAccount(
  accountNumber: string,
  bankCode: string
): Promise<{ success: boolean; accountName?: string; error?: string }> {
  try {
    const res = await fetch(
      `${BASE_URL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      { headers: headers() }
    );

    const data = await res.json();

    if (data.status && data.data?.account_name) {
      return { success: true, accountName: data.data.account_name };
    }

    return { success: false, error: data.message || "Could not resolve account" };
  } catch (err) {
    console.error("Paystack resolve error:", err);
    return { success: false, error: "Network error" };
  }
}

/**
 * Create a transfer recipient (needed before initiating a transfer).
 */
async function createRecipient(
  accountName: string,
  accountNumber: string,
  bankCode: string
): Promise<{ success: boolean; recipientCode?: string; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/transferrecipient`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        type: "nuban",
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN",
      }),
    });

    const data = await res.json();

    if (data.status && data.data?.recipient_code) {
      return { success: true, recipientCode: data.data.recipient_code };
    }

    return { success: false, error: data.message || "Failed to create recipient" };
  } catch (err) {
    console.error("Paystack create recipient error:", err);
    return { success: false, error: "Network error" };
  }
}

/**
 * Initiate a bank transfer.
 *
 * Amount is in Naira (will be converted to kobo internally).
 */
export async function initiateTransfer(
  accountNumber: string,
  bankCode: string,
  accountName: string,
  amountNaira: number,
  reason: string = "WasteMap reward redemption"
): Promise<TransferResult> {
  // Step 1: Create recipient
  const recipientResult = await createRecipient(accountName, accountNumber, bankCode);
  if (!recipientResult.success) {
    return { success: false, error: recipientResult.error };
  }

  // Step 2: Initiate transfer
  const reference = `wm_transfer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const res = await fetch(`${BASE_URL}/transfer`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        source: "balance",
        reason,
        amount: amountNaira * 100, // Convert to kobo
        recipient: recipientResult.recipientCode,
        reference,
      }),
    });

    const data = await res.json();

    if (data.status && data.data?.transfer_code) {
      return {
        success: true,
        transferCode: data.data.transfer_code,
        reference: data.data.reference,
        recipientCode: recipientResult.recipientCode,
      };
    }

    return {
      success: false,
      error: data.message || "Transfer initiation failed",
    };
  } catch (err) {
    console.error("Paystack transfer error:", err);
    return { success: false, error: "Network error" };
  }
}

/**
 * Verify a transfer status.
 */
export async function verifyTransfer(
  transferCode: string
): Promise<{ status: string; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/transfer/${transferCode}`, {
      headers: headers(),
    });

    const data = await res.json();

    if (data.status && data.data) {
      return { status: data.data.status }; // "success", "pending", "failed", "reversed"
    }

    return { status: "unknown", error: data.message };
  } catch (err) {
    console.error("Paystack verify transfer error:", err);
    return { status: "error", error: "Network error" };
  }
}
