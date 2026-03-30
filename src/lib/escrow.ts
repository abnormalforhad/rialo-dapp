/**
 * Escrow Contract Client
 * High-level API for interacting with the on-chain escrow program.
 * Uses demo data with mock state management for the prototype.
 */

import type {
  EscrowAccount,
  CreateTaskParams,
  EscrowEvent,
} from "@/types/escrow";
import { EscrowStatus } from "@/types/escrow";
import {
  deriveEscrowPDA,
  buildFundTaskTx,
  buildSubmitWorkTx,
  parseRialoToKelvins,
} from "./rialo";
import { sendToJudge, parseJudgeVerdict } from "./a2a";
import { DEFAULT_JUDGE_ENDPOINT } from "./constants";

/* ── In-memory demo state ───────────────────────────────────────────── */

let _escrows: EscrowAccount[] = [];
let _nonce = 0;
const _listeners: Set<(e: EscrowEvent) => void> = new Set();

function emit(event: EscrowEvent) {
  _listeners.forEach((fn) => fn(event));
}

// Generate SHA-256 hash (browser-compatible)
async function hashPrompt(text: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(text)
    );
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16).padStart(16, "0");
}

/* ── Seed demo data ─────────────────────────────────────────────────── */

const DEMO_ADDRESSES = {
  employer1: "7xKp3Qw9rT2vL8mN5jH6fY1bG4dA0cE",
  employer2: "9zA4bC7dE2fG5hI8jK1lM3nO6pQ0rS",
  performer1: "AgentAlpha0x7f3e2a1b9c8d4e5f6071",
  performer2: "AgentBeta0x8a4c3d2e1f7b6c5d9082",
  performer3: "AgentGamma0x5b2d4f6a8c1e3g7h9i03",
};

function seedDemoData() {
  const now = Math.floor(Date.now() / 1000);
  _escrows = [
    {
      id: "task-001",
      pda: deriveEscrowPDA(DEMO_ADDRESSES.employer1, 1),
      employer: DEMO_ADDRESSES.employer1,
      performer: DEMO_ADDRESSES.performer1,
      judgeEndpoint: DEFAULT_JUDGE_ENDPOINT,
      amount: 5_000_000_000,
      promptHash: "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890",
      promptText: "Build a REST API that integrates with Stripe for subscription billing with webhook support",
      deadline: now + 7200,
      status: EscrowStatus.Funded,
      createdAt: now - 3600,
      workSubmissionUri: null,
      judgeVerdict: null,
      judgeReasoning: null,
      bump: 254,
    },
    {
      id: "task-002",
      pda: deriveEscrowPDA(DEMO_ADDRESSES.employer1, 2),
      employer: DEMO_ADDRESSES.employer1,
      performer: DEMO_ADDRESSES.performer2,
      judgeEndpoint: DEFAULT_JUDGE_ENDPOINT,
      amount: 12_500_000_000,
      promptHash: "f0e1d2c3b4a596870fedcba0987654321fedcba0987654321fedcba098765432",
      promptText: "Create a machine learning model for sentiment analysis on financial news articles with 95%+ accuracy",
      deadline: now + 14400,
      status: EscrowStatus.Judging,
      createdAt: now - 7200,
      workSubmissionUri: "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
      judgeVerdict: null,
      judgeReasoning: null,
      bump: 253,
    },
    {
      id: "task-003",
      pda: deriveEscrowPDA(DEMO_ADDRESSES.employer2, 1),
      employer: DEMO_ADDRESSES.employer2,
      performer: DEMO_ADDRESSES.performer1,
      judgeEndpoint: DEFAULT_JUDGE_ENDPOINT,
      amount: 3_200_000_000,
      promptHash: "1234abcd5678efgh9012ijkl3456mnop7890qrst1234uvwx5678yzab9012cdef",
      promptText: "Design and implement a responsive landing page for a DeFi protocol with animated hero section",
      deadline: now - 1800,
      status: EscrowStatus.Released,
      createdAt: now - 86400,
      workSubmissionUri: "ipfs://QmTzQ1JRkWErjk39mryYw2WVaphAZNjLhG9K3jA3bSyMEP",
      judgeVerdict: true,
      judgeReasoning: "Work meets all criteria: responsive design implemented, hero animation present, DeFi-specific UI patterns used correctly. Quality exceeds expectations.",
      bump: 252,
    },
    {
      id: "task-004",
      pda: deriveEscrowPDA(DEMO_ADDRESSES.employer2, 2),
      employer: DEMO_ADDRESSES.employer2,
      performer: DEMO_ADDRESSES.performer3,
      judgeEndpoint: DEFAULT_JUDGE_ENDPOINT,
      amount: 8_000_000_000,
      promptHash: "deadbeef12345678cafebabe87654321deadbeef12345678cafebabe87654321",
      promptText: "Develop a smart contract for a decentralized lottery with verifiable randomness and automatic prize distribution",
      deadline: now - 600,
      status: EscrowStatus.Refunded,
      createdAt: now - 172800,
      workSubmissionUri: null,
      judgeVerdict: null,
      judgeReasoning: null,
      bump: 251,
    },
    {
      id: "task-005",
      pda: deriveEscrowPDA(DEMO_ADDRESSES.employer1, 3),
      employer: DEMO_ADDRESSES.employer1,
      performer: DEMO_ADDRESSES.performer3,
      judgeEndpoint: DEFAULT_JUDGE_ENDPOINT,
      amount: 15_000_000_000,
      promptHash: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      promptText: "Build a real-time collaborative code editor with WebSocket sync, syntax highlighting for 10+ languages, and diff viewer",
      deadline: now + 86400,
      status: EscrowStatus.WorkSubmitted,
      createdAt: now - 43200,
      workSubmissionUri: "ipfs://QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhB",
      judgeVerdict: null,
      judgeReasoning: null,
      bump: 250,
    },
  ];
}

