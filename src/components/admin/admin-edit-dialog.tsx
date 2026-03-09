"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Loader2 } from "lucide-react";

export interface EditField {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "email" | "textarea" | "select";
  options?: { value: string; label: string }[];
  defaultValue?: string | number | null;
  required?: boolean;
  placeholder?: string;
}

interface AdminEditDialogProps {
  title: string;
  fields: EditField[];
  onSave: (data: Record<string, unknown>) => Promise<{ error?: string; success?: boolean }>;
  triggerLabel?: string;
  triggerVariant?: "ghost" | "outline" | "default";
  triggerSize?: "sm" | "icon" | "default";
}

export function AdminEditDialog({
  title,
  fields,
  onSave,
  triggerLabel = "Edit",
  triggerVariant = "ghost",
  triggerSize = "sm",
}: AdminEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};

    for (const field of fields) {
      const raw = formData.get(field.name);
      if (field.type === "number") {
        const num = Number(raw);
        if (!isNaN(num)) data[field.name] = num;
      } else if (raw !== null && raw !== "") {
        data[field.name] = raw;
      }
    }

    startTransition(async () => {
      const result = await onSave(data);
      if (result.error) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to save");
      } else {
        toast.success("Updated successfully");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerSize === "icon" ? (
          <Button
            variant={triggerVariant}
            size="icon"
            className="h-8 w-8"
            title={triggerLabel}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            variant={triggerVariant}
            size={triggerSize}
            className="h-8 gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5" />
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-1.5">
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  name={field.name}
                  defaultValue={field.defaultValue?.toString() ?? ""}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={3}
                />
              ) : field.type === "select" && field.options ? (
                <select
                  id={field.name}
                  name={field.name}
                  defaultValue={field.defaultValue?.toString() ?? ""}
                  required={field.required}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type || "text"}
                  defaultValue={field.defaultValue?.toString() ?? ""}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
