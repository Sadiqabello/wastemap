import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CarbonStats } from "@/types";

export async function getCarbonStats(): Promise<CarbonStats> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const { data } = await supabase
    .from("carbon_stats")
    .select("*")
    .single();

  return data || {
    tracked_reports: 0,
    total_weight_kg: 0,
    total_co2_avoided_kg: 0,
    verified_co2_kg: 0,
    certified_co2_kg: 0,
  };
}

export async function getCarbonTracking(
  page = 1,
  limit = 20,
  verificationStatus?: string
) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const from = (page - 1) * limit;

  let query = supabase
    .from("carbon_tracking")
    .select("*, reports(title, category, address, status)", { count: "exact" });

  if (verificationStatus) {
    query = query.eq("verification_status", verificationStatus);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) {
    console.error("Error fetching carbon tracking:", error);
    return { records: [], total: 0 };
  }

  return { records: data || [], total: count || 0 };
}

export async function getRevenueStats() {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const { data } = await supabase
    .from("revenue_stats")
    .select("*")
    .single();

  return data || {
    total_revenue: 0,
    fee_revenue: 0,
    commission_revenue: 0,
    subscription_revenue: 0,
    sponsorship_revenue: 0,
    revenue_this_week: 0,
    revenue_this_month: 0,
  };
}

export async function getRevenueHistory(
  page = 1,
  limit = 20,
  source?: string
) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const from = (page - 1) * limit;

  let query = supabase
    .from("platform_revenue")
    .select("*", { count: "exact" });

  if (source) {
    query = query.eq("source", source);
  }

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  return { transactions: data || [], total: count || 0 };
}