// Initialize demo data
seedDemoData();

/* ── Public API ──────────────────────────────────────────────────────── */

export async function getEscrows(): Promise<EscrowAccount[]> {
  return [..._escrows];
}

export async function getEscrow(id: string): Promise<EscrowAccount | null> {
  return _escrows.find((e) => e.id === id) ?? null;
}

export async function getEscrowsByEmployer(
  employer: string
): Promise<EscrowAccount[]> {
  return _escrows.filter((e) => e.employer === employer);
}

export async function getEscrowsByPerformer(
  performer: string
): Promise<EscrowAccount[]> {
  return _escrows.filter((e) => e.performer === performer);
}

export async function createTask(
  employer: string,
  params: CreateTaskParams
): Promise<EscrowAccount> {
  _nonce++;
  const pda = deriveEscrowPDA(employer, _nonce + 100);
  const promptHash = await hashPrompt(params.promptText);
  const now = Math.floor(Date.now() / 1000);
  const amountKelvins = parseRialoToKelvins(params.amount);

  // Build the on-chain transaction
  await buildFundTaskTx({
    employer,
    performer: params.performer,
    judgeEndpoint: params.judgeEndpoint || DEFAULT_JUDGE_ENDPOINT,
    amount: amountKelvins,
    promptHash,
    deadlineSeconds: params.deadlineSeconds,
  });

  const escrow: EscrowAccount = {
    id: `task-${String(Date.now()).slice(-6)}`,
    pda,
    employer,
    performer: params.performer,
    judgeEndpoint: params.judgeEndpoint || DEFAULT_JUDGE_ENDPOINT,
    amount: amountKelvins,
    promptHash,
    promptText: params.promptText,
    deadline: now + params.deadlineSeconds,
    status: EscrowStatus.Funded,
    createdAt: now,
    workSubmissionUri: null,
    judgeVerdict: null,
    judgeReasoning: null,
    bump: 255 - _nonce,
  };

  _escrows = [escrow, ..._escrows];

  emit({
    type: "status_change",
    escrowId: escrow.id,
    timestamp: now,
    data: { status: EscrowStatus.Funded, amount: amountKelvins },
  });

  // Simulate timer registration
  setTimeout(() => {
    const current = _escrows.find((e) => e.id === escrow.id);
    if (current && current.status === EscrowStatus.Funded) {
      current.status = EscrowStatus.Expired;
      emit({
        type: "timer_fired",
        escrowId: escrow.id,
        timestamp: Math.floor(Date.now() / 1000),
        data: { reason: "deadline_expired" },
      });
    }
  }, params.deadlineSeconds * 1000);

  return escrow;
}

