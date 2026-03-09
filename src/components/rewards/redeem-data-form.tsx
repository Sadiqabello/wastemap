"use client";

import { useState, useEffect } from "react";
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
import { redeemData } from "@/lib/actions/rewards";

const NETWORKS = [
  { value: "mtn", label: "MTN" },
  { value: "airtel", label: "Airtel" },
  { value: "glo", label: "Glo" },
  { value: "etisalat", label: "9mobile" },
];

interface DataPlan {
  variation_code: string;
  name: string;
  variation_amount: string;
  fixedPrice: string;
}

interface Props {
  userPoints: number;
  userPhone?: string | null;
}

export function RedeemDataForm({ userPoints, userPhone }: Props) {
  const [network, setNetwork] = useState("");
  const [phone, setPhone] = useState(userPhone || "");
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loading, setLoading] = useState(false);

  const plan = plans.find((p) => p.variation_code === selectedPlan);
  const planCost = plan ? Number(plan.variation_amount) : 0;
  const pointsCost = Math.ceil(planCost);
  const canRedeem = network && phone.length >= 10 && selectedPlan && pointsCost <= userPoints;

  useEffect(() => {
    if (!network) {
      setPlans([]);
      setSelectedPlan("");
      return;
    }

    setLoadingPlans(true);
    setSelectedPlan("");
    fetch(`/api/data-plans?network=${network}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPlans(data);
        } else {
          setPlans([]);
        }
      })
      .catch(() => setPlans([]))
      .finally(() => setLoadingPlans(false));
  }, [network]);

  async function handleSubmit() {
    if (!canRedeem || !plan) return;
    setLoading(true);
    const result = await redeemData(phone, selectedPlan, network, planCost);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`${plan.name} sent to ${phone}!`);
      setSelectedPlan("");
    }
  }

  // Filter affordable plans
  const affordablePlans = plans.filter((p) => Math.ceil(Number(p.variation_amount)) <= userPoints);

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

        {network && (
          <div className="space-y-2">
            <Label>Data Plan</Label>
            {loadingPlans ? (
              <div className="flex items-center gap-2 text-sm text-stone-500 py-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading plans...
              </div>
            ) : plans.length === 0 ? (
              <p className="text-sm text-stone-500 py-2">
                No plans available. Check your VTPass credentials.
              </p>
            ) : affordablePlans.length === 0 ? (
              <p className="text-sm text-amber-600 py-2">
                No plans within your point balance ({userPoints} pts).
              </p>
            ) : (
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {affordablePlans.map((p) => (
                    <SelectItem key={p.variation_code} value={p.variation_code}>
                      {p.name} — ₦{p.variation_amount} ({Math.ceil(Number(p.variation_amount))} pts)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {plan && pointsCost <= userPoints && (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                <strong>{pointsCost} pts</strong> will be deducted for <strong>{plan.name}</strong>
              </span>
            </div>
            <p className="text-xs text-emerald-600 mt-1">
              Remaining balance: {userPoints - pointsCost} pts
            </p>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!canRedeem || loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending data...
            </>
          ) : (
            "Send Data Bundle"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
