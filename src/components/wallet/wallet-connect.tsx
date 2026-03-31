"use client";

import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export function WalletConnect() {
  const { 
    isConnected, shortAddress, formattedBalance, disconnect,
    evmConnected, evmAddress, evmConnect, evmDisconnect, tokenBalances
  } = useWallet();
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);

  const displayAddress = isConnected 
    ? shortAddress 
    : evmConnected 
      ? `${evmAddress?.slice(0, 6)}...${evmAddress?.slice(-4)}`
      : "";

  let displayBalance = "";
  if (isConnected) {
    displayBalance = formattedBalance;
  } else if (evmConnected) {
    const ethToken = tokenBalances.find(t => t.chain === "EVM" && t.symbol === "ETH");
    displayBalance = ethToken ? `${ethToken.uiAmount.toFixed(4)} ETH` : "0 ETH";
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(isConnected ? shortAddress : (evmAddress || ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = () => {
    if (isConnected) disconnect();
    if (evmConnected) evmDisconnect();
  };

  if (!isConnected && !evmConnected) {
    return (
      <div className="flex gap-2">
        <Button
          onClick={() => setVisible(true)}
          className="relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-zinc-900 border-0 shadow-lg shadow-indigo-500/25 transition-all duration-300"
        >
          <Wallet className="mr-2 h-4 w-4" />
          SOL Link
        </Button>
        <Button
          onClick={() => evmConnect()}
          className="relative bg-zinc-800 hover:bg-zinc-700 text-white border-0 shadow-lg transition-all duration-300"
        >
          <Wallet className="mr-2 h-4 w-4 text-orange-400" />
          EVM Link
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Network Badge */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-xs font-medium text-emerald-400">
          {evmConnected ? "Sepolia" : "DevNet"}
        </span>
      </div>

      {/* Balance */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 border border-zinc-200/60 shadow-sm backdrop-blur-md">
        <div className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
        <span className="text-sm font-medium text-zinc-700">
          {displayBalance}
        </span>
      </div>

      {/* Address */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 border border-zinc-200/60 shadow-sm backdrop-blur-md hover:bg-zinc-100/50 transition-colors cursor-pointer"
      >
        <span className="text-sm font-mono text-zinc-600">{displayAddress}</span>
        {copied ? (
          <Check className="h-3 w-3 text-emerald-400" />
        ) : (
          <Copy className="h-3 w-3 text-zinc-600" />
        )}
      </button>

      {/* Disconnect */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDisconnect}
        className="text-zinc-600 hover:text-red-400 hover:bg-red-400/10"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
