"use client";

import { useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress-image";
import { toast } from "sonner";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import Image from "next/image";

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
  const valueRef = useRef(value);
  valueRef.current = value;

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      if (!userId) {
        toast.error("You must be signed in to upload photos");
        return;
      }

      const remaining = maxPhotos - valueRef.current.length;
      if (remaining <= 0) return;

      const filesToUpload = Array.from(files).slice(0, remaining);
      setUploading(true);
      setProgress(`Compressing ${filesToUpload.length} photo${filesToUpload.length > 1 ? "s" : ""}...`);

      const supabase = createClient();

      try {
        // Compress all images in parallel
        const compressed = await Promise.all(
          filesToUpload.map(async (file, i) => {
            try {
              const blob = await compressImage(file);
              return { blob, name: file.name, index: i };
            } catch {
              return { blob: file as Blob, name: file.name, index: i };
            }
          })
        );

        setProgress(`Uploading ${compressed.length} photo${compressed.length > 1 ? "s" : ""}...`);

        // Upload all in parallel
        const results = await Promise.all(
          compressed.map(async ({ blob, name }) => {
            const ext = name.split(".").pop() || "jpg";
            const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

            const { error } = await supabase.storage
              .from("report-photos")
              .upload(fileName, blob, { contentType: "image/jpeg" });

            if (error) {
              console.error("Upload error:", error);
              return null;
            }

            const {
              data: { publicUrl },
            } = supabase.storage.from("report-photos").getPublicUrl(fileName);

            return publicUrl;
          })
        );

        const uploadedUrls = results.filter(Boolean) as string[];

        if (uploadedUrls.length > 0) {
          onChange([...valueRef.current, ...uploadedUrls]);
          toast.success(
            `${uploadedUrls.length} photo${uploadedUrls.length > 1 ? "s" : ""} uploaded`
          );
        } else if (filesToUpload.length > 0) {
          toast.error("Upload failed. Please check your connection and try again.");
        }
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

      {/* Upload area */}
      {value.length < maxPhotos && (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-6 transition-colors hover:border-emerald-400 hover:bg-emerald-50">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              handleUpload(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <>
              <Loader2 className="mb-2 h-8 w-8 animate-spin text-emerald-600" />
              <span className="text-sm text-stone-600">{progress || "Uploading..."}</span>
            </>
          ) : (
            <>
              <div className="mb-2 rounded-full bg-emerald-100 p-2">
                {value.length === 0 ? (
                  <ImageIcon className="h-6 w-6 text-emerald-600" />
                ) : (
                  <Upload className="h-6 w-6 text-emerald-600" />
                )}
              </div>
              <span className="text-sm font-medium text-stone-700">
                {value.length === 0 ? "Add photos" : "Add more photos"}
              </span>
              <span className="text-xs text-stone-500">
                Click or drag to upload
              </span>
            </>
          )}
        </label>
      )}
    </div>
  );
}
