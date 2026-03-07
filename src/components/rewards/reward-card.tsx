"use client";

import { useState } from "react";
import { Phone, Wifi, Banknote, Gift, Zap, ShoppingBag, Star, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/tier/tier-badge";
import { REWARD_CATEGORY_LABELS, TIER_LABELS } from "@/lib/constants";
import type { Reward, UserTier } from "@/types";

const ICON_MAP = {
  airtime: Phone,
  data: Wifi,
  bank_transfer: Banknote,
  gift_card: Gift,
  utility: Zap,
  merchandise: ShoppingBag,
} as const;

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  userTier: UserTier;
  onRedeem: (reward: Reward) => void;
}

export function RewardCard({ reward, userPoints, userTier, onRedeem }: RewardCardProps) {
  const Icon = ICON_MAP[reward.category];
  const canAfford = userPoints >= reward.point_cost;
  const tierOrder = ["green_starter", "eco_warrior", "clean_champion", "waste_hero"];
  const meetsTier = !reward.tier_required ||
    tierOrder.indexOf(userTier) >= tierOrder.indexOf(reward.tier_required);
  const canRedeem = canAfford && meetsTier && (reward.stock === null || reward.stock > 0);

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
            <Icon className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-stone-900 text-sm">{reward.name}</h3>
                <p className="text-xs text-stone-500">{REWARD_CATEGORY_LABELS[reward.category]}</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5">
                <Star className="h-3 w-3 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">
                  {reward.point_cost}
                </span>
              </div>
            </div>

            {reward.description && (
              <p className="mt-1 text-xs text-stone-400 line-clamp-2">
                {reward.description}
              </p>
            )}

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {reward.tier_required && (
                  <TierBadge tier={reward.tier_required} size="sm" showLabel={false} />
                )}
                {reward.stock !== null && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {reward.stock} left
                  </Badge>
                )}
              </div>

              <Button
                size="sm"
                disabled={!canRedeem}
                onClick={() => onRedeem(reward)}
                className={
                  canRedeem
                    ? "bg-emerald-600 hover:bg-emerald-700 text-xs h-7"
                    : "text-xs h-7"
                }
              >
                {!meetsTier ? (
                  <>
                    <Lock className="mr-1 h-3 w-3" />
                    {TIER_LABELS[reward.tier_required!]}
                  </>
                ) : !canAfford ? (
                  "Not enough points"
                ) : reward.stock === 0 ? (
                  "Out of stock"
                ) : (
                  "Redeem"
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
