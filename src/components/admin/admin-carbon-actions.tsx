"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminVerifyCarbon } from "@/lib/actions/admin-dump-sites";
import { CheckCircle2, Award, Loader2 } from "lucide-react";

interface Props {
  recordId: string;
  currentStatus: string;
}

export function AdminCarbonActions({ recordId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleVerify(status: "verified" | "certified") {
    setLoading(true);
    const result = await adminVerifyCarbon(recordId, status);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else toast.success(`Record ${status}`);
  }

  return (
    <div className="flex items-center gap-1">
      {currentStatus !== "verified" && currentStatus !== "certified" && (
        <Button size="sm" variant="ghost" onClick={() => handleVerify("verified")} disabled={loading} className="h-7 gap-1 text-xs">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
          Verify
        </Button>
      )}
      {currentStatus !== "certified" && (
        <Button size="sm" variant="ghost" onClick={() => handleVerify("certified")} disabled={loading} className="h-7 gap-1 text-xs">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Award className="h-3 w-3 text-amber-600" />}
          Certify
        </Button>
      )}
    </div>
  );
}
