"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = useMemo(() => createClient(), []);

  // Initial fetch — runs on mount and whenever the user changes.
  // (When the user signs out the component renders null anyway, so we don't
  // need to reset the count synchronously.)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false)
      .then(({ count }) => {
        if (!cancelled) setUnreadCount(count || 0);
      });
    return () => {
      cancelled = true;
    };
  }, [user, supabase]);

  // Realtime subscription for new notifications.
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setUnreadCount((prev) => prev + 1);

          const notification = payload.new as {
            title: string;
            message: string;
            type: string;
          };

          if (notification.type === "points_earned") {
            toast.success(notification.title, {
              description: notification.message,
              duration: 4000,
            });
          } else {
            toast(notification.title, {
              description: notification.message,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  if (!user) return null;

  return (
    <Link
      href="/notifications"
      className={cn(
        "relative flex h-8 w-8 items-center justify-center rounded-full transition-colors",
        "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
      )}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
