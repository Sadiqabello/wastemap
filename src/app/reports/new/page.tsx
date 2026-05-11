import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ReportForm } from "@/components/reports/report-form";

export default function NewReportPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link
        href="/"
        className="mb-3 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to map
      </Link>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-stone-900">Report waste</h1>
        <p className="mt-1 text-sm text-stone-500">
          Add a photo, pin the spot, submit. Takes under a minute.
        </p>
      </div>
      <ReportForm />
    </div>
  );
}
