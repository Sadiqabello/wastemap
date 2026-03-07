import { NextRequest, NextResponse } from "next/server";
import { resolveAccount } from "@/lib/providers/paystack";

/**
 * GET /api/resolve-account?account_number=0123456789&bank_code=044
 * Resolves a bank account to get the account holder's name.
 */
export async function GET(request: NextRequest) {
  const accountNumber = request.nextUrl.searchParams.get("account_number");
  const bankCode = request.nextUrl.searchParams.get("bank_code");

  if (!accountNumber || !bankCode) {
    return NextResponse.json(
      { error: "account_number and bank_code are required" },
      { status: 400 }
    );
  }

  const result = await resolveAccount(accountNumber, bankCode);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({ account_name: result.accountName });
}
