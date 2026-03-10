"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CO2_FACTORS } from "@/lib/constants";

async function assertAuthorityOrAdmin() {
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

  if (!profile || !["admin", "authority"].includes(profile.role)) {
    throw new Error("Forbidden");
  }

  return { supabase, user };
}

/**
 * Add carbon tracking data when a report is resolved.
 */
export async function trackCarbon(
  reportId: string,
  estimatedWeightKg: number,
  notes?: string
) {
  const { user } = await assertAuthorityOrAdmin();
  const adminClient = createAdminClient();

  // Get report to determine waste type
  const { data: report } = await adminClient
    .from("reports")
    .select("category")
    .eq("id", reportId)
    .single();

  if (!report) return { error: "Report not found." };

  // Use the first category for CO2 calculation (primary waste type)
  const primaryCategory = report.category[0];
  const co2Factor = CO2_FACTORS[primaryCategory] || 1.0;
  const co2Avoided = Math.round(estimatedWeightKg * co2Factor * 100) / 100;

  const { error } = await adminClient.from("carbon_tracking").upsert(
    {
      report_id: reportId,
      estimated_weight_kg: estimatedWeightKg,
      waste_type: primaryCategory,
      co2_avoided_kg: co2Avoided,
      verification_status: "estimated",
    },
    { onConflict: "report_id" }
  );

  if (error) {
    console.error("Error tracking carbon:", error);
    return { error: "Failed to save carbon data." };
  }

  revalidatePath(`/reports/${reportId}`);
  revalidatePath("/admin/carbon");
  return { success: true, co2Avoided };
}

/**
 * Verify carbon tracking data (admin/authority action).
 */
export async function verifyCarbonData(
  reportId: string,
  verifiedWeightKg: number,
  status: "verified" | "certified"
) {
  const { user } = await assertAuthorityOrAdmin();
  const adminClient = createAdminClient();

  const { data: existing } = await adminClient
    .from("carbon_tracking")
    .select("waste_type")
    .eq("report_id", reportId)
    .single();

  if (!existing) return { error: "No carbon data to verify." };

  const co2Factor = CO2_FACTORS[existing.waste_type] || 1.0;
  const co2Avoided = Math.round(verifiedWeightKg * co2Factor * 100) / 100;

  const { error } = await adminClient
    .from("carbon_tracking")
    .update({
      estimated_weight_kg: verifiedWeightKg,
      co2_avoided_kg: co2Avoided,
      verification_status: status,
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    })
    .eq("report_id", reportId);

  if (error) {
    console.error("Error verifying carbon data:", error);
    return { error: "Failed to verify carbon data." };
  }

  revalidatePath("/admin/carbon");
  return { success: true, co2Avoided };
}
