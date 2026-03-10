import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getReportsOpenForPickup,
  getBidCountsForReports,
  getCollectorById,
} from "@/lib/queries/collectors";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_LABELS,
  SEVERITY_LABELS,
  SEVERITY_COLORS,
  RECYCLING_VALUES,
} from "@/lib/constants";
import {
  MapPin,
  Truck,
  Recycle,
  Package,
  ArrowLeft,
  Gavel,
  Scale,
  ArrowRight,
  Calendar,
  Inbox,
} from "lucide-react";
import { BrowseFilter } from "./browse-filter";

export const dynamic = "force-dynamic";

export default async function CollectorBrowsePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/collectors/browse");
  }

  const collector = await getCollectorById(user.id);
  if (!collector || collector.status !== "verified") {
    redirect("/collectors/dashboard");
  }

  const reports = await getReportsOpenForPickup();
  const bidCounts = await getBidCountsForReports(reports.map((r) => r.id));

  const cleanupReports = reports.filter((r) => r.pickup_type === "cleanup");
  const recyclingReports = reports.filter((r) => r.pickup_type === "recycling");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-6">
        <Link href="/collectors/dashboard">
          <Button variant="ghost" size="sm" className="mb-2 -ml-2 gap-1 text-xs text-stone-500 hover:text-stone-900">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-stone-900">
          Open Pickup Requests
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Browse reports that need waste pickup or have recyclable materials for
          sale.
        </p>
      </div>

      {/* ── Tab-style filter ────────────────────────────────── */}
      <BrowseFilter
        cleanupReports={cleanupReports.map((r) => ({
          id: r.id,
          title: r.title,
          category: (r.category as unknown as string[]).join(", "),
          severity: r.severity,
          address: r.address,
          estimated_weight_kg: r.estimated_weight_kg,
          created_at: r.created_at,
        }))}
        recyclingReports={recyclingReports.map((r) => ({
          id: r.id,
          title: r.title,
          category: (r.category as unknown as string[]).join(", "),
          severity: r.severity,
          address: r.address,
          estimated_weight_kg: r.estimated_weight_kg,
          created_at: r.created_at,
        }))}
        bidCounts={Object.fromEntries(bidCounts)}
      />
    </div>
  );
}
