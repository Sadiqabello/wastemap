"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminEditDialog } from "./admin-edit-dialog";
import { toggleChallengeActive, deleteChallenge, editChallenge } from "@/lib/actions/admin-rewards";
import { Power, Trash2, Loader2 } from "lucide-react";

interface AdminChallengeActionsProps {
  challengeId: string;
  isActive: boolean;
  title?: string;
  description?: string;
  actionType?: string;
  targetCount?: number;
  bonusPoints?: number;
  startDate?: string;
  endDate?: string;
}

export function AdminChallengeActions({ challengeId, isActive, title, description, actionType, targetCount, bonusPoints, startDate, endDate }: AdminChallengeActionsProps) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const result = await toggleChallengeActive(challengeId, !isActive);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else toast.success(isActive ? "Challenge deactivated" : "Challenge activated");
  }

  async function handleDelete() {
    if (!confirm("Delete this challenge?")) return;
    setLoading(true);
    const result = await deleteChallenge(challengeId);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else toast.success("Challenge deleted");
  }

  return (
    <div className="flex items-center gap-1">
      {title && (
        <AdminEditDialog
          title={`Edit: ${title}`}
          triggerSize="icon"
          fields={[
            { name: "title", label: "Title", defaultValue: title, required: true },
            { name: "description", label: "Description", type: "textarea", defaultValue: description || "" },
            { name: "action_type", label: "Action Type", defaultValue: actionType },
            { name: "target_count", label: "Target Count", type: "number", defaultValue: targetCount },
            { name: "bonus_points", label: "Bonus Points", type: "number", defaultValue: bonusPoints },
            { name: "start_date", label: "Start Date", type: "date", defaultValue: startDate },
            { name: "end_date", label: "End Date", type: "date", defaultValue: endDate },
          ]}
          onSave={async (data) => editChallenge(challengeId, data as any)}
        />
      )}
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
      <Button
        size="icon"
        variant="ghost"
        onClick={handleDelete}
        disabled={loading}
        className="h-8 w-8 text-red-500 hover:text-red-700"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
