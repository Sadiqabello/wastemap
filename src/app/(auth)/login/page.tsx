"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Leaf, BarChart3, Users, ArrowRight } from "lucide-react";
import { AuthBgPattern } from "@/components/auth/auth-bg-pattern";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
    }
  }

  return (
    <>
      {/* Left side - Image (desktop only) */}
      <div className="relative hidden w-1/2 lg:block">
        <img
          src="/images/auth-login.jpg"
          alt="Recycling bins"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        {/* Top quote */}
        <div className="absolute top-0 left-0 right-0 p-10">
          <blockquote className="max-w-sm">
            <p className="text-xl font-semibold italic text-white leading-relaxed">
              &ldquo;A clean Nigeria starts with a single report.&rdquo;
            </p>
          </blockquote>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">WasteMapNaija</span>
          </div>
          <p className="text-lg text-white/90 max-w-md leading-relaxed">
            Our environment is our legacy. Together, we can map every waste hotspot across Nigeria and turn neglect into action.
          </p>
          <div className="mt-6 flex gap-6">
            <div className="flex items-center gap-2 text-white/80">
              <Leaf className="h-4 w-4 text-emerald-400" />
              <span className="text-sm">Track Impact</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              <span className="text-sm">Earn Rewards</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Users className="h-4 w-4 text-emerald-400" />
              <span className="text-sm">Community</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="relative flex h-full w-full flex-col justify-center bg-white px-6 py-6 lg:w-1/2 lg:py-12">
        <AuthBgPattern />
        <div className="relative z-10 mx-auto w-full max-w-[420px]">
          {/* Mobile header with branding + tagline */}
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                <MapPin className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                WasteMapNaija
              </span>
            </div>
            <p className="text-xs text-emerald-700/70 font-medium tracking-wide uppercase">
              Mapping a cleaner Nigeria
            </p>
          </div>

          <div className="mb-5 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-stone-900">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm lg:text-base text-stone-500">
              Log in to report and track waste in your community
            </p>
          </div>

          <form action={handleSubmit} className="space-y-4 lg:space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-stone-700">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="h-11 lg:h-12 rounded-xl border-stone-200 bg-white/80 backdrop-blur-sm px-4 text-base shadow-sm transition-all focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-emerald-500/10 focus:shadow-md"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-stone-700">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                className="h-11 lg:h-12 rounded-xl border-stone-200 bg-white/80 backdrop-blur-sm px-4 text-base shadow-sm transition-all focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-emerald-500/10 focus:shadow-md"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="h-11 lg:h-12 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-base font-semibold shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:from-emerald-700 hover:to-teal-700 transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                "Logging in..."
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Log in
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Mobile feature pills */}
          <div className="mt-5 flex flex-wrap justify-center gap-2 lg:hidden">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              <Leaf className="h-3 w-3" />
              Track Impact
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-100 px-3 py-1 text-xs font-medium text-teal-700">
              <BarChart3 className="h-3 w-3" />
              Earn Rewards
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              <Users className="h-3 w-3" />
              Community
            </span>
          </div>

          <div className="mt-5 lg:mt-8 text-center">
            <p className="text-sm text-stone-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>

          {/* Mobile quote */}
          <div className="mt-5 lg:hidden">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-4 shadow-xl shadow-emerald-900/10">
              <p className="text-xs italic text-white/90 leading-relaxed">
                &ldquo;A clean Nigeria starts with a single report. Your voice matters.&rdquo;
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-px flex-1 bg-white/20" />
                <MapPin className="h-3 w-3 text-emerald-300" />
                <span className="text-xs text-emerald-200 font-medium">WasteMapNaija</span>
                <div className="h-px flex-1 bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
