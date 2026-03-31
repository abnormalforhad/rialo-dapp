"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { EscrowAccount } from "@/types/escrow";
import { EscrowStatus, STATUS_LABELS } from "@/types/escrow";
import { formatTokenAmount, shortenAddress } from "@/lib/rialo";
import { CountdownTimer } from "./countdown-timer";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Send,
  Ban,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EscrowCardProps {
  escrow: EscrowAccount;
  index?: number;
}

const STATUS_ICON: Record<EscrowStatus, React.ReactNode> = {
  [EscrowStatus.Funded]: <Clock className="h-4 w-4" />,
  [EscrowStatus.WorkSubmitted]: <Send className="h-4 w-4" />,
  [EscrowStatus.Judging]: <Loader2 className="h-4 w-4 animate-spin" />,
  [EscrowStatus.Approved]: <CheckCircle2 className="h-4 w-4" />,
  [EscrowStatus.Rejected]: <XCircle className="h-4 w-4" />,
  [EscrowStatus.Released]: <CheckCircle2 className="h-4 w-4" />,
  [EscrowStatus.Refunded]: <AlertTriangle className="h-4 w-4" />,
  [EscrowStatus.Expired]: <Ban className="h-4 w-4" />,
  [EscrowStatus.Cancelled]: <Ban className="h-4 w-4" />,
};

const STATUS_BADGE_CLASS: Record<EscrowStatus, string> = {
  [EscrowStatus.Funded]:
    "bg-blue-500/15 text-blue-400 border-blue-500/25",
  [EscrowStatus.WorkSubmitted]:
    "bg-amber-500/15 text-amber-400 border-amber-500/25",
  [EscrowStatus.Judging]:
    "bg-purple-500/15 text-purple-400 border-purple-500/25",
  [EscrowStatus.Approved]:
    "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  [EscrowStatus.Rejected]:
    "bg-red-500/15 text-red-400 border-red-500/25",
  [EscrowStatus.Released]:
    "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  [EscrowStatus.Refunded]:
    "bg-orange-500/15 text-orange-400 border-orange-500/25",
  [EscrowStatus.Expired]:
    "bg-zinc-500/15 text-zinc-600 border-zinc-500/25",
  [EscrowStatus.Cancelled]:
    "bg-zinc-500/15 text-zinc-600 border-zinc-500/25",
};

export function EscrowCard({ escrow, index = 0 }: EscrowCardProps) {
  const isActive = [
    EscrowStatus.Funded,
    EscrowStatus.WorkSubmitted,
    EscrowStatus.Judging,
  ].includes(escrow.status);

  const isJudging = escrow.status === EscrowStatus.Judging;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
    >
      <Link href={`/dashboard/tasks/${escrow.id}`}>
        <div
          className={cn(
            "group relative overflow-hidden rounded-2xl border glass backdrop-blur-sm p-5 transition-all duration-300 hover:translate-y-[-2px]",
            isActive
              ? "border-indigo-500/20 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10"
              : "border-zinc-200/60 shadow-sm backdrop-blur-md hover:border-zinc-200/60 hover:shadow-lg hover:shadow-white/5",
            isJudging && "border-purple-500/30"
          )}
        >
          {/* Glow effect for active */}
          {isActive && (
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          )}
          {isJudging && (
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent animate-pulse" />
          )}

          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate pr-4 group-hover:text-indigo-300 transition-colors">
                {escrow.promptText}
              </p>
              <p className="text-xs text-zinc-600 font-mono mt-1">
                {escrow.id}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 text-[11px] font-medium border px-2 py-0.5 gap-1",
                STATUS_BADGE_CLASS[escrow.status]
              )}
            >
              {STATUS_ICON[escrow.status]}
              {STATUS_LABELS[escrow.status]}
            </Badge>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div>
              <p className="text-[11px] text-zinc-600 mb-0.5">Amount</p>
              <div className="flex items-center gap-1">
                <Coins className="h-3 w-3 text-indigo-400" />
                <p className="text-sm font-semibold text-zinc-900">
                  {formatTokenAmount(escrow.amount, escrow.token)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[11px] text-zinc-600 mb-0.5">Performer</p>
              <p className="text-sm font-mono text-zinc-600">
                {shortenAddress(escrow.performer, 6)}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-zinc-600 mb-0.5">Deadline</p>
              {isActive ? (
                <CountdownTimer
                  deadline={escrow.deadline}
                  compact
                />
              ) : (
                <p className="text-sm text-zinc-600">—</p>
              )}
            </div>
          </div>

          {/* Footer arrow */}
          <div className="flex items-center justify-end mt-3 pt-3 border-t border-zinc-200/60 shadow-sm backdrop-blur-md">
            <span className="text-xs text-zinc-600 group-hover:text-indigo-400 transition-colors flex items-center gap-1">
              View details
              <ArrowRight className="h-3 w-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
