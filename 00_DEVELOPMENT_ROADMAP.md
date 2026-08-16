# 00 — SANCHAY DEVELOPMENT ROADMAP

# SANCHAY — Unified Government Digital Service Platform

**Document:** Master Development Roadmap  
**Status:** Active  
**Purpose:** Define the permanent development sequence of Sanchay and the purpose, dependencies, and exit criteria of every major development phase.

---

# 1. Purpose

This document defines **where the Sanchay project is going**.

It is the master roadmap for the development phases.

It does NOT replace:

- `00_CURRENT_STATE.md` — what actually exists now.
- The numbered product/architecture MD files — what the system is supposed to be.
- Individual phase MD files — what must be implemented in a specific phase.
- `18_TASKS.md` — what is currently being worked on.

---

# 2. Development Documentation Hierarchy

```text
00_DEVELOPMENT_ROADMAP.md
        │
        ├── Defines the overall development sequence
        │
        ↓
phase/
        │
        ├── PHASE_01_IDENTITY.md
        ├── PHASE_02_SERVICE_PLATFORM.md
        ├── PHASE_03_APPLICATION_ENGINE.md
        ├── PHASE_04_DOCUMENT_PLATFORM.md
        ├── PHASE_05_RAG_KNOWLEDGE.md
        ├── PHASE_06_AI_ORCHESTRATOR.md
        ├── PHASE_07_JEE_NTA.md
        ├── PHASE_08_AYUSHMAN.md
        ├── PHASE_09_SECURITY_HARDENING.md
        ├── PHASE_10_PRODUCTION.md
        └── PHASE_11_EXPANSION.md
        │
        ↓
00_CURRENT_STATE.md
        │
        ↓
18_TASKS.md
        │
        ↓
Implementation
        │
        ↓
Testing
        │
        ↓
Current State Update
```

---

# 3. Current Development Status

```text
PHASE 0 — FOUNDATION                  ✅ COMPLETE
PHASE 1 — IDENTITY                    ✅ COMPLETE
PHASE 2 — SERVICE PLATFORM            ✅ COMPLETE
PHASE 3 — APPLICATION ENGINE          ✅ COMPLETE
PHASE 4 — DOCUMENT PLATFORM           ✅ COMPLETE
PHASE 5 — RAG / KNOWLEDGE             ✅ COMPLETE
PHASE 6 — AI ORCHESTRATOR             ✅ COMPLETE
PHASE 7 — JEE / NTA                   ✅ COMPLETE
PHASE 8 — AYUSHMAN BHARAT              🟡 NEXT
PHASE 9 — SECURITY HARDENING          ⏳ PLANNED
PHASE 10 — PRODUCTION                 ⏳ PLANNED
PHASE 11 — EXPANSION                  ⏳ PLANNED
```

**Important:** This status must always be synchronized with `00_CURRENT_STATE.md`.

Do not mark a phase complete unless its phase exit criteria have actually passed.

---

# 4. Phase Development Philosophy

Sanchay is not being developed as:

```text
JEE website
+
Ayushman website
+
AI chatbot
```

It is being developed as:

```text
                SANCHAY
                   │
          ┌────────┴────────┐
          ↓                 ↓
   Government Service    Citizen Identity
       Platform              │
          │                  │
          └────────┬─────────┘
                   ↓
            Application Engine
                   ↓
             Document Platform
                   ↓
             Knowledge / RAG
                   ↓
             AI Orchestrator
                   ↓
       Government Integrations
                   ↓
        More Government Services
```

The architecture must remain reusable as the number of government services grows.

---

# 5. PHASE 0 — FOUNDATION

**Status:** Complete

## Objective

Establish the technical foundation required to build Sanchay.

## Major Deliverables

- Monorepo
- Workspace configuration
- Shared packages
- PostgreSQL
- pgvector infrastructure
- Redis infrastructure
- Prisma
- NestJS API
- Next.js frontend
- Basic design system
- API foundation
- Security headers
- Configuration validation
- CI
- Test foundation
- Current-state tracking

## Exit Condition

The repository can reliably support application development.

---

# 6. PHASE 1 — IDENTITY & CITIZEN FOUNDATION

**Status:** Complete

**Specification:**

```text
phase/PHASE_01_IDENTITY.md
```

