"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

export type ReportType =
  | "overview"
  | "reports"
  | "users"
  | "events"
  | "revenue"
  | "collectors"
  | "carbon";

export interface ReportFilters {
  type: ReportType;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  category?: string;
  severity?: string;
  tier?: string;
}

export interface GeneratedReportData {
  type: ReportType;
  title: string;
  generatedAt: string;
  dateRange: { from: string; to: string };
  summary: Record<string, number | string>;
  breakdown: { label: string; value: number; percentage?: number }[];
  tableData: Record<string, unknown>[];
  tableColumns: string[];
}

export async function generateReportData(
  filters: ReportFilters
): Promise<GeneratedReportData> {
  await requireAdmin();
  const supabase = await createClient();

  const now = new Date();
  const dateFrom = filters.dateFrom || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const dateTo = filters.dateTo || now.toISOString().split("T")[0];
  const dateFromISO = `${dateFrom}T00:00:00.000Z`;
  const dateToISO = `${dateTo}T23:59:59.999Z`;

  switch (filters.type) {
    case "overview":
      return generateOverviewReport(supabase, dateFromISO, dateToISO, dateFrom, dateTo);
    case "reports":
      return generateWasteReport(supabase, dateFromISO, dateToISO, dateFrom, dateTo, filters);
    case "users":
      return generateUsersReport(supabase, dateFromISO, dateToISO, dateFrom, dateTo, filters);
    case "events":
      return generateEventsReport(supabase, dateFromISO, dateToISO, dateFrom, dateTo, filters);
    case "revenue":
      return generateRevenueReport(supabase, dateFromISO, dateToISO, dateFrom, dateTo);
    case "collectors":
      return generateCollectorsReport(supabase, dateFromISO, dateToISO, dateFrom, dateTo);
    case "carbon":
      return generateCarbonReport(supabase, dateFromISO, dateToISO, dateFrom, dateTo);
    default:
      throw new Error(`Unknown report type: ${filters.type}`);
  }
}

async function generateOverviewReport(
  supabase: any,
  dateFrom: string,
  dateTo: string,
  from: string,
  to: string
): Promise<GeneratedReportData> {
  const [
    { count: totalUsers },
    { count: newUsers },
    { count: totalReports },
    { count: newReports },
    { count: totalEvents },
    { count: resolvedReports },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", dateFrom).lte("created_at", dateTo),
    supabase.from("reports").select("*", { count: "exact", head: true }),
    supabase.from("reports").select("*", { count: "exact", head: true }).gte("created_at", dateFrom).lte("created_at", dateTo),
    supabase.from("events").select("*", { count: "exact", head: true }).gte("created_at", dateFrom).lte("created_at", dateTo),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "resolved").gte("created_at", dateFrom).lte("created_at", dateTo),
    supabase.from("platform_revenue").select("amount_naira").gte("created_at", dateFrom).lte("created_at", dateTo),
  ]);

  const totalRevenue = revenueData?.reduce((s: number, r: any) => s + (r.amount_naira ?? 0), 0) ?? 0;

  // Status breakdown for the period
  const { data: statusData } = await supabase
    .from("reports")
    .select("status")
    .gte("created_at", dateFrom)
    .lte("created_at", dateTo);

  const statusCounts: Record<string, number> = {};
  (statusData || []).forEach((r: any) => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });

  const total = newReports ?? 0;
  const breakdown = Object.entries(statusCounts).map(([label, value]) => ({
    label: label.replace(/_/g, " "),
    value,
    percentage: total > 0 ? Math.round((value / total) * 100) : 0,
  }));

  return {
    type: "overview",
    title: "Platform Overview Report",
    generatedAt: new Date().toISOString(),
    dateRange: { from, to },
    summary: {
      "Total Users": totalUsers ?? 0,
      "New Users (Period)": newUsers ?? 0,
      "Total Reports": totalReports ?? 0,
      "New Reports (Period)": newReports ?? 0,
      "Events (Period)": totalEvents ?? 0,
      "Resolved (Period)": resolvedReports ?? 0,
      "Revenue (Period)": `₦${totalRevenue.toLocaleString()}`,
    },
    breakdown,
    tableData: [],
    tableColumns: [],
  };
}

