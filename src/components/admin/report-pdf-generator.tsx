"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FileDown,
  Loader2,
  BarChart3,
  FileText,
  Users,
  Calendar,
  Banknote,
  Truck,
  Leaf,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import {
  generateReportData,
  type ReportType,
  type ReportFilters,
  type GeneratedReportData,
} from "@/lib/actions/generate-report";

const REPORT_TYPES: {
  value: ReportType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    value: "overview",
    label: "Platform Overview",
    description: "KPIs, user growth, report stats, and revenue summary",
    icon: BarChart3,
  },
  {
    value: "reports",
    label: "Waste Reports",
    description: "Report details with category, severity, and status breakdowns",
    icon: FileText,
  },
  {
    value: "users",
    label: "User Analytics",
    description: "New user registrations, tier distribution, and top contributors",
    icon: Users,
  },
  {
    value: "events",
    label: "Events Summary",
    description: "Cleanup events with RSVPs, status, and organizer details",
    icon: Calendar,
  },
  {
    value: "revenue",
    label: "Revenue",
    description: "Revenue by source with transaction-level breakdown",
    icon: Banknote,
  },
  {
    value: "collectors",
    label: "Waste Collectors",
    description: "Collector directory with pickups, earnings, and ratings",
    icon: Truck,
  },
  {
    value: "carbon",
    label: "Carbon Impact",
    description: "Waste diverted, CO₂ avoided, and carbon credit estimates",
    icon: Leaf,
  },
];

