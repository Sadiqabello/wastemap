"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { MapMarker, DumpSiteMapMarker } from "@/types";

const MapInner = dynamic(() => import("./map-inner"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

interface MapContainerProps {
  markers?: MapMarker[];
  dumpSites?: DumpSiteMapMarker[];
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: [number, number] | null;
  className?: string;
}

export function MapContainer(props: MapContainerProps) {
  return (
    <div className={props.className || "h-full w-full"}>
      <MapInner {...props} />
    </div>
  );
}
