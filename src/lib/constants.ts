/**
 * Application Constants
 * Configured for Ethereum Sepolia Testnet.
 */

// Network Configuration
export const SEPOLIA_CHAIN_ID = 11155111;
export const NETWORK_NAME = "Sepolia Testnet";
export const EXPLORER_URL = "https://sepolia.etherscan.io";

// Default Judge AI endpoint
export const DEFAULT_JUDGE_ENDPOINT = "/api/judge";

// Escrow constraints (in ETH, human-readable)
export const MIN_ESCROW_ETH = 0.0001;
export const MAX_ESCROW_ETH = 100;
export const MIN_DEADLINE_SECONDS = 300; // 5 minutes
export const MAX_DEADLINE_SECONDS = 2_592_000; // 30 days

// A2A Protocol
export const A2A_AGENT_CARD_PATH = "/.well-known/agent.json";
export const A2A_JSON_RPC_VERSION = "2.0" as const;

// UI Constants
export const REFRESH_INTERVAL_MS = 5_000;
export const ANIMATION_DURATION = 0.3;
