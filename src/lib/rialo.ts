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

export function formatKelvins(kelvins: number): string {
  const rialo = kelvins / KELVINS_PER_RIALO;
  if (rialo >= 1) return `${rialo.toLocaleString(undefined, { maximumFractionDigits: 4 })} RIALO`;
  // Show in Kelvins for small amounts
  return `${kelvins.toLocaleString()} Kelvins`;
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
  getAccountInfo(publicKey: string): Promise<unknown>;
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
      : createMockClient();
    return client;
  } catch {
    console.warn("[rialo] SDK unavailable – falling back to mock client");
    return createMockClient();
  }
}

function createMockClient(): RialoClient {
  return {
    rpcUrl: ACTIVE_NETWORK.rpcUrl,
    async getBalance() {
      return 42_500_000_000; // 42.5 RIALO demo balance
    },
    async getAccountInfo() {
      return null;
    },
    async sendTransaction() {
      return "mock_sig_" + Math.random().toString(36).slice(2, 10);
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

/**
 * Build a fund_task instruction.
 * In production this uses TransactionBuilder from @rialo/ts-cdk.
 */
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

  // Mock transaction for demo
  return {
    signature: "mock_fund_" + Date.now().toString(36),
    params,
  };
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

  return {
    signature: "mock_submit_" + Date.now().toString(36),
    params,
  };
}
