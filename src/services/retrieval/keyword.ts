import { knowledgeDocuments } from "@/constants/knowledge";
import type { RetrievedChunk } from "@/types/lumen";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);

export function retrieveKnowledge(prompt: string, limit = 3): RetrievedChunk[] {
  const terms = normalize(prompt);

  return knowledgeDocuments
    .map((document) => {
      const haystack = normalize(
        `${document.title} ${document.category} ${document.tags.join(" ")} ${document.body}`,
      );
      const matches = terms.filter((term) => haystack.includes(term)).length;
      const tagMatches = terms.filter((term) => document.tags.includes(term)).length;
      return {
        document,
        score: matches + tagMatches * 2,
      };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ document, score }) => ({
      documentId: document.id,
      title: document.title,
      excerpt: document.body,
      relevance: Math.min(98, 48 + score * 11),
      tags: document.tags,
    }));
}
