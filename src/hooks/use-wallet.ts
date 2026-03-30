/* eslint-disable */
"use client";

import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { formatKelvins, shortenAddress } from "@/lib/rialo";
import { useCallback, useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

/**
 * Hook for wallet connection and balance management using Solana Wallet Adapter
 */
export function useWallet() {
  const { wallet, publicKey, connected, select, connect: connectWallet, disconnect: disconnectWallet } = useSolanaWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number>(0);

  const refreshBalance = useCallback(async () => {
    if (!publicKey) return;
    try {
      const bal = await connection.getBalance(publicKey);
      // Ensure we are interpreting the solana lamports as Kelvins based on Rialo mock logic logic
      setBalance(bal);
    } catch (err) {
      console.error("Failed to refresh balance:", err);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    if (connected) {
      refreshBalance();
    } else {
      setBalance(0);
    }
  }, [connected, refreshBalance]);

  return {
    wallet,
    isConnected: connected,
    publicKey: publicKey?.toBase58() ?? "",
    balance,
    formattedBalance: connected ? formatKelvins(balance) : "0",
    shortAddress: publicKey ? shortenAddress(publicKey.toBase58()) : "",
    connect: connectWallet,
    disconnect: disconnectWallet,
    refreshBalance,
    // Add sendTransaction for real blockchain interaction
    sendTransaction: useSolanaWallet().sendTransaction,
  };
}
