"use client";

import { Sprout, Leaf, TreePine, Globe, Trophy, Sparkles } from "lucide-react";
import {
  TIER_THRESHOLDS,
  TIER_LABELS,
  TIER_COLORS,
  TIERS_ORDERED,
  getNextTier,
  getTierProgress,
} from "@/lib/constants";
import type { UserTier } from "@/types";
import { AnimatedCounter } from "./animated-counter";

const TIER_ICON_MAP: Record<UserTier, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  green_starter: Sprout,
  eco_warrior: Leaf,
  clean_champion: TreePine,
  waste_hero: Globe,
};

interface TierHeroProps {
  points: number;
  tier: UserTier;
  rank?: number;
}

/**
 * Big motivational hero card for the Profile/You page.
 * Shows: tier badge → animated points → progress bar to next tier.
 */
export function TierHero({ points, tier, rank }: TierHeroProps) {
  const Icon = TIER_ICON_MAP[tier];
  const tierColor = TIER_COLORS[tier];
  const tierLabel = TIER_LABELS[tier];
  const next = getNextTier(tier);
  const progress = getTierProgress(points, tier);

  const nextThreshold = next ? TIER_THRESHOLDS[next] : null;
  const pointsToNext = nextThreshold !== null ? Math.max(0, nextThreshold - points) : 0;

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 shadow-xl"
      style={{
        background: `linear-gradient(135deg, ${tierColor}25 0%, ${tierColor}10 60%, transparent 100%)`,
      }}
    >
      {/* Decorative orbs */}
      <div
        className="absolute -top-12 -right-12 h-40 w-40 rounded-full blur-3xl opacity-40"
        style={{ backgroundColor: tierColor }}
      />
      <div
        className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: tierColor }}
      />

      <div className="relative">
        {/* Tier label row */}
        <div className="flex items-center gap-2">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg"
            style={{ backgroundColor: tierColor }}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-stone-600 font-semibold">
              Your tier
            </p>
            <p
              className="text-lg font-extrabold"
              style={{ color: tierColor }}
            >
              {tierLabel}
            </p>
          </div>
          {typeof rank === "number" && rank > 0 && (
            <div className="ml-auto flex items-center gap-1.5 rounded-full bg-white/70 backdrop-blur px-3 py-1 text-xs font-semibold text-stone-700 shadow-sm">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              Rank #{rank}
            </div>
          )}
        </div>

        {/* Animated points number */}
        <div className="mt-6 flex items-baseline gap-2">
          <AnimatedCounter
            value={points}
            className="text-5xl font-extrabold tracking-tight text-stone-900"
          />
          <span className="text-lg font-semibold text-stone-500">pts</span>
        </div>

        {/* Progress to next tier */}
        {next && nextThreshold !== null ? (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-stone-600">
                {points.toLocaleString("en-NG")} /{" "}
                {nextThreshold.toLocaleString("en-NG")} pts
              </span>
              <span
                className="flex items-center gap-1"
                style={{ color: TIER_COLORS[next] }}
              >
                <Sparkles className="h-3 w-3" />
                {pointsToNext.toLocaleString("en-NG")} to {TIER_LABELS[next]}
              </span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/70 backdrop-blur shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${tierColor} 0%, ${TIER_COLORS[next]} 100%)`,
                  boxShadow: `0 0 20px ${tierColor}80`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-stone-600">
              You&apos;re <span className="font-bold">{progress}%</span> of the way
              to {TIER_LABELS[next]}.{" "}
              <span className="text-stone-500">
                Keep reporting and joining cleanups!
              </span>
            </p>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-white/70 backdrop-blur p-3 text-center shadow-sm">
            <p className="text-sm font-semibold text-amber-700">
              👑 You&apos;ve reached the top tier!
            </p>
            <p className="mt-1 text-xs text-stone-600">
              Keep going — every report still makes Nigeria cleaner.
            </p>
          </div>
        )}

        {/* Mini tier dots */}
        <div className="mt-5 flex items-center gap-1.5">
          {TIERS_ORDERED.map((t) => {
            const reached = TIER_THRESHOLDS[t] <= points;
            const isCurrent = t === tier;
            return (
              <div
                key={t}
                className="flex-1 h-1 rounded-full transition-colors"
                style={{
                  backgroundColor: reached ? TIER_COLORS[t] : "#e7e5e4",
                  boxShadow: isCurrent ? `0 0 8px ${TIER_COLORS[t]}` : "none",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
