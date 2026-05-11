"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, MapPin, Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "wm:onboarded:v1";

interface WelcomeSheetProps {
  isAuthenticated: boolean;
}

export function WelcomeSheet({ isAuthenticated }: WelcomeSheetProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-end sm:items-center sm:justify-center">
      <button
        type="button"
        aria-label="Close welcome"
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        onClick={dismiss}
      />
      <div className="relative w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-4 top-4 rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-xl font-bold text-stone-900">
          Welcome to WasteMapNaija
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Help build a cleaner Nigeria in 3 simple steps.
        </p>

        <div className="mt-5 space-y-3">
          {[
            {
              icon: MapPin,
              title: "Spot waste in your area",
              body: "Find illegal dumpsites near you on the map.",
            },
            {
              icon: Camera,
              title: "Snap a photo & report",
              body: "Take a quick photo, pin the spot, submit.",
            },
            {
              icon: Gift,
              title: "Earn green points",
              body: "Redeem for airtime, mobile data, or cash.",
            },
          ].map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="flex gap-3 rounded-xl bg-stone-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-stone-900">
                  <span className="mr-1 text-emerald-600">{i + 1}.</span>
                  {title}
                </p>
                <p className="mt-0.5 text-xs text-stone-500">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          {isAuthenticated ? (
            <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              <Link href="/reports/new" onClick={dismiss}>
                Report waste now
              </Link>
            </Button>
          ) : (
            <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              <Link href="/signup" onClick={dismiss}>
                Create free account
              </Link>
            </Button>
          )}
          <Button variant="outline" onClick={dismiss}>
            Explore the map
          </Button>
        </div>
      </div>
    </div>
  );
}
