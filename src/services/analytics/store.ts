import type { AnalyticsSnapshot, ConversationRun, PersonaId } from "@/types/lumen";

const seedRuns: ConversationRun[] = [];

export const sessionStore = {
  runs: seedRuns,
};

export function addRun(run: ConversationRun) {
  sessionStore.runs = [run, ...sessionStore.runs].slice(0, 30);
}

export function updateFeedback(id: string, feedback: "positive" | "negative") {
  sessionStore.runs = sessionStore.runs.map((run) => (run.id === id ? { ...run, feedback } : run));
}

export function getAnalytics(): AnalyticsSnapshot {
  const runs = sessionStore.runs;
  const total = runs.length;
  const averageGroundedness =
    total === 0 ? 0 : Math.round(runs.reduce((sum, run) => sum + run.evaluation.groundedness, 0) / total);
  const flagged = runs.filter((run) => run.governance.status === "flagged").length;
  const personaCounts = runs.reduce<Record<PersonaId, number>>(
    (acc, run) => ({ ...acc, [run.persona]: acc[run.persona] + 1 }),
    { support: 0, hr: 0, it: 0, security: 0 },
  );

  return {
    totalTests: total,
    averageGroundedness,
    positiveFeedback: runs.filter((run) => run.feedback === "positive").length,
    negativeFeedback: runs.filter((run) => run.feedback === "negative").length,
    flagRate: total === 0 ? 0 : Math.round((flagged / total) * 100),
    topPersonas: Object.entries(personaCounts)
      .map(([persona, count]) => ({ persona: persona as PersonaId, count }))
      .sort((a, b) => b.count - a.count),
    groundednessTrend: runs
      .slice(0, 8)
      .reverse()
      .map((run) => run.evaluation.groundedness),
    flagsByCategory: [
      { category: "Grounding", count: runs.filter((run) => run.governance.flags.includes("Low groundedness")).length },
      { category: "PII", count: runs.filter((run) => run.governance.flags.includes("Potential PII")).length },
      { category: "Claims", count: runs.filter((run) => run.governance.flags.includes("Unsupported claims")).length },
    ],
  };
}
