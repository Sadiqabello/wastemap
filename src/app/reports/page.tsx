import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPaginatedReports } from "@/lib/queries/reports";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/reports/status-badge";
import {
  CATEGORY_LABELS,
  SEVERITY_LABELS,
  SEVERITY_COLORS,
} from "@/lib/constants";
import { ReportsFilters } from "./reports-filters";
import { FileText, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import type { WasteCategory, SeverityLevel, ReportStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/reports");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  // Parse params
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const search = params.search || undefined;
  const category = params.category as WasteCategory | undefined;
  const severity = params.severity as SeverityLevel | undefined;
  const status = params.status as ReportStatus | undefined;
  const dateFrom = params.dateFrom || undefined;
  const dateTo = params.dateTo || undefined;
  const sort = params.sort || "newest";

  // Map sort param to sortBy/sortOrder
  const sortMap: Record<string, { sortBy: string; sortOrder: string }> = {
    newest: { sortBy: "created_at", sortOrder: "desc" },
    oldest: { sortBy: "created_at", sortOrder: "asc" },
    severity_high: { sortBy: "severity", sortOrder: "desc" },
    severity_low: { sortBy: "severity", sortOrder: "asc" },
  };
  const { sortBy, sortOrder } = sortMap[sort] || sortMap.newest;

  const { reports, total } = await getPaginatedReports({
    page,
    search,
    category,
    severity,
    status,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
    isAdmin,
    userId: user.id,
  });

  const totalPages = Math.ceil(total / 20);

  // Build pagination href helper
  function pageHref(p: number) {
    const sp = new URLSearchParams();
    sp.set("page", String(p));
    if (search) sp.set("search", search);
    if (category) sp.set("category", category);
    if (severity) sp.set("severity", severity);
    if (status) sp.set("status", status);
    if (dateFrom) sp.set("dateFrom", dateFrom);
    if (dateTo) sp.set("dateTo", dateTo);
    if (sort && sort !== "newest") sp.set("sort", sort);
    return `/reports?${sp.toString()}`;
  }

  // Visible page numbers
  const visiblePages: number[] = [];
  const maxVisible = 5;
  let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
  const endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  for (let i = startPage; i <= endPage; i++) {
    visiblePages.push(i);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {isAdmin ? "All Reports" : "My Reports"}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {total} report{total !== 1 ? "s" : ""} found
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/reports/new">
            <Plus className="size-4" />
            New Report
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <ReportsFilters
        search={search}
        category={category}
        severity={severity}
        status={status}
        dateFrom={dateFrom}
        dateTo={dateTo}
        sort={sort}
      />

      {/* Report List */}
      {reports.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="size-12 text-stone-300" />
            <p className="mt-4 text-sm font-medium text-stone-500">
              No reports found
            </p>
            <p className="mt-1 text-xs text-stone-400">
              Try adjusting your filters or create a new report.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {reports.map((report) => (
            <Link
              key={report.id}
              href={`/reports/${report.id}`}
              className="block rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:border-stone-300 hover:bg-stone-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-stone-900">
                    {report.title}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
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
                    {report.category.map((cat) => (
                      <Badge
                        key={cat}
                        variant="secondary"
                        className="text-xs px-1.5 py-0"
                      >
                        {CATEGORY_LABELS[cat]}
                      </Badge>
                    ))}
                  </div>

                  {report.address && (
                    <p className="mt-2 truncate text-xs text-stone-500">
                      {report.address}
                    </p>
                  )}

                  <p className="mt-1.5 text-xs text-stone-400">
                    {isAdmin && (
                      <>
                        <span className="font-medium text-stone-500">
                          {report.profiles.full_name}
                        </span>
                        {" \u00b7 "}
                      </>
                    )}
                    {new Date(report.created_at).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-1">
          {page > 1 ? (
            <Button variant="outline" size="icon-sm" asChild>
              <Link href={pageHref(page - 1)}>
                <ChevronLeft className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="icon-sm" disabled>
              <ChevronLeft className="size-4" />
            </Button>
          )}

          {startPage > 1 && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href={pageHref(1)}>1</Link>
              </Button>
              {startPage > 2 && (
                <span className="px-1 text-xs text-stone-400">...</span>
              )}
            </>
          )}

          {visiblePages.map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              asChild={p !== page}
            >
              {p === page ? (
                <span>{p}</span>
              ) : (
                <Link href={pageHref(p)}>{p}</Link>
              )}
            </Button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-1 text-xs text-stone-400">...</span>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={pageHref(totalPages)}>{totalPages}</Link>
              </Button>
            </>
          )}

          {page < totalPages ? (
            <Button variant="outline" size="icon-sm" asChild>
              <Link href={pageHref(page + 1)}>
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="icon-sm" disabled>
              <ChevronRight className="size-4" />
            </Button>
          )}
        </nav>
      )}
    </div>
  );
}
