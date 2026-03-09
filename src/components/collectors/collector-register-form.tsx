"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { registerCollector } from "@/lib/actions/collectors";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { WasteCategory } from "@/types";

const categories = Object.entries(CATEGORY_LABELS) as [WasteCategory, string][];

export function CollectorRegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("waste_categories", selectedCategories.join(","));

    const result = await registerCollector(formData);
    setLoading(false);

    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Validation failed");
    } else {
      toast.success("Registration submitted! Awaiting verification.");
      router.push("/collectors/dashboard");
    }
  }

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="business_name">Business Name *</Label>
            <Input
              id="business_name"
              name="business_name"
              required
              placeholder="Your waste collection business name"
            />
          </div>

          <div>
            <Label htmlFor="business_registration">
              Business Registration (CAC)
            </Label>
            <Input
              id="business_registration"
              name="business_registration"
              placeholder="Optional: RC number"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              name="phone"
              required
              placeholder="08012345678"
            />
          </div>

          <div>
            <Label htmlFor="address">Service Area Address</Label>
            <Input
              id="address"
              name="address"
              placeholder="Your base location"
            />
          </div>

          <div>
            <Label htmlFor="service_area_radius">
              Service Radius (km)
            </Label>
            <Input
              id="service_area_radius"
              name="service_area_radius"
              type="number"
              min={1}
              max={100}
              defaultValue={10}
            />
          </div>

          <div>
            <Label htmlFor="description">About Your Service</Label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Describe your waste collection capabilities..."
            />
          </div>

          <div>
            <Label>Waste Categories You Handle *</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleCategory(value)}
                  className={`rounded-full px-3 py-1 text-xs border transition-colors ${
                    selectedCategories.includes(value)
                      ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                      : "bg-stone-50 border-stone-200 text-stone-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Registration
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
