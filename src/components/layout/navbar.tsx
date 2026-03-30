"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { WalletConnect } from "@/components/wallet/wallet-connect";
import {
  Bot,
  LayoutDashboard,
  Menu,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";

export function Navbar() {
  const pathname = usePathname();
  const { toggleSidebar } = useAppStore();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a12]/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-3">
          {isDashboard && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-zinc-400 hover:text-white"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              <Zap className="h-5 w-5 text-white" />
              <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold tracking-tight text-white">
                Rialo
              </span>
              <span className="text-base font-light text-indigo-400">
                Agent
              </span>
            </div>
          </Link>

          {!isDashboard && (
            <div className="hidden md:flex items-center gap-1 ml-6">
              {[
                { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
                { href: "/dashboard/agents", label: "Agents", icon: Bot },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    pathname === href
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right: Wallet */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-emerald-400">
              DevNet
            </span>
          </div>
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}
