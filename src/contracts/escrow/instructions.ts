/**
 * Escrow Contract – Instruction Builders
 * Constructs the instruction data for each contract call.
 */

export enum EscrowInstruction {
  FundTask = 0,
  SubmitWork = 1,
  ProcessVerdict = 2,
  HandleTimeout = 3,
  CancelTask = 4,
}

export interface FundTaskData {
  instruction: EscrowInstruction.FundTask;
  performer: string;
  judgeEndpoint: string;
  amount: bigint;
  promptHash: Uint8Array;
  deadlineSeconds: number;
}

export interface SubmitWorkData {
  instruction: EscrowInstruction.SubmitWork;
  workUri: string;
}

export interface ProcessVerdictData {
  instruction: EscrowInstruction.ProcessVerdict;
  verdict: boolean;
  reasoning: string;
}

export interface HandleTimeoutData {
  instruction: EscrowInstruction.HandleTimeout;
}

export interface CancelTaskData {
  instruction: EscrowInstruction.CancelTask;
}

export type InstructionData =
  | FundTaskData
  | SubmitWorkData
  | ProcessVerdictData
  | HandleTimeoutData
  | CancelTaskData;

/**
 * Serialize instruction data to bytes for on-chain submission.
 * Real implementation would use borsh serialization.
 */
export function serializeInstruction(data: InstructionData): Uint8Array {
  const encoder = new TextEncoder();
  const json = JSON.stringify(data);
  const bytes = encoder.encode(json);
  // Prefix with instruction discriminator
  const result = new Uint8Array(1 + bytes.length);
  result[0] = data.instruction;
  result.set(bytes, 1);
  return result;
}

/**
 * Build a fund_task instruction
 */
export function buildFundTaskInstruction(
  performer: string,
  judgeEndpoint: string,
  amount: bigint,
  promptHash: Uint8Array,
  deadlineSeconds: number
): Uint8Array {
  return serializeInstruction({
    instruction: EscrowInstruction.FundTask,
    performer,
    judgeEndpoint,
    amount,
    promptHash,
    deadlineSeconds,
  });
}

/**
 * Build a submit_work instruction
 */
export function buildSubmitWorkInstruction(workUri: string): Uint8Array {
  return serializeInstruction({
    instruction: EscrowInstruction.SubmitWork,
    workUri,
  });
}

/**
 * Build a process_verdict instruction (called by reactive handler)
 */
export function buildProcessVerdictInstruction(
  verdict: boolean,
  reasoning: string
): Uint8Array {
  return serializeInstruction({
    instruction: EscrowInstruction.ProcessVerdict,
    verdict,
    reasoning,
  });
}
