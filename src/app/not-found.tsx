import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      {/* Animated illustration */}
      <div className="relative mb-8">
        {/* Outer ring */}
        <div className="absolute -inset-4 rounded-full bg-emerald-100/50 animate-pulse" />
        {/* Map pin with question */}
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-emerald-50 to-stone-100 border-2 border-emerald-200/60 shadow-lg">
          <MapPin className="h-12 w-12 text-emerald-400 drop-shadow-sm" />
          <span className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-white text-sm font-bold shadow-md">
            ?
          </span>
        </div>
      </div>

      {/* Error code */}
      <p className="mb-2 text-6xl font-extrabold tracking-tight text-stone-200 select-none">
        404
      </p>

      {/* Message */}
      <h1 className="mb-2 text-xl font-bold text-stone-900 sm:text-2xl">
        Lost in the wasteland
      </h1>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-stone-500">
        The page you&apos;re looking for doesn&apos;t exist, was moved, or may
        have been cleaned up already.
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/">
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-sm px-6">
            <Home className="h-4 w-4" />
            Back to Map
          </Button>
        </Link>
        <Link href="/dump-sites">
          <Button
            variant="outline"
            className="gap-2 border-stone-200 text-stone-700 hover:bg-stone-50 px-6"
          >
            <Search className="h-4 w-4" />
            Find Dump Sites
          </Button>
        </Link>
      </div>

      {/* Decorative dots */}
      <div className="mt-12 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-200" />
        <span className="h-1.5 w-1.5 rounded-full bg-stone-200" />
        <span className="h-1.5 w-1.5 rounded-full bg-stone-200" />
        <span className="h-1.5 w-1.5 rounded-full bg-stone-200" />
      </div>
    </div>
  );
}
