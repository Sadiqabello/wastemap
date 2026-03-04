import Link from "next/link";
import { CalendarPlus, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEvents } from "@/lib/queries/events";
import { createClient } from "@/lib/supabase/server";
import { EventCard } from "@/components/events/event-card";

export default async function EventsPage() {
  const events = await getEvents();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const upcoming = events.filter(
    (e) => e.status === "upcoming" || e.status === "in_progress"
  );
  const past = events.filter(
    (e) => e.status === "completed" || e.status === "cancelled"
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-emerald-500" />
            <h1 className="text-2xl font-bold text-stone-900">
              Cleanup Events
            </h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Join community cleanup events or organize your own
          </p>
        </div>
        {user && (
          <Link href="/events/new">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <CalendarPlus className="mr-1 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        )}
      </div>

      {events.length === 0 ? (
        <div className="rounded-lg border bg-stone-50 p-12 text-center">
          <CalendarDays className="mx-auto mb-3 h-12 w-12 text-stone-300" />
          <p className="text-stone-500">No cleanup events yet.</p>
          {user && (
            <Link href="/events/new" className="mt-3 inline-block">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Create the first event
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-stone-700">
                Upcoming Events ({upcoming.length})
              </h2>
              <div className="space-y-3">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-stone-500">
                Past Events ({past.length})
              </h2>
              <div className="space-y-3">
                {past.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
