"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Truck, Recycle, X, Scale, Info } from "lucide-react";
import { requestPickup, cancelPickupRequest } from "@/lib/actions/collectors";
import { RECYCLING_VALUES } from "@/lib/constants";

interface RequestPickupProps {
  reportId: string;
  category: string[];
  currentPickupType: "cleanup" | "recycling" | null;
  isOwner: boolean;
}

export function RequestPickup({
  reportId,
  category,
  currentPickupType,
  isOwner,
}: RequestPickupProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [weight, setWeight] = useState("");

  if (!isOwner) return null;

  const recyclingValue = RECYCLING_VALUES[category[0]];

  async function handleRequest(type: "cleanup" | "recycling") {
    setLoading(type);
    const result = await requestPickup(
      reportId,
      type,
      weight ? Number(weight) : undefined
    );
    setLoading(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        type === "cleanup"
          ? "Cleanup request posted! Collectors will start bidding."
          : "Recycling sale posted! Collectors will offer prices."
      );
    }
  }

  async function handleCancel() {
    setLoading("cancel");
    const result = await cancelPickupRequest(reportId);
    setLoading(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Pickup request cancelled.");
    }
  }

  // ── Active pickup state ──────────────────────────────────────
  if (currentPickupType) {
    const isCleanup = currentPickupType === "cleanup";
    return (
      <div
        className={`rounded-xl border-2 px-4 py-3 ${
          isCleanup
            ? "border-blue-200 bg-blue-50"
            : "border-emerald-200 bg-emerald-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                isCleanup ? "bg-blue-100" : "bg-emerald-100"
              }`}
            >
              {isCleanup ? (
                <Truck className="h-4 w-4 text-blue-600" />
              ) : (
                <Recycle className="h-4 w-4 text-emerald-600" />
              )}
            </div>
            <div>
              <p
                className={`text-sm font-semibold ${
                  isCleanup ? "text-blue-800" : "text-emerald-800"
                }`}
              >
                {isCleanup
                  ? "Cleanup requested"
                  : "Listed for recycling"}
              </p>
              <p
                className={`text-xs ${
                  isCleanup ? "text-blue-600" : "text-emerald-600"
                }`}
              >
                {isCleanup
                  ? "Waiting for collector bids..."
                  : "Waiting for recycling offers..."}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 h-8"
            onClick={handleCancel}
            disabled={loading !== null}
          >
            {loading === "cancel" ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <X className="h-3 w-3 mr-1" />
            )}
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // ── No pickup yet — show options ─────────────────────────────
  return (
    <Card className="overflow-hidden border-stone-200">
      <CardContent className="p-5 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-stone-900">
            Get This Waste Collected
          </h3>
          <p className="text-sm text-stone-500 mt-0.5">
            Choose how you want this waste handled. Verified collectors will
            bid on your request.
          </p>
        </div>

        {/* Weight input */}
        <div className="flex items-end gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
          <Scale className="h-4 w-4 text-stone-400 mb-2 shrink-0" />
          <div className="flex-1">
            <Label
              htmlFor="weight"
              className="text-xs font-medium text-stone-600"
            >
              Estimated weight (optional)
            </Label>
            <Input
              id="weight"
              type="number"
              min={0}
              step={0.5}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 25 kg"
              className="mt-1 h-8 text-sm bg-white"
            />
          </div>
        </div>

        {/* Recycling value hint */}
        {recyclingValue && (
          <div className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-100 p-3">
            <Info className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-xs text-emerald-700 leading-relaxed">
              Estimated recycling value for this category:{" "}
              <span className="font-semibold">
                ₦{recyclingValue.min} &ndash; ₦{recyclingValue.max}/kg
              </span>
              . You receive the collector&apos;s offer price as points.
            </p>
          </div>
        )}

        {/* Option buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Cleanup option */}
          <button
            onClick={() => handleRequest("cleanup")}
            disabled={loading !== null}
            className="group relative flex flex-col items-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 p-4 transition-all hover:border-blue-400 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
              {loading === "cleanup" ? (
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              ) : (
                <Truck className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-blue-800">
                Need Cleanup
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                A collector comes and cleans up. You pay them.
              </p>
            </div>
          </button>

          {/* Recycling option */}
          <button
            onClick={() => handleRequest("recycling")}
            disabled={loading !== null}
            className="group relative flex flex-col items-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 transition-all hover:border-emerald-400 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
              {loading === "recycling" ? (
                <Loader2 className="h-5 w-5 text-emerald-600 animate-spin" />
              ) : (
                <Recycle className="h-5 w-5 text-emerald-600" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-emerald-800">
                Sell for Recycling
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                A collector buys your recyclable materials.
              </p>
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
