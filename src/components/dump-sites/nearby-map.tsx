"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  DUMP_SITE_TYPE_COLORS,
  DUMP_SITE_TYPE_LABELS,
  NIGERIA_BOUNDS,
} from "@/lib/constants";
import type { DumpSiteRow } from "@/types/database";
import type { DumpSiteType } from "@/types";

// ── Icons ────────────────────────────────────────────────────

const userLocationIcon = L.divIcon({
  html: `
    <div style="position:relative;width:22px;height:22px;">
      <div style="position:absolute;inset:0;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(59,130,246,0.5);"></div>
      <div style="position:absolute;inset:-8px;background:rgba(59,130,246,0.12);border-radius:50%;animation:marker-pulse 2s ease-in-out infinite;"></div>
    </div>
  `,
  className: "",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function createSiteIcon(siteType: DumpSiteType, selected: boolean) {
  const color = DUMP_SITE_TYPE_COLORS[siteType];
  const size = selected ? 36 : 28;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 34" width="${size}" height="${Math.round(size * 34 / 28)}">
      <rect x="2" y="2" width="24" height="24" rx="6" fill="${color}" stroke="${selected ? '#059669' : 'white'}" stroke-width="${selected ? 3 : 1.5}"/>
      <polygon points="14,34 8,26 20,26" fill="${color}"/>
      <circle cx="14" cy="14" r="5" fill="white" opacity="0.9"/>
    </svg>
  `;
  const anchor = Math.round(size / 2);
  const height = Math.round(size * 34 / 28);
  return L.divIcon({
    html: svg,
    className: selected ? "nearby-site-selected" : "nearby-site-icon",
    iconSize: [size, height],
    iconAnchor: [anchor, height],
    popupAnchor: [0, -height],
  });
}

// ── Haversine ────────────────────────────────────────────────

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return "< 1 min";
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`;
}

// ── Route fetcher (OSRM) ────────────────────────────────────

interface RouteData {
  coordinates: [number, number][];
  distance: number; // meters
  duration: number; // seconds
}

async function fetchRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<RouteData | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.code !== "Ok" || !data.routes?.[0]) return null;

    const route = data.routes[0];
    const coords: [number, number][] = route.geometry.coordinates.map(
      (c: [number, number]) => [c[1], c[0]] // GeoJSON is [lng, lat], Leaflet needs [lat, lng]
    );

    return {
      coordinates: coords,
      distance: route.distance,
      duration: route.duration,
    };
  } catch {
    return null;
  }
}

// ── FitBounds helper ─────────────────────────────────────────

function FitBounds({
  userPos,
  sites,
}: {
  userPos: [number, number];
  sites: { latitude: number; longitude: number }[];
}) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current) return;
    fitted.current = true;

    const points: L.LatLngExpression[] = [userPos];
    // Include up to 5 closest sites in bounds
    sites.slice(0, 5).forEach((s) => {
      points.push([s.latitude, s.longitude]);
    });

    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else {
      map.setView(userPos, 14);
    }
  }, [map, userPos, sites]);

  return null;
}

// ── Route line component ─────────────────────────────────────

function RouteLine({
  route,
  destinationPos,
  userPos,
}: {
  route: RouteData;
  destinationPos: [number, number];
  userPos: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    // Fit map to show full route
    const allPoints: L.LatLngExpression[] = [userPos, destinationPos];
    const bounds = L.latLngBounds(allPoints);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
  }, [map, userPos, destinationPos]);

  return (
    <Polyline
      positions={route.coordinates}
      pathOptions={{
        color: "#059669",
        weight: 5,
        opacity: 0.8,
        dashArray: undefined,
        lineCap: "round",
        lineJoin: "round",
      }}
    />
  );
}

// ── Main component ───────────────────────────────────────────

interface NearbyMapProps {
  userLat: number;
  userLng: number;
  sites: DumpSiteRow[];
  selectedSiteId: string | null;
  onSelectSite: (siteId: string | null) => void;
}

export default function NearbyMap({
  userLat,
  userLng,
  sites,
  selectedSiteId,
  onSelectSite,
}: NearbyMapProps) {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  // Fetch route when a site is selected
  useEffect(() => {
    if (!selectedSite) {
      setRoute(null);
      return;
    }

    let cancelled = false;
    setRouteLoading(true);
    setRoute(null);

    fetchRoute(userLat, userLng, selectedSite.latitude, selectedSite.longitude).then(
      (r) => {
        if (!cancelled) {
          setRoute(r);
          setRouteLoading(false);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [selectedSite, userLat, userLng]);

  // Sort sites by distance for bounds fitting
  const sortedSites = [...sites].sort(
    (a, b) =>
      haversineDistance(userLat, userLng, a.latitude, a.longitude) -
      haversineDistance(userLat, userLng, b.latitude, b.longitude)
  );

  return (
    <div className="relative">
      <div className="h-[350px] sm:h-[420px] rounded-xl overflow-hidden border border-stone-200 shadow-sm">
        <MapContainer
          center={[userLat, userLng]}
          zoom={14}
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

          <FitBounds userPos={[userLat, userLng]} sites={sortedSites} />

          {/* User location */}
          <Circle
            center={[userLat, userLng]}
            radius={80}
            pathOptions={{
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 0.08,
              weight: 1,
            }}
          />
          <Marker position={[userLat, userLng]} icon={userLocationIcon}>
            <Popup>
              <span className="text-sm font-medium">You are here</span>
            </Popup>
          </Marker>

          {/* Dump site markers */}
          {sites.map((site) => {
            const isSelected = site.id === selectedSiteId;
            const dist = haversineDistance(
              userLat,
              userLng,
              site.latitude,
              site.longitude
            );

            return (
              <Marker
                key={site.id}
                position={[site.latitude, site.longitude]}
                icon={createSiteIcon(site.site_type, isSelected)}
                eventHandlers={{
                  click: () => onSelectSite(isSelected ? null : site.id),
                }}
              >
                <Popup>
                  <div className="min-w-[180px] p-1">
                    <h3 className="font-semibold text-sm text-stone-800">
                      {site.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {DUMP_SITE_TYPE_LABELS[site.site_type]}
                      {site.is_free ? " · Free" : ""}
                    </p>
                    <p className="text-xs font-medium text-emerald-600 mt-1">
                      {formatDistance(dist)} away
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSite(site.id);
                      }}
                      className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Get Directions →
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Route polyline */}
          {route && selectedSite && (
            <RouteLine
              route={route}
              destinationPos={[selectedSite.latitude, selectedSite.longitude]}
              userPos={[userLat, userLng]}
            />
          )}
        </MapContainer>
      </div>

      {/* Route info overlay */}
      {selectedSite && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000]">
          <div className="rounded-xl bg-white/95 backdrop-blur-sm border border-stone-200 shadow-lg px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-stone-900 truncate">
                  {selectedSite.name}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  {routeLoading ? (
                    <span className="text-xs text-stone-400 animate-pulse">
                      Calculating route...
                    </span>
                  ) : route ? (
                    <>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
                        🚗 {formatDistance(route.distance / 1000)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full px-2 py-0.5">
                        ⏱ {formatDuration(route.duration)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-stone-500">
                      {formatDistance(
                        haversineDistance(
                          userLat,
                          userLng,
                          selectedSite.latitude,
                          selectedSite.longitude
                        )
                      )}{" "}
                      straight line
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${selectedSite.latitude},${selectedSite.longitude}&travelmode=driving`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                >
                  Navigate
                </a>
                <button
                  onClick={() => onSelectSite(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
