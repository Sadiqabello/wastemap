"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  FileText,
  ThumbsUp,
  Calendar,
  Trophy,
  Target,
  Truck,
  Shield,
  Gift,
  Users,
  Bell,
  CheckCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/lib/actions/notifications";
import { cn } from "@/lib/utils";
import type { NotificationRow } from "@/types/database";

const TYPE_CONFIG: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  points_earned: { icon: Star, color: "text-yellow-500" },
  report_status_changed: { icon: FileText, color: "text-blue-500" },
  report_upvoted: { icon: ThumbsUp, color: "text-emerald-500" },
  event_completed: { icon: Calendar, color: "text-purple-500" },
  event_rsvp: { icon: Calendar, color: "text-blue-500" },
  event_live: { icon: Calendar, color: "text-red-500" },
  bid_received: { icon: Truck, color: "text-orange-500" },
  bid_accepted: { icon: Truck, color: "text-emerald-500" },
  bid_completed: { icon: Truck, color: "text-emerald-600" },
  achievement_unlocked: { icon: Trophy, color: "text-yellow-500" },
  challenge_completed: { icon: Target, color: "text-purple-500" },
  referral_milestone: { icon: Users, color: "text-blue-500" },
  redemption_update: { icon: Gift, color: "text-pink-500" },
  collector_status: { icon: Truck, color: "text-stone-500" },
  admin_adjustment: { icon: Shield, color: "text-red-500" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

interface NotificationListProps {
  notifications: NotificationRow[];
}

export function NotificationList({ notifications }: NotificationListProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllAsRead();
      router.refresh();
    });
  }

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markAsRead(id);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteNotification(id);
      router.refresh();
    });
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bell className="mb-3 h-12 w-12 text-stone-300" />
          <p className="text-sm font-medium text-stone-600">No notifications yet</p>
          <p className="mt-1 text-xs text-stone-400">
            You&apos;ll be notified when something happens
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-500">
            {unreadCount} unread
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="text-xs"
          >
            <CheckCheck className="mr-1 h-3.5 w-3.5" />
            Mark all as read
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((notification) => {
          const config = TYPE_CONFIG[notification.type] || {
            icon: Bell,
            color: "text-stone-500",
          };
          const Icon = config.icon;

          return (
            <div
              key={notification.id}
              className={cn(
                "group flex gap-3 rounded-lg border p-3 transition-colors",
                notification.read
                  ? "bg-white border-stone-200"
                  : "bg-emerald-50/50 border-emerald-200"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  notification.read ? "bg-stone-100" : "bg-white"
                )}
              >
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm",
                    notification.read
                      ? "text-stone-600"
                      : "font-medium text-stone-900"
                  )}
                >
                  {notification.title}
                </p>
                <p className="mt-0.5 text-xs text-stone-500">
                  {notification.message}
                </p>
                <p className="mt-1 text-[10px] text-stone-400">
                  {timeAgo(notification.created_at)}
                </p>
              </div>

              <div className="flex shrink-0 items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notification.read && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(notification.id)}
                    disabled={isPending}
                    className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                    title="Mark as read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(notification.id)}
                  disabled={isPending}
                  className="rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-500"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
