"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createRewardSchema, createChallengeSchema } from "@/lib/validators/rewards";
import { createNotification } from "@/lib/actions/notifications";
import type { Database } from "@/types/database";

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

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Server configuration missing. SUPABASE_SERVICE_ROLE_KEY is required.");
  }
  return createServiceClient<Database>(supabaseUrl, serviceKey);
}

export async function createReward(formData: FormData) {
  await assertAdmin();
  const adminClient = getAdminClient();

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    category: formData.get("category") as string,
    point_cost: Number(formData.get("point_cost")),
    provider: (formData.get("provider") as string) || "manual",
    is_active: formData.get("is_active") !== "false",
    stock: formData.get("stock") ? Number(formData.get("stock")) : null,
    tier_required: (formData.get("tier_required") as string) || null,
  };

  const parsed = createRewardSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // Build provider_config from form fields
  const providerConfig: Record<string, string> = {};
  const amount = formData.get("amount") as string;
  if (amount) providerConfig.amount = amount;

  const { error } = await adminClient.from("rewards").insert({
    ...parsed.data,
    provider_config: Object.keys(providerConfig).length > 0 ? providerConfig : {},
  });

  if (error) {
    console.error("Error creating reward:", error);
    return { error: "Failed to create reward." };
  }

  revalidatePath("/admin/rewards");
  revalidatePath("/rewards");
  return { success: true };
}

export async function toggleRewardActive(rewardId: string, isActive: boolean) {
  await assertAdmin();
  const adminClient = getAdminClient();

  const { error } = await adminClient
    .from("rewards")
    .update({ is_active: isActive })
    .eq("id", rewardId);

  if (error) {
    console.error("Error toggling reward:", error);
    return { error: "Failed to update reward." };
  }

  revalidatePath("/admin/rewards");
  revalidatePath("/rewards");
  return { success: true };
}

export async function deleteReward(rewardId: string) {
  await assertAdmin();
  const adminClient = getAdminClient();

  const { error } = await adminClient
    .from("rewards")
    .delete()
    .eq("id", rewardId);

  if (error) {
    console.error("Error deleting reward:", error);
    return { error: "Failed to delete reward." };
  }

  revalidatePath("/admin/rewards");
  revalidatePath("/rewards");
  return { success: true };
}

export async function updateRedemptionStatus(
  redemptionId: string,
  status: string,
  providerReference?: string
) {
  await assertAdmin();
  const adminClient = getAdminClient();

  const updateData: Record<string, unknown> = { status };
  if (providerReference) updateData.provider_reference = providerReference;
  if (status === "completed") updateData.completed_at = new Date().toISOString();

  // If refunding, add points back
  if (status === "refunded") {
    const { data: redemption } = await adminClient
      .from("redemptions")
      .select("user_id, points_spent")
      .eq("id", redemptionId)
      .single();

    if (redemption) {
      // Get current points
      const { data: profile } = await adminClient
        .from("profiles")
        .select("points")
        .eq("id", redemption.user_id)
        .single();

      if (profile) {
        await adminClient
          .from("profiles")
          .update({ points: profile.points + redemption.points_spent })
          .eq("id", redemption.user_id);

        await adminClient
          .from("point_transactions")
          .insert({
            user_id: redemption.user_id,
            action: `Reward refund: ${redemptionId}`,
            points: redemption.points_spent,
          });

        // Notify the user about the refund
        createNotification(
          redemption.user_id,
          "redemption_update",
          "Redemption Refunded",
          "Your redemption has been refunded and points restored",
          { redemptionId, pointsRefunded: redemption.points_spent }
        ).catch(() => {});
      }
    }
  }

  const { error } = await adminClient
    .from("redemptions")
    .update(updateData)
    .eq("id", redemptionId);

  if (error) {
    console.error("Error updating redemption:", error);
    return { error: "Failed to update redemption." };
  }

  revalidatePath("/admin/rewards");
  return { success: true };
}

export async function createChallenge(formData: FormData) {
  await assertAdmin();
  const adminClient = getAdminClient();

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    action_type: formData.get("action_type") as string,
    target_count: Number(formData.get("target_count")),
    bonus_points: Number(formData.get("bonus_points")),
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
  };

  const parsed = createChallengeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await adminClient.from("challenges").insert(parsed.data);

  if (error) {
    console.error("Error creating challenge:", error);
    return { error: "Failed to create challenge." };
  }

  revalidatePath("/admin/rewards");
  revalidatePath("/challenges");
  return { success: true };
}

export async function toggleChallengeActive(challengeId: string, isActive: boolean) {
  await assertAdmin();
  const adminClient = getAdminClient();

  const { error } = await adminClient
    .from("challenges")
    .update({ is_active: isActive })
    .eq("id", challengeId);

  if (error) {
    console.error("Error toggling challenge:", error);
    return { error: "Failed to update challenge." };
  }

  revalidatePath("/admin/rewards");
  revalidatePath("/challenges");
  return { success: true };
}

export async function editReward(
  rewardId: string,
  data: {
    name?: string;
    description?: string;
    category?: string;
    point_cost?: number;
    stock?: number | null;
    tier_required?: string | null;
    is_active?: boolean;
  }
) {
  await assertAdmin();
  const adminClient = getAdminClient();

  const { error } = await adminClient
    .from("rewards")
    .update(data as Record<string, unknown>)
    .eq("id", rewardId);

  if (error) {
    console.error("Error editing reward:", error);
    return { error: "Failed to update reward." };
  }

  revalidatePath("/admin/rewards");
  revalidatePath("/rewards");
  return { success: true };
}

export async function deleteChallenge(challengeId: string) {
  await assertAdmin();
  const adminClient = getAdminClient();

  const { error } = await adminClient
    .from("challenges")
    .delete()
    .eq("id", challengeId);

  if (error) {
    console.error("Error deleting challenge:", error);
    return { error: "Failed to delete challenge." };
  }

  revalidatePath("/admin/rewards");
  revalidatePath("/challenges");
  return { success: true };
}

export async function editChallenge(
  challengeId: string,
  data: {
    title?: string;
    description?: string;
    action_type?: string;
    target_count?: number;
    bonus_points?: number;
    start_date?: string;
    end_date?: string;
    is_active?: boolean;
  }
) {
  await assertAdmin();
  const adminClient = getAdminClient();

  const { error } = await adminClient
    .from("challenges")
    .update(data as Record<string, unknown>)
    .eq("id", challengeId);

  if (error) {
    console.error("Error editing challenge:", error);
    return { error: "Failed to update challenge." };
  }

  revalidatePath("/admin/rewards");
  revalidatePath("/challenges");
  return { success: true };
}
