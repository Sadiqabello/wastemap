"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
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

interface BulkStatusBarProps {
  selectedIds: string[];
  onClear: () => void;
}

export function BulkStatusBar({ selectedIds, onClear }: BulkStatusBarProps) {
  const [status, setStatus] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  if (selectedIds.length === 0) return null;

  function handleApply() {
    if (!status) {
      toast.error("Select a status first.");
      return;
    }

    startTransition(async () => {
      const result = await adminBulkUpdateReportStatus(selectedIds, status);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Updated ${selectedIds.length} report(s)`);
        onClear();
        setStatus("");
      }
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-white p-3">
      <span className="text-sm font-medium">
        {selectedIds.length} selected
      </span>
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Change status to..." />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        onClick={handleApply}
        disabled={isPending || !status}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        {isPending ? "Applying..." : "Apply"}
      </Button>
      <Button variant="ghost" size="sm" onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}
