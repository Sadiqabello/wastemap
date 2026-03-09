"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress-image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, ChevronDown, ChevronUp, Upload, X, Building2 } from "lucide-react";
import { createSponsorship } from "@/lib/actions/admin-collectors";
import Image from "next/image";

export function CreateSponsorForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleLogoUpload(files: FileList | null) {
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
        // Fall back to original
      }

      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `sponsors/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("report-photos")
        .upload(fileName, fileToUpload);

      if (uploadError) {
        toast.error(`Upload failed: ${uploadError.message}`);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("report-photos")
        .getPublicUrl(fileName);

      setLogoUrl(publicUrl);
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (logoUrl) formData.set("logo_url", logoUrl);
    const result = await createSponsorship(formData);
    setLoading(false);

    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Failed");
    } else {
      toast.success("Sponsorship created!");
      setOpen(false);
      setLogoUrl(null);
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <Card>
      <CardContent className="pt-3 pb-3">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-sm font-medium w-full"
        >
          <Plus className="h-4 w-4" />
          Add New Sponsor
          {open ? (
            <ChevronUp className="h-4 w-4 ml-auto" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-auto" />
          )}
        </button>

        {open && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <Label className="mb-1.5 block">Logo</Label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 transition-colors hover:border-emerald-400 hover:bg-emerald-50"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
                  ) : logoUrl ? (
                    <>
                      <Image src={logoUrl} alt="Logo" fill className="object-contain p-1" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setLogoUrl(null); }}
                        className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white shadow"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="h-4 w-4 text-stone-400" />
                      <span className="text-[10px] text-stone-400">Upload</span>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload(e.target.files)}
                    className="hidden"
                  />
                </div>
              </div>
              <div className="grid flex-1 grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input id="company_name" name="company_name" required />
                </div>
                <div>
                  <Label htmlFor="tier">Tier</Label>
                  <select
                    id="tier"
                    name="tier"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input id="contact_name" name="contact_name" />
              </div>
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input id="contact_email" name="contact_email" type="email" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input id="start_date" name="start_date" type="date" required />
              </div>
              <div>
                <Label htmlFor="end_date">End Date *</Label>
                <Input id="end_date" name="end_date" type="date" required />
              </div>
              <div>
                <Label htmlFor="budget_allocated">Budget (N)</Label>
                <Input
                  id="budget_allocated"
                  name="budget_allocated"
                  type="number"
                  min={0}
                  defaultValue={500000}
                />
              </div>
            </div>

            <Button type="submit" size="sm" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Sponsorship
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
