import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import type { ReportStatus } from "@/types";

interface StatusBadgeProps {
  status: ReportStatus;
  size?: "sm" | "default";
}

export function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  return (
    <Badge
      className={`${size === "sm" ? "text-xs px-1.5 py-0" : ""} text-white border-0`}
      style={{ backgroundColor: STATUS_COLORS[status] }}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
