import Link from "next/link";
import {
  Users,
  FileText,
  Calendar,
  AlertTriangle,
  Trash2,
  Eye,
  ArrowRight,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { UserGrowthChart } from "@/components/admin/user-growth-chart";
import { ActivityFeed } from "@/components/admin/activity-feed";
import {
  getAdminStats,
  getAdminUserGrowth,
  getRecentActivity,
} from "@/lib/queries/admin";
import {
  getReportTrend,
  getStatusCounts,
  getCategoryCounts,
} from "@/lib/queries/dashboard";
import { ReportTrendChart } from "./report-trend-chart";
import { StatusBreakdown } from "./status-breakdown";
import { CategoryBreakdown } from "./category-breakdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Admin Dashboard"
        description={`Overview of WasteMapNaija platform activity — ${today}`}
      />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/users" className="block transition-transform hover:scale-[1.02]">
          <AdminStatCard
            title="Total Users"
            value={stats.total_users}
            icon={Users}
            trend={`+${stats.new_users_this_week} this week`}
          />
        </Link>
        <Link href="/admin/reports" className="block transition-transform hover:scale-[1.02]">
          <AdminStatCard
            title="Total Reports"
            value={stats.total_reports}
            icon={FileText}
            trend={`+${stats.reports_this_week} this week`}
          />
        </Link>
        <Link href="/admin/events" className="block transition-transform hover:scale-[1.02]">
          <AdminStatCard
            title="Total Events"
            value={stats.total_events}
            icon={Calendar}
          />
        </Link>
        <Link href="/admin/reports?status=reported" className="block transition-transform hover:scale-[1.02]">
          <AdminStatCard
            title="Pending Reports"
            value={stats.pending_reports}
            icon={AlertTriangle}
            trend={`${stats.resolved_reports} resolved`}
          />
        </Link>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UserGrowthChart data={userGrowth} />
        <ReportTrendChart data={reportTrend} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StatusBreakdown data={statusCounts} />
        <CategoryBreakdown data={categoryCounts} />
      </div>

      {/* Activity feed */}
      <ActivityFeed items={activity} />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/reports?status=reported">
                <Eye className="mr-1.5 h-4 w-4" />
                View Pending Reports
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/dump-sites?status=pending">
                <Trash2 className="mr-1.5 h-4 w-4" />
                Review Dump Sites
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/users">
                <ArrowRight className="mr-1.5 h-4 w-4" />
                Manage Users
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/settings">
                <ArrowRight className="mr-1.5 h-4 w-4" />
                Platform Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
