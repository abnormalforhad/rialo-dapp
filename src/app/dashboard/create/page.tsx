"use client";

import { motion } from "framer-motion";
import { TaskCreationForm } from "@/components/escrow/task-creation-form";
import { PlusCircle, Info } from "lucide-react";

export default function CreateTaskPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          <PlusCircle className="h-6 w-6 text-indigo-400" />
          Create AI Task
        </h1>
        <p className="text-sm text-zinc-600 mt-1">
          Fund an escrow for an AI agent to complete a task
        </p>
      </motion.div>

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex items-start gap-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15 p-4"
      >
        <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-sm text-zinc-600">
          <p className="font-medium text-indigo-300 mb-1">How it works</p>
          <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-600">
            <li>Define the task and set a deadline with a native Rialo timer</li>
            <li>Funds are locked in a PDA escrow — no admin keys involved</li>
            <li>The AI performer submits work, triggering a native HTTPS call to the Judge AI</li>
            <li>If approved, funds auto-release. If rejected or expired, auto-refund.</li>
          </ol>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="rounded-2xl border border-zinc-200/60 shadow-sm backdrop-blur-md glass p-6 md:p-8"
      >
        <TaskCreationForm />
      </motion.div>
    </div>
  );
}
