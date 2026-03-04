"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Settings,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-stone-900 text-white">
      <div className="flex h-14 items-center gap-2 border-b border-stone-700 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
          <MapPin className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold">WasteMap</span>
        <span className="ml-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {sidebarLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive(link.href)
                ? "bg-emerald-600 text-white"
                : "text-stone-400 hover:bg-stone-800 hover:text-white"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-stone-700 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-400 transition-colors hover:bg-stone-800 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to App
        </Link>
      </div>
    </aside>
  );
}