## Objective

Establish the secure citizen identity and ownership layer.

## Major Deliverables

- Authentication
- Sessions
- Sanchay UID
- Citizen profile
- Address/contact management
- Identity links
- Consent
- Ownership authorization
- IDOR/BOLA protection
- Audit events
- Identity security tests

## Exit Condition

Sanchay can reliably answer:

> Who is this citizen, and what is this citizen authorized to access?

---

# 7. PHASE 2 — GOVERNMENT SERVICE PLATFORM

**Status:** Complete

**Specification:**

```text
phase/PHASE_02_SERVICE_PLATFORM.md
```

## Objective

Build the reusable government-service registry and the first real Sanchay product experience.

## Major Deliverables

- Departments
- Organizations
- Government services
- Service capabilities
- Capability requirements
- Service integrations/adapters
- Service discovery
- Dynamic service pages
- Department navigation
- Seeded demo services
- Local Sanchay UI
- JEE Main demo service
- Ayushman Bharat demo service

## Exit Condition

A new government service can be added through the service-platform architecture without redesigning Sanchay's core.

---

# 8. PHASE 3 — APPLICATION ENGINE

**Status:** Next

**Specification:**

```text
phase/PHASE_03_APPLICATION_ENGINE.md
```

## Objective

Turn service capabilities into secure, dynamic application workflows.

## Major Deliverables

- Application state machine
- Dynamic forms
- Capability-driven requirements
- Application fields
- Deterministic field mapping
- Citizen-data auto-fill
- Consent-aware data retrieval
- Missing-data handling
- Conflict handling
- User editing
- Draft applications
- Validation
- Review
- Explicit confirmation
- Application events
- Mock submission boundary
- Application UI
- Security and ownership testing

## Core Flow

```text
Service
 ↓
Capability
 ↓
Requirements
 ↓
Application
 ↓
Dynamic Form
 ↓
Consent
 ↓
Auto-Fill
 ↓
Validation
 ↓
Review
 ↓
Confirmation
 ↓
Mock / Adapter Submission
```

## Exit Condition

A citizen can complete a dynamic application locally using authorized Sanchay data, review it, and explicitly confirm it without AI bypassing the security boundary.

---

# 9. PHASE 4 — PRIVATE DOCUMENT PLATFORM

**Status:** Planned

**Specification:**

```text
phase/PHASE_04_DOCUMENT_PLATFORM.md
```

## Objective

Build the secure private document infrastructure required by government applications.

## Major Deliverables

- Secure document upload
- Object storage
- Document metadata
- Private access control
- Document versions
- Malware scanning
- File validation
- Document processing
- Retention rules
- Document deletion
- Document access auditing
- Secure document retrieval

## Core Flow

```text
Citizen
 ↓
Upload
 ↓
Validation
 ↓
Malware Scan
 ↓
Private Object Storage
 ↓
Metadata
 ↓
Authorized Access
```

## Exit Condition

Citizen documents can be securely stored, accessed only by authorized parties, processed safely, and governed by retention policies.

---

# 10. PHASE 5 — RAG / KNOWLEDGE PLATFORM

**Status:** Planned

**Specification:**

```text
phase/PHASE_05_RAG_KNOWLEDGE.md
```

## Objective

Build the authoritative government-information knowledge layer.

## Major Deliverables

- Official source registry
- Source allowlisting
- Source ingestion
- HTML/PDF processing
- Document versioning
- Semantic chunking
- Embeddings
- pgvector storage
- Hybrid search
- Metadata filtering
- Reranking
- Citation generation
- Source freshness
- Knowledge version tracking
- Retrieval evaluation
- Source-poisoning protections

## Core Flow

```text
Official Government Source
        ↓
Source Registry
        ↓
Ingestion
        ↓
Parsing
        ↓
Chunking
        ↓
Embeddings
        ↓
pgvector
        ↓
Hybrid Retrieval
        ↓
Reranking
        ↓
Citations
```

## Exit Condition

Sanchay can retrieve authoritative, source-cited government information without treating retrieved content as executable instructions.

---

# 11. PHASE 6 — AI ORCHESTRATOR

**Status:** Planned

**Specification:**

```text
phase/PHASE_06_AI_ORCHESTRATOR.md
```

## Objective

