"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Trash2,
  Recycle,
  AlertTriangle,
  Leaf,
  Users,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TIP_CATEGORIES, type RecyclingTip } from "@/lib/data/recycling-tips";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Trash2,
  Recycle,
  AlertTriangle,
  Leaf,
  Users,
  ShoppingBag,
};

interface TipCardProps {
  tip: RecyclingTip;
}

export function TipCard({ tip }: TipCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ICONS[tip.icon] || Trash2;
  const categoryInfo = TIP_CATEGORIES[tip.category];

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
            <Icon className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-stone-900">{tip.title}</h3>
                <p className="mt-0.5 text-sm text-stone-500">
                  {tip.description}
                </p>
              </div>
              <Badge className={`shrink-0 text-[10px] ${categoryInfo.color} border-0`}>
                {categoryInfo.label}
              </Badge>
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              {expanded ? "Show less" : "Read more"}
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {expanded && (
              <div className="mt-3 rounded-lg bg-stone-50 p-4 text-sm text-stone-700 prose-sm prose-headings:font-semibold prose-headings:text-stone-900 prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                {tip.detail.split("\n\n").map((paragraph, i) => {
                  if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                    return (
                      <h4 key={i} className="mt-3 mb-1 font-semibold text-stone-900 first:mt-0">
                        {paragraph.replace(/\*\*/g, "")}
                      </h4>
                    );
                  }
                  if (paragraph.includes("**")) {
                    const parts = paragraph.split("**");
                    return (
                      <div key={i} className="mt-2">
                        {parts.map((part, j) =>
                          j % 2 === 1 ? (
                            <strong key={j} className="text-stone-800">
                              {part}
                            </strong>
                          ) : (
                            <span key={j}>{part}</span>
                          )
                        )}
                      </div>
                    );
                  }
                  if (paragraph.startsWith("- ")) {
                    return (
                      <ul key={i} className="mt-1 ml-4 list-disc space-y-0.5">
                        {paragraph.split("\n").map((line, j) => (
                          <li key={j}>{line.replace(/^- /, "")}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (/^\d+\./.test(paragraph)) {
                    return (
                      <ol key={i} className="mt-1 ml-4 list-decimal space-y-0.5">
                        {paragraph.split("\n").map((line, j) => (
                          <li key={j}>{line.replace(/^\d+\.\s*/, "")}</li>
                        ))}
                      </ol>
                    );
                  }
                  return (
                    <p key={i} className="mt-1">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
