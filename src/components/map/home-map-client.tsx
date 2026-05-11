"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";
import { MapContainer } from "@/components/map/map-container";
import { MapFilters } from "@/components/map/map-filters";
import type { MapMarker, DumpSiteMapMarker } from "@/types";

interface HomeMapClientProps {
  markers: MapMarker[];
  dumpSites?: DumpSiteMapMarker[];
}

const SEVERITY_LEGEND = [
  { label: "Low", color: "#22c55e" },
  { label: "Medium", color: "#eab308" },
  { label: "High", color: "#f97316" },
  { label: "Critical", color: "#ef4444" },
  { label: "Resolved", color: "#9ca3af" },
];

const DUMP_SITE_LEGEND = [
  { label: "Trash Can", color: "#6b7280" },
  { label: "Recycling", color: "#22c55e" },
  { label: "Dumpster", color: "#f97316" },
  { label: "Transfer", color: "#3b82f6" },
  { label: "Landfill", color: "#8b5cf6" },
  { label: "Compost", color: "#10b981" },
  { label: "Drop-off", color: "#ec4899" },
  { label: "Street Bin", color: "#78716c" },
];

export function HomeMapClient({ markers, dumpSites = [] }: HomeMapClientProps) {
  const [filteredMarkers, setFilteredMarkers] = useState<MapMarker[]>(markers);
  const [showDumpSites, setShowDumpSites] = useState(true);
  const [legendOpen, setLegendOpen] = useState(false);

  return (
    <>
      <MapContainer
        markers={filteredMarkers}
        dumpSites={showDumpSites ? dumpSites : []}
      />
      <MapFilters markers={markers} onFilter={setFilteredMarkers} />

      {/* Report count badge */}
      <div className="absolute top-4 left-4 z-[999] rounded-lg border bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur">
        <span className="text-xs font-medium text-stone-700">
          {filteredMarkers.length}
          {filteredMarkers.length !== markers.length
            ? ` of ${markers.length}`
            : ""}{" "}
          report{filteredMarkers.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Dump sites toggle */}
      {dumpSites.length > 0 && (
        <button
          type="button"
          onClick={() => setShowDumpSites((v) => !v)}
          className={`absolute top-14 left-4 z-[999] flex items-center gap-2 rounded-lg border px-3 py-1.5 shadow-sm backdrop-blur transition-colors text-xs font-medium ${
            showDumpSites
              ? "bg-emerald-50/95 border-emerald-300 text-emerald-700"
              : "bg-white/95 border-stone-200 text-stone-500"
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-sm ${
              showDumpSites ? "bg-emerald-500" : "bg-stone-300"
            }`}
          />
          {dumpSites.length} dump site{dumpSites.length !== 1 ? "s" : ""}
        </button>
      )}

      {/* Legend — collapsible chip on all sizes (was desktop-only before) */}
      {!legendOpen ? (
        <button
          type="button"
          onClick={() => setLegendOpen(true)}
          className="absolute bottom-20 left-4 z-[999] flex items-center gap-1.5 rounded-full border bg-white/95 px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm backdrop-blur transition-colors hover:bg-stone-50 md:bottom-6"
          aria-label="Show map legend"
        >
          <Info className="h-3.5 w-3.5 text-stone-500" />
          Legend
        </button>
      ) : (
        <div className="absolute bottom-20 left-4 z-[999] w-56 rounded-xl border bg-white/95 p-3 shadow-lg backdrop-blur md:bottom-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-stone-700">Map legend</p>
            <button
              type="button"
              onClick={() => setLegendOpen(false)}
              aria-label="Close legend"
              className="rounded-full p-0.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[10px] font-semibold uppercase text-stone-500">Severity</p>
          <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-1">
            {SEVERITY_LEGEND.map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-stone-600">{label}</span>
              </div>
            ))}
          </div>
          <hr className="my-2 border-stone-200" />
          <p className="text-[10px] font-semibold uppercase text-stone-500">Dump sites</p>
          <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-1">
            {DUMP_SITE_LEGEND.map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-stone-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
