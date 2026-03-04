import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
} from "lucide-react";
import type { DashboardStats } from "@/types";

const statConfig = [
  {
    key: "total_reports" as const,
    label: "Total Reports",
    icon: FileText,
    color: "text-stone-700",
    bg: "bg-stone-100",
  },
  {
    key: "pending_reports" as const,
    label: "Pending",
    icon: AlertCircle,
    color: "text-red-700",
    bg: "bg-red-100",
  },
  {
    key: "in_progress_reports" as const,
    label: "In Progress",
    icon: Clock,
    color: "text-blue-700",
    bg: "bg-blue-100",
  },
  {
    key: "resolved_reports" as const,
    label: "Resolved",
    icon: CheckCircle2,
    color: "text-emerald-700",
    bg: "bg-emerald-100",
  },
  {
    key: "reports_this_week" as const,
    label: "This Week",
    icon: TrendingUp,
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
  {
    key: "reports_this_month" as const,
    label: "This Month",
    icon: Calendar,
    color: "text-purple-700",
    bg: "bg-purple-100",
  },
];

interface StatsGridProps {
  stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {statConfig.map(({ key, label, icon: Icon, color, bg }) => (
        <Card key={key}>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className={`rounded-lg ${bg} p-2.5`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats[key]}</p>
              <p className="text-xs text-stone-500">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
