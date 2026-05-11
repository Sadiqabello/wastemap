"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PointAction } from "@/lib/constants";
import { POINT_LABELS } from "@/lib/constants";
import { getPointValue } from "@/lib/queries/settings";
import { createNotification } from "@/lib/actions/notifications";
import { logger } from "@/lib/logger";

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
    logger.error("award_points rpc failed", { userId, action, points, error });
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

/**
 * Atomically deduct points from a user's balance. Returns true if the spend
 * succeeded, false if the user had insufficient points. Uses the
 * `spend_points` SQL function which locks the profile row, so concurrent
 * spends cannot over-draft the balance.
 *
 * Callers that need to refund on a downstream failure should call
 * `admin_adjust_points` with a positive amount.
 */
export async function spendPoints(
  userId: string,
  points: number,
  reason: string
): Promise<boolean> {
  if (!points || points <= 0) {
    logger.error("spendPoints called with non-positive amount", { userId, points });
    return false;
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.rpc("spend_points", {
    p_user_id: userId,
    p_points: points,
    p_reason: reason,
  });

  if (error) {
    logger.error("spend_points rpc failed", { userId, points, reason, error });
    return false;
  }

  return data === true;
}

/**
 * Refund a previously-spent amount back to the user. Wraps
 * `admin_adjust_points` for clarity at call sites.
 */
export async function refundPoints(
  userId: string,
  points: number,
  reason: string
): Promise<void> {
  if (!points || points <= 0) return;
  const adminClient = createAdminClient();
  const { error } = await adminClient.rpc("admin_adjust_points", {
    p_user_id: userId,
    p_points: points,
    p_reason: reason,
  });
  if (error) {
    logger.error("refundPoints failed", { userId, points, reason, error });
  }
}
