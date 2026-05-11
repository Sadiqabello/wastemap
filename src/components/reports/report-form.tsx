"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createReport } from "@/lib/actions/reports";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LocationPicker } from "@/components/map/location-picker";
import { PhotoUploader } from "./photo-uploader";
import { CategorySelect } from "./category-select";
import { SeveritySelect } from "./severity-select";
import { CATEGORY_LABELS } from "@/lib/constants";
import { ChevronDown, Loader2, Send } from "lucide-react";
import type { WasteCategory, SeverityLevel } from "@/types";

type FormErrors = Partial<{
  title: string;
  description: string;
  location: string;
  categories: string;
  photos: string;
}>;

export function ReportForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [severity, setSeverity] = useState<SeverityLevel>("medium");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Derive a suggested title from category + address; only used while the
  // user hasn't typed anything yet.
  const suggestedTitle =
    categories.length > 0
      ? address.trim()
        ? `${CATEGORY_LABELS[categories[0]]} waste at ${address.trim()}`
        : `${CATEGORY_LABELS[categories[0]]} waste reported`
      : "";
  const displayedTitle = titleTouched ? title : title || suggestedTitle;

  function validate(): FormErrors {
    const next: FormErrors = {};
    const titleToCheck = (titleTouched ? title : displayedTitle).trim();
    if (!titleToCheck || titleToCheck.length < 5) {
      next.title = "Add a short title (at least 5 characters).";
    }
    if (description.trim().length > 0 && description.trim().length < 10) {
      next.description = "Description should be at least 10 characters, or leave it blank.";
    }
    if (!location) {
      next.location = "Tap the map or use your location.";
    }
    if (categories.length === 0) {
      next.categories = "Pick at least one waste type.";
    }
    if (photoUrls.length === 0) {
      next.photos = "Add at least one photo so others can verify.";
    }
    return next;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      // Scroll the first error into view
      const firstKey = Object.keys(next)[0];
      document
        .getElementById(`field-${firstKey}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);

    const finalTitle = (titleTouched ? title : displayedTitle).trim();
    const formData = new FormData();
    formData.set("title", finalTitle);
    formData.set("description", description.trim() || finalTitle);
    formData.set("latitude", String(location![0]));
    formData.set("longitude", String(location![1]));
    categories.forEach((cat) => formData.append("category", cat));
    formData.set("severity", severity);
    if (address.trim()) formData.set("address", address.trim());
    photoUrls.forEach((url) => formData.append("photoUrls", url));

    const result = await createReport(formData);

    if (result?.error) {
      toast.error(
        typeof result.error === "string"
          ? result.error
          : "Couldn't submit — check the form and try again."
      );
      setLoading(false);
      return;
    }

    toast.success("Report submitted. Thank you!");
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24 md:pb-0">
      {/* Step 1: Photo (lead with the action people are already prepared to take) */}
      <section id="field-photos" className="space-y-2">
        <h2 className="text-sm font-semibold text-stone-900">
          1. Add a photo
        </h2>
        <PhotoUploader
          userId={user?.id || ""}
          value={photoUrls}
          onChange={(urls) => {
            setPhotoUrls(urls);
            if (errors.photos) setErrors((e) => ({ ...e, photos: undefined }));
          }}
        />
        {errors.photos && (
          <p className="text-xs text-red-600">{errors.photos}</p>
        )}
      </section>

      {/* Step 2: Location */}
      <section id="field-location" className="space-y-2">
        <h2 className="text-sm font-semibold text-stone-900">
          2. Where is it?
        </h2>
        <LocationPicker
          value={location}
          onChange={(lat, lng) => {
            setLocation([lat, lng]);
            if (errors.location)
              setErrors((e) => ({ ...e, location: undefined }));
          }}
        />
        {errors.location && (
          <p className="text-xs text-red-600">{errors.location}</p>
        )}
        <Input
          id="address"
          name="address"
          placeholder="Landmark (optional) — e.g. Behind Wuse Market"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-2"
        />
      </section>

      {/* Step 3: What kind of waste */}
      <section id="field-categories" className="space-y-2">
        <h2 className="text-sm font-semibold text-stone-900">
          3. What kind of waste?
        </h2>
        <CategorySelect
          value={categories}
          onChange={(cats) => {
            setCategories(cats);
            if (errors.categories)
              setErrors((e) => ({ ...e, categories: undefined }));
          }}
        />
        {errors.categories && (
          <p className="text-xs text-red-600">{errors.categories}</p>
        )}
      </section>

      {/* Step 4: Severity (defaults to medium so it's not a blocker) */}
      <section className="space-y-2">
        <SeveritySelect value={severity} onChange={setSeverity} />
      </section>

      {/* Step 5: Title (auto-suggested) + optional description */}
      <section id="field-title" className="space-y-2">
        <h2 className="text-sm font-semibold text-stone-900">
          4. Title
        </h2>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Household waste at Wuse Market"
          value={displayedTitle}
          onChange={(e) => {
            setTitle(e.target.value);
            setTitleTouched(true);
            if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
          }}
          maxLength={100}
        />
        {!titleTouched && suggestedTitle && (
          <p className="text-xs text-stone-400">
            Suggested — tap to edit.
          </p>
        )}
        {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}

        <button
          type="button"
          onClick={() => setDetailsOpen((v) => !v)}
          className="mt-2 flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-700"
        >
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${
              detailsOpen ? "rotate-180" : ""
            }`}
          />
          {detailsOpen ? "Hide" : "Add"} description (optional)
        </button>

        {detailsOpen && (
          <div id="field-description" className="mt-2 space-y-1">
            <Textarea
              id="description"
              name="description"
              placeholder="Anything else? Impact on community, how long it's been there..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors((e) => ({ ...e, description: undefined }));
              }}
              maxLength={2000}
              rows={3}
            />
            {errors.description && (
              <p className="text-xs text-red-600">{errors.description}</p>
            )}
          </div>
        )}
      </section>

      {/* Submit — sticky on mobile so it's always reachable */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t bg-white p-4 shadow-lg md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none">
        <Button
          type="submit"
          size="lg"
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Submit report
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
