"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Building2, Trash2 } from "lucide-react";
import { toggleSponsorship, editSponsorship, deleteSponsorship } from "@/lib/actions/admin-collectors";
import { AdminEditDialog } from "./admin-edit-dialog";
import { SPONSORSHIP_TIER_LABELS, SPONSORSHIP_TIER_COLORS } from "@/lib/constants";
import type { Sponsorship } from "@/types";
import Image from "next/image";

interface AdminSponsorCardProps {
  sponsor: Sponsorship;
}

export function AdminSponsorCard({ sponsor }: AdminSponsorCardProps) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const result = await toggleSponsorship(sponsor.id, !sponsor.is_active);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(sponsor.is_active ? "Sponsorship deactivated" : "Sponsorship activated");
    }
  }

  const budgetPercent = sponsor.budget_allocated > 0
    ? Math.round((sponsor.budget_spent / sponsor.budget_allocated) * 100)
    : 0;

  return (
    <Card>
      <CardContent className="pt-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-stone-50">
            {sponsor.logo_url ? (
              <Image
                src={sponsor.logo_url}
                alt={sponsor.company_name}
                fill
                className="object-contain p-1"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Building2 className="h-5 w-5 text-stone-300" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">{sponsor.company_name}</h3>
              <Badge
                className="text-[10px]"
                style={{
                  backgroundColor: SPONSORSHIP_TIER_COLORS[sponsor.tier] + "30",
                  color: SPONSORSHIP_TIER_COLORS[sponsor.tier],
                }}
              >
                {SPONSORSHIP_TIER_LABELS[sponsor.tier]}
              </Badge>
              {!sponsor.is_active && (
                <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {sponsor.contact_name && `${sponsor.contact_name} | `}
              {new Date(sponsor.start_date).toLocaleDateString()} - {new Date(sponsor.end_date).toLocaleDateString()}
            </p>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">
                  Budget: ₦{sponsor.budget_spent.toLocaleString()} / ₦{sponsor.budget_allocated.toLocaleString()}
                </span>
                <span className="text-muted-foreground">{budgetPercent}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7"
              onClick={handleToggle}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              {sponsor.is_active ? "Deactivate" : "Activate"}
            </Button>
            <AdminEditDialog
              title={`Edit: ${sponsor.company_name}`}
              triggerSize="sm"
              triggerLabel="Edit"
              triggerVariant="outline"
              fields={[
                { name: "company_name", label: "Company Name", defaultValue: sponsor.company_name, required: true },
                { name: "contact_name", label: "Contact Name", defaultValue: sponsor.contact_name || "" },
                { name: "contact_email", label: "Contact Email", type: "email", defaultValue: sponsor.contact_email || "" },
                {
                  name: "tier", label: "Tier", type: "select", defaultValue: sponsor.tier,
                  options: [
                    { value: "bronze", label: "Bronze" },
                    { value: "silver", label: "Silver" },
                    { value: "gold", label: "Gold" },
                    { value: "platinum", label: "Platinum" },
                  ],
                },
                { name: "start_date", label: "Start Date", type: "date", defaultValue: sponsor.start_date },
                { name: "end_date", label: "End Date", type: "date", defaultValue: sponsor.end_date },
                { name: "budget_allocated", label: "Budget (\u20A6)", type: "number", defaultValue: sponsor.budget_allocated },
              ]}
              onSave={async (data) => editSponsorship(sponsor.id, data as any)}
            />
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={async () => {
                if (!confirm("Delete this sponsorship?")) return;
                setLoading(true);
                const result = await deleteSponsorship(sponsor.id);
                setLoading(false);
                if (result.error) toast.error(result.error);
                else toast.success("Sponsorship deleted");
              }}
              disabled={loading}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
