import { createClient } from "@/lib/supabase/server";
import type { Challenge, ChallengeWithProgress } from "@/types";

export async function getActiveChallenges(): Promise<Challenge[]> {
  const supabase = await createClient();
  const now = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("is_active", true)
    .lte("start_date", now)
    .gte("end_date", now)
    .order("end_date", { ascending: true });

  if (error) {
    console.error("Error fetching challenges:", error);
    return [];
  }

  return data || [];
}

export async function getChallengesWithProgress(
  userId: string
): Promise<ChallengeWithProgress[]> {
  const supabase = await createClient();
  const now = new Date().toISOString().split("T")[0];

  // Get active challenges
  const { data: challenges, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("is_active", true)
    .lte("start_date", now)
    .gte("end_date", now)
    .order("end_date", { ascending: true });

  if (error || !challenges) {
    console.error("Error fetching challenges:", error);
    return [];
  }

  if (challenges.length === 0) return [];

  // Get user's progress
  const challengeIds = challenges.map((c) => c.id);
  const { data: progress } = await supabase
    .from("user_challenges")
    .select("challenge_id, progress, completed")
    .eq("user_id", userId)
    .in("challenge_id", challengeIds);

  const progressMap = new Map(
    (progress || []).map((p) => [p.challenge_id, p])
  );

  return challenges.map((c) => {
    const userProgress = progressMap.get(c.id);
    return {
      ...c,
      user_progress: userProgress?.progress || 0,
      user_completed: userProgress?.completed || false,
    };
  });
}

export async function getAllChallengesAdmin(
  page = 1,
  limit = 20
): Promise<{ challenges: Challenge[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("challenges")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) {
    console.error("Error fetching admin challenges:", error);
    return { challenges: [], total: 0 };
  }

  return { challenges: data || [], total: count || 0 };
}
