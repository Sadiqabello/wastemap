import { createClient } from "@/lib/supabase/server";
import { getVerifiedCollectors } from "@/lib/queries/collectors";
import { CollectorCard } from "@/components/collectors/collector-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Plus,
  LayoutDashboard,
  Search,
  Megaphone,
  Gavel,
  CheckCircle,
  HandCoins,
  LogIn,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Users,
} from "lucide-react";
import Link from "next/link";

export default async function CollectorsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const collectors = await getVerifiedCollectors();

  // Check if current user is already a collector
  let collectorStatus: string | null = null;
  let reviewNote: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("collector_profiles")
      .select("id, status, review_note")
      .eq("user_id", user.id)
      .single();
    collectorStatus = data?.status || null;
    reviewNote = (data as { review_note?: string } | null)?.review_note || null;
  }

  const steps = [
    {
      icon: Megaphone,
      title: "Report & Request",
      description: "Report waste in your area and request a pickup from a collector.",
      color: "text-blue-600 bg-blue-100",
    },
    {
      icon: Gavel,
      title: "Collectors Bid",
      description: "Verified collectors see your request and place competitive bids.",
      color: "text-amber-600 bg-amber-100",
    },
    {
      icon: CheckCircle,
      title: "Accept Best Bid",
      description: "Compare bids by price, rating, and reviews, then accept the best one.",
      color: "text-emerald-600 bg-emerald-100",
    },
    {
      icon: HandCoins,
      title: "Pickup & Pay",
      description: "The collector picks up the waste. You pay on completion and leave a review.",
      color: "text-purple-600 bg-purple-100",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-10">
      {/* ── Hero Banner ─────────────────────────────────────── */}
      <section className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 sm:p-8 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Truck className="h-6 w-6" />
          <span className="text-sm font-medium uppercase tracking-wider opacity-80">
            Waste Pickup Marketplace
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Connect with verified waste collectors
        </h1>
        <p className="text-emerald-100 text-sm sm:text-base max-w-xl mb-6">
          Report waste, request a pickup, and let professional collectors bid
          for the job. Transparent pricing, ratings, and reviews keep things fair.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/reports" className="flex-1 sm:flex-none">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-white text-emerald-700 hover:bg-emerald-50 font-semibold gap-2"
            >
              <Megaphone className="h-4 w-4" />
              Need waste collected?
            </Button>
          </Link>

          {!user ? (
            <Link href="/auth" className="flex-1 sm:flex-none">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 gap-2"
              >
                <LogIn className="h-4 w-4" />
                Login to get started
              </Button>
            </Link>
          ) : collectorStatus === "verified" ? (
            <Link href="/collectors/dashboard" className="flex-1 sm:flex-none">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          ) : !collectorStatus ? (
            <Link href="/collectors/register" className="flex-1 sm:flex-none">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 gap-2"
              >
                <Plus className="h-4 w-4" />
                Want to collect waste?
              </Button>
            </Link>
          ) : null}
        </div>
      </section>

      {/* ── User Status Cards ───────────────────────────────── */}
      {user && collectorStatus === "pending" && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-4 py-5">
            <div className="rounded-full bg-amber-100 p-2.5 shrink-0">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">Application Under Review</h3>
              <p className="text-sm text-amber-700 mt-0.5">
                Your collector registration is being reviewed by our team. This
                usually takes 1-2 business days. We will notify you once a
                decision has been made.
              </p>
            </div>
            <Badge variant="outline" className="shrink-0 border-amber-300 text-amber-700">
              Pending
            </Badge>
          </CardContent>
        </Card>
      )}

      {user && collectorStatus === "rejected" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-4 py-5">
            <div className="rounded-full bg-red-100 p-2.5 shrink-0">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Application Not Approved</h3>
              <p className="text-sm text-red-700 mt-0.5">
                {reviewNote ||
                  "Your collector application was not approved. Please review the requirements and try again."}
              </p>
              <Link href="/collectors/register" className="inline-block mt-3">
                <Button size="sm" variant="outline" className="gap-1 border-red-300 text-red-700 hover:bg-red-100">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Resubmit Application
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {user && collectorStatus === "suspended" && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-start gap-4 py-5">
            <div className="rounded-full bg-orange-100 p-2.5 shrink-0">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900">Account Suspended</h3>
              <p className="text-sm text-orange-700 mt-0.5">
                {reviewNote ||
                  "Your collector account has been suspended. Please contact support for more information."}
              </p>
            </div>
            <Badge variant="outline" className="shrink-0 border-orange-300 text-orange-700">
              Suspended
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Quick actions for verified collectors */}
      {collectorStatus === "verified" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/collectors/browse">
            <Card className="border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer h-full">
              <CardContent className="flex items-center gap-3 py-4">
                <div className="rounded-full bg-blue-100 p-2">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Browse Pickup Requests</p>
                  <p className="text-xs text-blue-600">Find jobs and place bids</p>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-400 ml-auto" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/collectors/dashboard">
            <Card className="border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer h-full">
              <CardContent className="flex items-center gap-3 py-4">
                <div className="rounded-full bg-emerald-100 p-2">
                  <LayoutDashboard className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Your Dashboard</p>
                  <p className="text-xs text-emerald-600">Manage bids and earnings</p>
                </div>
                <ArrowRight className="h-4 w-4 text-emerald-400 ml-auto" />
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      {/* ── How It Works ────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-stone-900 mb-4">How It Works</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {steps.map((step, i) => (
            <Card key={i} className="relative">
              <CardContent className="flex flex-col items-center text-center py-5 px-3">
                <div className={`rounded-full p-2.5 mb-3 ${step.color}`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-stone-400 mb-1">
                  Step {i + 1}
                </span>
                <h3 className="text-sm font-semibold text-stone-900 mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Top Collectors Directory ────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-stone-400" />
            <h2 className="text-lg font-bold text-stone-900">Top Collectors</h2>
          </div>
          {collectors.length > 0 && (
            <span className="text-xs text-stone-400">
              {collectors.length} verified collector{collectors.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {collectors.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <Truck className="mb-3 h-12 w-12 text-stone-300" />
              <p className="text-sm font-medium text-stone-500">
                No collectors available yet
              </p>
              <p className="text-xs text-stone-400 mt-1">
                Be the first to register as a waste collector!
              </p>
              {user && !collectorStatus && (
                <Link href="/collectors/register" className="mt-4">
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" /> Register Now
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {collectors.map((collector) => (
              <CollectorCard key={collector.id} collector={collector} />
            ))}
          </div>
        )}
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────── */}
      {!user && (
        <section className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-center">
          <h3 className="font-semibold text-stone-900 mb-1">
            Ready to make a difference?
          </h3>
          <p className="text-sm text-stone-500 mb-4">
            Sign in to report waste, request pickups, or register as a collector.
          </p>
          <Link href="/auth">
            <Button className="gap-2">
              <LogIn className="h-4 w-4" />
              Get Started
            </Button>
          </Link>
        </section>
      )}

      {user && !collectorStatus && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <h3 className="font-semibold text-emerald-900 mb-1">
            Become a waste collector
          </h3>
          <p className="text-sm text-emerald-700 mb-4">
            Earn money by collecting waste from reporters in your area. Set your
            own prices and service area.
          </p>
          <Link href="/collectors/register">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Truck className="h-4 w-4" />
              Register as Collector
            </Button>
          </Link>
        </section>
      )}
    </div>
  );
}
