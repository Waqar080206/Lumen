import Groq from "groq-sdk";
import { heuristicEvaluate } from "@/services/evaluation/heuristic";
import type { EvaluationResult, Persona, RetrievedChunk } from "@/types/lumen";

const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

function getClient() {
  if (!process.env.GROQ_API_KEY) return null;
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export async function generateAnswer(persona: Persona, prompt: string, retrieved: RetrievedChunk[]) {
  const client = getClient();
  const context = retrieved.map((chunk) => `${chunk.title}: ${chunk.excerpt}`).join("\n");

  if (!client) {
    const evidence = retrieved[0]?.excerpt ?? "No matching source was retrieved.";
    return `Based on the available ${persona.name} knowledge, ${evidence} For this request, I would proceed only within that documented policy and escalate anything not covered by the retrieved sources.`;
  }

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: persona.systemPrompt },
      {
        role: "user",
        content: `Retrieved context:\n${context || "No retrieved context."}\n\nUser prompt:\n${prompt}\n\nAnswer with explicit uncertainty when support is missing.`,
      },
    ],
    temperature: 0.2,
  });

  return completion.choices[0]?.message?.content ?? "No response generated.";
}

export async function evaluateAnswer(
  prompt: string,
  response: string,
  retrieved: RetrievedChunk[],
): Promise<EvaluationResult> {
  const client = getClient();

  if (!client) return heuristicEvaluate(response, retrieved);

  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "Evaluate the AI response against retrieved evidence. Return strict JSON with groundedness, confidence, supportedClaims, unsupportedClaims, and reasoning.",
      },
      {
        role: "user",
        content: JSON.stringify({ prompt, response, retrieved }),
      },
    ],
    temperature: 0,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(raw) as EvaluationResult;
    return {
      groundedness: parsed.groundedness,
      confidence: parsed.confidence,
      supportedClaims: parsed.supportedClaims ?? [],
      unsupportedClaims: parsed.unsupportedClaims ?? [],
      reasoning: parsed.reasoning ?? "Groq returned a structured evaluation.",
    };
  } catch {
    return heuristicEvaluate(response, retrieved);
  }
}

export const activeModel = model;
