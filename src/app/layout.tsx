import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/providers/auth-provider";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WasteMap - Report Waste in Your Community",
  description:
    "A community-powered platform for reporting and tracking illegal waste dumpsites. Help keep your environment clean.",
  openGraph: {
    title: "WasteMap - Report Waste in Your Community",
    description:
      "A community-powered platform for reporting and tracking illegal waste dumpsites.",
    type: "website",
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

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
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
