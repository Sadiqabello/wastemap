"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

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
    .maybeSingle();
  if (!profile || profile.role !== "admin") throw new Error("Forbidden");
}

export async function adminDeleteDumpSite(siteId: string) {
  await assertAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("dump_sites")
    .delete()
    .eq("id", siteId);

  if (error) {
    logger.error("adminDeleteDumpSite failed", { siteId, error });
    return { error: "Failed to delete dump site." };
  }

  revalidatePath("/dump-sites");
  revalidatePath("/admin/dump-sites");
  return { success: true };
}

export async function adminEditDumpSite(
  siteId: string,
  data: {
    name?: string;
    description?: string;
    site_type?: string;
    address?: string;
    operating_hours?: string;
    status?: string;
    is_free?: boolean;
  }
) {
  await assertAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("dump_sites")
    .update(data as Record<string, unknown>)
    .eq("id", siteId);

  if (error) {
    logger.error("adminEditDumpSite failed", { siteId, error });
    return { error: "Failed to update dump site." };
  }

  revalidatePath("/dump-sites");
  revalidatePath("/admin/dump-sites");
  return { success: true };
}

export async function adminVerifyCarbon(
  recordId: string,
  status: "verified" | "certified"
) {
  await assertAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("carbon_tracking")
    .update({ verification_status: status })
    .eq("id", recordId);

  if (error) {
    logger.error("adminVerifyCarbon failed", { recordId, error });
    return { error: "Failed to update carbon verification status." };
  }

  revalidatePath("/admin/carbon");
  return { success: true };
}
