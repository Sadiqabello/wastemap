"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-stone-900">
        Something went wrong
      </h2>
      <p className="mb-6 text-sm text-stone-500">
        An unexpected error occurred. Please try again.
      </p>
      <Button
        onClick={reset}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        Try again
      </Button>
    </div>
  );
}
