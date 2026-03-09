import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCollectorBids, getCollectorById } from "@/lib/queries/collectors";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Star,
  Package,
  Banknote,
  AlertTriangle,
  Search,
  Info,
  ShieldX,
  ShieldAlert,
  Eye,
  ClipboardList,
} from "lucide-react";
import { BidCard } from "@/components/collectors/bid-card";
import { COLLECTOR_STATUS_LABELS } from "@/lib/constants";
import { CollectorResubmitForm } from "@/components/collectors/collector-resubmit-form";
import { CompletedPickups } from "./completed-pickups";

export default async function CollectorDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/collectors/dashboard");
  }

  const collector = await getCollectorById(user.id);
  if (!collector) {
    redirect("/collectors/register");
  }

  const bids = await getCollectorBids(user.id);

  const acceptedBids = bids.filter((b) => b.status === "accepted");
  const pendingBids = bids.filter((b) => b.status === "pending");
  const completedBids = bids.filter((b) => b.status === "completed");

  const canResubmit =
    collector.status === "rejected" || collector.status === "suspended";
  const isVerified = collector.status === "verified";
  const isPending = collector.status === "pending";
  const isRejected = collector.status === "rejected";
  const isSuspended = collector.status === "suspended";

  const statusVariant = isVerified
    ? "default"
    : isRejected || isSuspended
      ? "destructive"
      : "secondary";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <Truck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900 sm:text-2xl">
                {collector.business_name}
              </h1>
              <Badge variant={statusVariant} className="mt-0.5 text-[10px]">
                {COLLECTOR_STATUS_LABELS[collector.status]}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/collectors">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">View Profile</span>
              </Button>
            </Link>
            {isVerified && (
              <Link href="/collectors/browse">
                <Button
                  size="sm"
                  className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Browse Pickups</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Status Banner (non-verified only) ───────────────── */}
      {isPending && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Application Under Review
                </p>
                <p className="mt-1 text-sm text-blue-700">
                  Your collector application is being reviewed. You will be able
                  to browse and bid on pickup requests once verified. This
                  usually takes 1-2 business days.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isRejected && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex gap-3">
              <ShieldX className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">
                  Application Rejected
                </p>
                {collector.review_note && (
                  <p className="mt-1 text-sm text-red-700">
                    {collector.review_note}
                  </p>
                )}
                {collector.reviewed_at && (
                  <p className="mt-1 text-xs text-red-500">
                    {new Date(collector.reviewed_at).toLocaleDateString(
                      "en-NG",
                      { year: "numeric", month: "long", day: "numeric" }
                    )}
                  </p>
                )}
                <p className="mt-2 text-xs text-red-700 font-medium">
                  Update your details below and resubmit your application.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isSuspended && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="py-4">
            <div className="flex gap-3">
              <ShieldAlert className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-900">
                  Account Suspended
                </p>
                {collector.review_note && (
                  <p className="mt-1 text-sm text-orange-700">
                    {collector.review_note}
                  </p>
                )}
                {collector.reviewed_at && (
                  <p className="mt-1 text-xs text-orange-500">
                    {new Date(collector.reviewed_at).toLocaleDateString(
                      "en-NG",
                      { year: "numeric", month: "long", day: "numeric" }
                    )}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Resubmit Form ───────────────────────────────────── */}
      {canResubmit && (
        <div className="mb-6">
          <CollectorResubmitForm collector={collector} />
        </div>
      )}

      {/* ── Stats Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
        <Card>
          <CardContent className="py-4 text-center">
            <Package className="h-5 w-5 mx-auto mb-1.5 text-stone-400" />
            <p className="text-2xl font-bold text-stone-900">
              {collector.total_pickups}
            </p>
            <p className="text-xs text-stone-500">Total Pickups</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <ClipboardList className="h-5 w-5 mx-auto mb-1.5 text-blue-500" />
            <p className="text-2xl font-bold text-stone-900">
              {pendingBids.length + acceptedBids.length}
            </p>
            <p className="text-xs text-stone-500">Active Bids</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Star className="h-5 w-5 mx-auto mb-1.5 text-amber-500" />
            <p className="text-2xl font-bold text-stone-900">
              {collector.rating ? collector.rating.toFixed(1) : "N/A"}
            </p>
            <p className="text-xs text-stone-500">Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Banknote className="h-5 w-5 mx-auto mb-1.5 text-emerald-500" />
            <p className="text-2xl font-bold text-stone-900">
              ₦{(collector.total_earnings || 0).toLocaleString()}
            </p>
            <p className="text-xs text-stone-500">Earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Active Jobs (accepted bids) ─────────────────────── */}
      {acceptedBids.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
            <h2 className="text-lg font-semibold text-stone-900">
              Active Jobs
            </h2>
            <Badge className="text-[10px] bg-green-100 text-green-800 border-0">
              {acceptedBids.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {acceptedBids.map((bid) => (
              <BidCard key={bid.id} bid={bid} isCollector />
            ))}
          </div>
        </div>
      )}

      {/* ── Pending Bids ────────────────────────────────────── */}
      {pendingBids.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold text-stone-900">
              Pending Bids
            </h2>
            <Badge className="text-[10px] bg-yellow-100 text-yellow-800 border-0">
              {pendingBids.length}
            </Badge>
          </div>
          <p className="text-xs text-stone-400 mb-3">
            Waiting for the report owner to accept your bid.
          </p>
          <div className="space-y-3">
            {pendingBids.map((bid) => (
              <BidCard key={bid.id} bid={bid} isCollector />
            ))}
          </div>
        </div>
      )}

      {/* ── Completed Pickups (collapsed by default) ────────── */}
      {completedBids.length > 0 && (
        <CompletedPickups bids={completedBids} />
      )}

      {/* ── Empty State ─────────────────────────────────────── */}
      {bids.length === 0 && !canResubmit && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 mb-4">
              <Package className="h-8 w-8 text-stone-300" />
            </div>
            {isVerified ? (
              <>
                <p className="text-sm font-medium text-stone-700 mb-1">
                  No bids yet
                </p>
                <p className="text-xs text-stone-500 text-center mb-4">
                  Browse open pickup requests and place your first bid to start
                  earning.
                </p>
                <Link href="/collectors/browse">
                  <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <Search className="h-4 w-4" />
                    Browse Pickup Requests
                  </Button>
                </Link>
              </>
            ) : isPending ? (
              <>
                <p className="text-sm font-medium text-stone-700 mb-1">
                  Verification in progress
                </p>
                <p className="text-xs text-stone-500 text-center">
                  Your profile is pending verification. You will be able to bid
                  on pickup requests once approved.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-stone-700 mb-1">
                  Application needs attention
                </p>
                <p className="text-xs text-stone-500 text-center">
                  Please update your details above and resubmit your
                  application.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
