"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.append("redirectTo", redirectTo);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      router.push(result.redirectTo || redirectTo);
      router.refresh();
    }
  }

  return (
    <>
      {/* Left: hero image (desktop only) */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/images/auth-login.jpg"
          alt="A cleaner Nigeria"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-emerald-900/10" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">WasteMapNaija</span>
          </div>
          <p className="max-w-sm text-base text-white/90">
            Mapping a cleaner Nigeria, one report at a time.
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex h-full w-full flex-col justify-center bg-white px-6 py-10 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile brand */}
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-stone-900">
              WasteMapNaija
            </span>
          </div>

          <h1 className="text-2xl font-bold text-stone-900">Welcome back</h1>
          <p className="mt-1 text-sm text-stone-500">
            Log in to your account
          </p>

          <form action={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-stone-700"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-stone-700"
              >
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="h-11"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="h-11 w-full bg-emerald-600 text-base font-semibold hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
