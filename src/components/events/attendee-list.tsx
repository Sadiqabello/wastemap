import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { EventDetail } from "@/types";

interface AttendeeListProps {
  attendees: EventDetail["event_attendees"];
}

export function AttendeeList({ attendees }: AttendeeListProps) {
  if (attendees.length === 0) {
    return (
      <p className="text-sm text-stone-500">No attendees yet. Be the first!</p>
    );
  }

  const going = attendees.filter((a) => a.status === "going");
  const interested = attendees.filter((a) => a.status === "interested");

  return (
    <div className="space-y-3">
      {going.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold text-stone-600">
            Going ({going.length})
          </p>
          <div className="space-y-1.5">
            {going.map((attendee) => {
              const initials = attendee.profiles.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={attendee.user_id}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-[10px]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-stone-700">
                    {attendee.profiles.full_name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {interested.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold text-stone-600">
            Interested ({interested.length})
          </p>
          <div className="space-y-1.5">
            {interested.map((attendee) => {
              const initials = attendee.profiles.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={attendee.user_id}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-stone-100 text-stone-600 text-[10px]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-stone-500">
                    {attendee.profiles.full_name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
