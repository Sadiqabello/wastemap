"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Package } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { CollectorWithProfile } from "@/types";

const CATEGORY_DOT_COLORS: Record<string, string> = {
  household: "bg-blue-500",
  industrial: "bg-slate-500",
  hazardous: "bg-red-500",
  electronic: "bg-violet-500",
  construction: "bg-amber-600",
  medical: "bg-rose-500",
  organic: "bg-green-500",
  other: "bg-stone-400",
};

interface CollectorCardProps {
  collector: CollectorWithProfile;
}

function getInitials(name: string | undefined | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function CollectorCard({ collector }: CollectorCardProps) {
  const initials = getInitials(collector.profiles?.full_name);
  const hasRating = collector.rating > 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="py-4">
        <div className="flex items-center gap-4">
          {/* Left: Avatar */}
          <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
            {initials}
          </div>

          {/* Middle: Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-stone-900 text-sm truncate">
              {collector.business_name}
            </h3>

            {collector.description && (
              <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                {collector.description}
              </p>
            )}

            {/* Waste category dots */}
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center gap-1" title={
                collector.waste_categories
                  .map((cat) => CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat)
                  .join(", ")
              }>
                {collector.waste_categories.slice(0, 6).map((cat) => (
                  <span
                    key={cat}
                    className={`inline-block h-2 w-2 rounded-full ${
                      CATEGORY_DOT_COLORS[cat] || "bg-stone-400"
                    }`}
                    title={CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat}
                  />
                ))}
                {collector.waste_categories.length > 6 && (
                  <span className="text-[10px] text-stone-400 ml-0.5">
                    +{collector.waste_categories.length - 6}
                  </span>
                )}
              </div>

              {collector.address && (
                <>
                  <span className="text-stone-300">|</span>
                  <span className="flex items-center gap-0.5 text-xs text-stone-400 truncate">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{collector.address}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right: Rating & Pickups */}
          <div className="shrink-0 flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <Star
                className={`h-4 w-4 ${
                  hasRating
                    ? "text-amber-500 fill-amber-500"
                    : "text-stone-300"
                }`}
              />
              <span className={`text-sm font-bold ${hasRating ? "text-stone-900" : "text-stone-400"}`}>
                {hasRating ? collector.rating.toFixed(1) : "New"}
              </span>
            </div>
            <span className="flex items-center gap-1 text-xs text-stone-400">
              <Package className="h-3 w-3" />
              {collector.total_pickups} pickup{collector.total_pickups !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
