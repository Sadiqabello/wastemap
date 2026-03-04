import { createClient } from "@/lib/supabase/server";
import type { DashboardStats, CategoryCount, StatusCount } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dashboard_stats")
    .select("*")
    .single();

  if (error || !data) {
    console.error("Error fetching dashboard stats:", error);
    return {
      total_reports: 0,
      pending_reports: 0,
      resolved_reports: 0,
      in_progress_reports: 0,
      reports_this_week: 0,
      reports_this_month: 0,
    };
  }

  return data as DashboardStats;
}

export async function getCategoryCounts(): Promise<CategoryCount[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reports")
    .select("category");

  if (error || !data) {
    console.error("Error fetching category counts:", error);
    return [];
  }

  const counts = data.reduce(
    (acc, report) => {
      acc[report.category] = (acc[report.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(counts).map(([category, count]) => ({
    category: category as CategoryCount["category"],
    count,
  }));
}

export async function getStatusCounts(): Promise<StatusCount[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reports")
    .select("status");

  if (error || !data) {
    console.error("Error fetching status counts:", error);
    return [];
  }

  const counts = data.reduce(
    (acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(counts).map(([status, count]) => ({
    status: status as StatusCount["status"],
    count,
  }));
}

export async function getReportTrend(): Promise<
  { date: string; count: number }[]
> {
  const supabase = await createClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from("reports")
    .select("created_at")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("Error fetching report trend:", error);
    return [];
  }

  // Group by date
  const dateMap: Record<string, number> = {};

  // Fill in all 30 days
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    dateMap[key] = 0;
  }

  data.forEach((report) => {
    const d = new Date(report.created_at);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (key in dateMap) {
      dateMap[key]++;
    }
  });

  return Object.entries(dateMap).map(([date, count]) => ({ date, count }));
}
