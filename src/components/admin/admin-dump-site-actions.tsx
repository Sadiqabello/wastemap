"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminEditDialog } from "./admin-edit-dialog";
import { updateDumpSiteStatus } from "@/lib/actions/dump-sites";
import { adminDeleteDumpSite, adminEditDumpSite } from "@/lib/actions/admin-collectors";
import { CheckCircle2, XCircle, Archive, Trash2, Loader2 } from "lucide-react";
import { DUMP_SITE_TYPE_LABELS } from "@/lib/constants";

interface AdminDumpSiteActionsProps {
  siteId: string;
  currentStatus: string;
  siteName?: string;
  description?: string;
  siteType?: string;
  address?: string;
  operatingHours?: string;
  isFree?: boolean;
}

export function AdminDumpSiteActions({
  siteId,
  currentStatus,
  siteName,
  description,
  siteType,
  address,
  operatingHours,
  isFree,
}: AdminDumpSiteActionsProps) {
  const [loading, setLoading] = useState(false);

  async function handleUpdate(newStatus: "verified" | "rejected" | "closed") {
    setLoading(true);
    const result = await updateDumpSiteStatus(siteId, newStatus);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Site ${newStatus} successfully`);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this dump site?")) return;
    setLoading(true);
    const result = await adminDeleteDumpSite(siteId);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else toast.success("Dump site deleted");
  }

  return (
    <div className="flex items-center gap-1">
      {siteName && (
        <AdminEditDialog
          title={`Edit: ${siteName}`}
          triggerSize="icon"
          fields={[
            { name: "name", label: "Name", defaultValue: siteName, required: true },
            { name: "description", label: "Description", type: "textarea", defaultValue: description || "" },
            {
              name: "site_type", label: "Type", type: "select", defaultValue: siteType,
              options: Object.entries(DUMP_SITE_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })),
            },
            { name: "address", label: "Address", defaultValue: address || "" },
            { name: "operating_hours", label: "Operating Hours", defaultValue: operatingHours || "" },
            {
              name: "status", label: "Status", type: "select", defaultValue: currentStatus,
              options: [
                { value: "pending", label: "Pending" },
                { value: "verified", label: "Verified" },
                { value: "rejected", label: "Rejected" },
                { value: "closed", label: "Closed" },
              ],
            },
          ]}
          onSave={async (data) => adminEditDumpSite(siteId, data as any)}
        />
      )}
      {currentStatus !== "verified" && (
        <Button size="icon" variant="ghost" onClick={() => handleUpdate("verified")} disabled={loading} className="h-7 w-7" title="Verify site">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
        </Button>
      )}
      {currentStatus !== "rejected" && (
        <Button size="icon" variant="ghost" onClick={() => handleUpdate("rejected")} disabled={loading} className="h-7 w-7" title="Reject site">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 text-red-500" />}
        </Button>
      )}
      {currentStatus !== "closed" && (
        <Button size="icon" variant="ghost" onClick={() => handleUpdate("closed")} disabled={loading} className="h-7 w-7" title="Close site">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Archive className="h-3 w-3 text-gray-500" />}
        </Button>
      )}
      <Button size="icon" variant="ghost" onClick={handleDelete} disabled={loading} className="h-7 w-7 text-red-500 hover:text-red-700" title="Delete">
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
