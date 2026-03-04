import { Users, FileText, Calendar, AlertTriangle } from "lucide-react";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { UserGrowthChart } from "@/components/admin/user-growth-chart";
import { ActivityFeed } from "@/components/admin/activity-feed";
import {
  getAdminStats,
  getAdminUserGrowth,
  getRecentActivity,
} from "@/lib/queries/admin";
import { getReportTrend, getStatusCounts, getCategoryCounts } from "@/lib/queries/dashboard";
import { ReportTrendChart } from "./report-trend-chart";
import { StatusBreakdown } from "./status-breakdown";
import { CategoryBreakdown } from "./category-breakdown";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [stats, userGrowth, activity, reportTrend, statusCounts, categoryCounts] =
    await Promise.all([
      getAdminStats(),
      getAdminUserGrowth(),
      getRecentActivity(),
      getReportTrend(),
      getStatusCounts(),
      getCategoryCounts(),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of WasteMap platform activity
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          title="Total Users"
          value={stats.total_users}
          icon={Users}
          trend={`+${stats.new_users_this_week} this week`}
        />
        <AdminStatCard
          title="Total Reports"
          value={stats.total_reports}
          icon={FileText}
          trend={`+${stats.reports_this_week} this week`}
        />
        <AdminStatCard
          title="Total Events"
          value={stats.total_events}
          icon={Calendar}
        />
        <AdminStatCard
          title="Pending Reports"
          value={stats.pending_reports}
          icon={AlertTriangle}
          trend={`${stats.resolved_reports} resolved`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UserGrowthChart data={userGrowth} />
        <ReportTrendChart data={reportTrend} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StatusBreakdown data={statusCounts} />
        <CategoryBreakdown data={categoryCounts} />
      </div>

      <ActivityFeed items={activity} />
    </div>
  );
}
