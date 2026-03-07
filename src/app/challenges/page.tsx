import { createClient } from "@/lib/supabase/server";
import { getActiveChallenges, getChallengesWithProgress } from "@/lib/queries/challenges";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import { Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ChallengeWithProgress } from "@/types";

export default async function ChallengesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let challenges: ChallengeWithProgress[];

  if (user) {
    challenges = await getChallengesWithProgress(user.id);
  } else {
    const raw = await getActiveChallenges();
    challenges = raw.map((c) => ({ ...c, user_progress: 0, user_completed: false }));
  }

  const active = challenges.filter((c) => !c.user_completed);
  const completed = challenges.filter((c) => c.user_completed);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold text-stone-900">Challenges</h1>
        </div>
        <p className="mt-1 text-sm text-stone-500">
          Complete challenges to earn bonus points
        </p>
      </div>

      {challenges.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Target className="mb-3 h-12 w-12 text-stone-300" />
            <p className="text-sm text-stone-500">
              No active challenges right now. Check back soon!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {active.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-stone-900 mb-3">Active Challenges</h2>
              <div className="space-y-3">
                {active.map((c) => (
                  <ChallengeCard key={c.id} challenge={c} isLoggedIn={!!user} />
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-stone-900 mb-3">Completed</h2>
              <div className="space-y-3">
                {completed.map((c) => (
                  <ChallengeCard key={c.id} challenge={c} isLoggedIn={!!user} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
