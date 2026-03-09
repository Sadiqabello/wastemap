"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { createReward } from "@/lib/actions/admin-rewards";
import { REWARD_CATEGORY_LABELS, TIER_LABELS } from "@/lib/constants";

const PROVIDER_MAP: Record<string, string> = {
  airtime: "vtpass",
  data: "vtpass",
  utility: "vtpass",
  bank_transfer: "paystack",
  gift_card: "manual",
  merchandise: "manual",
};

export function AdminCreateRewardForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [provider, setProvider] = useState("manual");

  function handleCategoryChange(value: string) {
    setCategory(value);
    setProvider(PROVIDER_MAP[value] || "manual");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("provider", provider);
    const result = await createReward(formData);
    setLoading(false);

    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Invalid input");
    } else {
      toast.success("Reward created!");
      setOpen(false);
      setCategory("");
      setProvider("manual");
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Reward
          </CardTitle>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required placeholder="MTN ₦100 Airtime" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" required value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(REWARD_CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Optional description" rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="point_cost">Point Cost</Label>
                <Input id="point_cost" name="point_cost" type="number" min="1" required placeholder="100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock (empty = unlimited)</Label>
                <Input id="stock" name="stock" type="number" min="0" placeholder="Unlimited" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tier_required">Tier Required</Label>
                <Select name="tier_required">
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {Object.entries(TIER_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vtpass">VTPass (Airtime/Data/Utility)</SelectItem>
                    <SelectItem value="paystack">Paystack (Bank Transfer)</SelectItem>
                    <SelectItem value="manual">Manual (Admin fulfills)</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="provider" value={provider} />
              </div>
              {category === "airtime" && (
                <div className="space-y-2">
                  <Label htmlFor="amount">Naira Amount</Label>
                  <Input id="amount" name="amount" type="number" min="50" placeholder="100" />
                  <p className="text-[10px] text-stone-400">Amount in Naira to send (e.g. 100 for ₦100 airtime)</p>
                </div>
              )}
            </div>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create Reward
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
