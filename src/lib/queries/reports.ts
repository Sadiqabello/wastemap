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
