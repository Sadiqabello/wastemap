import { createClient } from "@/lib/supabase/server";

export interface ReferralEntry {
  id: string;
  referred_name: string;
  referred_avatar: string | null;
  status: string;
  created_at: string;
}

export async function getUserReferralCode(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", userId)
    .single();

  return data?.referral_code || null;
}

export async function getUserReferrals(
  userId: string,
  limit = 20
): Promise<ReferralEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("referrals")
    .select("id, status, created_at, referred_id")
    .eq("referrer_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("Error fetching referrals:", error);
    return [];
  }

  if (data.length === 0) return [];

  // Fetch profile info for referred users
  const referredIds = data.map((r) => r.referred_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", referredIds);

  const profileMap = new Map(
    (profiles || []).map((p) => [p.id, p])
  );

  return data.map((r) => {
    const profile = profileMap.get(r.referred_id);
    return {
      id: r.id,
      referred_name: profile?.full_name || "Unknown",
      referred_avatar: profile?.avatar_url || null,
      status: r.status,
      created_at: r.created_at,
    };
  });
}

export async function getReferralStats(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("referrals")
    .select("status")
    .eq("referrer_id", userId);

  if (error || !data) return { total: 0, active_reporters: 0, event_attendees: 0 };

  return {
    total: data.length,
    active_reporters: data.filter((r) => r.status === "first_report" || r.status === "first_event").length,
    event_attendees: data.filter((r) => r.status === "first_event").length,
  };
}
