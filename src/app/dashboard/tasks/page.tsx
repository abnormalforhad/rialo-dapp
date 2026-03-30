"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useEscrow } from "@/hooks/use-escrow";
import { EscrowCard } from "@/components/escrow/escrow-card";
import { EscrowStatus } from "@/types/escrow";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListChecks, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "judging", label: "Judging" },
  { value: "completed", label: "Completed" },
  { value: "expired", label: "Expired" },
];

const FILTER_STATUSES: Record<string, EscrowStatus[]> = {
  all: Object.values(EscrowStatus),
  active: [EscrowStatus.Funded, EscrowStatus.WorkSubmitted],
  judging: [EscrowStatus.Judging],
  completed: [EscrowStatus.Approved, EscrowStatus.Released],
  expired: [EscrowStatus.Expired, EscrowStatus.Refunded, EscrowStatus.Rejected, EscrowStatus.Cancelled],
};

export default function TasksPage() {
  const { escrows } = useEscrow();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredEscrows = escrows.filter((e) => {
    const matchesFilter = FILTER_STATUSES[filter]?.includes(e.status) ?? true;
    const matchesSearch =
      !search ||
      e.promptText.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.performer.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-indigo-400" />
            Agent Tasks
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            {escrows.length} total tasks · {filteredEscrows.length} shown
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
          <TabsList className="bg-white/60 border border-zinc-200/60 shadow-sm backdrop-blur-md h-9">
            {FILTER_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 text-zinc-600"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/60 border-zinc-200/60 shadow-sm backdrop-blur-md text-zinc-900 placeholder:text-zinc-400 h-9 text-sm"
          />
        </div>
      </motion.div>

      {/* Task list */}
      {filteredEscrows.length > 0 ? (
        <div className="space-y-3">
          {filteredEscrows.map((escrow, i) => (
            <EscrowCard key={escrow.id} escrow={escrow} index={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-zinc-200/60 shadow-sm backdrop-blur-md bg-white/60 p-12 text-center"
        >
          <SlidersHorizontal className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-600 mb-1">No tasks found</p>
          <p className="text-xs text-zinc-600">
            {search ? "Try adjusting your search" : "No tasks match this filter"}
          </p>
        </motion.div>
      )}
    </div>
  );
}