async function generateWasteReport(
  supabase: any,
  dateFrom: string,
  dateTo: string,
  from: string,
  to: string,
  filters: ReportFilters
): Promise<GeneratedReportData> {
  let query = supabase
    .from("reports")
    .select("id, title, category, severity, status, address, upvote_count, created_at, profiles!reports_user_id_fkey(full_name)")
    .gte("created_at", dateFrom)
    .lte("created_at", dateTo)
    .order("created_at", { ascending: false })
    .limit(200);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.severity && filters.severity !== "all") {
    query = query.eq("severity", filters.severity);
  }

  const { data: reports } = await query;
  const rows = reports || [];

  // Category breakdown
  const catCounts: Record<string, number> = {};
  rows.forEach((r: any) => {
    const cats = Array.isArray(r.category) ? r.category : [r.category];
    cats.forEach((c: string) => {
      catCounts[c] = (catCounts[c] || 0) + 1;
    });
  });

  const total = rows.length;
  const breakdown = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
    }));

  // Severity breakdown for summary
  const sevCounts: Record<string, number> = {};
  rows.forEach((r: any) => { sevCounts[r.severity] = (sevCounts[r.severity] || 0) + 1; });

  const statusCounts: Record<string, number> = {};
  rows.forEach((r: any) => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });

  return {
    type: "reports",
    title: "Waste Reports Analysis",
    generatedAt: new Date().toISOString(),
    dateRange: { from, to },
    summary: {
      "Total Reports": total,
      ...Object.fromEntries(Object.entries(statusCounts).map(([k, v]) => [k.replace(/_/g, " "), v])),
      "Low Severity": sevCounts["low"] ?? 0,
      "Medium Severity": sevCounts["medium"] ?? 0,
      "High Severity": sevCounts["high"] ?? 0,
      "Critical Severity": sevCounts["critical"] ?? 0,
    },
    breakdown,
    tableColumns: ["Title", "Category", "Severity", "Status", "Location", "Upvotes", "Reporter", "Date"],
    tableData: rows.map((r: any) => ({
      Title: r.title?.substring(0, 40) || "Untitled",
      Category: Array.isArray(r.category) ? r.category.join(", ") : r.category,
      Severity: r.severity,
      Status: r.status?.replace(/_/g, " "),
      Location: r.address?.substring(0, 30) || "N/A",
      Upvotes: r.upvote_count ?? 0,
      Reporter: (r.profiles as any)?.full_name || "Unknown",
      Date: new Date(r.created_at).toLocaleDateString("en-NG"),
    })),
  };
}

async function generateUsersReport(
  supabase: any,
  dateFrom: string,
  dateTo: string,
  from: string,
  to: string,
  filters: ReportFilters
): Promise<GeneratedReportData> {
  let query = supabase
    .from("profiles")
    .select("id, full_name, role, tier, points, created_at")
    .gte("created_at", dateFrom)
    .lte("created_at", dateTo)
    .order("points", { ascending: false })
    .limit(200);

  if (filters.tier && filters.tier !== "all") {
    query = query.eq("tier", filters.tier);
  }

  const { data: users } = await query;
  const rows = users || [];

  const tierCounts: Record<string, number> = {};
  const roleCounts: Record<string, number> = {};
  rows.forEach((u: any) => {
    tierCounts[u.tier || "green_starter"] = (tierCounts[u.tier || "green_starter"] || 0) + 1;
    roleCounts[u.role || "reporter"] = (roleCounts[u.role || "reporter"] || 0) + 1;
  });

  const total = rows.length;
  const breakdown = Object.entries(tierCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label: label.replace(/_/g, " "),
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
    }));

  const totalPoints = rows.reduce((s: number, u: any) => s + (u.points ?? 0), 0);

  return {
    type: "users",
    title: "User Analytics Report",
    generatedAt: new Date().toISOString(),
    dateRange: { from, to },
    summary: {
      "New Users": total,
      "Total Points Earned": totalPoints.toLocaleString(),
      ...Object.fromEntries(Object.entries(roleCounts).map(([k, v]) => [`${k}s`, v])),
    },
    breakdown,
    tableColumns: ["Name", "Role", "Tier", "Points", "Joined"],
    tableData: rows.map((u: any) => ({
      Name: u.full_name,
      Role: u.role,
      Tier: u.tier?.replace(/_/g, " ") || "green starter",
      Points: u.points ?? 0,
      Joined: new Date(u.created_at).toLocaleDateString("en-NG"),
    })),
  };
}

