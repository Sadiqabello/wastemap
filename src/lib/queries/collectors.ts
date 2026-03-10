import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CollectorWithProfile, BidWithCollector, BidWithReport, CollectorStats } from "@/types";
import type { PickupBidRow } from "@/types/database";

export async function getVerifiedCollectors(): Promise<CollectorWithProfile[]> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const { data, error } = await supabase
    .from("collector_profiles")
    .select("*")
    .eq("status", "verified")
    .eq("is_available", true)
    .order("rating", { ascending: false });

  if (error) {
    console.error("Error fetching collectors:", error);
    return [];
  }

  return (data || []) as unknown as CollectorWithProfile[];
}

export async function getCollectorById(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collector_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return data as unknown as CollectorWithProfile;
}

export async function getBidsForReport(reportId: string): Promise<BidWithCollector[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pickup_bids")
    .select("*")
    .eq("report_id", reportId)
    .order("bid_amount", { ascending: true });

  if (error) {
    console.error("Error fetching bids:", error);
    return [];
  }

  return (data || []) as unknown as BidWithCollector[];
}

export async function getCollectorBids(collectorId: string): Promise<BidWithReport[]> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const { data, error } = await supabase
    .from("pickup_bids")
    .select("*")
    .eq("collector_id", collectorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching collector bids:", error);
    return [];
  }

  const typedBids = (data || []) as unknown as BidWithReport[];

  // Fetch associated reports separately (FK joins not available for new tables)
  const reportIds = typedBids.map((b) => b.report_id);
  if (reportIds.length > 0) {
    const { data: reports } = await supabase
      .from("reports")
      .select("id, title, category, severity, address")
      .in("id", reportIds);

    const reportMap = new Map((reports || []).map((r) => [r.id, r]));
    for (const bid of typedBids) {
      const r = reportMap.get(bid.report_id);
      bid.reports = r
        ? { title: r.title, category: r.category, severity: r.severity, address: r.address }
        : { title: "Unknown", category: ["other"], severity: "low", address: null };
    }
  }

  return typedBids;
}

export async function getAllCollectorsAdmin(
  page = 1,
  limit = 20,
  search?: string,
  status?: string
) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const from = (page - 1) * limit;

  let query = supabase
    .from("collector_profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("business_name", `%${search}%`);
  }

  if (status) {
    query = query.eq("status", status as "pending" | "verified" | "suspended" | "rejected");
  }

  const { data, error, count } = await query.range(from, from + limit - 1);

  if (error) {
    console.error("Error fetching admin collectors:", error);
    return { collectors: [], total: 0 };
  }

  // Fetch user profiles for each collector
  const collectors = (data || []) as unknown as CollectorWithProfile[];
  const userIds = collectors.map((c) => c.user_id);

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
    for (const c of collectors) {
      const p = profileMap.get(c.user_id);
      c.profiles = p
        ? { full_name: p.full_name, avatar_url: p.avatar_url }
        : { full_name: "Unknown", avatar_url: null };
    }
  }

  return { collectors, total: count || 0 };
}

export async function getCollectorByIdAdmin(collectorId: string) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const { data, error } = await supabase
    .from("collector_profiles")
    .select("*")
    .eq("id", collectorId)
    .single();

  if (error || !data) return null;

  const collector = data as unknown as CollectorWithProfile;

  // Fetch associated user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", collector.user_id)
    .single();

  return {
    ...collector,
    profiles: profile || { full_name: "Unknown", avatar_url: null },
  } as CollectorWithProfile;
}

export async function getCollectorStats(): Promise<CollectorStats> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const { data } = await supabase
    .from("collector_stats")
    .select("*")
    .single();

  return data || {
    active_collectors: 0,
    pending_collectors: 0,
    total_pickups: 0,
    total_collector_earnings: 0,
  };
}

export async function getReportsOpenForPickup(
  pickupType?: "cleanup" | "recycling"
) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  let query = supabase
    .from("reports")
    .select("*")
    .not("pickup_type", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (pickupType) {
    query = query.eq("pickup_type", pickupType);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching open pickup reports:", error);
    return [];
  }

  return data || [];
}

export async function getBidCountsForReports(reportIds: string[]) {
  if (reportIds.length === 0) return new Map<string, number>();

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const { data } = await supabase
    .from("pickup_bids")
    .select("report_id")
    .in("report_id", reportIds)
    .in("status", ["pending", "accepted"]);

  const counts = new Map<string, number>();
  (data || []).forEach((row) => {
    counts.set(row.report_id, (counts.get(row.report_id) || 0) + 1);
  });
  return counts;
}

export async function getUserPickups(userId: string) {
  const supabase = await createClient();

  // 1. Get all reports by this user that have pickup_type set
  const { data: reports, error: reportsError } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .not("pickup_type", "is", null)
    .order("created_at", { ascending: false });

  if (reportsError || !reports || reports.length === 0) {
    return [];
  }

  const reportIds = reports.map((r) => r.id);

  // 2. Get all bids for those reports
  const { data: bids } = await supabase
    .from("pickup_bids")
    .select("*")
    .in("report_id", reportIds)
    .order("created_at", { ascending: false });

  const typedBids = (bids || []) as unknown as PickupBidRow[];

  // 3. Get collector business names for the bids
  const collectorIds = [...new Set(typedBids.map((b) => b.collector_id))];
  const collectorMap = new Map<string, string>();

  if (collectorIds.length > 0) {
    const { data: collectors } = await supabase
      .from("collector_profiles")
      .select("user_id, business_name")
      .in("user_id", collectorIds);

    (collectors || []).forEach((c) => {
      collectorMap.set(c.user_id, c.business_name);
    });
  }

  // 4. Check which bids have been reviewed by this user
  const bidIds = typedBids.filter((b) => b.status === "completed").map((b) => b.id);
  const reviewedBidIds = new Set<string>();

  if (bidIds.length > 0) {
    const { data: reviews } = await supabase
      .from("collector_reviews")
      .select("bid_id")
      .eq("reviewer_id", userId)
      .in("bid_id", bidIds);

    (reviews || []).forEach((r) => {
      reviewedBidIds.add(r.bid_id);
    });
  }

  // 5. Enrich bids with collector names
  const enrichedBids = typedBids.map((bid) => ({
    ...bid,
    collector_name: collectorMap.get(bid.collector_id) || "Unknown Collector",
    has_review: reviewedBidIds.has(bid.id),
  }));

  // 6. Group bids by report
  const bidsByReport = new Map<string, typeof enrichedBids>();
  for (const bid of enrichedBids) {
    const existing = bidsByReport.get(bid.report_id) || [];
    existing.push(bid);
    bidsByReport.set(bid.report_id, existing);
  }

  // 7. Return reports with their bids
  return reports.map((report) => ({
    ...report,
    bids: bidsByReport.get(report.id) || [],
    hasAcceptedBid: (bidsByReport.get(report.id) || []).some(
      (b) => b.status === "accepted" || b.status === "completed"
    ),
  }));
}

export async function getCollectorReviews(collectorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collector_reviews")
    .select("*")
    .eq("collector_id", collectorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }

  return data || [];
}
