import type { EvaluationResult, GovernanceResult } from "@/types/lumen";

const piiPatterns = [
  /\b\d{3}-\d{2}-\d{4}\b/,
  /\b\d{16}\b/,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
];

const toxicTerms = ["idiot", "stupid", "hate"];

export function runGovernance(prompt: string, response: string, evaluation: EvaluationResult): GovernanceResult {
  const flags: string[] = [];
  const combined = `${prompt} ${response}`;

  if (evaluation.groundedness < 60) flags.push("Low groundedness");
  if (piiPatterns.some((pattern) => pattern.test(combined))) flags.push("Potential PII");
  if (toxicTerms.some((term) => combined.toLowerCase().includes(term))) flags.push("Toxicity risk");
  if (evaluation.unsupportedClaims.length > 1) flags.push("Unsupported claims");

  return {
    status: flags.length > 0 ? "flagged" : "approved",
    flags,
    reviewerStatus: flags.length > 0 ? "needs-review" : "auto-approved",
    summary:
      flags.length > 0
        ? "The response requires review before deployment."
        : "The response is clear for controlled testing.",
  };
}
