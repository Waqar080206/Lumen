import { clamp } from "@/lib/utils";
import type { EvaluationResult, RetrievedChunk } from "@/types/lumen";

const sentences = (value: string) =>
  value
    .split(/[.!?]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

export function heuristicEvaluate(response: string, retrieved: RetrievedChunk[]): EvaluationResult {
  const evidence = retrieved.map((chunk) => chunk.excerpt.toLowerCase()).join(" ");
  const claims = sentences(response);
  const supported = claims.filter((claim) =>
    claim
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 5)
      .some((word) => evidence.includes(word)),
  );
  const unsupported = claims.filter((claim) => !supported.includes(claim));
  const base = retrieved.length ? 68 : 28;
  const supportRatio = claims.length ? supported.length / claims.length : 0;
  const groundedness = clamp(Math.round(base + supportRatio * 28 - unsupported.length * 5), 18, 96);

  return {
    groundedness,
    confidence: clamp(Math.round(groundedness - 8 + retrieved.length * 3), 20, 94),
    supportedClaims: supported.slice(0, 4),
    unsupportedClaims: unsupported.slice(0, 3),
    reasoning:
      retrieved.length > 0
        ? "Score reflects overlap between the answer and retrieved policy evidence."
        : "No matching knowledge was retrieved, so the answer should be treated as ungrounded.",
  };
}
