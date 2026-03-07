import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * VTPass webhook handler.
 *
 * VTPass can send callback notifications for transaction status changes.
 * This is optional — most VTPass transactions are synchronous.
 * Configure the callback URL in your VTPass dashboard.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  // VTPass sends: { request_id, status, ... }
  const requestId = body.request_id || body.requestId;
  const status = body.status; // "delivered", "failed"

  if (!requestId) {
    return NextResponse.json({ received: true });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find the redemption by provider_reference
  const { data: redemption } = await supabase
    .from("redemptions")
    .select("id, user_id, points_spent, status")
    .eq("provider_reference", requestId)
    .single();

  if (!redemption) {
    console.log("VTPass webhook: no matching redemption for", requestId);
    return NextResponse.json({ received: true });
  }

  if (status === "delivered") {
    await supabase
      .from("redemptions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", redemption.id);
  } else if (status === "failed") {
    if (redemption.status !== "refunded" && redemption.status !== "failed") {
      await supabase
        .from("redemptions")
        .update({
          status: "failed",
          failure_reason: `VTPass: ${status}`,
        })
        .eq("id", redemption.id);

      // Refund points
      await supabase.rpc("admin_adjust_points", {
        p_user_id: redemption.user_id,
        p_points: redemption.points_spent,
        p_reason: `Auto-refund: VTPass transaction ${status}`,
      });
    }
  }

  return NextResponse.json({ received: true });
}
