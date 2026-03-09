import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserPickups } from "@/lib/queries/collectors";
import { PickupBidActions } from "@/components/collectors/pickup-bid-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Package,
  Truck,
  Recycle,
  Clock,
  MessageSquare,
} from "lucide-react";
import {
  CATEGORY_LABELS,
  BID_STATUS_LABELS,
  BID_STATUS_COLORS,
} from "@/lib/constants";
import type { WasteCategory } from "@/types";

export const dynamic = "force-dynamic";

export default async function PickupsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/pickups");
  }

  const pickups = await getUserPickups(user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>
        <h1 className="text-2xl font-bold text-stone-900">My Pickups</h1>
        <p className="mt-1 text-sm text-stone-500">
          Track your pickup requests and collector bids
        </p>
      </div>

      {/* Empty state */}
      {pickups.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100">
              <Package className="h-6 w-6 text-stone-400" />
            </div>
            <h3 className="text-base font-semibold text-stone-700">
              No pickup requests yet
            </h3>
            <p className="mt-1 text-sm text-stone-500 max-w-sm mx-auto">
              When you request a cleanup or recycling pickup on one of your
              reports, it will appear here.
            </p>
            <Link
              href="/reports/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              Create a Report
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Pickup report cards */}
      <div className="space-y-5">
        {pickups.map((report) => {
          const isCleanup = report.pickup_type === "cleanup";
          const categoryLabel =
            CATEGORY_LABELS[report.category as WasteCategory] ||
            report.category;

          return (
            <Card key={report.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Report header */}
                <div className="border-b border-stone-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/reports/${report.id}`}
                        className="text-sm font-semibold text-stone-900 hover:text-emerald-700 transition-colors line-clamp-1"
                      >
                        {report.title}
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-medium"
                        >
                          {categoryLabel}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-medium ${
                            isCleanup
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-green-50 text-green-700 border-green-200"
                          }`}
                        >
                          {isCleanup ? (
                            <Truck className="h-3 w-3 mr-1" />
                          ) : (
                            <Recycle className="h-3 w-3 mr-1" />
                          )}
                          {isCleanup ? "Cleanup" : "Recycling"}
                        </Badge>
                        {report.hasAcceptedBid && (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-medium bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            Bid Accepted
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-stone-400 shrink-0">
                      {report.bids.length}{" "}
                      {report.bids.length === 1 ? "bid" : "bids"}
                    </span>
                  </div>
                </div>

                {/* Bids list */}
                {report.bids.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-stone-500">No bids yet</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Collectors will start{" "}
                      {isCleanup ? "bidding" : "making offers"} soon.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {report.bids.map((bid) => {
                      const statusColor =
                        BID_STATUS_COLORS[bid.status] || "#6b7280";
                      const statusLabel =
                        BID_STATUS_LABELS[bid.status] || bid.status;

                      return (
                        <div
                          key={bid.id}
                          className={`px-4 py-3 ${
                            bid.status === "accepted"
                              ? "bg-emerald-50/50"
                              : bid.status === "completed"
                                ? "bg-blue-50/50"
                                : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              {/* Collector name and status */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-stone-900 truncate">
                                  {bid.collector_name}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] font-medium"
                                  style={{
                                    color: statusColor,
                                    borderColor: statusColor + "40",
                                    backgroundColor: statusColor + "10",
                                  }}
                                >
                                  {statusLabel}
                                </Badge>
                              </div>

                              {/* Amount */}
                              <div className="mt-1">
                                <span className="text-lg font-bold text-stone-900">
                                  ₦{bid.bid_amount.toLocaleString()}
                                </span>
                                <span className="ml-2 text-xs text-stone-500">
                                  {isCleanup ? "You pay" : "You receive"}
                                </span>
                              </div>

                              {/* Meta: estimated time */}
                              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                                {bid.estimated_time && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1">
                                    <Clock className="h-3 w-3" />
                                    {bid.estimated_time}
                                  </span>
                                )}
                              </div>

                              {/* Notes */}
                              {bid.notes && (
                                <div className="mt-1.5 flex items-start gap-1.5 text-xs text-stone-500">
                                  <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                                  <p className="leading-relaxed">
                                    {bid.notes}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="shrink-0">
                              <PickupBidActions
                                bidId={bid.id}
                                bidStatus={bid.status}
                                reportId={report.id}
                                hasAcceptedBid={report.hasAcceptedBid}
                                hasReview={bid.has_review}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
