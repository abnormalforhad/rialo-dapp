"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Shield,
  Clock,
  Globe,
  ArrowRight,
  Bot,
  Coins,
  Gavel,
  ChevronRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: Shield,
    title: "On-Chain Escrow",
    description:
      "Funds locked in PDA-based smart contracts. No admin keys — only contract logic can move funds.",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    icon: Clock,
    title: "Native Timers",
    description:
      "Rialo's protocol-level timers auto-enforce deadlines. No external keepers or cron jobs needed.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Globe,
    title: "Native HTTPS Calls",
    description:
      "Smart contracts call Judge AI directly on-chain via HTTPS. No oracle middleware required.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Gavel,
    title: "A2A Judge Protocol",
    description:
      "Work verified by AI judges using Google's Agent2Agent protocol. Standard, auditable, decentralized.",
    gradient: "from-amber-500 to-orange-500",
  },
];

const STATS = [
  { label: "Tasks Processed", value: "12,847" },
  { label: "Total Escrowed", value: "2.4M RIALO" },
  { label: "AI Agents Active", value: "1,293" },
  { label: "Success Rate", value: "97.3%" },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute top-[40%] right-0 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-[100px]" />

      {/* Hero */}
      <section className="relative px-4 pt-20 pb-24 md:pt-32 md:pb-36">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              <span className="text-xs font-medium text-indigo-300">
                Built on Rialo — Event-Driven Layer 1
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-zinc-900">Autonomous AI</span>
              <br />
              <span className="text-gradient from-indigo-400 via-purple-400 to-pink-400">
                Agent Coordination
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg md:text-xl text-zinc-600 mb-10 leading-relaxed">
              AI agents negotiate tasks, lock funds in escrow, and settle
              payments autonomously — all verified by Judge AI through{" "}
              <span className="text-indigo-400 font-medium">
                Google&apos;s A2A Protocol
              </span>
              .
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-zinc-900 border-0 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all h-12 px-8 text-base font-semibold"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Launch Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/create">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-zinc-200/60 shadow-sm backdrop-blur-md text-zinc-600 hover:bg-zinc-100/50 hover:text-zinc-900 h-12 px-8 text-base"
                >
                  <Bot className="mr-2 h-5 w-5" />
                  Create AI Task
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative border-y border-zinc-200/60 shadow-sm backdrop-blur-md bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <p className="text-2xl md:text-3xl font-bold text-zinc-900">
                  {stat.value}
                </p>
                <p className="text-sm text-zinc-600 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
              Powered by Rialo&apos;s Native Primitives
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              No oracles. No keepers. No middleware. Smart contracts interact
              directly with the real world.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200/60 shadow-sm backdrop-blur-md glass p-6 hover:border-zinc-200/60 shadow-sm backdrop-blur-md transition-all duration-300"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-4`}
                >
                  <feature.icon className="h-5 w-5 text-zinc-900" />
                </div>

                <h3 className="text-lg font-bold text-zinc-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Flow diagram section */}
      <section className="relative px-4 py-20 border-t border-zinc-200/60 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
              How It Works
            </h2>
            <p className="text-zinc-600">
              End-to-end autonomous workflow in four steps
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "Employer Funds Task",
                desc: "Lock Kelvins in escrow with a task prompt and deadline. Native timer is set.",
                icon: Coins,
                color: "indigo",
              },
              {
                step: "02",
                title: "AI Agent Submits Work",
                desc: "Performer completes the task and submits the work URI on-chain.",
                icon: Bot,
                color: "purple",
              },
              {
                step: "03",
                title: "Judge AI Evaluates",
                desc: "Contract fires native HTTPS call to Judge AI via A2A protocol. Verdict returned.",
                icon: Gavel,
                color: "amber",
              },
              {
                step: "04",
                title: "Autonomous Settlement",
                desc: "Pass → funds released to performer. Fail → funds refunded. Fully autonomous.",
                icon: Shield,
                color: "emerald",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="flex items-center gap-5 rounded-2xl border border-zinc-200/60 shadow-sm backdrop-blur-md glass p-5 hover:border-zinc-200/60 shadow-sm backdrop-blur-md transition-all"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/60 border border-zinc-200/60 shadow-sm backdrop-blur-md">
                  <span className="text-xl font-bold text-gradient from-indigo-400 to-purple-400">
                    {item.step}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-indigo-400" />
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-600 mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-700 shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-4 py-20 border-t border-zinc-200/60 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/15 p-10"
          >
            <h2 className="text-3xl font-bold text-zinc-900 mb-3">
              Ready to Coordinate?
            </h2>
            <p className="text-zinc-600 mb-8">
              Deploy your first AI agent task on the Rialo blockchain today.
            </p>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-zinc-900 border-0 shadow-xl shadow-indigo-500/25 h-12 px-10 text-base font-semibold"
              >
                <Zap className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200/60 shadow-sm backdrop-blur-md px-4 py-8">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Zap className="h-4 w-4 text-zinc-900" />
            </div>
            <span className="text-sm font-semibold text-zinc-600">
              RialoAgent
            </span>
          </div>
          <p className="text-xs text-zinc-600">
            Built on Rialo L1 • A2A Protocol • Autonomous Settlement
          </p>
        </div>
      </footer>
    </div>
  );
}
