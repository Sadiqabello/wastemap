"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send, Info, Truck, Recycle } from "lucide-react";
import { placeBid } from "@/lib/actions/collectors";

interface PlaceBidFormProps {
  reportId: string;
  pickupType: "cleanup" | "recycling";
}

export function PlaceBidForm({ reportId, pickupType }: PlaceBidFormProps) {
  const [amount, setAmount] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const isCleanup = pickupType === "cleanup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await placeBid(
      reportId,
      Number(amount),
      time,
      notes || undefined
    );
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Bid placed successfully!");
      setAmount("");
      setTime("");
      setNotes("");
    }
  }

  return (
    <Card className="overflow-hidden border-2 border-blue-200">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            {isCleanup ? (
              <Truck className="h-5 w-5 text-blue-600" />
            ) : (
              <Recycle className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-900">
              Place Your Bid
            </h3>
            <p className="text-xs text-stone-500">
              {isCleanup
                ? "Set your price for the cleanup service"
                : "Offer a price for the recyclable materials"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount field */}
          <div>
            <Label
              htmlFor="bid_amount"
              className="text-sm font-medium text-stone-700"
            >
              {isCleanup ? "Your Price" : "Your Offer"}
            </Label>
            <p className="text-xs text-stone-400 mt-0.5 mb-1.5">
              {isCleanup
                ? "How much will you charge for this cleanup?"
                : "How much will you pay for these materials?"}
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-stone-500">
                ₦
              </span>
              <Input
                id="bid_amount"
                type="number"
                min={200}
                step={100}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="2,000"
                required
                className="pl-7 h-10 text-sm"
              />
            </div>
          </div>

          {/* Estimated time */}
          <div>
            <Label
              htmlFor="estimated_time"
              className="text-sm font-medium text-stone-700"
            >
              Estimated Pickup Time
            </Label>
            <p className="text-xs text-stone-400 mt-0.5 mb-1.5">
              When can you arrive? e.g. &quot;Within 2 hours&quot;,
              &quot;Tomorrow morning&quot;
            </p>
            <Input
              id="estimated_time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Within 2 hours"
              required
              className="h-10 text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <Label
              htmlFor="bid_notes"
              className="text-sm font-medium text-stone-700"
            >
              Notes{" "}
              <span className="font-normal text-stone-400">(optional)</span>
            </Label>
            <textarea
              id="bid_notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Any details about your service, equipment, etc."
            />
          </div>

          {/* Platform fee notice */}
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 p-3">
            <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">
              A <span className="font-semibold">15% platform commission</span>{" "}
              applies to the bid amount upon completion.
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-sm font-semibold"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {isCleanup ? "Submit Cleanup Bid" : "Submit Recycling Offer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
