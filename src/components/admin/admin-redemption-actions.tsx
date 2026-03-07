"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateRedemptionStatus } from "@/lib/actions/admin-rewards";
import { CheckCircle2, XCircle, RotateCcw, Loader2 } from "lucide-react";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  processing: { label: "Processing", className: "bg-blue-50 text-blue-700 border-blue-200" },
  completed: { label: "Completed", className: "bg-green-50 text-green-700 border-green-200" },
  failed: { label: "Failed", className: "bg-red-50 text-red-700 border-red-200" },
  refunded: { label: "Refunded", className: "bg-stone-50 text-stone-700 border-stone-200" },
};

interface AdminRedemptionActionsProps {
  redemptionId: string;
  currentStatus: string;
}

export function AdminRedemptionActions({ redemptionId, currentStatus }: AdminRedemptionActionsProps) {
  const [loading, setLoading] = useState(false);
  const status = STATUS_STYLES[currentStatus] || STATUS_STYLES.pending;

  async function handleUpdate(newStatus: string) {
    setLoading(true);
    const result = await updateRedemptionStatus(redemptionId, newStatus);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else toast.success(`Redemption ${newStatus}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={`text-[10px] ${status.className}`}>
        {status.label}
      </Badge>
      {currentStatus === "pending" && (
        <>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleUpdate("completed")}
            disabled={loading}
            className="h-7 w-7"
            title="Mark completed"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleUpdate("failed")}
            disabled={loading}
            className="h-7 w-7"
            title="Mark failed"
          >
            <XCircle className="h-3 w-3 text-red-500" />
          </Button>
        </>
      )}
      {currentStatus === "failed" && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleUpdate("refunded")}
          disabled={loading}
          className="h-7 w-7"
          title="Refund points"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3 text-amber-600" />}
        </Button>
      )}
    </div>
  );
}
