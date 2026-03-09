"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { isWithinNigeria } from "@/lib/constants";
import type { DumpSiteRow } from "@/types/database";

const VALID_SITE_TYPES = [
  "trash_can",
  "recycling_bin",
  "dumpster",
  "transfer_station",
  "landfill",
  "compost_site",
  "drop_off_center",
  "street_bin",
] as const;

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") throw new Error("Forbidden");

  // Use admin client (service role) to bypass RLS for admin operations
  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    adminClient = supabase;
  }

  return { supabase: adminClient, user };
}

export async function addDumpSite(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const name = formData.get("name") as string | null;
  const description = formData.get("description") as string | null;
  const site_type = formData.get("site_type") as string | null;
  const latitude = parseFloat(formData.get("latitude") as string);
  const longitude = parseFloat(formData.get("longitude") as string);
  const address = formData.get("address") as string | null;
  const photo_urls = formData.getAll("photo_urls") as string[];
  const operating_hours = formData.get("operating_hours") as string | null;
  const accepts = formData.getAll("accepts") as string[];
  const is_free = formData.get("is_free") === "true";

  // Validate name
  if (!name || name.trim().length < 3) {
    return { error: "Name must be at least 3 characters." };
  }

  // Validate location
  if (isNaN(latitude) || isNaN(longitude)) {
    return { error: "Invalid coordinates." };
  }

  if (!isWithinNigeria(latitude, longitude)) {
    return { error: "Location must be within Nigeria." };
  }

  // Validate site_type
  if (
    !site_type ||
    !VALID_SITE_TYPES.includes(site_type as (typeof VALID_SITE_TYPES)[number])
  ) {
    return { error: "Invalid site type." };
  }

  const { data, error } = await supabase
    .from("dump_sites")
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      site_type: site_type as DumpSiteRow["site_type"],
      latitude,
      longitude,
      address: address?.trim() || null,
      photo_urls: photo_urls.length > 0 ? photo_urls : [],
      operating_hours: operating_hours?.trim() || null,
      accepts: accepts.length > 0 ? accepts : [],
      is_free,
      added_by: user.id,
      status: "pending" as const,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dump-sites");
  revalidatePath("/");

  return { id: data.id };
}

export async function updateDumpSiteStatus(
  siteId: string,
  status: "verified" | "rejected" | "closed"
) {
  const { supabase } = await assertAdmin();

  const { error } = await supabase
    .from("dump_sites")
    .update({ status } as Record<string, unknown>)
    .eq("id", siteId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dump-sites");
  revalidatePath("/admin/dump-sites");
  revalidatePath("/");

  return {};
}
