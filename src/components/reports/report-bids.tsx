"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Clock,
  CheckCircle2,
  Star,
  MessageSquare,
  Truck,
  Recycle,
  Info,
} from "lucide-react";
import { acceptBid } from "@/lib/actions/collectors";
import { BID_STATUS_LABELS, BID_STATUS_COLORS } from "@/lib/constants";

interface Bid {
  id: string;
  collector_id: string;
  bid_amount: number;
  platform_fee: number;
  estimated_time: string | null;
  notes: string | null;
  status: string;
  bid_type: string;
  created_at: string;
  collector_name?: string;
  collector_rating?: number;
}

interface ReportBidsProps {
  bids: Bid[];
  pickupType: "cleanup" | "recycling";
  isOwner: boolean;
  hasAcceptedBid: boolean;
}

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-px" title={`${rating} / 5`}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="h-3 w-3 fill-amber-400 text-amber-400"
        />
      ))}
      {hasHalf && (
        <Star className="h-3 w-3 fill-amber-400/50 text-amber-400" />
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} className="h-3 w-3 text-stone-300" />
      ))}
    </span>
  );
}

export function ReportBids({
  bids,
  pickupType,
  isOwner,
  hasAcceptedBid,
}: ReportBidsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const isCleanup = pickupType === "cleanup";

  async function handleAccept(bidId: string) {
    setLoadingId(bidId);
    const result = await acceptBid(bidId);
    setLoadingId(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Bid accepted! The collector will be notified.");
    }
  }

  // ── Empty state ───────────────────────────────────────────────
  if (bids.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
            {isCleanup ? (
              <Truck className="h-5 w-5 text-stone-400" />
            ) : (
              <Recycle className="h-5 w-5 text-stone-400" />
            )}
          </div>
          <p className="text-sm font-medium text-stone-600">No bids yet</p>
          <p className="text-xs text-stone-400 mt-1">
            Collectors will start {isCleanup ? "bidding" : "making offers"}{" "}
            soon.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sortedBids = [...bids].sort((a, b) => {
    const statusOrder: Record<string, number> = {
      accepted: 0,
      pending: 1,
      rejected: 2,
      completed: 3,
      cancelled: 4,
    };
    return (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5);
  });

  // ── Status badge color mapping ────────────────────────────────
  function statusBadgeClasses(status: string) {
    switch (status) {
      case "accepted":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "rejected":
        return "bg-red-50 text-red-600 border-red-200";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "cancelled":
        return "bg-stone-100 text-stone-500 border-stone-200";
      default:
        return "bg-stone-100 text-stone-500 border-stone-200";
    }
  }

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-stone-900">
              Collector Bids ({bids.length})
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {isCleanup
                ? "Collectors offering cleanup services"
                : "Collectors offering to buy your recyclables"}
            </p>
          </div>
        </div>

        {/* Bid list */}
        <div className="space-y-3">
          {sortedBids.map((bid) => {
            const isAccepted = bid.status === "accepted";
            const isPending = bid.status === "pending";

            return (
              <div
                key={bid.id}
                className={`rounded-xl border-2 p-4 transition-all ${
                  isAccepted
                    ? "border-emerald-300 bg-emerald-50 shadow-sm"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                {/* Accepted banner */}
                {isAccepted && (
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-emerald-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-700">
                      Accepted Bid
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-4">
                  {/* Left: collector info */}
                  <div className="flex-1 min-w-0">
                    {/* Collector name + rating */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-stone-900 truncate">
                        {bid.collector_name || "Collector"}
                      </p>
                      {bid.collector_rating !== undefined &&
                        bid.collector_rating > 0 && (
                          <RatingStars rating={bid.collector_rating} />
                        )}
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium ${statusBadgeClasses(
                          bid.status
                        )}`}
                      >
                        {BID_STATUS_LABELS[bid.status]}
                      </Badge>
                    </div>

                    {/* Bid amount — prominent */}
                    <div className="mt-2">
                      <span className="text-xl font-bold text-stone-900">
                        ₦{bid.bid_amount.toLocaleString()}
                      </span>
                      <span className="ml-2 text-xs font-medium text-stone-500">
                        {isCleanup ? "You'll pay" : "You'll receive"}
                      </span>
                    </div>

                    {/* Meta row: time + notes */}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                      {bid.estimated_time && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1">
                          <Clock className="h-3 w-3" />
                          {bid.estimated_time}
                        </span>
                      )}
                    </div>

                    {bid.notes && (
                      <div className="mt-2 flex items-start gap-1.5 text-xs text-stone-500">
                        <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                        <p className="leading-relaxed">{bid.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Right: action */}
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {isOwner && isPending && !hasAcceptedBid && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-9 px-4"
                        onClick={() => handleAccept(bid.id)}
                        disabled={loadingId !== null}
                      >
                        {loadingId === bid.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        )}
                        Accept Bid
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment flow info */}
        {isOwner && !hasAcceptedBid && bids.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-stone-50 border border-stone-200 p-3">
            <Info className="h-4 w-4 text-stone-400 mt-0.5 shrink-0" />
            <p className="text-xs text-stone-500 leading-relaxed">
              {isCleanup
                ? "When you accept a bid and the collector completes the pickup, the bid amount will be deducted from your points."
                : "When you accept an offer and the collector picks up the materials, you will receive the offered amount as points."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
