"use client";

import { useAppStore } from "@/store/app-store";
import { getRialoClient, formatKelvins, shortenAddress } from "@/lib/rialo";
import { useCallback, useEffect } from "react";

/**
 * Hook for wallet connection and balance management
 */
export function useWallet() {
  const { wallet, connectWallet, disconnectWallet } = useAppStore();

  const refreshBalance = useCallback(async () => {
    if (!wallet?.publicKey) return;
    try {
      const client = await getRialoClient();
      const balance = await client.getBalance(wallet.publicKey);
      useAppStore.setState({
        wallet: { ...wallet, balance },
      });
    } catch (err) {
      console.error("Failed to refresh balance:", err);
    }
  }, [wallet]);

  useEffect(() => {
    if (wallet?.connected) {
      refreshBalance();
    }
  }, [wallet?.connected, refreshBalance]);

  return {
    wallet,
    isConnected: wallet?.connected ?? false,
    publicKey: wallet?.publicKey ?? "",
    balance: wallet?.balance ?? 0,
    formattedBalance: wallet ? formatKelvins(wallet.balance) : "0",
    shortAddress: wallet ? shortenAddress(wallet.publicKey) : "",
    connect: connectWallet,
    disconnect: disconnectWallet,
    refreshBalance,
  };
}
