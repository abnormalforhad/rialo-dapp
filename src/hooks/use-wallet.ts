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
  const [balances, setBalances] = useState<Record<string, number>>({
    RIALO: 0,
    USDC: 0,
    SOL: 0,
  });

  const refreshBalance = useCallback(async () => {
    if (!publicKey) return;
    try {
      // Fetch native RIALO
      const nativeBal = await connection.getBalance(publicKey);
      
      // Simulate USDC/SOL token fetching for prototype
      // In a real SPL app, we would use getTokenAccountBalance here
      setBalances({
        RIALO: nativeBal,
        USDC: Math.floor(nativeBal / 1000) * 1000000, // 1:1 demo parity
        SOL: nativeBal,
      });
    } catch (err) {
      console.error("Failed to refresh balance:", err);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    if (connected) {
      refreshBalance();
      const id = setInterval(refreshBalance, 5000);
      return () => clearInterval(id);
    } else {
      setBalances({ RIALO: 0, USDC: 0, SOL: 0 });
    }
  }, [connected, refreshBalance]);

  return {
    wallet,
    isConnected: connected,
    publicKey: publicKey?.toBase58() ?? "",
    balance: balances.RIALO,
    balances,
    formattedBalance: connected ? formatKelvins(balances.RIALO) : "0",
    shortAddress: publicKey ? shortenAddress(publicKey.toBase58()) : "",
    connect: connectWallet,
    disconnect: disconnectWallet,
    refreshBalance,
    sendTransaction: useSolanaWallet().sendTransaction,
  };
}
