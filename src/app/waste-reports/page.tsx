import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://wastemapnaija.com.ng";

export const metadata: Metadata = {
  title: "Waste Reports by State — Nigeria Waste Map",
  description:
    "Browse waste reports, illegal dumpsites, and verified disposal locations by Nigerian state. Find reports in Lagos, Abuja, Kano, Rivers, Oyo, Kaduna, Plateau, Enugu, Delta, and Ogun.",
  alternates: { canonical: "/waste-reports" },
  openGraph: {
    title: "Waste Reports by State — Nigeria Waste Map",
    description:
      "Browse waste reports and verified dump sites for every major Nigerian state.",
    url: "/waste-reports",
    type: "website",
  },
};

const STATES = [
  { slug: "lagos", name: "Lagos State", capital: "Ikeja" },
  { slug: "abuja", name: "Abuja (FCT)", capital: "Abuja" },
  { slug: "kano", name: "Kano State", capital: "Kano" },
  { slug: "rivers", name: "Rivers State", capital: "Port Harcourt" },
  { slug: "oyo", name: "Oyo State", capital: "Ibadan" },
  { slug: "kaduna", name: "Kaduna State", capital: "Kaduna" },
  { slug: "plateau", name: "Plateau State", capital: "Jos" },
  { slug: "enugu", name: "Enugu State", capital: "Enugu" },
  { slug: "delta", name: "Delta State", capital: "Asaba" },
  { slug: "ogun", name: "Ogun State", capital: "Abeokuta" },
];

export default function WasteReportsByStatePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${siteUrl}/waste-reports#collection`,
    url: `${siteUrl}/waste-reports`,
    name: "Waste Reports by State — Nigeria",
    description:
      "Index of waste reports and dump sites across Nigerian states.",
    inLanguage: "en-NG",
    isPartOf: { "@id": `${siteUrl}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: STATES.length,
      itemListElement: STATES.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${siteUrl}/waste-reports/${s.slug}`,
        name: s.name,
      })),
    },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-8">
        <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
          Browse by State
        </p>
        <h1 className="mt-1 text-3xl font-bold text-stone-900">
          Waste Reports by Nigerian State
        </h1>
        <p className="mt-3 text-base text-stone-600 leading-relaxed">
          WasteMapNaija aggregates community-submitted waste reports from every
          Nigerian state. Pick a state below to see the most recent reports,
          verified dump sites, and recycling centers in your area.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {STATES.map((s) => (
          <Link
            key={s.slug}
            href={`/waste-reports/${s.slug}`}
            className="group block rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-emerald-300 hover:bg-emerald-50"
          >
            <div className="flex items-center gap-3">
              <MapPin className="size-5 text-emerald-500" />
              <div>
                <p className="font-semibold text-stone-900 group-hover:text-emerald-700">
                  {s.name}
                </p>
                <p className="text-xs text-stone-500">Capital: {s.capital}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
