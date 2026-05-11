import { createClient } from "@/lib/supabase/server";
import type { EventWithOrganizer, EventDetail } from "@/types";

export async function getEvents(): Promise<EventWithOrganizer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*, profiles!events_organizer_id_fkey (full_name, avatar_url)")
    .order("event_date", { ascending: true });

  if (error || !data) {
    console.error("Error fetching events:", error);
    return [];
  }

  return data as EventWithOrganizer[];
}

export async function getUpcomingEvents(
  limit = 5
): Promise<EventWithOrganizer[]> {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("events")
    .select("*, profiles!events_organizer_id_fkey (full_name, avatar_url)")
    .gte("event_date", today)
    .in("status", ["upcoming", "in_progress"])
    .order("event_date", { ascending: true })
    .limit(limit);

  if (error || !data) {
    console.error("Error fetching upcoming events:", error);
    return [];
  }

  return data as EventWithOrganizer[];
}

export async function getEventById(id: string): Promise<EventDetail | null> {
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select(
      `
      *,
      profiles!events_organizer_id_fkey (full_name, avatar_url),
      event_attendees (
        *,
        profiles!event_attendees_user_id_fkey (full_name, avatar_url)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !event) {
    console.error("Error fetching event:", error);
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const attendees = (event.event_attendees || []) as EventDetail["event_attendees"];
  const userAttendee = user
    ? attendees.find((a) => a.user_id === user.id)
    : null;

  const result = event as EventDetail;
  result.attendee_count = attendees.filter((a) => a.status === "going").length;
  result.user_is_attending = !!userAttendee;
  result.user_rsvp_status = userAttendee?.status || null;

  return result;
}
