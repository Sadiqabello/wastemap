"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  changeRoleSchema,
  adjustPointsSchema,
  bulkUpdateStatusSchema,
  updateEventStatusSchema,
  deleteItemSchema,
} from "@/lib/validators/admin";
import { awardPoints } from "@/lib/actions/points";

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

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/events");
}

export async function changeUserRole(userId: string, newRole: string) {
  const parsed = changeRoleSchema.safeParse({ userId, newRole });
  if (!parsed.success) return { error: "Invalid input." };

  const { supabase } = await assertAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({ role: parsed.data.newRole })
    .eq("id", parsed.data.userId);

  if (error) {
    console.error("Error changing role:", error);
    return { error: "Failed to change role." };
  }

  revalidateAdmin();
  return { success: true };
}

export async function adjustUserPoints(
  userId: string,
  points: number,
  reason: string
) {
  const parsed = adjustPointsSchema.safeParse({ userId, points, reason });
  if (!parsed.success) return { error: "Invalid input." };

  const { supabase } = await assertAdmin();

  const { error } = await supabase.rpc("admin_adjust_points", {
    p_user_id: parsed.data.userId,
    p_points: parsed.data.points,
    p_reason: parsed.data.reason,
  });

  if (error) {
    console.error("Error adjusting points:", error);
    return { error: "Failed to adjust points." };
  }

  revalidateAdmin();
  revalidatePath("/leaderboard");
  return { success: true };
}

export async function adminDeleteReport(reportId: string) {
  const parsed = deleteItemSchema.safeParse({ id: reportId });
  if (!parsed.success) return { error: "Invalid input." };

  const { supabase } = await assertAdmin();

  const { error } = await supabase
    .from("reports")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    console.error("Error deleting report:", error);
    return { error: "Failed to delete report." };
  }

  revalidateAdmin();
  revalidatePath("/dashboard");
  return { success: true };
}

export async function adminBulkUpdateReportStatus(
  reportIds: string[],
  newStatus: string
) {
  const parsed = bulkUpdateStatusSchema.safeParse({ reportIds, newStatus });
  if (!parsed.success) return { error: "Invalid input." };

  const { supabase, user } = await assertAdmin();

  const errors: string[] = [];
  for (const reportId of parsed.data.reportIds) {
    const { data: report } = await supabase
      .from("reports")
      .select("status")
      .eq("id", reportId)
      .single();

    if (!report) {
      errors.push(reportId);
      continue;
    }

    const { error: updateError } = await supabase
      .from("reports")
      .update({ status: parsed.data.newStatus })
      .eq("id", reportId);

    if (updateError) {
      errors.push(reportId);
      continue;
    }

    await supabase.from("status_updates").insert({
      report_id: reportId,
      changed_by: user.id,
      old_status: report.status,
      new_status: parsed.data.newStatus,
      comment: "Bulk status change by admin",
    });
  }

  if (errors.length > 0) {
    return { error: `Failed to update ${errors.length} report(s).` };
  }

  revalidateAdmin();
  revalidatePath("/dashboard");
  return { success: true };
}

export async function adminUpdateEventStatus(
  eventId: string,
  newStatus: string
) {
  const parsed = updateEventStatusSchema.safeParse({ eventId, newStatus });
  if (!parsed.success) return { error: "Invalid input." };

  const { supabase } = await assertAdmin();

  const { error } = await supabase
    .from("events")
    .update({ status: parsed.data.newStatus })
    .eq("id", parsed.data.eventId);

  if (error) {
    console.error("Error updating event status:", error);
    return { error: "Failed to update event status." };
  }

  if (parsed.data.newStatus === "completed") {
    const { data: event } = await supabase
      .from("events")
      .select("organizer_id")
      .eq("id", parsed.data.eventId)
      .single();

    if (event) {
      await awardPoints(
        event.organizer_id,
        "event_completed",
        undefined,
        parsed.data.eventId
      );
    }

    const { data: attendees } = await supabase
      .from("event_attendees")
      .select("user_id")
      .eq("event_id", parsed.data.eventId)
      .eq("status", "going");

    if (attendees) {
      await Promise.all(
        attendees.map((a) =>
          awardPoints(
            a.user_id,
            "event_attended",
            undefined,
            parsed.data.eventId
          )
        )
      );
    }
  }

  revalidateAdmin();
  revalidatePath("/events");
  revalidatePath("/leaderboard");
  return { success: true };
}

export async function adminDeleteEvent(eventId: string) {
  const parsed = deleteItemSchema.safeParse({ id: eventId });
  if (!parsed.success) return { error: "Invalid input." };

  const { supabase } = await assertAdmin();

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    console.error("Error deleting event:", error);
    return { error: "Failed to delete event." };
  }

  revalidateAdmin();
  revalidatePath("/events");
  return { success: true };
}
