import Link from "next/link";
import { getAllCollectorsAdmin, getCollectorStats } from "@/lib/queries/collectors";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearch } from "@/components/admin/admin-search";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminCollectorDelete } from "@/components/admin/admin-collector-delete";
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
import { Truck, Clock, Package, Banknote, Star, Eye } from "lucide-react";
import { COLLECTOR_STATUS_LABELS } from "@/lib/constants";
import type { CollectorStats } from "@/types";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 20;

const STATUS_FILTER_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

const STATUS_BADGE_CLASSES: Record<string, string> = {
  verified: "border-emerald-300 bg-emerald-50 text-emerald-700",
  pending: "border-amber-300 bg-amber-50 text-amber-700",
  rejected: "border-red-300 bg-red-50 text-red-700",
  suspended: "border-orange-300 bg-orange-50 text-orange-700",
};

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AdminCollectorsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.q || undefined;
  const status = params.status || undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const [{ collectors, total }, rawStats] = await Promise.all([
    getAllCollectorsAdmin(page, ITEMS_PER_PAGE, search, status),
    getCollectorStats(),
  ]);

  const stats = rawStats as CollectorStats;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Waste Collectors"
        description="Manage collector registrations and verify profiles"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          title="Active Collectors"
          value={stats.active_collectors}
          icon={Truck}
        />
        <AdminStatCard
          title="Pending Verification"
          value={stats.pending_collectors}
          icon={Clock}
        />
        <AdminStatCard
          title="Total Pickups"
          value={stats.total_pickups}
          icon={Package}
        />
        <AdminStatCard
          title="Total Earnings"
          value={`₦${stats.total_collector_earnings.toLocaleString()}`}
          icon={Banknote}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminSearch placeholder="Search by business name..." />
        <AdminFilterBar
          filters={[
            {
              paramName: "status",
              label: "Status",
              options: STATUS_FILTER_OPTIONS,
            },
          ]}
        />
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Pickups</TableHead>
              <TableHead className="text-right">Earnings</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collectors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12">
                  <AdminEmptyState
                    icon={Truck}
                    title="No collectors found"
                    description={
                      search || status
                        ? "Try adjusting your search or filters."
                        : "No collector registrations yet."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              collectors.map((collector) => (
                <TableRow key={collector.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">
                        {collector.business_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {collector.profiles?.full_name || "Unknown"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs ${STATUS_BADGE_CLASSES[collector.status] || ""}`}
                    >
                      {COLLECTOR_STATUS_LABELS[collector.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {collector.phone || (
                      <span className="italic text-stone-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">
                    {collector.address || (
                      <span className="italic text-stone-400">No address</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 text-amber-500" />
                      {collector.rating || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {collector.total_pickups}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    ₦{(collector.total_earnings || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/collectors/${collector.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </Link>
                      <AdminCollectorDelete collectorId={collector.id} name={collector.business_name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AdminPagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
