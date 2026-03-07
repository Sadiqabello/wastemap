import type { WasteCategory, SeverityLevel, ReportStatus, UserTier, RewardCategory } from "@/types";

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

  // Referrals
  referral_signup: 5,
  referral_first_report: 20,
  referral_first_event: 15,
  referred_bonus: 5, // bonus for the referred user on signup
  referred_first_report: 15,
  referred_first_event: 10,
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
  referral_signup: "Referred user signed up",
  referral_first_report: "Referred user's first report",
  referral_first_event: "Referred user's first event",
  referred_bonus: "Signup referral bonus",
  referred_first_report: "First report bonus (referred)",
  referred_first_event: "First event bonus (referred)",
};

// ── Tier System ──────────────────────────────────────────────
export const TIER_THRESHOLDS: Record<UserTier, number> = {
  green_starter: 0,
  eco_warrior: 100,
  clean_champion: 500,
  waste_hero: 2000,
};

export const TIER_LABELS: Record<UserTier, string> = {
  green_starter: "Green Starter",
  eco_warrior: "Eco Warrior",
  clean_champion: "Clean Champion",
  waste_hero: "Waste Hero",
};

export const TIER_COLORS: Record<UserTier, string> = {
  green_starter: "#a3e635",
  eco_warrior: "#22c55e",
  clean_champion: "#0ea5e9",
  waste_hero: "#a855f7",
};

export const TIER_ICONS: Record<UserTier, string> = {
  green_starter: "Sprout",
  eco_warrior: "Leaf",
  clean_champion: "TreePine",
  waste_hero: "Globe",
};

export const TIER_MULTIPLIERS: Record<UserTier, number> = {
  green_starter: 1,
  eco_warrior: 1.2,
  clean_champion: 1.5,
  waste_hero: 2,
};

export const TIERS_ORDERED: UserTier[] = [
  "green_starter",
  "eco_warrior",
  "clean_champion",
  "waste_hero",
];

export function getTierFromPoints(points: number): UserTier {
  if (points >= 2000) return "waste_hero";
  if (points >= 500) return "clean_champion";
  if (points >= 100) return "eco_warrior";
  return "green_starter";
}

export function getNextTier(currentTier: UserTier): UserTier | null {
  const idx = TIERS_ORDERED.indexOf(currentTier);
  return idx < TIERS_ORDERED.length - 1 ? TIERS_ORDERED[idx + 1] : null;
}

export function getTierProgress(points: number, currentTier: UserTier): number {
  const next = getNextTier(currentTier);
  if (!next) return 100;
  const currentThreshold = TIER_THRESHOLDS[currentTier];
  const nextThreshold = TIER_THRESHOLDS[next];
  return Math.min(
    100,
    Math.round(((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
  );
}

// ── Reward Category Labels ───────────────────────────────────
export const REWARD_CATEGORY_LABELS: Record<RewardCategory, string> = {
  airtime: "Airtime",
  data: "Data Bundle",
  bank_transfer: "Cash Transfer",
  gift_card: "Gift Card",
  utility: "Utility Bill",
  merchandise: "Merchandise",
};

export const REWARD_CATEGORY_ICONS: Record<RewardCategory, string> = {
  airtime: "Phone",
  data: "Wifi",
  bank_transfer: "Banknote",
  gift_card: "Gift",
  utility: "Zap",
  merchandise: "ShoppingBag",
};

// ── Nigeria Bounds ───────────────────────────────────────────
export const NIGERIA_BOUNDS: [[number, number], [number, number]] = [
  [4.27, 2.67],   // Southwest corner
  [13.89, 14.68], // Northeast corner
];

export function isWithinNigeria(lat: number, lng: number): boolean {
  return (
    lat >= NIGERIA_BOUNDS[0][0] &&
    lat <= NIGERIA_BOUNDS[1][0] &&
    lng >= NIGERIA_BOUNDS[0][1] &&
    lng <= NIGERIA_BOUNDS[1][1]
  );
}

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
