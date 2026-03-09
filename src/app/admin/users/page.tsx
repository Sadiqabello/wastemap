export const dynamic = "force-dynamic";

import { getAllUsers, getUserRoleCounts } from "@/lib/queries/admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { RoleBadge } from "@/components/admin/role-badge";
import { ChangeRoleDialog } from "@/components/admin/change-role-dialog";
import { AdjustPointsDialog } from "@/components/admin/adjust-points-dialog";
import { AdminUserEditDelete } from "@/components/admin/admin-user-actions";
import { AddUserDialog } from "@/components/admin/add-user-dialog";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearch } from "@/components/admin/admin-search";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { TierBadge } from "@/components/tier/tier-badge";
import { Users, ShieldCheck, Building2, UserCheck, UserX } from "lucide-react";
import type { UserTier } from "@/types";

const PAGE_SIZE = 20;

const ROLE_FILTER_OPTIONS = [
  { value: "reporter", label: "Reporter" },
  { value: "authority", label: "Authority" },
  { value: "admin", label: "Admin" },
];

const TIER_FILTER_OPTIONS = [
  { value: "green_starter", label: "Green Starter" },
  { value: "eco_warrior", label: "Eco Warrior" },
  { value: "clean_champion", label: "Clean Champion" },
  { value: "waste_hero", label: "Waste Hero" },
];

interface UsersPageProps {
  searchParams: Promise<{
    q?: string;
    role?: string;
    tier?: string;
    page?: string;
  }>;
}

export default async function AdminUsersPage({
  searchParams,
}: UsersPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const search = params.q ?? "";
  const roleFilter = params.role ?? "all";
  const tierFilter = params.tier ?? "all";

  const [{ users, total }, roleCounts] = await Promise.all([
    getAllUsers(page, PAGE_SIZE, search || undefined, roleFilter, tierFilter),
    getUserRoleCounts(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const statCards = [
    {
      label: "Total Users",
      value: roleCounts.total,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Admins",
      value: roleCounts.admins,
      icon: ShieldCheck,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Authorities",
      value: roleCounts.authorities,
      icon: Building2,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Reporters",
      value: roleCounts.reporters,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="User Management"
        description={`${total} user${total !== 1 ? "s" : ""} found`}
      >
        <AddUserDialog />
      </AdminPageHeader>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}
                >
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminSearch placeholder="Search by name..." paramName="q" />
        <AdminFilterBar
          filters={[
            {
              paramName: "role",
              label: "Roles",
              options: ROLE_FILTER_OPTIONS,
            },
            {
              paramName: "tier",
              label: "Tiers",
              options: TIER_FILTER_OPTIONS,
            },
          ]}
        />
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <AdminEmptyState
          icon={UserX}
          title="No users found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    User
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Tier
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Points
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Reports
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const initials = user.full_name
                    ? user.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "?";

                  return (
                    <tr
                      key={user.id}
                      className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {user.avatar_url && (
                              <AvatarImage
                                src={user.avatar_url}
                                alt={user.full_name}
                              />
                            )}
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {user.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3">
                        <TierBadge tier={user.tier as UserTier} />
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">
                        {user.points.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {user.report_count}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <ChangeRoleDialog
                            userId={user.id}
                            currentRole={user.role}
                            userName={user.full_name}
                          />
                          <AdjustPointsDialog
                            userId={user.id}
                            userName={user.full_name}
                            currentPoints={user.points}
                          />
                          <AdminUserEditDelete
                            userId={user.id}
                            userName={user.full_name}
                            email={user.email || ""}
                            phoneNumber={user.phone_number ?? undefined}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      <AdminPagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
