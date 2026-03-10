"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Shield, Gift, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { AuthBgPattern } from "@/components/auth/auth-bg-pattern";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.message) {
      setSuccess(result.message);
      setLoading(false);
    } else if (result?.redirectTo) {
      router.push(result.redirectTo);
      router.refresh();
    }
  }

  return (
    <>
      {/* Left side - Form */}
      <div className="relative flex h-full w-full flex-col justify-center bg-white px-6 py-6 lg:w-1/2 lg:py-12">
        <AuthBgPattern />
        <div className="relative z-10 mx-auto w-full max-w-[420px]">
          {/* Mobile header with branding */}
          <div className="mb-5 lg:hidden">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                <MapPin className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                WasteMapNaija
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-emerald-500" />
              <p className="text-xs text-emerald-700/70 font-medium tracking-wide uppercase">
                Join the clean-up movement
              </p>
            </div>
          </div>

          <div className="mb-4 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-stone-900">
              Create your account
            </h1>
            <p className="mt-1 text-sm lg:text-base text-stone-500">
              Join WasteMapNaija and help keep your community clean
            </p>
          </div>

          <form action={handleSubmit} className="space-y-3.5 lg:space-y-5">
            <div className="space-y-1">
              <label htmlFor="fullName" className="text-sm font-medium text-stone-700">
                Full name
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                required
                className="h-11 lg:h-12 rounded-xl border-stone-200 bg-white/80 backdrop-blur-sm px-4 text-base shadow-sm transition-all focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-emerald-500/10 focus:shadow-md"
              />
            </div>
            <div className="space-y-1">
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
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-stone-700">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                minLength={6}
                required
                className="h-11 lg:h-12 rounded-xl border-stone-200 bg-white/80 backdrop-blur-sm px-4 text-base shadow-sm transition-all focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-emerald-500/10 focus:shadow-md"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
                <p className="text-sm text-emerald-800">{success}</p>
                <Link
                  href="/login"
                  className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:underline"
                >
                  Go to Login
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}

            {!success && (
              <Button
                type="submit"
                className="h-11 lg:h-12 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-base font-semibold shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:from-emerald-700 hover:to-teal-700 transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  "Creating account..."
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            )}
          </form>

          {/* Mobile feature pills */}
          <div className="mt-4 flex flex-wrap justify-center gap-2 lg:hidden">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
              <Shield className="h-3 w-3" />
              Verified
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-100 px-2.5 py-1 text-[11px] font-medium text-teal-700">
              <Gift className="h-3 w-3" />
              Rewards
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
              <TrendingUp className="h-3 w-3" />
              Progress
            </span>
          </div>

          <div className="mt-4 lg:mt-6 text-center">
            <p className="text-sm text-stone-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>

          {/* Mobile quote */}
          <div className="mt-4 lg:hidden">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-4 shadow-xl shadow-emerald-900/10">
              <p className="text-xs italic text-white/90 leading-relaxed">
                &ldquo;The earth does not belong to us. We belong to the earth. Let&apos;s keep Nigeria clean together.&rdquo;
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

      {/* Right side - Image (desktop only) */}
      <div className="relative hidden w-1/2 lg:block">
        <img
          src="/images/auth-signup.jpg"
          alt="Waste that needs managing"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        {/* Top quote */}
        <div className="absolute top-0 left-0 right-0 p-10">
          <blockquote className="max-w-sm">
            <p className="text-xl font-semibold italic text-white leading-relaxed">
              &ldquo;The earth does not belong to us. We belong to the earth.&rdquo;
            </p>
            <footer className="mt-2 text-sm text-white/60">- Chief Seattle</footer>
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
            Don&apos;t look away. Every piece of waste you report moves Nigeria one step closer to the clean, healthy nation we all deserve.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3 text-center">
              <Shield className="mx-auto h-5 w-5 text-emerald-400 mb-1" />
              <span className="text-xs text-white/80 block">Verified Reports</span>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3 text-center">
              <Gift className="mx-auto h-5 w-5 text-emerald-400 mb-1" />
              <span className="text-xs text-white/80 block">Earn Rewards</span>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3 text-center">
              <TrendingUp className="mx-auto h-5 w-5 text-emerald-400 mb-1" />
              <span className="text-xs text-white/80 block">Track Progress</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
