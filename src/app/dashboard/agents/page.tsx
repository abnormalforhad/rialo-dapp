"use client";

import { motion } from "framer-motion";
import { AgentCardDisplay } from "@/components/agent/agent-card";
import type { AgentCard } from "@/types/a2a";
import { Bot, Globe, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

// Demo agent data
const DEMO_AGENTS: AgentCard[] = [
  {
    name: "Rialo Task Judge",
    description:
      "Primary autonomous AI judge that evaluates work submissions against task prompts. Uses multi-criteria analysis with confidence scoring for the Rialo escrow system.",
    url: "/api/judge",
    version: "1.0.0",
    capabilities: { streaming: false, pushNotifications: false },
    skills: [
      {
        id: "evaluate-work",
        name: "Work Evaluation",
        description:
          "Evaluates submitted work against original task requirements and returns a pass/fail verdict with reasoning",
      },
      {
        id: "code-review",
        name: "Code Quality Review",
        description:
          "Performs static analysis and best-practice checks on code submissions",
      },
    ],
    authentication: { schemes: ["bearer"] },
  },
  {
    name: "AgentAlpha — Full Stack Builder",
    description:
      "Autonomous AI development agent specializing in full-stack web applications. Proficient in React, Next.js, Node.js, and smart contract development.",
    url: "https://agents.example.com/alpha",
    version: "2.3.1",
    capabilities: { streaming: true, pushNotifications: true },
    skills: [
      {
        id: "web-dev",
        name: "Web Application Development",
        description:
          "Creates complete web applications with frontend, backend, and database layers",
      },
      {
        id: "smart-contracts",
        name: "Smart Contract Development",
        description:
          "Writes and audits smart contracts for EVM and SVM-compatible chains",
      },
      {
        id: "api-integration",
        name: "API Integration",
        description:
          "Integrates third-party APIs including payment processors, auth providers, and data services",
      },
    ],
    authentication: { schemes: ["oauth2", "bearer"] },
  },
  {
    name: "AgentBeta — ML Engineer",
    description:
      "Machine learning specialist agent. Builds, trains, and deploys ML models for classification, NLP, computer vision, and time-series forecasting.",
    url: "https://agents.example.com/beta",
    version: "1.8.0",
    capabilities: { streaming: true, pushNotifications: false },
    skills: [
      {
        id: "model-training",
        name: "Model Training & Fine-tuning",
        description:
          "Trains custom ML models on provided datasets with hyperparameter optimization",
      },
      {
        id: "nlp",
        name: "Natural Language Processing",
        description:
          "Sentiment analysis, text classification, entity extraction, and summarization",
      },
    ],
    authentication: { schemes: ["bearer"] },
  },
  {
    name: "AgentGamma — Security Auditor",
    description:
      "Specialized security audit agent for smart contracts and web applications. Performs automated vulnerability scanning and generates detailed audit reports.",
    url: "https://agents.example.com/gamma",
    version: "3.0.2",
    capabilities: { streaming: false, pushNotifications: true },
    skills: [
      {
        id: "security-audit",
        name: "Security Audit",
        description:
          "Comprehensive security review covering OWASP Top 10, supply chain risks, and blockchain-specific vulnerabilities",
      },
      {
        id: "pentest",
        name: "Penetration Testing",
        description:
          "Automated penetration testing with exploit proof-of-concepts",
      },
    ],
    authentication: { schemes: ["oauth2"] },
  },
  {
    name: "AgentDelta — Design Agent",
    description:
      "Creative AI agent for UI/UX design, brand identity, and visual asset generation. Produces Figma-compatible designs and production-ready CSS.",
    url: "https://agents.example.com/delta",
    version: "1.2.0",
    capabilities: { streaming: true, pushNotifications: false },
    skills: [
      {
        id: "ui-design",
        name: "UI/UX Design",
        description:
          "Creates responsive, accessible web interfaces with modern design patterns",
      },
      {
        id: "asset-gen",
        name: "Visual Asset Generation",
        description:
          "Generates logos, icons, illustrations, and brand assets",
      },
    ],
    authentication: { schemes: ["none"] },
  },
  {
    name: "AgentEpsilon — Data Engineer",
    description:
      "Data pipeline and analytics agent. Builds ETL workflows, data warehouses, and real-time analytics dashboards with SQL and Python.",
    url: "https://agents.example.com/epsilon",
    version: "2.1.0",
    capabilities: { streaming: false, pushNotifications: true },
    skills: [
      {
        id: "data-pipelines",
        name: "Data Pipeline Engineering",
        description:
          "Designs and implements scalable ETL/ELT pipelines with monitoring and error handling",
      },
      {
        id: "analytics",
        name: "Analytics & Visualization",
        description:
          "Builds interactive dashboards and generates data-driven insights",
      },
    ],
    authentication: { schemes: ["bearer", "api-key"] },
  },
];

export default function AgentsPage() {
  const [search, setSearch] = useState("");

  const filteredAgents = DEMO_AGENTS.filter(
    (agent) =>
      !search ||
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.description.toLowerCase().includes(search.toLowerCase()) ||
      agent.skills.some((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      )
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="h-6 w-6 text-indigo-400" />
            AI Agents
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Browse registered A2A-compatible agents on the network
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <Globe className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-xs font-medium text-indigo-300">
            A2A Protocol
          </span>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative max-w-md"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
        <Input
          placeholder="Search agents by name, skill, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white/5 border-white/[0.06] text-white placeholder:text-zinc-600 h-10"
        />
      </motion.div>

      {/* Agent grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredAgents.map((agent, i) => (
          <AgentCardDisplay key={agent.name} agent={agent} index={i} />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
          <Bot className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No agents match your search</p>
        </div>
      )}
    </div>
  );
}
