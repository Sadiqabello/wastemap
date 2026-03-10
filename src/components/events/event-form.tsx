"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createEvent } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationPicker } from "@/components/map/location-picker";
import { Loader2 } from "lucide-react";

interface EventFormProps {
  defaultLat?: number;
  defaultLng?: number;
  defaultAddress?: string;
  reportId?: string;
}

export function EventForm({
  defaultLat,
  defaultLng,
  defaultAddress,
  reportId,
}: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [address, setAddress] = useState(defaultAddress || "");
  const [toolsProvided, setToolsProvided] = useState("");
  const [toolsNeeded, setToolsNeeded] = useState("");
  const [location, setLocation] = useState<[number, number] | null>(
    defaultLat && defaultLng ? [defaultLat, defaultLng] : null
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim() || title.trim().length < 5) {
      toast.error("Title must be at least 5 characters");
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }
    if (!eventDate) {
      toast.error("Please select a date");
      return;
    }
    if (!startTime) {
      toast.error("Please select a start time");
      return;
    }
    if (!location) {
      toast.error("Please select a location on the map");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.set("title", title.trim());
    formData.set("description", description.trim());
    formData.set("event_date", eventDate);
    formData.set("start_time", startTime);
    if (endTime) formData.set("end_time", endTime);
    formData.set("latitude", String(location[0]));
    formData.set("longitude", String(location[1]));
    if (address.trim()) formData.set("address", address.trim());
    if (maxAttendees) formData.set("max_attendees", maxAttendees);
    if (toolsProvided.trim()) formData.set("tools_provided", toolsProvided.trim());
    if (toolsNeeded.trim()) formData.set("tools_needed", toolsNeeded.trim());
    if (reportId) formData.append("reportIds", reportId);

    const result = await createEvent(formData);

    if (result?.error) {
      toast.error(
        typeof result.error === "string"
          ? result.error
          : "Please check the form fields"
      );
      setLoading(false);
    } else {
      toast.success("Event created successfully!");
      router.push("/events");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              placeholder="Community Cleanup at..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the cleanup event, what areas will be covered, what to expect..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_date">Date</Label>
              <Input
                id="event_date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="end_time">End Time (optional)</Label>
              <Input
                id="end_time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="max_attendees">Max Attendees (optional)</Label>
              <Input
                id="max_attendees"
                type="number"
                min={1}
                placeholder="Unlimited"
                value={maxAttendees}
                onChange={(e) => setMaxAttendees(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Address (optional)</Label>
            <Input
              id="address"
              placeholder="Enter meeting point address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <LocationPicker
            value={location}
            onChange={(lat, lng) => setLocation([lat, lng])}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Equipment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tools_provided">
              Tools/Equipment Provided (optional)
            </Label>
            <Textarea
              id="tools_provided"
              placeholder="e.g., Trash bags, gloves, grabbers..."
              value={toolsProvided}
              onChange={(e) => setToolsProvided(e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="tools_needed">
              Tools/Equipment Needed from Volunteers (optional)
            </Label>
            <Textarea
              id="tools_needed"
              placeholder="e.g., Bring your own water bottle, sunscreen..."
              value={toolsNeeded}
              onChange={(e) => setToolsNeeded(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Event
      </Button>
    </form>
  );
}
