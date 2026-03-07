import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Wrench,
} from "lucide-react";
import { getEventById } from "@/lib/queries/events";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapContainer } from "@/components/map/map-container";
import { AttendeeList } from "@/components/events/attendee-list";
import { JoinButton } from "@/components/events/join-button";
import { CompleteEventButton } from "@/components/events/complete-event-button";
import { LiveStream } from "@/components/events/live-stream";

const STATUS_STYLES = {
  upcoming: "bg-blue-100 text-blue-700",
  in_progress: "bg-emerald-100 text-emerald-700",
  completed: "bg-stone-100 text-stone-600",
  cancelled: "bg-red-100 text-red-600",
} as const;

const STATUS_LABELS = {
  upcoming: "Upcoming",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
} as const;

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const eventDate = new Date(event.event_date + "T00:00:00");
  const isFull =
    event.max_attendees !== null &&
    event.attendee_count >= event.max_attendees;
  const isOrganizer = user?.id === event.organizer_id;
  const canComplete =
    isOrganizer &&
    event.status !== "completed" &&
    event.status !== "cancelled";

  let userName = "Attendee";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    if (profile?.full_name) userName = profile.full_name;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/events">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`border-0 ${STATUS_STYLES[event.status]}`}>
                {STATUS_LABELS[event.status]}
              </Badge>
              {event.is_live && (
                <Badge className="bg-red-500 text-white border-0 animate-pulse">
                  LIVE
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-stone-900">
              {event.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-stone-500">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {event.profiles.full_name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {eventDate.toLocaleDateString("en-NG", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {event.start_time.slice(0, 5)}
                {event.end_time && ` - ${event.end_time.slice(0, 5)}`}
              </span>
              {event.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.address}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About this Event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-stone-700">
                {event.description}
              </p>
            </CardContent>
          </Card>

          {/* Equipment */}
          {(event.tools_provided || event.tools_needed) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wrench className="h-4 w-4" />
                  Equipment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.tools_provided && (
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">
                      Provided by Organizer
                    </p>
                    <p className="mt-0.5 text-sm text-stone-600">
                      {event.tools_provided}
                    </p>
                  </div>
                )}
                {event.tools_needed && (
                  <div>
                    <p className="text-xs font-semibold text-amber-700">
                      Please Bring
                    </p>
                    <p className="mt-0.5 text-sm text-stone-600">
                      {event.tools_needed}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Event Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] overflow-hidden rounded-lg">
                <MapContainer
                  center={[event.latitude, event.longitude]}
                  zoom={15}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Live Stream */}
          {user && (isOrganizer || event.is_live) && (
            <LiveStream
              eventId={event.id}
              eventTitle={event.title}
              isLive={event.is_live}
              isOrganizer={isOrganizer}
              userName={userName}
            />
          )}

          {/* RSVP */}
          {user && event.status === "upcoming" && (
            <Card>
              <CardContent className="pt-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-700">
                    RSVP
                  </span>
                  <span className="text-xs text-stone-500">
                    <Users className="mr-1 inline h-3 w-3" />
                    {event.attendee_count}
                    {event.max_attendees && ` / ${event.max_attendees}`} going
                  </span>
                </div>
                <JoinButton
                  eventId={event.id}
                  isAttending={event.user_is_attending}
                  currentStatus={event.user_rsvp_status}
                  isFull={isFull}
                />
              </CardContent>
            </Card>
          )}

          {/* Complete Event (organizer only) */}
          {canComplete && (
            <Card>
              <CardContent className="pt-6">
                <p className="mb-2 text-xs text-stone-500">
                  As the organizer, you can mark this event as completed.
                  All &quot;going&quot; attendees will earn points.
                </p>
                <CompleteEventButton eventId={event.id} />
              </CardContent>
            </Card>
          )}

          {/* Attendees */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attendees</CardTitle>
            </CardHeader>
            <CardContent>
              <AttendeeList attendees={event.event_attendees} />
            </CardContent>
          </Card>

          {/* Linked Reports */}
          {event.report_ids && event.report_ids.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Linked Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {event.report_ids.map((reportId) => (
                    <Link
                      key={reportId}
                      href={`/reports/${reportId}`}
                      className="block text-sm text-emerald-600 hover:underline"
                    >
                      View Report
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
