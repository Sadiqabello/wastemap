import Link from "next/link";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EventWithOrganizer } from "@/types";

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

interface EventCardProps {
  event: EventWithOrganizer;
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.event_date + "T00:00:00");
  const isPast = eventDate < new Date() && event.status !== "in_progress";

  return (
    <Link href={`/events/${event.id}`}>
      <Card
        className={`transition-colors hover:bg-stone-50 ${
          isPast ? "opacity-75" : ""
        }`}
      >
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`border-0 text-[10px] ${STATUS_STYLES[event.status]}`}>
                  {STATUS_LABELS[event.status]}
                </Badge>
              </div>
              <h3 className="truncate font-semibold text-stone-900">
                {event.title}
              </h3>
              <p className="mt-0.5 text-sm text-stone-500 line-clamp-2">
                {event.description}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {eventDate.toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {event.start_time.slice(0, 5)}
                  {event.end_time && ` - ${event.end_time.slice(0, 5)}`}
                </span>
                {event.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[150px]">{event.address}</span>
                  </span>
                )}
                {event.max_attendees && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {event.max_attendees} spots
                  </span>
                )}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-emerald-50">
                <span className="text-xs font-medium text-emerald-600">
                  {eventDate.toLocaleDateString("en-US", { month: "short" })}
                </span>
                <span className="text-lg font-bold leading-tight text-emerald-700">
                  {eventDate.getDate()}
                </span>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-stone-400">
            Organized by {event.profiles.full_name}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
