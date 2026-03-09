import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Sponsorship } from "@/types";

export async function getActiveSponsors(): Promise<Sponsorship[]> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const now = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("sponsorships")
    .select("*")
    .eq("is_active", true)
    .lte("start_date", now)
    .gte("end_date", now)
    .order("tier", { ascending: false });

  if (error) {
    console.error("Error fetching sponsors:", error);
    return [];
  }

  return data || [];
}

export async function getAllSponsorsAdmin(
  page = 1,
  limit = 20,
  search?: string,
  tier?: string,
  active?: string
) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const from = (page - 1) * limit;

  let query = supabase
    .from("sponsorships")
    .select("*", { count: "exact" });

  if (search) {
    query = query.ilike("company_name", `%${search}%`);
  }

  if (tier) {
    query = query.eq("tier", tier as "bronze" | "silver" | "gold" | "platinum");
  }

  if (active === "yes") {
    query = query.eq("is_active", true);
  } else if (active === "no") {
    query = query.eq("is_active", false);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) {
    console.error("Error fetching admin sponsors:", error);
    return { sponsors: [], total: 0 };
  }

  return { sponsors: (data || []) as Sponsorship[], total: count || 0 };
}

export async function getSponsorStats() {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const { data, error } = await supabase
    .from("sponsorships")
    .select("is_active, budget_allocated, budget_spent");

  if (error) {
    console.error("Error fetching sponsor stats:", error);
    return {
      total_sponsors: 0,
      active_sponsors: 0,
      total_budget: 0,
      budget_spent: 0,
    };
  }

  const sponsors = data || [];
  return {
    total_sponsors: sponsors.length,
    active_sponsors: sponsors.filter((s) => s.is_active).length,
    total_budget: sponsors.reduce((sum, s) => sum + (s.budget_allocated || 0), 0),
    budget_spent: sponsors.reduce((sum, s) => sum + (s.budget_spent || 0), 0),
  };
}
