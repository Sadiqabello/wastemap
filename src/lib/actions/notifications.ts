"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type NotificationType =
  | "points_earned"
  | "report_status_changed"
  | "report_upvoted"
  | "event_completed"
  | "event_rsvp"
  | "event_live"
  | "bid_received"
  | "bid_accepted"
  | "bid_completed"
  | "achievement_unlocked"
  | "challenge_completed"
  | "referral_milestone"
  | "redemption_update"
  | "collector_status"
  | "admin_adjustment";

/**
 * Create a notification for a user. Uses admin client to bypass RLS.
 * Fire-and-forget — errors are logged but never block the calling action.
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data: Record<string, unknown> = {}
): Promise<void> {
  try {
    const adminClient = createAdminClient();
    await (adminClient.from as any)("notifications").insert({
      user_id: userId,
      type,
      title,
      message,
      data,
    });
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(notificationId: string) {
  const supabase = await createClient();
  const { error } = await (supabase.from as any)("notifications")
    .update({ read: true })
    .eq("id", notificationId);

  if (error) return { error: error.message };
  revalidatePath("/notifications");
  return { success: true };
}

/**
 * Mark all notifications as read for the current user.
 */
export async function markAllAsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await (supabase.from as any)("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) return { error: error.message };
  revalidatePath("/notifications");
  return { success: true };
}

/**
 * Delete a single notification.
 */
export async function deleteNotification(notificationId: string) {
  const supabase = await createClient();
  const { error } = await (supabase.from as any)("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) return { error: error.message };
  revalidatePath("/notifications");
  return { success: true };
}
