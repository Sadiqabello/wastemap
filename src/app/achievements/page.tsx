import { createClient } from "@/lib/supabase/server";
import { getAchievementsWithProgress, getAllAchievements } from "@/lib/queries/achievements";
import { AchievementCard } from "@/components/achievements/achievement-card";
import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";
import { ACHIEVEMENT_CATEGORY_LABELS } from "@/lib/constants";
import type { AchievementWithEarned } from "@/types";

export default async function AchievementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let achievements: AchievementWithEarned[];

  if (user) {
    achievements = await getAchievementsWithProgress(user.id);
  } else {
    const raw = await getAllAchievements();
    achievements = raw.map((a) => ({ ...a, earned: false, earned_at: null })) as AchievementWithEarned[];
  }

  const earned = achievements.filter((a) => a.earned);
  const locked = achievements.filter((a) => !a.earned);

  // Group by category
  const categories = [...new Set(achievements.map((a) => a.category))];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Award className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold text-stone-900">Achievements</h1>
        </div>
        <p className="mt-1 text-sm text-stone-500">
          {user
            ? `${earned.length} / ${achievements.length} unlocked`
            : "Sign in to track your achievements"}
        </p>
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-3">
            Unlocked
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {earned.map((a) => (
              <AchievementCard key={a.id} achievement={a} />
            ))}
          </div>
        </div>
      )}

      {/* Locked by category */}
      {categories.map((cat) => {
        const catLocked = locked.filter((a) => a.category === cat);
        if (catLocked.length === 0) return null;
        return (
          <div key={cat} className="mb-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-3">
              {ACHIEVEMENT_CATEGORY_LABELS[cat] || cat}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {catLocked.map((a) => (
                <AchievementCard key={a.id} achievement={a} />
              ))}
            </div>
          </div>
        );
      })}

      {achievements.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Award className="mb-3 h-12 w-12 text-stone-300" />
            <p className="text-sm text-stone-500">
              No achievements available yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
