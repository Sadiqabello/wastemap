import { getAllSponsorsAdmin, getSponsorStats } from "@/lib/queries/sponsorships";
import { AdminSponsorCard } from "@/components/admin/admin-sponsor-card";
import { CreateSponsorForm } from "@/components/admin/create-sponsor-form";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearch } from "@/components/admin/admin-search";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { Handshake, Users, CheckCircle, Banknote, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 20;

const TIER_FILTER_OPTIONS = [
  { value: "bronze", label: "Bronze" },
  { value: "silver", label: "Silver" },
  { value: "gold", label: "Gold" },
  { value: "platinum", label: "Platinum" },
];

const ACTIVE_FILTER_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

interface PageProps {
  searchParams: Promise<{ q?: string; tier?: string; active?: string; page?: string }>;
}

export default async function AdminSponsorshipsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.q || undefined;
  const tier = params.tier || undefined;
  const active = params.active || undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const [{ sponsors, total }, stats] = await Promise.all([
    getAllSponsorsAdmin(page, ITEMS_PER_PAGE, search, tier, active),
    getSponsorStats(),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sponsorships"
        description="Manage corporate sponsorship partnerships"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          title="Total Sponsors"
          value={stats.total_sponsors}
          icon={Users}
        />
        <AdminStatCard
          title="Active"
          value={stats.active_sponsors}
          icon={CheckCircle}
        />
        <AdminStatCard
          title="Total Budget"
          value={`₦${stats.total_budget.toLocaleString()}`}
          icon={Banknote}
        />
        <AdminStatCard
          title="Budget Spent"
          value={`₦${stats.budget_spent.toLocaleString()}`}
          icon={Wallet}
        />
      </div>

      <CreateSponsorForm />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminSearch placeholder="Search by company name..." />
        <AdminFilterBar
          filters={[
            {
              paramName: "tier",
              label: "Tier",
              options: TIER_FILTER_OPTIONS,
            },
            {
              paramName: "active",
              label: "Active",
              options: ACTIVE_FILTER_OPTIONS,
            },
          ]}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          Sponsors ({total})
        </h2>
        {sponsors.length > 0 ? (
          sponsors.map((sponsor) => (
            <AdminSponsorCard key={sponsor.id} sponsor={sponsor} />
          ))
        ) : (
          <AdminEmptyState
            icon={Handshake}
            title="No sponsors found"
            description={
              search || tier || active
                ? "Try adjusting your search or filters."
                : "No sponsorships yet. Add your first sponsor above."
            }
          />
        )}
      </div>

      <AdminPagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