export async function submitWork(
  escrowId: string,
  performer: string,
  workUri: string
): Promise<EscrowAccount> {
  const escrow = _escrows.find((e) => e.id === escrowId);
  if (!escrow) throw new Error("Escrow not found");
  if (escrow.status !== EscrowStatus.Funded)
    throw new Error("Escrow not in Funded state");

  await buildSubmitWorkTx({
    escrowPda: escrow.pda,
    performer,
    workUri,
  });

  escrow.workSubmissionUri = workUri;
  escrow.status = EscrowStatus.WorkSubmitted;

  emit({
    type: "status_change",
    escrowId,
    timestamp: Math.floor(Date.now() / 1000),
    data: { status: EscrowStatus.WorkSubmitted, workUri },
  });

  // Simulate A2A → Judge AI flow
  setTimeout(async () => {
    escrow.status = EscrowStatus.Judging;
    emit({
      type: "status_change",
      escrowId,
      timestamp: Math.floor(Date.now() / 1000),
      data: { status: EscrowStatus.Judging },
    });

    try {
      const response = await sendToJudge(
        escrow.judgeEndpoint,
        escrowId,
        escrow.promptHash,
        workUri,
        escrow.promptText
      );
      const verdict = parseJudgeVerdict(response);

      if (verdict) {
        escrow.judgeVerdict = verdict.verdict;
        escrow.judgeReasoning = verdict.reasoning;
        escrow.status = verdict.verdict
          ? EscrowStatus.Approved
          : EscrowStatus.Rejected;

        emit({
          type: "verdict_received",
          escrowId,
          timestamp: Math.floor(Date.now() / 1000),
          data: { verdict: verdict.verdict, reasoning: verdict.reasoning },
        });

        // Auto-settle
        setTimeout(() => {
          escrow.status = verdict.verdict
            ? EscrowStatus.Released
            : EscrowStatus.Refunded;
          emit({
            type: "funds_moved",
            escrowId,
            timestamp: Math.floor(Date.now() / 1000),
            data: {
              action: verdict.verdict ? "released" : "refunded",
              amount: escrow.amount,
            },
          });
        }, 2000);
      }
    } catch (err) {
      console.error("Judge evaluation failed:", err);
      // Simulate a positive verdict for demo
      escrow.judgeVerdict = true;
      escrow.judgeReasoning = "Work evaluation completed successfully. All criteria met.";
      escrow.status = EscrowStatus.Approved;
      emit({
        type: "verdict_received",
        escrowId,
        timestamp: Math.floor(Date.now() / 1000),
        data: { verdict: true, reasoning: escrow.judgeReasoning },
      });
    }
  }, 3000);

  return escrow;
}

export function subscribeToEvents(
  callback: (e: EscrowEvent) => void
): () => void {
  _listeners.add(callback);
  return () => _listeners.delete(callback);
}

/* ── Stats ───────────────────────────────────────────────────────────── */

export async function getStats() {
  const escrows = await getEscrows();
  const active = escrows.filter((e) =>
    [
      EscrowStatus.Funded,
      EscrowStatus.WorkSubmitted,
      EscrowStatus.Judging,
    ].includes(e.status)
  );
  const completed = escrows.filter((e) =>
    [EscrowStatus.Released, EscrowStatus.Approved].includes(e.status)
  );
  const totalLocked = active.reduce((sum, e) => sum + e.amount, 0);
  const totalReleased = completed.reduce((sum, e) => sum + e.amount, 0);

  return {
    totalTasks: escrows.length,
    activeTasks: active.length,
    completedTasks: completed.length,
    totalLocked,
    totalReleased,
    successRate:
      escrows.length > 0
        ? Math.round((completed.length / escrows.length) * 100)
        : 0,
  };
}
