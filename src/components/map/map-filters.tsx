"use client";

import { useState } from "react";
import { Filter, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CATEGORY_LABELS,
  SEVERITY_LABELS,
  SEVERITY_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
} from "@/lib/constants";
import type { WasteCategory, SeverityLevel, ReportStatus, MapMarker } from "@/types";

interface MapFiltersProps {
  markers: MapMarker[];
  onFilter: (filtered: MapMarker[]) => void;
}

export function MapFilters({ markers, onFilter }: MapFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<WasteCategory[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<SeverityLevel[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ReportStatus[]>([]);

  const categories = Object.keys(CATEGORY_LABELS) as WasteCategory[];
  const severities = Object.keys(SEVERITY_LABELS) as SeverityLevel[];
  const statuses = Object.keys(STATUS_LABELS) as ReportStatus[];

  const activeFilterCount =
    selectedCategories.length + selectedSeverities.length + selectedStatuses.length + (search ? 1 : 0);

  function applyFilters(
    s: string,
    cats: WasteCategory[],
    sevs: SeverityLevel[],
    stats: ReportStatus[]
  ) {
    let filtered = markers;

    if (s.trim()) {
      const q = s.toLowerCase();
      filtered = filtered.filter((m) => m.title.toLowerCase().includes(q));
    }
    if (cats.length > 0) {
      filtered = filtered.filter((m) => m.category.some((c) => cats.includes(c)));
    }
    if (sevs.length > 0) {
      filtered = filtered.filter((m) => sevs.includes(m.severity));
    }
    if (stats.length > 0) {
      filtered = filtered.filter((m) => stats.includes(m.status));
    }

    onFilter(filtered);
  }

  function toggleCategory(cat: WasteCategory) {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    setSelectedCategories(next);
    applyFilters(search, next, selectedSeverities, selectedStatuses);
  }

  function toggleSeverity(sev: SeverityLevel) {
    const next = selectedSeverities.includes(sev)
      ? selectedSeverities.filter((s) => s !== sev)
      : [...selectedSeverities, sev];
    setSelectedSeverities(next);
    applyFilters(search, selectedCategories, next, selectedStatuses);
  }

  function toggleStatus(stat: ReportStatus) {
    const next = selectedStatuses.includes(stat)
      ? selectedStatuses.filter((s) => s !== stat)
      : [...selectedStatuses, stat];
    setSelectedStatuses(next);
    applyFilters(search, selectedCategories, selectedSeverities, next);
  }

  function handleSearchChange(val: string) {
    setSearch(val);
    applyFilters(val, selectedCategories, selectedSeverities, selectedStatuses);
  }

  function clearFilters() {
    setSearch("");
    setSelectedCategories([]);
    setSelectedSeverities([]);
    setSelectedStatuses([]);
    onFilter(markers);
  }

  return (
    <div className="absolute top-4 right-16 z-[999]">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white shadow-md relative"
      >
        <Filter className="mr-1 h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white">
            {activeFilterCount}
          </span>
        )}
        {isOpen ? (
          <ChevronUp className="ml-1 h-3 w-3" />
        ) : (
          <ChevronDown className="ml-1 h-3 w-3" />
        )}
      </Button>

      {isOpen && (
        <div className="mt-2 w-72 rounded-lg border bg-white p-4 shadow-lg max-h-[70vh] overflow-y-auto">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
            <Input
              placeholder="Search reports..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
            {search && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-2 top-2.5"
              >
                <X className="h-4 w-4 text-stone-400" />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="mb-3">
            <p className="mb-1.5 text-xs font-semibold text-stone-700">Category</p>
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    selectedCategories.includes(cat)
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Severity filter */}
          <div className="mb-3">
            <p className="mb-1.5 text-xs font-semibold text-stone-700">Severity</p>
            <div className="flex flex-wrap gap-1">
              {severities.map((sev) => (
                <button
                  key={sev}
                  onClick={() => toggleSeverity(sev)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    selectedSeverities.includes(sev)
                      ? "text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                  style={
                    selectedSeverities.includes(sev)
                      ? { backgroundColor: SEVERITY_COLORS[sev] }
                      : undefined
                  }
                >
                  {SEVERITY_LABELS[sev]}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter */}
          <div className="mb-3">
            <p className="mb-1.5 text-xs font-semibold text-stone-700">Status</p>
            <div className="flex flex-wrap gap-1">
              {statuses.map((stat) => (
                <button
                  key={stat}
                  onClick={() => toggleStatus(stat)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    selectedStatuses.includes(stat)
                      ? "text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                  style={
                    selectedStatuses.includes(stat)
                      ? { backgroundColor: STATUS_COLORS[stat] }
                      : undefined
                  }
                >
                  {STATUS_LABELS[stat]}
                </button>
              ))}
            </div>
          </div>

          {/* Clear all */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="w-full text-xs text-stone-500"
            >
              <X className="mr-1 h-3 w-3" />
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
