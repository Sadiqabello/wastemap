"use client";

import { useState } from "react";
import { toast } from "sonner";
import { toggleUpvote } from "@/lib/actions/reports";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpvoteButtonProps {
  reportId: string;
  initialCount: number;
  initialUpvoted: boolean;
}

export function UpvoteButton({
  reportId,
  initialCount,
  initialUpvoted,
}: UpvoteButtonProps) {
  const { user } = useAuth();
  const [count, setCount] = useState(initialCount);
  const [upvoted, setUpvoted] = useState(initialUpvoted);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!user) {
      toast.error("Please sign in to upvote");
      return;
    }

    setLoading(true);
    // Optimistic update
    setUpvoted(!upvoted);
    setCount(upvoted ? count - 1 : count + 1);

    const result = await toggleUpvote(reportId);
    if (result?.error) {
      // Revert
      setUpvoted(upvoted);
      setCount(count);
      toast.error(result.error);
    }
    setLoading(false);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "gap-1.5",
        upvoted && "border-emerald-600 bg-emerald-50 text-emerald-700"
      )}
    >
      <ThumbsUp className={cn("h-4 w-4", upvoted && "fill-current")} />
      <span>{count}</span>
    </Button>
  );
}
