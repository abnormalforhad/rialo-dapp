"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  LayoutDashboard,
  PlusCircle,
  ListChecks,
  Bot,
  Activity,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/create", label: "Create Task", icon: PlusCircle },
  { href: "/dashboard/tasks", label: "Active Tasks", icon: ListChecks },
  { href: "/dashboard/agents", label: "AI Agents", icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useAppStore();

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-zinc-200/60 shadow-sm backdrop-blur-md glass backdrop-blur-xl transition-transform duration-300 md:sticky md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-end p-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-600"
            onClick={toggleSidebar}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname?.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={() => {
                  if (window.innerWidth < 768) toggleSidebar();
                }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-zinc-900 shadow-sm shadow-indigo-500/10 border border-indigo-500/20"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50"
                )}
              >
                <Icon
                  className={cn(
                    "h-4.5 w-4.5",
                    isActive ? "text-indigo-400" : ""
                  )}
                />
                {label}
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-zinc-200/60 shadow-sm backdrop-blur-md p-4">
          <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/10 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-semibold text-zinc-900">
                Platform Status
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-600">Network</span>
                <span className="text-[11px] text-emerald-400 font-medium">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-600">Latency</span>
                <span className="text-[11px] text-zinc-600 font-medium">
                  42ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-600">Block</span>
                <span className="text-[11px] text-zinc-600 font-mono">
                  #1,847,293
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
