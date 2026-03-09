import { getCarbonStats, getCarbonTracking } from "@/lib/queries/carbon";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminCarbonActions } from "@/components/admin/admin-carbon-actions";
import { Badge } from "@/components/ui/badge";
import { Leaf, Weight, FileCheck, Award } from "lucide-react";
import { CARBON_CREDIT_PRICE_USD } from "@/lib/constants";
import type { CarbonStats } from "@/types";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 20;

const STATUS_FILTER_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "certified", label: "Certified" },
];

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminCarbonPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status || undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const [rawStats, { records, total }] = await Promise.all([
    getCarbonStats(),
    getCarbonTracking(page, ITEMS_PER_PAGE, status),
  ]);

  const stats = rawStats as CarbonStats;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const tonnesCO2 = stats.total_co2_avoided_kg / 1000;
  const potentialRevenue = Math.round(tonnesCO2 * CARBON_CREDIT_PRICE_USD);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Carbon Impact"
        description="Track environmental impact and carbon credit potential"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          title="Reports Tracked"
          value={stats.tracked_reports}
          icon={FileCheck}
        />
        <AdminStatCard
          title="Waste Diverted"
          value={`${Math.round(stats.total_weight_kg).toLocaleString()} kg`}
          icon={Weight}
        />
        <AdminStatCard
          title="CO2 Avoided"
          value={`${Math.round(stats.total_co2_avoided_kg).toLocaleString()} kg`}
          icon={Leaf}
          trend={`${stats.verified_co2_kg.toLocaleString()} kg verified`}
        />
        <AdminStatCard
          title="Credit Potential"
          value={`$${potentialRevenue.toLocaleString()}`}
          icon={Award}
          trend={`${tonnesCO2.toFixed(1)} tonnes @ $${CARBON_CREDIT_PRICE_USD}/t`}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">
          Tracking Records ({total})
        </h2>
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

      {records.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-stone-50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-stone-600">Report</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-stone-600">Waste Type</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-medium text-stone-600">Weight (kg)</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-medium text-stone-600">CO2 Avoided (kg)</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-stone-600">Status</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-stone-600">Date</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-medium text-stone-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map((record: Record<string, unknown>) => (
                <tr key={record.id as string} className="hover:bg-stone-50/50">
                  <td className="px-4 py-3 font-medium">
                    {(record.reports as { title: string })?.title || "Report"}
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {record.waste_type as string}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {(record.estimated_weight_kg as number)?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {(record.co2_avoided_kg as number)?.toFixed(1)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        record.verification_status === "certified"
                          ? "default"
                          : record.verification_status === "verified"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-[10px]"
                    >
                      {record.verification_status as string}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    {new Date(record.created_at as string).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AdminCarbonActions recordId={record.id as string} currentStatus={record.verification_status as string} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <AdminEmptyState
          icon={Leaf}
          title="No tracking records found"
          description={
            status
              ? "Try adjusting your filter."
              : "No carbon tracking data yet. Add data when resolving reports."
          }
        />
      )}

      <AdminPagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
