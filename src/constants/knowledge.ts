import type { KnowledgeDocument } from "@/types/lumen";

export const knowledgeDocuments: KnowledgeDocument[] = [
  {
    id: "vpn-policy",
    title: "VPN Policy",
    category: "IT",
    tags: ["vpn", "access", "remote", "device"],
    body:
      "Employees must use the corporate VPN when accessing internal tools from an unmanaged network. VPN sessions require MFA and expire after 12 hours. Lost device access must be reported to IT within one hour.",
  },
  {
    id: "expense-policy",
    title: "Expense Policy",
    category: "Finance",
    tags: ["expense", "reimbursement", "travel", "receipt"],
    body:
      "Reimbursements require an itemized receipt and manager approval. Expenses above USD 500 require finance pre-approval. Alcohol, personal subscriptions, and unapproved upgrades are not reimbursable.",
  },
  {
    id: "security-standards",
    title: "Security Standards",
    category: "Security",
    tags: ["security", "pii", "data", "encryption", "incident"],
    body:
      "Confidential data must be encrypted in transit and at rest. PII must not be pasted into external AI tools. Security incidents must be reported immediately through the incident hotline and ticketing system.",
  },
  {
    id: "procurement-guide",
    title: "Procurement Guide",
    category: "Operations",
    tags: ["procurement", "vendor", "approval", "contract"],
    body:
      "New vendor purchases require security review, budget owner approval, and procurement intake. Contracts above USD 25,000 require legal review before signature.",
  },
  {
    id: "leave-policy",
    title: "Leave Policy",
    category: "HR",
    tags: ["leave", "pto", "sick", "holiday", "manager"],
    body:
      "Employees request PTO in the HR portal at least five business days in advance when possible. Sick leave can be submitted after the absence. Managers approve leave based on team coverage.",
  },
];
