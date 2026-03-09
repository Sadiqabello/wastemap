import { getAllDumpSitesAdmin } from "@/lib/queries/dump-sites";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearch } from "@/components/admin/admin-search";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminDumpSiteActions } from "@/components/admin/admin-dump-site-actions";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DUMP_SITE_TYPE_LABELS, DUMP_SITE_STATUS_LABELS } from "@/lib/constants";
import { MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 20;

const STATUS_BADGE_CLASSES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  verified: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  closed: "bg-gray-50 text-gray-700 border-gray-200",
};

const STATUS_FILTER_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "closed", label: "Closed" },
];

const TYPE_FILTER_OPTIONS = [
  { value: "trash_can", label: "Trash Can" },
  { value: "recycling_bin", label: "Recycling Bin" },
  { value: "dumpster", label: "Dumpster" },
  { value: "transfer_station", label: "Transfer Station" },
  { value: "landfill", label: "Landfill" },
  { value: "compost_site", label: "Compost Site" },
  { value: "drop_off_center", label: "Drop-off Center" },
  { value: "street_bin", label: "Street Bin" },
];

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    type?: string;
    page?: string;
  }>;
}

export default async function AdminDumpSitesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.q || undefined;
  const status = params.status || undefined;
  const siteType = params.type || undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const { sites, total } = await getAllDumpSitesAdmin(
    page,
    ITEMS_PER_PAGE,
    search,
    status,
    siteType
  );

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dump Sites"
        description={`${total} site${total !== 1 ? "s" : ""} total`}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminSearch placeholder="Search by name or address..." />
        <AdminFilterBar
          filters={[
            {
              paramName: "status",
              label: "Status",
              options: STATUS_FILTER_OPTIONS,
            },
            {
              paramName: "type",
              label: "Type",
              options: TYPE_FILTER_OPTIONS,
            },
          ]}
        />
      </div>

      {sites.length > 0 ? (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Added Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell>
                    <span className="font-medium line-clamp-1">
                      {site.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {DUMP_SITE_TYPE_LABELS[site.site_type] ?? site.site_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs ${STATUS_BADGE_CLASSES[site.status] ?? ""}`}
                    >
                      {DUMP_SITE_STATUS_LABELS[site.status] ?? site.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px]">
                    <span className="line-clamp-1">
                      {site.address || "No address"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(site.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <AdminDumpSiteActions
                      siteId={site.id}
                      currentStatus={site.status}
                      siteName={site.name}
                      description={site.description ?? undefined}
                      siteType={site.site_type}
                      address={site.address ?? undefined}
                      operatingHours={site.operating_hours ?? undefined}
                      isFree={site.is_free ?? undefined}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <AdminEmptyState
          icon={MapPin}
          title="No dump sites found"
          description={
            search || status || siteType
              ? "Try adjusting your search or filters."
              : "No dump sites have been added yet."
          }
        />
      )}

      <AdminPagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
