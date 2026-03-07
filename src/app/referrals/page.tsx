import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserReferralCode, getUserReferrals, getReferralStats } from "@/lib/queries/referrals";
import { ReferralCodeCard } from "@/components/referrals/referral-code-card";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, FileText, CalendarDays } from "lucide-react";

export default async function ReferralsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/referrals");
  }

  const [code, referrals, stats] = await Promise.all([
    getUserReferralCode(user.id),
    getUserReferrals(user.id),
    getReferralStats(user.id),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wastemap.ng";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold text-stone-900">Referrals</h1>
        </div>
        <p className="mt-1 text-sm text-stone-500">
          Invite friends and earn points when they contribute
        </p>
      </div>

      {/* Referral Code */}
      <div className="mb-6">
        <ReferralCodeCard code={code} baseUrl={baseUrl} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="flex flex-col items-center py-4">
            <UserPlus className="h-5 w-5 text-emerald-600 mb-1" />
            <p className="text-xl font-bold text-stone-900">{stats.total}</p>
            <p className="text-[10px] text-stone-500">Total Referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-4">
            <FileText className="h-5 w-5 text-blue-600 mb-1" />
            <p className="text-xl font-bold text-stone-900">{stats.active_reporters}</p>
            <p className="text-[10px] text-stone-500">Active Reporters</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-4">
            <CalendarDays className="h-5 w-5 text-purple-600 mb-1" />
            <p className="text-xl font-bold text-stone-900">{stats.event_attendees}</p>
            <p className="text-[10px] text-stone-500">Event Attendees</p>
          </CardContent>
        </Card>
      </div>

      {/* Referred Users */}
      <div>
        <h2 className="text-lg font-semibold text-stone-900 mb-3">Referred Users</h2>
        {referrals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <Users className="mb-3 h-12 w-12 text-stone-300" />
              <p className="text-sm text-stone-500">
                No referrals yet. Share your link to start inviting friends!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {referrals.map((r) => {
              const statusColors: Record<string, string> = {
                signed_up: "bg-stone-50 text-stone-600",
                first_report: "bg-blue-50 text-blue-600",
                first_event: "bg-emerald-50 text-emerald-600",
              };
              const statusLabels: Record<string, string> = {
                signed_up: "Signed Up",
                first_report: "First Report",
                first_event: "Event Attended",
              };
              const initials = r.referred_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <Card key={r.id}>
                  <CardContent className="flex items-center justify-between py-3 pt-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-stone-900">
                          {r.referred_name}
                        </p>
                        <p className="text-xs text-stone-400">
                          {new Date(r.created_at).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${statusColors[r.status] || ""}`}>
                      {statusLabels[r.status] || r.status}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
