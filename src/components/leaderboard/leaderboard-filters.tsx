"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { TimePeriod } from "@/lib/queries/leaderboard";

const PERIODS: { value: TimePeriod; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "month", label: "This Month" },
  { value: "week", label: "This Week" },
];

export function LeaderboardFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("period") as TimePeriod) || "all";

  function handleClick(period: TimePeriod) {
    const params = new URLSearchParams(searchParams.toString());
    if (period === "all") {
      params.delete("period");
    } else {
      params.set("period", period);
    }
    const qs = params.toString();
    router.push(`/leaderboard${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="flex gap-1 rounded-lg bg-stone-100 p-1">
      {PERIODS.map(({ value, label }) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          onClick={() => handleClick(value)}
          className={`h-7 rounded-md px-3 text-xs font-medium transition-colors ${
            current === value
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
