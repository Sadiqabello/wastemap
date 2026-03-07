"use client";

import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Image as ImageIcon, Loader2 } from "lucide-react";
import { getRedemptionLabel } from "./redemption-history";
import type { RedemptionWithReward } from "@/types";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  processing: { label: "Processing", className: "bg-blue-50 text-blue-700 border-blue-200" },
  completed: { label: "Completed", className: "bg-green-50 text-green-700 border-green-200" },
  failed: { label: "Failed", className: "bg-red-50 text-red-700 border-red-200" },
  refunded: { label: "Refunded", className: "bg-stone-50 text-stone-700 border-stone-200" },
};

interface RedemptionInvoiceProps {
  redemption: RedemptionWithReward;
  userName: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RedemptionInvoice({ redemption, userName }: RedemptionInvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<"image" | "pdf" | null>(null);

  const label = getRedemptionLabel(redemption);
  const status = STATUS_STYLES[redemption.status] || STATUS_STYLES.pending;
  const details = redemption.delivery_details as Record<string, string> | null;

  async function exportAsImage() {
    if (!invoiceRef.current) return;
    setExporting("image");
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(invoiceRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `wastemap-invoice-${redemption.id.slice(0, 8)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export image error:", err);
    } finally {
      setExporting(null);
    }
  }

  async function exportAsPdf() {
    if (!invoiceRef.current) return;
    setExporting("pdf");
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(invoiceRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`wastemap-invoice-${redemption.id.slice(0, 8)}.pdf`);
    } catch (err) {
      console.error("Export PDF error:", err);
    } finally {
      setExporting(null);
    }
  }

  return (
    <div>
      {/* Export buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={exportAsImage}
          disabled={!!exporting}
        >
          {exporting === "image" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <ImageIcon className="h-4 w-4 mr-1" />
          )}
          Save as Image
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={exportAsPdf}
          disabled={!!exporting}
        >
          {exporting === "pdf" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <Download className="h-4 w-4 mr-1" />
          )}
          Save as PDF
        </Button>
      </div>

      {/* Invoice card */}
      <Card>
        <div ref={invoiceRef} className="bg-white p-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-emerald-700">WasteMap</h2>
              <p className="text-xs text-stone-400">Redemption Invoice</p>
            </div>
            <Badge variant="outline" className={`text-xs ${status.className}`}>
              {status.label}
            </Badge>
          </div>

          {/* Invoice details */}
          <CardContent className="p-0 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-stone-400 text-xs">Invoice ID</p>
                <p className="font-mono text-stone-700 text-xs">{redemption.id.slice(0, 12)}...</p>
              </div>
              <div>
                <p className="text-stone-400 text-xs">Date</p>
                <p className="text-stone-700">{formatDate(redemption.created_at)}</p>
              </div>
              <div>
                <p className="text-stone-400 text-xs">Redeemed By</p>
                <p className="text-stone-700">{userName}</p>
              </div>
              {redemption.provider_reference && (
                <div>
                  <p className="text-stone-400 text-xs">Reference</p>
                  <p className="font-mono text-stone-700 text-xs">{redemption.provider_reference}</p>
                </div>
              )}
            </div>

            {/* Line item */}
            <div className="border rounded-lg p-3 mt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-stone-900">{label.name}</p>
                  <p className="text-xs text-stone-500">{label.category}</p>
                </div>
                <p className="font-bold text-stone-900">{redemption.points_spent} pts</p>
              </div>
            </div>

            {/* Delivery details */}
            {details && Object.keys(details).length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-stone-400 mb-1">Details</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {details.phone && (
                    <div>
                      <span className="text-stone-400">Phone: </span>
                      <span className="text-stone-700">{details.phone}</span>
                    </div>
                  )}
                  {details.network && (
                    <div>
                      <span className="text-stone-400">Network: </span>
                      <span className="text-stone-700 uppercase">{details.network}</span>
                    </div>
                  )}
                  {details.amount && (
                    <div>
                      <span className="text-stone-400">Amount: </span>
                      <span className="text-stone-700">N{details.amount}</span>
                    </div>
                  )}
                  {details.accountName && (
                    <div>
                      <span className="text-stone-400">Account: </span>
                      <span className="text-stone-700">{details.accountName}</span>
                    </div>
                  )}
                  {details.bankCode && (
                    <div>
                      <span className="text-stone-400">Bank Code: </span>
                      <span className="text-stone-700">{details.bankCode}</span>
                    </div>
                  )}
                  {details.variationCode && (
                    <div>
                      <span className="text-stone-400">Plan: </span>
                      <span className="text-stone-700">{details.variationCode}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Failure reason */}
            {redemption.failure_reason && (
              <div className="mt-3 rounded-md bg-red-50 p-2">
                <p className="text-xs text-red-600">{redemption.failure_reason}</p>
              </div>
            )}

            {/* Completed date */}
            {redemption.completed_at && (
              <div className="mt-3 text-xs text-stone-400">
                Completed: {formatDate(redemption.completed_at)}
              </div>
            )}

            {/* Footer */}
            <div className="border-t pt-3 mt-4 flex justify-between items-center">
              <p className="text-xs text-stone-400">
                Conversion: 1 pt = N1
              </p>
              <p className="text-sm font-bold text-emerald-700">
                Total: {redemption.points_spent} pts (N{redemption.points_spent})
              </p>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
