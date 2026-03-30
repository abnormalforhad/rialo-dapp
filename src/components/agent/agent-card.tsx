"use client";

import { motion } from "framer-motion";
import type { AgentCard } from "@/types/a2a";
import { Badge } from "@/components/ui/badge";
import { Bot, Shield, Zap, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentCardDisplayProps {
  agent: AgentCard;
  index?: number;
  variant?: "default" | "compact";
}

export function AgentCardDisplay({
  agent,
  index = 0,
  variant = "default",
}: AgentCardDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0f0f1a]/80 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5",
        variant === "compact" ? "p-4" : "p-6"
      )}
    >
      {/* Top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
          <Bot className="h-6 w-6 text-indigo-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-white truncate">
              {agent.name}
            </h3>
            <Badge
              variant="outline"
              className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            >
              v{agent.version}
            </Badge>
          </div>

          <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
            {agent.description}
          </p>

          {/* Capabilities */}
          <div className="flex flex-wrap gap-1.5">
            {agent.capabilities.streaming && (
              <Badge
                variant="outline"
                className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20 gap-1"
              >
                <Zap className="h-3 w-3" />
                Streaming
              </Badge>
            )}
            {agent.authentication.schemes.map((scheme) => (
              <Badge
                key={scheme}
                variant="outline"
                className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20 gap-1"
              >
                <Shield className="h-3 w-3" />
                {scheme}
              </Badge>
            ))}
            <Badge
              variant="outline"
              className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20 gap-1"
            >
              <Globe className="h-3 w-3" />
              A2A
            </Badge>
          </div>

          {/* Skills */}
          {variant !== "compact" && agent.skills.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/[0.04]">
              <p className="text-[11px] font-semibold text-zinc-500 mb-1.5">
                SKILLS
              </p>
              <div className="space-y-1">
                {agent.skills.map((skill) => (
                  <div key={skill.id} className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-zinc-300">
                        {skill.name}
                      </p>
                      <p className="text-[11px] text-zinc-600">
                        {skill.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
