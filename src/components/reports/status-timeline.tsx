import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import type { StatusUpdate, Profile } from "@/types";

interface StatusTimelineProps {
  updates: (StatusUpdate & { profiles: Pick<Profile, "full_name"> })[];
  createdAt: string;
}

export function StatusTimeline({ updates, createdAt }: StatusTimelineProps) {
  const allEvents = [
    {
      id: "created",
      status: "reported" as const,
      label: "Report Created",
      date: createdAt,
      by: null,
      comment: null,
    },
    ...updates.map((u) => ({
      id: u.id,
      status: u.new_status,
      label: `Status changed to ${STATUS_LABELS[u.new_status]}`,
      date: u.created_at,
      by: u.profiles?.full_name || "Unknown",
      comment: u.comment,
    })),
  ];

  return (
    <div className="space-y-0">
      {allEvents.map((event, index) => (
        <div key={event.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className="h-3 w-3 rounded-full border-2 border-white ring-2"
              style={{
                backgroundColor: STATUS_COLORS[event.status],
                "--tw-ring-color": STATUS_COLORS[event.status],
              } as React.CSSProperties}
            />
            {index < allEvents.length - 1 && (
              <div className="h-full w-px bg-stone-200" style={{ minHeight: "2rem" }} />
            )}
          </div>
          <div className="pb-4">
            <p className="text-sm font-medium text-stone-900">{event.label}</p>
            {event.by && (
              <p className="text-xs text-stone-500">by {event.by}</p>
            )}
            {event.comment && (
              <p className="mt-0.5 text-xs text-stone-600 italic">
                &ldquo;{event.comment}&rdquo;
              </p>
            )}
            <p className="text-xs text-stone-400">
              {new Date(event.date).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
