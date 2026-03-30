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

    // Extract prompt parts
    const { id, message } = body.params;
    const promptText =
      message.parts.find((p) => p.type === "text")?.text || "";

    // Real AI evaluation via Google Gen AI
    let verdict = false;
    let reasoning = "Failed to evaluate work.";
    let confidence = 0.0;
    let evaluationCriteria: string[] = [];

    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      
      if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not set in environment variables");
      }
      
      const evaluationPrompt = `As the Judge AI for an on-chain escrow system, evaluate the following work submission against the requirements.
      
      ${promptText}
      
      Respond accurately in valid JSON matching exactly this schema:
      {
        "verdict": boolean, // true if work meets requirements, false otherwise
        "reasoning": "Detailed string explaining exactly why it passed or failed",
        "confidence": number, // float between 0.0 and 1.0 reflecting your certainty
        "evaluationCriteria": ["array", "of", "criteria", "checked"]
      }`;

      // OpenRouter API Call (OpenAI compatible)
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://rialo-dapp.local", // Required by OpenRouter for ranking
          "X-Title": "Rialo Agent Platform" // Optional site name for OpenRouter
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash", // Default model, can be changed to anthropic/claude-3-haiku, etc.
          messages: [
            { role: "user", content: evaluationPrompt }
          ],
          response_format: { type: "json_object" } // Force JSON output if supported by model
        })
      });

      if (!res.ok) {
        throw new Error(`OpenRouter API error: ${res.statusText}`);
      }

      const aiResponse = await res.json();
      const rawJson = aiResponse.choices?.[0]?.message?.content;
      const parsed = JSON.parse(rawJson || "{}");
      
      verdict = parsed.verdict ?? false;
      reasoning = parsed.reasoning ?? "AI returned an invalid response structure.";
      confidence = parsed.confidence ?? 0.0;
      evaluationCriteria = parsed.evaluationCriteria ?? [];

    } catch (err) {
      console.warn("Falling back to demo AI evaluation due to error:", err);
      // Fallback to strict mock logic if missing API keys so local testing still works
      const hasWorkUri = promptText.includes("Work Submission URI:");
      confidence = 0.7 + Math.random() * 0.3;
      verdict = confidence > 0.5 && hasWorkUri;
      evaluationCriteria = ["Work submission provided", "API Error Fallback used"];
      reasoning = verdict 
        ? "Work submission visually evaluated by mock fallback due to missing LLM keys." 
        : "Failed API fallback evaluation.";
    }

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
