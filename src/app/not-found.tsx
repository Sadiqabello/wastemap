import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
        <MapPin className="h-8 w-8 text-stone-400" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-stone-900">
        Page Not Found
      </h2>
      <p className="mb-6 text-sm text-stone-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/">
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          Back to Map
        </Button>
      </Link>
    </div>
  );
}
