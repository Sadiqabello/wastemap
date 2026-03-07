import { getAllRewardsAdmin, getAllRedemptionsAdmin } from "@/lib/queries/rewards";
import { getAllChallengesAdmin } from "@/lib/queries/challenges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { REWARD_CATEGORY_LABELS } from "@/lib/constants";
import { Gift, ShoppingCart, Target } from "lucide-react";
import { AdminRewardActions } from "@/components/admin/admin-reward-actions";
import { AdminChallengeActions } from "@/components/admin/admin-challenge-actions";
import { AdminCreateRewardForm } from "@/components/admin/admin-create-reward-form";
import { AdminCreateChallengeForm } from "@/components/admin/admin-create-challenge-form";
import { AdminRedemptionActions } from "@/components/admin/admin-redemption-actions";

export default async function AdminRewardsPage() {
  const [{ rewards, total: totalRewards }, { redemptions, total: totalRedemptions }, { challenges }] =
    await Promise.all([
      getAllRewardsAdmin(),
      getAllRedemptionsAdmin(1, 20),
      getAllChallengesAdmin(),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Rewards Management</h1>
        <p className="text-sm text-stone-500">
          Manage reward catalog, redemptions, and challenges
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-4 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <Gift className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalRewards}</p>
              <p className="text-xs text-stone-500">Total Rewards</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalRedemptions}</p>
              <p className="text-xs text-stone-500">Total Redemptions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Target className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{challenges.length}</p>
              <p className="text-xs text-stone-500">Challenges</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Reward */}
      <AdminCreateRewardForm />

      {/* Rewards Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reward Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          {rewards.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-6">No rewards created yet.</p>
          ) : (
            <div className="space-y-2">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{reward.name}</p>
                      {!reward.is_active && (
                        <Badge variant="outline" className="text-[10px] text-red-600">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-stone-500">
                      {REWARD_CATEGORY_LABELS[reward.category]} &middot; {reward.point_cost} pts
                      {reward.stock !== null && ` &middot; ${reward.stock} in stock`}
                    </p>
                  </div>
                  <AdminRewardActions rewardId={reward.id} isActive={reward.is_active} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Redemptions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Redemptions</CardTitle>
        </CardHeader>
        <CardContent>
          {redemptions.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-6">No redemptions yet.</p>
          ) : (
            <div className="space-y-2">
              {redemptions.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{r.profiles.full_name}</p>
                    <p className="text-xs text-stone-500">
                      {r.rewards.name} &middot; -{r.points_spent} pts &middot;{" "}
                      {new Date(r.created_at).toLocaleDateString("en-NG")}
                    </p>
                  </div>
                  <AdminRedemptionActions redemptionId={r.id} currentStatus={r.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Challenge */}
      <AdminCreateChallengeForm />

      {/* Challenges Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          {challenges.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-6">No challenges created yet.</p>
          ) : (
            <div className="space-y-2">
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{challenge.title}</p>
                      {!challenge.is_active && (
                        <Badge variant="outline" className="text-[10px] text-red-600">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-stone-500">
                      {challenge.action_type} x{challenge.target_count} &middot; +{challenge.bonus_points} pts
                      &middot; {challenge.start_date} to {challenge.end_date}
                    </p>
                  </div>
                  <AdminChallengeActions challengeId={challenge.id} isActive={challenge.is_active} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
