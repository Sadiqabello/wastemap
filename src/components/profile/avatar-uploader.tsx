"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { updateAvatarUrl } from "@/lib/actions/profile";
import { compressImage } from "@/lib/compress-image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";

interface AvatarUploaderProps {
  userId: string;
  currentUrl: string | null;
  initials: string;
}

export function AvatarUploader({
  userId,
  currentUrl,
  initials,
}: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentUrl);

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      setUploading(true);
      try {
        let fileToUpload: File | Blob = file;
        try {
          fileToUpload = await compressImage(file, {
            maxWidth: 512,
            maxHeight: 512,
            quality: 0.7,
            maxSizeKB: 200,
          });
        } catch {
          // Fall back to original file if compression fails
        }

        const supabase = createClient();
        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `avatars/${userId}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("report-photos")
          .upload(fileName, fileToUpload, { upsert: true });

        if (uploadError) {
          toast.error(`Failed to upload: ${uploadError.message}`);
          console.error("Upload error:", uploadError);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("report-photos").getPublicUrl(fileName);

        const result = await updateAvatarUrl(publicUrl);
        if (result.error) {
          toast.error(result.error);
        } else {
          setAvatarUrl(publicUrl);
          toast.success("Profile picture updated");
        }
      } catch (error) {
        console.error("Avatar upload failed:", error);
        toast.error("Failed to upload image");
      } finally {
        setUploading(false);
      }
    },
    [userId]
  );

  return (
    <label className="group relative cursor-pointer">
      <Avatar className="h-20 w-20">
        {avatarUrl && <AvatarImage src={avatarUrl} alt="Profile picture" />}
        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        ) : (
          <Camera className="h-6 w-6 text-white" />
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleUpload(e.target.files)}
        className="hidden"
        disabled={uploading}
      />
    </label>
  );
}
