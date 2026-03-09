"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Star } from "lucide-react";
import { acceptBid } from "@/lib/actions/collectors";

interface PickupBidActionsProps {
  bidId: string;
  bidStatus: string;
  reportId: string;
  hasAcceptedBid: boolean;
  hasReview: boolean;
}

export function PickupBidActions({
  bidId,
  bidStatus,
  reportId,
  hasAcceptedBid,
  hasReview,
}: PickupBidActionsProps) {
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    setLoading(true);
    const result = await acceptBid(bidId);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Bid accepted! The collector will be notified.");
    }
  }

  if (bidStatus === "pending" && !hasAcceptedBid) {
    return (
      <Button
        size="sm"
        className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-9 px-4"
        onClick={handleAccept}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
        ) : (
          <CheckCircle2 className="h-4 w-4 mr-1.5" />
        )}
        Accept Bid
      </Button>
    );
  }

  if (bidStatus === "completed" && !hasReview) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="text-sm h-9 px-4 border-amber-300 text-amber-700 hover:bg-amber-50"
        asChild
      >
        <Link href={`/reports/${reportId}#review`}>
          <Star className="h-4 w-4 mr-1.5" />
          Leave Review
        </Link>
      </Button>
    );
  }

  return null;
}
