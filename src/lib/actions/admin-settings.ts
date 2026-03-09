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
 * Update a single platform setting.
 */
export async function updateSetting(key: string, value: unknown) {
  await assertAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("platform_settings")
    .update({
      value: value as never,
      updated_at: new Date().toISOString(),
    })
    .eq("key", key);

  if (error) {
    console.error("Error updating setting:", error);
    return { error: `Failed to update setting "${key}".` };
  }

  revalidatePath("/admin/settings");
  return { success: true };
}

/**
 * Bulk update multiple platform settings.
 */
export async function updateSettings(
  settings: { key: string; value: unknown }[]
) {
  await assertAdmin();
  const adminClient = createAdminClient();

  const now = new Date().toISOString();
  const errors: string[] = [];

  for (const { key, value } of settings) {
    const { error } = await adminClient
      .from("platform_settings")
      .update({
        value: value as never,
        updated_at: now,
      })
      .eq("key", key);

    if (error) {
      console.error(`Error updating setting "${key}":`, error);
      errors.push(key);
    }
  }

  if (errors.length > 0) {
    return { error: `Failed to update: ${errors.join(", ")}` };
  }

  revalidatePath("/admin/settings");
  return { success: true };
}
