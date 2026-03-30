/**
 * Escrow Contract – Account State Definitions
 * These mirror the on-chain account structures.
 */

import { EscrowStatus } from "@/types/escrow";

// On-chain account sizes (borsh serialization)
export const ESCROW_ACCOUNT_SIZE = 512; // bytes

/**
 * EscrowAccount on-chain layout:
 *
 * | Field              | Type        | Offset | Size  |
 * |--------------------|-------------|--------|-------|
 * | is_initialized     | bool        | 0      | 1     |
 * | employer           | Pubkey      | 1      | 32    |
 * | performer          | Pubkey      | 33     | 32    |
 * | judge_endpoint     | String(128) | 65     | 132   |
 * | amount             | u64         | 197    | 8     |
 * | prompt_hash        | [u8; 32]    | 205    | 32    |
 * | deadline           | i64         | 237    | 8     |
 * | status             | u8          | 245    | 1     |
 * | created_at         | i64         | 246    | 8     |
 * | work_uri           | String(128) | 254    | 132   |
 * | judge_verdict      | Option<u8>  | 386    | 2     |
 * | bump               | u8          | 388    | 1     |
 * | _padding           | [u8]        | 389    | 123   |
 */

export const STATUS_MAP: Record<number, EscrowStatus> = {
  0: EscrowStatus.Funded,
  1: EscrowStatus.WorkSubmitted,
  2: EscrowStatus.Judging,
  3: EscrowStatus.Approved,
  4: EscrowStatus.Rejected,
  5: EscrowStatus.Released,
  6: EscrowStatus.Refunded,
  7: EscrowStatus.Expired,
  8: EscrowStatus.Cancelled,
};

export const STATUS_TO_U8: Record<EscrowStatus, number> = Object.fromEntries(
  Object.entries(STATUS_MAP).map(([k, v]) => [v, Number(k)])
) as Record<EscrowStatus, number>;

/**
 * Deserialize raw account data into an EscrowAccount-like object.
 * In production this would parse borsh-encoded bytes from the chain.
 */
export function deserializeEscrowAccount(data: Uint8Array) {
  // Simplified – real impl uses borsh deserialization
  const decoder = new TextDecoder();
  const view = new DataView(data.buffer);

  return {
    isInitialized: data[0] === 1,
    employer: Array.from(data.slice(1, 33))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""),
    performer: Array.from(data.slice(33, 65))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""),
    judgeEndpoint: decoder.decode(data.slice(69, 69 + view.getUint32(65, true))),
    amount: Number(view.getBigUint64(197, true)),
    promptHash: Array.from(data.slice(205, 237))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""),
    deadline: Number(view.getBigInt64(237, true)),
    status: STATUS_MAP[data[245]] ?? EscrowStatus.Funded,
    createdAt: Number(view.getBigInt64(246, true)),
    workUri: decoder.decode(data.slice(258, 258 + view.getUint32(254, true))),
    judgeVerdict: data[386] === 0 ? null : data[387] === 1,
    bump: data[388],
  };
}
