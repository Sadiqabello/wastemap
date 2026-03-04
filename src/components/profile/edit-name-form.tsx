"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateDisplayName } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, Check, X } from "lucide-react";

interface EditNameFormProps {
  currentName: string;
}

export function EditNameForm({ currentName }: EditNameFormProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim() || name.trim() === currentName) {
      setEditing(false);
      setName(currentName);
      return;
    }

    setLoading(true);
    const result = await updateDisplayName(name);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Display name updated");
      setEditing(false);
    }
    setLoading(false);
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-stone-900">{currentName}</h1>
        <button
          onClick={() => setEditing(true)}
          className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
          title="Edit name"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor="display-name" className="text-xs text-stone-500">
        Display Name
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id="display-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-9 max-w-[240px]"
          placeholder="Your name"
          autoFocus
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setEditing(false);
              setName(currentName);
            }
          }}
        />
        <Button
          onClick={handleSave}
          disabled={loading || !name.trim()}
          size="sm"
          variant="ghost"
          className="h-9 w-9 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          onClick={() => {
            setEditing(false);
            setName(currentName);
          }}
          disabled={loading}
          size="sm"
          variant="ghost"
          className="h-9 w-9 p-0 text-stone-400 hover:text-stone-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
