"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardPoints } from "@/lib/actions/points";
import { createNotification } from "@/lib/actions/notifications";

export async function joinChallenge(challengeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be signed in." };
  }

  // Check challenge exists and is active
  const { data: challenge } = await supabase
    .from("challenges")
    .select("id, start_date, end_date, is_active")
    .eq("id", challengeId)
    .single();

  if (!challenge || !challenge.is_active) {
    return { error: "Challenge not found or inactive." };
  }

  const now = new Date().toISOString().split("T")[0];
  if (now > challenge.end_date) {
    return { error: "This challenge has ended." };
  }

  // Upsert user challenge (join or re-join)
  const { error } = await supabase
    .from("user_challenges")
    .upsert(
      { user_id: user.id, challenge_id: challengeId, progress: 0 },
      { onConflict: "user_id,challenge_id" }
    );

  if (error) {
    console.error("Error joining challenge:", error);
    return { error: "Failed to join challenge." };
  }

  revalidatePath("/challenges");
  return { success: true };
}

export async function updateChallengeProgress(
  userId: string,
  actionType: string
) {
  const supabase = await createClient();

  const now = new Date().toISOString().split("T")[0];

  // Find active challenges matching this action type that the user has joined
  const { data: userChallenges } = await supabase
    .from("user_challenges")
    .select("user_id, challenge_id, progress, completed, challenges(*)")
    .eq("user_id", userId)
    .eq("completed", false);

  if (!userChallenges || userChallenges.length === 0) return;

  for (const uc of userChallenges) {
    const challenge = uc.challenges as {
      action_type: string;
      target_count: number;
      bonus_points: number;
      start_date: string;
      end_date: string;
      is_active: boolean;
    };

    if (!challenge || !challenge.is_active) continue;
    if (challenge.action_type !== actionType) continue;
    if (now < challenge.start_date || now > challenge.end_date) continue;

    const newProgress = uc.progress + 1;
    const isComplete = newProgress >= challenge.target_count;

    await supabase
      .from("user_challenges")
      .update({
        progress: newProgress,
        completed: isComplete,
        completed_at: isComplete ? new Date().toISOString() : null,
      })
      .eq("user_id", userId)
      .eq("challenge_id", uc.challenge_id);

    // Award bonus points on completion
    if (isComplete) {
      // Use the admin_adjust_points for challenge bonuses (not a standard action)
      await supabase.rpc("admin_adjust_points", {
        p_user_id: userId,
        p_points: challenge.bonus_points,
        p_reason: `Challenge completed: ${challenge.action_type}`,
      });

      // Notify the user about challenge completion
      createNotification(
        userId,
        "challenge_completed",
        "Challenge Completed!",
        "You completed the challenge and earned bonus points!",
        { challengeId: uc.challenge_id, bonusPoints: challenge.bonus_points }
      ).catch(() => {});
    }
  }
}
