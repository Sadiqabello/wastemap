import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://wastemapnaija.com.ng";

const NIGERIAN_STATE_SLUGS = [
  "lagos",
  "abuja",
  "kano",
  "rivers",
  "oyo",
  "kaduna",
  "plateau",
  "enugu",
  "delta",
  "ogun",
];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1.0, lastModified: now },
    { url: `${siteUrl}/events`, changeFrequency: "daily", priority: 0.9, lastModified: now },
    { url: `${siteUrl}/dump-sites`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${siteUrl}/leaderboard`, changeFrequency: "daily", priority: 0.6, lastModified: now },
    { url: `${siteUrl}/tips`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${siteUrl}/waste-reports`, changeFrequency: "daily", priority: 0.9, lastModified: now },
  ];

  const stateEntries: MetadataRoute.Sitemap = NIGERIAN_STATE_SLUGS.map(
    (state) => ({
      url: `${siteUrl}/waste-reports/${state}`,
      changeFrequency: "daily" as const,
      priority: 0.85,
      lastModified: now,
    })
  );

  let dynamicEntries: MetadataRoute.Sitemap = [];

  try {
    const supabase = await createClient();

    const [eventsRes, dumpSitesRes] = await Promise.all([
      supabase
        .from("events")
        .select("id, updated_at, status")
        .in("status", ["upcoming", "in_progress", "completed"])
        .order("updated_at", { ascending: false })
        .limit(5000),
      supabase
        .from("dump_sites")
        .select("id, updated_at, status")
        .eq("status", "verified")
        .order("updated_at", { ascending: false })
        .limit(5000),
    ]);

    const eventEntries: MetadataRoute.Sitemap = (eventsRes.data || []).map(
      (e: { id: string; updated_at: string; status: string }) => ({
        url: `${siteUrl}/events/${e.id}`,
        lastModified: e.updated_at ? new Date(e.updated_at) : now,
        changeFrequency: e.status === "upcoming" ? "daily" : "weekly",
        priority: e.status === "upcoming" ? 0.8 : 0.5,
      })
    );

    const dumpSiteEntries: MetadataRoute.Sitemap = (
      dumpSitesRes.data || []
    ).map((d: { id: string; updated_at: string }) => ({
      url: `${siteUrl}/dump-sites/${d.id}`,
      lastModified: d.updated_at ? new Date(d.updated_at) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    dynamicEntries = [...eventEntries, ...dumpSiteEntries];
  } catch (err) {
    // Supabase unreachable at build/request time — fall back to static sitemap.
    console.warn("[sitemap] Skipping dynamic entries:", err);
  }

  return [...staticEntries, ...stateEntries, ...dynamicEntries];
}
