import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Paystack webhook handler.
 *
 * Receives transfer status updates and updates redemption records.
 * Paystack sends events like "transfer.success", "transfer.failed", "transfer.reversed".
 */
export async function POST(request: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  // Verify webhook signature
  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  const hash = crypto
    .createHmac("sha512", secret)
    .update(body)
    .digest("hex");

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  // Only process transfer events
  if (!event.event?.startsWith("transfer.")) {
    return NextResponse.json({ received: true });
  }

  const transferData = event.data;
  const transferCode = transferData.transfer_code;
  const reference = transferData.reference;

  if (!transferCode && !reference) {
    return NextResponse.json({ received: true });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find the redemption by provider_reference
  const searchValue = transferCode || reference;
  const { data: redemption } = await supabase
    .from("redemptions")
    .select("id, user_id, points_spent, status")
    .eq("provider_reference", searchValue)
    .single();

  if (!redemption) {
    console.log("Paystack webhook: no matching redemption for", searchValue);
    return NextResponse.json({ received: true });
  }

  switch (event.event) {
    case "transfer.success":
      await supabase
        .from("redemptions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", redemption.id);
      break;

    case "transfer.failed":
    case "transfer.reversed":
      // Only refund if not already refunded
      if (redemption.status !== "refunded" && redemption.status !== "failed") {
        await supabase
          .from("redemptions")
          .update({
            status: "failed",
            failure_reason: `Paystack: ${event.event}`,
          })
          .eq("id", redemption.id);

        // Refund points
        await supabase.rpc("admin_adjust_points", {
          p_user_id: redemption.user_id,
          p_points: redemption.points_spent,
          p_reason: `Auto-refund: Paystack transfer ${event.event}`,
        });
      }
      break;
  }

  return NextResponse.json({ received: true });
}
