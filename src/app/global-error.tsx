"use client";

import { useEffect } from "react";
import { Geist } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-stone-50`}>
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          {/* Illustration */}
          <div className="relative mb-8">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200/60 shadow-xl">
              <svg
                viewBox="0 0 64 64"
                className="h-16 w-16 text-orange-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Globe */}
                <circle cx="32" cy="32" r="24" />
                <ellipse cx="32" cy="32" rx="10" ry="24" />
                <path d="M8 32h48" />
                <path d="M12 20h40" />
                <path d="M12 44h40" />
                {/* X mark */}
                <circle
                  cx="48"
                  cy="16"
                  r="10"
                  fill="#ef4444"
                  stroke="#ef4444"
                />
                <path d="M44 12l8 8M52 12l-8 8" stroke="white" strokeWidth={2.5} />
              </svg>
            </div>
          </div>

          {/* Error code */}
          <p
            className="mb-3 font-extrabold tracking-tight text-stone-200 select-none"
            style={{ fontSize: "5rem", lineHeight: 1 }}
          >
            503
          </p>

          {/* Message */}
          <h1 className="mb-3 text-2xl font-bold text-stone-900">
            Service temporarily unavailable
          </h1>
          <p className="mb-3 max-w-md text-sm leading-relaxed text-stone-500">
            WasteMapNaija encountered a critical error. This is usually temporary.
            Please try again in a moment.
          </p>

          {error.digest && (
            <p className="mb-6 font-mono text-xs text-stone-300">
              Error ID: {error.digest}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row mt-2">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-6 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go Home
            </a>
          </div>

          {/* Branding */}
          <p className="mt-16 text-xs text-stone-300">
            WasteMapNaija &mdash; Keeping communities clean
          </p>
        </div>
      </body>
    </html>
  );
}
