"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getEscrow } from "@/lib/escrow";
import { formatTokenAmount, formatKelvins } from "@/lib/rialo";
import { subscribeToEvents } from "@/lib/escrow";
import type { EscrowAccount } from "@/types/escrow";
import { EscrowStatus, STATUS_LABELS } from "@/types/escrow";
import { TaskTimeline } from "@/components/escrow/task-timeline";
import { CountdownTimer } from "@/components/escrow/countdown-timer";
import { JudgeVerdict } from "@/components/agent/judge-verdict";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Coins,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Hash,
  User,
  Globe,
  Clock,
  Gavel,
  Zap,
} from "lucide-react";

const InfoRow = ({
  icon: Icon,
  label,
  value,
  mono,
  copyable,
  copiedField,
  onCopy,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
  copiedField?: string | null;
  onCopy?: (text: string, field: string) => void;
}) => (
  <div className="flex items-start gap-3 py-3">
    <Icon className="h-4 w-4 text-zinc-600 mt-0.5 shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-zinc-600 font-medium uppercase tracking-wider">
        {label}
      </p>
      <p
        className={`text-sm text-zinc-900 mt-0.5 break-all ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </p>
    </div>
    {copyable && onCopy && (
      <button
        onClick={() => onCopy(value, label)}
        className="text-zinc-600 hover:text-zinc-600 transition-colors shrink-0"
      >
        {copiedField === label ? (
          <Check className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    )}
  </div>
);

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [escrow, setEscrow] = useState<EscrowAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getEscrow(id).then((data) => {
      setEscrow(data);
      setLoading(false);
    });

    const unsub = subscribeToEvents((event) => {
      if (event.escrowId === id) {
        getEscrow(id).then(setEscrow);
      }
    });
    return unsub;
  }, [id]);

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-white/60" />
        <Skeleton className="h-32 w-full bg-white/60 rounded-2xl" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 bg-white/60 rounded-2xl" />
          <Skeleton className="h-64 bg-white/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-600">Task not found</p>
        <Button
          variant="outline"
          className="mt-4 border-zinc-200/60 shadow-sm backdrop-blur-md text-zinc-600"
          onClick={() => router.push("/dashboard/tasks")}
        >
          Back to Tasks
        </Button>
      </div>
    );
  }

  const isActive = [
    EscrowStatus.Funded,
    EscrowStatus.WorkSubmitted,
    EscrowStatus.Judging,
  ].includes(escrow.status);

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => router.push("/dashboard/tasks")}
          className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">{escrow.id}</h1>
            <p className="text-sm text-zinc-600 mt-0.5 max-w-lg truncate">
              {escrow.promptText}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`text-xs px-3 py-1 ${
              isActive
                ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/25"
                : escrow.status === EscrowStatus.Released
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                  : "bg-zinc-500/15 text-zinc-600 border-zinc-500/25"
            }`}
          >
            {STATUS_LABELS[escrow.status]}
          </Badge>
        </div>
      </motion.div>

      {/* Amount + Timer Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-zinc-200/60 shadow-sm backdrop-blur-md bg-gradient-to-r from-indigo-500/5 to-purple-500/5 p-6"
      >
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/20">
              <Coins className="h-7 w-7 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-600 font-medium">Escrow Amount</p>
              <p className="text-2xl font-bold text-zinc-900">
                {formatTokenAmount(escrow.amount, escrow.token)}
              </p>
              <p className="text-[11px] text-zinc-600 font-mono">
                {escrow.amount.toLocaleString()} Kelvins
              </p>
            </div>
          </div>
          <CountdownTimer deadline={escrow.deadline} />
        </div>
      </motion.div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-3 space-y-6"
        >
          {/* Prompt */}
          <div className="rounded-2xl border border-zinc-200/60 shadow-sm backdrop-blur-md glass p-5">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-indigo-400" />
              Task Prompt
            </h3>
            <div className="rounded-xl bg-zinc-100/50 p-4 border border-zinc-200/60 shadow-sm backdrop-blur-md">
              <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">
                {escrow.promptText}
              </p>
            </div>
          </div>

          {/* Judge Verdict */}
          <div>
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2 mb-3">
              <Gavel className="h-4 w-4 text-purple-400" />
              Judge AI Verdict
            </h3>
            <JudgeVerdict escrow={escrow} />
          </div>

          {/* Details */}
          <div className="rounded-2xl border border-zinc-200/60 shadow-sm backdrop-blur-md glass p-5">
            <h3 className="text-sm font-bold text-zinc-900 mb-1">
              Escrow Details
            </h3>
            <div className="divide-y divide-zinc-200">
              <InfoRow icon={Hash} label="PDA" value={escrow.pda} mono copyable copiedField={copiedField} onCopy={copy} />
              <InfoRow icon={User} label="Employer" value={escrow.employer} mono copyable copiedField={copiedField} onCopy={copy} />
              <InfoRow icon={User} label="Performer" value={escrow.performer} mono copyable copiedField={copiedField} onCopy={copy} />
              <InfoRow icon={Globe} label="Judge Endpoint" value={escrow.judgeEndpoint} />
              <InfoRow icon={Hash} label="Prompt Hash" value={escrow.promptHash} mono copyable copiedField={copiedField} onCopy={copy} />
              {escrow.workSubmissionUri && (
                <InfoRow icon={ExternalLink} label="Work URI" value={escrow.workSubmissionUri} mono copyable copiedField={copiedField} onCopy={copy} />
              )}
              <InfoRow
                icon={Clock}
                label="Created"
                value={new Date(escrow.createdAt * 1000).toLocaleString()}
              />
            </div>
          </div>
        </motion.div>

        {/* Right: Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="rounded-2xl border border-zinc-200/60 shadow-sm backdrop-blur-md glass p-5 sticky top-24">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2 mb-5">
              <Zap className="h-4 w-4 text-amber-400" />
              Task Progress
            </h3>
            <TaskTimeline escrow={escrow} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
