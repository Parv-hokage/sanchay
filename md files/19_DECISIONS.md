# 19 — Architecture & Product Decisions
# SANCHAY

This document records important decisions and the reasoning behind them.

New decisions should be added rather than rewriting history.

---

## ADR-001 — Sanchay is a Unified Government Service Platform

**Status:** Accepted

**Decision:** Sanchay will provide one unified platform containing multiple government services rather than creating separate applications.

**Reason:** The core product value is reducing fragmentation, repeated logins, repeated data entry, and navigation friction across government services.

---

## ADR-002 — Traditional UI + AI Are Equal Interfaces

**Status:** Accepted

**Decision:** Users can interact through conventional service pages or Sanchay AI.

**Reason:** AI is an additional interaction layer, not a replacement for predictable navigation.

---

## ADR-003 — AI Must Understand Current Service Context

**Status:** Accepted

**Decision:** When AI is opened from a service page, it receives validated context such as department, service, workflow, and page.

**Reason:** This enables contextual assistance without requiring the user to repeatedly explain where they are.

---

## ADR-004 — AI Does Not Have Direct Database Access

**Status:** Accepted

**Decision:** The LLM cannot directly query PostgreSQL or generate arbitrary SQL.

**Reason:** Database access must remain behind application authorization and validation boundaries.

---

## ADR-005 — AI Does Not Have Arbitrary Government Access

**Status:** Accepted

**Decision:** AI can only invoke registered capabilities through service adapters.

**Reason:** Prevents arbitrary external requests, credential leakage, and uncontrolled government-system access.

---

## ADR-006 — Least-Privilege Citizen Data

**Status:** Accepted

**Decision:** Login does not automatically expose all citizen data to AI. Data is retrieved only when required by the current task and authorized.

**Reason:** Minimizes privacy and breach impact.

---

## ADR-007 — Sanchay UID Is Separate from Government Identifiers

**Status:** Accepted

**Decision:** Sanchay uses an opaque unique identifier rather than using Aadhaar or another government identifier as the universal Sanchay identity.

**Reason:** Not every citizen necessarily has the same government identifier, and government identifiers should not become public platform identifiers.

---

## ADR-008 — PostgreSQL + pgvector

**Status:** Accepted

**Decision:** PostgreSQL is the primary transactional database and pgvector is used for the initial vector-search implementation.

**Reason:** Keeps the MVP architecture simpler while supporting both structured data and RAG.

---

## ADR-009 — Object Storage for Large Documents

**Status:** Accepted

**Decision:** Large citizen documents are stored in private object storage, while PostgreSQL stores metadata.

**Reason:** Avoids bloating the transactional database and supports scalable file storage.

---

## ADR-010 — Modular Monolith for MVP

**Status:** Accepted

**Decision:** Start with a modular monolith plus workers rather than microservices.

**Reason:** Faster development, lower operational complexity, and clear module boundaries while preserving a path to future extraction.

---

## ADR-011 — Government Services Use Adapters

**Status:** Accepted

**Decision:** Government-specific integration logic belongs in service adapters.

**Reason:** Prevents NTA/Ayushman-specific behavior from contaminating Sanchay core architecture and makes future service addition scalable.

---

## ADR-012 — RAG Uses Authoritative Sources

**Status:** Accepted

**Decision:** Government knowledge should prioritize official sources and preserve source/version metadata.

**Reason:** Government information changes and must be traceable.

---

## ADR-013 — RAG Is Separate from Private Citizen Data

**Status:** Accepted

**Decision:** RAG is primarily used for public/authoritative knowledge. Private citizen data is retrieved through authorized backend capabilities.

**Reason:** Prevents private records from becoming a general knowledge corpus.

---

## ADR-014 — Deterministic Logic for Critical Rules

**Status:** Accepted

**Decision:** Eligibility and critical validation logic should use structured/deterministic rules where possible, with AI explaining the result.

**Reason:** Government decisions should not depend solely on probabilistic model behavior.

---

## ADR-015 — Consequential Actions Require Confirmation

**Status:** Accepted

