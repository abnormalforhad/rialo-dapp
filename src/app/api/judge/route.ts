/**
 * Mock Judge AI – A2A Protocol Server
 * Handles tasks/send requests and returns work evaluation verdicts.
 */

import { NextRequest, NextResponse } from "next/server";
import type { A2ATaskSendRequest, A2ATaskStatusResponse } from "@/types/a2a";
import { A2ATaskState } from "@/types/a2a";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as A2ATaskSendRequest;

    // Validate JSON-RPC structure
    if (body.jsonrpc !== "2.0" || body.method !== "tasks/send") {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: body.id || "unknown",
          error: { code: -32600, message: "Invalid A2A request" },
        },
        { status: 400 }
      );
    }

    const { id, message } = body.params;
    const promptText =
      message.parts.find((p) => p.type === "text")?.text || "";

    // Simulate AI evaluation (in production, this calls a real LLM)
    const hasWorkUri = promptText.includes("Work Submission URI:");
    const confidence = 0.7 + Math.random() * 0.3;
    const verdict = confidence > 0.5 && hasWorkUri;

    const evaluationCriteria = [
      "Work submission URI provided",
      "Prompt requirements addressed",
      "Code quality assessment",
      "Completeness check",
      "Security review",
    ];

    const reasoning = verdict
      ? `Work submission meets the task requirements. The submitted deliverable was evaluated against ${evaluationCriteria.length} criteria. ` +
        `All core requirements from the original prompt have been addressed satisfactorily. ` +
        `Code quality is acceptable and no critical security issues were identified. ` +
        `Confidence: ${(confidence * 100).toFixed(1)}%.`
      : `Work submission does not fully meet the task requirements. ` +
        `The evaluation found gaps in addressing the original prompt specifications. ` +
        `Key areas requiring improvement were identified during the review. ` +
        `Confidence: ${(confidence * 100).toFixed(1)}%.`;

    // Build A2A response
    const response: A2ATaskStatusResponse = {
      jsonrpc: "2.0",
      id: body.id,
      result: {
        id,
        status: {
          state: A2ATaskState.Completed,
          message: {
            role: "agent",
            parts: [
              {
                type: "text",
                text: JSON.stringify({
                  verdict,
                  reasoning,
                  confidence: Math.round(confidence * 100) / 100,
                  evaluationCriteria,
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          },
          timestamp: new Date().toISOString(),
        },
        artifacts: [
          {
            name: "evaluation-report",
            description: "Detailed work evaluation report",
            parts: [
              {
                type: "data",
                data: {
                  verdict,
                  reasoning,
                  confidence,
                  evaluationCriteria,
                  taskId: id,
                },
              },
            ],
          },
        ],
      },
    };

    // Simulate processing delay (1-3 seconds)
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Judge AI] Error:", error);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: "error",
        error: { code: -32603, message: "Internal Judge AI error" },
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler – serve A2A Agent Card
 */
export async function GET() {
  return NextResponse.json({
    name: "Rialo Task Judge",
    description:
      "Autonomous AI judge that evaluates work submissions against task prompts for the Rialo escrow system",
    url: "/api/judge",
    version: "1.0.0",
    capabilities: {
      streaming: false,
      pushNotifications: false,
    },
    skills: [
      {
        id: "evaluate-work",
        name: "Work Evaluation",
        description:
          "Evaluates submitted work against original task requirements and returns a pass/fail verdict",
      },
    ],
    authentication: {
      schemes: ["none"],
    },
    provider: {
      organization: "Rialo Escrow Platform",
    },
  });
}
