"use client";

import { useState } from "react";
import { MapContainer } from "@/components/map/map-container";
import { MapFilters } from "@/components/map/map-filters";
import type { MapMarker } from "@/types";

interface HomeMapClientProps {
  markers: MapMarker[];
}

export function HomeMapClient({ markers }: HomeMapClientProps) {
  const [filteredMarkers, setFilteredMarkers] = useState<MapMarker[]>(markers);

  return (
    <>
      <MapContainer markers={filteredMarkers} />
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
    </>
  );
}
