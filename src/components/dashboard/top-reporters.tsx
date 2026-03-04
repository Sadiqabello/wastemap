import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/types";

interface TopReportersProps {
  reporters: LeaderboardEntry[];
}

export function TopReporters({ reporters }: TopReportersProps) {
  if (reporters.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Top Contributors
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reporters.slice(0, 5).map((reporter) => {
            const initials = reporter.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={reporter.id}
                className="flex items-center gap-3"
              >
                <span className="w-5 text-center text-xs font-bold text-stone-400">
                  {reporter.rank}
                </span>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-[10px]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate text-sm font-medium text-stone-700">
                  {reporter.full_name}
                </span>
                <span className="text-sm font-semibold text-emerald-600">
                  {reporter.points}
                  <span className="ml-0.5 text-xs text-stone-400">pts</span>
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
