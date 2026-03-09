export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAllEventsAdmin, getEventStatusCounts } from "@/lib/queries/admin";
import { adminDeleteEvent } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearch } from "@/components/admin/admin-search";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import {
  AdminCreateEventButton,
  AdminEventEditButton,
} from "@/components/admin/admin-event-actions";
import { EventActionButtons } from "./event-action-buttons";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  ExternalLink,
  PlayCircle,
  Users,
} from "lucide-react";

const PAGE_SIZE = 20;

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

const STATUS_FILTER_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

interface EventsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminEventsPage({
  searchParams,
}: EventsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const statusFilter = params.status ?? "all";
  const search = params.q ?? "";

  const [{ events, total }, statusCounts] = await Promise.all([
    getAllEventsAdmin(page, statusFilter, search),
    getEventStatusCounts(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Events Management"
        description={`${total} event${total !== 1 ? "s" : ""} found`}
      >
        <AdminCreateEventButton />
      </AdminPageHeader>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          title="Total Events"
          value={statusCounts.total}
          icon={CalendarDays}
        />
        <AdminStatCard
          title="Upcoming"
          value={statusCounts.upcoming}
          icon={Clock}
        />
        <AdminStatCard
          title="In Progress"
          value={statusCounts.in_progress}
          icon={PlayCircle}
        />
        <AdminStatCard
          title="Completed"
          value={statusCounts.completed}
          icon={CheckCircle2}
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminSearch placeholder="Search events by title..." />
        <AdminFilterBar
          filters={[
            {
              paramName: "status",
              label: "Status",
              options: STATUS_FILTER_OPTIONS,
            },
          ]}
        />
      </div>

      {/* Events Table */}
      {events.length === 0 ? (
        <AdminEmptyState
          icon={CalendarDays}
          title="No events found"
          description={
            search || statusFilter !== "all"
              ? "Try adjusting your search or filters."
              : "No events have been created yet."
          }
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Organizer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Attendees</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium line-clamp-1">
                        {event.title}
                      </span>
                      {event.address && (
                        <span className="block text-xs text-muted-foreground line-clamp-1">
                          {event.address}
                        </span>
                      )}
                    </div>
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
                      <AdminEventEditButton
                        eventId={event.id}
                        title={event.title}
                        description={event.description ?? undefined}
                        eventDate={event.event_date}
                        address={event.address ?? undefined}
                        maxAttendees={event.max_attendees ?? undefined}
                      />
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
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      <AdminPagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
