"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Clock,
  Banknote,
  Truck,
  Recycle,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { completeBid } from "@/lib/actions/collectors";
import { BID_STATUS_LABELS, BID_STATUS_COLORS } from "@/lib/constants";
import type { BidWithReport } from "@/types";

const STATUS_BORDER_COLORS: Record<string, string> = {
  accepted: "border-l-green-500",
  pending: "border-l-yellow-400",
  completed: "border-l-blue-500",
  rejected: "border-l-stone-300",
  cancelled: "border-l-stone-300",
};

interface BidCardProps {
  bid: BidWithReport;
  isCollector?: boolean;
}

export function BidCard({ bid, isCollector }: BidCardProps) {
  const [completing, setCompleting] = useState(false);

  async function handleComplete() {
    setCompleting(true);
    const result = await completeBid(bid.id);
    setCompleting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Pickup marked as completed!");
    }
  }

  const borderClass = STATUS_BORDER_COLORS[bid.status] || "border-l-stone-300";

  return (
    <Card className={`border-l-4 ${borderClass} overflow-hidden`}>
      <CardContent className="px-4 py-3">
        {/* Completed banner */}
        {bid.status === "completed" && (
          <div className="mb-3 -mx-4 -mt-3 px-4 py-2.5 bg-green-50 border-b border-green-100">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-semibold">Completed</span>
            </div>
            {bid.completed_at && (
              <p className="text-xs text-green-600 mt-0.5 ml-6">
                {new Date(bid.completed_at).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-1 ml-6">
              <Banknote className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs text-green-700 font-medium">
                Earned: ₦{(bid.bid_amount - bid.platform_fee).toLocaleString()}
              </span>
              {bid.platform_fee > 0 && (
                <span className="text-xs text-stone-400">
                  (fee: ₦{bid.platform_fee.toLocaleString()})
                </span>
              )}
            </div>
          </div>
        )}

        {/* Top row: title + amount */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-stone-900 truncate">
              {bid.reports?.title || "Waste Report"}
            </p>
            <p className="text-xs text-stone-500 mt-0.5 truncate">
              {bid.reports?.address || "Unknown location"}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-base font-bold text-stone-900">
              ₦{bid.bid_amount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Middle row: badges and metadata */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={`text-[10px] ${
              bid.bid_type === "recycling"
                ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                : "text-blue-600 border-blue-200 bg-blue-50"
            }`}
          >
            {bid.bid_type === "recycling" ? (
              <>
                <Recycle className="h-2.5 w-2.5 mr-0.5" /> Recycling
              </>
            ) : (
              <>
                <Truck className="h-2.5 w-2.5 mr-0.5" /> Cleanup
              </>
            )}
          </Badge>

          <Badge
            variant="outline"
            className="text-[10px]"
            style={{
              color: BID_STATUS_COLORS[bid.status],
              borderColor: BID_STATUS_COLORS[bid.status] + "40",
            }}
          >
            {BID_STATUS_LABELS[bid.status]}
          </Badge>

          {bid.estimated_time && (
            <span className="flex items-center gap-1 text-[11px] text-stone-500">
              <Clock className="h-3 w-3" />
              {bid.estimated_time}
            </span>
          )}
        </div>

        {/* Bottom row: actions */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <Link
            href={`/reports/${bid.report_id}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            View Report
            <ExternalLink className="h-3 w-3" />
          </Link>

          {isCollector && bid.status === "accepted" && (
            <Button
              size="sm"
              className="text-xs h-8 bg-green-600 hover:bg-green-700 text-white gap-1.5"
              onClick={handleComplete}
              disabled={completing}
            >
              {completing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3 w-3" />
              )}
              Mark Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
