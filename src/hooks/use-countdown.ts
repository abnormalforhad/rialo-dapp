"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook for real-time countdown to a deadline
 */
export function useCountdown(deadlineUnix: number) {
  const calcRemaining = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, deadlineUnix - now);
  }, [deadlineUnix]);

  const [remaining, setRemaining] = useState(calcRemaining);

  useEffect(() => {
    setRemaining(calcRemaining());
    const interval = setInterval(() => {
      const r = calcRemaining();
      setRemaining(r);
      if (r <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [calcRemaining]);

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const isExpired = remaining <= 0;
  const isUrgent = remaining > 0 && remaining < 600; // < 10 min

  const formatted = isExpired
    ? "Expired"
    : days > 0
      ? `${days}d ${hours}h ${minutes}m`
      : hours > 0
        ? `${hours}h ${minutes}m ${seconds}s`
        : `${minutes}m ${seconds}s`;

  const percent = isExpired
    ? 0
    : Math.min(100, (remaining / (deadlineUnix - (deadlineUnix - 86400))) * 100);

  return { remaining, days, hours, minutes, seconds, isExpired, isUrgent, formatted, percent };
}
