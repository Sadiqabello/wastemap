"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REWARD_CATEGORY_LABELS } from "@/lib/constants";

export function RewardFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("category") || "all";

  function onCategoryChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.push(`/rewards?${params.toString()}`);
  }

  return (
    <Select value={current} onValueChange={onCategoryChange}>
      <SelectTrigger className="w-[160px] h-8 text-xs">
        <SelectValue placeholder="All categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {Object.entries(REWARD_CATEGORY_LABELS).map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
