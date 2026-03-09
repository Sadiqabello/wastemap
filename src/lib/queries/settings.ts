import { createClient } from "@/lib/supabase/server";
import type { PlatformSettingRow } from "@/types/database";

export type GroupedSettings = Record<string, PlatformSettingRow[]>;

/**
 * Fetch all platform settings, grouped by category.
 */
export async function getSettings(): Promise<GroupedSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("platform_settings")
    .select("*")
    .order("key");

  if (error) {
    console.error("Error fetching settings:", error);
    return {};
  }

  const grouped: GroupedSettings = {};
  for (const setting of data ?? []) {
    const cat = setting.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(setting);
  }

  return grouped;
}

/**
 * Fetch a single setting value by key.
 */
export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error || !data) return null;

  return data.value as T;
}
