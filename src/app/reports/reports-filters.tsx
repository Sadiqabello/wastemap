"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORY_LABELS,
  SEVERITY_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import type { WasteCategory, SeverityLevel, ReportStatus } from "@/types";
import { Search, X } from "lucide-react";

interface ReportsFiltersProps {
  search?: string;
  category?: string;
  severity?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "severity_desc", label: "Severity (High\u2192Low)" },
  { value: "severity_asc", label: "Severity (Low\u2192High)" },
];

const categories = Object.keys(CATEGORY_LABELS) as WasteCategory[];
const severities = Object.keys(SEVERITY_LABELS) as SeverityLevel[];
const statuses = Object.keys(STATUS_LABELS) as ReportStatus[];

export function ReportsFilters({
  search: initialSearch,
  category: initialCategory,
  severity: initialSeverity,
  status: initialStatus,
  dateFrom: initialDateFrom,
  dateTo: initialDateTo,
  sort: initialSort,
}: ReportsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(initialSearch || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasActiveFilters =
    !!initialSearch ||
    !!initialCategory ||
    !!initialSeverity ||
    !!initialStatus ||
    !!initialDateFrom ||
    !!initialDateTo ||
    (!!initialSort && initialSort !== "newest");

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Always reset to page 1 when filters change
      params.delete("page");

      for (const [key, value] of Object.entries(updates)) {
        if (value && value !== "all") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      // Remove sort if it's the default
      if (params.get("sort") === "newest") {
        params.delete("sort");
      }

      startTransition(() => {
        router.replace(`/reports?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition]
  );

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Skip initial render where searchValue matches initialSearch
    if (searchValue === (initialSearch || "")) return;

    debounceRef.current = setTimeout(() => {
      updateParams({ search: searchValue || undefined });
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchValue, updateParams, initialSearch]);

  function clearFilters() {
    setSearchValue("");
    startTransition(() => {
      router.replace("/reports");
    });
  }

  return (
    <div className="space-y-3">
      {/* Search bar - full width */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
        <Input
          type="text"
          placeholder="Search reports by title or description..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {/* Category */}
        <Select
          value={initialCategory || "all"}
          onValueChange={(v) => updateParams({ category: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="w-full text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Severity */}
        <Select
          value={initialSeverity || "all"}
          onValueChange={(v) => updateParams({ severity: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="w-full text-xs">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            {severities.map((sev) => (
              <SelectItem key={sev} value={sev}>
                {SEVERITY_LABELS[sev]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select
          value={initialStatus || "all"}
          onValueChange={(v) => updateParams({ status: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="w-full text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((st) => (
              <SelectItem key={st} value={st}>
                {STATUS_LABELS[st]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date From */}
        <Input
          type="date"
          value={initialDateFrom || ""}
          onChange={(e) => updateParams({ dateFrom: e.target.value || undefined })}
          className="text-xs"
          placeholder="From"
          title="From date"
        />

        {/* Date To */}
        <Input
          type="date"
          value={initialDateTo || ""}
          onChange={(e) => updateParams({ dateTo: e.target.value || undefined })}
          className="text-xs"
          placeholder="To"
          title="To date"
        />

        {/* Sort */}
        <Select
          value={initialSort || "newest"}
          onValueChange={(v) => updateParams({ sort: v })}
        >
          <SelectTrigger className="w-full text-xs">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs text-stone-500 hover:text-stone-700"
          >
            <X className="size-3" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
