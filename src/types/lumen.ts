export type PersonaId = "support" | "hr" | "it" | "security";

export type Persona = {
  id: PersonaId;
  name: string;
  description: string;
  systemPrompt: string;
};

export type KnowledgeDocument = {
  id: string;
  title: string;
  category: string;
  body: string;
  tags: string[];
};

export type RetrievedChunk = {
  documentId: string;
  title: string;
  excerpt: string;
  relevance: number;
  tags: string[];
};

export type EvaluationResult = {
  groundedness: number;
  confidence: number;
  supportedClaims: string[];
  unsupportedClaims: string[];
  reasoning: string;
};

export type GovernanceResult = {
  status: "approved" | "flagged";
  flags: string[];
  reviewerStatus: "auto-approved" | "needs-review";
  summary: string;
};

export type ConversationRun = {
  id: string;
  timestamp: string;
  persona: PersonaId;
  prompt: string;
  response: string;
  retrieved: RetrievedChunk[];
  evaluation: EvaluationResult;
  governance: GovernanceResult;
  latencyMs: number;
  model: string;
  feedback?: "positive" | "negative";
};

export type AnalyticsSnapshot = {
  totalTests: number;
  averageGroundedness: number;
  positiveFeedback: number;
  negativeFeedback: number;
  flagRate: number;
  topPersonas: { persona: PersonaId; count: number }[];
  groundednessTrend: number[];
  flagsByCategory: { category: string; count: number }[];
};
