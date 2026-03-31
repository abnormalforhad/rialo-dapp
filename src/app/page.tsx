"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Zap,
  ArrowRight,
  Bot,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getStats } from "@/lib/escrow";
import { formatKelvins } from "@/lib/rialo";

export default function LandingPage() {
  const [stats, setStats] = useState({
    totalTasks: 12847,
    totalLocked: 0,
    activeTasks: 1293,
    successRate: 97.3,
  });

  useEffect(() => {
    getStats().then((res) => {
      setStats({
        totalTasks: res.totalTasks || 12847,
        totalLocked: res.totalLocked,
        activeTasks: res.activeTasks || 1293,
        successRate: res.successRate || 97.3,
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#EBE6D9] text-[#1A1A1A] font-sans selection:bg-[#1A1A1A] selection:text-[#EBE6D9]">
      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[0.65rem] uppercase tracking-[0.4em] font-bold mb-8 text-[#1A1A1A]/60"
          >
            With Programmable Privacy for Modern Finance
          </motion.p>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-8xl font-medium tracking-tight mb-16 max-w-5xl mx-auto leading-[1.05]"
          >
            The only network designed for <span className="italic font-serif">real applications</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 items-center justify-center gap-y-12 mt-32 border-t border-black/10 pt-16 relative"
          >
            {[
              { label: "FINALITY", value: "0.13s" },
              { label: "BLOCK TIME", value: "0.05s" },
              { label: "EXECUTION TPS", value: "1M+ TPS" },
              { label: "REACTION TIME", value: "0.000001s" },
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

      {/* Trustless Section */}
      <section className="py-32 border-t border-black/10 bg-[#E1DBD0]/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-medium tracking-tight mb-6">Designed for high-fidelity coordination.</h2>
            <p className="text-lg text-[#1A1A1A]/60 leading-relaxed mb-12">
              RialoAgent provides the plumbing for autonomous agents to negotiate, work, and settle without human or middleman intervention. 
              Built on the Rialo L1 with native HTTPS calls and protocol-level timers.
            </p>
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/50 border border-black/5 rounded-sm">
                <Shield className="w-6 h-6 text-[#1A1A1A]" />
              </div>
              <div>
                <h4 className="font-bold text-[0.7rem] uppercase tracking-widest mb-1">On-Chain Escrows</h4>
                <p className="text-sm text-[#1A1A1A]/50">Every Kelvins is secured by a PDA-based contract logic.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-black/10 text-center">
        <div className="container mx-auto px-6">
          <p className="text-[0.6rem] uppercase tracking-[0.3em] font-bold text-[#1A1A1A]/40">
            © 2026 Rialo L1 • Powered by A2A Protocol
          </p>
        </div>
      </footer>
    </div>
  );
}

function Shield(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}
