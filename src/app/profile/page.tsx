import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getReportsByUserId } from "@/lib/queries/reports";
import { getUserRank } from "@/lib/queries/leaderboard";
import { getUserRedemptions } from "@/lib/queries/rewards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/reports/status-badge";
import { CATEGORY_LABELS, SEVERITY_LABELS, SEVERITY_COLORS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { EditNameForm } from "@/components/profile/edit-name-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { TierProgress } from "@/components/tier/tier-progress";
import { TierBadge } from "@/components/tier/tier-badge";
import { RedemptionHistory } from "@/components/rewards/redemption-history";
import { Plus, FileText, Star, Trophy, Mail, Shield, Calendar, Gift, Users, Award, Truck, Crown } from "lucide-react";
import type { Profile } from "@/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/profile");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;
  const [reports, rankData, redemptions] = await Promise.all([
    getReportsByUserId(user.id),
    getUserRank(user.id),
    getUserRedemptions(user.id, 5),
  ]);

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const resolved = reports.filter((r) => r.status === "resolved").length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <AvatarUploader
              userId={user.id}
              currentUrl={profile?.avatar_url || null}
              initials={initials}
            />
            <div className="flex-1 text-center sm:text-left">
              <EditNameForm currentName={profile?.full_name || "User"} />
              <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-stone-500 sm:justify-start">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1 capitalize">
                  <Shield className="h-3.5 w-3.5" />
                  {profile?.role || "reporter"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined{" "}
                  {new Date(user.created_at).toLocaleDateString("en-NG", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Stats row */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <div className="rounded-lg bg-stone-50 px-3 py-1.5 text-center">
                  <p className="text-lg font-bold text-stone-900">
                    {reports.length}
                  </p>
                  <p className="text-[10px] text-stone-500">Reports</p>
                </div>
                <div className="rounded-lg bg-stone-50 px-3 py-1.5 text-center">
                  <p className="text-lg font-bold text-stone-900">{resolved}</p>
                  <p className="text-[10px] text-stone-500">Resolved</p>
                </div>
                {profile && (
                  <div className="rounded-lg bg-emerald-50 px-3 py-1.5 text-center">
                    <p className="flex items-center gap-0.5 text-lg font-bold text-emerald-700">
                      <Star className="h-3.5 w-3.5" />
                      {profile.points}
                    </p>
                    <p className="text-[10px] text-emerald-600">Points</p>
                  </div>
                )}
                {rankData && (
                  <div className="rounded-lg bg-amber-50 px-3 py-1.5 text-center">
                    <p className="flex items-center gap-0.5 text-lg font-bold text-amber-700">
                      <Trophy className="h-3.5 w-3.5" />
                      #{rankData.rank}
                    </p>
                    <p className="text-[10px] text-amber-600">Rank</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier Progress */}
      {profile && (
        <Card className="mb-6">
          <CardContent className="pt-4 pb-4">
            <TierProgress tier={profile.tier} points={profile.points} />
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link href="/rewards">
          <Card className="transition-colors hover:bg-emerald-50">
            <CardContent className="flex flex-col items-center py-4">
              <Gift className="h-5 w-5 text-emerald-600 mb-1" />
              <p className="text-xs font-medium text-stone-700">Rewards</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/referrals">
          <Card className="transition-colors hover:bg-blue-50">
            <CardContent className="flex flex-col items-center py-4">
              <Users className="h-5 w-5 text-blue-600 mb-1" />
              <p className="text-xs font-medium text-stone-700">Referrals</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/challenges">
          <Card className="transition-colors hover:bg-amber-50">
            <CardContent className="flex flex-col items-center py-4">
              <Trophy className="h-5 w-5 text-amber-600 mb-1" />
              <p className="text-xs font-medium text-stone-700">Challenges</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/achievements">
          <Card className="transition-colors hover:bg-purple-50">
            <CardContent className="flex flex-col items-center py-4">
              <Award className="h-5 w-5 text-purple-600 mb-1" />
              <p className="text-xs font-medium text-stone-700">Badges</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/collectors">
          <Card className="transition-colors hover:bg-stone-50">
            <CardContent className="flex flex-col items-center py-4">
              <Truck className="h-5 w-5 text-stone-600 mb-1" />
              <p className="text-xs font-medium text-stone-700">Collectors</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/premium">
          <Card className="transition-colors hover:bg-yellow-50">
            <CardContent className="flex flex-col items-center py-4">
              <Crown className="h-5 w-5 text-yellow-600 mb-1" />
              <p className="text-xs font-medium text-stone-700">Premium</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Redemptions */}
      {redemptions.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-stone-900">Recent Redemptions</h2>
            <Link href="/rewards" className="text-xs text-emerald-600 hover:underline">
              View all
            </Link>
          </div>
          <RedemptionHistory redemptions={redemptions} />
        </div>
      )}

      {/* Settings Section */}
      <div className="mb-6">
        <ChangePasswordForm />
      </div>

      {/* Reports Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-900">Your Reports</h2>
        <Link href="/reports/new">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-1 h-4 w-4" />
            New Report
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
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Submit your first report
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
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
                          {CATEGORY_LABELS[report.category]}
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
