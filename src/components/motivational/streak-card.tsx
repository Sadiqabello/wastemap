import { Flame } from "lucide-react";

interface StreakCardProps {
  /** Number of consecutive days with at least one point-earning activity. */
  streakDays: number;
  /** Total points earned in the last 7 days. */
  weeklyPoints: number;
}

export function StreakCard({ streakDays, weeklyPoints }: StreakCardProps) {
  const isHot = streakDays >= 3;
  const hue = isHot ? "from-orange-500 to-red-500" : "from-stone-300 to-stone-400";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${hue} p-5 text-white shadow-md`}
    >
      <div className="absolute -top-4 -right-4 opacity-20">
        <Flame className="h-24 w-24" />
      </div>

      <div className="relative flex items-center gap-3">
        <Flame className="h-10 w-10 shrink-0" />
        <div>
          <p className="text-3xl font-extrabold tracking-tight">
            {streakDays}
            <span className="ml-1 text-base font-medium opacity-90">
              day{streakDays === 1 ? "" : "s"}
            </span>
          </p>
          <p className="text-sm font-medium opacity-90">
            {streakDays === 0
              ? "Start your streak today!"
              : streakDays === 1
                ? "First day — keep it going!"
                : isHot
                  ? "On fire 🔥 — don't break it!"
                  : "Building momentum"}
          </p>
        </div>
      </div>

      <div className="relative mt-3 border-t border-white/20 pt-3 text-xs">
        <span className="opacity-90">This week: </span>
        <span className="font-bold">+{weeklyPoints} pts</span>
      </div>
    </div>
  );
}
