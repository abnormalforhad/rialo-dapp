"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useWallet } from "@/hooks/use-wallet";
import { createTask } from "@/lib/escrow";
import { DEFAULT_JUDGE_ENDPOINT } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Zap,
  Clock,
  User,
  FileText,
  Coins,
  Gavel,
  CheckCircle2,
} from "lucide-react";

const DEADLINE_OPTIONS = [
  { value: "1800", label: "30 Minutes" },
  { value: "3600", label: "1 Hour" },
  { value: "7200", label: "2 Hours" },
  { value: "14400", label: "4 Hours" },
  { value: "43200", label: "12 Hours" },
  { value: "86400", label: "1 Day" },
  { value: "259200", label: "3 Days" },
  { value: "604800", label: "7 Days" },
];

export function TaskCreationForm() {
  const router = useRouter();
  const { wallet, isConnected, connect } = useWallet();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    promptText: "",
    performer: "",
    amount: "",
    deadlineSeconds: "7200",
    judgeEndpoint: DEFAULT_JUDGE_ENDPOINT,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;

    setLoading(true);
    try {
      const task = await createTask(wallet.publicKey, {
        promptText: form.promptText,
        performer: form.performer,
        amount: parseFloat(form.amount),
        deadlineSeconds: parseInt(form.deadlineSeconds),
        judgeEndpoint: form.judgeEndpoint,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/tasks/${task.id}`);
      }, 1500);
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Task Created Successfully!
        </h3>
        <p className="text-sm text-zinc-400">
          Escrow funded. Redirecting to task details...
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prompt */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-200">
          <FileText className="h-4 w-4 text-indigo-400" />
          Task Prompt
        </label>
        <Textarea
          placeholder="Describe the work you need done in detail. This will be used by the Judge AI to evaluate the submission..."
          value={form.promptText}
          onChange={(e) => setForm({ ...form, promptText: e.target.value })}
          required
          rows={4}
          className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 resize-none"
        />
        <p className="text-xs text-zinc-600">
          Be specific — the Judge AI evaluates work against these exact requirements.
        </p>
      </div>

      {/* Performer + Amount row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <User className="h-4 w-4 text-indigo-400" />
            Performer Address
          </label>
          <Input
            placeholder="Agent public key..."
            value={form.performer}
            onChange={(e) => setForm({ ...form, performer: e.target.value })}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 font-mono text-sm focus:border-indigo-500/50"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <Coins className="h-4 w-4 text-indigo-400" />
            Amount (RIALO)
          </label>
          <Input
            type="number"
            step="0.001"
            min="0.001"
            placeholder="5.0"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Deadline + Judge row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <Clock className="h-4 w-4 text-indigo-400" />
            Deadline
          </label>
          <Select
            value={form.deadlineSeconds}
            onValueChange={(v) => v && setForm({ ...form, deadlineSeconds: v })}
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-indigo-500/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#141420] border-white/10">
              {DEADLINE_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-zinc-200 focus:bg-indigo-500/20 focus:text-white"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-zinc-600">
            Rialo native timer auto-refunds if deadline passes.
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <Gavel className="h-4 w-4 text-indigo-400" />
            Judge AI Endpoint
          </label>
          <Input
            placeholder="/api/judge"
            value={form.judgeEndpoint}
            onChange={(e) =>
              setForm({ ...form, judgeEndpoint: e.target.value })
            }
            className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 font-mono text-sm focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Summary Box */}
      {form.amount && form.performer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-xl bg-indigo-500/5 border border-indigo-500/15 p-4"
        >
          <h4 className="text-xs font-semibold text-indigo-400 mb-2">
            TRANSACTION SUMMARY
          </h4>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Escrow Amount</span>
              <span className="text-white font-medium">
                {form.amount} RIALO
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Performer</span>
              <span className="text-zinc-300 font-mono text-xs">
                {form.performer.slice(0, 12)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Deadline</span>
              <span className="text-zinc-300">
                {DEADLINE_OPTIONS.find(
                  (o) => o.value === form.deadlineSeconds
                )?.label}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Submit */}
      {isConnected ? (
        <Button
          type="submit"
          disabled={loading || !form.promptText || !form.performer || !form.amount}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all h-12 text-base font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Escrow...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-5 w-5" />
              Fund Task & Create Escrow
            </>
          )}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={connect}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 h-12 text-base font-semibold"
        >
          Connect Wallet to Continue
        </Button>
      )}
    </form>
  );
}
