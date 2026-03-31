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
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
          Create <span className="text-gradient from-indigo-500 to-purple-600">AI Task</span>
        </h1>
        <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
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
        <div className="bg-white/60 border border-zinc-200/60 shadow-sm backdrop-blur-md rounded-2xl p-6 shadow-sm">
          <div className="bg-indigo-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <PlusCircle className="text-indigo-400 w-6 h-6" />
          </div>
          <h3 className="text-zinc-900 font-semibold mb-2">1. Define Task</h3>
          <p className="text-sm text-zinc-600">Set the parameters and deadline for the autonomous agent.</p>
        </div>
        
        <div className="bg-white/60 border border-zinc-200/60 shadow-sm backdrop-blur-md rounded-2xl p-6 shadow-sm">
          <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck className="text-emerald-500 w-6 h-6" />
          </div>
          <h3 className="text-zinc-900 font-semibold mb-2">2. Fund Escrow</h3>
          <p className="text-sm text-zinc-600">Lock any supported SPL token securely on the Rialo network.</p>
        </div>
        
        <div className="bg-white/60 border border-zinc-200/60 shadow-sm backdrop-blur-md rounded-2xl p-6 shadow-sm">
          <div className="bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <Cpu className="text-purple-400 w-6 h-6" />
          </div>
          <h3 className="text-zinc-900 font-semibold mb-2">3. Auto Release</h3>
          <p className="text-sm text-zinc-600">Judge AI evaluates the result and releases the funds automatically.</p>
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
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        
        <div className="relative bg-white/80 border border-zinc-200/60 shadow-sm backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-xl">
          <TaskCreationForm />
        </div>
      </motion.div>
    </div>
  );
}