Introduce the contextual AI layer that can understand the citizen's intent and interact with the Sanchay platform safely.

## Major Deliverables

- Intent detection
- Context builder
- Service context
- Citizen context
- Capability resolver
- Provider-agnostic LLM interface
- Tool registry
- Tool authorization
- AI conversation management
- Contextual AI widget
- Source citations
- Action cards
- Confirmation flows
- AI evaluation
- Prompt/instruction security
- AI audit events

## Core Flow

```text
Citizen
 ↓
AI
 ↓
Intent
 ↓
Context
 ↓
Capability Resolver
 ↓
Authorized Tool
 ↓
Backend Validation
 ↓
Confirmation if consequential
 ↓
Action
```

## Critical Rule

The AI is an interface and reasoning layer.

It is NOT the authorization layer.

## Exit Condition

AI can assist citizens and invoke only explicitly authorized Sanchay capabilities while respecting privacy, consent, authorization, and confirmation requirements.

---

# 12. PHASE 7 — JEE / NTA

**Status:** Planned

**Specification:**

```text
phase/PHASE_07_JEE_NTA.md
```

## Objective

Connect the Sanchay platform to authorized NTA/JEE services.

## Potential Capabilities

- JEE information
- Eligibility
- Registration
- Application workflow
- Application status
- Exam information
- Answer-key information
- Results
- Supported citizen actions

## Architecture

```text
Sanchay
 ↓
JEE Capability
 ↓
JEE Adapter
 ↓
Authorized NTA Integration
```

## Important

Only officially authorized/available integrations may be used.

Do not:

- Bypass CAPTCHA.
- Circumvent authentication.
- Scrape protected systems.
- Reverse-engineer private APIs.
- Store government credentials improperly.

## Exit Condition

Supported JEE capabilities work through verified, authorized integration boundaries and are correctly represented in Sanchay.

---

# 13. PHASE 8 — AYUSHMAN BHARAT

**Status:** Planned

**Specification:**

```text
phase/PHASE_08_AYUSHMAN.md
```

## Objective

Connect Sanchay to authorized Ayushman Bharat services.

## Potential Capabilities

- Scheme information
- Eligibility
- Beneficiary services
- Status
- Supported documents
- Supported citizen actions

## Architecture

```text
Sanchay
 ↓
Ayushman Capability
 ↓
Ayushman Adapter
 ↓
Authorized Government Integration
```

## Important

Do not assume an integration exists merely because a public website exists.

Use only authorized mechanisms.

## Exit Condition

Supported Ayushman capabilities work through verified authorized integration boundaries.

---

# 14. PHASE 9 — SECURITY HARDENING

**Status:** Planned

## Objective

Perform a dedicated security hardening cycle after the core platform and integrations exist.

## Major Areas

- Threat modeling
- Authentication testing
- Authorization testing
- IDOR/BOLA testing
- SSRF testing
- RAG poisoning tests
- Prompt-injection testing
- AI red teaming
- Tool-authorization testing
- File-security testing
- Malware testing
- Secrets management
- Privacy review
- Audit review
- Dependency security
- Penetration testing
- Rate-limit testing
- Abuse testing

## Exit Condition

Security-critical findings are resolved or formally accepted with documented risk decisions.

---

# 15. PHASE 10 — PRODUCTION

**Status:** Planned

## Objective

Make Sanchay production-ready and scalable.

## Major Deliverables

- Staging environment
- Production environment
- CI/CD
- Production database
- Database migrations
- Backups
- Disaster recovery
- Object storage
- Monitoring
- Logging
- Alerting
- Error tracking
- Performance monitoring
- Autoscaling
- Health checks
- Deployment rollback
- Operational runbooks

## Exit Condition

Sanchay can be deployed, monitored, backed up, recovered, and scaled using documented production procedures.

---

# 16. PHASE 11 — EXPANSION

**Status:** Planned

## Objective

Expand Sanchay from the initial JEE and Ayushman services into a broad government-service platform.

## Potential Expansion

- Additional departments
- Additional government organizations
- Additional services
- Additional adapters
- More application workflows
- More document workflows
- Multilingual support
- Voice interaction
- Advanced recommendations
- Advanced AI assistance
- Accessibility expansion
- Citizen feedback loops
- Service analytics
- More automation

