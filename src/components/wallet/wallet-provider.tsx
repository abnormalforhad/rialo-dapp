"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

export function AppWalletProvider({ children }: { children: React.ReactNode }) {
  // Use a real Solana Devnet RPC for the wallet adapter connection.
  // The wallet adapter needs a functioning Solana JSON-RPC endpoint for
  // getRecentBlockhash, sendTransaction, etc.
  // The custom Rialo RPC (api.devnet.rialo.xyz) is used separately for
  // escrow-specific operations in lib/rialo.ts.
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);
  
  // Standard wallets (Phantom, Solflare, etc.) are auto-detected via the
  // wallet standard. No need to manually pass adapter instances.
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
