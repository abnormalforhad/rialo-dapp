"use client";

import { useWallet } from "@/hooks/use-wallet";
import { formatTokenAmount } from "@/lib/rialo";
import { Coins, WalletIcon, CircleDollarSign } from "lucide-react";
import { useState } from "react";

export function KelvinBalance() {
  const { isConnected, balances } = useWallet();
  const [index, setIndex] = useState(0);

  if (!isConnected) return null;

  const tokens = [
    { label: "RIALO", value: balances.RIALO, icon: <Coins className="h-4 w-4 text-[#1A1A1A]" /> },
    { label: "USDC", value: balances.USDC, icon: <CircleDollarSign className="h-4 w-4 text-[#1A1A1A]" /> },
    { label: "SOL", value: balances.SOL, icon: <WalletIcon className="h-4 w-4 text-[#1A1A1A]" /> },
  ];

  const current = tokens[index];

  return (
    <div 
      className="flex items-center gap-3 px-4 py-2 border border-black/10 rounded-sm cursor-pointer hover:bg-black/5 transition-colors"
      onClick={() => setIndex((index + 1) % tokens.length)}
      title="Click to switch token balance"
    >
      <div className="flex items-center justify-center">
        {current.icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[0.6rem] uppercase tracking-widest font-bold text-black/40">
          {current.label} BALANCE
        </span>
        <span className="text-sm font-medium tracking-tight">
          {formatTokenAmount(current.value, current.label)}
        </span>
      </div>
    </div>
  );
}
