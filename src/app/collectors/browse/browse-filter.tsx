"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_LABELS,
  SEVERITY_LABELS,
  SEVERITY_COLORS,
  RECYCLING_VALUES,
} from "@/lib/constants";
import {
  MapPin,
  Truck,
  Recycle,
  Gavel,
  Scale,
  ArrowRight,
  Calendar,
  Inbox,
} from "lucide-react";

interface ReportSummary {
  id: string;
  title: string;
  category: string;
  severity: string;
  address: string | null;
  estimated_weight_kg: number | null;
  created_at: string;
}

interface BrowseFilterProps {
  cleanupReports: ReportSummary[];
  recyclingReports: ReportSummary[];
  bidCounts: Record<string, number>;
}

export function BrowseFilter({
  cleanupReports,
  recyclingReports,
  bidCounts,
}: BrowseFilterProps) {
  const [tab, setTab] = useState<"cleanup" | "recycling">("cleanup");

  const reports = tab === "cleanup" ? cleanupReports : recyclingReports;

  return (
    <>
      {/* Tab toggle */}
      <div className="flex rounded-lg bg-stone-100 p-1 mb-6">
        <button
          onClick={() => setTab("cleanup")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all ${
            tab === "cleanup"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          <Truck className="h-4 w-4" />
          Cleanup Jobs
          <Badge
            variant="secondary"
            className={`text-[10px] ${
              tab === "cleanup"
                ? "bg-blue-100 text-blue-700"
                : "bg-stone-200 text-stone-500"
            }`}
          >
            {cleanupReports.length}
          </Badge>
        </button>
        <button
          onClick={() => setTab("recycling")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all ${
            tab === "recycling"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          <Recycle className="h-4 w-4" />
          Recycling Offers
          <Badge
            variant="secondary"
            className={`text-[10px] ${
              tab === "recycling"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-stone-200 text-stone-500"
            }`}
          >
            {recyclingReports.length}
          </Badge>
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-stone-400 mb-4">
        {tab === "cleanup"
          ? "The reporter pays you to clean up their waste."
          : "You pay the reporter for recyclable materials you collect."}
      </p>

      {/* Report list */}
      {reports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 mb-4">
              <Inbox className="h-7 w-7 text-stone-300" />
            </div>
            <p className="text-sm font-medium text-stone-600 mb-1">
              {tab === "cleanup"
                ? "No cleanup requests right now"
                : "No materials for sale right now"}
            </p>
            <p className="text-xs text-stone-400">
              Check back later for new listings.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const bidCount = bidCounts[report.id] || 0;
            const recyclingValue =
              tab === "recycling"
                ? (
                    RECYCLING_VALUES as Record<
                      string,
                      { min: number; max: number }
                    >
                  )[report.category]
                : null;

            return (
              <Card
                key={report.id}
                className="transition-all hover:shadow-md hover:border-stone-300 group"
              >
                <CardContent className="px-4 py-4">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-stone-900 line-clamp-1 flex-1">
                      {report.title}
                    </h3>
                    <Badge
                      className="text-[10px] text-white border-0 shrink-0"
                      style={{
                        backgroundColor: (
                          SEVERITY_COLORS as Record<string, string>
                        )[report.severity],
                      }}
                    >
                      {
                        (SEVERITY_LABELS as Record<string, string>)[
                          report.severity
                        ]
                      }
                    </Badge>
                  </div>

                  {/* Location */}
                  {report.address && (
                    <div className="flex items-start gap-1.5 mb-2">
                      <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-stone-500 line-clamp-1">
                        {report.address}
                      </span>
                    </div>
                  )}

                  {/* Details row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3">
                    <Badge variant="outline" className="text-[10px]">
                      {(CATEGORY_LABELS as Record<string, string>)[
                        report.category
                      ] || report.category}
                    </Badge>

                    {report.estimated_weight_kg && (
                      <span className="flex items-center gap-1 text-xs text-stone-500">
                        <Scale className="h-3 w-3" />~
                        {report.estimated_weight_kg}kg
                      </span>
                    )}

                    {recyclingValue && (
                      <span className="text-xs font-medium text-emerald-600">
                        ₦{recyclingValue.min}&ndash;{recyclingValue.max}/kg
                      </span>
                    )}

                    <span className="flex items-center gap-1 text-xs text-stone-500">
                      <Gavel className="h-3 w-3" />
                      {bidCount} bid{bidCount !== 1 ? "s" : ""}
                    </span>

                    <span className="flex items-center gap-1 text-xs text-stone-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(report.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>

                  {/* Action */}
                  <Link href={`/reports/${report.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs gap-1.5 group-hover:bg-stone-900 group-hover:text-white group-hover:border-stone-900 transition-colors"
                    >
                      View & Bid
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
