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
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearch } from "@/components/admin/admin-search";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminRewardsTabNav } from "@/components/admin/admin-rewards-tab-nav";

type Tab = "rewards" | "redemptions" | "challenges";

const CATEGORY_FILTER_OPTIONS = [
  { value: "airtime", label: "Airtime" },
  { value: "data", label: "Data Bundle" },
  { value: "bank_transfer", label: "Cash Transfer" },
  { value: "gift_card", label: "Gift Card" },
  { value: "utility", label: "Utility Bill" },
  { value: "merchandise", label: "Merchandise" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-stone-100 text-stone-800",
};

export default async function AdminRewardsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    q?: string;
    status?: string;
    category?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const activeTab = (params.tab as Tab) || "rewards";
  const search = params.q || "";
  const statusFilter = params.status || "";
  const categoryFilter = params.category || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = 20;

  // Fetch data based on active tab (always fetch stats, conditionally fetch tab data)
  const [
    { rewards, total: totalRewards },
    { redemptions, total: totalRedemptions },
    { challenges, total: totalChallenges },
  ] = await Promise.all([
    getAllRewardsAdmin(
      activeTab === "rewards" ? page : 1,
      activeTab === "rewards" ? limit : 1,
      activeTab === "rewards" ? search : undefined,
      activeTab === "rewards" ? categoryFilter : undefined
    ),
    getAllRedemptionsAdmin(
      activeTab === "redemptions" ? page : 1,
      activeTab === "redemptions" ? limit : 1,
      activeTab === "redemptions" ? statusFilter : undefined
    ),
    getAllChallengesAdmin(
      activeTab === "challenges" ? page : 1,
      activeTab === "challenges" ? limit : 1
    ),
  ]);

  const rewardsTotalPages = Math.ceil(totalRewards / limit);
  const redemptionsTotalPages = Math.ceil(totalRedemptions / limit);
  const challengesTotalPages = Math.ceil(totalChallenges / limit);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Rewards Management"
        description="Manage reward catalog, redemptions, and challenges"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <p className="text-2xl font-bold">{totalChallenges}</p>
              <p className="text-xs text-stone-500">Challenges</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <AdminRewardsTabNav activeTab={activeTab} />

      {/* Rewards Tab */}
      {activeTab === "rewards" && (
        <>
          <AdminCreateRewardForm />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reward Catalog</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <AdminSearch placeholder="Search rewards..." />
                <AdminFilterBar
                  filters={[
                    {
                      paramName: "category",
                      label: "Category",
                      options: CATEGORY_FILTER_OPTIONS,
                    },
                  ]}
                />
              </div>

              {rewards.length === 0 ? (
                <p className="text-sm text-stone-500 text-center py-6">
                  No rewards found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-stone-500">
                        <th className="pb-2 pr-4 font-medium">Name</th>
                        <th className="pb-2 pr-4 font-medium">Category</th>
                        <th className="pb-2 pr-4 font-medium text-right">
                          Point Cost
                        </th>
                        <th className="pb-2 pr-4 font-medium text-right">
                          Stock
                        </th>
                        <th className="pb-2 pr-4 font-medium">Status</th>
                        <th className="pb-2 font-medium text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {rewards.map((reward) => (
                        <tr key={reward.id} className="hover:bg-stone-50">
                          <td className="py-3 pr-4 font-medium">
                            {reward.name}
                          </td>
                          <td className="py-3 pr-4 text-stone-600">
                            {REWARD_CATEGORY_LABELS[reward.category]}
                          </td>
                          <td className="py-3 pr-4 text-right tabular-nums">
                            {reward.point_cost.toLocaleString()}
                          </td>
                          <td className="py-3 pr-4 text-right tabular-nums">
                            {reward.stock !== null ? reward.stock : "\u221E"}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge
                              variant="outline"
                              className={
                                reward.is_active
                                  ? "border-green-200 bg-green-50 text-green-700"
                                  : "border-red-200 bg-red-50 text-red-700"
                              }
                            >
                              {reward.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <AdminRewardActions
                              rewardId={reward.id}
                              isActive={reward.is_active}
                              rewardName={reward.name}
                              description={reward.description ?? undefined}
                              category={reward.category}
                              pointCost={reward.point_cost}
                              stock={reward.stock ?? undefined}
                              tierRequired={reward.tier_required ?? undefined}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <AdminPagination
                currentPage={page}
                totalPages={rewardsTotalPages}
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* Redemptions Tab */}
      {activeTab === "redemptions" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Redemptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdminFilterBar
              filters={[
                {
                  paramName: "status",
                  label: "Status",
                  options: STATUS_FILTER_OPTIONS,
                },
              ]}
            />

            {redemptions.length === 0 ? (
              <p className="text-sm text-stone-500 text-center py-6">
                No redemptions found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-stone-500">
                      <th className="pb-2 pr-4 font-medium">User</th>
                      <th className="pb-2 pr-4 font-medium">Reward</th>
                      <th className="pb-2 pr-4 font-medium text-right">
                        Points Spent
                      </th>
                      <th className="pb-2 pr-4 font-medium">Status</th>
                      <th className="pb-2 pr-4 font-medium">Date</th>
                      <th className="pb-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {redemptions.map((r) => (
                      <tr key={r.id} className="hover:bg-stone-50">
                        <td className="py-3 pr-4 font-medium">
                          {r.profiles.full_name}
                        </td>
                        <td className="py-3 pr-4 text-stone-600">
                          {r.rewards?.name || "Direct redemption"}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          -{r.points_spent.toLocaleString()}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status] || "bg-stone-100 text-stone-800"}`}
                          >
                            {r.status.charAt(0).toUpperCase() +
                              r.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-stone-500 tabular-nums">
                          {new Date(r.created_at).toLocaleDateString("en-NG")}
                        </td>
                        <td className="py-3 text-right">
                          <AdminRedemptionActions
                            redemptionId={r.id}
                            currentStatus={r.status}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <AdminPagination
              currentPage={page}
              totalPages={redemptionsTotalPages}
            />
          </CardContent>
        </Card>
      )}

      {/* Challenges Tab */}
      {activeTab === "challenges" && (
        <>
          <AdminCreateChallengeForm />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Challenges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {challenges.length === 0 ? (
                <p className="text-sm text-stone-500 text-center py-6">
                  No challenges found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-stone-500">
                        <th className="pb-2 pr-4 font-medium">Title</th>
                        <th className="pb-2 pr-4 font-medium">Type</th>
                        <th className="pb-2 pr-4 font-medium text-right">
                          Target
                        </th>
                        <th className="pb-2 pr-4 font-medium text-right">
                          Bonus Points
                        </th>
                        <th className="pb-2 pr-4 font-medium">Date Range</th>
                        <th className="pb-2 pr-4 font-medium">Status</th>
                        <th className="pb-2 font-medium text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {challenges.map((challenge) => {
                        const now = new Date().toISOString().split("T")[0];
                        const isExpired = challenge.end_date < now;
                        const isUpcoming = challenge.start_date > now;

                        return (
                          <tr
                            key={challenge.id}
                            className="hover:bg-stone-50"
                          >
                            <td className="py-3 pr-4 font-medium">
                              {challenge.title}
                            </td>
                            <td className="py-3 pr-4 text-stone-600">
                              {challenge.action_type}
                            </td>
                            <td className="py-3 pr-4 text-right tabular-nums">
                              x{challenge.target_count}
                            </td>
                            <td className="py-3 pr-4 text-right tabular-nums">
                              +{challenge.bonus_points.toLocaleString()}
                            </td>
                            <td className="py-3 pr-4 text-stone-500 text-xs tabular-nums">
                              {challenge.start_date} to {challenge.end_date}
                            </td>
                            <td className="py-3 pr-4">
                              {!challenge.is_active ? (
                                <Badge
                                  variant="outline"
                                  className="border-red-200 bg-red-50 text-red-700"
                                >
                                  Inactive
                                </Badge>
                              ) : isExpired ? (
                                <Badge
                                  variant="outline"
                                  className="border-stone-200 bg-stone-50 text-stone-600"
                                >
                                  Expired
                                </Badge>
                              ) : isUpcoming ? (
                                <Badge
                                  variant="outline"
                                  className="border-blue-200 bg-blue-50 text-blue-700"
                                >
                                  Upcoming
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-green-200 bg-green-50 text-green-700"
                                >
                                  Active
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 text-right">
                              <AdminChallengeActions
                                challengeId={challenge.id}
                                isActive={challenge.is_active}
                                title={challenge.title}
                                description={challenge.description ?? undefined}
                                actionType={challenge.action_type}
                                targetCount={challenge.target_count}
                                bonusPoints={challenge.bonus_points}
                                startDate={challenge.start_date}
                                endDate={challenge.end_date}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <AdminPagination
                currentPage={page}
                totalPages={challengesTotalPages}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
