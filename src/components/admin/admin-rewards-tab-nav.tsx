"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Tab = "rewards" | "redemptions" | "challenges";

const TABS: { value: Tab; label: string }[] = [
  { value: "rewards", label: "Rewards" },
  { value: "redemptions", label: "Redemptions" },
  { value: "challenges", label: "Challenges" },
];

interface AdminRewardsTabNavProps {
  activeTab: Tab;
}

export function AdminRewardsTabNav({ activeTab }: AdminRewardsTabNavProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-stone-100 p-1">
      {TABS.map((tab) => (
        <Link
          key={tab.value}
          href={`/admin/rewards${tab.value === "rewards" ? "" : `?tab=${tab.value}`}`}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-center text-sm font-medium transition-colors",
            activeTab === tab.value
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
