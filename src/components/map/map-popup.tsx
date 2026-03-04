import Link from "next/link";
import { CATEGORY_LABELS, SEVERITY_LABELS, SEVERITY_COLORS, STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import type { MapMarker } from "@/types";

interface MapPopupProps {
  marker: MapMarker;
}

export function MapPopup({ marker }: MapPopupProps) {
  return (
    <div className="min-w-[200px] space-y-2 p-1">
      <h3 className="font-semibold text-sm leading-tight">{marker.title}</h3>
      <div className="flex flex-wrap gap-1.5">
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: SEVERITY_COLORS[marker.severity] }}
        >
          {SEVERITY_LABELS[marker.severity]}
        </span>
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: STATUS_COLORS[marker.status] }}
        >
          {STATUS_LABELS[marker.status]}
        </span>
      </div>
      <p className="text-xs text-stone-500">
        {CATEGORY_LABELS[marker.category]} waste
      </p>
      <Link
        href={`/reports/${marker.id}`}
        className="inline-block text-xs font-medium text-emerald-600 hover:underline"
      >
        View Details →
      </Link>
    </div>
  );
}
