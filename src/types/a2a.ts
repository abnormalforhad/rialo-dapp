// A2A Protocol types following Google's Agent2Agent specification
// https://a2a-protocol.org

export interface AgentCard {
  name: string;
  description: string;
  url: string;
  version: string;
  capabilities: {
    streaming: boolean;
    pushNotifications: boolean;
  };
  skills: AgentSkill[];
  authentication: {
    schemes: string[];
  };
}

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
}

export interface A2AMessage {
  role: "user" | "agent";
  parts: A2AMessagePart[];
}

export interface A2AMessagePart {
  type: "text" | "file" | "data";
  text?: string;
  file?: {
    name: string;
    mimeType: string;
    uri: string;
  };
  data?: Record<string, unknown>;
}

export interface A2ATaskSendRequest {
  jsonrpc: "2.0";
  method: "tasks/send";
  id: string;
  params: {
    id: string;
    message: A2AMessage;
    metadata?: Record<string, string>;
  };
}

export interface A2ATaskStatusResponse {
  jsonrpc: "2.0";
  id: string;
  result: {
    id: string;
    status: {
      state: A2ATaskState;
      message?: A2AMessage;
      timestamp: string;
    };
    artifacts?: A2AArtifact[];
  };
}

export enum A2ATaskState {
  Submitted = "submitted",
  Working = "working",
  InputRequired = "input-required",
  Completed = "completed",
  Canceled = "canceled",
  Failed = "failed",
}

export interface A2AArtifact {
  name: string;
  description?: string;
  parts: A2AMessagePart[];
}

// Judge-specific verdict payload
export interface JudgeVerdict {
  verdict: boolean; // true = pass, false = fail
  reasoning: string;
  confidence: number; // 0-1
  evaluationCriteria: string[];
  timestamp: string;
}
