import type { Metadata } from "next";
import { Lightbulb } from "lucide-react";
import { RECYCLING_TIPS } from "@/lib/data/recycling-tips";
import { TipCard } from "@/components/tips/tip-card";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://wastemapnaija.com.ng";

export const metadata: Metadata = {
  title: "Recycling Tips & Waste Management Education in Nigeria",
  description:
    "Practical recycling and waste-management tips for Nigerian households and communities — how to sort waste, compost at home, handle hazardous materials, and reduce landfill impact.",
  alternates: { canonical: "/tips" },
  keywords: [
    "recycling tips Nigeria",
    "how to sort waste",
    "composting Nigeria",
    "hazardous waste disposal Nigeria",
    "waste management education",
    "household recycling guide",
  ],
  openGraph: {
    title: "Recycling Tips & Waste Management Education in Nigeria",
    description:
      "Practical recycling tips for Nigerian households — sorting, composting, hazardous waste, and more.",
    url: "/tips",
    type: "article",
  },
};

export default function TipsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${siteUrl}/tips#collection`,
    url: `${siteUrl}/tips`,
    name: "Recycling Tips & Waste Management Education",
    description:
      "Practical recycling and waste-management tips for Nigerian households and communities.",
    inLanguage: "en-NG",
    isPartOf: { "@id": `${siteUrl}/#website` },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Recycling Tips",
          item: `${siteUrl}/tips`,
        },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: RECYCLING_TIPS.length,
      itemListElement: RECYCLING_TIPS.map((tip, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Article",
          "@id": `${siteUrl}/tips#${tip.id}`,
          headline: tip.title,
          description: tip.description,
          articleSection: tip.category,
          inLanguage: "en-NG",
          publisher: { "@id": `${siteUrl}/#organization` },
        },
      })),
    },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-emerald-500" />
          <h1 className="text-2xl font-bold text-stone-900">
            Recycling Tips & Education
          </h1>
        </div>
        <p className="mt-1 text-sm text-stone-500">
          Learn how to manage waste effectively, recycle properly, and make a
          positive impact on your community.
        </p>
      </div>

      <div className="space-y-4">
        {RECYCLING_TIPS.map((tip) => (
          <TipCard key={tip.id} tip={tip} />
        ))}
      </div>
    </div>
  );
}
