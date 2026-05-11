import Link from "next/link";
import {
  FileText,
  Camera,
  ThumbsUp,
  CheckCircle2,
  CalendarPlus,
  CalendarCheck,
  Users,
  ArrowRight,
} from "lucide-react";

interface HowToEarnProps {
  pointValues: Record<string, number>;
}

const EARN_ACTIONS: Array<{
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  body: string;
  pointsKey: string;
  href: string;
  color: string;
}> = [
  {
    icon: FileText,
    title: "Report waste",
    body: "Each verified report",
    pointsKey: "report_created",
    href: "/reports/new",
    color: "#22c55e",
  },
  {
    icon: Camera,
    title: "Add photos",
    body: "Bonus for photo evidence",
    pointsKey: "photos_uploaded",
    href: "/reports/new",
    color: "#0ea5e9",
  },
  {
    icon: ThumbsUp,
    title: "Upvote reports",
    body: "Support community reports",
    pointsKey: "upvoted_report",
    href: "/",
    color: "#f97316",
  },
  {
    icon: CheckCircle2,
    title: "Your report resolved",
    body: "When authorities clean it up",
    pointsKey: "report_resolved",
    href: "/dashboard",
    color: "#a855f7",
  },
  {
    icon: CalendarPlus,
    title: "Organize a cleanup",
    body: "Host an event",
    pointsKey: "event_created",
    href: "/events/new",
    color: "#eab308",
  },
  {
    icon: CalendarCheck,
    title: "Attend an event",
    body: "Show up + check in",
    pointsKey: "event_attended",
    href: "/events",
    color: "#10b981",
  },
  {
    icon: Users,
    title: "Refer a friend",
    body: "When your friend signs up",
    pointsKey: "referral_signup",
    href: "/referrals",
    color: "#3b82f6",
  },
];

export function HowToEarn({ pointValues }: HowToEarnProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="text-base font-bold text-stone-900">How to earn</h2>
          <p className="text-xs text-stone-500">Every action moves you up</p>
        </div>
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-emerald-600 hover:underline"
        >
          See activity →
        </Link>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {EARN_ACTIONS.map(({ icon: Icon, title, body, pointsKey, href, color }) => {
          const pts = pointValues[pointsKey] ?? 0;
          return (
            <Link
              key={pointsKey}
              href={href}
              className="group flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 transition-all hover:border-stone-300 hover:bg-stone-50"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-stone-900">
                  {title}
                </p>
                <p className="truncate text-xs text-stone-500">{body}</p>
              </div>
              <div
                className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold"
                style={{ backgroundColor: `${color}20`, color }}
              >
                +{pts}
              </div>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-stone-500" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
