"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createReport } from "@/lib/actions/reports";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationPicker } from "@/components/map/location-picker";
import { PhotoUploader } from "./photo-uploader";
import { CategorySelect } from "./category-select";
import { SeveritySelect } from "./severity-select";
import { Loader2, Send } from "lucide-react";
import type { WasteCategory, SeverityLevel } from "@/types";

export function ReportForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [category, setCategory] = useState<WasteCategory | "">("");
  const [severity, setSeverity] = useState<SeverityLevel | "">("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim() || title.trim().length < 5) {
      toast.error("Please enter a title (at least 5 characters)");
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      toast.error("Please enter a description (at least 10 characters)");
      return;
    }
    if (!location) {
      toast.error("Please select a location on the map");
      return;
    }
    if (!category) {
      toast.error("Please select a waste category");
      return;
    }
    if (!severity) {
      toast.error("Please select a severity level");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.set("title", title.trim());
    formData.set("description", description.trim());
    formData.set("latitude", String(location[0]));
    formData.set("longitude", String(location[1]));
    formData.set("category", category);
    formData.set("severity", severity);
    if (address.trim()) formData.set("address", address.trim());
    photoUrls.forEach((url) => formData.append("photoUrls", url));

    const result = await createReport(formData);

    if (result?.error) {
      toast.error(
        typeof result.error === "string"
          ? result.error
          : "Please fix the form errors and try again"
      );
      setLoading(false);
      return;
    }

    toast.success("Report submitted successfully!");
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Illegal dumpsite near market"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the waste, its impact on the community, and any other relevant details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Location</CardTitle>
        </CardHeader>
        <CardContent>
          <LocationPicker
            value={location}
            onChange={(lat, lng) => setLocation([lat, lng])}
          />
          <div className="mt-3 space-y-2">
            <label htmlFor="address" className="text-sm font-medium">
              Address / Landmark{" "}
              <span className="text-xs text-stone-500">(optional)</span>
            </label>
            <Input
              id="address"
              name="address"
              placeholder="e.g., Behind Wuse Market, Abuja"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CategorySelect value={category} onChange={setCategory} />
          <SeveritySelect value={severity} onChange={setSeverity} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evidence</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUploader
            userId={user?.id || ""}
            value={photoUrls}
            onChange={setPhotoUrls}
          />
        </CardContent>
      </Card>

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
            Submit Report
          </>
        )}
      </Button>
    </form>
  );
}
