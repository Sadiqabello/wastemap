import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getNotifications } from "@/lib/queries/notifications";
import { NotificationList } from "@/components/notifications/notification-list";
import { Bell } from "lucide-react";


export const metadata: Metadata = {
  title: "Notifications",
  description:
    "View your notifications for points earned, report updates, event RSVPs, collector bids, and achievements on WasteMapNaija.",
  robots: { index: false, follow: false },
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/notifications");
  }

  const { notifications, total } = await getNotifications(100);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-stone-700" />
          <h1 className="text-2xl font-bold text-stone-900">Notifications</h1>
        </div>
        <p className="mt-1 text-sm text-stone-500">
          {total} notification{total !== 1 ? "s" : ""}
        </p>
      </div>

      <NotificationList notifications={notifications} />
    </div>
  );
}
