"use client";

import { useState } from "react";
import { toast } from "sonner";
import { joinEvent, leaveEvent } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Star, X } from "lucide-react";

interface JoinButtonProps {
  eventId: string;
  isAttending: boolean;
  currentStatus: string | null;
  isFull: boolean;
}

export function JoinButton({
  eventId,
  isAttending,
  currentStatus,
  isFull,
}: JoinButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleJoin(status: "going" | "interested") {
    setLoading(true);
    const result = await joinEvent(eventId, status);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(
        status === "going" ? "You're going!" : "Marked as interested"
      );
    }
    setLoading(false);
  }

  async function handleLeave() {
    setLoading(true);
    const result = await leaveEvent(eventId);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("RSVP removed");
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <Button disabled size="sm" className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Updating...
      </Button>
    );
  }

  if (isAttending) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2">
          <Check className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">
            {currentStatus === "going" ? "You're going!" : "You're interested"}
          </span>
        </div>
        <div className="flex gap-2">
          {currentStatus !== "going" && (
            <Button
              onClick={() => handleJoin("going")}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <Check className="mr-1 h-3 w-3" />
              Going
            </Button>
          )}
          {currentStatus !== "interested" && (
            <Button
              onClick={() => handleJoin("interested")}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <Star className="mr-1 h-3 w-3" />
              Interested
            </Button>
          )}
          <Button
            onClick={handleLeave}
            size="sm"
            variant="ghost"
            className="text-red-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => handleJoin("going")}
        size="sm"
        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
        disabled={isFull}
      >
        <Check className="mr-1 h-4 w-4" />
        {isFull ? "Event Full" : "Going"}
      </Button>
      <Button
        onClick={() => handleJoin("interested")}
        size="sm"
        variant="outline"
        className="flex-1"
      >
        <Star className="mr-1 h-4 w-4" />
        Interested
      </Button>
    </div>
  );
}
