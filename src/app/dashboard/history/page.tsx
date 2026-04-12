"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getEscrows } from "@/lib/escrow";
import { formatTokenAmount, shortenAddress, getExplorerTxUrl } from "@/lib/eth-utils";
import type { EscrowAccount } from "@/types/escrow";
import { EscrowStatus, STATUS_LABELS } from "@/types/escrow";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  Clock,
  Coins,
  ExternalLink,
  History,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function HistoryPage() {
  const [escrows, setEscrows] = useState<EscrowAccount[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getEscrows().then(setEscrows);
  }, []);

  const filtered = escrows.filter(
    (e) =>
      !search ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.employer.toLowerCase().includes(search.toLowerCase()) ||
      e.performer.toLowerCase().includes(search.toLowerCase()) ||
      e.promptText.toLowerCase().includes(search.toLowerCase()) ||
      (e.txHash && e.txHash.toLowerCase().includes(search.toLowerCase()))
  );

  // Quick stats
  const totalVolume = escrows.reduce((sum, e) => sum + BigInt(e.amount), 0n);
  const withTx = escrows.filter((e) => e.txHash).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          <History className="h-6 w-6 text-indigo-400" />
          Transaction History
        </h1>
        <p className="text-sm text-zinc-600 mt-1">
          {escrows.length} transactions · {withTx} on-chain · {formatTokenAmount(totalVolume.toString())} total volume
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative max-w-md"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search by ID, address, or tx hash..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white/60 border-zinc-200/60 text-zinc-900 placeholder:text-zinc-400 h-10"
        />
      </motion.div>

      {/* Transaction Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-zinc-200/60 bg-white/60 backdrop-blur-md overflow-hidden shadow-sm"
      >
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-zinc-50/80 border-b border-zinc-200/60 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          <div className="col-span-3">Task</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Parties</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1 text-right">Tx</div>
        </div>

        {/* Rows */}
        {filtered.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {filtered.map((escrow, i) => (
              <motion.div
                key={escrow.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  href={`/dashboard/tasks/${escrow.id}`}
                  className="grid grid-cols-12 gap-3 px-5 py-4 hover:bg-zinc-50/50 transition-colors items-center group"
                >
                  <div className="col-span-3 min-w-0">
                    <p className="text-sm text-zinc-900 truncate group-hover:text-indigo-500 transition-colors">
                      {escrow.promptText.slice(0, 40)}...
                    </p>
                    <p className="text-[10px] font-mono text-zinc-400 mt-0.5">{escrow.id}</p>
                  </div>

                  <div className="col-span-2 flex items-center gap-1">
                    <Coins className="h-3 w-3 text-indigo-400" />
                    <span className="text-sm font-semibold text-zinc-900 tabular-nums">
                      {formatTokenAmount(escrow.amount, escrow.token)}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        [EscrowStatus.Funded, EscrowStatus.WorkSubmitted, EscrowStatus.Judging].includes(escrow.status)
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                          : escrow.status === EscrowStatus.Released || escrow.status === EscrowStatus.Approved
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                      }`}
                    >
                      {STATUS_LABELS[escrow.status]}
                    </Badge>
                  </div>

                  <div className="col-span-2 text-xs font-mono text-zinc-500 space-y-0.5">
                    <div>E: {shortenAddress(escrow.employer, 3)}</div>
                    <div>P: {shortenAddress(escrow.performer, 3)}</div>
                  </div>

                  <div className="col-span-2 flex items-center gap-1 text-xs text-zinc-400">
                    <Clock className="h-3 w-3" />
                    {new Date(escrow.createdAt * 1000).toLocaleDateString()}
                  </div>

                  <div className="col-span-1 text-right">
                    {escrow.txHash ? (
                      <a
                        href={getExplorerTxUrl(escrow.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-zinc-300">—</span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <History className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">
              {search ? "No transactions match your search" : "No transactions yet"}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
