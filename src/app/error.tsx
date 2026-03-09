"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home, Bug } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      {/* Animated illustration */}
      <div className="relative mb-8">
        <div className="absolute -inset-4 rounded-full bg-red-100/40 animate-pulse" />
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200/60 shadow-lg">
          {/* Trash bin with "broken" effect */}
          <svg
            viewBox="0 0 64 64"
            className="h-14 w-14 text-red-400 drop-shadow-sm"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Bin body */}
            <path d="M16 20h32l-3 34H19L16 20z" />
            {/* Lid */}
            <path d="M12 16h40" />
            <path d="M24 16v-4h16v4" />
            {/* Cracks */}
            <path
              d="M28 28l-2 8 3 6"
              className="text-red-300"
              strokeDasharray="3 2"
            />
            <path
              d="M38 26l1 10-2 6"
              className="text-red-300"
              strokeDasharray="3 2"
            />
          </svg>
          {/* Warning badge */}
          <span className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-md">
            <Bug className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* Error code */}
      <p className="mb-2 text-6xl font-extrabold tracking-tight text-stone-200 select-none">
        500
      </p>

      {/* Message */}
      <h1 className="mb-2 text-xl font-bold text-stone-900 sm:text-2xl">
        Something broke
      </h1>
      <p className="mb-2 max-w-sm text-sm leading-relaxed text-stone-500">
        An unexpected error occurred. Don&apos;t worry — your data is safe.
        Let&apos;s try that again.
      </p>

      {/* Error digest for debugging */}
      {error.digest && (
        <p className="mb-6 font-mono text-xs text-stone-300">
          Error ID: {error.digest}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row mt-4">
        <Button
          onClick={reset}
          className="gap-2 bg-red-600 hover:bg-red-700 shadow-sm px-6"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Link href="/">
          <Button
            variant="outline"
            className="gap-2 border-stone-200 text-stone-700 hover:bg-stone-50 px-6"
          >
            <Home className="h-4 w-4" />
            Back to Map
          </Button>
        </Link>
      </div>

      {/* Decorative dots */}
      <div className="mt-12 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-red-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-red-200" />
        <span className="h-1.5 w-1.5 rounded-full bg-stone-200" />
        <span className="h-1.5 w-1.5 rounded-full bg-stone-200" />
        <span className="h-1.5 w-1.5 rounded-full bg-stone-200" />
      </div>
    </div>
  );
}
