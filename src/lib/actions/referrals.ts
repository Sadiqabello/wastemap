"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardPoints } from "@/lib/actions/points";

export async function generateReferralCode() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be signed in." };
  }

  const { data: code, error } = await supabase.rpc("generate_referral_code", {
    p_user_id: user.id,
  });

  if (error) {
    console.error("Error generating referral code:", error);
    return { error: "Failed to generate referral code." };
  }

  revalidatePath("/referrals");
  return { success: true, code };
}

export async function trackReferralMilestone(
  referredUserId: string,
  milestone: "first_report" | "first_event"
) {
  const supabase = await createClient();

  // Find referral record
  const { data: referral } = await supabase
    .from("referrals")
    .select("id, referrer_id, status")
    .eq("referred_id", referredUserId)
    .single();

  if (!referral) return; // User was not referred

  // Check if this milestone hasn't already been achieved
  const milestoneOrder = { signed_up: 0, first_report: 1, first_event: 2 };
  if (milestoneOrder[referral.status] >= milestoneOrder[milestone]) return;

  // Update referral status
  await supabase
    .from("referrals")
    .update({ status: milestone })
    .eq("id", referral.id);

  // Award points to referrer and referred user
  if (milestone === "first_report") {
    await awardPoints(referral.referrer_id, "referral_first_report");
    await awardPoints(referredUserId, "referred_first_report");
  } else if (milestone === "first_event") {
    await awardPoints(referral.referrer_id, "referral_first_event");
    await awardPoints(referredUserId, "referred_first_event");
  }
}
