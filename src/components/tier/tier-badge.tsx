"use client";

import { Sprout, Leaf, TreePine, Globe } from "lucide-react";
import { TIER_LABELS, TIER_COLORS } from "@/lib/constants";
import type { UserTier } from "@/types";

const TIER_ICON_MAP = {
  green_starter: Sprout,
  eco_warrior: Leaf,
  clean_champion: TreePine,
  waste_hero: Globe,
} as const;

interface TierBadgeProps {
  tier: UserTier;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function TierBadge({ tier, size = "sm", showLabel = true }: TierBadgeProps) {
  const Icon = TIER_ICON_MAP[tier];
  const color = TIER_COLORS[tier];
  const label = TIER_LABELS[tier];

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base font-medium",
  };

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
      style={{ backgroundColor: `${color}20`, color }}
    >
      <Icon className={sizeClasses[size]} />
      {showLabel && <span className={textClasses[size]}>{label}</span>}
    </span>
  );
}
