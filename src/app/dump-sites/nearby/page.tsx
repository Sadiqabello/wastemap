import { Trash2, Navigation } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getVerifiedDumpSites } from "@/lib/queries/dump-sites";
import { NearbyGpsWrapper } from "./nearby-gps-wrapper";

export default async function NearbyDumpSitesPage() {
  const sites = await getVerifiedDumpSites();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-emerald-500" />
            <h1 className="text-xl font-bold text-stone-900 sm:text-2xl">
              Nearby Dump Sites
            </h1>
          </div>
          <p className="mt-0.5 text-sm text-stone-500">
            Tap a site to see directions from your location
          </p>
        </div>
        <Link href="/dump-sites">
          <Button
            size="sm"
            variant="outline"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            All Sites
          </Button>
        </Link>
      </div>

      <NearbyGpsWrapper sites={sites} />
    </div>
  );
}
