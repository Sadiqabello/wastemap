"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Target, CheckCircle2, Loader2 } from "lucide-react";
import { joinChallenge } from "@/lib/actions/challenges";
import { POINT_LABELS } from "@/lib/constants";
import type { ChallengeWithProgress } from "@/types";

interface ChallengeCardProps {
  challenge: ChallengeWithProgress;
  isLoggedIn: boolean;
}

export function ChallengeCard({ challenge, isLoggedIn }: ChallengeCardProps) {
  const [joining, setJoining] = useState(false);
  const progress = challenge.user_progress;
  const isJoined = progress > 0 || challenge.user_completed;
  const progressPercent = Math.min(100, Math.round((progress / challenge.target_count) * 100));

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );

  const actionLabel = POINT_LABELS[challenge.action_type as keyof typeof POINT_LABELS] || challenge.action_type;

  async function handleJoin() {
    setJoining(true);
    const result = await joinChallenge(challenge.id);
    setJoining(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Challenge joined! Start earning progress.");
    }
  }

  return (
    <Card className={challenge.user_completed ? "border-emerald-200 bg-emerald-50/30" : ""}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {challenge.user_completed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <Target className="h-5 w-5 text-amber-500 shrink-0" />
              )}
              <h3 className="font-medium text-stone-900 text-sm">{challenge.title}</h3>
            </div>

            {challenge.description && (
              <p className="mt-1 ml-7 text-xs text-stone-500">{challenge.description}</p>
            )}

            <div className="mt-2 ml-7 flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {actionLabel}
              </Badge>
              <span className="text-[10px] text-stone-400">
                {daysLeft} {daysLeft === 1 ? "day" : "days"} left
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 shrink-0">
            <Star className="h-3 w-3 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700">
              +{challenge.bonus_points}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 ml-7">
          {isJoined || challenge.user_completed ? (
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-stone-500">
                  {progress} / {challenge.target_count}
                </span>
                <span className={challenge.user_completed ? "text-emerald-600 font-medium" : "text-stone-400"}>
                  {challenge.user_completed ? "Completed!" : `${progressPercent}%`}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-stone-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    challenge.user_completed ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : isLoggedIn ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleJoin}
              disabled={joining}
              className="text-xs h-7"
            >
              {joining ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
              Join Challenge
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
