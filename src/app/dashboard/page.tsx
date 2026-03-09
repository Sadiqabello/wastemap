import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { StatusBreakdown } from "@/components/dashboard/status-breakdown";
import { RecentReports } from "@/components/dashboard/recent-reports";
import { ResolutionRate } from "@/components/dashboard/resolution-rate";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { TopReporters } from "@/components/dashboard/top-reporters";
import { EventCard } from "@/components/events/event-card";
import {
  getDashboardStats,
  getCategoryCounts,
  getStatusCounts,
  getReportTrend,
} from "@/lib/queries/dashboard";
import { getRecentReports, getReportsByUserId } from "@/lib/queries/reports";
import { getLeaderboard } from "@/lib/queries/leaderboard";
import { getUpcomingEvents } from "@/lib/queries/events";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  const [stats, categoryCounts, statusCounts, trend, topReporters, upcomingEvents] =
    await Promise.all([
      getDashboardStats(),
      getCategoryCounts(),
      getStatusCounts(),
      getReportTrend(),
      getLeaderboard(5),
      getUpcomingEvents(3),
    ]);

  let recentReports: import("@/types").ReportWithProfile[] = [];
  if (user) {
    if (isAdmin) {
      recentReports = await getRecentReports(5);
    } else {
      const allUserReports = await getReportsByUserId(user.id);
      recentReports = allUserReports.slice(0, 5);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
        <p className="mt-1 text-sm text-stone-500">
          Overview of waste reports and community impact
        </p>
      </div>

      <div className="space-y-6">
        <StatsGrid stats={stats} />

        <div className="grid gap-6 lg:grid-cols-2">
          <ResolutionRate
            resolved={stats.resolved_reports}
            total={stats.total_reports}
          />
          <TopReporters reporters={topReporters} />
        </div>

        <TrendChart data={trend} />

        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryChart data={categoryCounts} />
          <StatusBreakdown data={statusCounts} />
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-900">
                <CalendarDays className="h-5 w-5 text-emerald-500" />
                Upcoming Cleanup Events
              </h2>
              <Link
                href="/events"
                className="text-sm text-emerald-600 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        <RecentReports reports={recentReports} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
