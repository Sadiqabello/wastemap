import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserRedemptions } from "@/lib/queries/rewards";
import { RedemptionHistory } from "@/components/rewards/redemption-history";
import { ArrowLeft, History } from "lucide-react";

export default async function RedemptionHistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/rewards/history");
  }

  const redemptions = await getUserRedemptions(user.id, 100);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/rewards"
          className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Rewards
        </Link>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-stone-500" />
          <h1 className="text-2xl font-bold text-stone-900">
            Redemption History
          </h1>
        </div>
        <p className="mt-1 text-sm text-stone-500">
          All your past redemptions. Tap any item to view the invoice.
        </p>
      </div>

      <RedemptionHistory redemptions={redemptions} />
    </div>
  );
}
