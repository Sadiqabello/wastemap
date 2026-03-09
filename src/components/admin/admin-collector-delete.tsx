"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteCollector } from "@/lib/actions/admin-collectors";
import { Trash2, Loader2 } from "lucide-react";

export function AdminCollectorDelete({ collectorId, name }: { collectorId: string; name: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete collector "${name}"?`)) return;
    setLoading(true);
    const result = await deleteCollector(collectorId);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else toast.success("Collector deleted");
  }

  return (
    <Button size="icon" variant="ghost" onClick={handleDelete} disabled={loading} className="h-8 w-8 text-red-500 hover:text-red-700" title="Delete">
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </Button>
  );
}
