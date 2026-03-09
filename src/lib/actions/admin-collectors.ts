"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
  return { supabase, user };
}

/**
 * Verify, reject, or suspend a collector with an optional review note.
 */
export async function updateCollectorStatus(
  collectorId: string,
  status: "verified" | "suspended" | "pending" | "rejected",
  reviewNote?: string
) {
  await assertAdmin();
  const adminClient = createAdminClient();

  const now = new Date().toISOString();

  const { error } = await adminClient
    .from("collector_profiles")
    .update({
      status,
      review_note: reviewNote || null,
      reviewed_at: now,
      updated_at: now,
    })
    .eq("id", collectorId);

  if (error) {
    console.error("Error updating collector:", error);
    return { error: "Failed to update collector status." };
  }

  revalidatePath("/admin/collectors");
  revalidatePath(`/admin/collectors/${collectorId}`);
  revalidatePath("/collectors/dashboard");
  return { success: true };
}

/**
 * Create a sponsorship.
 */
export async function createSponsorship(formData: FormData) {
  await assertAdmin();
  const adminClient = createAdminClient();

  const tier = ((formData.get("tier") as string) || "bronze") as "bronze" | "silver" | "gold" | "platinum";

  const { error } = await adminClient.from("sponsorships").insert({
    company_name: formData.get("company_name") as string,
    contact_name: (formData.get("contact_name") as string) || null,
    contact_email: (formData.get("contact_email") as string) || null,
    contact_phone: (formData.get("contact_phone") as string) || null,
    tier,
    logo_url: (formData.get("logo_url") as string) || null,
    website_url: (formData.get("website_url") as string) || null,
    description: (formData.get("description") as string) || null,
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    budget_allocated: Number(formData.get("budget_allocated") || 0),
  });

  if (error) {
    console.error("Error creating sponsorship:", error);
    return { error: "Failed to create sponsorship." };
  }

  revalidatePath("/admin/sponsorships");
  return { success: true };
}

/**
 * Toggle sponsorship active state.
 */
export async function toggleSponsorship(sponsorshipId: string, isActive: boolean) {
  await assertAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("sponsorships")
    .update({ is_active: isActive })
    .eq("id", sponsorshipId);

  if (error) {
    console.error("Error toggling sponsorship:", error);
    return { error: "Failed to update sponsorship." };
  }

  revalidatePath("/admin/sponsorships");
  return { success: true };
}

/**
 * Link a sponsor to a reward or challenge.
 */
export async function linkSponsorReward(
  sponsorshipId: string,
  rewardId: string | null,
  challengeId: string | null,
  budgetAllocated: number
) {
  await assertAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient.from("sponsored_rewards").insert({
    sponsorship_id: sponsorshipId,
    reward_id: rewardId,
    challenge_id: challengeId,
    budget_allocated: budgetAllocated,
  });

  if (error) {
    console.error("Error linking sponsor reward:", error);
    return { error: "Failed to link sponsor to reward." };
  }

  revalidatePath("/admin/sponsorships");
  return { success: true };
}

/**
 * Delete a collector profile.
 */
export async function deleteCollector(collectorId: string) {
  await assertAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("collector_profiles")
    .delete()
    .eq("id", collectorId);

  if (error) {
    console.error("Error deleting collector:", error);
    return { error: "Failed to delete collector." };
  }

  revalidatePath("/admin/collectors");
  return { success: true };
}

/**
 * Edit sponsorship fields.
 */
export async function editSponsorship(
  sponsorshipId: string,
  data: {
    company_name?: string;
    contact_name?: string;
    contact_email?: string;
    tier?: "bronze" | "silver" | "gold" | "platinum";
    start_date?: string;
    end_date?: string;
    budget_allocated?: number;
    is_active?: boolean;
    logo_url?: string;
  }
) {
  await assertAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("sponsorships")
    .update(data as Record<string, unknown>)
    .eq("id", sponsorshipId);

  if (error) {
    console.error("Error editing sponsorship:", error);
    return { error: "Failed to update sponsorship." };
  }

  revalidatePath("/admin/sponsorships");
  return { success: true };
}

/**
 * Delete a sponsorship.
 */
export async function deleteSponsorship(sponsorshipId: string) {
  await assertAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("sponsorships")
    .delete()
    .eq("id", sponsorshipId);

  if (error) {
    console.error("Error deleting sponsorship:", error);
    return { error: "Failed to delete sponsorship." };
  }

  revalidatePath("/admin/sponsorships");
  return { success: true };
}

/**
 * Delete a dump site.
 */
export async function adminDeleteDumpSite(siteId: string) {
  await assertAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("dump_sites")
    .delete()
    .eq("id", siteId);

  if (error) {
    console.error("Error deleting dump site:", error);
    return { error: "Failed to delete dump site." };
  }

  revalidatePath("/dump-sites");
  revalidatePath("/admin/dump-sites");
  return { success: true };
}

/**
 * Edit dump site fields.
 */
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
    console.error("Error editing dump site:", error);
    return { error: "Failed to update dump site." };
  }

  revalidatePath("/dump-sites");
  revalidatePath("/admin/dump-sites");
  return { success: true };
}

/**
 * Verify or certify a carbon tracking record.
 */
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
    console.error("Error verifying carbon record:", error);
    return { error: "Failed to update carbon verification status." };
  }

  revalidatePath("/admin/carbon");
  return { success: true };
}
