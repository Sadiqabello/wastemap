"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, Ban } from "lucide-react";
import { updateCollectorStatus } from "@/lib/actions/admin-collectors";

interface AdminCollectorReviewFormProps {
  collectorId: string;
  currentStatus: string;
}

export function AdminCollectorReviewForm({
  collectorId,
  currentStatus,
}: AdminCollectorReviewFormProps) {
  const [reviewNote, setReviewNote] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(status: "verified" | "rejected" | "suspended") {
    if ((status === "rejected" || status === "suspended") && !reviewNote.trim()) {
      toast.error("Please provide a review note explaining the reason.");
      return;
    }

    setLoading(status);
    const result = await updateCollectorStatus(collectorId, status, reviewNote.trim() || undefined);
    setLoading(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        status === "verified"
          ? "Collector verified successfully!"
          : status === "rejected"
            ? "Application rejected. The user will be notified."
            : "Collector suspended."
      );
      setReviewNote("");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Review Decision</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="review_note">
            Review Note {currentStatus !== "verified" && "(required for rejection/suspension)"}
          </Label>
          <textarea
            id="review_note"
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            rows={3}
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Provide feedback to the collector. E.g.: 'Please provide a valid CAC registration number and update your service area address.'"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            This note will be visible to the collector on their dashboard.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {currentStatus !== "verified" && (
            <Button
              onClick={() => handleAction("verified")}
              disabled={loading !== null}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading === "verified" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Approve & Verify
            </Button>
          )}
          {currentStatus !== "rejected" && currentStatus !== "verified" && (
            <Button
              variant="outline"
              onClick={() => handleAction("rejected")}
              disabled={loading !== null}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              {loading === "rejected" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Reject Application
            </Button>
          )}
          {currentStatus !== "suspended" && (
            <Button
              variant="outline"
              onClick={() => handleAction("suspended")}
              disabled={loading !== null}
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              {loading === "suspended" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Ban className="mr-2 h-4 w-4" />
              )}
              Suspend
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
