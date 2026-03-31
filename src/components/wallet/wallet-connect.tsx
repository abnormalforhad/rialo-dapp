"use client";

import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export function WalletConnect() {
  const { isConnected, shortAddress, formattedBalance, disconnect } =
    useWallet();
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shortAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <Button
        onClick={() => setVisible(true)}
        className="relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-zinc-900 border-0 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Balance */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 border border-zinc-200/60 shadow-sm backdrop-blur-md">
        <div className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
        <span className="text-sm font-medium text-zinc-700">
          {formattedBalance}
        </span>
      </div>

      {/* Address */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 border border-zinc-200/60 shadow-sm backdrop-blur-md hover:bg-zinc-100/50 transition-colors cursor-pointer"
      >
        <span className="text-sm font-mono text-zinc-600">{shortAddress}</span>
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
        onClick={disconnect}
        className="text-zinc-600 hover:text-red-400 hover:bg-red-400/10"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
