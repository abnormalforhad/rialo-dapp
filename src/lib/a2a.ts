/**
 * A2A Protocol Helper
 * Constructs and parses Google Agent2Agent JSON-RPC 2.0 messages
 */

import type {
  A2ATaskSendRequest,
  A2ATaskStatusResponse,
  AgentCard,
  JudgeVerdict,
  A2ATaskState,
} from "@/types/a2a";
import { A2A_AGENT_CARD_PATH, A2A_JSON_RPC_VERSION } from "./constants";

/**
 * Fetch the Agent Card from a Judge AI endpoint
 */
export async function fetchAgentCard(baseUrl: string): Promise<AgentCard> {
  const url = baseUrl.replace(/\/+$/, "") + A2A_AGENT_CARD_PATH;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch Agent Card: ${res.status}`);
  return res.json();
}

/**
 * Build an A2A tasks/send request for work evaluation
 */
export function buildJudgeRequest(
  taskId: string,
  promptHash: string,
  workUri: string,
  promptText?: string
): A2ATaskSendRequest {
  const evaluationPrompt = [
    "You are a strict work evaluator for an on-chain escrow system.",
    "",
    `Task ID: ${taskId}`,
    `Prompt Hash: ${promptHash}`,
    `Work Submission URI: ${workUri}`,
    "",
    promptText ? `Original Prompt: ${promptText}` : "",
    "",
    "Evaluate whether the submitted work meets the requirements specified in the original prompt.",
    "Return your verdict as a JSON object with:",
    '  - "verdict": true/false',
    '  - "reasoning": your detailed explanation',
    '  - "confidence": 0-1 confidence score',
    '  - "evaluationCriteria": array of criteria checked',
  ]
    .filter(Boolean)
    .join("\n");

  return {
    jsonrpc: A2A_JSON_RPC_VERSION,
    method: "tasks/send",
    id: `judge-${taskId}-${Date.now()}`,
    params: {
      id: taskId,
      message: {
        role: "user",
        parts: [{ type: "text", text: evaluationPrompt }],
      },
      metadata: {
        source: "rialo-escrow-contract",
        taskId,
        promptHash,
        workUri,
      },
    },
  };
}

/**
 * Parse a Judge AI verdict from an A2A response
 */
export function parseJudgeVerdict(
  response: A2ATaskStatusResponse
): JudgeVerdict | null {
  if (!response.result?.status?.message?.parts) return null;

  const textPart = response.result.status.message.parts.find(
    (p) => p.type === "text" && p.text
  );
  if (!textPart?.text) return null;

  try {
    // Try to extract JSON from the response text
    const jsonMatch = textPart.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as JudgeVerdict;
  } catch {
    return null;
  }
}

/**
 * Send a task to the Judge AI for evaluation
 */
export async function sendToJudge(
  judgeEndpoint: string,
  taskId: string,
  promptHash: string,
  workUri: string,
  promptText?: string
): Promise<A2ATaskStatusResponse> {
  const request = buildJudgeRequest(taskId, promptHash, workUri, promptText);

  const res = await fetch(judgeEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!res.ok) throw new Error(`Judge AI request failed: ${res.status}`);
  return res.json();
}

/**
 * Map A2A task state to human-readable status
 */
export function getJudgeStatusLabel(state: A2ATaskState): string {
  const labels: Record<string, string> = {
    submitted: "Submitted to Judge",
    working: "Judge Evaluating...",
    "input-required": "Additional Info Needed",
    completed: "Evaluation Complete",
    canceled: "Evaluation Cancelled",
    failed: "Evaluation Failed",
  };
  return labels[state] || state;
}
