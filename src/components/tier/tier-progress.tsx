"use client";

import { TIER_LABELS, TIER_COLORS, TIER_THRESHOLDS, getTierProgress, getNextTier } from "@/lib/constants";
import type { UserTier } from "@/types";
import { TierBadge } from "./tier-badge";

interface TierProgressProps {
  tier: UserTier;
  points: number;
}

export function TierProgress({ tier, points }: TierProgressProps) {
  const progress = getTierProgress(points, tier);
  const nextTier = getNextTier(tier);
  const color = TIER_COLORS[tier];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <TierBadge tier={tier} size="md" />
        {nextTier && (
          <span className="text-xs text-stone-500">
            {TIER_THRESHOLDS[nextTier] - points} pts to {TIER_LABELS[nextTier]}
          </span>
        )}
      </div>
      <div className="h-2 w-full rounded-full bg-stone-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
      {nextTier && (
        <div className="flex justify-between text-[10px] text-stone-400">
          <span>{TIER_THRESHOLDS[tier]}</span>
          <span>{TIER_THRESHOLDS[nextTier]}</span>
        </div>
      )}
      {!nextTier && (
        <p className="text-center text-xs text-purple-600 font-medium">
          Maximum tier reached!
        </p>
      )}
    </div>
  );
}
