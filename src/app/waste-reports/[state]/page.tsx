import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, MapPin, FileText, Trash2 } from "lucide-react";
import {
  CATEGORY_LABELS,
  SEVERITY_LABELS,
  SEVERITY_COLORS,
} from "@/lib/constants";
import type { WasteCategory, SeverityLevel, ReportStatus } from "@/types";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://wastemapnaija.com.ng";

export const revalidate = 3600;

type StateInfo = {
  slug: string;
  name: string;
  matchTerms: string[];
  capital: string;
  blurb: string;
  population: string;
};

const STATES: Record<string, StateInfo> = {
  lagos: {
    slug: "lagos",
    name: "Lagos State",
    matchTerms: ["lagos", "ikeja", "lekki", "ajah", "yaba", "surulere", "ikorodu", "epe", "badagry", "ikoyi", "victoria island"],
    capital: "Ikeja",
    population: "over 20 million",
    blurb:
      "Lagos is Nigeria's largest city and generates an estimated 13,000 tonnes of waste every single day — more than any other state in the country. Illegal dumping along the Lagos Lagoon, in canals, and in unplanned settlements is a chronic challenge.",
  },
  abuja: {
    slug: "abuja",
    name: "Abuja (Federal Capital Territory)",
    matchTerms: ["abuja", "fct", "garki", "wuse", "maitama", "asokoro", "gwarinpa", "kubwa", "nyanya", "lugbe", "kuje"],
    capital: "Abuja",
    population: "over 3.6 million",
    blurb:
      "The Federal Capital Territory is one of Nigeria's fastest-growing urban regions. Districts like Wuse, Garki, and the satellite towns generate significant waste, with illegal dumping a recurring issue in Karu, Nyanya, and along major expressways.",
  },
  kano: {
    slug: "kano",
    name: "Kano State",
    matchTerms: ["kano", "fagge", "nasarawa", "tarauni", "dala", "gwale", "kumbotso"],
    capital: "Kano",
    population: "over 13 million",
    blurb:
      "Kano is northern Nigeria's commercial heart and one of the country's most populous states. Markets like Sabon Gari, Kwari, and Kurmi generate enormous waste volumes, and informal dumping remains widespread on the city outskirts.",
  },
  rivers: {
    slug: "rivers",
    name: "Rivers State",
    matchTerms: ["rivers", "port harcourt", "obio-akpor", "eleme", "okrika", "bonny", "diobu"],
    capital: "Port Harcourt",
    population: "over 7 million",
    blurb:
      "Rivers State, home to Port Harcourt, faces unique waste-management challenges driven by oil-and-gas activity, rapid urban growth, and seasonal flooding that disperses uncollected waste into waterways.",
  },
  oyo: {
    slug: "oyo",
    name: "Oyo State",
    matchTerms: ["oyo", "ibadan", "ogbomoso", "iseyin", "akinyele", "egbeda", "lagelu"],
    capital: "Ibadan",
    population: "over 7.8 million",
    blurb:
      "Oyo State's capital, Ibadan, is one of West Africa's oldest and largest urban areas. Densely populated wards like Ibadan North and South West contend with overflowing communal bins and informal roadside dumps.",
  },
  kaduna: {
    slug: "kaduna",
    name: "Kaduna State",
    matchTerms: ["kaduna", "zaria", "sabon gari", "kakuri", "kawo", "rigasa", "narayi"],
    capital: "Kaduna",
    population: "over 8.2 million",
    blurb:
      "Kaduna State balances industrial activity in Kaduna metropolis with agricultural waste streams across rural LGAs. Illegal dumping on the outskirts of Kaduna city and Zaria is a longstanding concern.",
  },
  plateau: {
    slug: "plateau",
    name: "Plateau State",
    matchTerms: ["plateau", "jos", "bukuru", "barkin ladi", "vom"],
    capital: "Jos",
    population: "over 4.4 million",
    blurb:
      "Plateau State's capital Jos sits on a high plateau with cooler temperatures and a strong tourism profile. Tin-mining legacy waste and urban household waste both feed the state's waste-management challenges.",
  },
  enugu: {
    slug: "enugu",
    name: "Enugu State",
    matchTerms: ["enugu", "nsukka", "agbani", "abakaliki road", "new haven"],
    capital: "Enugu",
    population: "over 4.6 million",
    blurb:
      "Enugu State, the heart of the South East, faces growing urban-waste pressure in Enugu metropolis and university towns like Nsukka, with hilly terrain that makes collection particularly challenging.",
  },
  delta: {
    slug: "delta",
    name: "Delta State",
    matchTerms: ["delta", "warri", "asaba", "ughelli", "sapele", "agbor"],
    capital: "Asaba",
    population: "over 5.6 million",
    blurb:
      "Delta State combines oil-and-gas activity (Warri, Ughelli) with administrative and commercial centres like Asaba. Waste from petrochemical operations and urban centres both require coordinated management.",
  },
  ogun: {
    slug: "ogun",
    name: "Ogun State",
    matchTerms: ["ogun", "abeokuta", "ijebu ode", "sagamu", "ota", "mowe", "ibafo"],
    capital: "Abeokuta",
    population: "over 5.2 million",
    blurb:
      "Ogun State borders Lagos and absorbs significant industrial and residential overflow. Towns along the Lagos–Ibadan expressway like Mowe, Ibafo, and Ota deal with rapid population growth and stretched waste-collection capacity.",
  },
};

