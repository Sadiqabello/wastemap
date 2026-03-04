import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { EventForm } from "@/components/events/event-form";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/events/new");
  }

  const params = await searchParams;
  const defaultLat = params.lat ? Number(params.lat) : undefined;
  const defaultLng = params.lng ? Number(params.lng) : undefined;
  const defaultAddress = params.address || undefined;
  const reportId = params.reportId || undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/events">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">
          Create Cleanup Event
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Organize a community cleanup and make a real impact
        </p>
      </div>

      <EventForm
        defaultLat={defaultLat}
        defaultLng={defaultLng}
        defaultAddress={defaultAddress}
        reportId={reportId}
      />
    </div>
  );
}
