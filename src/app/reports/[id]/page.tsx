import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Calendar, User, CalendarPlus } from "lucide-react";
import { getReportById } from "@/lib/queries/reports";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS, SEVERITY_LABELS, SEVERITY_COLORS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapContainer } from "@/components/map/map-container";
import { StatusBadge } from "@/components/reports/status-badge";
import { StatusTimeline } from "@/components/reports/status-timeline";
import { StatusChanger } from "@/components/reports/status-changer";
import { UpvoteButton } from "@/components/reports/upvote-button";
import { BeforeAfter } from "@/components/reports/before-after";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const report = await getReportById(id);

  if (!report) {
    return { title: "Report Not Found", robots: { index: false, follow: false } };
  }

  const categories = report.category.map((c) => CATEGORY_LABELS[c]).join(", ");
  const severity = SEVERITY_LABELS[report.severity];
  const description = `${severity} severity waste report: ${categories}.${
    report.address ? ` Located at ${report.address}.` : ""
  } View details, status updates, and community support on WasteMapNaija.`;

  const firstPhoto = report.photo_urls?.[0];

  return {
    title: report.title,
    description,
    alternates: { canonical: `/reports/${id}` },
    openGraph: {
      title: report.title,
      description,
      url: `/reports/${id}`,
      type: "article",
      images: firstPhoto
        ? [{ url: firstPhoto, width: 1200, height: 630, alt: report.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: report.title,
      description,
      images: firstPhoto ? [firstPhoto] : undefined,
    },
    robots: { index: false, follow: false },
  };
}

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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let canChangeStatus = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    canChangeStatus =
      profile?.role === "authority" ||
      profile?.role === "admin" ||
      user.id === report.user_id;
  }

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

          {hasCleanupPhotos && (
            <BeforeAfter
              beforePhotos={report.photo_urls}
              afterPhotos={report.cleanup_photo_urls}
            />
          )}

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

          {user && report.status !== "resolved" && (
            <Link
              href={`/events/new?reportId=${report.id}&lat=${report.latitude}&lng=${report.longitude}&address=${encodeURIComponent(report.address || "")}`}
            >
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
        </div>
      </div>
    </div>
  );
}
