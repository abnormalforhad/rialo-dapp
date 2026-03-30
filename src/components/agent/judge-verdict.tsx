"use client";

import { motion } from "framer-motion";
import type { EscrowAccount } from "@/types/escrow";
import { EscrowStatus } from "@/types/escrow";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Gavel,
  Brain,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JudgeVerdictProps {
  escrow: EscrowAccount;
}

export function JudgeVerdict({ escrow }: JudgeVerdictProps) {
  const isJudging = escrow.status === EscrowStatus.Judging;
  const hasVerdict = escrow.judgeVerdict !== null;
  const isPending = [
    EscrowStatus.Funded,
    EscrowStatus.WorkSubmitted,
  ].includes(escrow.status);

  if (isPending) {
    return (
      <div className="rounded-xl border border-zinc-200/60 shadow-sm backdrop-blur-md bg-white/60 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-500/10">
            <Gavel className="h-5 w-5 text-zinc-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-600">
              Judge AI Pending
            </p>
            <p className="text-xs text-zinc-600">
              Verdict will be requested when work is submitted
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isJudging) {
    return (
      <div className="rounded-xl border border-purple-500/25 bg-purple-500/5 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
            <Brain className="h-5 w-5 text-purple-400" />
            <div className="absolute inset-0 rounded-xl border border-purple-500/30 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              Judge AI Evaluating
            </p>
            <p className="text-xs text-purple-300">
              A2A request in progress...
            </p>
          </div>
          <Loader2 className="ml-auto h-5 w-5 text-purple-400 animate-spin" />
        </div>

        {/* Animated progress */}
        <div className="space-y-2">
          {["Parsing work submission", "Analyzing requirements", "Comparing against prompt", "Generating verdict"].map(
            (step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.8, duration: 0.3 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.8 + 0.5, duration: 0.2 }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400/60" />
                </motion.div>
                <span className="text-xs text-purple-300/70">{step}</span>
              </motion.div>
            )
          )}
        </div>
      </div>
    );
  }

  if (hasVerdict) {
    const passed = escrow.judgeVerdict === true;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "rounded-xl border p-5",
          passed
            ? "border-emerald-500/25 bg-emerald-500/5"
            : "border-red-500/25 bg-red-500/5"
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              passed ? "bg-emerald-500/20" : "bg-red-500/20"
            )}
          >
            {passed ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-zinc-900">
                Verdict: {passed ? "APPROVED" : "REJECTED"}
              </p>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px]",
                  passed
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                    : "bg-red-500/15 text-red-400 border-red-500/25"
                )}
              >
                {passed ? "PASS" : "FAIL"}
              </Badge>
            </div>
            <p className="text-xs text-zinc-600 flex items-center gap-1 mt-0.5">
              <Shield className="h-3 w-3" />
              Verified via A2A Protocol
            </p>
          </div>
        </div>

        {escrow.judgeReasoning && (
          <div className="rounded-lg bg-black/20 p-3">
            <p className="text-[11px] font-semibold text-zinc-600 mb-1">
              REASONING
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed">
              {escrow.judgeReasoning}
            </p>
          </div>
        )}
      </motion.div>
    );
  }

  return null;
}
