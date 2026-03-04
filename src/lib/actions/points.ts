"use server";

import { createClient } from "@/lib/supabase/server";
import type { PointAction } from "@/lib/constants";
import { POINT_VALUES } from "@/lib/constants";

/**
 * Award points atomically using a DB function.
 * Returns true if points were awarded, false if duplicate (already awarded).
 */
export async function awardPoints(
  userId: string,
  action: PointAction,
  reportId?: string,
  eventId?: string
): Promise<boolean> {
  const supabase = await createClient();
  const points = POINT_VALUES[action];

  const { data, error } = await supabase.rpc("award_points", {
    p_user_id: userId,
    p_action: action,
    p_points: points,
    p_report_id: reportId || null,
    p_event_id: eventId || null,
  });

  if (error) {
    console.error("Error awarding points:", error);
    return false;
  }

  return data as boolean;
}
