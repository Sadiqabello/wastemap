import { Skeleton } from "@/components/ui/skeleton";

export default function AdminEventsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-32" />
      </div>
      <Skeleton className="h-9 w-96" />
      <Skeleton className="h-[500px] rounded-lg" />
    </div>
  );
}
