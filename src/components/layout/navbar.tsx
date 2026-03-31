"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { WalletConnect } from "@/components/wallet/wallet-connect";
import {
  Bot,
  LayoutDashboard,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";

export function Navbar() {
  const pathname = usePathname();
  const { toggleSidebar } = useAppStore();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200/60 shadow-sm backdrop-blur-md glass backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-3">
          {isDashboard && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-zinc-600 hover:text-zinc-900"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#1A1A1A] flex items-center justify-center rounded-sm transition-transform group-hover:rotate-12">
              <span className="text-[#EBE6D9] font-bold text-xs">R</span>
            </div>
            <span className="text-xl font-medium tracking-tight text-[#1A1A1A]">
              Rialo<span className="font-serif italic">Agent</span>
            </span>
          </Link>

          {!isDashboard && (
            <div className="hidden md:flex items-center gap-8 ml-12">
              {[
                { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
                { href: "/dashboard/agents", label: "Agents", icon: Bot },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "text-[0.7rem] uppercase tracking-widest font-bold transition-colors",
                    pathname === href
                      ? "text-[#1A1A1A]"
                      : "text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
                  )}
                >
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
