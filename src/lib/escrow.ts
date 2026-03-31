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
  parseTokenAmount,
  getRialoClient,
} from "./rialo";
// import { sendToJudge, parseJudgeVerdict } from "./a2a";
import { DEFAULT_JUDGE_ENDPOINT, ESCROW_PROGRAM_ID } from "./constants";
import { deserializeEscrowAccount } from "@/contracts/escrow/state";

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


/* ── Metadata Persistence (LocalStorage) ────────────────────────────── */

const METADATA_KEY = "rialo_escrow_metadata";

function getLocalMetadata(): Record<string, Record<string, unknown>> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(METADATA_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveLocalMetadata(pda: string, metadata: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const current = getLocalMetadata();
  current[pda] = { ...(current[pda] || {}), ...metadata };
  localStorage.setItem(METADATA_KEY, JSON.stringify(current));
}

function seedDemoData() {
  // Clear mock array — now using RPC + local metadata
  _escrows = [];
}

// Initialize demo data
seedDemoData();

/* ── Public API ──────────────────────────────────────────────────────── */

export async function getEscrows(): Promise<EscrowAccount[]> {
  const client = await getRialoClient();
  const accounts = await client.getProgramAccounts(ESCROW_PROGRAM_ID);
  
  const fetched = accounts.map(({ pubkey, account }) => {
    // Decode base64 data to Uint8Array
    const binaryData = Uint8Array.from(atob(account.data), c => c.charCodeAt(0));
    const decoded = deserializeEscrowAccount(binaryData);
    const localMeta = getLocalMetadata()[pubkey] || {};
    
    return {
      ...decoded,
      id: pubkey.slice(-8), // Simplified id for display
      pda: pubkey,
      promptText: (localMeta.promptText as string) || "Original prompt stored on-chain as hash: " + decoded.promptHash.slice(0, 8),
      workSubmissionUri: decoded.workUri,
      judgeReasoning: decoded.judgeVerdict === null ? null : (decoded.judgeVerdict ? "Evaluation met all criteria." : "Required standards not achieved."),
      token: "SOL",
    } as EscrowAccount;
  });

  // Merge the simulated local tasks with the fetched ones so the frontend always shows the tasks we just created!
  const allMap = new Map<string, EscrowAccount>();
  for (const e of _escrows) allMap.set(e.id, e);
  for (const e of fetched) allMap.set(e.id, e);

  return Array.from(allMap.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getEscrow(id: string): Promise<EscrowAccount | null> {
  const client = await getRialoClient();
  const info = await client.getAccountInfo(id);
  if (!info) return null;

  const binaryData = Uint8Array.from(atob(info.data), c => c.charCodeAt(0));
  const decoded = deserializeEscrowAccount(binaryData);
  const localMeta = getLocalMetadata()[id] || {};

  return {
    ...decoded,
    id: id.slice(-8),
    pda: id,
    promptText: (localMeta.promptText as string) || "Task ID: " + id, 
    workSubmissionUri: decoded.workUri,
    judgeReasoning: decoded.judgeVerdict === null ? null : (decoded.judgeVerdict ? "Evaluation met all criteria." : "Required standards not achieved."),
    token: "SOL",
  } as EscrowAccount;
}

export async function getEscrowsByEmployer(
  employer: string
): Promise<EscrowAccount[]> {
  const all = await getEscrows();
  return all.filter((e) => e.employer === employer);
}

export async function getEscrowsByPerformer(
  performer: string
): Promise<EscrowAccount[]> {
  const all = await getEscrows();
  return all.filter((e) => e.performer === performer);
}

export async function createTask(
  employer: string,
  params: CreateTaskParams,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendTransaction?: (tx: any, connection: any) => Promise<string>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  connection?: any
): Promise<EscrowAccount> {
  _nonce++;
  const pda = deriveEscrowPDA(employer, _nonce + 100);
  const promptHash = await hashPrompt(params.promptText);
  const now = Math.floor(Date.now() / 1000);
  const amountNative = parseTokenAmount(params.amount, params.token);

  // Build the on-chain transaction
  const tx = await buildFundTaskTx({
    employer,
    performer: params.performer,
    judgeEndpoint: params.judgeEndpoint || DEFAULT_JUDGE_ENDPOINT,
    amount: amountNative,
    promptHash,
    deadlineSeconds: params.deadlineSeconds,
    token: params.token,
  });

  // If a real signer is provided, broadcast to the chain
  if (sendTransaction && connection) {
    try {
      const signature = await sendTransaction(tx, connection);
      console.log("Task creation transaction sent:", signature);
    } catch (err) {
      console.error("Failed to broadcast transaction:", err);
      throw err;
    }
  }

  const escrow: EscrowAccount = {
    id: pda.slice(-8),
    pda,
    employer,
    performer: params.performer,
    judgeEndpoint: params.judgeEndpoint || DEFAULT_JUDGE_ENDPOINT,
    amount: amountNative,
    token: params.token,
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

  // Persist metadata locally so we have the promptText even if the chain only has the hash
  saveLocalMetadata(pda, {
    promptText: params.promptText,
    createdAt: now,
  });

  _escrows = [escrow, ..._escrows];

  emit({
    type: "status_change",
    escrowId: escrow.id,
    timestamp: now,
    data: { status: EscrowStatus.Funded, amount: amountNative, token: params.token },
  });

  return escrow;
}

export async function submitWork(
  escrowId: string,
  performer: string,
  workUri: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendTransaction?: (tx: any, connection: any) => Promise<string>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  connection?: any
): Promise<EscrowAccount> {
  const escrow = _escrows.find((e) => e.id === escrowId);
  if (!escrow) throw new Error("Escrow not found");
  if (escrow.status !== EscrowStatus.Funded)
    throw new Error("Escrow not in Funded state");

  const tx = await buildSubmitWorkTx({
    escrowPda: escrow.pda,
    performer,
    workUri,
  });

  if (sendTransaction && connection) {
    await sendTransaction(tx, connection);
  }

  escrow.workSubmissionUri = workUri;
  escrow.status = EscrowStatus.WorkSubmitted;

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
