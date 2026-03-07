"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, SEVERITY_COLORS, NIGERIA_BOUNDS, isWithinNigeria } from "@/lib/constants";
import { MapPopup } from "./map-popup";
import { Crosshair } from "lucide-react";
import type { MapMarker } from "@/types";
import type { SeverityLevel } from "@/types";

function createMarkerIcon(severity: SeverityLevel, status: string) {
  const color = status === "resolved" ? "#9ca3af" : SEVERITY_COLORS[severity];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="36">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="11" r="5" fill="white" opacity="0.9"/>
      ${status === "resolved" ? '<path d="M9 11l2 2 4-4" stroke="' + color + '" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' : '<circle cx="12" cy="11" r="2.5" fill="' + color + '"/>'}
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: `marker-icon ${severity === "critical" && status !== "resolved" ? "marker-critical" : ""}`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

function LocationSelector({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (isWithinNigeria(e.latlng.lat, e.latlng.lng)) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

const userLocationIcon = L.divIcon({
  html: `
    <div style="position:relative;width:20px;height:20px;">
      <div style="position:absolute;inset:0;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(59,130,246,0.5);"></div>
      <div style="position:absolute;inset:-6px;background:rgba(59,130,246,0.15);border-radius:50%;animation:marker-pulse 2s ease-in-out infinite;"></div>
    </div>
  `,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function UserLocation() {
  const map = useMap();
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        map.flyTo(coords, 14, { duration: 1.5 });
      },
      () => {
        // Silently fall back to default center
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [map]);

  if (!position) return null;

  return (
    <>
      <Circle
        center={position}
        radius={100}
        pathOptions={{
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.08,
          weight: 1,
        }}
      />
      <Marker position={position} icon={userLocationIcon}>
        <Popup>
          <span className="text-sm font-medium">You are here</span>
        </Popup>
      </Marker>
    </>
  );
}

function LocateButton() {
  const map = useMap();

  const handleClick = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 15, {
          duration: 1.5,
        });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <button
      onClick={handleClick}
      className="absolute top-4 right-4 z-[1000] flex h-10 w-10 items-center justify-center rounded-lg border bg-white shadow-md hover:bg-stone-50 transition-colors"
      title="Go to my location"
      type="button"
    >
      <Crosshair className="h-5 w-5 text-stone-700" />
    </button>
  );
}

interface MapInnerProps {
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: [number, number] | null;
}

export default function MapInner({
  markers = [],
  center = DEFAULT_MAP_CENTER,
  zoom = DEFAULT_MAP_ZOOM,
  onLocationSelect,
  selectedLocation,
}: MapInnerProps) {
  const handleLocationSelect = useCallback(
    (lat: number, lng: number) => {
      onLocationSelect?.(lat, lng);
    },
    [onLocationSelect]
  );

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
      zoomControl={true}
      maxBounds={NIGERIA_BOUNDS}
      maxBoundsViscosity={1.0}
      minZoom={6}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <UserLocation />
      <LocateButton />

      {onLocationSelect && (
        <LocationSelector onLocationSelect={handleLocationSelect} />
      )}

      {selectedLocation && (
        <Marker
          position={selectedLocation}
          icon={L.divIcon({
            html: `
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="32" height="40">
                <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#059669" stroke="white" stroke-width="2"/>
                <circle cx="12" cy="11" r="4" fill="white"/>
              </svg>
            `,
            className: "selected-marker",
            iconSize: [32, 40],
            iconAnchor: [16, 40],
          })}
        />
      )}

      {markers.length > 0 && (
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.latitude, marker.longitude]}
              icon={createMarkerIcon(marker.severity, marker.status)}
            >
              <Popup>
                <MapPopup marker={marker} />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      )}
    </MapContainer>
  );
}