async function generateEventsReport(
  supabase: any,
  dateFrom: string,
  dateTo: string,
  from: string,
  to: string,
  filters: ReportFilters
): Promise<GeneratedReportData> {
  let query = supabase
    .from("events")
    .select("id, title, status, date, location, max_volunteers, created_at, profiles!events_organizer_id_fkey(full_name), event_attendees(count)")
    .gte("created_at", dateFrom)
    .lte("created_at", dateTo)
    .order("date", { ascending: false })
    .limit(200);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data: events } = await query;
  const rows = events || [];

  const statusCounts: Record<string, number> = {};
  let totalAttendees = 0;
  rows.forEach((e: any) => {
    statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
    totalAttendees += (e.event_attendees as any)?.[0]?.count ?? 0;
  });

  const total = rows.length;
  const breakdown = Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label: label.replace(/_/g, " "),
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
    }));

  return {
    type: "events",
    title: "Events Summary Report",
    generatedAt: new Date().toISOString(),
    dateRange: { from, to },
    summary: {
      "Total Events": total,
      "Total RSVPs": totalAttendees,
      ...Object.fromEntries(Object.entries(statusCounts).map(([k, v]) => [k.replace(/_/g, " "), v])),
    },
    breakdown,
    tableColumns: ["Title", "Status", "Date", "Location", "RSVPs", "Max Volunteers", "Organizer"],
    tableData: rows.map((e: any) => ({
      Title: e.title?.substring(0, 35) || "Untitled",
      Status: e.status?.replace(/_/g, " "),
      Date: new Date(e.date).toLocaleDateString("en-NG"),
      Location: e.location?.substring(0, 25) || "N/A",
      RSVPs: (e.event_attendees as any)?.[0]?.count ?? 0,
      "Max Volunteers": e.max_volunteers ?? "N/A",
      Organizer: (e.profiles as any)?.full_name || "Unknown",
    })),
  };
}

async function generateRevenueReport(
  supabase: any,
  dateFrom: string,
  dateTo: string,
  from: string,
  to: string
): Promise<GeneratedReportData> {
  const { data: revenue } = await supabase
    .from("platform_revenue")
    .select("id, source, amount_naira, description, created_at")
    .gte("created_at", dateFrom)
    .lte("created_at", dateTo)
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = revenue || [];

  const sourceCounts: Record<string, number> = {};
  const sourceAmounts: Record<string, number> = {};
  rows.forEach((r: any) => {
    sourceCounts[r.source] = (sourceCounts[r.source] || 0) + 1;
    sourceAmounts[r.source] = (sourceAmounts[r.source] || 0) + (r.amount_naira ?? 0);
  });

  const totalAmount = rows.reduce((s: number, r: any) => s + (r.amount_naira ?? 0), 0);

  const breakdown = Object.entries(sourceAmounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label: label.replace(/_/g, " "),
      value,
      percentage: totalAmount > 0 ? Math.round((value / totalAmount) * 100) : 0,
    }));

  return {
    type: "revenue",
    title: "Revenue Report",
    generatedAt: new Date().toISOString(),
    dateRange: { from, to },
    summary: {
      "Total Revenue": `₦${totalAmount.toLocaleString()}`,
      "Transactions": rows.length,
      ...Object.fromEntries(Object.entries(sourceAmounts).map(([k, v]) => [`${k.replace(/_/g, " ")}`, `₦${v.toLocaleString()}`])),
    },
    breakdown,
    tableColumns: ["Source", "Amount (₦)", "Description", "Date"],
    tableData: rows.map((r: any) => ({
      Source: r.source?.replace(/_/g, " "),
      "Amount (₦)": (r.amount_naira ?? 0).toLocaleString(),
      Description: r.description?.substring(0, 40) || "N/A",
      Date: new Date(r.created_at).toLocaleDateString("en-NG"),
    })),
  };
}

