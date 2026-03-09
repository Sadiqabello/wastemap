import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  DumpSiteMapMarker,
  DumpSiteWithProfile,
  DumpSiteType,
} from "@/types";
import type { DumpSiteRow } from "@/types/database";

const PAGE_SIZE = 20;

export async function getVerifiedDumpSites(): Promise<DumpSiteRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dump_sites")
    .select("*")
    .eq("status", "verified")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching dump sites:", error);
    return [];
  }

  return (data || []) as unknown as DumpSiteRow[];
}

export async function getUserDumpSites(userId: string): Promise<DumpSiteRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dump_sites")
    .select("*")
    .eq("added_by", userId)
    .in("status", ["pending", "rejected"] as DumpSiteRow["status"][])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user dump sites:", error);
    return [];
  }

  return (data || []) as unknown as DumpSiteRow[];
}

export async function getAllDumpSiteMarkers(): Promise<DumpSiteMapMarker[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dump_sites")
    .select("id, name, latitude, longitude, site_type, status, is_free")
    .eq("status", "verified");

  if (error) {
    console.error("Error fetching dump site markers:", error);
    return [];
  }

  return (data as unknown as DumpSiteMapMarker[]) || [];
}

export async function getDumpSiteById(
  id: string
): Promise<DumpSiteWithProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dump_sites")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching dump site:", error);
    return null;
  }

  const site = data as unknown as DumpSiteWithProfile;

  // Fetch profile separately
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", site.added_by)
    .single();

  site.profiles = profile || { full_name: "Unknown", avatar_url: null };

  return site;
}

export async function getNearbyDumpSites(
  lat: number,
  lng: number,
  radiusKm: number = 5,
  siteType?: DumpSiteType
): Promise<DumpSiteWithProfile[]> {
  const supabase = await createClient();

  // 1 degree latitude ≈ 111 km
  const latDelta = radiusKm / 111;
  // 1 degree longitude ≈ 111 km * cos(latitude)
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  let query = supabase
    .from("dump_sites")
    .select("*")
    .eq("status", "verified")
    .gte("latitude", lat - latDelta)
    .lte("latitude", lat + latDelta)
    .gte("longitude", lng - lngDelta)
    .lte("longitude", lng + lngDelta);

  if (siteType) {
    query = query.eq("site_type", siteType as DumpSiteRow["site_type"]);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching nearby dump sites:", error);
    return [];
  }

  if (!data) return [];

  // Calculate distance and sort by proximity
  const sitesWithDistance = (data as unknown as DumpSiteWithProfile[]).map(
    (site) => {
      const dLat = ((site.latitude - lat) * Math.PI) / 180;
      const dLng = ((site.longitude - lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((site.latitude * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = 6371 * c;
      return { site, distanceKm };
    }
  );

  sitesWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

  return sitesWithDistance.map((entry) => entry.site);
}

export async function searchDumpSites(
  query: string
): Promise<DumpSiteWithProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dump_sites")
    .select("*")
    .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error searching dump sites:", error);
    return [];
  }

  return (data as unknown as DumpSiteWithProfile[]) || [];
}

export async function getAllDumpSitesAdmin(
  page: number = 1,
  limit: number = PAGE_SIZE,
  search?: string,
  status?: string,
  siteType?: string
): Promise<{ sites: DumpSiteWithProfile[]; total: number }> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  let query = supabase
    .from("dump_sites")
    .select("*", { count: "exact" });

  if (status && status !== "all") {
    query = query.eq(
      "status",
      status as "pending" | "verified" | "rejected" | "closed"
    );
  }

  if (siteType && siteType !== "all") {
    query = query.eq("site_type", siteType as DumpSiteRow["site_type"]);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
  }

  query = query
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  const { data, count, error } = await query;

  if (error || !data) {
    console.error("Error fetching admin dump sites:", error);
    return { sites: [], total: 0 };
  }

  // Fetch profiles separately (added_by references auth.users, not profiles directly)
  const sites = (data || []) as unknown as DumpSiteWithProfile[];
  const userIds = sites.map((s) => s.added_by);

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    const profileMap = new Map((profiles || []).map((p: { id: string; full_name: string; avatar_url: string | null }) => [p.id, p]));
    for (const site of sites) {
      const p = profileMap.get(site.added_by);
      site.profiles = p
        ? { full_name: p.full_name, avatar_url: p.avatar_url }
        : { full_name: "Unknown", avatar_url: null };
    }
  }

  return {
    sites,
    total: count ?? 0,
  };
}
