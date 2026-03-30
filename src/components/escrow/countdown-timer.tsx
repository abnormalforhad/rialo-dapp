"use client";

import { useCountdown } from "@/hooks/use-countdown";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle } from "lucide-react";

interface CountdownTimerProps {
  deadline: number;
  compact?: boolean;
}

export function CountdownTimer({ deadline, compact = false }: CountdownTimerProps) {
  const { formatted, isExpired, isUrgent, days, hours, minutes, seconds } =
    useCountdown(deadline);

  if (compact) {
    return (
      <span
        className={cn(
          "text-sm font-medium",
          isExpired
            ? "text-zinc-600"
            : isUrgent
              ? "text-red-400 animate-pulse"
              : "text-zinc-200"
        )}
      >
        {formatted}
      </span>
    );
  }

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-zinc-500/10 border border-zinc-500/20 px-4 py-3">
        <AlertTriangle className="h-5 w-5 text-zinc-600" />
        <div>
          <p className="text-sm font-semibold text-zinc-600">Deadline Expired</p>
          <p className="text-xs text-zinc-600">Timer has been triggered</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        isUrgent
          ? "bg-red-500/10 border-red-500/25"
          : "bg-indigo-500/10 border-indigo-500/15"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Clock
          className={cn(
            "h-4 w-4",
            isUrgent ? "text-red-400" : "text-indigo-400"
          )}
        />
        <span
          className={cn(
            "text-xs font-semibold",
            isUrgent ? "text-red-400" : "text-indigo-400"
          )}
        >
          {isUrgent ? "DEADLINE IMMINENT" : "TIME REMAINING"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {days > 0 && (
          <TimeBlock value={days} label="D" urgent={isUrgent} />
        )}
        <TimeBlock value={hours} label="H" urgent={isUrgent} />
        <span className={cn("text-lg font-bold", isUrgent ? "text-red-400" : "text-zinc-600")}>:</span>
        <TimeBlock value={minutes} label="M" urgent={isUrgent} />
        <span className={cn("text-lg font-bold", isUrgent ? "text-red-400" : "text-zinc-600")}>:</span>
        <TimeBlock value={seconds} label="S" urgent={isUrgent} />
      </div>
    </div>
  );
}

function TimeBlock({
  value,
  label,
  urgent,
}: {
  value: number;
  label: string;
  urgent: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={cn(
          "text-2xl font-bold font-mono tabular-nums leading-none",
          urgent ? "text-red-400" : "text-zinc-900"
        )}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] text-zinc-600 mt-0.5">{label}</span>
    </div>
  );
}
