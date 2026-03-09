import { createClient } from "@/lib/supabase/server";
import type { MapMarker, ReportWithProfile, ReportDetail } from "@/types";

export async function getAllMapMarkers(): Promise<MapMarker[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reports")
    .select("id, title, latitude, longitude, category, severity, status");

  if (error) {
    console.error("Error fetching map markers:", error);
    return [];
  }

  return data || [];
}

export async function getReportById(id: string): Promise<ReportDetail | null> {
  const supabase = await createClient();

  const { data: report, error } = await supabase
    .from("reports")
    .select(
      `
      *,
      profiles!reports_user_id_fkey (full_name, avatar_url),
      status_updates (
        *,
        profiles!status_updates_changed_by_fkey (full_name)
      )
    `
    )
    .eq("id", id)
    .order("created_at", {
      referencedTable: "status_updates",
      ascending: true,
    })
    .single();

  if (error || !report) {
    console.error("Error fetching report:", error);
    return null;
  }

  // Check if current user has upvoted
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userHasUpvoted = false;
  if (user) {
    const { data: upvote } = await supabase
      .from("upvotes")
      .select("user_id")
      .eq("report_id", id)
      .eq("user_id", user.id)
      .single();
    userHasUpvoted = !!upvote;
  }

  const typedReport = report as unknown as ReportDetail;
  typedReport.user_has_upvoted = userHasUpvoted;
  return typedReport;
}

export async function getReportsByUserId(
  userId: string
): Promise<ReportWithProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reports")
    .select("*, profiles!reports_user_id_fkey (full_name, avatar_url)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user reports:", error);
    return [];
  }

  return (data as unknown as ReportWithProfile[]) || [];
}

export async function getRecentReports(
  limit = 10
): Promise<ReportWithProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reports")
    .select("*, profiles!reports_user_id_fkey (full_name, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent reports:", error);
    return [];
  }

  return (data as unknown as ReportWithProfile[]) || [];
}

const PAGE_SIZE = 20;

export async function getPaginatedReports({
  page = 1,
  limit = PAGE_SIZE,
  userId,
  isAdmin = false,
  search,
  category,
  severity,
  status,
  dateFrom,
  dateTo,
  sortBy = "created_at",
  sortOrder = "desc",
}: {
  page?: number;
  limit?: number;
  userId?: string;
  isAdmin?: boolean;
  search?: string;
  category?: string;
  severity?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<{ reports: ReportWithProfile[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("reports")
    .select("*, profiles!reports_user_id_fkey (full_name, avatar_url)", { count: "exact" });

  // Non-admin users only see their own reports
  if (!isAdmin && userId) {
    query = query.eq("user_id", userId);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%`);
  }

  if (category && category !== "all") {
    query = query.eq("category", category as "household" | "industrial" | "hazardous" | "electronic" | "construction" | "medical" | "organic" | "other");
  }

  if (severity && severity !== "all") {
    query = query.eq("severity", severity as "low" | "medium" | "high" | "critical");
  }

  if (status && status !== "all") {
    query = query.eq("status", status as "reported" | "acknowledged" | "cleanup_scheduled" | "in_progress" | "resolved");
  }

  if (dateFrom) {
    query = query.gte("created_at", dateFrom);
  }

  if (dateTo) {
    // Add a day to include the full end date
    const endDate = new Date(dateTo);
    endDate.setDate(endDate.getDate() + 1);
    query = query.lt("created_at", endDate.toISOString());
  }

  const ascending = sortOrder === "asc";
  query = query
    .order(sortBy, { ascending })
    .range((page - 1) * limit, page * limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching paginated reports:", error);
    return { reports: [], total: 0 };
  }

  return {
    reports: (data as unknown as ReportWithProfile[]) || [],
    total: count ?? 0,
  };
}