## Core Principle

Every new service should reuse the existing:

```text
Identity
Service Registry
Capability System
Application Engine
Document Platform
RAG
AI Orchestrator
Adapter Architecture
```

Do not create a separate architecture for every government service.

---

# 17. Phase Dependency Graph

```text
PHASE 0
Foundation
   │
   ↓
PHASE 1
Identity
   │
   ↓
PHASE 2
Service Platform
   │
   ↓
PHASE 3
Application Engine
   │
   ├───────────────┐
   ↓               ↓
PHASE 4          PHASE 5
Documents        RAG
   │               │
   └───────┬───────┘
           ↓
       PHASE 6
   AI Orchestrator
           │
      ┌────┴────┐
      ↓         ↓
   PHASE 7   PHASE 8
     JEE     Ayushman
      │         │
      └────┬────┘
           ↓
       PHASE 9
Security Hardening
           ↓
       PHASE 10
Production
           ↓
       PHASE 11
Expansion
```

Some phases may have implementation overlap where dependencies permit it, but a phase must not be declared complete until its own exit criteria pass.

---

# 18. Phase Execution Rules

Every phase follows:

```text
READ CURRENT STATE
        ↓
READ ROADMAP
        ↓
READ PHASE MD
        ↓
READ RELEVANT SOURCE-OF-TRUTH MDs
        ↓
INSPECT ACTUAL CODE
        ↓
PLAN
        ↓
IMPLEMENT
        ↓
TEST
        ↓
SECURITY VALIDATION
        ↓
LOCAL / STAGING VERIFICATION
        ↓
UPDATE CURRENT STATE
        ↓
UPDATE TASKS
        ↓
UPDATE CHANGELOG
        ↓
PHASE EXIT GATE
```

---

# 19. Phase Completion Rule

A phase is complete only when:

```text
Implementation
      +
Testing
      +
Security
      +
Acceptance Criteria
      +
Documentation
      +
Current State
      +
Exit Criteria
```

all pass.

Do not declare completion because the code merely compiles.

---

# 20. AI Coding Agent Rules

Every AI coding agent must:

1. Read `00_DEVELOPMENT_ROADMAP.md`.
2. Read `00_CURRENT_STATE.md`.
3. Read the active phase MD.
4. Read relevant source-of-truth documentation.
5. Inspect the actual repository.
6. Reuse existing architecture.
7. Avoid inventing requirements.
8. Avoid silently changing architecture.
9. Flag conflicts.
10. Test its implementation.
11. Update documentation.
12. Update current state.
13. Stop at the phase boundary unless explicitly instructed otherwise.

---

# 21. Current State vs Roadmap

These documents have different purposes.

```text
00_DEVELOPMENT_ROADMAP.md
"What are we building and in what order?"

00_CURRENT_STATE.md
"What actually exists right now?"

18_TASKS.md
"What are we working on next?"

phase/PHASE_X.md
"What exactly must this phase accomplish?"
```

Never use the roadmap to claim that a feature is already implemented.

Never use `CURRENT_STATE.md` as a substitute for the phase specification.

---

# 22. Roadmap Change Policy

The roadmap may evolve as Sanchay develops.

A phase may be:

- Added
- Removed
- Split
- Merged
- Reordered

only when there is a documented reason.

Meaningful roadmap changes should be recorded in:

```text
19_DECISIONS.md
17_CHANGELOG.md
```

and the affected phase documentation must be updated.

---

# 23. Long-Term Product Direction

The final Sanchay vision is:

```text
                    SANCHAY
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
     Education     Healthcare    Finance
          │            │            │
       Services     Services     Services
          │            │            │
          └────────────┼────────────┘
                       ↓
               Unified Identity
                       ↓
               Citizen Profile
                       ↓
              Consent + Security
                       ↓
              Application Engine
                       ↓
               Document Platform
                       ↓
                 RAG Knowledge
                       ↓
                AI Orchestrator
                       ↓
              Authorized Actions
                       ↓
             Government Systems
```

The citizen should experience this as **one coherent government platform**, not a collection of disconnected government websites.

---

# 24. Master Roadmap Rule

> **Build the platform once, integrate government services through reusable capabilities and adapters, and never allow a new government service to require rebuilding Sanchay's core.**
