"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles, X } from "lucide-react";
import { TIER_LABELS, TIER_COLORS, TIERS_ORDERED } from "@/lib/constants";
import type { UserTier } from "@/types";
import { Button } from "@/components/ui/button";

const SEEN_KEY = "wm:tier-seen";

interface TierUpCelebrationProps {
  tier: UserTier;
}

/**
 * Detects when the user crosses into a new tier (versus what's saved in
 * localStorage) and fires confetti + a celebration modal. Stores the latest
 * seen tier so it only fires once per promotion.
 */
export function TierUpCelebration({ tier }: TierUpCelebrationProps) {
  const [show, setShow] = useState(false);
  const [previousTier, setPreviousTier] = useState<UserTier | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(SEEN_KEY) as UserTier | null;

    // First visit: just record the current tier, don't celebrate retroactively.
    if (!seen) {
      window.localStorage.setItem(SEEN_KEY, tier);
      return;
    }

    if (seen === tier) return;

    const seenIdx = TIERS_ORDERED.indexOf(seen);
    const nowIdx = TIERS_ORDERED.indexOf(tier);
    if (nowIdx > seenIdx) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: tier-change celebration is driven by an external (localStorage) read on mount
      setPreviousTier(seen);
      setShow(true);
      // Confetti burst — 3 quick bursts from random sides
      const color = TIER_COLORS[tier];
      const burst = (origin: { x: number; y: number }) => {
        confetti({
          particleCount: 70,
          spread: 70,
          origin,
          colors: [color, "#ffffff", "#fef08a"],
          ticks: 200,
          scalar: 1.1,
        });
      };
      burst({ x: 0.2, y: 0.5 });
      setTimeout(() => burst({ x: 0.8, y: 0.5 }), 200);
      setTimeout(() => burst({ x: 0.5, y: 0.4 }), 400);
    }
    // Update the stored value so we don't re-fire on the next visit.
    window.localStorage.setItem(SEEN_KEY, tier);
  }, [tier]);

  if (!show || !previousTier) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Dismiss celebration"
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        onClick={() => setShow(false)}
      />
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 text-center shadow-2xl"
        style={{
          boxShadow: `0 0 0 4px ${TIER_COLORS[tier]}40, 0 25px 60px -10px ${TIER_COLORS[tier]}80`,
        }}
      >
        <button
          type="button"
          onClick={() => setShow(false)}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-3 flex justify-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-3xl shadow-lg"
            style={{ backgroundColor: TIER_COLORS[tier] }}
          >
            <Sparkles className="h-10 w-10 text-white" />
          </div>
        </div>

        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
          You levelled up!
        </p>
        <h2 className="mt-1 text-3xl font-extrabold text-stone-900">
          {TIER_LABELS[tier]}
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          You climbed from{" "}
          <span className="font-semibold">{TIER_LABELS[previousTier]}</span>{" "}
          to <span className="font-bold" style={{ color: TIER_COLORS[tier] }}>
            {TIER_LABELS[tier]}
          </span>
          . Thank you for keeping Nigeria cleaner.
        </p>

        <Button
          onClick={() => setShow(false)}
          className="mt-5 w-full"
          style={{ backgroundColor: TIER_COLORS[tier] }}
        >
          Keep going
        </Button>
      </div>
    </div>
  );
}