export function ReportPdfGenerator() {
  const [reportType, setReportType] = useState<ReportType>("overview");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [tier, setTier] = useState("all");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<GeneratedReportData | null>(null);

  const selectedType = REPORT_TYPES.find((t) => t.value === reportType)!;

  async function handlePreview() {
    setLoading(true);
    try {
      const filters: ReportFilters = {
        type: reportType,
        dateFrom,
        dateTo,
        status: status !== "all" ? status : undefined,
        severity: severity !== "all" ? severity : undefined,
        tier: tier !== "all" ? tier : undefined,
      };
      const data = await generateReportData(filters);
      setPreview(data);
      toast.success("Report data loaded");
    } catch {
      toast.error("Failed to generate report data");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPdf() {
    if (!preview) return;
    setLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // ── Header with branding ──
      doc.setFillColor(5, 150, 105); // emerald-600
      doc.rect(0, 0, pageWidth, 38, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("WasteMapNaija", margin, 16);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Mapping a Cleaner Nigeria", margin, 23);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(preview.title, margin, 33);
      y = 45;

      // ── Report meta ──
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated: ${new Date(preview.generatedAt).toLocaleString("en-NG")}  |  Period: ${preview.dateRange.from} to ${preview.dateRange.to}`,
        margin,
        y
      );
      y += 8;

      // ── Summary cards ──
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text("Summary", margin, y);
      y += 6;

      const summaryEntries = Object.entries(preview.summary);
      const cardW = (contentWidth - 4 * 2) / 3;
      const cardH = 16;

      for (let i = 0; i < summaryEntries.length; i++) {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const cx = margin + col * (cardW + 2);
        const cy = y + row * (cardH + 2);

        if (cy + cardH > pageHeight - 20) {
          doc.addPage();
          y = margin;
        }

        doc.setFillColor(245, 245, 244); // stone-100
        doc.roundedRect(cx, cy, cardW, cardH, 2, 2, "F");

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(120, 113, 108);
        doc.text(summaryEntries[i][0], cx + 3, cy + 5);

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text(String(summaryEntries[i][1]), cx + 3, cy + 12);
      }

      y += Math.ceil(summaryEntries.length / 3) * (cardH + 2) + 6;

      // ── Breakdown section ──
      if (preview.breakdown.length > 0) {
        if (y > pageHeight - 60) { doc.addPage(); y = margin; }

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text("Breakdown", margin, y);
        y += 6;

        for (const item of preview.breakdown) {
          if (y > pageHeight - 15) { doc.addPage(); y = margin; }

          // Label
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(60, 60, 60);
          doc.text(`${item.label}`, margin, y + 3);
          doc.text(`${item.value} (${item.percentage ?? 0}%)`, margin + contentWidth - 35, y + 3);

          // Progress bar
          const barX = margin + 45;
          const barW = contentWidth - 85;
          doc.setFillColor(229, 231, 235); // gray-200
          doc.roundedRect(barX, y, barW, 4, 1, 1, "F");
          const fillW = barW * ((item.percentage ?? 0) / 100);
          if (fillW > 0) {
            doc.setFillColor(5, 150, 105);
            doc.roundedRect(barX, y, Math.max(fillW, 2), 4, 1, 1, "F");
          }
          y += 8;
        }
        y += 4;
      }

      // ── Data table ──
      if (preview.tableData.length > 0 && preview.tableColumns.length > 0) {
        if (y > pageHeight - 40) { doc.addPage(); y = margin; }

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text(`Data (${preview.tableData.length} records)`, margin, y);
        y += 6;

        const cols = preview.tableColumns;
        const colW = contentWidth / cols.length;

        // Table header
        doc.setFillColor(5, 150, 105);
        doc.rect(margin, y, contentWidth, 6, "F");
        doc.setFontSize(6);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        cols.forEach((col, i) => {
          doc.text(col, margin + i * colW + 1.5, y + 4);
        });
        y += 6;

        // Table rows
        doc.setFont("helvetica", "normal");
        const maxRows = Math.min(preview.tableData.length, 50);
        for (let r = 0; r < maxRows; r++) {
          if (y > pageHeight - 12) {
            doc.addPage();
            y = margin;
            // Re-draw header
            doc.setFillColor(5, 150, 105);
            doc.rect(margin, y, contentWidth, 6, "F");
            doc.setFontSize(6);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 255, 255);
            cols.forEach((col, i) => {
              doc.text(col, margin + i * colW + 1.5, y + 4);
            });
            y += 6;
            doc.setFont("helvetica", "normal");
          }

          const row = preview.tableData[r];
          const isEven = r % 2 === 0;
          if (isEven) {
            doc.setFillColor(250, 250, 249);
            doc.rect(margin, y, contentWidth, 5, "F");
          }

          doc.setFontSize(5.5);
          doc.setTextColor(60, 60, 60);
          cols.forEach((col, i) => {
            const val = String(row[col] ?? "");
            doc.text(val.substring(0, Math.floor(colW / 1.8)), margin + i * colW + 1.5, y + 3.5);
          });
          y += 5;
        }

        if (preview.tableData.length > 50) {
          y += 3;
          doc.setFontSize(7);
          doc.setTextColor(140, 140, 140);
          doc.text(`Showing 50 of ${preview.tableData.length} records`, margin, y);
        }
      }

      // ── Footer on every page ──
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(245, 245, 244);
        doc.rect(0, pageHeight - 10, pageWidth, 10, "F");
        doc.setFontSize(7);
        doc.setTextColor(140, 140, 140);
        doc.text("WasteMapNaija — wastemapnaija.com.ng", margin, pageHeight - 4);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 4);
      }

      const filename = `wastemapnaija-${preview.type}-${preview.dateRange.from}-to-${preview.dateRange.to}.pdf`;
      doc.save(filename);
      toast.success(`Downloaded ${filename}`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Report type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {REPORT_TYPES.map((rt) => {
          const Icon = rt.icon;
          const isSelected = reportType === rt.value;
          return (
            <button
              key={rt.value}
              type="button"
              onClick={() => {
                setReportType(rt.value);
                setPreview(null);
              }}
              className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20"
                  : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isSelected ? "text-emerald-600" : "text-stone-400"
                }`}
              />
              <div>
                <p
                  className={`text-sm font-semibold ${
                    isSelected ? "text-emerald-900" : "text-stone-700"
                  }`}
                >
                  {rt.label}
                </p>
                <p className="text-xs text-stone-500 mt-0.5 leading-tight">
                  {rt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">From</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">To</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {(reportType === "reports" || reportType === "events") && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {reportType === "reports" ? (
                      <>
                        <SelectItem value="reported">Reported</SelectItem>
                        <SelectItem value="acknowledged">Acknowledged</SelectItem>
                        <SelectItem value="cleanup_scheduled">Cleanup Scheduled</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {reportType === "reports" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Severity</label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {reportType === "users" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Tier</label>
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="green_starter">Green Starter</SelectItem>
                    <SelectItem value="eco_warrior">Eco Warrior</SelectItem>
                    <SelectItem value="clean_champion">Clean Champion</SelectItem>
                    <SelectItem value="waste_hero">Waste Hero</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <Button onClick={handlePreview} disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Preview Report
            </Button>
            {preview && (
              <Button
                onClick={handleDownloadPdf}
                disabled={loading}
                variant="outline"
                className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                Download PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {preview && (
        <div className="space-y-4">
          {/* Summary */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{preview.title}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {preview.dateRange.from} — {preview.dateRange.to}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(preview.summary).map(([key, val]) => (
                  <div
                    key={key}
                    className="rounded-lg bg-stone-50 border border-stone-100 p-3"
                  >
                    <p className="text-xs text-stone-500">{key}</p>
                    <p className="text-lg font-bold text-stone-900 mt-0.5">
                      {val}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Breakdown */}
          {preview.breakdown.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {preview.breakdown.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="w-32 truncate text-sm text-stone-600">
                      {item.label}
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${item.percentage ?? 0}%` }}
                      />
                    </div>
                    <span className="w-20 text-right text-sm font-medium text-stone-700">
                      {item.value} ({item.percentage ?? 0}%)
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Data table */}
          {preview.tableData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Data ({preview.tableData.length} records)
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200">
                      {preview.tableColumns.map((col) => (
                        <th
                          key={col}
                          className="px-2 py-2 text-left text-xs font-semibold text-stone-500 uppercase"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.tableData.slice(0, 25).map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-stone-100 hover:bg-stone-50"
                      >
                        {preview.tableColumns.map((col) => (
                          <td
                            key={col}
                            className="px-2 py-1.5 text-stone-700 whitespace-nowrap"
                          >
                            {String(row[col] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.tableData.length > 25 && (
                  <p className="mt-2 text-xs text-stone-400 text-center">
                    Showing 25 of {preview.tableData.length} records. Full data included in PDF.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
