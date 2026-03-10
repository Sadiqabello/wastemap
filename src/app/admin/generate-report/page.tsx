import { FileBarChart } from "lucide-react";
import { ReportPdfGenerator } from "@/components/admin/report-pdf-generator";

export const metadata = {
  title: "Generate Report - Admin",
};

export default function GenerateReportPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <FileBarChart className="h-6 w-6 text-stone-700" />
          <h1 className="text-2xl font-bold text-stone-900">Generate Report</h1>
        </div>
        <p className="mt-1 text-sm text-stone-500">
          Generate branded PDF reports with insights from platform data. Select a
          report type, apply filters, preview the data, and download.
        </p>
      </div>

      <ReportPdfGenerator />
    </div>
  );
}
