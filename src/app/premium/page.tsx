import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PREMIUM_PLANS, PREMIUM_BENEFITS, PLATFORM_FEE_PERCENT } from "@/lib/constants";
import { PremiumPlanCard } from "@/components/premium/premium-plan-card";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Check, X } from "lucide-react";
import type { Profile } from "@/types";

export default async function PremiumPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/premium");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile;

  const { data: subscriptionData } = await supabase
    .from("premium_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  const subscription = subscriptionData as { status: string; expires_at: string } | null;
  const isActive = subscription && new Date(subscription.expires_at) > new Date();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold text-stone-900">
            Premium Membership
          </h1>
        </div>
        <p className="mt-1 text-sm text-stone-500">
          Unlock exclusive benefits and maximize your impact
        </p>
      </div>

      {isActive && (
        <Card className="mb-6 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-5 w-5 text-amber-600" />
              <span className="font-semibold text-amber-900">
                Active Premium Member
              </span>
            </div>
            <p className="text-xs text-amber-700">
              Expires: {new Date(subscription.expires_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Comparison Table */}
      <Card className="mb-6">
        <CardContent className="pt-4 pb-4">
          <h3 className="font-semibold text-stone-900 mb-3">Free vs Premium</h3>
          <div className="space-y-2 text-sm">
            {[
              { feature: "Redemption fee", free: `${PLATFORM_FEE_PERCENT}%`, premium: "0%" },
              { feature: "Point multiplier bonus", free: "None", premium: "+0.5x" },
              { feature: "Min cash withdrawal", free: "₦500", premium: "₦100" },
              { feature: "Priority fulfillment", free: false, premium: true },
              { feature: "Exclusive challenges", free: false, premium: true },
            ].map((row) => (
              <div
                key={row.feature}
                className="flex items-center justify-between py-1 border-b border-stone-100 last:border-0"
              >
                <span className="text-stone-600">{row.feature}</span>
                <div className="flex items-center gap-4">
                  <span className="text-stone-400 w-16 text-center text-xs">
                    {typeof row.free === "boolean" ? (
                      row.free ? (
                        <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-stone-300 mx-auto" />
                      )
                    ) : (
                      row.free
                    )}
                  </span>
                  <span className="text-amber-700 font-medium w-16 text-center text-xs">
                    {typeof row.premium === "boolean" ? (
                      row.premium ? (
                        <Check className="h-4 w-4 text-amber-600 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-stone-300 mx-auto" />
                      )
                    ) : (
                      row.premium
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      {!isActive && (
        <div className="space-y-3">
          <h3 className="font-semibold text-stone-900">Choose a Plan</h3>
          <p className="text-xs text-stone-500 mb-3">Pay with your earned points</p>
          {(Object.keys(PREMIUM_PLANS) as (keyof typeof PREMIUM_PLANS)[]).map(
            (plan) => (
              <PremiumPlanCard
                key={plan}
                plan={plan}
                config={PREMIUM_PLANS[plan]}
                userPoints={profile.points}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
