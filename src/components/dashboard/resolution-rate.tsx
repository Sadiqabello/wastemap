"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface ResolutionRateProps {
  resolved: number;
  total: number;
}

export function ResolutionRate({ resolved, total }: ResolutionRateProps) {
  const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          Resolution Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold text-emerald-600">{rate}%</span>
          <span className="mb-1 text-sm text-stone-500">
            ({resolved} of {total} reports)
          </span>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${rate}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-stone-400">
          Percentage of reported waste sites that have been cleaned up
        </p>
      </CardContent>
    </Card>
  );
}
