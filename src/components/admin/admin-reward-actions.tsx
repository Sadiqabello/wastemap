"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminEditDialog } from "./admin-edit-dialog";
import { toggleRewardActive, deleteReward, editReward } from "@/lib/actions/admin-rewards";
import { Power, Trash2, Loader2 } from "lucide-react";
import { REWARD_CATEGORY_LABELS } from "@/lib/constants";

interface AdminRewardActionsProps {
  rewardId: string;
  isActive: boolean;
  rewardName?: string;
  description?: string;
  category?: string;
  pointCost?: number;
  stock?: number | null;
  tierRequired?: string | null;
}

export function AdminRewardActions({ rewardId, isActive, rewardName, description, category, pointCost, stock, tierRequired }: AdminRewardActionsProps) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const result = await toggleRewardActive(rewardId, !isActive);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else toast.success(isActive ? "Reward deactivated" : "Reward activated");
  }

  async function handleDelete() {
    if (!confirm("Delete this reward?")) return;
    setLoading(true);
    const result = await deleteReward(rewardId);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else toast.success("Reward deleted");
  }

  return (
    <div className="flex items-center gap-1">
      {rewardName && (
        <AdminEditDialog
          title={`Edit: ${rewardName}`}
          triggerSize="icon"
          fields={[
            { name: "name", label: "Name", defaultValue: rewardName, required: true },
            { name: "description", label: "Description", type: "textarea", defaultValue: description || "" },
            {
              name: "category", label: "Category", type: "select", defaultValue: category,
              options: Object.entries(REWARD_CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l })),
            },
            { name: "point_cost", label: "Point Cost", type: "number", defaultValue: pointCost },
            { name: "stock", label: "Stock (empty = unlimited)", type: "number", defaultValue: stock },
          ]}
          onSave={async (data) => editReward(rewardId, data as any)}
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
