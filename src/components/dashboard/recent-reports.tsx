import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/reports/status-badge";
import { CATEGORY_LABELS, SEVERITY_LABELS, SEVERITY_COLORS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import type { ReportWithProfile } from "@/types";

interface RecentReportsProps {
  reports: ReportWithProfile[];
  isAdmin?: boolean;
}

export function RecentReports({ reports, isAdmin }: RecentReportsProps) {
  const title = isAdmin ? "Recent Reports" : "My Recent Reports";

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{title}</CardTitle>
            <Link
              href="/reports"
              className="text-sm text-emerald-600 hover:underline"
            >
              View All &rarr;
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-stone-500">
            No reports yet.{" "}
            <Link href="/reports/new" className="text-emerald-600 hover:underline">
              Create a new report
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Link
            href="/reports"
            className="text-sm text-emerald-600 hover:underline"
          >
            View All &rarr;
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reports.map((report) => (
            <Link
              key={report.id}
              href={`/reports/${report.id}`}
              className="flex items-start justify-between gap-4 rounded-lg border p-3 transition-colors hover:bg-stone-50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-900">
                  {report.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <StatusBadge status={report.status} size="sm" />
                  <Badge
                    variant="outline"
                    className="text-xs px-1.5 py-0"
                    style={{
                      color: SEVERITY_COLORS[report.severity],
                      borderColor: SEVERITY_COLORS[report.severity],
                    }}
                  >
                    {SEVERITY_LABELS[report.severity]}
                  </Badge>
                  <span className="text-xs text-stone-400">
                    {CATEGORY_LABELS[report.category]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-stone-400">
                  by {report.profiles.full_name} &middot;{" "}
                  {new Date(report.created_at).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
