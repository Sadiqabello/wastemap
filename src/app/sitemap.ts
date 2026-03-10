import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wastemapnaija.ng";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/dashboard",
    "/events",
    "/rewards",
    "/collectors",
    "/dump-sites",
    "/challenges",
    "/leaderboard",
    "/login",
    "/signup",
  ];

  return staticPages.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/dashboard" ? 0.9 : 0.7,
  }));
}
