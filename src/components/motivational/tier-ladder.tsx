import { Sprout, Leaf, TreePine, Globe, Lock, Check } from "lucide-react";
import {
  TIER_THRESHOLDS,
  TIER_LABELS,
  TIER_COLORS,
  TIERS_ORDERED,
} from "@/lib/constants";
import type { UserTier } from "@/types";

const TIER_ICONS: Record<UserTier, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  green_starter: Sprout,
  eco_warrior: Leaf,
  clean_champion: TreePine,
  waste_hero: Globe,
};

const TIER_TAGLINES: Record<UserTier, string> = {
  green_starter: "Welcome aboard — your first reports count!",
  eco_warrior: "You're a regular contributor.",
  clean_champion: "Community leader. People notice.",
  waste_hero: "Top of the leaderboard. You shaped this map.",
};

interface TierLadderProps {
  points: number;
  tier: UserTier;
}

export function TierLadder({ points, tier }: TierLadderProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-stone-900">Tier journey</h2>
        <p className="text-xs text-stone-500">Climb by earning points</p>
      </div>

      <div className="space-y-3">
        {TIERS_ORDERED.map((t, idx) => {
          const Icon = TIER_ICONS[t];
          const threshold = TIER_THRESHOLDS[t];
          const color = TIER_COLORS[t];
          const reached = points >= threshold;
          const isCurrent = t === tier;
          const nextThreshold =
            idx < TIERS_ORDERED.length - 1
              ? TIER_THRESHOLDS[TIERS_ORDERED[idx + 1]]
              : null;

          return (
            <div
              key={t}
              className={`relative flex items-center gap-3 rounded-xl border p-3 transition-all ${
                isCurrent
                  ? "border-current bg-stone-50"
                  : reached
                    ? "border-stone-200 bg-white"
                    : "border-dashed border-stone-200 bg-stone-50/50"
              }`}
              style={isCurrent ? { borderColor: color } : undefined}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  reached ? "" : "grayscale opacity-40"
                }`}
                style={{ backgroundColor: `${color}25` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={`font-semibold ${
                      reached ? "text-stone-900" : "text-stone-400"
                    }`}
                  >
                    {TIER_LABELS[t]}
                  </p>
                  {isCurrent && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: color }}
                    >
                      You are here
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs ${
                    reached ? "text-stone-500" : "text-stone-400"
                  }`}
                >
                  {threshold === 0
                    ? "Starting tier"
                    : `${threshold.toLocaleString("en-NG")} pts to unlock`}
                  {reached && nextThreshold !== null && !isCurrent && (
                    <span className="ml-2 text-emerald-600">✓ Unlocked</span>
                  )}
                </p>
                <p
                  className={`mt-1 text-[11px] italic ${
                    reached ? "text-stone-500" : "text-stone-300"
                  }`}
                >
                  {TIER_TAGLINES[t]}
                </p>
              </div>
              <div className="shrink-0">
                {reached ? (
                  <Check
                    className="h-5 w-5"
                    style={{ color: isCurrent ? color : "#22c55e" }}
                  />
                ) : (
                  <Lock className="h-5 w-5 text-stone-300" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
