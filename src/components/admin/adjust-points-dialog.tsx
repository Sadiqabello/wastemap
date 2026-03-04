"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adjustUserPoints } from "@/lib/actions/admin";
import { toast } from "sonner";
import { Star } from "lucide-react";

interface AdjustPointsDialogProps {
  userId: string;
  userName: string;
  currentPoints: number;
}

export function AdjustPointsDialog({
  userId,
  userName,
  currentPoints,
}: AdjustPointsDialogProps) {
  const [open, setOpen] = useState(false);
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const numPoints = parseInt(points, 10);
    if (isNaN(numPoints) || numPoints === 0) {
      toast.error("Enter a valid non-zero number.");
      return;
    }
    if (reason.trim().length < 3) {
      toast.error("Reason must be at least 3 characters.");
      return;
    }

    startTransition(async () => {
      const result = await adjustUserPoints(userId, numPoints, reason.trim());
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          `Adjusted ${userName}'s points by ${numPoints > 0 ? "+" : ""}${numPoints}`
        );
        setOpen(false);
        setPoints("");
        setReason("");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5">
          <Star className="h-3.5 w-3.5" />
          Points
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Points for {userName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Current points: <strong>{currentPoints}</strong>
          </p>
          <div className="space-y-2">
            <Label htmlFor="points">Points (negative to deduct)</Label>
            <Input
              id="points"
              type="number"
              placeholder="e.g. 50 or -20"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              placeholder="e.g. Bonus for community work"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isPending ? "Saving..." : "Apply"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
