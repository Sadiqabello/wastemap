import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CollectorRegisterForm } from "@/components/collectors/collector-register-form";

export default async function CollectorRegisterPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/collectors/register");
  }

  // Check if already registered
  const { data: existing } = await supabase
    .from("collector_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    redirect("/collectors/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">
          Register as Collector
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Join our network of verified waste collectors and earn from pickups
        </p>
      </div>

      <CollectorRegisterForm />
    </div>
  );
}
