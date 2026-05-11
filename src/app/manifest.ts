import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "WasteMapNaija - Report & Track Waste Across Nigeria",
    short_name: "WasteMap",
    description:
      "Nigeria's community-powered waste reporting platform. Map illegal dumpsites, earn green points, join cleanup events, and help build a cleaner Nigeria.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#059669",
    lang: "en-NG",
    dir: "ltr",
    categories: ["utilities", "social", "lifestyle", "productivity"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Report Waste",
        short_name: "Report",
        description: "Submit a new waste report with photo and location",
        url: "/reports/new",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Cleanup Events",
        short_name: "Events",
        description: "Browse and join community cleanup events",
        url: "/events",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Nearby Dump Sites",
        short_name: "Dump Sites",
        description: "Find verified waste disposal locations near you",
        url: "/dump-sites/nearby",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Leaderboard",
        short_name: "Ranks",
        description: "See top waste reporters and green-point earners",
        url: "/leaderboard",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
    screenshots: [
      {
        src: "/opengraph-image",
        sizes: "1200x630",
        type: "image/png",
        form_factor: "wide",
        label: "WasteMapNaija — Mapping a cleaner Nigeria",
      },
    ],
  };
}
