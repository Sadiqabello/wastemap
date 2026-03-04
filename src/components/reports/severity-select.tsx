"use client";

import { SEVERITY_LABELS, SEVERITY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { SeverityLevel } from "@/types";

interface SeveritySelectProps {
  value: SeverityLevel | "";
  onChange: (severity: SeverityLevel) => void;
}

export function SeveritySelect({ value, onChange }: SeveritySelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Severity Level <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(SEVERITY_LABELS) as SeverityLevel[]).map((severity) => {
          const isSelected = value === severity;
          const color = SEVERITY_COLORS[severity];

          return (
            <button
              key={severity}
              type="button"
              onClick={() => onChange(severity)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all",
                isSelected
                  ? "border-current bg-opacity-10"
                  : "border-stone-200 hover:border-stone-300"
              )}
              style={
                isSelected
                  ? { borderColor: color, backgroundColor: `${color}15` }
                  : undefined
              }
            >
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span
                className="text-xs font-medium"
                style={isSelected ? { color } : undefined}
              >
                {SEVERITY_LABELS[severity]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
