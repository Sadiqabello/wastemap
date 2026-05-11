import { TrendingUp, TrendingDown } from "lucide-react";
import { POINT_LABELS } from "@/lib/constants";
import type { PointAction } from "@/lib/constants";

export interface PointActivityItem {
  id: string;
  action: string;
  points: number;
  created_at: string;
}

interface RecentActivityProps {
  items: PointActivityItem[];
}

function relativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (sec < 60) return "just now";
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day < 7) return `${day}d ago`;
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

function labelFor(action: string): string {
  // Try mapping to a known PointAction; otherwise show the raw action.
  if (action in POINT_LABELS) {
    return POINT_LABELS[action as PointAction];
  }
  return action;
}

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-base font-bold text-stone-900">Recent activity</h2>
        <p className="text-xs text-stone-500">Your last point earnings</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl bg-stone-50 px-4 py-8 text-center">
          <p className="text-sm font-medium text-stone-700">
            Your activity will show up here.
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Submit a report to earn your first points!
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const isPositive = item.points > 0;
            const Icon = isPositive ? TrendingUp : TrendingDown;
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl bg-stone-50/60 px-3 py-2"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isPositive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-stone-200 text-stone-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-900">
                    {labelFor(item.action)}
                  </p>
                  <p className="text-xs text-stone-500">
                    {relativeTime(item.created_at)}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-bold ${
                    isPositive ? "text-emerald-600" : "text-stone-500"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {item.points}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
