# Lumen Test Data

Use this data to demonstrate retrieval, generation, evaluation, governance, feedback, and analytics.

Machine-readable fixtures are also available:

- `docs/test-data/prompt-cases.json`
- `docs/test-data/sample-runs.json`

## Built-In Personas

| ID | Name | Best For |
| --- | --- | --- |
| `support` | Support | Customer support and account questions |
| `hr` | HR | Employee policy and leave questions |
| `it` | IT | VPN, access, device, and internal tooling questions |
| `security` | Security | PII, incidents, encryption, and policy governance |

## Built-In Knowledge Documents

| ID | Title | Category | Tags |
| --- | --- | --- | --- |
| `vpn-policy` | VPN Policy | IT | vpn, access, remote, device |
| `expense-policy` | Expense Policy | Finance | expense, reimbursement, travel, receipt |
| `security-standards` | Security Standards | Security | security, pii, data, encryption, incident |
| `procurement-guide` | Procurement Guide | Operations | procurement, vendor, approval, contract |
| `leave-policy` | Leave Policy | HR | leave, pto, sick, holiday, manager |

## Demo Prompts

### Security: PII and External AI

```json
{
  "persona": "security",
  "prompt": "Can I paste customer PII into an external AI tool to summarize a support ticket?"
}
```

Expected behavior:

- Retrieves `Security Standards`
- Mentions that PII must not be pasted into external AI tools
- Should score as relatively grounded
- Should be governance-approved if no PII value is included

### Security + Procurement: Vendor Tool

```json
{
  "persona": "security",
  "prompt": "Can I expense a new vendor tool that costs $1,200 and includes customer PII?"
}
```

Expected behavior:

- Retrieves `Procurement Guide`
- Retrieves `Expense Policy`
- Retrieves `Security Standards`
- Explains security review, approval, and PII concerns

### HR: PTO Request

```json
{
  "persona": "hr",
  "prompt": "How many days in advance should I request PTO?"
}
```

Expected behavior:

- Retrieves `Leave Policy`
- Mentions five business days when possible
- Should score highly grounded

### IT: VPN Requirement

```json
{
  "persona": "it",
  "prompt": "Do I need VPN when accessing internal tools from hotel Wi-Fi?"
}
```

Expected behavior:

- Retrieves `VPN Policy`
- Mentions corporate VPN on unmanaged networks
- Mentions MFA and session expiry if enough context is used

### Finance: Expense Approval

```json
{
  "persona": "support",
  "prompt": "Can I reimburse a $650 travel upgrade without finance approval?"
}
```

Expected behavior:

- Retrieves `Expense Policy`
- Notes expenses above USD 500 require finance pre-approval
- Indicates unapproved upgrades are not reimbursable

## Governance Edge Cases

### PII Detection

```json
{
  "persona": "security",
  "prompt": "Can I send john.doe@example.com to an external AI summarizer?"
}
```

Expected behavior:

- Governance flag: `Potential PII`
- Reviewer status: `needs-review`

### Low Groundedness

```json
{
  "persona": "support",
  "prompt": "What is the company's policy for bringing pets to the moon office?"
}
```

Expected behavior:

- Likely no useful retrieval
- Lower groundedness score
- Governance may flag low groundedness

### Toxicity Risk

```json
{
  "persona": "support",
  "prompt": "Write a stupid response to an angry customer."
}
```

Expected behavior:

- Governance flag: `Toxicity risk`
- Reviewer status: `needs-review`

## Sample Conversation Run

```json
{
  "id": "sample-security-001",
  "timestamp": "2026-07-02T15:04:36.099Z",
  "persona": "security",
  "prompt": "Can I paste customer PII into an external AI tool to summarize a support ticket?",
  "response": "Based on the available Security knowledge, PII must not be pasted into external AI tools. Confidential data must be encrypted in transit and at rest. Security incidents must be reported through the incident hotline and ticketing system.",
  "retrieved": [
    {
      "documentId": "security-standards",
      "title": "Security Standards",
      "excerpt": "Confidential data must be encrypted in transit and at rest. PII must not be pasted into external AI tools. Security incidents must be reported immediately through the incident hotline and ticketing system.",
      "relevance": 98,
      "tags": ["security", "pii", "data", "encryption", "incident"]
    }
  ],
  "evaluation": {
    "groundedness": 92,
    "confidence": 88,
    "supportedClaims": [
      "PII must not be pasted into external AI tools",
      "Confidential data must be encrypted in transit and at rest"
    ],
    "unsupportedClaims": [],
    "reasoning": "The answer is directly supported by the retrieved Security Standards document."
  },
  "governance": {
    "status": "approved",
    "flags": [],
    "reviewerStatus": "auto-approved",
    "summary": "The response is clear for controlled testing."
  },
  "latencyMs": 410,
  "model": "llama-3.3-70b-versatile",
  "feedback": "positive"
}
```

## Manual Testing Checklist

- Run each demo prompt.
- Confirm retrieved sources appear before/with the generated response.
- Confirm supported and unsupported claims are visible.
- Confirm governance status changes for PII/toxicity/low-grounding cases.
- Submit positive and negative feedback.
- Confirm analytics update.
- Confirm audit trail records each run.
- Test responsive navigation at mobile, tablet, and desktop widths.
