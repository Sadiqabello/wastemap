import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllMapMarkers } from "@/lib/queries/reports";
import { HomeMapClient } from "@/components/map/home-map-client";

export default async function HomePage() {
  const markers = await getAllMapMarkers();

  return (
    <div className="relative h-[calc(100vh-3.5rem-4rem)] md:h-[calc(100vh-3.5rem)]">
      <HomeMapClient markers={markers} />

      {/* Floating Action Button */}
      <Link
        href="/reports/new"
        className="absolute bottom-6 right-6 z-[999] md:bottom-8 md:right-8 group"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30 md:hidden" />
        <Button
          size="lg"
          className="relative h-16 w-16 rounded-full bg-emerald-600 shadow-xl hover:bg-emerald-700 hover:shadow-2xl hover:scale-110 transition-all duration-200 md:h-auto md:w-auto md:rounded-lg md:px-6 md:animate-none animate-bounce"
        >
          <Plus className="h-7 w-7 md:mr-2 md:h-5 md:w-5" />
          <span className="hidden md:inline">Report Waste</span>
        </Button>
      </Link>

      {/* Map Legend */}
      <div className="absolute bottom-6 left-4 z-[999] hidden rounded-lg border bg-white/95 p-3 shadow-sm backdrop-blur md:block">
        <p className="mb-2 text-xs font-semibold text-stone-700">Severity</p>
        <div className="space-y-1">
          {[
            { label: "Low", color: "#22c55e" },
            { label: "Medium", color: "#eab308" },
            { label: "High", color: "#f97316" },
            { label: "Critical", color: "#ef4444" },
            { label: "Resolved", color: "#9ca3af" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-stone-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
