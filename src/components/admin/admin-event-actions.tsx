"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AdminEditDialog } from "./admin-edit-dialog";
import { adminCreateEvent, adminEditEvent } from "@/lib/actions/admin";
import { Plus, Loader2 } from "lucide-react";

export function AdminCreateEventButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || "",
      event_date: formData.get("event_date") as string,
      address: (formData.get("address") as string) || undefined,
      max_attendees: formData.get("max_attendees")
        ? Number(formData.get("max_attendees"))
        : undefined,
      organizer_id: formData.get("organizer_id") as string,
    };
    const result = await adminCreateEvent(data);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Event created!");
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="event_date">Event Date *</Label>
              <Input
                id="event_date"
                name="event_date"
                type="datetime-local"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="max_attendees">Max Attendees</Label>
              <Input
                id="max_attendees"
                name="max_attendees"
                type="number"
                min={1}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              placeholder="Event location"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="organizer_id">Organizer User ID *</Label>
            <Input
              id="organizer_id"
              name="organizer_id"
              required
              placeholder="UUID of the organizer"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditProps {
  eventId: string;
  title: string;
  description?: string;
  eventDate: string;
  address?: string;
  maxAttendees?: number | null;
}

export function AdminEventEditButton({
  eventId,
  title,
  description,
  eventDate,
  address,
  maxAttendees,
}: EditProps) {
  return (
    <AdminEditDialog
      title={`Edit: ${title}`}
      triggerSize="icon"
      fields={[
        {
          name: "title",
          label: "Title",
          defaultValue: title,
          required: true,
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          defaultValue: description || "",
        },
        {
          name: "event_date",
          label: "Event Date",
          type: "date",
          defaultValue: eventDate?.split("T")[0],
        },
        {
          name: "address",
          label: "Address",
          defaultValue: address || "",
        },
        {
          name: "max_attendees",
          label: "Max Attendees",
          type: "number",
          defaultValue: maxAttendees,
        },
      ]}
      onSave={async (data) =>
        adminEditEvent(
          eventId,
          data as {
            title?: string;
            description?: string;
            event_date?: string;
            address?: string;
            max_attendees?: number | null;
          }
        )
      }
    />
  );
}
