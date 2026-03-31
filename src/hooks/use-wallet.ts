/* eslint-disable */
"use client";

import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { formatKelvins, shortenAddress } from "@/lib/rialo";
import { useCallback, useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export interface TokenBalance {
  symbol: string;
  name: string;
  mint: string;
  amount: number;       // raw amount (smallest unit)
  decimals: number;
  uiAmount: number;     // human-readable amount
  icon: string;
}

/**
 * Hook for wallet connection and balance management using Solana Wallet Adapter.
 * Fetches native SOL balance + ALL SPL token accounts from the connected wallet.
 */
export function useWallet() {
  const { wallet, publicKey, connected, select, connect: connectWallet, disconnect: disconnectWallet } = useSolanaWallet();
  const { connection } = useConnection();
  const [nativeBalance, setNativeBalance] = useState(0);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);

  // Well-known SPL token mints (Devnet/Mainnet) for labeling
  const KNOWN_MINTS: Record<string, { symbol: string; name: string; icon: string }> = {
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": { symbol: "USDC", name: "USD Coin", icon: "💵" },
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": { symbol: "USDT", name: "Tether", icon: "💲" },
    "So11111111111111111111111111111111111111112": { symbol: "WSOL", name: "Wrapped SOL", icon: "◎" },
    "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So": { symbol: "mSOL", name: "Marinade SOL", icon: "🌊" },
    "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj": { symbol: "stSOL", name: "Lido Staked SOL", icon: "🔷" },
    "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263": { symbol: "BONK", name: "Bonk", icon: "🐕" },
    "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN": { symbol: "JUP", name: "Jupiter", icon: "🪐" },
    "RLBxxFkseAZ4RgJH3Sqn8jXxhmGoz9jWxDNJMh8pL7a": { symbol: "RIALO", name: "Rialo", icon: "🌀" },
  };

  const refreshBalance = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      // 1) Fetch native SOL balance
      const solBal = await connection.getBalance(publicKey);
      setNativeBalance(solBal);

      // 2) Fetch ALL SPL token accounts owned by this wallet
      const { PublicKey: PK } = await import("@solana/web3.js");
      const SPL_TOKEN_PROGRAM = new PK("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: SPL_TOKEN_PROGRAM,
      });

      const tokens: TokenBalance[] = [];

      for (const { account } of tokenAccounts.value) {
        const parsed = account.data.parsed;
        if (parsed?.type !== "account") continue;
        const info = parsed.info;
        const mint: string = info.mint;
        const amount = Number(info.tokenAmount.amount);
        const decimals: number = info.tokenAmount.decimals;
        const uiAmount: number = info.tokenAmount.uiAmount ?? 0;

        // Skip zero balances
        if (amount === 0) continue;

        const known = KNOWN_MINTS[mint];
        tokens.push({
          symbol: known?.symbol || `${mint.slice(0, 4)}...${mint.slice(-4)}`,
          name: known?.name || "Unknown Token",
          mint,
          amount,
          decimals,
          uiAmount,
          icon: known?.icon || "🪙",
        });
      }

      // Sort by uiAmount descending
      tokens.sort((a, b) => b.uiAmount - a.uiAmount);

      setTokenBalances(tokens);
    } catch (err) {
      console.error("Failed to refresh balance:", err);
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    if (connected) {
      refreshBalance();
      const id = setInterval(refreshBalance, 8000);
      return () => clearInterval(id);
    } else {
      setNativeBalance(0);
      setTokenBalances([]);
    }
  }, [connected, refreshBalance]);

  // Build the legacy `balances` record for backward compat
  const balances: Record<string, number> = {
    SOL: nativeBalance,
  };
  for (const t of tokenBalances) {
    balances[t.symbol] = t.amount;
  }

  return {
    wallet,
    isConnected: connected,
    publicKey: publicKey?.toBase58() ?? "",
    balance: nativeBalance,
    balances,
    nativeBalance,
    tokenBalances,
    balanceLoading: loading,
    formattedBalance: connected ? `${(nativeBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL` : "0 SOL",
    shortAddress: publicKey ? shortenAddress(publicKey.toBase58()) : "",
    connect: connectWallet,
    disconnect: disconnectWallet,
    refreshBalance,
    sendTransaction: useSolanaWallet().sendTransaction,
  };
}
