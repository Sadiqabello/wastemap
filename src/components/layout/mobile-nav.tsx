"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { MapPin, Plus, User, Trophy, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Map", icon: MapPin },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/reports/new", label: "Report", icon: Plus, requiresAuth: true },
  { href: "/leaderboard", label: "Ranks", icon: Trophy },
  { href: "/profile", label: "You", icon: User, requiresAuth: true },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1000] border-t bg-white md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          if (item.requiresAuth && !user) return null;

          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          const isReport = item.href === "/reports/new";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]",
                isReport
                  ? "-mt-4 text-white"
                  : isActive
                    ? "text-emerald-600"
                    : "text-stone-500 hover:text-stone-900"
              )}
            >
              {isReport ? (
                <div className="relative">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 shadow-lg">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span className={cn(isReport && "text-emerald-600 font-semibold")}>{item.label}</span>
            </Link>
          );
        })}
        {!user && (
          <Link
            href="/login"
            className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] text-stone-500 hover:text-stone-900"
          >
            <User className="h-5 w-5" />
            <span>Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
