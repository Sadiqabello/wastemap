"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { eventSchema } from "@/lib/validators/event";
import { awardPoints } from "@/lib/actions/points";
import { updateChallengeProgress } from "@/lib/actions/challenges";
import { trackReferralMilestone } from "@/lib/actions/referrals";
import { createNotification } from "@/lib/actions/notifications";

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be signed in to create an event." };
  }

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    event_date: formData.get("event_date"),
    start_time: formData.get("start_time"),
    end_time: (formData.get("end_time") as string) || undefined,
    latitude: Number(formData.get("latitude")),
    longitude: Number(formData.get("longitude")),
    address: (formData.get("address") as string) || undefined,
    max_attendees: formData.get("max_attendees")
      ? Number(formData.get("max_attendees"))
      : undefined,
    tools_provided: (formData.get("tools_provided") as string) || undefined,
    tools_needed: (formData.get("tools_needed") as string) || undefined,
  };

  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const reportIds = formData.getAll("reportIds") as string[];

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      ...parsed.data,
      organizer_id: user.id,
      report_ids: reportIds,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating event:", error);
    return { error: "Failed to create event. Please try again." };
  }

  // Award points for organizing an event
  await awardPoints(user.id, "event_created", undefined, event.id);
  updateChallengeProgress(user.id, "event_created").catch(() => {});

  revalidatePath("/events");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  return { success: true };
}

export async function joinEvent(eventId: string, status: "going" | "interested") {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be signed in to RSVP." };
  }

  // Check if already RSVP'd
  const { data: existing } = await supabase
    .from("event_attendees")
    .select("user_id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    // Update RSVP status
    const { error } = await supabase
      .from("event_attendees")
      .update({ status })
      .eq("event_id", eventId)
      .eq("user_id", user.id);

    if (error) {
      return { error: "Failed to update RSVP." };
    }
  } else {
    const { error } = await supabase.from("event_attendees").insert({
      event_id: eventId,
      user_id: user.id,
      status,
    });

    if (error) {
      return { error: "Failed to RSVP." };
    }

    // Award points for joining an event (first time only, enforced by DB unique constraint)
    await awardPoints(user.id, "event_joined", undefined, eventId);
    trackReferralMilestone(user.id, "first_event").catch(() => {});

    // Notify the event organizer about the RSVP
    const { data: event } = await supabase
      .from("events")
      .select("organizer_id")
      .eq("id", eventId)
      .single();
    if (event && event.organizer_id !== user.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      const userName = profile?.full_name || "Someone";
      createNotification(
        event.organizer_id,
        "event_rsvp",
        "New RSVP",
        `${userName} is ${status} to your event`,
        { eventId, status }
      ).catch(() => {});
    }
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/leaderboard");
  return { success: true };
}

export async function leaveEvent(eventId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be signed in." };
  }

  await supabase
    .from("event_attendees")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", user.id);

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

export async function toggleLiveStream(eventId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be signed in." };
  }

  const { data: event } = await supabase
    .from("events")
    .select("organizer_id, status, is_live")
    .eq("id", eventId)
    .single();

  if (!event) {
    return { error: "Event not found." };
  }

  if (event.organizer_id !== user.id) {
    return { error: "Only the organizer can control the live stream." };
  }

  if (event.status === "completed" || event.status === "cancelled") {
    return { error: "Cannot go live on a completed or cancelled event." };
  }

  const newLiveState = !event.is_live;

  const { error } = await supabase
    .from("events")
    .update({ is_live: newLiveState })
    .eq("id", eventId);

  if (error) {
    console.error("Error toggling live stream:", error);
    return { error: "Failed to update live stream status." };
  }

  revalidatePath(`/events/${eventId}`);
  return { success: true, is_live: newLiveState };
}

export async function completeEvent(eventId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be signed in." };
  }

  // Verify the user is the organizer
  const { data: event } = await supabase
    .from("events")
    .select("organizer_id, status")
    .eq("id", eventId)
    .single();

  if (!event) {
    return { error: "Event not found." };
  }

  if (event.organizer_id !== user.id) {
    return { error: "Only the organizer can complete an event." };
  }

  if (event.status === "completed") {
    return { error: "Event is already completed." };
  }

  const { error } = await supabase
    .from("events")
    .update({ status: "completed", is_live: false })
    .eq("id", eventId);

  if (error) {
    console.error("Error completing event:", error);
    return { error: "Failed to complete event." };
  }

  // Award organizer points
  await awardPoints(user.id, "event_completed", undefined, eventId);

  // Award points to all attendees who were "going"
  const { data: attendees } = await supabase
    .from("event_attendees")
    .select("user_id")
    .eq("event_id", eventId)
    .eq("status", "going");

  if (attendees) {
    await Promise.all(
      attendees.map(async (a) => {
        await awardPoints(a.user_id, "event_attended", undefined, eventId);
        updateChallengeProgress(a.user_id, "event_attended").catch(() => {});
      })
    );
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  return { success: true };
}
