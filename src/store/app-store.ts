/**
 * Global application store (Zustand)
 */
import { create } from "zustand";
import type { EscrowAccount, EscrowEvent } from "@/types/escrow";

interface AppState {
  // Escrows
  escrows: EscrowAccount[];
  setEscrows: (escrows: EscrowAccount[]) => void;
  updateEscrow: (id: string, updates: Partial<EscrowAccount>) => void;

  // Events
  events: EscrowEvent[];
  addEvent: (event: EscrowEvent) => void;

  // UI
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Escrows
  escrows: [],
  setEscrows: (escrows) => set({ escrows }),
  updateEscrow: (id, updates) =>
    set((state) => ({
      escrows: state.escrows.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })),

  // Events
  events: [],
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 100),
    })),

  // UI
  isSidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  activeTab: "overview",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
