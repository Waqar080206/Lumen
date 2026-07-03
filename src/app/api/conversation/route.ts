import { NextResponse } from "next/server";
import { getPersona } from "@/constants/personas";
import { addRun, getAnalytics, updateFeedback } from "@/services/analytics/store";
import { activeModel, evaluateAnswer, generateAnswer } from "@/services/groq/provider";
import { runGovernance } from "@/services/governance/engine";
import { retrieveKnowledge } from "@/services/retrieval/keyword";
import type { ConversationRun, PersonaId } from "@/types/lumen";

export async function GET() {
  return NextResponse.json({ analytics: getAnalytics() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    prompt?: string;
    persona?: PersonaId;
    feedback?: "positive" | "negative";
    runId?: string;
  };

  if (body.feedback && body.runId) {
    updateFeedback(body.runId, body.feedback);
    return NextResponse.json({ analytics: getAnalytics() });
  }

  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }

  const started = Date.now();
  const persona = getPersona(body.persona ?? "support");
  const retrieved = retrieveKnowledge(body.prompt);
  const response = await generateAnswer(persona, body.prompt, retrieved);
  const evaluation = await evaluateAnswer(body.prompt, response, retrieved);
  const governance = runGovernance(body.prompt, response, evaluation);

  const run: ConversationRun = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    persona: persona.id,
    prompt: body.prompt,
    response,
    retrieved,
    evaluation,
    governance,
    latencyMs: Date.now() - started,
    model: activeModel,
  };

  addRun(run);

  return NextResponse.json({ run, analytics: getAnalytics() });
}
