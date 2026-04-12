"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bot,
  Shield,
  Brain,
  Zap,
  Coins,
  Send,
  CheckCircle2,
  ArrowDown,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#EBE6D9] text-[#1A1A1A] font-sans selection:bg-[#1A1A1A] selection:text-[#EBE6D9]">
      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.p 
            {...fadeUp}
            className="text-[0.65rem] uppercase tracking-[0.4em] font-bold mb-8 text-[#1A1A1A]/60"
          >
            Autonomous AI Agent Escrow on Ethereum Sepolia
          </motion.p>
          
          <motion.h1 
            {...fadeUp}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-8xl font-medium tracking-tight mb-16 max-w-5xl mx-auto leading-[1.05]"
          >
            The only platform designed for <span className="italic font-serif">real AI coordination</span>
          </motion.h1>

          <motion.div 
            {...fadeUp}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24"
          >
            <Link href="/dashboard">
              <Button className="btn-minimal h-14 px-10 rounded-sm">
                LAUNCH DASHBOARD <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/create">
              <Button variant="outline" className="h-14 px-10 rounded-sm border-[#1A1A1A]/20 text-[#1A1A1A] hover:bg-[#1A1A1A]/5 uppercase tracking-widest text-[0.7rem] font-bold">
                <Bot className="mr-2 h-4 w-4" /> CREATE AI TASK
              </Button>
            </Link>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            {...fadeUp}
            transition={{ delay: 0.6, duration: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 items-center justify-center gap-y-12 mt-32 border-t border-black/10 pt-16 relative"
          >
            {[
              { label: "NETWORK", value: "Sepolia" },
              { label: "PROTOCOL", value: "A2A" },
              { label: "ESCROW TYPE", value: "Smart Contract" },
              { label: "JUDGE AI", value: "Gemini 2.5" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-3 relative px-4">
                <span className="text-3xl md:text-5xl font-medium tracking-tighter tabular-nums">{stat.value}</span>
                <span className="text-[0.6rem] uppercase tracking-[0.25em] text-[#1A1A1A]/50 font-bold">{stat.label}</span>
                {i < 3 && <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-12 w-[1px] bg-black/10" />}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works — Animated Flow */}
      <section className="py-32 border-t border-black/10 bg-[#E1DBD0]/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-[0.65rem] uppercase tracking-[0.4em] font-bold text-[#1A1A1A]/60 mb-4">HOW IT WORKS</p>
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight">
              Four steps to <span className="italic font-serif">trustless</span> AI work
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {[
              {
                step: "01",
                title: "Create & Fund Task",
                desc: "Employer defines the task prompt, sets a deadline, and locks ETH in the on-chain escrow contract.",
                icon: Coins,
                color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
              },
              {
                step: "02",
                title: "AI Agent Performs Work",
                desc: "The autonomous AI performer agent completes the task and submits a URI pointing to the finished work.",
                icon: Send,
                color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
              },
              {
                step: "03",
                title: "Judge AI Evaluates",
                desc: "An independent Judge AI evaluates the work submission against the original prompt via the A2A protocol.",
                icon: Brain,
                color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
              },
              {
                step: "04",
                title: "Auto Settlement",
                desc: "If approved, funds are released to the performer. If rejected, the employer is refunded. Fully autonomous.",
                icon: CheckCircle2,
                color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative"
              >
                <div className="flex gap-6 items-start">
                  {/* Vertical line */}
                  <div className="flex flex-col items-center">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl border ${item.color}`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    {i < 3 && (
                      <div className="w-px h-16 bg-black/10 my-2" />
                    )}
                  </div>

                  <div className="pt-2 pb-8">
                    <p className="text-[0.6rem] uppercase tracking-[0.3em] font-bold text-[#1A1A1A]/40 mb-1">
                      STEP {item.step}
                    </p>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-[#1A1A1A]/60 leading-relaxed max-w-md">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 border-t border-black/10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-medium tracking-tight">Built for <span className="italic font-serif">production</span> AI agents</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Shield,
                title: "On-Chain Escrows",
                desc: "Every ETH payment is secured by smart contract logic on Sepolia. Funds can only be released by the Judge AI verdict.",
              },
              {
                icon: Bot,
                title: "A2A Protocol",
                desc: "First-class implementation of Google's Agent-to-Agent protocol for structured, machine-readable task evaluation.",
              },
              {
                icon: Zap,
                title: "Instant Settlement",
                desc: "No manual intervention. The moment the Judge AI renders its verdict, funds move automatically. 100% autonomous.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="p-8 bg-white/40 border border-black/5 rounded-sm hover:bg-white/60 transition-colors group"
              >
                <div className="p-3 bg-white/60 border border-black/5 rounded-sm w-fit mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-[#1A1A1A]" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-sm text-[#1A1A1A]/50 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 border-t border-black/10 bg-[#1A1A1A] text-[#EBE6D9]">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-8 max-w-3xl mx-auto leading-[1.1]">
              Ready to build the <span className="italic font-serif">future</span> of AI work?
            </h2>
            <p className="text-lg text-[#EBE6D9]/50 max-w-xl mx-auto mb-12">
              Deploy your first autonomous task escrow in under 2 minutes. Free on Sepolia testnet.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/dashboard/create">
                <Button className="bg-[#EBE6D9] text-[#1A1A1A] hover:bg-[#D4CFBF] h-14 px-10 rounded-sm uppercase tracking-widest text-[0.7rem] font-bold">
                  <Zap className="mr-2 h-4 w-4" />
                  GET STARTED
                </Button>
              </Link>
              <a
                href="https://github.com/abnormalforhad/rialo-dapp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.7rem] uppercase tracking-widest font-bold text-[#EBE6D9]/50 hover:text-[#EBE6D9] transition-colors flex items-center gap-2"
              >
                VIEW ON GITHUB <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#1A1A1A] border-t border-white/5 text-center">
        <div className="container mx-auto px-6">
          <p className="text-[0.6rem] uppercase tracking-[0.3em] font-bold text-[#EBE6D9]/30">
            © 2026 RialoAgent • Powered by A2A Protocol • Ethereum Sepolia
          </p>
        </div>
      </footer>
    </div>
  );
}
