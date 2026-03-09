"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BidCard } from "@/components/collectors/bid-card";
import type { BidWithReport } from "@/types";

interface CompletedPickupsProps {
  bids: BidWithReport[];
}

export function CompletedPickups({ bids }: CompletedPickupsProps) {
  const [expanded, setExpanded] = useState(false);

  const displayBids = expanded ? bids.slice(0, 10) : [];

  return (
    <div>
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between py-2 group"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-blue-500" />
          <h2 className="text-lg font-semibold text-stone-900">
            Completed Pickups
          </h2>
          <Badge className="text-[10px] bg-blue-100 text-blue-800 border-0">
            {bids.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-xs text-stone-400 group-hover:text-stone-600 transition-colors">
          {expanded ? (
            <>
              Hide <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show <ChevronDown className="h-4 w-4" />
            </>
          )}
        </div>
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {displayBids.map((bid) => (
            <BidCard key={bid.id} bid={bid} isCollector />
          ))}
          {bids.length > 10 && (
            <p className="text-center text-xs text-stone-400 py-2">
              Showing the most recent 10 of {bids.length} completed pickups.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
