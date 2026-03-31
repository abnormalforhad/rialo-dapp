/**
 * Rialo SDK Wrapper
 * Abstracts @rialo/ts-cdk behind a clean interface for the frontend
 */

import {
  ACTIVE_NETWORK,
  ESCROW_PROGRAM_ID,
  ESCROW_SEED,
  KELVINS_PER_RIALO,
  KELVIN_DECIMALS,
} from "./constants";

// ---------------------------------------------------------------------------
// NOTE: @rialo/ts-cdk is a real package (v0.2.0 installed). The wrapper below
// uses dynamic-import so the app still boots even in environments where the
// native crypto primitives are unavailable (SSR, tests, demo-mode).
// ---------------------------------------------------------------------------

/* ── helpers ─────────────────────────────────────────────────────────────── */

const TOKEN_CONFIGS = {
  RIALO: { symbol: "RIALO", decimals: 9, icon: "🌀" },
  USDC: { symbol: "USDC", decimals: 6, icon: "💵" },
  SOL: { symbol: "SOL", decimals: 9, icon: "◎" },
};

export function formatTokenAmount(amount: number, token: string = "RIALO"): string {
  const config = TOKEN_CONFIGS[token as keyof typeof TOKEN_CONFIGS] || TOKEN_CONFIGS.RIALO;
  const value = amount / Math.pow(10, config.decimals);
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${config.symbol}`;
}

export function parseTokenAmount(amount: number, token: string = "RIALO"): number {
  const config = TOKEN_CONFIGS[token as keyof typeof TOKEN_CONFIGS] || TOKEN_CONFIGS.RIALO;
  return Math.floor(amount * Math.pow(10, config.decimals));
}

export function formatKelvins(kelvins: number): string {
  return formatTokenAmount(kelvins, "RIALO");
}

export function parseRialoToKelvins(rialo: number): number {
  return Math.floor(rialo * KELVINS_PER_RIALO);
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatKelvinAmount(kelvins: number): string {
  return (kelvins / KELVINS_PER_RIALO).toFixed(KELVIN_DECIMALS);
}

/* ── SDK client (lazy-loaded) ────────────────────────────────────────── */

let _clientPromise: Promise<RialoClient> | null = null;

export interface RialoClient {
  getBalance(publicKey: string): Promise<number>;
  getAccountInfo(publicKey: string): Promise<{ data: string; owner: string } | null>;
  getProgramAccounts(programId: string, filters?: unknown[]): Promise<Array<{ pubkey: string; account: { data: string; owner: string } }>>;
  sendTransaction(serializedTx: Uint8Array): Promise<string>;
  rpcUrl: string;
}

async function initClient(): Promise<RialoClient> {
  try {
    // Dynamic import to avoid SSR issues
    const sdk = await import("@rialo/ts-cdk");
    const sdkAny = sdk as Record<string, unknown>;
    const client = sdkAny.createRialoClient
      ? (sdkAny.createRialoClient as (opts: { chain: unknown }) => unknown)({
          chain: sdkAny.RIALO_DEVNET_CHAIN ?? {
            rpcUrl: ACTIVE_NETWORK.rpcUrl,
          },
        }) as unknown as RialoClient
      : createRealRpcClient();
    return client;
  } catch {
    console.warn("[rialo] SDK unavailable – initializing native HTTP RPC client fallback");
    return createRealRpcClient();
  }
}

function createRealRpcClient(): RialoClient {
  return {
    rpcUrl: ACTIVE_NETWORK.rpcUrl,
    async getBalance(publicKey: string) {
      try {
        const res = await fetch(ACTIVE_NETWORK.rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "rialo_getBalance", params: [publicKey] })
        });
        const data = await res.json();
        return data.result ? parseInt(data.result as string, 10) : 0;
      } catch (err) {
        console.error("RPC Error fetching balance:", err);
        return 0;
      }
    },
    async getAccountInfo(publicKey: string) {
      try {
        const res = await fetch(ACTIVE_NETWORK.rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "rialo_getAccountInfo", params: [publicKey, { encoding: "base64" }] })
        });
        const data = await res.json();
        return data.result ? { data: data.result.data[0], owner: data.result.owner } : null;
      } catch (err) {
        console.error("RPC Error fetching account info:", err);
        return null;
      }
    },
    async getProgramAccounts(programId: string, filters?: unknown[]) {
      try {
        const res = await fetch(ACTIVE_NETWORK.rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "rialo_getProgramAccounts", params: [programId, { encoding: "base64", filters }] })
        });
        const data = await res.json();
        return data.result || [];
      } catch (err) {
        console.error("RPC Error fetching program accounts:", err);
        return [];
      }
    },
    async sendTransaction(serializedTx: Uint8Array) {
      const hexTx = Array.from(serializedTx).map(b => b.toString(16).padStart(2, "0")).join("");
      const res = await fetch(ACTIVE_NETWORK.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "rialo_sendTransaction", params: [hexTx] })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "Failed to send transaction via RPC");
      return data.result as string;
    },
  };
}

export function getRialoClient(): Promise<RialoClient> {
  if (!_clientPromise) _clientPromise = initClient();
  return _clientPromise;
}

/* ── PDA derivation ──────────────────────────────────────────────────── */

export function deriveEscrowPDA(employer: string, nonce: number): string {
  // Deterministic: hash(ESCROW_SEED + employer + nonce + PROGRAM_ID)
  const seed = `${ESCROW_SEED}-${employer}-${nonce}-${ESCROW_PROGRAM_ID}`;
  // Simplified hash for demo – real impl would use sdk.findProgramAddress
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const chr = seed.charCodeAt(i);
    hash = ((hash << 5) - hash + chr) | 0;
  }
  return `PDA${Math.abs(hash).toString(36).padStart(8, "0")}`;
}

/* ── Transaction builders ────────────────────────────────────────────── */

export interface FundTaskTxParams {
  employer: string;
  performer: string;
  judgeEndpoint: string;
  amount: number; // Kelvins
  promptHash: string;
  deadlineSeconds: number;
}

export interface SubmitWorkTxParams {
  escrowPda: string;
  performer: string;
  workUri: string;
}

export async function buildFundTaskTx(params: FundTaskTxParams) {
  // Create a self-transfer with memo containing escrow metadata
  // This is safe and works on any Solana-compatible RPC
  const { Transaction, SystemProgram, PublicKey, TransactionInstruction } = await import("@solana/web3.js");
  
  const employerKey = new PublicKey(params.employer);
  
  // Encode task params as memo data
  const memoData = JSON.stringify({
    type: "rialo_escrow_fund",
    performer: params.performer,
    amount: params.amount,
    promptHash: params.promptHash.slice(0, 16),
    deadline: params.deadlineSeconds,
  });
  
  const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
  
  const tx = new Transaction();
  
  // Add a tiny self-transfer so the tx has a valid SystemProgram instruction
  tx.add(
    SystemProgram.transfer({
      fromPubkey: employerKey,
      toPubkey: employerKey,
      lamports: 0,
    })
  );
  
  // Add memo with escrow metadata
  tx.add(
    new TransactionInstruction({
      keys: [{ pubkey: employerKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoData),
    })
  );
  
  return tx;
}

export async function buildSubmitWorkTx(params: SubmitWorkTxParams) {
  // Create a self-transfer with memo containing work submission data
  const { Transaction, SystemProgram, PublicKey, TransactionInstruction } = await import("@solana/web3.js");
  
  const performerKey = new PublicKey(params.performer);
  
  const memoData = JSON.stringify({
    type: "rialo_escrow_submit_work",
    escrowPda: params.escrowPda,
    workUri: params.workUri,
  });
  
  const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
  
  const tx = new Transaction();
  tx.add(
    SystemProgram.transfer({
      fromPubkey: performerKey,
      toPubkey: performerKey,
      lamports: 0,
    })
  );
  tx.add(
    new TransactionInstruction({
      keys: [{ pubkey: performerKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoData),
    })
  );
  return tx;
}
