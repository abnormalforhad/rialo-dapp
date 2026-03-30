import type { RialoNetworkConfig } from "@/types/rialo";

// Rialo Network Configurations
export const RIALO_DEVNET: RialoNetworkConfig = {
  name: "Rialo DevNet",
  rpcUrl: "https://api.devnet.rialo.xyz",
  chainId: "rialo-devnet-1",
  explorerUrl: "https://explorer.rialo.io/devnet",
};

export const RIALO_TESTNET: RialoNetworkConfig = {
  name: "Rialo TestNet",
  rpcUrl: "https://testnet.rialo.io",
  chainId: "rialo-testnet-1",
  explorerUrl: "https://explorer.rialo.io/testnet",
};

// Default to devnet for development
export const ACTIVE_NETWORK = RIALO_DEVNET;

// Program IDs (deployed contract addresses)
export const ESCROW_PROGRAM_ID = "Esc1ABcd2EFgh3IJkl4MNop5QRst6UVwx7YZab8CDef";

// PDA Seeds
export const ESCROW_SEED = "escrow";
export const ESCROW_VAULT_SEED = "vault";

// Default Judge AI endpoint
export const DEFAULT_JUDGE_ENDPOINT = "/api/judge";

// Kelvin denomination
export const KELVINS_PER_RIALO = 1_000_000_000; // 1 RIALO = 1B Kelvins
export const KELVIN_DECIMALS = 9;

// Escrow constraints
export const MIN_ESCROW_AMOUNT = 1_000_000; // 0.001 RIALO in Kelvins
export const MAX_ESCROW_AMOUNT = 1_000_000_000_000; // 1000 RIALO in Kelvins
export const MIN_DEADLINE_SECONDS = 300; // 5 minutes
export const MAX_DEADLINE_SECONDS = 2_592_000; // 30 days

// A2A Protocol
export const A2A_AGENT_CARD_PATH = "/.well-known/agent.json";
export const A2A_JSON_RPC_VERSION = "2.0" as const;

// UI Constants
export const REFRESH_INTERVAL_MS = 5_000;
export const ANIMATION_DURATION = 0.3;
