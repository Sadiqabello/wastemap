"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { RedemptionWithReward } from "@/types";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  processing: { label: "Processing", className: "bg-blue-50 text-blue-700 border-blue-200" },
  completed: { label: "Completed", className: "bg-green-50 text-green-700 border-green-200" },
  failed: { label: "Failed", className: "bg-red-50 text-red-700 border-red-200" },
  refunded: { label: "Refunded", className: "bg-stone-50 text-stone-700 border-stone-200" },
};

interface RedemptionHistoryProps {
  redemptions: RedemptionWithReward[];
}

export function getRedemptionLabel(r: RedemptionWithReward): { name: string; category: string } {
  if (r.rewards?.name) {
    return { name: r.rewards.name, category: r.rewards.category || "" };
  }
  const details = r.delivery_details as Record<string, string> | null;
  const type = details?.type || "redemption";
  switch (type) {
    case "airtime":
      return { name: `₦${details?.amount || r.points_spent} Airtime`, category: "Airtime" };
    case "data":
      return { name: `Data: ${details?.variationCode || "bundle"}`, category: "Data Bundle" };
    case "bank_transfer":
      return { name: `₦${details?.amount || r.points_spent} Cash Transfer`, category: "Bank Transfer" };
    default:
      return { name: "Redemption", category: type };
  }
}

export function RedemptionHistory({ redemptions }: RedemptionHistoryProps) {
  if (redemptions.length === 0) {
    return (
      <div className="rounded-lg border bg-stone-50 p-6 text-center">
        <p className="text-sm text-stone-500">
          No redemptions yet. Start earning and redeeming rewards!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {redemptions.map((r) => {
        const status = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
        const label = getRedemptionLabel(r);
        return (
          <Link key={r.id} href={`/rewards/history/${r.id}`}>
            <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-stone-50 transition-colors cursor-pointer">
              <div>
                <p className="text-sm font-medium text-stone-900">{label.name}</p>
                <p className="text-xs text-stone-500">
                  {label.category} &middot;{" "}
                  {new Date(r.created_at).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-stone-500">
                  -{r.points_spent} pts
                </span>
                <Badge variant="outline" className={`text-[10px] ${status.className}`}>
                  {status.label}
                </Badge>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
