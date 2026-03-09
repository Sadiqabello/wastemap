import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AchievementWithEarned } from "@/types";

export async function getAchievementsWithProgress(
  userId: string
): Promise<AchievementWithEarned[]> {
  const supabase = await createClient();

  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (!achievements) return [];

  const { data: earned } = await supabase
    .from("user_achievements")
    .select("achievement_id, earned_at")
    .eq("user_id", userId);

  const earnedMap = new Map(
    (earned || []).map((e) => [e.achievement_id, e.earned_at])
  );

  return achievements.map((a) => ({
    ...a,
    earned: earnedMap.has(a.id),
    earned_at: earnedMap.get(a.id) || null,
  }));
}

export async function getAllAchievements() {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const { data } = await supabase
    .from("achievements")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return data || [];
}

export async function getUserAchievementCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("user_achievements")
    .select("achievement_id", { count: "exact", head: true })
    .eq("user_id", userId);

  return count || 0;
}
