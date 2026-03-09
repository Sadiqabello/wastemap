import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ChevronRight } from "lucide-react";
import { COLLECTOR_STATUS_LABELS } from "@/lib/constants";
import type { CollectorWithProfile } from "@/types";

interface AdminCollectorCardProps {
  collector: CollectorWithProfile;
}

export function AdminCollectorCard({ collector }: AdminCollectorCardProps) {
  const statusVariant =
    collector.status === "verified"
      ? "default"
      : collector.status === "rejected" || collector.status === "suspended"
        ? "destructive"
        : "secondary";

  return (
    <Link href={`/admin/collectors/${collector.id}`}>
      <Card className="transition-colors hover:bg-stone-50 cursor-pointer">
        <CardContent className="pt-3 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm">{collector.business_name}</h3>
                <Badge variant={statusVariant} className="text-[10px]">
                  {COLLECTOR_STATUS_LABELS[collector.status]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {collector.profiles?.full_name}
                {collector.phone && ` | ${collector.phone}`}
              </p>
              {collector.address && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {collector.address}
                </p>
              )}
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span>
                  <Star className="h-3 w-3 inline" /> {collector.rating || "N/A"}
                </span>
                <span>{collector.total_pickups} pickups</span>
                <span>₦{(collector.total_earnings || 0).toLocaleString()} earned</span>
              </div>
              {collector.review_note && (
                <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 line-clamp-1">
                  Note: {collector.review_note}
                </p>
              )}
            </div>

            <ChevronRight className="h-5 w-5 text-stone-300 shrink-0 mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
