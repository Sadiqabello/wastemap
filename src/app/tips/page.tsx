import { Lightbulb } from "lucide-react";
import { RECYCLING_TIPS } from "@/lib/data/recycling-tips";
import { TipCard } from "@/components/tips/tip-card";

export default function TipsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-emerald-500" />
          <h1 className="text-2xl font-bold text-stone-900">
            Recycling Tips & Education
          </h1>
        </div>
        <p className="mt-1 text-sm text-stone-500">
          Learn how to manage waste effectively, recycle properly, and make a
          positive impact on your community.
        </p>
      </div>

      <div className="space-y-4">
        {RECYCLING_TIPS.map((tip) => (
          <TipCard key={tip.id} tip={tip} />
        ))}
      </div>
    </div>
  );
}
