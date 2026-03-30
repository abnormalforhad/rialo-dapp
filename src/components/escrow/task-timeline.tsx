"use client";

import { motion } from "framer-motion";
import type { EscrowAccount } from "@/types/escrow";
import { EscrowStatus, STATUS_LABELS } from "@/types/escrow";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  Clock,
  Send,
  Gavel,
  Coins,
  AlertTriangle,
} from "lucide-react";

interface TaskTimelineProps {
  escrow: EscrowAccount;
}

interface TimelineStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  status: "completed" | "active" | "pending" | "failed";
}

function getTimelineSteps(escrow: EscrowAccount): TimelineStep[] {
  const s = escrow.status;

  const steps: TimelineStep[] = [
    {
      id: "funded",
      label: "Task Funded",
      description: `${(escrow.amount / 1e9).toFixed(2)} RIALO locked in escrow`,
      icon: <Coins className="h-4 w-4" />,
      status: "completed",
    },
    {
      id: "work",
      label: "Work Submitted",
      description: escrow.workSubmissionUri
        ? `URI: ${escrow.workSubmissionUri.slice(0, 30)}...`
        : "Awaiting performer submission",
      icon: <Send className="h-4 w-4" />,
      status:
        s === EscrowStatus.Funded
          ? "active"
          : s === EscrowStatus.Expired || s === EscrowStatus.Cancelled
            ? "failed"
            : "completed",
    },
    {
      id: "judging",
      label: "Judge AI Evaluation",
      description:
        s === EscrowStatus.Judging
          ? "A2A request sent — Judge AI processing..."
          : escrow.judgeVerdict !== null
            ? escrow.judgeVerdict
              ? "Verdict: APPROVED"
              : "Verdict: REJECTED"
            : "Pending evaluation via A2A protocol",
      icon: <Gavel className="h-4 w-4" />,
      status:
        s === EscrowStatus.Judging
          ? "active"
          : [
                EscrowStatus.Approved,
                EscrowStatus.Rejected,
                EscrowStatus.Released,
                EscrowStatus.Refunded,
              ].includes(s)
            ? escrow.judgeVerdict === false
              ? "failed"
              : "completed"
            : "pending",
    },
    {
      id: "settlement",
      label: "Settlement",
      description:
        s === EscrowStatus.Released
          ? "Funds released to performer"
          : s === EscrowStatus.Refunded
            ? "Funds refunded to employer"
            : s === EscrowStatus.Expired
              ? "Deadline expired — auto-refunded"
              : "Awaiting verdict for settlement",
      icon:
        s === EscrowStatus.Released ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : s === EscrowStatus.Refunded || s === EscrowStatus.Expired ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <Clock className="h-4 w-4" />
        ),
      status: [EscrowStatus.Released].includes(s)
        ? "completed"
        : [EscrowStatus.Refunded, EscrowStatus.Expired].includes(s)
          ? "failed"
          : [EscrowStatus.Approved].includes(s)
            ? "active"
            : "pending",
    },
  ];

  return steps;
}

const stepColors = {
  completed: {
    line: "bg-emerald-500",
    dot: "bg-emerald-500 shadow-emerald-500/50",
    text: "text-emerald-400",
    desc: "text-zinc-400",
  },
  active: {
    line: "bg-indigo-500/30",
    dot: "bg-indigo-500 shadow-indigo-500/50",
    text: "text-white",
    desc: "text-indigo-300",
  },
  pending: {
    line: "bg-zinc-700",
    dot: "bg-zinc-700",
    text: "text-zinc-500",
    desc: "text-zinc-600",
  },
  failed: {
    line: "bg-red-500/50",
    dot: "bg-red-500 shadow-red-500/50",
    text: "text-red-400",
    desc: "text-red-400/70",
  },
};

export function TaskTimeline({ escrow }: TaskTimelineProps) {
  const steps = getTimelineSteps(escrow);

  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const colors = stepColors[step.status];
        const isLast = i === steps.length - 1;

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15, duration: 0.3 }}
            className="flex gap-4"
          >
            {/* Timeline track */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full shadow-lg transition-all",
                  colors.dot,
                  step.status === "active" && "ring-4 ring-indigo-500/20"
                )}
              >
                {step.status === "active" ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : step.status === "completed" ? (
                  <CheckCircle2 className="h-4 w-4 text-white" />
                ) : step.status === "failed" ? (
                  <XCircle className="h-4 w-4 text-white" />
                ) : (
                  <Circle className="h-4 w-4 text-zinc-500" />
                )}
              </div>
              {!isLast && (
                <div className={cn("w-0.5 flex-1 min-h-[3rem]", colors.line)} />
              )}
            </div>

            {/* Content */}
            <div className={cn("pb-8", isLast && "pb-0")}>
              <p className={cn("text-sm font-semibold", colors.text)}>
                {step.label}
              </p>
              <p className={cn("text-xs mt-0.5", colors.desc)}>
                {step.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
