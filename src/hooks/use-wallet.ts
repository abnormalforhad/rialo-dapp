/* eslint-disable */
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useSendTransaction,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { formatUnits } from "viem";
import { shortenAddress } from "@/lib/eth-utils";
import { SEPOLIA_CHAIN_ID } from "@/lib/constants";

export interface TokenBalance {
  symbol: string;
  name: string;
  amount: bigint;
  decimals: number;
  uiAmount: number;
  icon: string;
}

/**
 * Hook for EVM wallet connection and balance management using wagmi.
 * Connects to Sepolia testnet via MetaMask / injected wallet.
 */
export function useWallet() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { sendTransactionAsync } = useSendTransaction();
  const { data: balanceData, refetch: refetchBalance } = useBalance({ address });
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const [loading, setLoading] = useState(false);

  // Auto-refresh balance
  useEffect(() => {
    if (isConnected) {
      refetchBalance();
      const id = setInterval(() => refetchBalance(), 8000);
      return () => clearInterval(id);
    }
  }, [isConnected, refetchBalance]);

  const ethBalance = balanceData
    ? Number(formatUnits(balanceData.value, balanceData.decimals))
    : 0;

  const tokenBalances: TokenBalance[] = [];
  if (isConnected && balanceData) {
    tokenBalances.push({
      symbol: balanceData.symbol || "ETH",
      name: "Sepolia Ether",
      amount: balanceData.value,
      decimals: balanceData.decimals,
      uiAmount: ethBalance,
      icon: "💎",
    });
  }

  const connectWallet = useCallback(() => {
    connect({ connector: injected() });
  }, [connect]);

  const disconnectWallet = useCallback(async () => {
    disconnect();
    
    // Revoke permissions on disconnect so the user is forced 
    // to choose an account the next time they connect
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch (err) {
        console.error("Failed to revoke permissions", err);
      }
    }
  }, [disconnect]);

  const ensureSepolia = useCallback(async () => {
    if (chainId !== SEPOLIA_CHAIN_ID && switchChainAsync) {
      await switchChainAsync({ chainId: SEPOLIA_CHAIN_ID });
    }
  }, [chainId, switchChainAsync]);

  return {
    isConnected,
    address: address ?? "",
    balance: ethBalance,
    tokenBalances,
    balanceLoading: loading,
    formattedBalance: isConnected ? `${ethBalance.toFixed(4)} ETH` : "0 ETH",
    shortAddress: address ? shortenAddress(address) : "",
    connect: connectWallet,
    disconnect: disconnectWallet,
    refreshBalance: refetchBalance,
    sendTransaction: sendTransactionAsync,
    chainId,
    ensureSepolia,
    switchChain: switchChainAsync,
  };
}
