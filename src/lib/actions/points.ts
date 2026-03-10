"use server";

import { createClient } from "@/lib/supabase/server";
import type { PointAction } from "@/lib/constants";
import { POINT_LABELS } from "@/lib/constants";
import { getPointValue } from "@/lib/queries/settings";
import { createNotification } from "@/lib/actions/notifications";

/**
 * Award points atomically using a DB function.
 * Point values are fetched from platform_settings (admin-configurable),
 * with fallback to hardcoded defaults.
 * Creates a notification for the user when points are awarded.
 * Returns true if points were awarded, false if duplicate (already awarded).
 */
export async function awardPoints(
  userId: string,
  action: PointAction,
  reportId?: string,
  eventId?: string
): Promise<boolean> {
  const supabase = await createClient();
  const points = await getPointValue(action);

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

  const awarded = data as boolean;

  // Send notification if points were actually awarded (not duplicate)
  if (awarded) {
    const label = POINT_LABELS[action];
    createNotification(
      userId,
      "points_earned",
      `+${points} Points Earned!`,
      `You earned ${points} points for: ${label}`,
      { action, points, reportId, eventId }
    ).catch(() => {}); // fire-and-forget
  }

  return awarded;
}
