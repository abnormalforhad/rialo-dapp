"use client";

import { formatKelvins, shortenAddress } from "@/lib/rialo";
import { useWallet } from "@/hooks/use-wallet";
import { Coins } from "lucide-react";

export function KelvinBalance() {
  const { isConnected, balance, formattedBalance } = useWallet();

  if (!isConnected) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/15 px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20">
        <Coins className="h-5 w-5 text-indigo-400" />
      </div>
      <div>
        <p className="text-xs text-zinc-500 font-medium">Wallet Balance</p>
        <p className="text-lg font-bold text-white">{formattedBalance}</p>
        <p className="text-[11px] text-zinc-500 font-mono">
          {balance.toLocaleString()} Kelvins
        </p>
      </div>
    </div>
  );
}
