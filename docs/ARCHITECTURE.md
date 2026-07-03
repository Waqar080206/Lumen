# Lumen Architecture Documentation

## High-Level Architecture

```mermaid
flowchart LR
  subgraph Client["Browser"]
    UI["Next.js React UI\nPrompt Studio"]
    Charts["Chart.js Analytics"]
  end

  subgraph App["Next.js Application"]
    Route["Route Handler\n/api/conversation"]
    Orchestrator["Conversation Orchestrator"]
    Retrieval["Retrieval Service\nKeyword now, vector later"]
    Provider["LLM Provider Abstraction"]
    Evaluation["Evaluation Engine"]
    Governance["Governance Engine"]
    Analytics["Analytics Service"]
    Store["Session Store\nMVP in-memory"]
  end

  subgraph External["External Integrations"]
    Groq["Groq API"]
    FutureLLMs["OpenAI / Anthropic / Gemini / Local"]
  end

  subgraph FutureData["Production Data Layer"]
    Postgres["PostgreSQL"]
    Vector["pgvector / Vector DB"]
    ObjectStore["Document Object Storage"]
    Redis["Redis Queues + Cache"]
  end

  UI --> Route
  Charts --> Route
  Route --> Orchestrator
  Orchestrator --> Retrieval
  Orchestrator --> Provider
  Provider --> Groq
  Provider -. future .-> FutureLLMs
  Orchestrator --> Evaluation
  Orchestrator --> Governance
  Orchestrator --> Analytics
  Analytics --> Store
  Orchestrator --> Store
  Store -. production .-> Postgres
  Retrieval -. production .-> Vector
  Retrieval -. documents .-> ObjectStore
  Orchestrator -. async jobs .-> Redis
```

## Runtime Data Flow

```mermaid
sequenceDiagram
  actor User
  participant UI as React Prompt Studio
  participant API as /api/conversation
  participant R as Retrieval Service
  participant LLM as Groq Provider
  participant Eval as Evaluation Engine
  participant Gov as Governance Engine
  participant Store as Analytics/Audit Store

  User->>UI: Select persona and submit prompt
  UI->>API: POST prompt + persona
  API->>R: Retrieve relevant chunks
  R-->>API: Top matching chunks
  API->>LLM: Generate answer with system prompt + context
  LLM-->>API: Assistant response
  API->>Eval: Evaluate groundedness and claims
  Eval-->>API: Scores, claims, reasoning
  API->>Gov: Check PII, toxicity, unsupported claims, score threshold
  Gov-->>API: Approved or flagged decision
  API->>Store: Save run and update analytics
  API-->>UI: Run result and analytics snapshot
  User->>UI: Submit feedback
  UI->>API: POST runId + feedback
  API->>Store: Update run feedback
  API-->>UI: Updated analytics
```

## Component Responsibilities

| Component | Responsibility |
| --- | --- |
| Prompt Studio UI | User workflow, persona selection, evidence display, evaluation display, feedback |
| API Route Handler | Request validation, workflow orchestration, response formatting |
| Retrieval Service | Find relevant knowledge documents/chunks |
| Groq Provider | Generate and evaluate via Groq when configured |
| Evaluation Engine | Score groundedness, confidence, supported/unsupported claims |
| Governance Engine | Flag low groundedness, PII, toxicity, unsupported claims |
| Analytics Service | Aggregate tests, feedback, flag rate, groundedness trend |
| Session Store | MVP persistence layer |

## Provider-Agnostic LLM Layer

The frontend never calls Groq directly.

Current provider module:

```text
src/services/groq/provider.ts
```

The provider exposes:

```ts
generateAnswer(persona, prompt, retrieved)
evaluateAnswer(prompt, response, retrieved)
```

Future providers can implement the same interface:

- OpenAI
- Anthropic
- Gemini
- Local model runtime
- Multi-model evaluator

## Deployment Architecture

```mermaid
flowchart TD
  Dev["Developer / Judge Browser"] --> Edge["Vercel Edge / CDN"]
  Edge --> App["Next.js Serverless Runtime"]
  App --> Groq["Groq API"]
  App --> Logs["Platform Logs"]

  subgraph FutureProduction["Production Additions"]
    App --> DB["PostgreSQL"]
    App --> Cache["Redis"]
    App --> Storage["Object Storage"]
    App --> Vector["Vector Search"]
    App --> SIEM["Audit Export / SIEM"]
  end
```

## Current Deployment Assumptions

- Next.js app can run locally or on Vercel.
- Environment variables provide provider credentials.
- Current MVP state is process-local.
- A single route handler orchestrates the MVP workflow.

## Production Deployment Recommendations

- Deploy frontend and route handlers on Vercel or containerized Node runtime.
- Use managed PostgreSQL for persistent state.
- Use object storage for documents and attachments.
- Use Redis for async evaluation queues and rate limiting.
- Export audit events to customer SIEM when required.
- Use secrets manager for LLM provider credentials.
- Add observability for latency, cost, errors, flags, and evaluator drift.

## Scalability Considerations

| Area | MVP | Production Direction |
| --- | --- | --- |
| Storage | In-memory | PostgreSQL |
| Retrieval | Keyword matching | Hybrid keyword + vector |
| Evaluation | Synchronous | Queue-based async for batches |
| Analytics | In-memory aggregation | SQL/materialized views |
| Providers | Groq | Multi-provider adapter |
| Governance | Deterministic rules | Policy engine + reviewer workflow |

## Failure Modes

| Failure | Handling |
| --- | --- |
| Missing `GROQ_API_KEY` | Use mock generation and heuristic evaluation |
| Empty prompt | Return HTTP 400 |
| Groq JSON parse failure during evaluation | Fall back to heuristic evaluation |
| Low groundedness | Flag for review |
| PII detected | Flag for review |

## Security Architecture

Current MVP:

- No auth
- No persistent secrets beyond environment variables
- No database
- PII detection via simple pattern matching

Production:

- SSO/SAML/OIDC
- RBAC
- Workspace-level tenant isolation
- Row-level security
- Encryption at rest and in transit
- Prompt and response redaction
- Append-only audit logs
- Provider allowlist by workspace
