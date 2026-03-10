"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/actions/notifications";

/**
 * Check and award achievements for a user.
 * Called after report creation, event attendance, referral milestones, etc.
 */
export async function checkAndAwardAchievements(userId: string) {
  const adminClient = createAdminClient();

  // Get all active achievements
  const { data: achievements } = await adminClient
    .from("achievements")
    .select("*")
    .eq("is_active", true);

  if (!achievements || achievements.length === 0) return;

  // Get user's existing achievements
  const { data: earned } = await adminClient
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  const earnedIds = new Set((earned || []).map((e) => e.achievement_id));

  // Get user stats
  const { data: profile } = await adminClient
    .from("profiles")
    .select("points")
    .eq("id", userId)
    .single();

  const { count: reportCount } = await adminClient
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const { count: eventCount } = await adminClient
    .from("event_attendees")
    .select("event_id", { count: "exact", head: true })
    .eq("user_id", userId);

  const { count: referralCount } = await adminClient
    .from("referrals")
    .select("id", { count: "exact", head: true })
    .eq("referrer_id", userId);

  // Get total upvotes on user's reports
  const { data: userReports } = await adminClient
    .from("reports")
    .select("upvote_count")
    .eq("user_id", userId);

  const totalUpvotes = (userReports || []).reduce((sum, r) => sum + (r.upvote_count || 0), 0);

  // Get resolved report count for impact_maker
  const { count: resolvedCount } = await adminClient
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "resolved");

  const stats: Record<string, number> = {
    report_count: reportCount || 0,
    event_count: eventCount || 0,
    referral_count: referralCount || 0,
    upvotes_received: totalUpvotes,
    points_total: profile?.points || 0,
    first_action: (reportCount || 0) > 0 ? 1 : 0,
    streak_days: 0, // TODO: implement streak tracking
  };

  // Check for first_action type achievements
  if ((reportCount || 0) > 0) stats.first_action = 1;

  const newAchievements: string[] = [];

  for (const achievement of achievements) {
    if (earnedIds.has(achievement.id)) continue;

    const userValue = stats[achievement.criteria_type] || 0;
    if (userValue >= achievement.criteria_value) {
      newAchievements.push(achievement.id);

      // Award bonus points if any
      if (achievement.points_reward > 0) {
        await adminClient.rpc("admin_adjust_points", {
          p_user_id: userId,
          p_points: achievement.points_reward,
          p_reason: `Achievement: ${achievement.name}`,
        });
      }

      // Notify the user about the new achievement
      createNotification(
        userId,
        "achievement_unlocked",
        "Achievement Unlocked!",
        `You earned the '${achievement.name}' badge!`,
        { achievementId: achievement.id }
      ).catch(() => {});
    }
  }

  // Insert new achievements
  if (newAchievements.length > 0) {
    await adminClient.from("user_achievements").insert(
      newAchievements.map((achievementId) => ({
        user_id: userId,
        achievement_id: achievementId,
      }))
    );
  }

  return newAchievements;
}
