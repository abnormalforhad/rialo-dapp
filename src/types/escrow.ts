// Escrow status mirrors on-chain state machine
export enum EscrowStatus {
  Funded = "funded",
  WorkSubmitted = "work_submitted",
  Judging = "judging",
  Approved = "approved",
  Rejected = "rejected",
  Released = "released",
  Refunded = "refunded",
  Expired = "expired",
  Cancelled = "cancelled",
}

export interface EscrowAccount {
  id: string;
  txHash: string | null; // Sepolia transaction hash
  employer: string; // 0x address
  performer: string; // 0x address
  judgeEndpoint: string;
  amount: string; // wei as string (bigint-safe)
  promptHash: string;
  promptText: string;
  deadline: number; // unix timestamp
  status: EscrowStatus;
  createdAt: number;
  workSubmissionUri: string | null;
  judgeVerdict: boolean | null;
  judgeReasoning: string | null;
  token: string; // always "ETH" for Sepolia
}

export interface CreateTaskParams {
  performer: string;
  judgeEndpoint: string;
  amount: number; // human-readable ETH amount (e.g. 0.01)
  token: string;
  promptText: string;
  deadlineSeconds: number;
}

export interface SubmitWorkParams {
  escrowId: string;
  workUri: string;
}

export interface EscrowEvent {
  type: "status_change" | "verdict_received" | "timer_fired" | "funds_moved";
  escrowId: string;
  timestamp: number;
  data: Record<string, unknown>;
}

export const STATUS_LABELS: Record<EscrowStatus, string> = {
  [EscrowStatus.Funded]: "Funded & Awaiting Work",
  [EscrowStatus.WorkSubmitted]: "Work Submitted",
  [EscrowStatus.Judging]: "Judge AI Evaluating",
  [EscrowStatus.Approved]: "Work Approved",
  [EscrowStatus.Rejected]: "Work Rejected",
  [EscrowStatus.Released]: "Funds Released",
  [EscrowStatus.Refunded]: "Funds Refunded",
  [EscrowStatus.Expired]: "Deadline Expired",
  [EscrowStatus.Cancelled]: "Cancelled",
};

export const STATUS_COLORS: Record<EscrowStatus, string> = {
  [EscrowStatus.Funded]: "text-blue-400",
  [EscrowStatus.WorkSubmitted]: "text-amber-400",
  [EscrowStatus.Judging]: "text-purple-400",
  [EscrowStatus.Approved]: "text-emerald-400",
  [EscrowStatus.Rejected]: "text-red-400",
  [EscrowStatus.Released]: "text-emerald-500",
  [EscrowStatus.Refunded]: "text-orange-400",
  [EscrowStatus.Expired]: "text-gray-400",
  [EscrowStatus.Cancelled]: "text-gray-500",
};