async function generateCollectorsReport(
  supabase: any,
  dateFrom: string,
  dateTo: string,
  from: string,
  to: string
): Promise<GeneratedReportData> {
  const { data: collectors } = await supabase
    .from("collector_profiles")
    .select("id, business_name, status, phone, service_area, avg_rating, total_pickups, total_earnings, created_at")
    .order("total_earnings", { ascending: false })
    .limit(200);

  const rows = collectors || [];

  const statusCounts: Record<string, number> = {};
  let totalEarnings = 0;
  let totalPickups = 0;
  rows.forEach((c: any) => {
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    totalEarnings += c.total_earnings ?? 0;
    totalPickups += c.total_pickups ?? 0;
  });

  const total = rows.length;
  const breakdown = Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
    }));

  return {
    type: "collectors",
    title: "Waste Collectors Report",
    generatedAt: new Date().toISOString(),
    dateRange: { from, to },
    summary: {
      "Total Collectors": total,
      "Total Pickups": totalPickups,
      "Total Earnings": `₦${totalEarnings.toLocaleString()}`,
      ...Object.fromEntries(Object.entries(statusCounts).map(([k, v]) => [k, v])),
    },
    breakdown,
    tableColumns: ["Business Name", "Status", "Phone", "Area", "Rating", "Pickups", "Earnings (₦)"],
    tableData: rows.map((c: any) => ({
      "Business Name": c.business_name || "N/A",
      Status: c.status,
      Phone: c.phone || "N/A",
      Area: c.service_area?.substring(0, 25) || "N/A",
      Rating: c.avg_rating ? `${c.avg_rating.toFixed(1)}/5` : "N/A",
      Pickups: c.total_pickups ?? 0,
      "Earnings (₦)": (c.total_earnings ?? 0).toLocaleString(),
    })),
  };
}

async function generateCarbonReport(
  supabase: any,
  dateFrom: string,
  dateTo: string,
  from: string,
  to: string
): Promise<GeneratedReportData> {
  const { data: carbon } = await supabase
    .from("carbon_tracking")
    .select("id, waste_type, weight_kg, co2_avoided_kg, verification_status, created_at")
    .gte("created_at", dateFrom)
    .lte("created_at", dateTo)
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = carbon || [];

  const wasteCounts: Record<string, number> = {};
  let totalWeight = 0;
  let totalCO2 = 0;
  rows.forEach((c: any) => {
    wasteCounts[c.waste_type || "other"] = (wasteCounts[c.waste_type || "other"] || 0) + 1;
    totalWeight += c.weight_kg ?? 0;
    totalCO2 += c.co2_avoided_kg ?? 0;
  });

  const total = rows.length;
  const breakdown = Object.entries(wasteCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label: label.replace(/_/g, " "),
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
    }));

  return {
    type: "carbon",
    title: "Carbon Impact Report",
    generatedAt: new Date().toISOString(),
    dateRange: { from, to },
    summary: {
      "Records Tracked": total,
      "Total Waste Diverted": `${totalWeight.toFixed(1)} kg`,
      "CO₂ Avoided": `${totalCO2.toFixed(1)} kg`,
      "Carbon Credits Est.": `$${(totalCO2 * 0.025).toFixed(2)}`,
    },
    breakdown,
    tableColumns: ["Waste Type", "Weight (kg)", "CO₂ Avoided (kg)", "Status", "Date"],
    tableData: rows.map((c: any) => ({
      "Waste Type": c.waste_type?.replace(/_/g, " ") || "N/A",
      "Weight (kg)": (c.weight_kg ?? 0).toFixed(1),
      "CO₂ Avoided (kg)": (c.co2_avoided_kg ?? 0).toFixed(1),
      Status: c.verification_status || "pending",
      Date: new Date(c.created_at).toLocaleDateString("en-NG"),
    })),
  };
}
