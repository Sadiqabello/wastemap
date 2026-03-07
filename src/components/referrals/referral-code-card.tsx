"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Share2, Loader2 } from "lucide-react";
import { generateReferralCode } from "@/lib/actions/referrals";

interface ReferralCodeCardProps {
  code: string | null;
  baseUrl: string;
}

export function ReferralCodeCard({ code, baseUrl }: ReferralCodeCardProps) {
  const [referralCode, setReferralCode] = useState(code);
  const [generating, setGenerating] = useState(false);

  const referralLink = referralCode ? `${baseUrl}/signup?ref=${referralCode}` : "";

  async function handleGenerate() {
    setGenerating(true);
    const result = await generateReferralCode();
    setGenerating(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setReferralCode(result.code!);
      toast.success("Referral code generated!");
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: "Join WasteMap",
        text: "Help keep our community clean and earn rewards! Join WasteMap using my referral link:",
        url: referralLink,
      });
    } else {
      handleCopy();
    }
  }

  if (!referralCode) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-8">
          <Share2 className="mb-3 h-10 w-10 text-stone-300" />
          <p className="text-sm text-stone-500 mb-3">
            Generate your referral code to start inviting friends
          </p>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="mr-2 h-4 w-4" />
            )}
            Generate Referral Code
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div>
          <p className="text-xs font-medium text-stone-500 mb-1">Your Referral Code</p>
          <p className="text-2xl font-bold text-emerald-700 tracking-wider">{referralCode}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-stone-500 mb-1">Share this link</p>
          <div className="flex gap-2">
            <Input
              readOnly
              value={referralLink}
              className="text-xs bg-stone-50"
            />
            <Button size="icon" variant="outline" onClick={handleCopy} title="Copy link">
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={handleShare} className="bg-emerald-600 hover:bg-emerald-700" title="Share">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-700">
          <p className="font-medium mb-0.5">How it works:</p>
          <ul className="list-disc pl-4 space-y-0.5 text-emerald-600">
            <li>Both you and your friend get <strong>5 points</strong> on signup</li>
            <li>You get <strong>20 points</strong> when they submit their first report</li>
            <li>You get <strong>15 points</strong> when they attend their first event</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
