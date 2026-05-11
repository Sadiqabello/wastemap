import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllMapMarkers } from "@/lib/queries/reports";
import { getAllDumpSiteMarkers } from "@/lib/queries/dump-sites";
import { HomeMapClient } from "@/components/map/home-map-client";
import { WelcomeSheet } from "@/components/onboarding/welcome-sheet";
import { createClient } from "@/lib/supabase/server";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://wastemapnaija.com.ng";

export default async function HomePage() {
  const [markers, dumpSites] = await Promise.all([
    getAllMapMarkers(),
    getAllDumpSiteMarkers(),
  ]);

  let isAuthenticated = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  } catch {
    // unauthenticated
  }

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl}/#webpage`,
    url: siteUrl,
    name: "WasteMapNaija — Report & Track Waste Across Nigeria",
    description:
      "Interactive map of waste reports, illegal dumpsites, and disposal locations across Nigeria.",
    isPartOf: { "@id": `${siteUrl}/#website` },
    about: {
      "@type": "Thing",
      name: "Waste management in Nigeria",
    },
    inLanguage: "en-NG",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteUrl,
        },
      ],
    },
  };

  return (
    <div className="relative h-[calc(100vh-3.5rem-4rem)] md:h-[calc(100vh-3.5rem)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      {/* Visually hidden but semantically indexable content for crawlers */}
      <div className="sr-only">
        <h1>
          WasteMapNaija — Nigeria&apos;s Community Waste Reporting Map
        </h1>
        <p>
          Explore an interactive map of waste reports, illegal dumpsites, and
          verified disposal locations across Nigeria. Report illegal dumping
          in Lagos, Abuja, Kano, Port Harcourt, Ibadan, Kaduna and every
          Nigerian state. Earn green points, join community cleanup events,
          and help build a cleaner Nigeria.
        </p>
        <p>
          Showing {markers.length} waste reports and {dumpSites.length} verified
          dump sites nationwide. Click any pin for details, or use the
          &ldquo;Report Waste&rdquo; button to submit a new report.
        </p>
        <nav aria-label="Primary">
          <ul>
            <li>
              <Link href="/reports/new">Report waste in your area</Link>
            </li>
            <li>
              <Link href="/dump-sites">Find verified dump sites near you</Link>
            </li>
            <li>
              <Link href="/events">Browse community cleanup events</Link>
            </li>
            <li>
              <Link href="/collectors">Hire verified waste collectors</Link>
            </li>
            <li>
              <Link href="/leaderboard">View the green points leaderboard</Link>
            </li>
            <li>
              <Link href="/tips">Read recycling and waste tips</Link>
            </li>
            <li>
              <Link href="/waste-reports">Browse waste reports by Nigerian state</Link>
            </li>
          </ul>
        </nav>

        <h2>Waste reports by state</h2>
        <ul>
          <li><Link href="/waste-reports/lagos">Waste reports in Lagos State</Link></li>
          <li><Link href="/waste-reports/abuja">Waste reports in Abuja (FCT)</Link></li>
          <li><Link href="/waste-reports/kano">Waste reports in Kano State</Link></li>
          <li><Link href="/waste-reports/rivers">Waste reports in Rivers State (Port Harcourt)</Link></li>
          <li><Link href="/waste-reports/oyo">Waste reports in Oyo State (Ibadan)</Link></li>
          <li><Link href="/waste-reports/kaduna">Waste reports in Kaduna State</Link></li>
          <li><Link href="/waste-reports/plateau">Waste reports in Plateau State (Jos)</Link></li>
          <li><Link href="/waste-reports/enugu">Waste reports in Enugu State</Link></li>
          <li><Link href="/waste-reports/delta">Waste reports in Delta State</Link></li>
          <li><Link href="/waste-reports/ogun">Waste reports in Ogun State</Link></li>
        </ul>
      </div>

      <HomeMapClient markers={markers} dumpSites={dumpSites} />

      {/* Floating Action Button — visible on all sizes; mobile sits above bottom nav */}
      <Link
        href="/reports/new"
        className="absolute bottom-20 right-4 z-[999] md:bottom-8 md:right-8"
        aria-label="Report waste"
      >
        <Button
          size="lg"
          className="h-auto rounded-full bg-emerald-600 px-5 py-3 shadow-xl transition-all hover:bg-emerald-700 hover:shadow-2xl md:rounded-lg md:px-6"
        >
          <Plus className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Report Waste</span>
        </Button>
      </Link>

      <WelcomeSheet isAuthenticated={isAuthenticated} />
    </div>
  );
}
