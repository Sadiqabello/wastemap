"use client";

import {
  Trash2,
  Factory,
  AlertTriangle,
  Monitor,
  HardHat,
  Cross,
  Leaf,
  Package,
} from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { WasteCategory } from "@/types";

const CATEGORY_ICON_MAP: Record<WasteCategory, React.ComponentType<{ className?: string }>> = {
  household: Trash2,
  industrial: Factory,
  hazardous: AlertTriangle,
  electronic: Monitor,
  construction: HardHat,
  medical: Cross,
  organic: Leaf,
  other: Package,
};

interface CategorySelectProps {
  value: WasteCategory[];
  onChange: (categories: WasteCategory[]) => void;
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  const toggleCategory = (category: WasteCategory) => {
    if (value.includes(category)) {
      onChange(value.filter((c) => c !== category));
    } else {
      onChange([...value, category]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Waste Category <span className="text-red-500">*</span>
        <span className="ml-1 text-xs font-normal text-stone-500">(select all that apply)</span>
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(Object.keys(CATEGORY_LABELS) as WasteCategory[]).map((category) => {
          const Icon = CATEGORY_ICON_MAP[category];
          const isSelected = value.includes(category);

          return (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all",
                isSelected
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">
                {CATEGORY_LABELS[category]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
