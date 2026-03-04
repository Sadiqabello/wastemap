export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAllEventsAdmin } from "@/lib/queries/admin";
import { adminDeleteEvent, adminUpdateEventStatus } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { EventActionButtons } from "./event-action-buttons";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Users,
} from "lucide-react";

const EVENT_STATUS_COLORS: Record<string, string> = {
  upcoming: "#3b82f6",
  in_progress: "#f59e0b",
  completed: "#22c55e",
  cancelled: "#ef4444",
};

const EVENT_STATUS_LABELS: Record<string, string> = {
  upcoming: "Upcoming",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

interface EventsPageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
  }>;
}

export default async function AdminEventsPage({
  searchParams,
}: EventsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const statusFilter = params.status ?? "all";

  const { events, total } = await getAllEventsAdmin(page, statusFilter);
  const totalPages = Math.ceil(total / 20);

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (statusFilter !== "all") p.set("status", statusFilter);
    p.set("page", String(page));
    for (const [k, v] of Object.entries(overrides)) {
      if (v && v !== "all") p.set(k, v);
      else p.delete(k);
    }
    return `/admin/events?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Event Management</h1>
        <p className="text-muted-foreground">
          {total} event{total !== 1 ? "s" : ""} total
        </p>
      </div>

      <Tabs value={statusFilter} className="w-auto">
        <TabsList>
          <TabsTrigger value="all" asChild>
            <Link href={buildUrl({ status: "", page: "1" })}>All</Link>
          </TabsTrigger>
          <TabsTrigger value="upcoming" asChild>
            <Link href={buildUrl({ status: "upcoming", page: "1" })}>
              Upcoming
            </Link>
          </TabsTrigger>
          <TabsTrigger value="in_progress" asChild>
            <Link href={buildUrl({ status: "in_progress", page: "1" })}>
              In Progress
            </Link>
          </TabsTrigger>
          <TabsTrigger value="completed" asChild>
            <Link href={buildUrl({ status: "completed", page: "1" })}>
              Completed
            </Link>
          </TabsTrigger>
          <TabsTrigger value="cancelled" asChild>
            <Link href={buildUrl({ status: "cancelled", page: "1" })}>
              Cancelled
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Organizer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Attendees</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No events found.
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <span className="font-medium line-clamp-1">
                      {event.title}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {event.profiles?.full_name ?? "Unknown"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(event.event_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="flex items-center justify-end gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {event.attendee_count}
                      {event.max_attendees
                        ? ` / ${event.max_attendees}`
                        : ""}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: EVENT_STATUS_COLORS[event.status],
                        color: EVENT_STATUS_COLORS[event.status],
                      }}
                    >
                      {EVENT_STATUS_LABELS[event.status] ?? event.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/events/${event.id}`} target="_blank">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </Link>
                      <EventActionButtons
                        eventId={event.id}
                        currentStatus={event.status}
                      />
                      <DeleteConfirmDialog
                        itemName={event.title}
                        onConfirm={async () => {
                          "use server";
                          return adminDeleteEvent(event.id);
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={buildUrl({ page: String(page - 1) })}>
                <Button variant="outline" size="sm">
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={buildUrl({ page: String(page + 1) })}>
                <Button variant="outline" size="sm">
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
