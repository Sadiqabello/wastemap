"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  paramName: string;
  label: string;
  options: FilterOption[];
}

interface AdminFilterBarProps {
  filters: FilterConfig[];
}

export function AdminFilterBar({ filters }: AdminFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function applyFilter(paramName: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(paramName);
    } else {
      params.set(paramName, value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    for (const filter of filters) {
      params.delete(filter.paramName);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasActiveFilters = filters.some((f) =>
    searchParams.has(f.paramName)
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <Select
          key={filter.paramName}
          value={searchParams.get(filter.paramName) ?? "all"}
          onValueChange={(v) => applyFilter(filter.paramName, v)}
        >
          <SelectTrigger className="w-[160px] bg-white">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {filter.label}</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll}>
          <X className="h-4 w-4" />
          Clear all
        </Button>
      )}
    </div>
  );
}
