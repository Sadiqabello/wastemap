"use client";

import { useState } from "react";
import { RewardCard } from "./reward-card";
import { RedeemDialog } from "./redeem-dialog";
import type { Reward, UserTier } from "@/types";

interface RewardsListProps {
  rewards: Reward[];
  userPoints: number;
  userTier: UserTier;
  userPhone?: string | null;
}

export function RewardsList({ rewards, userPoints, userTier, userPhone }: RewardsListProps) {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleRedeem(reward: Reward) {
    setSelectedReward(reward);
    setDialogOpen(true);
  }

  return (
    <>
      <div className="space-y-3">
        {rewards.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            userPoints={userPoints}
            userTier={userTier}
            onRedeem={handleRedeem}
          />
        ))}
      </div>

      <RedeemDialog
        reward={selectedReward}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userPhone={userPhone}
      />
    </>
  );
}
