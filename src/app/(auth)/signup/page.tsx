"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, ArrowRight } from "lucide-react";

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
      {/* Left: form */}
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

          <h1 className="text-2xl font-bold text-stone-900">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Free, takes 30 seconds.
          </p>

          <form action={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="fullName"
                className="text-sm font-medium text-stone-700"
              >
                Full name
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Your name"
                required
                className="h-11"
              />
            </div>
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
                placeholder="At least 6 characters"
                minLength={6}
                required
                className="h-11"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                <p className="text-sm text-emerald-800">{success}</p>
                <Link
                  href="/login"
                  className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline"
                >
                  Go to log in
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}

            {!success && (
              <Button
                type="submit"
                className="h-11 w-full bg-emerald-600 text-base font-semibold hover:bg-emerald-700"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right: hero (desktop only) */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/images/auth-signup.jpg"
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
            Every report moves Nigeria one step closer to the clean, healthy
            country we all deserve.
          </p>
        </div>
      </div>
    </>
  );
}
