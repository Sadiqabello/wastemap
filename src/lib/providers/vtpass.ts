/**
 * VTPass API integration for airtime, data, and utility bill payments.
 *
 * API docs: https://vtpass.com/documentation
 * Sandbox docs: https://sandbox.vtpass.com/documentation
 *
 * Environment variables required:
 *   VTPASS_API_KEY    – your VTPass API key (or email for sandbox)
 *   VTPASS_SECRET_KEY – your VTPass secret/password key
 *   VTPASS_BASE_URL   – "https://api-service.vtpass.com" (live) or "https://sandbox.vtpass.com" (test)
 */

const BASE_URL = process.env.VTPASS_BASE_URL || "https://sandbox.vtpass.com";
const API_KEY = process.env.VTPASS_API_KEY || "";
const SECRET_KEY = process.env.VTPASS_SECRET_KEY || "";
const PUBLIC_KEY = process.env.VTPASS_PUBLIC_KEY || "";

// POST requests use api-key + secret-key
function postHeaders() {
  return {
    "Content-Type": "application/json",
    "api-key": API_KEY,
    "secret-key": SECRET_KEY,
  };
}

// GET requests use api-key + public-key
function getHeaders() {
  return {
    "Content-Type": "application/json",
    "api-key": API_KEY,
    "public-key": PUBLIC_KEY,
  };
}

function generateRequestId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const time = now.toISOString().slice(11, 19).replace(/:/g, "");
  const rand = Math.random().toString(36).slice(2, 8);
  return `WM${date}${time}${rand}`;
}

export interface VTPassResponse {
  code: string;
  response_description: string;
  requestId: string;
  amount: number;
  purchased_code: string;
  content: {
    transactions: {
      status: string;
      product_name: string;
      unique_element: string;
      unit_price: number;
      quantity: number;
      service_verification: string | null;
      channel: string;
      commission: number;
      total_amount: number;
      discount: number | null;
      type: string;
      email: string;
      phone: string;
      name: string | null;
      convinience_fee: number;
      amount: number;
      platform: string;
      method: string;
      transactionId: string;
    };
  };
}

export interface DataPlan {
  variation_code: string;
  name: string;
  variation_amount: string;
  fixedPrice: string;
}

/**
 * Purchase airtime for a phone number.
 */
export async function purchaseAirtime(
  phoneNumber: string,
  amount: number,
  network: string // "mtn", "airtel", "glo", "etisalat"
): Promise<{ success: boolean; requestId: string; data?: VTPassResponse; error?: string }> {
  const requestId = generateRequestId();
  const serviceID = network.toLowerCase();

  try {
    console.log("VTPass airtime request:", JSON.stringify({ serviceID, amount, phone: phoneNumber, request_id: requestId, base_url: BASE_URL }));

    // VTPass expects phone as a number, not string
    const phoneNum = Number(phoneNumber.replace(/\D/g, ""));

    const res = await fetch(`${BASE_URL}/api/pay`, {
      method: "POST",
      headers: postHeaders(),
      body: JSON.stringify({
        request_id: requestId,
        serviceID,
        amount,
        phone: phoneNum,
      }),
    });

    if (!res.ok && res.status === 401) {
      return { success: false, requestId, error: `VTPass authentication failed (${res.status}). Check VTPASS_API_KEY and VTPASS_SECRET_KEY.` };
    }

    const data = await res.json();
    console.log("VTPass airtime response:", JSON.stringify(data, null, 2));

    const code = data.code || data.response_code;
    const txStatus = data.content?.transactions?.status;

    if (code === "000" || txStatus === "delivered") {
      return { success: true, requestId, data };
    }

    return {
      success: false,
      requestId,
      error: data.response_description || data.message || `Airtime purchase failed (code: ${code})`,
    };
  } catch (err) {
    console.error("VTPass airtime error:", err);
    return { success: false, requestId, error: "Network error contacting VTPass" };
  }
}

/**
 * Purchase a data bundle.
 */
export async function purchaseData(
  phoneNumber: string,
  variationCode: string,
  network: string // "mtn-data", "airtel-data", "glo-data", "etisalat-data"
): Promise<{ success: boolean; requestId: string; data?: VTPassResponse; error?: string }> {
  const requestId = generateRequestId();
  // Ensure serviceID ends with -data
  const serviceID = network.endsWith("-data") ? network : `${network}-data`;

  try {
    console.log("VTPass data request:", JSON.stringify({ serviceID, variationCode, phone: phoneNumber, request_id: requestId }));

    const res = await fetch(`${BASE_URL}/api/pay`, {
      method: "POST",
      headers: postHeaders(),
      body: JSON.stringify({
        request_id: requestId,
        serviceID,
        billersCode: phoneNumber.replace(/\D/g, ""),
        variation_code: variationCode,
        phone: Number(phoneNumber.replace(/\D/g, "")),
      }),
    });

    if (!res.ok && res.status === 401) {
      return { success: false, requestId, error: `VTPass authentication failed (${res.status}). Check credentials.` };
    }

    const data = await res.json();
    console.log("VTPass data response:", JSON.stringify(data, null, 2));

    const code = data.code || data.response_code;
    const txStatus = data.content?.transactions?.status;

    if (code === "000" || txStatus === "delivered") {
      return { success: true, requestId, data };
    }

    return {
      success: false,
      requestId,
      error: data.response_description || data.message || `Data purchase failed (code: ${code})`,
    };
  } catch (err) {
    console.error("VTPass data error:", err);
    return { success: false, requestId, error: "Network error contacting VTPass" };
  }
}

/**
 * Fetch available data plan variations for a network.
 */
export async function getDataPlans(network: string): Promise<DataPlan[]> {
  // Ensure serviceID ends with -data
  const serviceID = network.endsWith("-data") ? network : `${network}-data`;

  try {
    const res = await fetch(`${BASE_URL}/api/service-variations?serviceID=${serviceID}`, {
      method: "GET",
      headers: getHeaders(),
    });

    const data = await res.json();

    if (data.content?.vapiations) {
      return data.content.vapiations; // VTPass misspells "variations"
    }
    if (data.content?.variations) {
      return data.content.variations;
    }

    return [];
  } catch (err) {
    console.error("VTPass data plans error:", err);
    return [];
  }
}

/**
 * Query transaction status.
 */
export async function queryTransaction(
  requestId: string
): Promise<{ status: string; data?: VTPassResponse }> {
  try {
    const res = await fetch(`${BASE_URL}/api/requery`, {
      method: "POST",
      headers: postHeaders(),
      body: JSON.stringify({ request_id: requestId }),
    });

    const data = (await res.json()) as VTPassResponse;
    const status = data.content?.transactions?.status || "unknown";

    return { status, data };
  } catch (err) {
    console.error("VTPass requery error:", err);
    return { status: "error" };
  }
}
