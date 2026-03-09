"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Star, Send, Loader2, MessageSquare } from "lucide-react";
import { reviewCollector } from "@/lib/actions/collectors";

interface ReviewDialogProps {
  bidId: string;
  collectorName: string;
  isOpen?: boolean;
}

export function ReviewDialog({ bidId, collectorName, isOpen = false }: ReviewDialogProps) {
  const [open, setOpen] = useState(isOpen);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);
    const result = await reviewCollector(bidId, rating, comment || undefined);
    setSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Review submitted successfully!");
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-3 px-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-sm text-green-700 font-medium">
            Thank you for your review!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={() => setOpen(true)}
      >
        <MessageSquare className="h-4 w-4" />
        Review {collectorName}
      </Button>
    );
  }

  const displayRating = hoveredRating || rating;

  return (
    <Card className="border-stone-200">
      <CardContent className="py-4 px-4 space-y-3">
        <Label className="text-sm font-medium text-stone-700">
          Rate {collectorName}
        </Label>

        {/* Star rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-0.5 transition-transform hover:scale-110"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  star <= displayRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-stone-300"
                }`}
              />
            </button>
          ))}
          {displayRating > 0 && (
            <span className="ml-2 text-sm text-stone-500">
              {displayRating}/5
            </span>
          )}
        </div>

        {/* Comment */}
        <div>
          <Label htmlFor="review-comment" className="text-xs text-stone-500">
            Comment (optional)
          </Label>
          <textarea
            id="review-comment"
            className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="How was the pickup experience?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Submit Review
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
