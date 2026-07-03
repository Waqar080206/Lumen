"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Database,
  History,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  SquareActivity,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { AnalyticsPanel } from "@/components/analytics/analytics-panel";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { personas } from "@/constants/personas";
import type { AnalyticsSnapshot, ConversationRun, PersonaId } from "@/types/lumen";

const emptyAnalytics: AnalyticsSnapshot = {
  totalTests: 0,
  averageGroundedness: 0,
  positiveFeedback: 0,
  negativeFeedback: 0,
  flagRate: 0,
  topPersonas: [],
  groundednessTrend: [],
  flagsByCategory: [],
};

const starterPrompt = "Can I expense a new vendor tool that costs $1,200 and includes customer PII?";

const navItems = [
  { id: "prompt-studio", label: "Prompt Studio", icon: BrainCircuit },
  { id: "knowledge", label: "Knowledge", icon: Database },
  { id: "governance", label: "Governance", icon: ShieldCheck },
  { id: "history", label: "History", icon: History },
  { id: "analytics", label: "Analytics", icon: Bot },
] as const;

type NavItemId = (typeof navItems)[number]["id"];

export function LumenStudio() {
  const [persona, setPersona] = useState<PersonaId>("security");
  const [prompt, setPrompt] = useState(starterPrompt);
  const [run, setRun] = useState<ConversationRun | null>(null);
  const [history, setHistory] = useState<ConversationRun[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>(emptyAnalytics);
  const [loading, setLoading] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState<NavItemId>("prompt-studio");

  const activePersona = useMemo(() => personas.find((item) => item.id === persona) ?? personas[0], [persona]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const updateSidebarMode = () => setSidebarExpanded(query.matches);

    updateSidebarMode();
    query.addEventListener("change", updateSidebarMode);
    return () => query.removeEventListener("change", updateSidebarMode);
  }, []);

  async function submitPrompt() {
    setLoading(true);
    const response = await fetch("/api/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, persona }),
    });
    const payload = (await response.json()) as { run: ConversationRun; analytics: AnalyticsSnapshot };
    setRun(payload.run);
    setHistory((current) => [payload.run, ...current].slice(0, 8));
    setAnalytics(payload.analytics);
    setLoading(false);
  }

  async function submitFeedback(feedback: "positive" | "negative") {
    if (!run) return;
    const response = await fetch("/api/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId: run.id, feedback }),
    });
    const payload = (await response.json()) as { analytics: AnalyticsSnapshot };
    setRun({ ...run, feedback });
    setHistory((items) => items.map((item) => (item.id === run.id ? { ...item, feedback } : item)));
    setAnalytics(payload.analytics);
  }

  function navigateToSection(id: NavItemId) {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-white">
      <div className="mono-video-fallback absolute inset-0 z-0 opacity-90" />
      <video className="absolute inset-0 z-0 h-full w-full object-cover opacity-[0.26] mix-blend-screen" autoPlay muted loop playsInline aria-hidden="true">
        <source src="/lumen-atmosphere.webm" type="video/webm" />
      </video>
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(255,255,255,0.12),transparent_32%),linear-gradient(to_bottom,rgba(0,0,0,0.16),rgba(0,0,0,0.84))]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1760px]">
        <aside
          className={[
            "hidden shrink-0 p-3 transition-[width] duration-300 md:block",
            sidebarExpanded ? "md:w-72" : "md:w-[92px]",
          ].join(" ")}
        >
          <nav
            className={[
              "liquid-glass !sticky top-3 flex h-[calc(100vh-1.5rem)] w-full flex-col rounded-lg transition-all duration-300",
              sidebarExpanded ? "p-4" : "p-3",
            ].join(" ")}
          >
            <div
              className={[
                "mb-6 flex items-center gap-3",
                sidebarExpanded ? "justify-start" : "justify-center",
              ].join(" ")}
            >
              <button
                type="button"
                aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
                title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
                onClick={() => setSidebarExpanded((value) => !value)}
                className="liquid-control relative grid h-11 w-11 shrink-0 place-items-center rounded-lg transition hover:scale-[1.03] hover:text-white"
              >
                <Sparkles className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-md bg-zinc-100 text-zinc-950 shadow-[0_8px_18px_rgba(0,0,0,0.34)]">
                  {sidebarExpanded ? <PanelLeftClose className="h-3 w-3" /> : <PanelLeftOpen className="h-3 w-3" />}
                </span>
              </button>
              <div className={sidebarExpanded ? "min-w-0" : "sr-only"}>
                <p className="font-medium leading-none">Lumen</p>
                <p className="mt-1 text-xs text-white/48">Conversation Studio</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={label}
                  aria-label={label}
                  aria-current={activeSection === id ? "page" : undefined}
                  title={label}
                  type="button"
                  onClick={() => navigateToSection(id)}
                  className={[
                    "group relative z-10 flex h-11 w-full items-center gap-3 rounded-md text-sm transition duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/20",
                    sidebarExpanded ? "justify-start px-3" : "justify-center px-0",
                    activeSection === id ? "liquid-control text-white" : "text-white/56 hover:bg-white/6 hover:text-white",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className={sidebarExpanded ? "truncate" : "sr-only"}>{label}</span>
                </button>
              ))}
            </div>
            {sidebarExpanded ? (
              <div className="mt-auto rounded-lg bg-white/[0.035] p-3">
                <div className="mb-2 flex items-center gap-2 text-xs text-white/46">
                  <SquareActivity className="h-3.5 w-3.5" />
                  Health
                </div>
                <p className="text-lg font-medium">{analytics.averageGroundedness || 0}%</p>
                <p className="mt-1 text-xs leading-5 text-white/45">workspace confidence</p>
              </div>
            ) : (
              <div className="liquid-control mt-auto grid h-11 place-items-center rounded-md" title="Workspace health">
                <SquareActivity className="h-4 w-4 text-white/54" />
              </div>
            )}
          </nav>
        </aside>

        <section className="min-w-0 flex-1 px-4 pb-28 pt-4 sm:px-5 md:pb-6 md:pl-2 lg:p-6">
          <div className="liquid-glass mb-4 flex items-center justify-between rounded-lg p-3 md:hidden">
            <div className="flex items-center gap-3">
              <div className="liquid-control grid h-10 w-10 place-items-center rounded-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium leading-none">Lumen</p>
                <p className="mt-1 text-xs text-white/46">Conversation Studio</p>
              </div>
            </div>
            <StatusBadge tone={run?.governance.status === "flagged" ? "danger" : "good"}>
              {run?.governance.status ?? "Ready"}
            </StatusBadge>
          </div>

          <header className="liquid-glass mb-5 flex flex-col gap-4 rounded-lg p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-white/55">Enterprise AI Control Center</p>
              <h1 className="mt-1 text-2xl font-medium leading-tight sm:text-3xl lg:text-4xl">
                Build <em className="font-serif">Trustworthy</em> AI
              </h1>
            </div>
            <div className="hidden md:block">
              <StatusBadge tone={run?.governance.status === "flagged" ? "danger" : "good"}>
                {run?.governance.status ?? "Ready"}
              </StatusBadge>
            </div>
          </header>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.48fr)_minmax(360px,0.72fr)]">
            <div className="space-y-5">
              <div id="prompt-studio" className="scroll-mt-5">
                <GlassCard strong className="p-5">
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-lg font-medium">Prompt Studio</h2>
                    <p className="text-sm text-white/55">{activePersona.description}</p>
                  </div>
                  <select
                    value={persona}
                    onChange={(event) => setPersona(event.target.value as PersonaId)}
                    className="liquid-control h-11 rounded-md bg-transparent px-3 text-sm text-white outline-none sm:min-w-36"
                  >
                    {personas.map((item) => (
                      <option key={item.id} className="bg-zinc-950" value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  className="min-h-40 w-full resize-none rounded-lg bg-black/18 p-4 text-sm leading-7 text-white outline-none placeholder:text-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  placeholder="Ask a policy-sensitive question..."
                />
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Search className="h-4 w-4" />
                    Retrieval, generation, evaluation, governance, analytics, and audit log run together.
                  </div>
                  <button
                    onClick={submitPrompt}
                    disabled={loading || !prompt.trim()}
                    className="liquid-control inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-medium transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Generate
                  </button>
                </div>
                </GlassCard>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div id="knowledge" className="scroll-mt-5">
                  <GlassCard strong className="h-full p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-white/60" />
                    <h2 className="font-medium">Retrieved Sources</h2>
                  </div>
                  <div className="space-y-3">
                    {(run?.retrieved ?? []).length === 0 ? (
                      <p className="text-sm text-white/50">Sources appear here before generation completes.</p>
                    ) : (
                      run?.retrieved.map((chunk) => (
                        <article key={chunk.documentId} className="liquid-glass rounded-lg p-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <h3 className="text-sm font-medium">{chunk.title}</h3>
                            <span className="text-xs text-white/45">{chunk.relevance}% match</span>
                          </div>
                          <p className="text-sm leading-6 text-white/65">{chunk.excerpt}</p>
                        </article>
                      ))
                    )}
                  </div>
                  </GlassCard>
                </div>

                <div id="governance" className="scroll-mt-5">
                  <GlassCard strong className="h-full p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-white/60" />
                    <h2 className="font-medium">Governance</h2>
                  </div>
                  {run ? (
                    <div className="space-y-4">
                      <StatusBadge tone={run.governance.status === "approved" ? "good" : "danger"}>
                        {run.governance.reviewerStatus}
                      </StatusBadge>
                      <p className="text-sm leading-6 text-white/65">{run.governance.summary}</p>
                      <div className="space-y-2">
                        {run.governance.flags.length === 0 ? (
                          <p className="flex items-center gap-2 text-sm text-emerald-200">
                            <CheckCircle2 className="h-4 w-4" />
                            No automatic flags detected.
                          </p>
                        ) : (
                          run.governance.flags.map((flag) => (
                            <p key={flag} className="flex items-center gap-2 text-sm text-red-200">
                              <AlertTriangle className="h-4 w-4" />
                              {flag}
                            </p>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-white/50">Governance decisions appear after evaluation.</p>
                  )}
                  </GlassCard>
                </div>
              </div>

              <GlassCard strong className="p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="font-medium">Response and Evaluation</h2>
                  {run && <StatusBadge tone={run.evaluation.groundedness >= 70 ? "good" : "warning"}>{run.evaluation.groundedness}% grounded</StatusBadge>}
                </div>
                {run ? (
                  <div className="space-y-5">
                    <p className="rounded-lg bg-black/18 p-4 text-sm leading-7 text-white/76 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">{run.response}</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <ClaimList title="Supported Claims" claims={run.evaluation.supportedClaims} tone="good" />
                      <ClaimList title="Unsupported Claims" claims={run.evaluation.unsupportedClaims} tone="danger" />
                    </div>
                    <p className="text-sm leading-6 text-white/58">{run.evaluation.reasoning}</p>
                    <div className="flex gap-2">
                      <button onClick={() => submitFeedback("positive")} className="liquid-control rounded-md p-2 transition hover:scale-105" title="Positive feedback">
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                      <button onClick={() => submitFeedback("negative")} className="liquid-control rounded-md p-2 transition hover:scale-105" title="Negative feedback">
                        <ThumbsDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-white/50">Generated answers, evidence scoring, and feedback controls will appear here.</p>
                )}
              </GlassCard>
            </div>

            <div className="space-y-5">
              <div id="analytics" className="scroll-mt-5">
                <AnalyticsPanel analytics={analytics} />
              </div>
              <div id="history" className="scroll-mt-5">
                <GlassCard strong className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <History className="h-4 w-4 text-white/60" />
                  <h2 className="font-medium">Audit Trail</h2>
                </div>
                <div className="space-y-3">
                  {history.length === 0 ? (
                    <p className="text-sm text-white/50">Each run is logged with persona, score, model, and status.</p>
                  ) : (
                    history.map((item) => (
                      <button key={item.id} onClick={() => setRun(item)} className="liquid-glass block w-full rounded-lg p-4 text-left transition hover:scale-[1.02]">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-sm font-medium capitalize">{item.persona}</span>
                          <span className="text-xs text-white/45">{item.evaluation.groundedness}%</span>
                        </div>
                        <p className="line-clamp-2 text-xs leading-5 text-white/55">{item.prompt}</p>
                      </button>
                    ))
                  )}
                </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </section>
      </div>

      <nav className="liquid-glass !fixed inset-x-3 bottom-3 z-20 grid grid-cols-5 rounded-lg p-1.5 md:hidden">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={label}
            aria-label={label}
            type="button"
            onClick={() => navigateToSection(id)}
            className={[
              "flex h-12 items-center justify-center rounded-md transition focus:outline-none focus:ring-2 focus:ring-white/20",
              activeSection === id ? "liquid-control text-white" : "text-white/50",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}

function ClaimList({
  title,
  claims,
  tone,
}: {
  title: string;
  claims: string[];
  tone: "good" | "danger";
}) {
  return (
    <div className="liquid-glass rounded-lg p-4">
      <h3 className="mb-3 text-sm font-medium">{title}</h3>
      <div className="space-y-2">
        {claims.length === 0 ? (
          <p className="text-sm text-white/45">None detected.</p>
        ) : (
          claims.map((claim) => (
            <p key={claim} className={tone === "good" ? "text-sm leading-6 text-emerald-200" : "text-sm leading-6 text-red-200 underline decoration-red-300/70 underline-offset-4"}>
              {claim}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