**Decision:** Application submission, payment, important data sharing, and similar actions require appropriate user confirmation and authorization.

**Reason:** Prevents accidental or hallucinated actions.

---

## ADR-016 — AI Tool Results Must Be Verified

**Status:** Accepted

**Decision:** The system state changes only after authoritative verification of external actions.

**Reason:** An LLM saying "submitted successfully" is not proof of submission.

---

## ADR-017 — No Arbitrary URL Fetching

**Status:** Accepted

**Decision:** External fetching uses approved source registries and allowlists.

**Reason:** Prevents SSRF, malicious-source ingestion, and uncontrolled network access.

---

## ADR-018 — Security Uses Defense in Depth

**Status:** Accepted

**Decision:** Security is enforced at frontend, API, authorization, database, integration, AI, network, and infrastructure layers.

**Reason:** No single control should be trusted as the only defense.

---

## ADR-019 — AI and RAG Are Evaluated Like Software

**Status:** Accepted

**Decision:** Changes to models, prompts, retrieval, embeddings, and tools require evaluation/regression testing.

**Reason:** AI behavior can regress even when traditional software tests pass.

---

## ADR-020 — Do Not Invent Government Integrations

**Status:** Accepted

**Decision:** Sanchay will implement only officially authorized or technically available integration paths.

**Reason:** The platform cannot safely assume that an unofficial website endpoint is an approved government API.

---

## ADR-021 — Preserve Previous Known-Good Knowledge

**Status:** Accepted

**Decision:** Failed knowledge ingestion must not replace the previous valid version.

**Reason:** A temporary ingestion failure must not remove the system's last reliable government information.

---

## ADR-022 — API Is the Security Boundary

**Status:** Accepted

**Decision:** Frontend, AI, and external clients access application data through controlled backend APIs/services.

**Reason:** Centralizes authentication, authorization, validation, auditing, and business rules.

---

## ADR-023 — Adoption of Qwen3 Model Family for Contextual AI & Tool Reasoning

**Status:** Accepted

**Decision:** Sanchay adopts **Qwen3** as the initial/default LLM family for conversational reasoning, intent detection, and structured tool planning. The application connects via an `AIProvider` abstraction (`Qwen3Adapter`) with server-side credentials and local deterministic reasoning fallback. Future government deployments can transition to self-hosted Qwen3 instances without application code changes.

**Reason:** Guarantees sovereign model deployment capabilities, open-weights portability for national infrastructure, strict isolation of API credentials from the browser, and architectural decoupling from proprietary model vendor lock-in.

---

## ADR-024 — Citizen Profile Single Source of Truth & Read-Only Application Consumption

**Status:** Accepted

**Decision:** The citizen's **Sanchay Profile** (`/profile` and authenticated `MeService`) is the **SINGLE SOURCE OF TRUTH** for all personal, demographic, contact, and academic information. Government service applications (such as JEE Main, Ayushman Bharat) are **READ-ONLY consumers** of citizen profile data and must NOT provide duplicate editable fields for identity or profile credentials. AI assistants have strictly **READ-ONLY** access and must NEVER directly mutate profile or application identity fields. If personal or academic information is missing or incorrect, the citizen is directed to update their Sanchay Profile, which immediately propagates the updated data across all service applications.

**Reason:**
1. Prevents conflicting or desynchronized citizen data across multiple government forms.
2. Enforces least-privilege Zero Trust security by removing write access from conversational AI agents.
3. Simplifies application prefilling and guarantees statutory field provenance (`✓ Verified from Sanchay Profile`).
4. Makes corrections made once in the citizen's profile automatically reusable across all national government services.
5. Eliminates the dangerous pattern of users or AI modifying sovereign identity data within ad-hoc application forms.

---

## Decision Change Process

When a decision needs to change:

```text
Identify change
 ↓
Explain why
 ↓
Identify affected MD files
 ↓
Evaluate security/product impact
 ↓
Create new decision
 ↓
Update affected documents
 ↓
Implement
```

Never silently rewrite an accepted architectural decision.
