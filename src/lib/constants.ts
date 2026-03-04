import type { WasteCategory, SeverityLevel, ReportStatus } from "@/types";

export const CATEGORY_LABELS: Record<WasteCategory, string> = {
  household: "Household",
  industrial: "Industrial",
  hazardous: "Hazardous",
  electronic: "Electronic",
  construction: "Construction",
  medical: "Medical",
  organic: "Organic",
  other: "Other",
};

export const CATEGORY_ICONS: Record<WasteCategory, string> = {
  household: "Trash2",
  industrial: "Factory",
  hazardous: "AlertTriangle",
  electronic: "Monitor",
  construction: "HardHat",
  medical: "Cross",
  organic: "Leaf",
  other: "Package",
};

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  reported: "Reported",
  acknowledged: "Acknowledged",
  cleanup_scheduled: "Cleanup Scheduled",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export const STATUS_COLORS: Record<ReportStatus, string> = {
  reported: "#ef4444",
  acknowledged: "#f97316",
  cleanup_scheduled: "#eab308",
  in_progress: "#3b82f6",
  resolved: "#22c55e",
};

// ── Gamification Point Values ────────────────────────────────
export const POINT_VALUES = {
  // Reports
  report_created: 10,
  photos_uploaded: 5,
  upvoted_report: 1,
  report_acknowledged: 5,
  report_resolved: 20,
  resolved_report: 15, // awarded to the resolver (if not the reporter)

  // Events
  event_created: 15,
  event_joined: 5,
  event_completed: 25, // organizer bonus when event is completed
  event_attended: 10, // attendees when event is completed
} as const;

export type PointAction = keyof typeof POINT_VALUES;

export const POINT_LABELS: Record<PointAction, string> = {
  report_created: "Submit a report",
  photos_uploaded: "Add photos to report",
  upvoted_report: "Upvote a report",
  report_acknowledged: "Report acknowledged",
  report_resolved: "Your report resolved",
  resolved_report: "Resolve a report",
  event_created: "Organize a cleanup event",
  event_joined: "RSVP to an event",
  event_completed: "Complete event (organizer)",
  event_attended: "Attend a completed event",
};

export const DEFAULT_MAP_CENTER: [number, number] = (() => {
  const env = process.env.NEXT_PUBLIC_DEFAULT_MAP_CENTER;
  if (env) {
    const [lat, lng] = env.split(",").map(Number);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }
  return [9.0579, 7.4951]; // Abuja, Nigeria
})();

export const DEFAULT_MAP_ZOOM = Number(
  process.env.NEXT_PUBLIC_DEFAULT_MAP_ZOOM || "12"
);
