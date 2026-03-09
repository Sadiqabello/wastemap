"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2 } from "lucide-react";
import { redeemAirtime } from "@/lib/actions/rewards";

const NETWORKS = [
  { value: "mtn", label: "MTN" },
  { value: "airtel", label: "Airtel" },
  { value: "glo", label: "Glo" },
  { value: "etisalat", label: "9mobile" },
];

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

interface Props {
  userPoints: number;
  userPhone?: string | null;
}

export function RedeemAirtimeForm({ userPoints, userPhone }: Props) {
  const [network, setNetwork] = useState("");
  const [phone, setPhone] = useState(userPhone || "");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const numAmount = parseInt(amount, 10) || 0;
  const canRedeem = network && phone.length >= 10 && numAmount >= 50 && numAmount <= userPoints;

  async function handleSubmit() {
    if (!canRedeem) return;
    setLoading(true);
    const result = await redeemAirtime(phone, numAmount, network);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`₦${numAmount} airtime sent to ${phone}!`);
      setAmount("");
    }
  }

  return (
    <Card>
      <CardContent className="pt-5 space-y-4">
        <div className="space-y-2">
          <Label>Network</Label>
          <Select value={network} onValueChange={setNetwork}>
            <SelectTrigger>
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              {NETWORKS.map((n) => (
                <SelectItem key={n.value} value={n.value}>
                  {n.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input
            type="tel"
            placeholder="08012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Amount (pts = Naira)</Label>
          <Input
            type="number"
            placeholder="e.g. 100"
            min={50}
            max={userPoints}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {QUICK_AMOUNTS.filter((a) => a <= userPoints).map((a) => (
              <Button
                key={a}
                type="button"
                variant={numAmount === a ? "default" : "outline"}
                size="sm"
                className={`text-xs h-7 ${numAmount === a ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                onClick={() => setAmount(String(a))}
              >
                ₦{a}
              </Button>
            ))}
          </div>
        </div>

        {numAmount > 0 && numAmount <= userPoints && (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                <strong>{numAmount} pts</strong> will be deducted for <strong>₦{numAmount}</strong> airtime
              </span>
            </div>
            <p className="text-xs text-emerald-600 mt-1">
              Remaining balance: {userPoints - numAmount} pts
            </p>
          </div>
        )}

        {numAmount > userPoints && (
          <p className="text-xs text-red-500">
            Insufficient points. You have {userPoints} pts.
          </p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!canRedeem || loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending airtime...
            </>
          ) : (
            `Send ₦${numAmount || 0} Airtime`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
