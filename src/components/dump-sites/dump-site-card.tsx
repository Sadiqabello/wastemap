import Link from "next/link";
import Image from "next/image";
import { MapPin, ThumbsUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DumpSiteRow } from "@/types/database";
import {
  DUMP_SITE_TYPE_LABELS,
  DUMP_SITE_TYPE_COLORS,
} from "@/lib/constants";

interface DumpSiteCardProps {
  site: DumpSiteRow;
}

export function DumpSiteCard({ site }: DumpSiteCardProps) {
  const typeColor = DUMP_SITE_TYPE_COLORS[site.site_type];
  const typeLabel = DUMP_SITE_TYPE_LABELS[site.site_type];

  return (
    <Link href={`/dump-sites/${site.id}`}>
      <Card className="transition-colors hover:bg-stone-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            {/* Thumbnail */}
            {site.photo_urls && site.photo_urls.length > 0 && (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border">
                <Image
                  src={site.photo_urls[0]}
                  alt={site.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge
                  className="border-0 text-[10px] text-white"
                  style={{ backgroundColor: typeColor }}
                >
                  {typeLabel}
                </Badge>
                {site.is_free && (
                  <Badge className="border-0 bg-emerald-100 text-emerald-700 text-[10px]">
                    Free
                  </Badge>
                )}
              </div>

              <h3 className="truncate font-semibold text-stone-900">
                {site.name}
              </h3>

              {site.address && (
                <p className="mt-0.5 flex items-center gap-1 text-sm text-stone-500">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{site.address}</span>
                </p>
              )}

              <div className="mt-2 flex items-center gap-1 text-xs text-stone-400">
                <ThumbsUp className="h-3 w-3" />
                <span>{site.upvote_count}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
