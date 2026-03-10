import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "See the top waste reporting contributors in Nigeria ranked by green points. Compare your rank and climb the leaderboard weekly, monthly, or all-time.",
};
import { createClient } from "@/lib/supabase/server";
import { getLeaderboard, getUserRank } from "@/lib/queries/leaderboard";
import { getPointValues } from "@/lib/queries/settings";
import type { TimePeriod } from "@/lib/queries/leaderboard";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { UserRankCard } from "@/components/leaderboard/user-rank-card";
import { LeaderboardFilters } from "@/components/leaderboard/leaderboard-filters";
import { Trophy } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = (["all", "month", "week"].includes(params.period || "")
    ? params.period
    : "all") as TimePeriod;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [leaderboard, pointValues] = await Promise.all([
    getLeaderboard(20, period),
    getPointValues(),
  ]);

  let userRank: { rank: number; points: number } | null = null;
  let userName = "";
  if (user) {
    userRank = await getUserRank(user.id, period);
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    userName = profile?.full_name || "";
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h1 className="text-2xl font-bold text-stone-900">Leaderboard</h1>
          </div>
          <Suspense>
            <LeaderboardFilters />
          </Suspense>
        </div>
        <p className="mt-1 text-sm text-stone-500">
          Top community contributors ranked by green points
          {period === "week" && " this week"}
          {period === "month" && " this month"}
        </p>
      </div>

      {userRank && (
        <div className="mb-6">
          <UserRankCard
            rank={userRank.rank}
            points={userRank.points}
            name={userName}
            pointValues={pointValues}
          />
        </div>
      )}

      {leaderboard.length === 0 ? (
        <div className="rounded-lg border bg-stone-50 p-8 text-center">
          <Trophy className="mx-auto mb-3 h-12 w-12 text-stone-300" />
          <p className="text-sm text-stone-500">
            {period === "all"
              ? "No rankings yet. Start submitting reports to earn points!"
              : `No activity ${period === "week" ? "this week" : "this month"} yet. Be the first!`}
          </p>
        </div>
      ) : (
        <LeaderboardTable
          entries={leaderboard}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
}
