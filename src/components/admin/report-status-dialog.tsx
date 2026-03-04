"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminBulkUpdateReportStatus } from "@/lib/actions/admin";
import { STATUS_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

interface ReportStatusDialogProps {
  reportId: string;
  currentStatus: string;
  reportTitle: string;
}

export function ReportStatusDialog({
  reportId,
  currentStatus,
  reportTitle,
}: ReportStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (status === currentStatus) {
      setOpen(false);
      return;
    }

    startTransition(async () => {
      const result = await adminBulkUpdateReportStatus([reportId], status);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Updated "${reportTitle}" status`);
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Status: {reportTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending || status === currentStatus}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
