"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { completeEvent } from "@/lib/actions/events";

interface CompleteEventButtonProps {
  eventId: string;
}

export function CompleteEventButton({ eventId }: CompleteEventButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleComplete() {
    if (!confirm("Mark this event as completed? All attendees will receive points.")) {
      return;
    }
    setLoading(true);
    const result = await completeEvent(eventId);
    setLoading(false);

    if (result.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  }

  return (
    <Button
      onClick={handleComplete}
      disabled={loading}
      className="w-full bg-emerald-600 hover:bg-emerald-700"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle className="mr-2 h-4 w-4" />
      )}
      Mark as Completed
    </Button>
  );
}
