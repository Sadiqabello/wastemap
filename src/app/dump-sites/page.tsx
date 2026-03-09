import Link from "next/link";
import { Trash2, Plus, MapPin, Navigation, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getVerifiedDumpSites, getUserDumpSites } from "@/lib/queries/dump-sites";
import { DumpSiteCard } from "@/components/dump-sites/dump-site-card";

export default async function DumpSitesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [verifiedSites, mySites] = await Promise.all([
    getVerifiedDumpSites(),
    user ? getUserDumpSites(user.id) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Trash2 className="h-6 w-6 text-emerald-500" />
            <h1 className="text-2xl font-bold text-stone-900">Dump Sites</h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Find official waste disposal locations near you
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dump-sites/nearby">
            <Button
              size="sm"
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <Navigation className="mr-1 h-4 w-4" />
              Nearby
            </Button>
          </Link>
          {user && (
            <Link href="/dump-sites/new">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Site
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* User's pending/rejected submissions */}
      {mySites.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-stone-700">Your Submissions</h2>
          </div>
          <div className="space-y-3">
            {mySites.map((site) => (
              <div key={site.id} className="relative">
                <Badge
                  variant="outline"
                  className={`absolute top-3 right-3 z-10 text-xs ${
                    site.status === "pending"
                      ? "border-amber-300 bg-amber-50 text-amber-700"
                      : "border-red-300 bg-red-50 text-red-700"
                  }`}
                >
                  {site.status === "pending" ? "Pending Review" : "Rejected"}
                </Badge>
                <DumpSiteCard site={site} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified dump sites */}
      {verifiedSites.length === 0 ? (
        <div className="rounded-lg border bg-stone-50 p-12 text-center">
          <MapPin className="mx-auto mb-3 h-12 w-12 text-stone-300" />
          <p className="text-stone-500">No verified dump sites yet.</p>
          {user && (
            <Link href="/dump-sites/new" className="mt-3 inline-block">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Add the first dump site
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {verifiedSites.map((site) => (
            <DumpSiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}
