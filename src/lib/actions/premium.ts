"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PREMIUM_PLANS } from "@/lib/constants";

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
 * Subscribe to premium using points.
 */
export async function subscribePremium(plan: keyof typeof PREMIUM_PLANS) {
  const user = await getAuthUser();
  if (!user) return { error: "You must be signed in." };

  const planConfig = PREMIUM_PLANS[plan];
  if (!planConfig) return { error: "Invalid plan." };

  const adminClient = createAdminClient();

  // Check if already subscribed
  const { data: existing } = await adminClient
    .from("premium_subscriptions")
    .select("id, status, expires_at")
    .eq("user_id", user.id)
    .single();

  if (existing && existing.status === "active" && new Date(existing.expires_at) > new Date()) {
    return { error: "You already have an active subscription." };
  }

  // Check points balance
  const { data: profile } = await adminClient
    .from("profiles")
    .select("points")
    .eq("id", user.id)
    .single();

  if (!profile || profile.points < planConfig.price) {
    return { error: `Not enough points. Need ${planConfig.price} pts for ${planConfig.label} plan.` };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + planConfig.durationDays);

  // Create or update subscription
  if (existing) {
    await adminClient
      .from("premium_subscriptions")
      .update({
        plan,
        amount_naira: planConfig.price,
        status: "active",
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        cancelled_at: null,
      })
      .eq("id", existing.id);
  } else {
    await adminClient.from("premium_subscriptions").insert({
      user_id: user.id,
      plan,
      amount_naira: planConfig.price,
      status: "active",
      expires_at: expiresAt.toISOString(),
    });
  }

  // Deduct points
  await adminClient
    .from("profiles")
    .update({
      points: profile.points - planConfig.price,
      is_premium: true,
    })
    .eq("id", user.id);

  await adminClient.from("point_transactions").insert({
    user_id: user.id,
    action: `Premium subscription: ${planConfig.label}`,
    points: -planConfig.price,
  });

  // Record revenue
  await adminClient.from("platform_revenue").insert({
    source: "subscription",
    amount_naira: planConfig.price,
    reference_type: "subscription",
    description: `Premium ${planConfig.label} plan`,
  });

  revalidatePath("/profile");
  revalidatePath("/rewards");
  return { success: true, expiresAt: expiresAt.toISOString() };
}

/**
 * Cancel premium subscription.
 */
export async function cancelPremium() {
  const user = await getAuthUser();
  if (!user) return { error: "You must be signed in." };

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("premium_subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("status", "active");

  if (error) {
    console.error("Error cancelling subscription:", error);
    return { error: "Failed to cancel subscription." };
  }

  await adminClient
    .from("profiles")
    .update({ is_premium: false })
    .eq("id", user.id);

  revalidatePath("/profile");
  return { success: true };
}
