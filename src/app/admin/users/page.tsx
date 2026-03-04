export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAllUsers } from "@/lib/queries/admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleBadge } from "@/components/admin/role-badge";
import { ChangeRoleDialog } from "@/components/admin/change-role-dialog";
import { AdjustPointsDialog } from "@/components/admin/adjust-points-dialog";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
  }>;
}

export default async function AdminUsersPage({
  searchParams,
}: UsersPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const search = params.search ?? "";
  const roleFilter = params.role ?? "all";

  const { users, total } = await getAllUsers(page, search || undefined, roleFilter);
  const totalPages = Math.ceil(total / 20);

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (roleFilter !== "all") p.set("role", roleFilter);
    p.set("page", String(page));
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    return `/admin/users?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          {total} user{total !== 1 ? "s" : ""} total
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <form className="relative" action="/admin/users" method="GET">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="hidden" name="role" value={roleFilter} />
          <input
            name="search"
            defaultValue={search}
            placeholder="Search users..."
            className="h-9 w-64 rounded-md border bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </form>

        <Tabs value={roleFilter} className="w-auto">
          <TabsList>
            <TabsTrigger value="all" asChild>
              <Link href={buildUrl({ role: "", page: "1" })}>All</Link>
            </TabsTrigger>
            <TabsTrigger value="reporter" asChild>
              <Link href={buildUrl({ role: "reporter", page: "1" })}>
                Reporters
              </Link>
            </TabsTrigger>
            <TabsTrigger value="authority" asChild>
              <Link href={buildUrl({ role: "authority", page: "1" })}>
                Authorities
              </Link>
            </TabsTrigger>
            <TabsTrigger value="admin" asChild>
              <Link href={buildUrl({ role: "admin", page: "1" })}>Admins</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right">Reports</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const initials = user.full_name
                  ? user.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "?";

                return (
                  <TableRow key={user.id}>
                    <TableCell>
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
                        <span className="font-medium">{user.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email || "—"}
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell className="text-right">{user.points}</TableCell>
                    <TableCell className="text-right">
                      {user.report_count}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
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
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

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
