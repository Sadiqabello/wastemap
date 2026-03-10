"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { compressImage } from "@/lib/compress-image";
import { Camera, Loader2, X } from "lucide-react";
import { CameraCapture } from "@/components/camera-capture";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import { addDumpSite } from "@/lib/actions/dump-sites";
import { LocationPicker } from "@/components/map/location-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DUMP_SITE_TYPE_LABELS,
  CATEGORY_LABELS,
} from "@/lib/constants";
import type { DumpSiteType, WasteCategory } from "@/types";

const MAX_PHOTOS = 4;

export function AddDumpSiteForm() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [siteType, setSiteType] = useState<DumpSiteType>("trash_can");
  const [address, setAddress] = useState("");
  const [operatingHours, setOperatingHours] = useState("");
  const [accepts, setAccepts] = useState<WasteCategory[]>([]);
  const [isFree, setIsFree] = useState(false);
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const photoUrlsRef = useRef(photoUrls);
  photoUrlsRef.current = photoUrls;

  const handlePhotoCapture = useCallback(
    async (blob: Blob) => {
      setCameraOpen(false);

      if (!user) {
        toast.error("You must be signed in to upload photos");
        return;
      }

      const remaining = MAX_PHOTOS - photoUrlsRef.current.length;
      if (remaining <= 0) return;

      setUploading(true);
      setUploadProgress("Compressing photo...");

      const supabase = createClient();

      try {
        let compressed: Blob;
        try {
          const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
          compressed = await compressImage(file);
        } catch {
          compressed = blob;
        }

        setUploadProgress("Uploading photo...");

        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

        // Try dump-site-photos bucket first, fall back to report-photos
        let bucket = "dump-site-photos";
        let actualPath = fileName;

        const { error: err1 } = await supabase.storage
          .from(bucket)
          .upload(fileName, compressed, { contentType: "image/jpeg" });

        if (err1) {
          bucket = "report-photos";
          actualPath = `dump-sites/${fileName}`;
          const { error: err2 } = await supabase.storage
            .from(bucket)
            .upload(actualPath, compressed, { contentType: "image/jpeg" });

          if (err2) {
            console.error("Upload error:", err2);
            toast.error("Upload failed. Please try again.");
            return;
          }
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(actualPath);

        setPhotoUrls((prev) => [...prev, publicUrl]);
        toast.success("Photo uploaded");
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Upload failed. Please try again.");
      } finally {
        setUploading(false);
        setUploadProgress("");
      }
    },
    [user]
  );

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleAccepts = (category: WasteCategory) => {
    setAccepts((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!location) {
      toast.error("Please select a location on the map");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("description", description.trim());
      formData.set("site_type", siteType);
      formData.set("latitude", location[0].toString());
      formData.set("longitude", location[1].toString());
      formData.set("address", address.trim());
      formData.set("operating_hours", operatingHours.trim());
      formData.set("is_free", isFree ? "true" : "false");

      for (const url of photoUrls) {
        formData.append("photo_urls", url);
      }
      for (const cat of accepts) {
        formData.append("accepts", cat);
      }

      const result = await addDumpSite(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Dump site added successfully!");
      router.push("/dump-sites");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a Dump Site</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              placeholder="e.g. Wuse Market Recycling Bin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Describe the dump site..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Site Type */}
          <div className="space-y-1">
            <label htmlFor="site_type" className="text-sm font-medium">
              Site Type
            </label>
            <select
              id="site_type"
              value={siteType}
              onChange={(e) => setSiteType(e.target.value as DumpSiteType)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {(Object.entries(DUMP_SITE_TYPE_LABELS) as [DumpSiteType, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label htmlFor="address" className="text-sm font-medium">
              Address
            </label>
            <Input
              id="address"
              placeholder="Street address or landmark"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Operating Hours */}
          <div className="space-y-1">
            <label htmlFor="operating_hours" className="text-sm font-medium">
              Operating Hours
            </label>
            <Input
              id="operating_hours"
              placeholder="e.g. Mon-Fri 8am-6pm"
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
            />
          </div>

          {/* Accepts (waste categories) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Accepts</label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(CATEGORY_LABELS) as [WasteCategory, string][]).map(
                ([value, label]) => (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
                      accepts.includes(value)
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={accepts.includes(value)}
                      onChange={() => toggleAccepts(value)}
                      className="sr-only"
                    />
                    {label}
                  </label>
                )
              )}
            </div>
          </div>

          {/* Is Free */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium">Free to use</span>
          </label>

          {/* Location Picker */}
          <LocationPicker value={location} onChange={(lat, lng) => setLocation([lat, lng])} />

          {/* Photo Capture */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Photos <span className="text-xs text-stone-500">(up to {MAX_PHOTOS})</span>
            </label>

            {photoUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {photoUrls.map((url, index) => (
                  <div
                    key={url}
                    className="group relative aspect-square overflow-hidden rounded-lg border"
                  >
                    <Image
                      src={url}
                      alt={`Dump site photo ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photoUrls.length < MAX_PHOTOS && !uploading && (
              <button
                type="button"
                onClick={() => setCameraOpen(true)}
                className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-6 transition-colors hover:border-emerald-400 hover:bg-emerald-50"
              >
                <div className="mb-2 rounded-full bg-emerald-100 p-2">
                  <Camera className="h-6 w-6 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-stone-700">
                  {photoUrls.length === 0 ? "Take Photo" : "Take Another Photo"}
                </span>
                <span className="text-xs text-stone-500">Opens your camera</span>
              </button>
            )}

            {uploading && (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50 px-4 py-6">
                <Loader2 className="mb-2 h-8 w-8 animate-spin text-emerald-600" />
                <span className="text-sm text-stone-600">{uploadProgress || "Uploading..."}</span>
              </div>
            )}

            {/* Full-screen camera overlay */}
            {cameraOpen && (
              <CameraCapture
                onCapture={handlePhotoCapture}
                onClose={() => setCameraOpen(false)}
              />
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Add Dump Site"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
