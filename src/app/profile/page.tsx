import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getReportsByUserId } from "@/lib/queries/reports";
import { getUserRank } from "@/lib/queries/leaderboard";
import {
  getRecentPointActivity,
  getStreakAndWeeklyPoints,
} from "@/lib/queries/points";
import { getPointValues } from "@/lib/queries/settings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/reports/status-badge";
import {
  CATEGORY_LABELS,
  SEVERITY_LABELS,
  SEVERITY_COLORS,
  getTierFromPoints,
} from "@/lib/constants";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { EditNameForm } from "@/components/profile/edit-name-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { TierHero } from "@/components/motivational/tier-hero";
import { TierLadder } from "@/components/motivational/tier-ladder";
import { HowToEarn } from "@/components/motivational/how-to-earn";
import { RecentActivity } from "@/components/motivational/recent-activity";
import { StreakCard } from "@/components/motivational/streak-card";
import { TierUpCelebration } from "@/components/motivational/tier-up-celebration";
import { Plus, FileText, Mail, Calendar, Trophy, Award, Target, Users } from "lucide-react";
import type { Profile } from "@/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/profile");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  const profile = profileData as Profile | null;

  const [reports, rankData, activity, streakInfo, pointValues] = await Promise.all([
    getReportsByUserId(user.id),
    getUserRank(user.id),
    getRecentPointActivity(user.id, 8),
    getStreakAndWeeklyPoints(user.id),
    getPointValues(),
  ]);

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const points = profile?.points ?? 0;
  // Trust the DB column, but fall back to derived if tier is missing
  const tier = (profile?.tier ?? getTierFromPoints(points));
  const resolved = reports.filter((r) => r.status === "resolved").length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Fires confetti + modal when the user crosses a tier */}
      <TierUpCelebration tier={tier} />

      {/* Identity row */}
      <div className="mb-5 flex items-start gap-4">
        <AvatarUploader
          userId={user.id}
          currentUrl={profile?.avatar_url || null}
          initials={initials}
        />
        <div className="flex-1">
          <EditNameForm currentName={profile?.full_name || "User"} />
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Joined{" "}
              {new Date(user.created_at).toLocaleDateString("en-NG", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Hero card: tier + animated points + progress bar */}
      <div className="mb-4">
        <TierHero
          points={points}
          tier={tier}
          rank={rankData?.rank}
        />
      </div>

      {/* Streak + weekly points */}
      <div className="mb-4">
        <StreakCard
          streakDays={streakInfo.streakDays}
          weeklyPoints={streakInfo.weeklyPoints}
        />
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-extrabold text-stone-900">
              {reports.length}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-stone-500">
              Reports
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-extrabold text-emerald-600">
              {resolved}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-stone-500">
              Resolved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="flex items-center justify-center gap-1 text-2xl font-extrabold text-amber-600">
              <Trophy className="h-4 w-4" />
              {rankData?.rank ?? "—"}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-stone-500">
              Rank
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tier ladder */}
      <div className="mb-4">
        <TierLadder points={points} tier={tier} />
      </div>

      {/* How to earn cheat sheet */}
      <div className="mb-4">
        <HowToEarn pointValues={pointValues} />
      </div>

      {/* Recent point activity */}
      <div className="mb-4">
        <RecentActivity items={activity} />
      </div>

      {/* Quick links to gamification surfaces */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Link
          href="/achievements"
          className="flex flex-col items-center rounded-xl border border-stone-200 bg-white p-3 transition-colors hover:border-purple-300 hover:bg-purple-50"
        >
          <Award className="h-5 w-5 text-purple-600" />
          <span className="mt-1 text-xs font-semibold text-stone-700">
            Badges
          </span>
        </Link>
        <Link
          href="/challenges"
          className="flex flex-col items-center rounded-xl border border-stone-200 bg-white p-3 transition-colors hover:border-amber-300 hover:bg-amber-50"
        >
          <Target className="h-5 w-5 text-amber-600" />
          <span className="mt-1 text-xs font-semibold text-stone-700">
            Challenges
          </span>
        </Link>
        <Link
          href="/referrals"
          className="flex flex-col items-center rounded-xl border border-stone-200 bg-white p-3 transition-colors hover:border-blue-300 hover:bg-blue-50"
        >
          <Users className="h-5 w-5 text-blue-600" />
          <span className="mt-1 text-xs font-semibold text-stone-700">
            Refer
          </span>
        </Link>
      </div>

      {/* Settings */}
      <div className="mb-6">
        <ChangePasswordForm />
      </div>

      {/* Reports list */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-stone-900">Your reports</h2>
        <Link href="/reports/new">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-1 h-4 w-4" />
            New report
          </Button>
        </Link>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <FileText className="mb-3 h-12 w-12 text-stone-300" />
            <p className="text-sm text-stone-500">
              You haven&apos;t submitted any reports yet.
            </p>
            <Link href="/reports/new" className="mt-3">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                Submit your first report
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => (
            <Link key={report.id} href={`/reports/${report.id}`}>
              <Card className="transition-colors hover:bg-stone-50">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-stone-900">
                        {report.title}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={report.status} size="sm" />
                        <Badge
                          variant="outline"
                          className="text-xs px-1.5 py-0"
                          style={{
                            color: SEVERITY_COLORS[report.severity],
                            borderColor: SEVERITY_COLORS[report.severity],
                          }}
                        >
                          {SEVERITY_LABELS[report.severity]}
                        </Badge>
                        <span className="text-xs text-stone-400">
                          {report.category
                            .map((c) => CATEGORY_LABELS[c])
                            .join(", ")}
                        </span>
                      </div>
                    </div>
                    <span className="whitespace-nowrap text-xs text-stone-400">
                      {new Date(report.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
