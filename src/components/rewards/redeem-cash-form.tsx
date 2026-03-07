"use client";

import { useState, useEffect, useCallback } from "react";
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
import { redeemCash } from "@/lib/actions/rewards";

interface Bank {
  code: string;
  name: string;
}

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

interface Props {
  userPoints: number;
}

export function RedeemCashForm({ userPoints }: Props) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [resolving, setResolving] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const numAmount = parseInt(amount, 10) || 0;
  const canRedeem = bankCode && accountNumber.length === 10 && accountName && numAmount >= 100 && numAmount <= userPoints;

  // Fetch banks on mount
  useEffect(() => {
    fetch("/api/banks")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBanks(data);
      })
      .catch(() => {});
  }, []);

  // Resolve account when details are complete
  const resolveAccount = useCallback(async () => {
    if (accountNumber.length !== 10 || !bankCode) return;
    setResolving(true);
    setAccountName("");
    try {
      const res = await fetch(
        `/api/resolve-account?account_number=${accountNumber}&bank_code=${bankCode}`
      );
      const data = await res.json();
      if (data.account_name) {
        setAccountName(data.account_name);
      } else {
        toast.error(data.error || "Could not verify account");
      }
    } catch {
      toast.error("Failed to verify account");
    }
    setResolving(false);
  }, [accountNumber, bankCode]);

  useEffect(() => {
    if (accountNumber.length === 10 && bankCode) {
      resolveAccount();
    } else {
      setAccountName("");
    }
  }, [accountNumber, bankCode, resolveAccount]);

  async function handleSubmit() {
    if (!canRedeem) return;
    setLoading(true);
    const result = await redeemCash(accountNumber, bankCode, accountName, numAmount);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`N${numAmount} sent to ${accountName}!`);
      setAmount("");
      setAccountNumber("");
      setAccountName("");
      setBankCode("");
    }
  }

  return (
    <Card>
      <CardContent className="pt-5 space-y-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-800">
            Bank transfers are temporarily unavailable
          </p>
          <p className="text-xs text-amber-600 mt-1">
            We are completing our business verification with our payment provider.
            This feature will be available soon. Please use Airtime or Data redemption in the meantime.
          </p>
        </div>

        <fieldset disabled className="opacity-50 space-y-4">
        <div className="space-y-2">
          <Label>Bank</Label>
          <Select value={bankCode} onValueChange={setBankCode}>
            <SelectTrigger>
              <SelectValue placeholder={banks.length === 0 ? "Loading banks..." : "Select bank"} />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {banks.map((b) => (
                <SelectItem key={b.code} value={b.code}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Account Number</Label>
          <Input
            placeholder="0123456789"
            maxLength={10}
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
          />
        </div>

        {resolving && (
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <Loader2 className="h-3 w-3 animate-spin" />
            Verifying account...
          </div>
        )}
        {accountName && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {accountName}
          </div>
        )}

        <div className="space-y-2">
          <Label>Amount (pts = Naira)</Label>
          <Input
            type="number"
            placeholder="e.g. 500"
            min={100}
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
                N{a}
              </Button>
            ))}
          </div>
        </div>

        {numAmount >= 100 && numAmount <= userPoints && accountName && (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                <strong>{numAmount} pts</strong> will be deducted. <strong>N{numAmount}</strong> sent to {accountName}
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
              Processing transfer...
            </>
          ) : (
            `Transfer N${numAmount || 0}`
          )}
        </Button>
        </fieldset>
      </CardContent>
    </Card>
  );
}
