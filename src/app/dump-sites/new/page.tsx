import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { AddDumpSiteForm } from "@/components/dump-sites/add-dump-site-form";

export default async function NewDumpSitePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/dump-sites/new");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/dump-sites">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Dump Sites
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Add a Dump Site</h1>
        <p className="mt-1 text-sm text-stone-500">
          Help others find waste disposal locations in your area
        </p>
      </div>

      <AddDumpSiteForm />
    </div>
  );
}
