"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ACTIVE_NETWORK } from "@/lib/constants";

import "@solana/wallet-adapter-react-ui/styles.css";

export function AppWalletProvider({ children }: { children: React.ReactNode }) {
  // Configured for the network (we use the Rialo custom RPC from constants)
  const endpoint = ACTIVE_NETWORK.rpcUrl;
  
  // You can pass an array of adapter instances if you want to support specific legacy wallets,
  // but standard wallets (Phantom, Solflare, etc) will be auto-detected by standard wallet standard.
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
