/**
 * Global application store (Zustand)
 */
import { create } from "zustand";
import type { EscrowAccount, EscrowEvent } from "@/types/escrow";
import type { RialoWallet } from "@/types/rialo";

interface AppState {
  // Wallet
  wallet: RialoWallet | null;
  connectWallet: () => void;
  disconnectWallet: () => void;

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

const DEMO_WALLET: RialoWallet = {
  publicKey: "7xKp3Qw9rT2vL8mN5jH6fY1bG4dA0cE",
  connected: true,
  balance: 42_500_000_000, // 42.5 RIALO
  label: "Main Wallet",
};

export const useAppStore = create<AppState>((set) => ({
  // Wallet
  wallet: null,
  connectWallet: () => set({ wallet: DEMO_WALLET }),
  disconnectWallet: () => set({ wallet: null }),

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
