"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEscrow } from "@/hooks/use-escrow";
import { useWallet } from "@/hooks/use-wallet";
import { getStats } from "@/lib/escrow";
import { formatEthAmount } from "@/lib/eth-utils";
import { EscrowCard } from "@/components/escrow/escrow-card";
import { EthBalance } from "@/components/wallet/kelvin-balance";
import { EscrowStatus } from "@/types/escrow";
import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Coins,
  ListChecks,
  PlusCircle,
  TrendingUp,
  Zap,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const { escrows } = useEscrow();
  const { isConnected, connect } = useWallet();
  const [stats, setStats] = useState({
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    totalLocked: "0",
    totalReleased: "0",
    successRate: 0,
  });

  useEffect(() => {
    getStats().then(setStats);
  }, [escrows]);

  const activeEscrows = escrows.filter((e) =>
    [EscrowStatus.Funded, EscrowStatus.WorkSubmitted, EscrowStatus.Judging].includes(e.status)
  );

  const recentEscrows = escrows.slice(0, 4);

  const STAT_CARDS = [
    {
      label: "Total Tasks",
      value: stats.totalTasks.toString(),
      icon: ListChecks,
      color: "from-indigo-500/20 to-indigo-500/5",
      iconColor: "text-indigo-400",
      borderColor: "border-indigo-500/15",
    },
    {
      label: "Active Escrows",
      value: stats.activeTasks.toString(),
      icon: Activity,
      color: "from-purple-500/20 to-purple-500/5",
      iconColor: "text-purple-400",
      borderColor: "border-purple-500/15",
    },
    {
      label: "Total Locked",
      value: formatEthAmount(stats.totalLocked),
      icon: Coins,
      color: "from-amber-500/20 to-amber-500/5",
      iconColor: "text-amber-400",
      borderColor: "border-amber-500/15",
    },
    {
      label: "Success Rate",
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      color: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-400",
      borderColor: "border-emerald-500/15",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-600 mt-1">
            Monitor AI agent tasks and escrow settlements on Sepolia
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isConnected && (
            <Button
              onClick={connect}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0"
            >
              <Zap className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          )}
          <Link href="/dashboard/create">
            <Button className="bg-white/60 border border-zinc-200/60 shadow-sm backdrop-blur-md text-zinc-900 hover:bg-zinc-100/50">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Wallet Balance */}
      {isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <EthBalance />
        </motion.div>
      )}

      {/* Stats Grid & Network Graph */}
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAT_CARDS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} border ${stat.borderColor} p-5 group transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-white/60 ${stat.iconColor} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-zinc-900 tabular-nums">{stat.value}</p>
              <p className="text-xs text-zinc-600 mt-0.5 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Network Health Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-emerald-500/10 bg-gradient-to-br from-emerald-500/5 to-transparent p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </div>
              <span className="text-xs font-bold text-zinc-900">Sepolia Status</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400">Live</span>
          </div>
          
          <div className="h-12 flex items-end gap-1 px-1">
            {[35, 45, 30, 50, 65, 40, 55, 75, 45, 60, 40, 50].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-emerald-400/20 rounded-t-sm transition-all hover:bg-emerald-400/40"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          
          <div className="flex justify-between items-center text-[10px] text-zinc-600 mt-2">
            <span>Chain: 11155111</span>
            <span>Protocol: A2A</span>
          </div>
        </motion.div>
      </div>

      {/* Active & Recent Sections */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              Active Escrows
            </h2>
            <Link
              href="/dashboard/tasks"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {activeEscrows.length > 0 ? (
            <div className="space-y-3">
              {activeEscrows.slice(0, 3).map((escrow, i) => (
                <EscrowCard key={escrow.id} escrow={escrow} index={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200/60 shadow-sm backdrop-blur-md bg-white/60 p-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm text-zinc-600">No active escrows</p>
              <Link href="/dashboard/create">
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 border-zinc-200/60 shadow-sm backdrop-blur-md text-zinc-600"
                >
                  Create your first task
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            Recent Activity
          </h2>

          <div className="rounded-2xl border border-zinc-200/60 shadow-sm backdrop-blur-md glass divide-y divide-zinc-200">
            {recentEscrows.length > 0 ? recentEscrows.map((escrow, i) => (
              <motion.div
                key={escrow.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={`/dashboard/tasks/${escrow.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-zinc-100/50 transition-colors"
                >
                  <div className={`h-2 w-2 rounded-full shrink-0 ${
                    escrow.status === EscrowStatus.Released
                      ? "bg-emerald-500"
                      : escrow.status === EscrowStatus.Judging
                        ? "bg-purple-500 animate-pulse"
                        : escrow.status === EscrowStatus.Funded
                          ? "bg-indigo-500"
                          : "bg-zinc-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-900 truncate">
                      {escrow.promptText.slice(0, 40)}...
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[11px] text-zinc-600 font-mono">
                        {formatEthAmount(escrow.amount)}
                      </p>
                      <span className="text-[10px] text-zinc-400">•</span>
                      <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {i === 0 ? "Just now" : `${i * 4}m ago`}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                </Link>
              </motion.div>
            )) : (
              <div className="p-6 text-center text-sm text-zinc-500">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
