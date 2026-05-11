import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://wastemapnaija.com.ng";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/admin/",
          "/profile/",
          "/notifications/",
          "/referrals/",
          "/challenges/",
          "/achievements/",
          "/dashboard/",
          "/reports",
          "/reports/",
          "/events/new",
          "/dump-sites/new",
          "/login",
          "/signup",
          "/callback",
          "/*?redirectTo=",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: [
          "/admin/",
          "/profile/",
          "/notifications/",
          "/referrals/",
          "/challenges/",
          "/achievements/",
          "/dashboard/",
          "/reports",
          "/reports/",
          "/events/new",
          "/dump-sites/new",
          "/login",
          "/signup",
          "/callback",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
