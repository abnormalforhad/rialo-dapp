"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getEscrow, submitWork } from "@/lib/escrow";
import { sendToJudge, parseJudgeVerdict } from "@/lib/a2a";
import { formatTokenAmount, shortenAddress } from "@/lib/eth-utils";
import { useWallet } from "@/hooks/use-wallet";
import type { EscrowAccount } from "@/types/escrow";
import { EscrowStatus, STATUS_LABELS } from "@/types/escrow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Coins,
  Send,
  Loader2,
  CheckCircle2,
  ExternalLink,
  FileText,
  AlertTriangle,
} from "lucide-react";

export default function SubmitWorkPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { isConnected, address, connect } = useWallet();

  const [escrow, setEscrow] = useState<EscrowAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [judging, setJudging] = useState(false);
  const [workUri, setWorkUri] = useState("");
  const [verdict, setVerdict] = useState<{ passed: boolean; reasoning: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    getEscrow(id).then((data) => {
      setEscrow(data);
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!workUri.trim()) {
      toast.error("Please provide a work submission URI");
      return;
    }

    if (!escrow) return;

    setSubmitting(true);
    try {
      // Step 1: Submit the work
      const updated = await submitWork(escrow.id, address, workUri);
      setEscrow(updated);
      toast.success("Work submitted successfully!", {
        description: "Triggering Judge AI evaluation...",
      });

      // Step 2: Trigger Judge AI evaluation
      setJudging(true);
      setSubmitting(false);

      try {
        const judgeResponse = await sendToJudge(
          escrow.judgeEndpoint,
          escrow.id,
          escrow.promptHash,
          workUri,
          escrow.promptText
        );

        const parsedVerdict = parseJudgeVerdict(judgeResponse);

        if (parsedVerdict) {
          setVerdict({
            passed: parsedVerdict.verdict,
            reasoning: parsedVerdict.reasoning,
          });

          if (parsedVerdict.verdict) {
            toast.success("🎉 Work Approved!", {
              description: `Confidence: ${Math.round(parsedVerdict.confidence * 100)}% — Funds will be released to performer.`,
              duration: 8000,
            });
          } else {
            toast.error("Work Rejected", {
              description: parsedVerdict.reasoning.slice(0, 100),
              duration: 8000,
            });
          }
        } else {
          toast.info("Judge AI returned no verdict — please check manually.");
        }
      } catch (judgeErr) {
        console.error("Judge AI error:", judgeErr);
        toast.error("Judge AI evaluation failed", {
          description: "You can retry the evaluation from the task detail page.",
        });
      }
    } catch (err: unknown) {
      console.error("Submit work error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Failed to submit work: " + msg);
    } finally {
      setSubmitting(false);
      setJudging(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        <Skeleton className="h-8 w-48 bg-white/60" />
        <Skeleton className="h-48 w-full bg-white/60 rounded-2xl" />
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
        <p className="text-zinc-600 mb-4">Task not found</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/tasks")}>
          Back to Tasks
        </Button>
      </div>
    );
  }

  const canSubmit = escrow.status === EscrowStatus.Funded;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      {/* Back */}
      <button
        onClick={() => router.push(`/dashboard/tasks/${escrow.id}`)}
        className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Task
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900">Submit Work</h1>
          <Badge
            variant="outline"
            className={`text-xs ${
              canSubmit
                ? "bg-blue-500/15 text-blue-500 border-blue-500/25"
                : "bg-zinc-500/15 text-zinc-500 border-zinc-500/25"
            }`}
          >
            {STATUS_LABELS[escrow.status]}
          </Badge>
        </div>
        <p className="text-sm text-zinc-500 max-w-lg">
          Submit your completed work for evaluation by the Judge AI.
        </p>
      </motion.div>

      {/* Task Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-zinc-200/60 bg-white/60 backdrop-blur-md p-6 shadow-sm"
      >
        <h3 className="text-xs font-bold tracking-wider text-zinc-400 uppercase mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Task Details
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-zinc-100">
            <span className="text-sm text-zinc-500">Escrow Amount</span>
            <span className="text-sm font-bold text-zinc-900 flex items-center gap-1">
              <Coins className="h-3.5 w-3.5 text-indigo-400" />
              {formatTokenAmount(escrow.amount, escrow.token)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-zinc-100">
            <span className="text-sm text-zinc-500">Employer</span>
            <span className="text-sm font-mono text-zinc-600">{shortenAddress(escrow.employer)}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-zinc-500">Performer</span>
            <span className="text-sm font-mono text-zinc-600">{shortenAddress(escrow.performer)}</span>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-zinc-50 border border-zinc-100 p-4">
          <p className="text-xs font-bold text-zinc-400 uppercase mb-2">Task Prompt</p>
          <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
            {escrow.promptText}
          </p>
        </div>
      </motion.div>

      {/* Verdict Display */}
      {verdict && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-2xl border p-6 ${
            verdict.passed
              ? "border-emerald-500/25 bg-emerald-500/5"
              : "border-red-500/25 bg-red-500/5"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {verdict.passed ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-red-500" />
            )}
            <div>
              <h3 className="text-lg font-bold text-zinc-900">
                {verdict.passed ? "Work Approved! 🎉" : "Work Rejected"}
              </h3>
              <p className="text-sm text-zinc-600">
                {verdict.passed
                  ? "Funds will be released to the performer."
                  : "The employer will be refunded."}
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-black/5 p-4">
            <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Judge Reasoning</p>
            <p className="text-sm text-zinc-700 leading-relaxed">{verdict.reasoning}</p>
          </div>
          <Button
            className="mt-4 btn-minimal rounded-sm"
            onClick={() => router.push(`/dashboard/tasks/${escrow.id}`)}
          >
            View Full Task Details
          </Button>
        </motion.div>
      )}

      {/* Submit Form */}
      {canSubmit && !verdict && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000" />
            <div className="relative rounded-2xl border border-zinc-200/60 bg-white/80 backdrop-blur-md p-6 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <ExternalLink className="h-4 w-4 text-indigo-500" />
                    Work Submission URI
                  </label>
                  <Input
                    placeholder="https://github.com/..., ipfs://..., or any URL to your completed work"
                    value={workUri}
                    onChange={(e) => setWorkUri(e.target.value)}
                    required
                    disabled={submitting || judging}
                    className="bg-white/60 border-zinc-200/60 text-zinc-900 placeholder:text-zinc-400 font-mono text-sm rounded-xl h-12"
                  />
                  <p className="text-xs text-zinc-400">
                    Provide a URL where the Judge AI can access and evaluate your completed work.
                  </p>
                </div>

                {judging && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                    <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Judge AI Evaluating...</p>
                      <p className="text-xs text-purple-500/70">A2A request in progress — this may take a few seconds</p>
                    </div>
                  </div>
                )}

                {isConnected ? (
                  <Button
                    type="submit"
                    disabled={submitting || judging || !workUri.trim()}
                    className="w-full btn-minimal h-14 rounded-sm"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      {submitting ? "SUBMITTING..." : judging ? "EVALUATING..." : "SUBMIT WORK & TRIGGER JUDGE"}
                    </span>
                  </Button>
                ) : (
                  <Button type="button" onClick={connect} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white h-14 text-lg font-bold rounded-xl">
                    Connect Wallet to Submit
                  </Button>
                )}
              </form>
            </div>
          </div>
        </motion.div>
      )}

      {/* Already submitted */}
      {!canSubmit && !verdict && (
        <div className="rounded-2xl border border-zinc-200/60 bg-white/60 backdrop-blur-md p-8 text-center shadow-sm">
          <p className="text-sm text-zinc-500">
            {escrow.status === EscrowStatus.WorkSubmitted
              ? "Work has already been submitted. Awaiting judge evaluation."
              : `This task is in "${STATUS_LABELS[escrow.status]}" state and cannot accept work submissions.`}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push(`/dashboard/tasks/${escrow.id}`)}
          >
            View Task Details
          </Button>
        </div>
      )}
    </div>
  );
}
