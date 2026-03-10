import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/providers/auth-provider";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://wastemapnaija.com.ng";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WasteMapNaija - Report & Track Waste Across Nigeria",
    template: "%s | WasteMapNaija",
  },
  description:
    "Nigeria's community-powered waste reporting platform. Map illegal dumpsites, earn green points, join cleanup events, and help build a cleaner Nigeria. Report waste in your neighbourhood today.",
  keywords: [
    "waste management Nigeria",
    "illegal dumpsite reporting",
    "waste map Nigeria",
    "environmental reporting Nigeria",
    "community cleanup Nigeria",
    "waste tracking",
    "green points",
    "cleanup events Nigeria",
    "waste collectors Nigeria",
    "environmental sustainability Nigeria",
    "report waste",
    "WasteMapNaija",
  ],
  authors: [{ name: "WasteMapNaija" }],
  creator: "WasteMapNaija",
  publisher: "WasteMapNaija",
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName: "WasteMapNaija",
    title: "WasteMapNaija - Report & Track Waste Across Nigeria",
    description:
      "Nigeria's community-powered waste reporting platform. Map illegal dumpsites, earn green points, join cleanup events, and help build a cleaner Nigeria.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WasteMapNaija - Mapping a Cleaner Nigeria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WasteMapNaija - Report & Track Waste Across Nigeria",
    description:
      "Nigeria's community-powered waste reporting platform. Map illegal dumpsites, earn green points, and help build a cleaner Nigeria.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";
  const isAdmin = pathname.startsWith("/admin");

  // Fetch auth state on the server so the client renders instantly
  let initialUser = null;
  let initialProfile: Profile | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      initialUser = user;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      initialProfile = data as Profile | null;
    }
  } catch {
    // Auth check failed — proceed as unauthenticated
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "WasteMapNaija",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/icon-512.png`,
        },
        description:
          "Nigeria's community-powered waste reporting and tracking platform.",
        areaServed: {
          "@type": "Country",
          name: "Nigeria",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "WasteMapNaija",
        publisher: { "@id": `${siteUrl}/#organization` },
        description:
          "Map illegal dumpsites, earn green points, join cleanup events, and help build a cleaner Nigeria.",
      },
    ],
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider
          initialUser={initialUser}
          initialProfile={initialProfile}
        >
          {!isAdmin && <Header />}
          <main className={isAdmin ? "" : "pt-14 pb-16 md:pb-0"}>
            {children}
          </main>
          {!isAdmin && <MobileNav />}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
