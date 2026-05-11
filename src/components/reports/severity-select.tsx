"use client";

import { cn } from "@/lib/utils";
import type { SeverityLevel } from "@/types";

interface SeveritySelectProps {
  value: SeverityLevel | "";
  onChange: (severity: SeverityLevel) => void;
}

const STEPS: {
  value: SeverityLevel;
  label: string;
  caption: string;
  color: string;
}[] = [
  {
    value: "low",
    label: "A few bags",
    caption: "Small, easily cleaned",
    color: "#22c55e",
  },
  {
    value: "medium",
    label: "Bin-sized",
    caption: "A noticeable pile",
    color: "#eab308",
  },
  {
    value: "high",
    label: "Big pile",
    caption: "Blocking a road or path",
    color: "#f97316",
  },
  {
    value: "critical",
    label: "Hazardous",
    caption: "Health or safety risk",
    color: "#ef4444",
  },
];

export function SeveritySelect({ value, onChange }: SeveritySelectProps) {
  // Default to medium so it's never a blocker
  const effective: SeverityLevel = value || "medium";
  const activeIndex = STEPS.findIndex((s) => s.value === effective);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium">
          How serious is it?
        </label>
        <span
          className="text-xs font-semibold"
          style={{ color: STEPS[activeIndex].color }}
        >
          {STEPS[activeIndex].label}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {STEPS.map((step, i) => {
          const isActive = i === activeIndex;
          const isPassed = i < activeIndex;
          return (
            <button
              key={step.value}
              type="button"
              onClick={() => onChange(step.value)}
              className={cn(
                "h-2 rounded-full transition-colors",
                isActive || isPassed ? "" : "bg-stone-200"
              )}
              style={
                isActive || isPassed
                  ? { backgroundColor: step.color }
                  : undefined
              }
              aria-label={`Set severity to ${step.label}`}
            />
          );
        })}
      </div>

      <p className="text-xs text-stone-500">{STEPS[activeIndex].caption}</p>

      {/* Hidden 4-step segmented control for keyboard / direct selection */}
      <div className="flex justify-between text-[10px] text-stone-400">
        {STEPS.map((step, i) => (
          <button
            key={step.value}
            type="button"
            onClick={() => onChange(step.value)}
            className={cn(
              "rounded px-1 transition-colors",
              i === activeIndex
                ? "font-semibold text-stone-700"
                : "hover:text-stone-600"
            )}
          >
            {step.label}
          </button>
        ))}
      </div>
    </div>
  );
}
