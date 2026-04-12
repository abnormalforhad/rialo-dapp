"use client";

import { useWallet } from "@/hooks/use-wallet";
import { WalletIcon, RefreshCw, Loader2 } from "lucide-react";

export function EthBalance() {
  const { isConnected, tokenBalances, balanceLoading, refreshBalance } = useWallet();

  if (!isConnected) return null;

  return (
    <div className="rounded-2xl border border-zinc-200/60 shadow-sm backdrop-blur-md bg-white/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-2">
          <WalletIcon className="h-4 w-4" />
          Wallet Balance
        </h3>
        <button
          onClick={() => refreshBalance()}
          disabled={balanceLoading}
          className="text-zinc-400 hover:text-zinc-700 transition-colors p-1 rounded-lg hover:bg-zinc-100"
          title="Refresh balance"
        >
          {balanceLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {tokenBalances.map((token) => (
          <TokenCard
            key={token.symbol}
            symbol={token.symbol}
            icon={token.icon}
            uiAmount={token.uiAmount}
            name={token.name}
          />
        ))}

        {tokenBalances.length === 0 && !balanceLoading && (
          <div className="col-span-full flex items-center justify-center py-3 text-xs text-zinc-400">
            No balance data available
          </div>
        )}
      </div>
    </div>
  );
}

function TokenCard({ symbol, icon, uiAmount, name }: { symbol: string; icon: string; uiAmount: number; name: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 border border-zinc-200/60 rounded-xl bg-white/40 hover:bg-white/70 transition-colors group">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 text-base group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[0.6rem] uppercase tracking-widest font-bold text-zinc-400 truncate" title={name}>
          {symbol}
        </span>
        <span className="text-sm font-semibold text-zinc-900 tabular-nums truncate" title={uiAmount.toString()}>
          {uiAmount < 0.0001 && uiAmount > 0
            ? "<0.0001"
            : uiAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
        </span>
      </div>
    </div>
  );
}
