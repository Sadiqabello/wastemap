import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";
import type { LeaderboardEntry } from "@/types";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1)
    return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2)
    return <Medal className="h-5 w-5 text-stone-400" />;
  if (rank === 3)
    return <Award className="h-5 w-5 text-amber-600" />;
  return (
    <span className="flex h-5 w-5 items-center justify-center text-xs font-bold text-stone-400">
      {rank}
    </span>
  );
}

function RankBg({ rank }: { rank: number }) {
  if (rank === 1) return "bg-yellow-50 border-yellow-200";
  if (rank === 2) return "bg-stone-50 border-stone-200";
  if (rank === 3) return "bg-amber-50 border-amber-200";
  return "";
}

export function LeaderboardTable({
  entries,
  currentUserId,
}: LeaderboardTableProps) {
  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const initials = entry.full_name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        const isCurrentUser = entry.id === currentUserId;

        return (
          <div
            key={entry.id}
            className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
              isCurrentUser
                ? "border-emerald-200 bg-emerald-50"
                : RankBg({ rank: entry.rank })
            }`}
          >
            <div className="flex w-8 items-center justify-center">
              <RankIcon rank={entry.rank} />
            </div>
            <Avatar className="h-9 w-9">
              <AvatarFallback
                className={`text-xs ${
                  isCurrentUser
                    ? "bg-emerald-200 text-emerald-800"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-stone-900">
                {entry.full_name}
                {isCurrentUser && (
                  <span className="ml-1 text-xs text-emerald-600">(You)</span>
                )}
              </p>
              {(entry.report_count !== undefined || entry.event_count !== undefined) && (
                <p className="text-xs text-stone-400">
                  {entry.report_count !== undefined && (
                    <span>{entry.report_count} reports</span>
                  )}
                  {entry.report_count !== undefined && entry.event_count !== undefined && (
                    <span className="mx-1">&middot;</span>
                  )}
                  {entry.event_count !== undefined && (
                    <span>{entry.event_count} events</span>
                  )}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-emerald-600">
                {entry.points.toLocaleString()}
              </span>
              <span className="ml-1 text-xs text-stone-400">pts</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
