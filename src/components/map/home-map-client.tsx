"use client";

import { useState } from "react";
import { MapContainer } from "@/components/map/map-container";
import { MapFilters } from "@/components/map/map-filters";
import type { MapMarker, DumpSiteMapMarker } from "@/types";

interface HomeMapClientProps {
  markers: MapMarker[];
  dumpSites?: DumpSiteMapMarker[];
}

export function HomeMapClient({ markers, dumpSites = [] }: HomeMapClientProps) {
  const [filteredMarkers, setFilteredMarkers] = useState<MapMarker[]>(markers);
  const [showDumpSites, setShowDumpSites] = useState(true);

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
    </>
  );
}
