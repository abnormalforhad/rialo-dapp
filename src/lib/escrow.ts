/**
 * Escrow Service
 * Manages escrow tasks using localStorage for persistence
 * and wagmi/viem for Sepolia ETH transactions.
 */

import type {
  EscrowAccount,
  CreateTaskParams,
  EscrowEvent,
} from "@/types/escrow";
import { EscrowStatus } from "@/types/escrow";
import { parseEthToWei } from "./eth-utils";
import { DEFAULT_JUDGE_ENDPOINT } from "./constants";

/* ── Event system ───────────────────────────────────────────────────── */

const _listeners: Set<(e: EscrowEvent) => void> = new Set();

function emit(event: EscrowEvent) {
  _listeners.forEach((fn) => fn(event));
}

/* ── SHA-256 hash (browser-compatible) ──────────────────────────────── */

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

/* ── LocalStorage persistence ───────────────────────────────────────── */

const STORAGE_KEY = "rialo_escrows";

function loadEscrows(): EscrowAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveEscrows(escrows: EscrowAccount[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(escrows));
}

function generateId(): string {
  return `esc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ── Public API ──────────────────────────────────────────────────────── */

export async function getEscrows(): Promise<EscrowAccount[]> {
  return loadEscrows().sort((a, b) => b.createdAt - a.createdAt);
}

export async function getEscrow(id: string): Promise<EscrowAccount | null> {
  const escrows = loadEscrows();
  return escrows.find((e) => e.id === id) ?? null;
}

export async function getEscrowsByEmployer(
  employer: string
): Promise<EscrowAccount[]> {
  const all = await getEscrows();
  return all.filter((e) => e.employer.toLowerCase() === employer.toLowerCase());
}

export async function getEscrowsByPerformer(
  performer: string
): Promise<EscrowAccount[]> {
  const all = await getEscrows();
  return all.filter((e) => e.performer.toLowerCase() === performer.toLowerCase());
}

export async function createTask(
  employer: string,
  params: CreateTaskParams,
  sendTransaction?: (args: { to: `0x${string}`; value: bigint }) => Promise<string>
): Promise<EscrowAccount> {
  const id = generateId();
  const promptHash = await hashPrompt(params.promptText);
  const now = Math.floor(Date.now() / 1000);
  const weiAmount = parseEthToWei(params.amount);

  let txHash: string | null = null;

  // Send real ETH transaction on Sepolia if signer available
  if (sendTransaction) {
    try {
      txHash = await sendTransaction({
        to: params.performer as `0x${string}`,
        value: BigInt(weiAmount),
      });
      console.log("Task creation tx sent:", txHash);
    } catch (err) {
      console.error("Failed to send transaction:", err);
      throw err;
    }
  }

  const escrow: EscrowAccount = {
    id,
    txHash,
    employer,
    performer: params.performer,
    judgeEndpoint: params.judgeEndpoint || DEFAULT_JUDGE_ENDPOINT,
    amount: weiAmount,
    token: "ETH",
    promptHash,
    promptText: params.promptText,
    deadline: now + params.deadlineSeconds,
    status: EscrowStatus.Funded,
    createdAt: now,
    workSubmissionUri: null,
    judgeVerdict: null,
    judgeReasoning: null,
  };

  // Persist to localStorage
  const existing = loadEscrows();
  saveEscrows([escrow, ...existing]);

  emit({
    type: "status_change",
    escrowId: escrow.id,
    timestamp: now,
    data: { status: EscrowStatus.Funded, amount: weiAmount, token: "ETH" },
  });

  return escrow;
}

export async function submitWork(
  escrowId: string,
  _performer: string,
  workUri: string
): Promise<EscrowAccount> {
  const escrows = loadEscrows();
  const escrow = escrows.find((e) => e.id === escrowId);
  if (!escrow) throw new Error("Escrow not found");
  if (escrow.status !== EscrowStatus.Funded)
    throw new Error("Escrow not in Funded state");

  escrow.workSubmissionUri = workUri;
  escrow.status = EscrowStatus.WorkSubmitted;

  saveEscrows(escrows);

  emit({
    type: "status_change",
    escrowId,
    timestamp: Math.floor(Date.now() / 1000),
    data: { status: EscrowStatus.WorkSubmitted, workUri },
  });

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

  // Sum amounts as bigints to avoid precision loss
  const totalLocked = active.reduce((sum, e) => sum + BigInt(e.amount), 0n);
  const totalReleased = completed.reduce((sum, e) => sum + BigInt(e.amount), 0n);

  return {
    totalTasks: escrows.length,
    activeTasks: active.length,
    completedTasks: completed.length,
    totalLocked: totalLocked.toString(),
    totalReleased: totalReleased.toString(),
    successRate:
      escrows.length > 0
        ? Math.round((completed.length / escrows.length) * 100)
        : 0,
  };
}
