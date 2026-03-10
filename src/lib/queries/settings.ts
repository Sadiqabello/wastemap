import { createClient } from "@/lib/supabase/server";
import type { PlatformSettingRow } from "@/types/database";
import { POINT_VALUES } from "@/lib/constants";
import type { PointAction } from "@/lib/constants";

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

/**
 * Fetch all point values from platform_settings.
 * Falls back to hardcoded POINT_VALUES for any missing keys.
 */
export async function getPointValues(): Promise<Record<PointAction, number>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("platform_settings")
    .select("key, value")
    .like("key", "points.%");

  // Start with hardcoded defaults
  const values = { ...POINT_VALUES } as Record<PointAction, number>;

  if (error || !data) {
    console.error("Error fetching point settings, using defaults:", error);
    return values;
  }

  // Override with DB values
  for (const row of data) {
    // "points.report_created" -> "report_created"
    const action = row.key.replace("points.", "") as PointAction;
    if (action in values) {
      const num = Number(row.value);
      if (!isNaN(num)) {
        values[action] = num;
      }
    }
  }

  return values;
}

/**
 * Fetch a single point value from platform_settings.
 * Falls back to hardcoded default.
 */
export async function getPointValue(action: PointAction): Promise<number> {
  const dbValue = await getSetting<number>(`points.${action}`);
  return dbValue ?? POINT_VALUES[action];
}
