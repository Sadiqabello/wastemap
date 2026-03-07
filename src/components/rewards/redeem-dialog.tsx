"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Star, Loader2, CheckCircle2 } from "lucide-react";
import { redeemReward } from "@/lib/actions/rewards";
import { REWARD_CATEGORY_LABELS } from "@/lib/constants";
import type { Reward } from "@/types";

interface Bank {
  code: string;
  name: string;
}

interface RedeemDialogProps {
  reward: Reward | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userPhone?: string | null;
}

export function RedeemDialog({ reward, open, onOpenChange, userPhone }: RedeemDialogProps) {
  const [phone, setPhone] = useState(userPhone || "");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [banks, setBanks] = useState<Bank[]>([]);
  const [resolving, setResolving] = useState(false);
  const [loading, setLoading] = useState(false);

  const needsPhone = reward ? ["airtime", "data"].includes(reward.category) : false;
  const needsBank = reward?.category === "bank_transfer";

  // Fetch banks when dialog opens for bank_transfer rewards
  useEffect(() => {
    if (needsBank && open && banks.length === 0) {
      fetch("/api/banks")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setBanks(data);
        })
        .catch(() => {});
    }
  }, [needsBank, open, banks.length]);

  // Resolve account name when account number and bank are provided
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

  if (!reward) return null;

  async function handleRedeem() {
    if (needsPhone && !phone) {
      toast.error("Please enter a phone number");
      return;
    }
    if (needsBank && (!accountNumber || !bankCode)) {
      toast.error("Please enter account details");
      return;
    }
    if (needsBank && !accountName) {
      toast.error("Please wait for account verification");
      return;
    }

    setLoading(true);
    const details: Record<string, string> = {};
    if (needsPhone) details.phoneNumber = phone;
    if (needsBank) {
      details.accountNumber = accountNumber;
      details.bankCode = bankCode;
      details.accountName = accountName;
    }

    const result = await redeemReward(reward!.id, details);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Reward redeemed! Your reward will be delivered shortly.");
      onOpenChange(false);
      // Reset form
      setAccountNumber("");
      setBankCode("");
      setAccountName("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Redeem Reward</DialogTitle>
          <DialogDescription>
            You are about to redeem &quot;{reward.name}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border bg-stone-50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{reward.name}</p>
                <p className="text-xs text-stone-500">
                  {REWARD_CATEGORY_LABELS[reward.category]}
                </p>
              </div>
              <div className="flex items-center gap-1 text-emerald-700">
                <Star className="h-4 w-4" />
                <span className="font-bold">{reward.point_cost} pts</span>
              </div>
            </div>
          </div>

          {needsPhone && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="08012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs text-stone-400">
                The {reward.category === "airtime" ? "airtime" : "data bundle"} will be sent to this number
              </p>
            </div>
          )}

          {needsBank && (
            <>
              <div className="space-y-2">
                <Label htmlFor="bank">Bank</Label>
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
                <Label htmlFor="account">Account Number</Label>
                <Input
                  id="account"
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
            </>
          )}

          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
            This action will deduct {reward.point_cost} points from your balance.
            This cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleRedeem}
            disabled={loading || (needsBank && !accountName)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Redeem for ${reward.point_cost} pts`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