export function generateStaticParams() {
  return Object.keys(STATES).map((slug) => ({ state: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state } = await params;
  const info = STATES[state];
  if (!info) {
    return { title: "State Not Found", robots: { index: false, follow: false } };
  }

  const title = `Waste Reports & Dump Sites in ${info.name}, Nigeria`;
  const description = `Live map and list of waste reports, illegal dumpsites, and verified disposal locations in ${info.name}. Report illegal dumping near ${info.capital} and find recycling centers nearby on WasteMapNaija.`;

  return {
    title,
    description,
    alternates: { canonical: `/waste-reports/${state}` },
    keywords: [
      `waste management ${info.name}`,
      `illegal dumpsite ${info.capital}`,
      `report waste ${info.name}`,
      `recycling ${info.capital}`,
      `dump sites ${info.name}`,
      `cleanup ${info.capital}`,
    ],
    openGraph: {
      title,
      description,
      url: `/waste-reports/${state}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function StateLandingPage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const info = STATES[state];
  if (!info) notFound();

  // Build a substring filter that matches any of the address tokens for this state
  let reports: Array<{
    id: string;
    title: string;
    address: string | null;
    category: WasteCategory[];
    severity: SeverityLevel;
    status: ReportStatus;
    created_at: string;
  }> = [];

  let dumpSites: Array<{
    id: string;
    name: string;
    site_type: string;
    address: string | null;
    is_free: boolean;
  }> = [];

  let totalReports = 0;

  try {
    const supabase = await createClient();

    const orFilter = info.matchTerms
      .map((term) => `address.ilike.%${term}%`)
      .join(",");

    const [reportsRes, dumpSitesRes, totalRes] = await Promise.all([
      supabase
        .from("reports")
        .select("id, title, address, category, severity, status, created_at")
        .or(orFilter)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("dump_sites")
        .select("id, name, site_type, address, is_free")
        .eq("status", "verified")
        .or(orFilter)
        .order("upvote_count", { ascending: false })
        .limit(8),
      supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .or(orFilter),
    ]);

    reports = (reportsRes.data || []) as typeof reports;
    dumpSites = (dumpSitesRes.data || []) as typeof dumpSites;
    totalReports = totalRes.count ?? 0;
  } catch (err) {
    console.warn(`[waste-reports/${state}] Supabase fetch failed:`, err);
  }

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${siteUrl}/waste-reports/${state}#collection`,
    url: `${siteUrl}/waste-reports/${state}`,
    name: `Waste Reports & Dump Sites in ${info.name}, Nigeria`,
    description: `Live map and list of waste reports and verified disposal locations across ${info.name}.`,
    inLanguage: "en-NG",
    isPartOf: { "@id": `${siteUrl}/#website` },
    about: {
      "@type": "Place",
      name: info.name,
      address: { "@type": "PostalAddress", addressRegion: info.name, addressCountry: "NG" },
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: "Waste Reports by State",
          item: `${siteUrl}/waste-reports`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: info.name,
          item: `${siteUrl}/waste-reports/${state}`,
        },
      ],
    },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      {/* Hero */}
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
          Waste Reports by State
        </p>
        <h1 className="mt-1 text-3xl font-bold text-stone-900">
          Waste Reports & Dump Sites in {info.name}
        </h1>
        <p className="mt-3 text-base text-stone-600 leading-relaxed">
          {info.blurb}
        </p>
        <p className="mt-3 text-sm text-stone-500">
          Population: <span className="font-medium text-stone-700">{info.population}</span>
          {" · "}Capital:{" "}
          <span className="font-medium text-stone-700">{info.capital}</span>
          {totalReports > 0 && (
            <>
              {" · "}
              <span className="font-medium text-emerald-700">
                {totalReports.toLocaleString()} report
                {totalReports !== 1 ? "s" : ""} on record
              </span>
            </>
          )}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/reports/new">
              <FileText className="mr-2 size-4" />
              Report waste in {info.capital}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <MapPin className="mr-2 size-4" />
              View on full map
            </Link>
          </Button>
        </div>
      </header>

      {/* Recent reports */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-bold text-stone-900">
          Recent waste reports in {info.name}
        </h2>
        <p className="mb-4 text-sm text-stone-500">
          The most recent reports submitted by the WasteMapNaija community.
        </p>
        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-stone-500">
              No reports yet from {info.name}. Be the first to{" "}
              <Link href="/reports/new" className="text-emerald-600 underline">
                file a report
              </Link>
              .
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <Link
                key={r.id}
                href={`/reports/${r.id}`}
                className="block rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:border-stone-300 hover:bg-stone-50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-stone-900">
                      {r.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          color: SEVERITY_COLORS[r.severity],
                          borderColor: SEVERITY_COLORS[r.severity],
                        }}
                      >
                        {SEVERITY_LABELS[r.severity]}
                      </Badge>
                      {r.category.slice(0, 2).map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {CATEGORY_LABELS[cat]}
                        </Badge>
                      ))}
                    </div>
                    {r.address && (
                      <p className="mt-1.5 truncate text-xs text-stone-500">
                        {r.address}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-stone-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Dump sites */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-bold text-stone-900">
          Verified dump sites & recycling centers in {info.name}
        </h2>
        <p className="mb-4 text-sm text-stone-500">
          Official disposal locations confirmed by the community.
        </p>
        {dumpSites.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-stone-500">
              No verified dump sites yet for {info.name}.{" "}
              <Link href="/dump-sites/new" className="text-emerald-600 underline">
                Add a known location
              </Link>{" "}
              to help your community.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {dumpSites.map((d) => (
              <Link
                key={d.id}
                href={`/dump-sites/${d.id}`}
                className="block rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:border-stone-300 hover:bg-stone-50"
              >
                <div className="flex items-start gap-3">
                  <Trash2 className="size-5 shrink-0 text-emerald-500" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-stone-900">
                      {d.name}
                    </p>
                    <p className="text-xs text-stone-500 capitalize">
                      {d.site_type.replace(/_/g, " ")}
                      {d.is_free ? " · Free" : ""}
                    </p>
                    {d.address && (
                      <p className="mt-1 truncate text-xs text-stone-500">
                        {d.address}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* SEO content / FAQ */}
      <section className="mb-10 space-y-4 rounded-2xl border border-stone-200 bg-stone-50 p-6">
        <h2 className="text-xl font-bold text-stone-900">
          About waste management in {info.name}
        </h2>
        <p className="text-sm text-stone-700 leading-relaxed">
          WasteMapNaija helps residents of {info.name} report illegal dumpsites,
          discover verified disposal locations near {info.capital}, and connect
          with local waste collectors — for free. Every report contributes to a
          public, real-time map that authorities, NGOs, and community groups can
          use to coordinate cleanups.
        </p>
        <p className="text-sm text-stone-700 leading-relaxed">
          To report waste in {info.name}, snap a photo, pin the location, and
          submit. You earn green points for each verified report, which can be
          redeemed for airtime, mobile data, or cash. Cleanup organisers and
          verified waste collectors in {info.capital} and surrounding areas use
          the same map to identify hotspots and offer pickup services.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button asChild size="sm">
            <Link href="/reports/new">Report waste now</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/collectors">Find collectors</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/tips">Recycling tips</Link>
          </Button>
        </div>
      </section>

      {/* Other states */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-stone-900">
          Other Nigerian states
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.values(STATES)
            .filter((s) => s.slug !== state)
            .map((s) => (
              <Link
                key={s.slug}
                href={`/waste-reports/${s.slug}`}
                className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
              >
                {s.name}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
