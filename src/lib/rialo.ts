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
  try {
    const sdk = await import("@rialo/ts-cdk");
    const TransactionBuilder = (sdk as Record<string, unknown>).TransactionBuilder as {
      create: () => {
        setPayer: (k: string) => { addInstruction: (i: unknown) => { setValidFrom: (v: number) => unknown } };
      };
    } | undefined;

    if (TransactionBuilder) {
      const tx = TransactionBuilder.create()
        .setPayer(params.employer)
        .addInstruction({
          programId: ESCROW_PROGRAM_ID,
          data: {
            instruction: "fund_task",
            performer: params.performer,
            judgeEndpoint: params.judgeEndpoint,
            amount: params.amount,
            promptHash: params.promptHash,
            deadlineSeconds: params.deadlineSeconds,
          },
        })
        .setValidFrom(Date.now());
      return tx;
    }
  } catch {
    // fallback
  }

  // Fallback to standard solana web3 transaction for the prototype demo
  const { Transaction, SystemProgram, PublicKey } = await import("@solana/web3.js");
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(params.employer),
      toPubkey: new PublicKey(ESCROW_PROGRAM_ID), // send to program demo
      lamports: 1000, 
    })
  );
  return tx;
}

export async function buildSubmitWorkTx(params: SubmitWorkTxParams) {
  try {
    const sdk = await import("@rialo/ts-cdk");
    const TransactionBuilder = (sdk as Record<string, unknown>).TransactionBuilder as {
      create: () => {
        setPayer: (k: string) => { addInstruction: (i: unknown) => { setValidFrom: (v: number) => unknown } };
      };
    } | undefined;

    if (TransactionBuilder) {
      const tx = TransactionBuilder.create()
        .setPayer(params.performer)
        .addInstruction({
          programId: ESCROW_PROGRAM_ID,
          data: {
            instruction: "submit_work",
            escrowPda: params.escrowPda,
            workUri: params.workUri,
          },
        })
        .setValidFrom(Date.now());
      return tx;
    }
  } catch {
    // fallback
  }

  // Fallback to standard solana web3 transaction for the prototype demo
  const { Transaction, SystemProgram, PublicKey } = await import("@solana/web3.js");
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(params.performer),
      toPubkey: new PublicKey(params.escrowPda), 
      lamports: 1000,
    })
  );
  return tx;
}
