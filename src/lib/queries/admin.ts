import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AdminStats,
  ProfileWithEmail,
  AdminReportEntry,
  AdminEventEntry,
} from "@/types";

const PAGE_SIZE = 20;

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const [
    { count: totalUsers },
    { count: totalReports },
    { count: totalEvents },
    { count: pendingReports },
    { count: resolvedReports },
    { count: newUsersWeek },
    { count: newUsersMonth },
    { count: reportsWeek },
    { count: reportsMonth },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("reports").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .neq("status", "resolved"),
    supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("status", "resolved"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString()),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", monthAgo.toISOString()),
    supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString()),
    supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .gte("created_at", monthAgo.toISOString()),
  ]);

  return {
    total_users: totalUsers ?? 0,
    total_reports: totalReports ?? 0,
    total_events: totalEvents ?? 0,
    pending_reports: pendingReports ?? 0,
    resolved_reports: resolvedReports ?? 0,
    new_users_this_week: newUsersWeek ?? 0,
    new_users_this_month: newUsersMonth ?? 0,
    reports_this_week: reportsWeek ?? 0,
    reports_this_month: reportsMonth ?? 0,
  };
}

export async function getAdminUserGrowth(): Promise<
  { date: string; count: number }[]
> {
  const supabase = await createClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("Error fetching user growth:", error);
    return [];
  }

  const dateMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    dateMap[key] = 0;
  }

  data.forEach((profile) => {
    const d = new Date(profile.created_at);
    const key = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (key in dateMap) {
      dateMap[key]++;
    }
  });

  return Object.entries(dateMap).map(([date, count]) => ({ date, count }));
}

export async function getRecentActivity(): Promise<
  {
    id: string;
    type: "status_update" | "new_user";
    description: string;
    created_at: string;
  }[]
> {
  const supabase = await createClient();

  // Fetch recent status updates
  const { data: updates } = await supabase
    .from("status_updates")
    .select("id, new_status, created_at, profiles!status_updates_changed_by_fkey(full_name), reports!status_updates_report_id_fkey(title)")
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch recent signups
  const { data: newUsers } = await supabase
    .from("profiles")
    .select("id, full_name, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const activities: {
    id: string;
    type: "status_update" | "new_user";
    description: string;
    created_at: string;
  }[] = [];

  if (updates) {
    for (const u of updates) {
      const profile = u.profiles as unknown as { full_name: string } | null;
      const report = u.reports as unknown as { title: string } | null;
      activities.push({
        id: u.id,
        type: "status_update",
        description: `${profile?.full_name ?? "Someone"} changed "${report?.title ?? "a report"}" to ${u.new_status.replace("_", " ")}`,
        created_at: u.created_at,
      });
    }
  }

  if (newUsers) {
    for (const u of newUsers) {
      activities.push({
        id: `user-${u.id}`,
        type: "new_user",
        description: `${u.full_name} joined WasteMap`,
        created_at: u.created_at,
      });
    }
  }

  return activities
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 10);
}

export async function getAllUsers(
  page: number = 1,
  search?: string,
  roleFilter?: string
): Promise<{ users: ProfileWithEmail[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("*, reports!reports_user_id_fkey(count)", { count: "exact" });

  if (roleFilter && roleFilter !== "all") {
    query = query.eq(
      "role",
      roleFilter as "reporter" | "authority" | "admin"
    );
  }

  if (search) {
    query = query.ilike("full_name", `%${search}%`);
  }

  query = query
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data: profiles, count, error } = await query;

  if (error || !profiles) {
    console.error("Error fetching users:", error);
    return { users: [], total: 0 };
  }

  // Fetch emails from auth.users via service role client
  let emailMap: Record<string, string> = {};
  try {
    const adminClient = createAdminClient();
    // Fetch emails for only the users on this page
    const userIds = profiles.map((p) => p.id);
    const results = await Promise.all(
      userIds.map((id) => adminClient.auth.admin.getUserById(id))
    );
    for (const result of results) {
      if (result.data?.user) {
        emailMap[result.data.user.id] = result.data.user.email ?? "";
      }
    }
  } catch (err) {
    console.error("Failed to fetch auth users:", err);
  }

  const users: ProfileWithEmail[] = profiles.map((p) => {
    const reportCount = (p.reports as unknown as { count: number }[])?.[0]
      ?.count ?? 0;
    return {
      ...p,
      reports: undefined as never,
      email: emailMap[p.id] ?? "",
      report_count: reportCount,
    };
  });

  return { users, total: count ?? 0 };
}

export async function getAllReportsAdmin(
  page: number = 1,
  search?: string,
  statusFilter?: string,
  categoryFilter?: string
): Promise<{ reports: AdminReportEntry[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("reports")
    .select("*, profiles!reports_user_id_fkey(full_name, avatar_url)", { count: "exact" });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq(
      "status",
      statusFilter as "reported" | "acknowledged" | "cleanup_scheduled" | "in_progress" | "resolved"
    );
  }

  if (categoryFilter && categoryFilter !== "all") {
    query = query.eq(
      "category",
      categoryFilter as "household" | "industrial" | "hazardous" | "electronic" | "construction" | "medical" | "organic" | "other"
    );
  }

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  query = query
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data, count, error } = await query;

  if (error || !data) {
    console.error("Error fetching admin reports:", error);
    return { reports: [], total: 0 };
  }

  return {
    reports: data as unknown as AdminReportEntry[],
    total: count ?? 0,
  };
}

export async function getAllEventsAdmin(
  page: number = 1,
  statusFilter?: string
): Promise<{ events: AdminEventEntry[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select("*, profiles!events_organizer_id_fkey(full_name, avatar_url), event_attendees(count)", {
      count: "exact",
    });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq(
      "status",
      statusFilter as "upcoming" | "in_progress" | "completed" | "cancelled"
    );
  }

  query = query
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data, count, error } = await query;

  if (error || !data) {
    console.error("Error fetching admin events:", error);
    return { events: [], total: 0 };
  }

  const events: AdminEventEntry[] = data.map((e) => {
    const attendeeCount =
      (e.event_attendees as unknown as { count: number }[])?.[0]?.count ?? 0;
    return {
      ...e,
      event_attendees: undefined as never,
      attendee_count: attendeeCount,
    } as unknown as AdminEventEntry;
  });

  return { events, total: count ?? 0 };
}
