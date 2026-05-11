"use client";

import { useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress-image";
import { toast } from "sonner";
import { Camera, Image as ImageIcon, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { CameraCapture } from "@/components/camera-capture";

interface PhotoUploaderProps {
  userId: string;
  value: string[];
  onChange: (urls: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUploader({
  userId,
  value,
  onChange,
  maxPhotos = 4,
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const handleCapture = useCallback(
    async (blob: Blob) => {
      setCameraOpen(false);

      if (!userId) {
        toast.error("You must be signed in to upload photos");
        return;
      }

      const remaining = maxPhotos - valueRef.current.length;
      if (remaining <= 0) return;

      setUploading(true);
      setProgress("Compressing photo...");

      const supabase = createClient();

      try {
        let compressed: Blob;
        try {
          const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
          compressed = await compressImage(file);
        } catch {
          compressed = blob;
        }

        setProgress("Uploading photo...");

        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

        const { error } = await supabase.storage
          .from("report-photos")
          .upload(fileName, compressed, { contentType: "image/jpeg" });

        if (error) {
          console.error("Upload error:", error);
          toast.error("Upload failed. Please check your connection and try again.");
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("report-photos").getPublicUrl(fileName);

        onChange([...valueRef.current, publicUrl]);
        toast.success("Photo uploaded");
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Upload failed. Please try again.");
      } finally {
        setUploading(false);
        setProgress("");
      }
    },
    [userId, maxPhotos, onChange]
  );

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleGallerySelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      // Reuse the same handler — pass the file as a blob.
      await handleCapture(file);
    },
    [handleCapture]
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Photos <span className="text-xs text-stone-500">(up to {maxPhotos})</span>
      </label>

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {value.map((url, index) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border">
              <Image
                src={url}
                alt={`Report photo ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Open camera button + gallery fallback */}
      {value.length < maxPhotos && !uploading && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setCameraOpen(true)}
            className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-6 transition-colors hover:border-emerald-400 hover:bg-emerald-50"
          >
            <div className="mb-2 rounded-full bg-emerald-100 p-2">
              <Camera className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-stone-700">
              {value.length === 0 ? "Take Photo" : "Take Another Photo"}
            </span>
            <span className="text-xs text-stone-500">
              Opens your camera
            </span>
          </button>
          <div className="text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleGallerySelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-emerald-700"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Or choose from gallery
            </button>
          </div>
        </div>
      )}

      {uploading && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50 px-4 py-6">
          <Loader2 className="mb-2 h-8 w-8 animate-spin text-emerald-600" />
          <span className="text-sm text-stone-600">{progress || "Uploading..."}</span>
        </div>
      )}

      {/* Full-screen camera overlay */}
      {cameraOpen && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </div>
  );
}
