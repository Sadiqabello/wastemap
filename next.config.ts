import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "https://supabase.co").host;
  } catch {
    return "supabase.co";
  }
})();
const jitsiHost = (process.env.NEXT_PUBLIC_JITSI_DOMAIN || "meet.ffmuc.net").replace(
  /^https?:\/\//,
  ""
);

// Content Security Policy. Loose enough to cover everything the app actually
// uses (Supabase auth + storage, OpenStreetMap tiles, Jitsi iframe), tight
// enough to block third-party script injection. `'unsafe-inline'` on
// style-src is required because Tailwind's inline styles and Leaflet's
// inline marker styles don't go through a nonce; `'unsafe-eval'` is only
// allowed in development for fast refresh.
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https://*.${supabaseHost.split(".").slice(-2).join(".")} https://*.tile.openstreetmap.org`,
  `font-src 'self' data:`,
  `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://${jitsiHost}`,
  `frame-src 'self' https://${jitsiHost}`,
  `media-src 'self' blob:`,
  `worker-src 'self' blob:`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  isProd ? `upgrade-insecure-requests` : "",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    // Camera + geolocation are needed (report submission). Other powerful
    // features are off.
    value: "camera=(self), geolocation=(self), microphone=(self), payment=(), usb=()",
  },
  // HSTS is only honored over HTTPS, so it's a no-op locally. 1 year + preload.
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply to every route.
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
