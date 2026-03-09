"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Crown } from "lucide-react";
import { subscribePremium } from "@/lib/actions/premium";

interface PremiumPlanCardProps {
  plan: string;
  config: { label: string; price: number; durationDays: number };
  userPoints: number;
}

export function PremiumPlanCard({
  plan,
  config,
  userPoints,
}: PremiumPlanCardProps) {
  const [loading, setLoading] = useState(false);
  const canAfford = userPoints >= config.price;

  async function handleSubscribe() {
    setLoading(true);
    const result = await subscribePremium(
      plan as "monthly" | "quarterly" | "annual"
    );
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        `Premium activated! Expires ${new Date(result.expiresAt!).toLocaleDateString()}`
      );
    }
  }

  const pricePerDay = Math.round(config.price / config.durationDays);

  return (
    <Card
      className={
        plan === "quarterly"
          ? "border-amber-200 bg-amber-50/30"
          : ""
      }
    >
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              <h3 className="font-semibold text-stone-900">{config.label}</h3>
              {plan === "quarterly" && (
                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                  Best Value
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {config.durationDays} days &middot; ~{pricePerDay} pts/day
            </p>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-stone-900">
              {config.price} pts
            </p>
            <Button
              size="sm"
              variant={canAfford ? "default" : "outline"}
              className="mt-1 text-xs h-7"
              onClick={handleSubscribe}
              disabled={!canAfford || loading}
            >
              {loading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              {canAfford ? "Subscribe" : "Not enough pts"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
