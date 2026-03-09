"use client";

import Link from "next/link";
import { MapPin, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DumpSiteRow } from "@/types/database";
import {
  DUMP_SITE_TYPE_LABELS,
  DUMP_SITE_TYPE_COLORS,
} from "@/lib/constants";

interface NearbySitesListProps {
  userLat: number;
  userLng: number;
  sites: DumpSiteRow[];
}

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
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
  if (km < 1) {
    return `${Math.round(km * 1000)} m away`;
  }
  return `${km.toFixed(1)} km away`;
}

export function NearbySitesList({ userLat, userLng, sites }: NearbySitesListProps) {
  const sitesWithDistance = sites
    .map((site) => ({
      site,
      distance: haversineDistance(userLat, userLng, site.latitude, site.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);

  if (sitesWithDistance.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-stone-500">
        No dump sites found nearby.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {sitesWithDistance.map(({ site, distance }) => {
        const typeColor = DUMP_SITE_TYPE_COLORS[site.site_type];
        const typeLabel = DUMP_SITE_TYPE_LABELS[site.site_type];

        return (
          <Link key={site.id} href={`/dump-sites/${site.id}`}>
            <Card className="transition-colors hover:bg-stone-50">
              <CardContent className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge
                        className="border-0 text-[10px] text-white"
                        style={{ backgroundColor: typeColor }}
                      >
                        {typeLabel}
                      </Badge>
                    </div>
                    <h3 className="truncate font-medium text-stone-900">
                      {site.name}
                    </h3>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-xs text-stone-500">
                    <Navigation className="h-3 w-3" />
                    <span>{formatDistance(distance)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
