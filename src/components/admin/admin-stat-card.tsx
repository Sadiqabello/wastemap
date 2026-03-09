import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  className?: string;
}

export function AdminStatCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: AdminStatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-3xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</p>
            {trend && (
              <p className="mt-1 text-xs text-muted-foreground">{trend}</p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <Icon className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
