"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateReportStatus } from "@/lib/actions/reports";
import { STATUS_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhotoUploader } from "@/components/reports/photo-uploader";
import { Loader2 } from "lucide-react";
import type { ReportStatus } from "@/types";
import { useAuth } from "@/providers/auth-provider";

const STATUS_ORDER: ReportStatus[] = [
  "reported",
  "acknowledged",
  "cleanup_scheduled",
  "in_progress",
  "resolved",
];

interface StatusChangerProps {
  reportId: string;
  currentStatus: ReportStatus;
}

export function StatusChanger({ reportId, currentStatus }: StatusChangerProps) {
  const { user } = useAuth();
  const [newStatus, setNewStatus] = useState<ReportStatus | "">("");
  const [comment, setComment] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const availableStatuses = STATUS_ORDER.filter((s) => s !== currentStatus);
  const showPhotoUpload = newStatus === "resolved" || newStatus === "in_progress";

  async function handleSubmit() {
    if (!newStatus) {
      toast.error("Please select a new status");
      return;
    }

    setLoading(true);
    const result = await updateReportStatus(
      reportId,
      newStatus,
      comment || undefined,
      photoUrls.length > 0 ? photoUrls : undefined
    );

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Status updated successfully");
      setNewStatus("");
      setComment("");
      setPhotoUrls([]);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-3 rounded-lg border bg-stone-50 p-4">
      <h4 className="text-sm font-semibold text-stone-900">Update Status</h4>
      <Select
        value={newStatus}
        onValueChange={(val) => setNewStatus(val as ReportStatus)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select new status" />
        </SelectTrigger>
        <SelectContent>
          {availableStatuses.map((status) => (
            <SelectItem key={status} value={status}>
              {STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea
        placeholder="Add a comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
      />
      {showPhotoUpload && user && (
        <div className="rounded-md border bg-white p-3">
          <p className="mb-2 text-xs font-medium text-stone-600">
            {newStatus === "resolved"
              ? "Add cleanup photos to show the improvement"
              : "Add progress photos"}
          </p>
          <PhotoUploader
            userId={user.id}
            value={photoUrls}
            onChange={setPhotoUrls}
            maxPhotos={4}
          />
        </div>
      )}
      <Button
        onClick={handleSubmit}
        disabled={!newStatus || loading}
        size="sm"
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Update Status
      </Button>
    </div>
  );
}
