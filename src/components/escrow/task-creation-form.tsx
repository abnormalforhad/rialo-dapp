"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useWallet } from "@/hooks/use-wallet";
import { createTask } from "@/lib/escrow";
import { DEFAULT_JUDGE_ENDPOINT, SEPOLIA_CHAIN_ID } from "@/lib/constants";
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
  Gavel,
  Wallet,
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
  const { address, isConnected, sendTransaction, connect, chainId, switchChain, balance } = useWallet();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    promptText: "",
    performer: "",
    amount: "",
    token: "ETH",
    deadlineSeconds: "7200",
    judgeEndpoint: DEFAULT_JUDGE_ENDPOINT,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Validate performer address
    if (!/^0x[a-fA-F0-9]{40}$/.test(form.performer)) {
      toast.error("Invalid Address", {
        description: "Please enter a valid Ethereum address (0x...) for the AI Performer Agent.",
      });
      return;
    }

    setLoading(true);
    try {
      // Enforce Sepolia testnet
      if (chainId !== SEPOLIA_CHAIN_ID && switchChain) {
        try {
          await switchChain({ chainId: SEPOLIA_CHAIN_ID });
        } catch (switchError) {
          console.error("Network switch declined or failed", switchError);
          toast.error("Network Switch Required", {
            description: "Please authorize switching to the Sepolia test network.",
          });
          setLoading(false);
          return;
        }
      }

      // Create the task with real ETH transaction
      const txSender = async (args: { to: `0x${string}`; value: bigint }) => {
        const hash = await sendTransaction(args);
        return hash;
      };

      const task = await createTask(address, {
        promptText: form.promptText,
        performer: form.performer,
        amount: parseFloat(form.amount),
        token: "ETH",
        deadlineSeconds: parseInt(form.deadlineSeconds),
        judgeEndpoint: form.judgeEndpoint,
      }, txSender);

      setSuccess(true);
      toast.success("Escrow Funded Successfully!", {
        description: `Task ${task.id} created. Redirecting...`,
        duration: 3000,
      });
      setTimeout(() => {
        router.push(`/dashboard/tasks/${task.id}`);
      }, 2000);
    } catch (err: unknown) {
      console.error("Failed to create task:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error("Deployment Failed", {
        description: errorMessage || "Check console for details",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20"
        >
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </motion.div>
        <h3 className="text-2xl font-bold text-zinc-900 mb-2">
          Escrow Funded Successfully
        </h3>
        <p className="text-base text-zinc-600">
          Transaction sent to Sepolia. Redirecting to task dashboard...
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Prompt */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
          <FileText className="h-4 w-4 text-indigo-500" />
          Task Prompt
        </label>
        <Textarea
          placeholder="Describe the exact task requirements. Be precise, as the AI Judge will use this prompt to evaluate the output automatically..."
          value={form.promptText}
          onChange={(e) => setForm({ ...form, promptText: e.target.value })}
          required
          rows={5}
          className="bg-white/60 border-zinc-200/60 shadow-sm backdrop-blur-md text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500/50 focus:ring-indigo-500/20 resize-none rounded-xl text-base p-4"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performer */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <User className="h-4 w-4 text-indigo-500" />
            AI Performer Agent Address
          </label>
          <Input
            placeholder="0x..."
            value={form.performer}
            onChange={(e) => setForm({ ...form, performer: e.target.value })}
            required
            className="bg-white/60 border-zinc-200/60 shadow-sm backdrop-blur-md text-zinc-900 placeholder:text-zinc-400 font-mono text-sm focus:border-indigo-500/50 rounded-xl h-12"
          />
        </div>

        {/* Amount */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <Wallet className="h-4 w-4 text-indigo-500" />
            Funding Amount (ETH)
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.0001"
              min="0.0001"
              placeholder="e.g. 0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              className="bg-white/60 border-zinc-200/60 shadow-sm backdrop-blur-md text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500/50 rounded-xl h-12 w-full"
            />
            <div className="flex items-center gap-2 px-4 h-12 bg-white/60 border border-zinc-200/60 rounded-xl text-zinc-700 font-bold text-sm">
              💎 ETH
            </div>
          </div>
          {isConnected && (
            <p className="text-xs text-zinc-500 mt-1">
              Available: <span className="font-semibold text-zinc-700 tabular-nums">
                {balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </span> ETH
            </p>
          )}
        </div>
      </div>

      {/* Deadline & Judge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <Clock className="h-4 w-4 text-indigo-500" />
            Deadline
          </label>
          <Select
            value={form.deadlineSeconds}
            onValueChange={(v) => v && setForm({ ...form, deadlineSeconds: v })}
          >
            <SelectTrigger className="bg-white/60 border-zinc-200/60 shadow-sm backdrop-blur-md text-zinc-900 focus:border-indigo-500/50 rounded-xl h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 rounded-xl">
              {DEADLINE_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-zinc-200 focus:bg-zinc-800 focus:text-white cursor-pointer"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <Gavel className="h-4 w-4 text-indigo-500" />
            Judge AI RPC Endpoint
          </label>
          <Input
            placeholder="/api/judge"
            value={form.judgeEndpoint}
            onChange={(e) =>
              setForm({ ...form, judgeEndpoint: e.target.value })
            }
            className="bg-white/60 border-zinc-200/60 shadow-sm backdrop-blur-md text-zinc-900 placeholder:text-zinc-400 font-mono text-sm focus:border-indigo-500/50 rounded-xl h-12"
          />
        </div>
      </div>

      {/* Summary Box */}
      <AnimatePresence>
        {form.amount && form.performer && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 32 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="rounded-2xl bg-cyan-500/5 border border-cyan-500/10 p-5 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold tracking-wider text-indigo-500 uppercase">
                Transaction Preview
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-zinc-600 bg-white/60 px-2 py-1 rounded border border-zinc-200/60 shadow-sm backdrop-blur-md">
                <Zap className="w-3 h-3 text-indigo-400" /> Sepolia Testnet
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-zinc-200/60">
                <span className="text-zinc-600">Locking Amount</span>
                <span className="text-zinc-900 font-semibold text-lg flex items-center gap-1">
                  {form.amount} <span className="text-indigo-500 text-sm font-bold">ETH</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-200/60">
                <span className="text-zinc-600">Agent Address</span>
                <span className="text-zinc-600 font-mono text-xs">
                  {form.performer.slice(0, 16)}...
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-600">Expiration</span>
                <span className="text-zinc-900 font-medium">
                  {DEADLINE_OPTIONS.find((o) => o.value === form.deadlineSeconds)?.label}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button */}
      {isConnected ? (
        <Button
          type="submit"
          disabled={loading || !form.promptText || !form.performer || !form.amount}
          className="w-full btn-minimal h-14 rounded-sm"
        >
          <span className="relative flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            {loading ? "Sending Transaction..." : "DEPLOY ESCROW"}
          </span>
        </Button>
      ) : (
        <Button
          type="button"
          onClick={connect}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 h-14 text-lg font-bold rounded-xl transition-all"
        >
          <Wallet className="mr-2 h-5 w-5 text-cyan-400" />
          Connect Wallet to Fund Task
        </Button>
      )}
    </form>
  );
}
