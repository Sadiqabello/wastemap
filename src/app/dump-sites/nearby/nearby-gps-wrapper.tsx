"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Loader2, MapPinOff, Navigation, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DUMP_SITE_TYPE_LABELS,
  DUMP_SITE_TYPE_COLORS,
} from "@/lib/constants";
import type { DumpSiteRow } from "@/types/database";

const NearbyMap = dynamic(
  () => import("@/components/dump-sites/nearby-map"),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-[350px] sm:h-[420px] w-full rounded-xl" />
    ),
  }
);

interface NearbyGpsWrapperProps {
  sites: DumpSiteRow[];
}

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export function NearbyGpsWrapper({ sites }: NearbyGpsWrapperProps) {
  const [position, setPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError(
              "Location permission denied. Please enable location access to find nearby sites."
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.");
            break;
          case err.TIMEOUT:
            setError("Location request timed out. Please try again.");
            break;
          default:
            setError(
              "An unknown error occurred while getting your location."
            );
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 30000 }
    );
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-stone-500">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-sm">Getting your location...</p>
      </div>
    );
  }

  if (error || !position) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border bg-stone-50 py-12 text-center">
        <MapPinOff className="mb-3 h-10 w-10 text-stone-300" />
        <p className="text-sm text-stone-500">
          {error || "Could not determine your location."}
        </p>
      </div>
    );
  }

  // Sort sites by distance
  const sitesWithDistance = sites
    .map((site) => ({
      site,
      distance: haversineDistance(
        position.lat,
        position.lng,
        site.latitude,
        site.longitude
      ),
    }))
    .sort((a, b) => a.distance - b.distance);

  return (
    <div className="space-y-4">
      {/* Map */}
      <NearbyMap
        userLat={position.lat}
        userLng={position.lng}
        sites={sites}
        selectedSiteId={selectedSiteId}
        onSelectSite={setSelectedSiteId}
      />

      {/* Site count */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-700">
          {sitesWithDistance.length} disposal site
          {sitesWithDistance.length !== 1 ? "s" : ""} found
        </p>
        <p className="text-xs text-stone-400">
          Sorted by distance
        </p>
      </div>

      {/* Sites list */}
      {sitesWithDistance.length === 0 ? (
        <div className="rounded-xl border border-dashed py-10 text-center">
          <p className="text-sm text-stone-500">
            No dump sites found nearby.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sitesWithDistance.map(({ site, distance }) => {
            const typeColor = DUMP_SITE_TYPE_COLORS[site.site_type];
            const typeLabel = DUMP_SITE_TYPE_LABELS[site.site_type];
            const isSelected = site.id === selectedSiteId;

            return (
              <Card
                key={site.id}
                className={`transition-all cursor-pointer ${
                  isSelected
                    ? "border-emerald-400 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-200"
                    : "hover:bg-stone-50 hover:border-stone-300"
                }`}
                onClick={() =>
                  setSelectedSiteId(isSelected ? null : site.id)
                }
              >
                <CardContent className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          className="border-0 text-[10px] text-white"
                          style={{ backgroundColor: typeColor }}
                        >
                          {typeLabel}
                        </Badge>
                        {site.is_free && (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-emerald-700 border-emerald-200 bg-emerald-50"
                          >
                            Free
                          </Badge>
                        )}
                      </div>
                      <h3 className="truncate font-medium text-stone-900 text-sm">
                        {site.name}
                      </h3>
                      {site.address && (
                        <p className="text-xs text-stone-400 truncate mt-0.5">
                          {site.address}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
                        <Navigation className="h-3 w-3" />
                        <span>{formatDistance(distance)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isSelected && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&origin=${position.lat},${position.lng}&destination=${site.latitude},${site.longitude}&travelmode=driving`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="h-2.5 w-2.5" />
                            Google Maps
                          </a>
                        )}
                        <Link
                          href={`/dump-sites/${site.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-medium text-stone-500 hover:text-stone-700"
                        >
                          Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
