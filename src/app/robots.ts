import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wastemapnaija.ng";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/profile/", "/notifications/", "/pickups/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
