import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  ThumbsUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { getDumpSiteById } from "@/lib/queries/dump-sites";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://wastemapnaija.com.ng";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const site = await getDumpSiteById(id);

  if (!site) {
    return {
      title: "Dump Site Not Found",
      robots: { index: false, follow: false },
    };
  }

  const description = `${site.name} — verified ${site.site_type.replace(/_/g, " ")} in Nigeria${
    site.address ? `, located at ${site.address}` : ""
  }. ${site.description ? site.description.slice(0, 140) : "Official waste disposal location verified on WasteMapNaija."}`;

  return {
    title: `${site.name} — Verified ${site.site_type.replace(/_/g, " ")}`,
    description,
    alternates: { canonical: `/dump-sites/${id}` },
    openGraph: {
      title: site.name,
      description,
      url: `/dump-sites/${id}`,
      type: "article",
      images:
        site.photo_urls && site.photo_urls.length > 0
          ? [{ url: site.photo_urls[0], width: 1200, height: 630, alt: site.name }]
          : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: site.name,
      description,
      images: site.photo_urls?.[0] ? [site.photo_urls[0]] : undefined,
    },
  };
}
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapContainer } from "@/components/map/map-container";
import {
  DUMP_SITE_TYPE_LABELS,
  DUMP_SITE_TYPE_COLORS,
  DUMP_SITE_STATUS_LABELS,
} from "@/lib/constants";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  verified: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-600",
  closed: "bg-stone-100 text-stone-600",
};

export default async function DumpSiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await getDumpSiteById(id);

  if (!site) {
    notFound();
  }

  const typeColor = DUMP_SITE_TYPE_COLORS[site.site_type];
  const typeLabel = DUMP_SITE_TYPE_LABELS[site.site_type];
  const statusLabel = DUMP_SITE_STATUS_LABELS[site.status] ?? site.status;
  const statusStyle = STATUS_STYLES[site.status] ?? STATUS_STYLES.pending;
  const createdDate = new Date(site.created_at);

  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": `${siteUrl}/dump-sites/${site.id}#place`,
    name: site.name,
    description: site.description || `${typeLabel} in Nigeria`,
    additionalType: "https://schema.org/CivicStructure",
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.latitude,
      longitude: site.longitude,
    },
    ...(site.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: site.address,
            addressCountry: "NG",
          },
        }
      : {}),
    ...(site.operating_hours
      ? { openingHours: site.operating_hours }
      : {}),
    image:
      site.photo_urls && site.photo_urls.length > 0
        ? site.photo_urls
        : undefined,
    publicAccess: true,
    isAccessibleForFree: site.is_free,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Dump Sites",
        item: `${siteUrl}/dump-sites`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: site.name,
        item: `${siteUrl}/dump-sites/${site.id}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Link href="/dump-sites">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Dump Sites
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge
                className="border-0 text-xs text-white"
                style={{ backgroundColor: typeColor }}
              >
                {typeLabel}
              </Badge>
              <Badge className={`border-0 text-xs ${statusStyle}`}>
                {statusLabel}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-stone-900">{site.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-stone-500">
              {site.profiles?.full_name && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {site.profiles.full_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {createdDate.toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              {site.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {site.address}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {site.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">About this Site</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-stone-700">
                  {site.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Photos */}
          {site.photo_urls && site.photo_urls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {site.photo_urls.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-lg border"
                    >
                      <Image
                        src={url}
                        alt={`${site.name} photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] overflow-hidden rounded-lg">
                <MapContainer
                  center={[site.latitude, site.longitude]}
                  zoom={15}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Free or paid */}
              <div className="flex items-center gap-2 text-sm">
                {site.is_free ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="text-stone-700">Free to use</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-stone-700">Fees may apply</span>
                  </>
                )}
              </div>

              {/* Operating hours */}
              {site.operating_hours && (
                <div>
                  <p className="text-xs font-semibold text-stone-500">
                    Operating Hours
                  </p>
                  <p className="mt-0.5 text-sm text-stone-700">
                    {site.operating_hours}
                  </p>
                </div>
              )}

              {/* Upvotes */}
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <ThumbsUp className="h-4 w-4" />
                <span>
                  {site.upvote_count}{" "}
                  {site.upvote_count === 1 ? "upvote" : "upvotes"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Accepted waste types */}
          {site.accepts && site.accepts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Accepted Waste Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {site.accepts.map((type) => (
                    <Badge
                      key={type}
                      variant="secondary"
                      className="text-xs capitalize"
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
