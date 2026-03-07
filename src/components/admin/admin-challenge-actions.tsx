"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleChallengeActive } from "@/lib/actions/admin-rewards";
import { Power, Loader2 } from "lucide-react";

interface AdminChallengeActionsProps {
  challengeId: string;
  isActive: boolean;
}

export function AdminChallengeActions({ challengeId, isActive }: AdminChallengeActionsProps) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const result = await toggleChallengeActive(challengeId, !isActive);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else toast.success(isActive ? "Challenge deactivated" : "Challenge activated");
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={handleToggle}
      disabled={loading}
      className="h-8 w-8"
      title={isActive ? "Deactivate" : "Activate"}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className={`h-4 w-4 ${isActive ? "text-emerald-600" : "text-stone-400"}`} />}
    </Button>
  );
}
