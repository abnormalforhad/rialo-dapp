"use client";

import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-8">{children}</div>
      </div>
    </div>
  );
}
