import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Reward, RedemptionWithReward } from "@/types";

export async function getAvailableRewards(category?: string): Promise<Reward[]> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  let query = supabase
    .from("rewards")
    .select("*")
    .eq("is_active", true)
    .order("point_cost", { ascending: true });

  if (category && category !== "all") {
    query = query.eq("category", category as Reward["category"]);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching rewards:", error);
    return [];
  }

  return data || [];
}

export async function getRewardById(id: string): Promise<Reward | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching reward:", error);
    return null;
  }

  return data;
}

export async function getUserRedemptions(
  userId: string,
  limit = 20
): Promise<RedemptionWithReward[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("redemptions")
    .select("*, rewards(name, category, image_url)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching redemptions:", error);
    return [];
  }

  return (data || []) as RedemptionWithReward[];
}

export async function getRedemptionById(
  redemptionId: string,
  userId: string
): Promise<RedemptionWithReward | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("redemptions")
    .select("*, rewards(name, category, image_url)")
    .eq("id", redemptionId)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching redemption:", error);
    return null;
  }

  return data as RedemptionWithReward;
}

export async function getAllRewardsAdmin(
  page = 1,
  limit = 20,
  search?: string,
  category?: string
): Promise<{ rewards: Reward[]; total: number }> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }
  const from = (page - 1) * limit;

  let query = supabase
    .from("rewards")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (category && category !== "all") {
    query = query.eq("category", category as Reward["category"]);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching admin rewards:", error);
    return { rewards: [], total: 0 };
  }

  return { rewards: data || [], total: count || 0 };
}

export async function getAllRedemptionsAdmin(
  page = 1,
  limit = 20,
  statusFilter?: string
): Promise<{ redemptions: (RedemptionWithReward & { profiles: { full_name: string } })[]; total: number }> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }
  const from = (page - 1) * limit;

  let query = supabase
    .from("redemptions")
    .select("*, rewards(name, category, image_url), profiles(full_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter as RedemptionWithReward["status"]);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching admin redemptions:", error);
    return { redemptions: [], total: 0 };
  }

  return { redemptions: (data || []) as never[], total: count || 0 };
}
