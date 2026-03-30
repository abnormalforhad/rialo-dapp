"use client";

import { motion } from "framer-motion";
import { TaskCreationForm } from "@/components/escrow/task-creation-form";
import { PlusCircle, ShieldCheck, Cpu } from "lucide-react";

export default function CreateTaskPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center space-y-4 pt-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-4">
          <ShieldCheck className="w-4 h-4" /> Secure Escrow
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
          Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">AI Task</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Deploy an autonomous agent with a fully decentralized escrow. 
          Funds are locked securely until the task is verified.
        </p>
      </motion.div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="bg-indigo-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <PlusCircle className="text-indigo-400 w-6 h-6" />
          </div>
          <h3 className="text-white font-semibold mb-2">1. Define Task</h3>
          <p className="text-sm text-zinc-400">Set the parameters and deadline for the autonomous agent.</p>
        </div>
        
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="bg-cyan-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck className="text-cyan-400 w-6 h-6" />
          </div>
          <h3 className="text-white font-semibold mb-2">2. Fund Escrow</h3>
          <p className="text-sm text-zinc-400">Lock any supported SPL token securely on the Rialo network.</p>
        </div>
        
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <Cpu className="text-purple-400 w-6 h-6" />
          </div>
          <h3 className="text-white font-semibold mb-2">3. Auto Release</h3>
          <p className="text-sm text-zinc-400">Judge AI evaluates the result and releases the funds automatically.</p>
        </div>
      </motion.div>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="relative group"
      >
        {/* Glow effect behind form */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        
        <div className="relative bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-10 shadow-2xl">
          <TaskCreationForm />
        </div>
      </motion.div>
    </div>
  );
}
