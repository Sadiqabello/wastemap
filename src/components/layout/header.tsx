"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Plus, User, LogOut, Trophy, Star, Shield, Gift, Users, Target, Award, Crown, Truck, Lightbulb, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Map" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/events", label: "Events" },
  { href: "/rewards", label: "Rewards" },
  { href: "/collectors", label: "Collectors" },
  { href: "/dump-sites", label: "Dump Sites" },
  { href: "/challenges", label: "Challenges" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function Header() {
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-stone-900">WasteMapNaija</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              )}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link href="/reports/new">
              <Button size="sm" className="ml-1 bg-emerald-600 hover:bg-emerald-700">
                <Plus className="mr-1 h-4 w-4" />
                Report
              </Button>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-stone-200" />
          ) : user ? (
            <div className="flex items-center gap-2">
              {profile && (
                <Link href="/leaderboard">
                  <div className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors md:flex">
                    <Star className="h-3 w-3" />
                    {profile.points} pts
                  </div>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      {profile?.avatar_url && (
                        <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                      )}
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    {profile && (
                      <p className="mt-0.5 text-xs text-emerald-600">
                        {profile.points} green points
                      </p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/rewards" className="cursor-pointer">
                      <Gift className="mr-2 h-4 w-4" />
                      Rewards
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/referrals" className="cursor-pointer">
                      <Users className="mr-2 h-4 w-4" />
                      Referrals
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/challenges" className="cursor-pointer">
                      <Target className="mr-2 h-4 w-4" />
                      Challenges
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/achievements" className="cursor-pointer">
                      <Award className="mr-2 h-4 w-4" />
                      Achievements
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/collectors" className="cursor-pointer">
                      <Truck className="mr-2 h-4 w-4" />
                      Collectors
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dump-sites" className="cursor-pointer">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Dump Sites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/tips" className="cursor-pointer">
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Eco Tips
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/premium" className="cursor-pointer">
                      <Crown className="mr-2 h-4 w-4" />
                      Premium
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/leaderboard" className="cursor-pointer">
                      <Trophy className="mr-2 h-4 w-4" />
                      Leaderboard
                    </Link>
                  </DropdownMenuItem>
                  {profile?.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
