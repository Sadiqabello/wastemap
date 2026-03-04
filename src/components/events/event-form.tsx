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
  const [location, setLocation] = useState<[number, number] | null>(
    defaultLat && defaultLng ? [defaultLat, defaultLng] : null
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!location) {
      toast.error("Please select a location on the map");
      return;
    }

    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("latitude", String(location[0]));
    formData.set("longitude", String(location[1]));
    if (reportId) {
      formData.append("reportIds", reportId);
    }

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
              name="title"
              placeholder="Community Cleanup at..."
              required
              minLength={5}
              maxLength={100}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the cleanup event, what areas will be covered, what to expect..."
              required
              minLength={10}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_date">Date</Label>
              <Input
                id="event_date"
                name="event_date"
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="end_time">End Time (optional)</Label>
              <Input id="end_time" name="end_time" type="time" />
            </div>
            <div>
              <Label htmlFor="max_attendees">Max Attendees (optional)</Label>
              <Input
                id="max_attendees"
                name="max_attendees"
                type="number"
                min={1}
                placeholder="Unlimited"
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
              name="address"
              placeholder="Enter meeting point address"
              defaultValue={defaultAddress}
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
              name="tools_provided"
              placeholder="e.g., Trash bags, gloves, grabbers..."
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="tools_needed">
              Tools/Equipment Needed from Volunteers (optional)
            </Label>
            <Textarea
              id="tools_needed"
              name="tools_needed"
              placeholder="e.g., Bring your own water bottle, sunscreen..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={loading || !location}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Event
      </Button>
    </form>
  );
}
