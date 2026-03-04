import { ReportForm } from "@/components/reports/report-form";

export default function NewReportPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Report Waste</h1>
        <p className="mt-1 text-sm text-stone-500">
          Help keep your community clean by reporting illegal dumpsites and waste
          hotspots.
        </p>
      </div>
      <ReportForm />
    </div>
  );
}
