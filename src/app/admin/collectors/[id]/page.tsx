import { notFound } from "next/navigation";
import Link from "next/link";
import { getCollectorByIdAdmin, getCollectorBids, getCollectorReviews } from "@/lib/queries/collectors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { COLLECTOR_STATUS_LABELS, CATEGORY_LABELS } from "@/lib/constants";
import {
  Truck, Star, Package, Banknote, MapPin, Phone, FileText,
  Clock, ArrowLeft, User,
} from "lucide-react";
import { AdminCollectorReviewForm } from "@/components/admin/admin-collector-review-form";

export const dynamic = "force-dynamic";

const STATUS_BADGE_CLASSES: Record<string, string> = {
  verified: "border-emerald-300 bg-emerald-50 text-emerald-700",
  pending: "border-amber-300 bg-amber-50 text-amber-700",
  rejected: "border-red-300 bg-red-50 text-red-700",
  suspended: "border-orange-300 bg-orange-50 text-orange-700",
};

const BID_STATUS_CLASSES: Record<string, string> = {
  completed: "border-emerald-300 bg-emerald-50 text-emerald-700",
  accepted: "border-blue-300 bg-blue-50 text-blue-700",
  pending: "border-amber-300 bg-amber-50 text-amber-700",
  rejected: "border-red-300 bg-red-50 text-red-700",
  cancelled: "border-stone-300 bg-stone-50 text-stone-500",
};

export default async function AdminCollectorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collector = await getCollectorByIdAdmin(id);
  if (!collector) notFound();

  const [bids, reviews] = await Promise.all([
    getCollectorBids(collector.user_id),
    getCollectorReviews(collector.id),
  ]);

  const completedBids = bids.filter((b) => b.status === "completed");
  const activeBids = bids.filter((b) => b.status === "pending" || b.status === "accepted");
  const isPending = collector.status === "pending";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/collectors"
          className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-stone-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{collector.business_name}</h1>
            <Badge
              variant="outline"
              className={STATUS_BADGE_CLASSES[collector.status] || ""}
            >
              {COLLECTOR_STATUS_LABELS[collector.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Collector Application Details
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Package className="h-5 w-5 mx-auto mb-1 text-stone-400" />
            <p className="text-xl font-bold">{collector.total_pickups}</p>
            <p className="text-[10px] text-stone-500">Total Pickups</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Star className="h-5 w-5 mx-auto mb-1 text-amber-500" />
            <p className="text-xl font-bold">{collector.rating || "N/A"}</p>
            <p className="text-[10px] text-stone-500">Average Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Banknote className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-xl font-bold">
              ₦{(collector.total_earnings || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-stone-500">Total Earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Star className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-xl font-bold">{reviews.length}</p>
            <p className="text-[10px] text-stone-500">Customer Reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Review Form - prominent position for pending collectors */}
      {isPending && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50/50 p-1">
          <AdminCollectorReviewForm
            collectorId={collector.id}
            currentStatus={collector.status}
          />
        </div>
      )}

      {/* Application Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                Applicant
              </p>
              <p className="text-sm font-medium flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-stone-400" />
                {collector.profiles?.full_name || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                Business Name
              </p>
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-stone-400" />
                {collector.business_name}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                Business Registration (CAC)
              </p>
              <p className="text-sm">
                {collector.business_registration || (
                  <span className="text-stone-400 italic">Not provided</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                Phone Number
              </p>
              <p className="text-sm flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-stone-400" />
                {collector.phone || (
                  <span className="text-stone-400 italic">Not provided</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                Service Area
              </p>
              <p className="text-sm flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-stone-400" />
                {collector.address || "No address"} ({collector.service_area_radius} km radius)
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                Applied On
              </p>
              <p className="text-sm flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-stone-400" />
                {new Date(collector.created_at).toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Description */}
          {collector.description && (
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                About Their Service
              </p>
              <div className="rounded-lg bg-stone-50 p-3 text-sm">
                <FileText className="h-3.5 w-3.5 text-stone-400 inline mr-1.5" />
                {collector.description}
              </div>
            </div>
          )}

          {/* Waste Categories */}
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">
              Waste Categories
            </p>
            <div className="flex flex-wrap gap-1.5">
              {collector.waste_categories.map((cat) => (
                <Badge key={cat} variant="outline" className="text-xs">
                  {(CATEGORY_LABELS as Record<string, string>)[cat] || cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Previous Review Note */}
          {collector.review_note && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-medium text-amber-800 uppercase tracking-wider mb-1">
                Last Review Note
                {collector.reviewed_at && (
                  <span className="normal-case font-normal ml-2 text-amber-600">
                    ({new Date(collector.reviewed_at).toLocaleDateString("en-NG")})
                  </span>
                )}
              </p>
              <p className="text-sm text-amber-900">{collector.review_note}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form - standard position for non-pending collectors */}
      {!isPending && (
        <AdminCollectorReviewForm
          collectorId={collector.id}
          currentStatus={collector.status}
        />
      )}

      {/* Active Bids */}
      {activeBids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Active Bids ({activeBids.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Bid Amount</TableHead>
                    <TableHead>Est. Time</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeBids.map((bid) => (
                    <TableRow key={bid.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(bid.created_at).toLocaleDateString("en-NG")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {bid.bid_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${BID_STATUS_CLASSES[bid.status] || ""}`}
                        >
                          {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        ₦{bid.bid_amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {bid.estimated_time || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {bid.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pickup History Table */}
      {completedBids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Pickup History ({completedBids.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Fee (15%)</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedBids.map((bid) => (
                    <TableRow key={bid.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {bid.completed_at
                          ? new Date(bid.completed_at).toLocaleDateString("en-NG")
                          : new Date(bid.created_at).toLocaleDateString("en-NG")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {bid.bid_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        ₦{bid.bid_amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        ₦{bid.platform_fee.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium text-emerald-700">
                        ₦{(bid.bid_amount - bid.platform_fee).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Reviews */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Customer Reviews ({reviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviews.map((review: { id: string; rating: number; comment: string | null; created_at: string; reviewer_id: string }) => (
              <div
                key={review.id}
                className="rounded-lg border p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-stone-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {review.rating}/5
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
