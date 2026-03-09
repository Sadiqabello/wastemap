"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import {
  changeRoleSchema,
  adjustPointsSchema,
  bulkUpdateStatusSchema,
  updateEventStatusSchema,
  deleteItemSchema,
  createUserSchema,
} from "@/lib/validators/admin";
import { awardPoints } from "@/lib/actions/points";
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

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/events");
}

export async function changeUserRole(userId: string, newRole: string) {
  const parsed = changeRoleSchema.safeParse({ userId, newRole });
  if (!parsed.success) return { error: "Invalid input." };

  await assertAdmin();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return { error: "Server configuration missing. SUPABASE_SERVICE_ROLE_KEY is required." };
  }

  const adminClient = createServiceClient<Database>(supabaseUrl, serviceKey);

  const { error } = await adminClient
    .from("profiles")
    .update({ role: parsed.data.newRole })
    .eq("id", parsed.data.userId);

  if (error) {
    console.error("Error changing role:", error);
    return { error: `Failed to change role: ${error.message}` };
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

  await assertAdmin();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return { error: "Server configuration missing. SUPABASE_SERVICE_ROLE_KEY is required." };
  }

  const adminClient = createServiceClient<Database>(supabaseUrl, serviceKey);

  // Insert point transaction record
  const { error: txError } = await adminClient
    .from("point_transactions")
    .insert({
      user_id: parsed.data.userId,
      action: parsed.data.reason,
      points: parsed.data.points,
    });

  if (txError) {
    console.error("Error inserting point transaction:", txError);
    return { error: `Failed to adjust points: ${txError.message}` };
  }

  // Get current points and update
  const { data: profile, error: fetchError } = await adminClient
    .from("profiles")
    .select("points")
    .eq("id", parsed.data.userId)
    .single();

  if (fetchError || !profile) {
    console.error("Error fetching profile:", fetchError);
    return { error: "Failed to fetch user profile." };
  }

  const newPoints = profile.points + parsed.data.points;

  const { error: updateError } = await adminClient
    .from("profiles")
    .update({ points: newPoints })
    .eq("id", parsed.data.userId);

  if (updateError) {
    console.error("Error updating points:", updateError);
    return { error: `Failed to update points: ${updateError.message}` };
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

export async function adminCreateUser(
  email: string,
  password: string,
  fullName: string,
  role: string
) {
  const parsed = createUserSchema.safeParse({ email, password, fullName, role });
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(fieldErrors).flat()[0];
    return { error: firstError || "Invalid input." };
  }

  // Verify caller is admin
  await assertAdmin();

  // Use service role client to create the user via Supabase Auth Admin API
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return { error: "Server configuration missing. SUPABASE_SERVICE_ROLE_KEY is required." };
  }

  const adminClient = createServiceClient<Database>(supabaseUrl, serviceKey);

  // Create the auth user
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.fullName },
  });

  if (authError) {
    console.error("Error creating user:", authError);
    if (authError.message?.includes("already been registered")) {
      return { error: "A user with this email already exists." };
    }
    return { error: authError.message || "Failed to create user." };
  }

  if (!authData.user) {
    return { error: "Failed to create user." };
  }

  // Update the profile role (the trigger should have created the profile)
  // Wait briefly for the trigger to fire, then update role
  const { error: roleError } = await adminClient
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", authData.user.id);

  if (roleError) {
    console.error("Error setting user role:", roleError);
    // User was created but role update failed — try to set it
    return { error: "User created but role assignment failed. Please change the role manually." };
  }

  revalidateAdmin();
  return { success: true };
}

export async function adminEditReport(
  reportId: string,
  data: {
    title?: string;
    category?: string;
    severity?: string;
    status?: string;
    description?: string;
  }
) {
  const parsed = deleteItemSchema.safeParse({ id: reportId });
  if (!parsed.success) return { error: "Invalid report ID." };

  await assertAdmin();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return { error: "Server configuration missing. SUPABASE_SERVICE_ROLE_KEY is required." };
  }

  const adminClient = createServiceClient<Database>(supabaseUrl, serviceKey);

  const { error } = await adminClient
    .from("reports")
    .update(data as Record<string, unknown>)
    .eq("id", parsed.data.id);

  if (error) {
    console.error("Error editing report:", error);
    return { error: `Failed to edit report: ${error.message}` };
  }

  revalidateAdmin();
  revalidatePath("/dashboard");
  return { success: true };
}

export async function adminEditUser(
  userId: string,
  data: {
    full_name?: string;
    email?: string;
    phone_number?: string;
  }
) {
  const parsed = deleteItemSchema.safeParse({ id: userId });
  if (!parsed.success) return { error: "Invalid user ID." };

  await assertAdmin();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return { error: "Server configuration missing. SUPABASE_SERVICE_ROLE_KEY is required." };
  }

  const adminClient = createServiceClient<Database>(supabaseUrl, serviceKey);

  const { error } = await adminClient
    .from("profiles")
    .update(data)
    .eq("id", parsed.data.id);

  if (error) {
    console.error("Error editing user:", error);
    return { error: `Failed to edit user: ${error.message}` };
  }

  revalidateAdmin();
  return { success: true };
}

export async function adminDeleteUser(userId: string) {
  const parsed = deleteItemSchema.safeParse({ id: userId });
  if (!parsed.success) return { error: "Invalid user ID." };

  await assertAdmin();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return { error: "Server configuration missing. SUPABASE_SERVICE_ROLE_KEY is required." };
  }

  const adminClient = createServiceClient<Database>(supabaseUrl, serviceKey);

  const { error } = await adminClient.auth.admin.deleteUser(parsed.data.id);

  if (error) {
    console.error("Error deleting user:", error);
    return { error: `Failed to delete user: ${error.message}` };
  }

  revalidateAdmin();
  return { success: true };
}

export async function adminCreateEvent(data: {
  title: string;
  description: string;
  event_date: string;
  start_time?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  max_attendees?: number;
  organizer_id: string;
}) {
  await assertAdmin();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return { error: "Server configuration missing. SUPABASE_SERVICE_ROLE_KEY is required." };
  }

  const adminClient = createServiceClient<Database>(supabaseUrl, serviceKey);

  const { error } = await adminClient.from("events").insert({
    title: data.title,
    description: data.description,
    event_date: data.event_date,
    start_time: data.start_time || "09:00",
    address: data.address,
    latitude: data.latitude || 9.0579,
    longitude: data.longitude || 7.4951,
    max_attendees: data.max_attendees,
    organizer_id: data.organizer_id,
  });

  if (error) {
    console.error("Error creating event:", error);
    return { error: `Failed to create event: ${error.message}` };
  }

  revalidateAdmin();
  revalidatePath("/events");
  return { success: true };
}

export async function adminEditEvent(
  eventId: string,
  data: {
    title?: string;
    description?: string;
    event_date?: string;
    address?: string;
    max_attendees?: number | null;
  }
) {
  const parsed = deleteItemSchema.safeParse({ id: eventId });
  if (!parsed.success) return { error: "Invalid event ID." };

  await assertAdmin();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return { error: "Server configuration missing. SUPABASE_SERVICE_ROLE_KEY is required." };
  }

  const adminClient = createServiceClient<Database>(supabaseUrl, serviceKey);

  const { error } = await adminClient
    .from("events")
    .update(data as Record<string, unknown>)
    .eq("id", parsed.data.id);

  if (error) {
    console.error("Error editing event:", error);
    return { error: `Failed to edit event: ${error.message}` };
  }

  revalidateAdmin();
  revalidatePath("/events");
  return { success: true };
}
