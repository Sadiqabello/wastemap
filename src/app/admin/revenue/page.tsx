import { getRevenueStats, getRevenueHistory } from "@/lib/queries/carbon";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, TrendingUp, Percent, CreditCard } from "lucide-react";
import type { RevenueStats, PlatformRevenue } from "@/types";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 20;

const SOURCE_FILTER_OPTIONS = [
  { value: "redemption_fee", label: "Redemption Fee" },
  { value: "collector_commission", label: "Collector Commission" },
  { value: "recycling_commission", label: "Recycling Commission" },
  { value: "premium_subscription", label: "Premium Subscription" },
  { value: "sponsorship", label: "Sponsorship" },
];

const sourceLabels: Record<string, string> = {
  redemption_fee: "Redemption Fee",
  collector_commission: "Collector Commission",
  recycling_commission: "Recycling Commission",
  premium_subscription: "Premium Subscription",
  subscription: "Premium Subscription",
  sponsorship: "Sponsorship",
  recycling_share: "Recycling Share",
};

const sourceColors: Record<string, string> = {
  redemption_fee: "bg-blue-100 text-blue-700",
  collector_commission: "bg-emerald-100 text-emerald-700",
  recycling_commission: "bg-teal-100 text-teal-700",
  premium_subscription: "bg-amber-100 text-amber-700",
  subscription: "bg-amber-100 text-amber-700",
  sponsorship: "bg-purple-100 text-purple-700",
  recycling_share: "bg-orange-100 text-orange-700",
};

interface PageProps {
  searchParams: Promise<{ source?: string; page?: string }>;
}

export default async function AdminRevenuePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const source = params.source || undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const [rawStats, { transactions: rawTransactions, total }] = await Promise.all([
    getRevenueStats(),
    getRevenueHistory(page, ITEMS_PER_PAGE, source),
  ]);

  const stats = rawStats as RevenueStats;
  const transactions = rawTransactions as PlatformRevenue[];
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Revenue Dashboard"
        description="Platform revenue from all streams"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          title="Total Revenue"
          value={`₦${stats.total_revenue.toLocaleString()}`}
          icon={Banknote}
        />
        <AdminStatCard
          title="This Month"
          value={`₦${stats.revenue_this_month.toLocaleString()}`}
          icon={TrendingUp}
          trend={`₦${stats.revenue_this_week.toLocaleString()} this week`}
        />
        <AdminStatCard
          title="From Fees"
          value={`₦${stats.fee_revenue.toLocaleString()}`}
          icon={Percent}
        />
        <AdminStatCard
          title="From Commissions"
          value={`₦${stats.commission_revenue.toLocaleString()}`}
          icon={CreditCard}
        />
      </div>

      {/* Revenue breakdown */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <h3 className="font-semibold mb-3">Revenue by Stream</h3>
          <div className="space-y-2">
            {[
              { label: "Redemption Fees", value: stats.fee_revenue },
              { label: "Collector Commissions", value: stats.commission_revenue },
              { label: "Premium Subscriptions", value: stats.subscription_revenue },
              { label: "Sponsorships", value: stats.sponsorship_revenue },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-stone-600">{item.label}</span>
                <span className="font-medium">
                  ₦{item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">
          Transactions ({total})
        </h2>
        <AdminFilterBar
          filters={[
            {
              paramName: "source",
              label: "Source",
              options: SOURCE_FILTER_OPTIONS,
            },
          ]}
        />
      </div>

      {transactions.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-stone-50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-stone-600">Source</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-stone-600">Description</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-medium text-stone-600">Amount</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-stone-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map((record) => (
                <tr key={record.id} className="hover:bg-stone-50/50">
                  <td className="px-4 py-3">
                    <Badge
                      className={`text-[10px] ${
                        sourceColors[record.source] || ""
                      }`}
                    >
                      {sourceLabels[record.source] || record.source}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {record.description}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600 tabular-nums">
                    +₦{record.amount_naira.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    {new Date(record.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <AdminEmptyState
          icon={Banknote}
          title="No transactions found"
          description={
            source
              ? "Try adjusting your filter."
              : "No revenue recorded yet."
          }
        />
      )}

      <AdminPagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
