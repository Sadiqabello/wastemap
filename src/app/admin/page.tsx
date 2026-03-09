import Link from "next/link";
import {
  Users,
  FileText,
  Calendar,
  AlertTriangle,
  Truck,
  Handshake,
  DollarSign,
  Gift,
  Plus,
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
  getAdminOverviewExtras,
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminOverviewPage() {
  const [stats, extras, userGrowth, activity, reportTrend, statusCounts, categoryCounts] =
    await Promise.all([
      getAdminStats(),
      getAdminOverviewExtras(),
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
        description={`Overview of WasteMapNaija platform activity -- ${today}`}
      />

      {/* Primary stat cards */}
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

      {/* Secondary stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/collectors?status=verified" className="block transition-transform hover:scale-[1.02]">
          <AdminStatCard
            title="Active Collectors"
            value={extras.active_collectors}
            icon={Truck}
          />
        </Link>
        <Link href="/admin/sponsorships?active=yes" className="block transition-transform hover:scale-[1.02]">
          <AdminStatCard
            title="Active Sponsors"
            value={extras.active_sponsors}
            icon={Handshake}
          />
        </Link>
        <Link href="/admin/revenue" className="block transition-transform hover:scale-[1.02]">
          <AdminStatCard
            title="Total Revenue"
            value={formatCurrency(extras.total_revenue)}
            icon={DollarSign}
          />
        </Link>
        <Link href="/admin/rewards?tab=redemptions&status=pending" className="block transition-transform hover:scale-[1.02]">
          <AdminStatCard
            title="Pending Redemptions"
            value={extras.pending_redemptions}
            icon={Gift}
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
              <Link href="/admin/rewards?action=create">
                <Plus className="mr-1.5 h-4 w-4" />
                Create Reward
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/sponsorships?action=create">
                <Plus className="mr-1.5 h-4 w-4" />
                Create Sponsor
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/collectors?status=pending">
                <Eye className="mr-1.5 h-4 w-4" />
                View Pending Collectors
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/rewards?tab=redemptions&status=pending">
                <Eye className="mr-1.5 h-4 w-4" />
                View Pending Redemptions
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/reports?status=reported">
                <Eye className="mr-1.5 h-4 w-4" />
                View Pending Reports
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
