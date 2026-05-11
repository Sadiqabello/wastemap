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

export async function createChallenge(formData: FormData) {
  await assertAdmin();
  const adminClient = createAdminClient();

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    action_type: formData.get("action_type") as string,
    target_count: Number(formData.get("target_count")),
    bonus_points: Number(formData.get("bonus_points")),
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
  };

  if (!raw.title || !raw.action_type) {
    return { error: "Title and action type are required." };
  }
  if (!raw.start_date || !raw.end_date) {
    return { error: "Start and end date are required." };
  }

  const { error } = await adminClient.from("challenges").insert(raw);
  if (error) {
    logger.error("createChallenge failed", { error });
    return { error: "Failed to create challenge." };
  }

  revalidatePath("/admin/challenges");
  revalidatePath("/challenges");
  return { success: true };
}

export async function toggleChallengeActive(challengeId: string, isActive: boolean) {
  await assertAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("challenges")
    .update({ is_active: isActive })
    .eq("id", challengeId);

  if (error) {
    logger.error("toggleChallengeActive failed", { challengeId, error });
    return { error: "Failed to update challenge." };
  }

  revalidatePath("/admin/challenges");
  revalidatePath("/challenges");
  return { success: true };
}

export async function deleteChallenge(challengeId: string) {
  await assertAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("challenges")
    .delete()
    .eq("id", challengeId);

  if (error) {
    logger.error("deleteChallenge failed", { challengeId, error });
    return { error: "Failed to delete challenge." };
  }

  revalidatePath("/admin/challenges");
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
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("challenges")
    .update(data as Record<string, unknown>)
    .eq("id", challengeId);

  if (error) {
    logger.error("editChallenge failed", { challengeId, error });
    return { error: "Failed to update challenge." };
  }

  revalidatePath("/admin/challenges");
  revalidatePath("/challenges");
  return { success: true };
}
