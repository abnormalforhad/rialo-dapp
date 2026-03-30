// Rialo-specific type definitions

export interface RialoWallet {
  publicKey: string;
  connected: boolean;
  balance: number; // in Kelvins
  label?: string;
}

export interface RialoTransaction {
  signature: string;
  status: "pending" | "confirmed" | "failed";
  timestamp: number;
  instruction: string;
  amount?: number;
}

export interface RialoTimerConfig {
  triggerAt: number; // unix timestamp
  callback: string; // instruction name
  context: string; // PDA or account
}

export interface RialoHttpsCallConfig {
  url: string;
  method: "GET" | "POST";
  headers: Record<string, string>;
  body?: string;
  callback: string;
}

export interface RialoNetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: string;
  explorerUrl: string;
}
