"use client";

import { useEffect, useCallback } from "react";
import { useAppStore } from "@/store/app-store";
import { getEscrows, subscribeToEvents } from "@/lib/escrow";

/**
 * Hook to load and subscribe to escrow updates
 */
export function useEscrow() {
  const { escrows, setEscrows, updateEscrow, addEvent } = useAppStore();

  const refresh = useCallback(async () => {
    const data = await getEscrows();
    setEscrows(data);
  }, [setEscrows]);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToEvents((event) => {
      addEvent(event);
      refresh(); // re-fetch on any event
    });
    return unsubscribe;
  }, [refresh, addEvent]);

  return { escrows, refresh, updateEscrow };
}
