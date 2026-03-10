import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "WasteMapNaija - Mapping a Cleaner Nigeria";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background:
            "linear-gradient(135deg, #059669 0%, #0d9488 50%, #065f46 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "18px",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-1px",
            }}
          >
            WasteMapNaija
          </span>
        </div>

        <p
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.9)",
            margin: "0 0 40px 0",
            maxWidth: "700px",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Nigeria&apos;s community-powered platform for reporting and tracking
          illegal waste dumpsites
        </p>

        <div style={{ display: "flex", gap: "16px" }}>
          {["Map Dumpsites", "Earn Green Points", "Join Cleanups", "Track Impact"].map(
            (label) => (
              <div
                key={label}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "9999px",
                  padding: "10px 24px",
                  fontSize: "18px",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            )
          )}
        </div>

        <p
          style={{
            position: "absolute",
            bottom: "30px",
            fontSize: "18px",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          wastemapnaija.com.ng
        </p>
      </div>
    ),
    { ...size }
  );
}
