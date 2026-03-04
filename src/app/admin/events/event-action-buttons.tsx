"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { adminUpdateEventStatus } from "@/lib/actions/admin";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

interface EventActionButtonsProps {
  eventId: string;
  currentStatus: string;
}

export function EventActionButtons({
  eventId,
  currentStatus,
}: EventActionButtonsProps) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(newStatus: string) {
    startTransition(async () => {
      const result = await adminUpdateEventStatus(eventId, newStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Event updated to ${newStatus.replace("_", " ")}`);
      }
    });
  }

  if (currentStatus === "completed" || currentStatus === "cancelled") {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
        onClick={() => handleStatusChange("completed")}
        disabled={isPending}
      >
        <CheckCircle className="h-3.5 w-3.5" />
        Complete
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => handleStatusChange("cancelled")}
        disabled={isPending}
      >
        <XCircle className="h-3.5 w-3.5" />
        Cancel
      </Button>
    </>
  );
}
