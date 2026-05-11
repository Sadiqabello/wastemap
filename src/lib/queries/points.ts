import { createClient } from "@/lib/supabase/server";

export interface PointActivity {
  id: string;
  action: string;
  points: number;
  created_at: string;
}

export async function getRecentPointActivity(
  userId: string,
  limit = 10
): Promise<PointActivity[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("point_transactions")
    .select("id, action, points, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as PointActivity[]) || [];
}

/**
 * Returns the user's current daily streak (consecutive days back from today,
 * counting only days that had at least one positive point-earning event) and
 * their total points earned in the last 7 days.
 */
export async function getStreakAndWeeklyPoints(
  userId: string
): Promise<{ streakDays: number; weeklyPoints: number }> {
  const supabase = await createClient();

  // Fetch the last 30 days of positive transactions — enough to derive both
  // the streak and the weekly total in one round-trip.
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data } = await supabase
    .from("point_transactions")
    .select("points, created_at")
    .eq("user_id", userId)
    .gt("points", 0)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false });

  if (!data || data.length === 0) {
    return { streakDays: 0, weeklyPoints: 0 };
  }

  // Distinct calendar days (UTC) with activity.
  const activeDays = new Set<string>();
  let weeklyPoints = 0;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  for (const row of data) {
    const d = new Date(row.created_at);
    activeDays.add(d.toISOString().slice(0, 10));
    if (d >= sevenDaysAgo) weeklyPoints += row.points;
  }

  // Walk backwards from today; first miss breaks the streak.
  let streakDays = 0;
  const cursor = new Date();
  while (streakDays < 30) {
    const key = cursor.toISOString().slice(0, 10);
    if (activeDays.has(key)) {
      streakDays += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      // Allow today to be empty (e.g., it's early morning) and still count the
      // streak from yesterday. After today, any miss breaks the streak.
      if (streakDays === 0) {
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      break;
    }
  }

  return { streakDays, weeklyPoints };
}
