import { createClient } from "@/lib/supabase/server";
import type { LeaderboardEntry } from "@/types";

export type TimePeriod = "all" | "month" | "week";

/**
 * Get the leaderboard for a given time period.
 * - "all": total profile points (fast, uses indexed column)
 * - "month"/"week": aggregated from point_transactions
 */
export async function getLeaderboard(
  limit = 20,
  period: TimePeriod = "all"
): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();

  if (period === "all") {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, points")
      .gt("points", 0)
      .order("points", { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }

    return data.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  }

  // Time-based leaderboard: aggregate from point_transactions
  const now = new Date();
  let since: string;

  if (period === "week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    since = weekAgo.toISOString();
  } else {
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    since = monthAgo.toISOString();
  }

  // Get point sums per user for the time period
  const { data: transactions, error: txError } = await supabase
    .from("point_transactions")
    .select("user_id, points")
    .gte("created_at", since);

  if (txError || !transactions) {
    console.error("Error fetching time-based leaderboard:", txError);
    return [];
  }

  // Aggregate points per user
  const userPoints = new Map<string, number>();
  for (const tx of transactions) {
    userPoints.set(tx.user_id, (userPoints.get(tx.user_id) || 0) + tx.points);
  }

  // Get the top user IDs sorted by points
  const sorted = [...userPoints.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  if (sorted.length === 0) return [];

  // Fetch profile data for these users
  const userIds = sorted.map(([id]) => id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds);

  if (!profiles) return [];

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  return sorted
    .map(([userId, points], index) => {
      const profile = profileMap.get(userId);
      if (!profile) return null;
      return {
        id: profile.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        points,
        rank: index + 1,
      };
    })
    .filter((entry): entry is LeaderboardEntry => entry !== null);
}

export async function getUserRank(
  userId: string,
  period: TimePeriod = "all"
): Promise<{ rank: number; points: number } | null> {
  const supabase = await createClient();

  if (period === "all") {
    // Get user's points
    const { data: user } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", userId)
      .single();

    if (!user) return null;

    // Count users with more points
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gt("points", user.points);

    return {
      rank: (count || 0) + 1,
      points: user.points,
    };
  }

  // Time-based rank
  const now = new Date();
  let since: string;

  if (period === "week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    since = weekAgo.toISOString();
  } else {
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    since = monthAgo.toISOString();
  }

  const { data: transactions } = await supabase
    .from("point_transactions")
    .select("user_id, points")
    .gte("created_at", since);

  if (!transactions) return null;

  // Aggregate
  const userPoints = new Map<string, number>();
  for (const tx of transactions) {
    userPoints.set(tx.user_id, (userPoints.get(tx.user_id) || 0) + tx.points);
  }

  const myPoints = userPoints.get(userId) || 0;
  let rank = 1;
  for (const [, pts] of userPoints) {
    if (pts > myPoints) rank++;
  }

  return { rank, points: myPoints };
}

/**
 * Get a user's recent point history.
 */
export async function getUserPointHistory(userId: string, limit = 20) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("point_transactions")
    .select("id, action, points, report_id, event_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching point history:", error);
    return [];
  }

  return data || [];
}

/**
 * Get user stats: report count, event count, and total points.
 */
export async function getUserStats(userId: string) {
  const supabase = await createClient();

  const [reportsResult, eventsResult, profileResult] = await Promise.all([
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("event_attendees")
      .select("event_id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("profiles")
      .select("points")
      .eq("id", userId)
      .single(),
  ]);

  return {
    reports: reportsResult.count || 0,
    events: eventsResult.count || 0,
    points: profileResult.data?.points || 0,
  };
}
