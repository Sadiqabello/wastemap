"use client";

import { MapContainer } from "./map-container";
import { useGeolocation } from "@/hooks/use-geolocation";
import { Button } from "@/components/ui/button";
import { Crosshair, Loader2 } from "lucide-react";

interface LocationPickerProps {
  value: [number, number] | null;
  onChange: (lat: number, lng: number) => void;
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const { loading, getLocation } = useGeolocation();

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange(position.coords.latitude, position.coords.longitude);
      },
      () => {
        // Error handled silently — user can still pick manually
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Location <span className="text-red-500">*</span>
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseMyLocation}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          ) : (
            <Crosshair className="mr-1 h-3 w-3" />
          )}
          Use my location
        </Button>
      </div>
      <div className="h-[300px] overflow-hidden rounded-lg border">
        <MapContainer
          onLocationSelect={onChange}
          selectedLocation={value}
          center={value || undefined}
          zoom={value ? 15 : undefined}
        />
      </div>
      {value ? (
        <p className="text-xs text-stone-500">
          Selected: {value[0].toFixed(6)}, {value[1].toFixed(6)}
        </p>
      ) : (
        <p className="text-xs text-stone-500">
          Click on the map to select a location
        </p>
      )}
    </div>
  );
}
