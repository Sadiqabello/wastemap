import { Card, CardContent } from "@/components/ui/card";
import { Trophy, TrendingUp } from "lucide-react";
import { POINT_VALUES, POINT_LABELS } from "@/lib/constants";
import type { PointAction } from "@/lib/constants";

interface UserRankCardProps {
  rank: number;
  points: number;
  name: string;
}

const DISPLAY_ACTIONS: PointAction[] = [
  "report_created",
  "photos_uploaded",
  "upvoted_report",
  "report_acknowledged",
  "report_resolved",
  "resolved_report",
  "event_created",
  "event_joined",
  "event_completed",
  "event_attended",
];

export function UserRankCard({ rank, points, name }: UserRankCardProps) {
  return (
    <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-500">Your Ranking</p>
            <p className="text-2xl font-bold text-stone-900">#{rank}</p>
            <p className="text-xs text-stone-500">{name}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-2xl font-bold">{points.toLocaleString()}</span>
            </div>
            <p className="text-xs text-stone-500">green points</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-white/80 p-3">
          <p className="mb-2 text-xs font-semibold text-stone-600">
            How to earn points
          </p>
          <div className="grid grid-cols-2 gap-1 text-xs text-stone-500">
            {DISPLAY_ACTIONS.map((action) => (
              <div key={action} className="contents">
                <span>{POINT_LABELS[action]}</span>
                <span className="text-right font-medium text-emerald-600">
                  +{POINT_VALUES[action]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
