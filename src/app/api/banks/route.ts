import { NextResponse } from "next/server";
import { getBanks } from "@/lib/providers/paystack";

/**
 * GET /api/banks
 * Returns list of Nigerian banks from Paystack.
 * Cached for 24 hours.
 */
export async function GET() {
  const banks = await getBanks();

  const simplified = banks.map((b) => ({
    code: b.code,
    name: b.name,
  }));

  return NextResponse.json(simplified, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
    },
  });
}
