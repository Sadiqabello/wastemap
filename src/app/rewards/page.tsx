import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Redeem Rewards",
  description:
    "Convert your green points into airtime, mobile data, or cash rewards. Track your tier progress and redemption history on WasteMapNaija.",
};
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserRedemptions } from "@/lib/queries/rewards";
import { RedeemTabs } from "@/components/rewards/redeem-tabs";
import { RedemptionHistory } from "@/components/rewards/redemption-history";
import { TierProgress } from "@/components/tier/tier-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Star, History, ChevronRight } from "lucide-react";
import type { Profile } from "@/types";

export default async function RewardsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/rewards");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile;

  const redemptions = await getUserRedemptions(user.id, 5);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Redeem Points</h1>
        <p className="mt-1 text-sm text-stone-500">
          Convert your green points to airtime, data, or cash
        </p>
      </div>

      {/* Points Balance */}
      <Card className="mb-6 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-0">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Available Balance</p>
              <p className="text-3xl font-bold">{profile.points} pts</p>
              <p className="text-emerald-200 text-xs mt-1">
                = ₦{profile.points} value (1 pt = ₦1)
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
              <Star className="h-7 w-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier Progress */}
      <Card className="mb-6">
        <CardContent className="pt-4 pb-4">
          <TierProgress tier={profile.tier} points={profile.points} />
        </CardContent>
      </Card>

      {/* Redemption Options */}
      <div className="mb-8">
        <RedeemTabs
          userPoints={profile.points}
          userPhone={profile.phone_number}
        />
      </div>

      {/* Redemption History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-stone-500" />
            <h2 className="text-lg font-semibold text-stone-900">
              Recent Redemptions
            </h2>
          </div>
          {redemptions.length > 0 && (
            <Link
              href="/rewards/history"
              className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        <RedemptionHistory redemptions={redemptions} />
      </div>
    </div>
  );
}
