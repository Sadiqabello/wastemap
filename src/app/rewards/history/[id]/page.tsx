import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getRedemptionById } from "@/lib/queries/rewards";
import { RedemptionInvoice } from "@/components/rewards/redemption-invoice";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RedemptionInvoicePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/rewards/history/" + id);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const redemption = await getRedemptionById(id, user.id);

  if (!redemption) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/rewards/history"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to History
      </Link>

      <RedemptionInvoice
        redemption={redemption}
        userName={profile?.full_name || "User"}
      />
    </div>
  );
}
