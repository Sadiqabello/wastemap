"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star, Lock } from "lucide-react";
import type { AchievementWithEarned } from "@/types";

interface AchievementCardProps {
  achievement: AchievementWithEarned;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <Card
      className={
        achievement.earned
          ? "border-emerald-200 bg-emerald-50/30"
          : "opacity-60"
      }
    >
      <CardContent className="pt-4 pb-4 text-center">
        <div
          className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${
            achievement.earned ? "" : "bg-stone-100"
          }`}
          style={
            achievement.earned
              ? { backgroundColor: achievement.color + "20" }
              : {}
          }
        >
          {achievement.earned ? (
            <span
              className="text-lg"
              style={{ color: achievement.color }}
            >
              <Star className="h-6 w-6 fill-current" />
            </span>
          ) : (
            <Lock className="h-5 w-5 text-stone-400" />
          )}
        </div>

        <h3 className="text-sm font-semibold text-stone-900">
          {achievement.name}
        </h3>
        <p className="text-[10px] text-stone-500 mt-0.5">
          {achievement.description}
        </p>

        {achievement.points_reward > 0 && (
          <div className="mt-1 inline-flex items-center gap-0.5 text-[10px] text-amber-600">
            <Star className="h-2.5 w-2.5" />+{achievement.points_reward} pts
          </div>
        )}

        {achievement.earned && achievement.earned_at && (
          <p className="text-[10px] text-emerald-600 mt-1">
            {new Date(achievement.earned_at).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
