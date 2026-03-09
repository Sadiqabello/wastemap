export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAllReportsAdmin } from "@/lib/queries/admin";
import { adminDeleteReport } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportStatusDialog } from "@/components/admin/report-status-dialog";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { ReportFilters } from "@/components/admin/report-filters";
import { AdminReportEditButton } from "@/components/admin/admin-report-edit-button";
import { ReportBulkActions } from "./report-bulk-actions";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  CATEGORY_LABELS,
  SEVERITY_LABELS,
  SEVERITY_COLORS,
} from "@/lib/constants";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ExternalLink,
  ThumbsUp,
} from "lucide-react";

interface ReportsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    category?: string;
  }>;
}

export default async function AdminReportsPage({
  searchParams,
}: ReportsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const search = params.search ?? "";
  const statusFilter = params.status ?? "all";
  const categoryFilter = params.category ?? "all";

  const { reports, total } = await getAllReportsAdmin(
    page,
    search || undefined,
    statusFilter,
    categoryFilter
  );
  const totalPages = Math.ceil(total / 20);

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (statusFilter !== "all") p.set("status", statusFilter);
    if (categoryFilter !== "all") p.set("category", categoryFilter);
    p.set("page", String(page));
    for (const [k, v] of Object.entries(overrides)) {
      if (v && v !== "all") p.set(k, v);
      else p.delete(k);
    }
    return `/admin/reports?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Report Management</h1>
        <p className="text-muted-foreground">
          {total} report{total !== 1 ? "s" : ""} total
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <form className="relative" action="/admin/reports" method="GET">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          {statusFilter !== "all" && (
            <input type="hidden" name="status" value={statusFilter} />
          )}
          {categoryFilter !== "all" && (
            <input type="hidden" name="category" value={categoryFilter} />
          )}
          <input
            name="search"
            defaultValue={search}
            placeholder="Search reports..."
            className="h-9 w-64 rounded-md border bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </form>

        <ReportFilters />
      </div>

      <ReportBulkActions reportIds={reports.map((r) => r.id)}>
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <span className="sr-only">Select</span>
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Upvotes</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground py-8"
                  >
                    No reports found.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id} data-report-id={report.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        name="reportSelect"
                        value={report.id}
                        className="h-4 w-4 rounded border-stone-300"
                      />
                    </TableCell>
                    <TableCell>
                      <span className="font-medium line-clamp-1">
                        {report.title}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {report.profiles?.full_name ?? "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {CATEGORY_LABELS[report.category] ?? report.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: SEVERITY_COLORS[report.severity],
                          color: SEVERITY_COLORS[report.severity],
                        }}
                      >
                        {SEVERITY_LABELS[report.severity] ?? report.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: STATUS_COLORS[report.status],
                          color: STATUS_COLORS[report.status],
                        }}
                      >
                        {STATUS_LABELS[report.status] ?? report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="flex items-center justify-end gap-1 text-muted-foreground">
                        <ThumbsUp className="h-3 w-3" />
                        {report.upvote_count}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <AdminReportEditButton
                          reportId={report.id}
                          title={report.title}
                          category={report.category}
                          severity={report.severity}
                          status={report.status}
                          description={report.description ?? undefined}
                        />
                        <Link href={`/reports/${report.id}`} target="_blank">
                          <Button variant="ghost" size="sm" className="h-8 gap-1.5">
                            <ExternalLink className="h-3.5 w-3.5" />
                            View
                          </Button>
                        </Link>
                        <ReportStatusDialog
                          reportId={report.id}
                          currentStatus={report.status}
                          reportTitle={report.title}
                        />
                        <DeleteConfirmDialog
                          itemName={report.title}
                          onConfirm={async () => {
                            "use server";
                            return adminDeleteReport(report.id);
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </ReportBulkActions>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={buildUrl({ page: String(page - 1) })}>
                <Button variant="outline" size="sm">
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={buildUrl({ page: String(page + 1) })}>
                <Button variant="outline" size="sm">
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
