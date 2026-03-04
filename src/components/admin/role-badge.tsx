import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const roleColors: Record<string, string> = {
  admin: "bg-red-50 text-red-700 border-red-200",
  authority: "bg-blue-50 text-blue-700 border-blue-200",
  reporter: "bg-stone-50 text-stone-700 border-stone-200",
};

export function RoleBadge({ role }: { role: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("text-xs capitalize", roleColors[role] ?? "")}
    >
      {role}
    </Badge>
  );
}
