import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Calendar, User, CalendarPlus, CheckCircle2, Banknote, Truck, Recycle, Info } from "lucide-react";
import { getReportById } from "@/lib/queries/reports";
import { getBidsForReport } from "@/lib/queries/collectors";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS, SEVERITY_LABELS, SEVERITY_COLORS } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const report = await getReportById(id);

  if (!report) {
    return { title: "Report Not Found" };
  }

  const categories = report.category.map((c) => CATEGORY_LABELS[c]).join(", ");
  const severity = SEVERITY_LABELS[report.severity];

  return {
    title: report.title,
    description: `${severity} severity waste report: ${categories}. ${report.address ? `Located at ${report.address}. ` : ""}View details, status updates, and community support on WasteMapNaija.`,
  };
}
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapContainer } from "@/components/map/map-container";
import { StatusBadge } from "@/components/reports/status-badge";
import { StatusTimeline } from "@/components/reports/status-timeline";
import { StatusChanger } from "@/components/reports/status-changer";
import { UpvoteButton } from "@/components/reports/upvote-button";
import { BeforeAfter } from "@/components/reports/before-after";
import { RequestPickup } from "@/components/reports/request-pickup";
import { ReportBids } from "@/components/reports/report-bids";
import { PlaceBidForm } from "@/components/collectors/place-bid-form";
import { ReviewDialog } from "@/components/collectors/review-dialog";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReportById(id);

  if (!report) {
    notFound();
  }

  // Check if current user is authority/admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let canChangeStatus = false;
  let isCollector = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    canChangeStatus =
      profile?.role === "authority" ||
      profile?.role === "admin" ||
      user.id === report.user_id;

    // Check if user is a verified collector
    const { data: collectorProfile } = await supabase
      .from("collector_profiles")
      .select("status")
      .eq("user_id", user.id)
      .single();
    isCollector = collectorProfile?.status === "verified";
  }

  const isOwner = user?.id === report.user_id;

  // Fetch bids if pickup is open
  const bids = report.pickup_type
    ? await getBidsForReport(report.id)
    : [];

  // Enrich bids with collector names
  const enrichedBids = [];
  for (const bid of bids) {
    const { data: cp } = await supabase
      .from("collector_profiles")
      .select("business_name, rating")
      .eq("user_id", bid.collector_id)
      .single();
    enrichedBids.push({
      ...bid,
      bid_type: (bid as unknown as { bid_type: string }).bid_type || "cleanup",
      collector_name: cp?.business_name || "Collector",
      collector_rating: cp?.rating || 0,
    });
  }

  const hasAcceptedBid = enrichedBids.some((b) => b.status === "accepted");

  const hasCleanupPhotos =
    report.cleanup_photo_urls && report.cleanup_photo_urls.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Map
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusBadge status={report.status} />
              <Badge
                className="text-white border-0"
                style={{ backgroundColor: SEVERITY_COLORS[report.severity] }}
              >
                {SEVERITY_LABELS[report.severity]}
              </Badge>
              {report.category.map((cat) => (
                <Badge key={cat} variant="outline">
                  {CATEGORY_LABELS[cat]}
                </Badge>
              ))}
            </div>
            <h1 className="text-2xl font-bold text-stone-900">
              {report.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-stone-500">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {report.profiles.full_name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(report.created_at).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              {report.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {report.address}
                </span>
              )}
            </div>
          </div>

          {/* Before/After Comparison */}
          {hasCleanupPhotos && (
            <BeforeAfter
              beforePhotos={report.photo_urls}
              afterPhotos={report.cleanup_photo_urls}
            />
          )}

          {/* Photos (only if no cleanup photos to avoid redundancy) */}
          {!hasCleanupPhotos && report.photo_urls.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {report.photo_urls.map((url, index) => (
                <div
                  key={url}
                  className={`relative overflow-hidden rounded-lg ${
                    report.photo_urls.length === 1
                      ? "col-span-2 aspect-video"
                      : "aspect-square"
                  }`}
                >
                  <Image
                    src={url}
                    alt={`Report photo ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-stone-700">
                {report.description}
              </p>
            </CardContent>
          </Card>

          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] overflow-hidden rounded-lg">
                <MapContainer
                  center={[report.latitude, report.longitude]}
                  zoom={15}
                  markers={[
                    {
                      id: report.id,
                      title: report.title,
                      latitude: report.latitude,
                      longitude: report.longitude,
                      category: report.category,
                      severity: report.severity,
                      status: report.status,
                    },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-stone-700">
                  Community Support
                </span>
                <UpvoteButton
                  reportId={report.id}
                  initialCount={report.upvote_count}
                  initialUpvoted={report.user_has_upvoted}
                />
              </div>
            </CardContent>
          </Card>

          {/* Create Cleanup Event from report */}
          {user && report.status !== "resolved" && (
            <Link href={`/events/new?reportId=${report.id}&lat=${report.latitude}&lng=${report.longitude}&address=${encodeURIComponent(report.address || "")}`}>
              <Button variant="outline" size="sm" className="w-full">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Organize Cleanup Event
              </Button>
            </Link>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline
                updates={report.status_updates}
                createdAt={report.created_at}
              />
            </CardContent>
          </Card>

          {canChangeStatus && (
            <StatusChanger
              reportId={report.id}
              currentStatus={report.status}
            />
          )}

          {/* Pickup Request / Bidding — for report owner */}
          {user && report.status !== "resolved" && (
            <RequestPickup
              reportId={report.id}
              category={report.category}
              currentPickupType={report.pickup_type}
              isOwner={isOwner}
            />
          )}

          {/* Pickup status indicator for non-owners (collectors visiting) */}
          {report.pickup_type && !isOwner && (
            <div
              className={`rounded-xl border-2 px-4 py-3 ${
                report.pickup_type === "cleanup"
                  ? "border-blue-200 bg-blue-50"
                  : "border-emerald-200 bg-emerald-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    report.pickup_type === "cleanup"
                      ? "bg-blue-100"
                      : "bg-emerald-100"
                  }`}
                >
                  {report.pickup_type === "cleanup" ? (
                    <Truck className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Recycle className="h-4 w-4 text-emerald-600" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      report.pickup_type === "cleanup"
                        ? "text-blue-800"
                        : "text-emerald-800"
                    }`}
                  >
                    {report.pickup_type === "cleanup"
                      ? "Cleanup Requested"
                      : "Open for Recycling Offers"}
                  </p>
                  <p
                    className={`text-xs ${
                      report.pickup_type === "cleanup"
                        ? "text-blue-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {report.pickup_type === "cleanup"
                      ? "The reporter needs someone to clean this up"
                      : "The reporter wants to sell these recyclable materials"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bid placement for collectors — PROMINENT POSITION */}
          {report.pickup_type && isCollector && !isOwner && !hasAcceptedBid && (
            <PlaceBidForm
              reportId={report.id}
              pickupType={report.pickup_type}
            />
          )}

          {/* Message when collector can't bid */}
          {report.pickup_type && !isOwner && user && !isCollector && (
            <Card className="border-stone-200">
              <CardContent className="py-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-stone-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-stone-700">
                      Want to bid on this pickup?
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      You need to be a verified waste collector to place bids.
                    </p>
                    <Link
                      href="/collectors/register"
                      className="mt-2 inline-block text-xs font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      Register as a Collector →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {report.pickup_type && hasAcceptedBid && isCollector && !isOwner && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="py-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-700">
                    A bid has already been accepted for this pickup.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bids list */}
          {report.pickup_type && (
            <ReportBids
              bids={enrichedBids}
              pickupType={report.pickup_type}
              isOwner={isOwner}
              hasAcceptedBid={hasAcceptedBid}
            />
          )}

          {/* Completed bid section */}
          {(() => {
            const completedBid = enrichedBids.find((b) => b.status === "completed");
            if (!completedBid) return null;
            return (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-5 pb-4 space-y-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold text-sm">Pickup completed!</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <Banknote className="h-4 w-4 text-stone-400" />
                    <span>
                      Amount: <span className="font-medium">₦{completedBid.bid_amount.toLocaleString()}</span>
                    </span>
                  </div>
                  {completedBid.completed_at && (
                    <p className="text-xs text-stone-500">
                      Completed on{" "}
                      {new Date(completedBid.completed_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  {isOwner && (
                    <ReviewDialog
                      bidId={completedBid.id}
                      collectorName={completedBid.collector_name}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
