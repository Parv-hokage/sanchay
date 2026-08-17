# SANCHAY — Current Project State

## Project Status

- **Current Phase:** Phase 7 — JEE Service Recreation & AI Integration (Completed with Contextual Application Action Resolution) → Ready for Phase 8 (Ayushman Bharat PM-JAY Service Platform Integration)
- **Current Version:** 0.8.2
- **Overall Completion:** 94% (Foundation, Identity & Sanchay UID, Government Service Platform, Dynamic Application Wizard, State Machine, Deterministic Auto-Fill, Private Sovereign Document Vault, Source-Grounded Hybrid RAG Retrieval Engine, Contextual AI Orchestrator with Qwen3 Reasoning, Authentic JEE Main Service Portal, Traditional Navigation, Screen-Aware AI Layer, Contextual Application Action Resolution with Sanchay Profile Single Source of Truth, and Mock/Sandbox Integration operational)
- **Last Updated:** 2026-08-17T01:54:00+05:30

---

## Product Summary

Sanchay (संचय) is a unified citizen-facing government digital-service platform designed to eliminate fragmentation across government services. It provides a standardized department/service hierarchy, dual-mode access (traditional navigation and context-aware conversational AI powered by Qwen3 reasoning), unified citizen identity (Sanchay UID), private sovereign document vault with file signature & antivirus verification, deterministic form auto-filling with explicit citizen consent, transparent review & confirmation, RAG-grounded official government knowledge with verifiable citations, SSRF guardrails, authentic service portal recreation for critical national services (JEE Main), and an extensible service adapter architecture with NTA/JEE Main and Ayushman Bharat as initial demonstration services.

---

## Documentation Status

| Document | File Name | Status | Purpose / Description |
|---|---|---|---|
| 00 | `00_CURRENT_STATE.md` | Complete | Current operational snapshot and implementation reality |
| 00 | `00_DEVELOPMENT_ROADMAP.md` | Complete | Master development roadmap and phase dependencies |
| 01 | `md files/01_PRD(2).md` | Complete | Product vision, service capability model, MVP scope |
| 02 | `md files/02_USER_STORIES(2).md` | Complete | Citizen, operator, and administrator user stories |
| 03 | `md files/03_REQUIREMENTS(2).md` | Complete | Functional & non-functional requirements |
| 04 | `md files/04_DESIGN(1).md` | Complete | UI/UX design specifications, tokens, and components |
| 05 | `md files/05_USER_FLOWS.md` | Complete | Step-by-step user journeys and state transitions |
| 06 | `md files/06_TECH_STACK.md` | Complete | Technology stack standards, frameworks, and tooling |
| 07 | `md files/07_ARCHITECTURE.md` | Complete | System architecture, data flow, and least-privilege model |
| 08 | `md files/08_DATABASE.md` | Complete | Database schema design, models, and domain relationships |
| 09 | `md files/09_API.md` | Complete | REST API contracts, endpoints, and error standards |
| 10 | `md files/10_AI_RAG.md` | Complete | AI orchestrator, RAG pipeline, tool execution, and guardrails |
| 11 | `md files/11_SECURITY.md` | Complete | Zero Trust security architecture, authorization, and audit rules |
| 12 | `md files/12_IMPLEMENTATION.md` | Complete | 10-phase development plan and blueprints |
| 13 | `md files/13_TESTING.md` | Complete | Testing strategy (unit, integration, E2E, AI evaluation) |
| 14 | `md files/14_DEPLOYMENT.md` | Complete | Deployment, staging, production, and CI/CD criteria |
| 15 | `md files/15_MONITORING.md` | Complete | Observability, metrics, OpenTelemetry, and structured logging |
| 16 | `md files/16_DOCUMENTATION.md` | Complete | Documentation management & synchronization guidelines |
| 17 | `md files/17_CHANGELOG.md` | Complete | Chronological changelog tracking |
| 18 | `md files/18_TASKS.md` | Complete | Prioritized task backlog across all phases |
| 19 | `md files/19_DECISIONS.md` | Complete | Architectural Decision Records (ADR-001 to ADR-023) |
| Phase 1 | `phase/PHASE_01_IDENTITY.md` | Complete | Phase 1 implementation specification |
| Phase 2 | `phase/PHASE_02_SERVICE_PLATFORM.md` | Complete | Phase 2 implementation specification |
| Phase 3 | `phase/PHASE_03_APPLICATION_ENGINE.md` | Complete | Phase 3 implementation specification |
| Phase 4 | `phase/PHASE_04_DOCUMENT_PLATFORM.md` | Complete | Phase 4 implementation specification |
| Phase 5 | `phase/PHASE_05_RAG_KNOWLEDGE.md` | Complete | Phase 5 implementation specification |
| Phase 6 | `phase/PHASE_06_AI_ORCHESTRATOR.md` | Complete | Phase 6 implementation specification |
| Phase 7 | `phase/PHASE_07_NTA_JEE_INTEGRATION.md` | Complete | Phase 7 implementation specification |

---

## Repository State

- **Repository Structure:**
  ```text
  sanchay/
  ├── apps/
  │   ├── api/                 # NestJS 10 REST API (Auth, Me, Catalog, Application, Document, Storage, Knowledge, AI, Audit, Health)
  │   └── web/                 # Next.js 15 Web App (JEE Main Portal, AI Workspace Drawer, Knowledge Explorer, Vault, Wizard, Dashboard)
  ├── packages/
  │   ├── types/               # @sanchay/types domain interfaces & DTOs
  │   ├── config/              # @sanchay/config Zod env validator
  │   ├── validation/          # @sanchay/validation input validators
  │   └── shared/              # @sanchay/shared envelopes & error codes
  ├── workers/
  │   ├── document-processing/ # @sanchay/worker-document-processing (malware scanner & file integrity worker)
  │   ├── knowledge-ingestion/ # @sanchay/worker-knowledge-ingestion (SSRF, parser, semantic chunker, embeddings)
  │   └── scheduled-jobs/      # @sanchay/worker-scheduled-jobs (stub only)
  ├── prisma/
  │   ├── schema.prisma        # Complete PostgreSQL schema (28 models defined)
  │   └── seed.ts              # Deterministic database seeder for demo catalog and official sources
  ├── infrastructure/
  │   └── docker-compose.yml   # PostgreSQL (pgvector) & Redis local dev config
  ├── .github/
  │   └── workflows/ci.yml     # GitHub Actions CI workflow
  ├── phase/                   # Phase specifications
  └── md files/                # 19 specification documents
  ```
- **Applications:**
  - `apps/api`: Operational NestJS modules: `PrismaModule`, `AuditModule`, `AuthModule`, `MeModule`, `CatalogModule`, `ApplicationModule`, `StorageModule`, `DocumentModule`, `KnowledgeModule`, `AiModule`, `HealthModule`.
  - `apps/web`: Operational Next.js components & pages: Home (`/`), Departments Directory (`/departments`), Department Detail (`/departments/[slug]`), Dedicated JEE Main Portal (`/services/jee-main`), Generic Service Detail (`/services/[slug]`), Application Wizard (`/applications/new`, `/applications/[id]`), Applications Dashboard (`/applications`), Document Vault (`/documents`), Official Knowledge Explorer (`/knowledge`), Profile Hub (`/profile`), AI Workspace Drawer (`AIWorkspaceDrawer`), Floating AI Trigger (`AIButton`).
- **Database:**
  - `prisma/schema.prisma`: 28 models defined; Prisma Client v6.19.3 generated.
  - Active models: `AiConversation`, `AiMessage`, `AiToolExecution`, `KnowledgeSource`, `KnowledgeDocument`, `KnowledgeChunk`, `CitizenDocument`, `DocumentVersion`, `DocumentAccessLog`, `Application`, `ApplicationField`, `ApplicationEvent`, `Department`, `Organization`, `GovernmentService`, `ServiceCapability`, `ServiceCapabilityRequirement`, `ServiceIntegration`, `User`, `AuthSession`, `Profile`, `Address`, `ContactMethod`, `IdentityLink`, `Consent`, `AuditEvent`.

---

## Implemented

- [x] Repository monorepo initialized (`pnpm` workspaces)
- [x] Shared domain types package (`@sanchay/types`)
- [x] Environment configuration validation with Zod (`@sanchay/config`)
- [x] Reusable validation schemas (`@sanchay/validation`)
- [x] Standard API envelopes and error codes (`@sanchay/shared`)
- [x] Complete Prisma schema for PostgreSQL (`prisma/schema.prisma` — 28 models)
- [x] Prisma Client generation (v6.19.3)
- [x] Database seeder script (`prisma/seed.ts`) populating demo catalog & knowledge sources
- [x] NestJS API bootstrap with Helmet, CORS, Request-ID, Error Filter, and Transform Interceptor
- [x] Health check endpoint (`GET /api/v1/health`)
- [x] OpenAPI / Swagger documentation (`GET /docs`)
- [x] Passwordless / OTP / Mock IDP authentication endpoints (`POST /api/v1/auth/login`, `POST /api/v1/auth/verify`)
- [x] Server-side session management and revocation (`POST /api/v1/auth/logout`, `GET /api/v1/auth/session`)
- [x] Stable, opaque Sanchay UID generation (UUID v4) decoupled from Aadhaar/phone/email
- [x] Citizen profile endpoints (`GET /api/v1/me/profile`, `PATCH /api/v1/me/profile`)
- [x] Address book CRUD with primary address toggling (`GET / POST / PATCH / DELETE /api/v1/me/addresses`)
- [x] Contact methods management (`GET / POST /api/v1/me/contacts`)
- [x] Identity provider links with reference masking (`GET / POST / DELETE /api/v1/me/identity-links`)
- [x] Purpose-specific data consents with one-click revocation (`GET / POST / PATCH /api/v1/me/consents`)
- [x] Persistent audit logging service (`AuditService`) storing sanitized events in `AuditEvent` table
- [x] Department catalog endpoints (`GET /api/v1/departments`, `GET /api/v1/departments/:idOrSlug`)
- [x] Organization catalog endpoints (`GET /api/v1/organizations`, `GET /api/v1/organizations/:idOrSlug`)
- [x] Service catalog & search endpoints (`GET /api/v1/services`, `GET /api/v1/services/recommendations`, `GET /api/v1/services/:idOrSlug`)
- [x] Service capabilities & requirement endpoints (`GET /api/v1/services/:idOrSlug/capabilities`, `GET /api/v1/services/:idOrSlug/capabilities/:capIdOrSlug`)
- [x] Application state machine enforcing valid transitions (`DRAFT` → `IN_PROGRESS` → `READY_FOR_REVIEW` → `SUBMITTING` → `SUBMITTED`)
- [x] Application creation & dynamic field generation from capability requirements (`POST /api/v1/applications`)
- [x] Deterministic auto-fill engine mapping citizen profile, addresses, and contacts (`POST /api/v1/applications/:id/autofill`)
- [x] User edit protection and field updating (`PATCH /api/v1/applications/:id/fields`)
- [x] Application review aggregation API (`GET /api/v1/applications/:id/review`)
- [x] Explicit citizen confirmation lock (`POST /api/v1/applications/:id/confirm`)
- [x] Idempotent mock submission adapter generating reference codes (`POST /api/v1/applications/:id/submit`)
- [x] Application event timeline (`GET /api/v1/applications/:id/events`) and status lookup (`GET /api/v1/applications/:id/status`)
- [x] Private object storage provider (`StorageService`) with safe storage key generation (`documents/<userId>/<docId>/<version>`)
- [x] Magic bytes / file signature validator blocking MIME and extension spoofing
- [x] Asynchronous malware scanning worker (`@sanchay/worker-document-processing`) with EICAR detection and quarantine
- [x] Document upload with version creation (`POST /api/v1/documents/upload`)
- [x] Document listing & metadata endpoints (`GET /api/v1/documents`, `GET /api/v1/documents/:id`)
- [x] Authorized document binary streaming with scan safeguards (`GET /api/v1/documents/:id/download`)
- [x] Document soft delete (`DELETE /api/v1/documents/:id`) and access logs (`GET /api/v1/documents/:id/logs`)
- [x] Document Vault Dashboard (`/documents`), Upload Modal (`DocumentUploadModal`), and Detail Drawer (`DocumentDetailModal`)
- [x] Official Government Source Registry & Freshness Tracking (`KnowledgeSource`)
- [x] Strict SSRF & Domain Allowlist Protection blocking loopback, private IP subnets, and cloud metadata (`validateSafeGovernmentUrl`)
- [x] Source Poisoning Defenses (retrieved content is untrusted evidence data, never executed)
- [x] HTML & Document Parser extracting structured headings and sections (`parseHtmlContent`)
- [x] Semantic Chunker preserving heading hierarchy and page citations (`semanticChunk`)
- [x] Dense vector embedding generator & cosine similarity calculator (`generateDeterministicEmbedding`, `computeCosineSimilarity`)
- [x] Hybrid RAG Retrieval Engine combining lexical keyword matching with vector cosine similarity and Reciprocal Rank Fusion
- [x] Structured Citation Builder attaching source titles, URLs, section names, and page numbers
- [x] AI Provider Abstraction (`AIProvider`) and Qwen3 Adapter (`Qwen3Adapter`) with local deterministic reasoning fallback
- [x] Architectural Decision Record (`ADR-023`) adopting Qwen3 as default model family
- [x] Context Builder (`ContextBuilderService`) constructing least-privilege task-scoped prompts with screen-awareness (`section`, `activeItem`, `route`)
- [x] Intent Detection (`IntentDetectionService`) classifying structured intents including navigation (`NAVIGATE_SERVICE`, `KNOWLEDGE_QUERY`, `START_APPLICATION`)
- [x] Capability Resolver (`CapabilityResolverService`) mapping user intent to registered service actions and navigation cards
- [x] Tool Registry & Authorization Engine (`ToolRegistryService`) with risk classification and JEE tools (`jee.open_section`, `jee.check_eligibility`)
- [x] Consequential Action Confirmation state machine with anti-replay protection (`POST /api/v1/ai/conversations/:id/confirm`)
- [x] AI Chat API (`POST /api/v1/ai/chat`) and conversation history endpoints (`GET /api/v1/ai/conversations`)
- [x] Dedicated Authentic JEE Main Service Portal (`/services/jee-main`) with 6 traditional tabs (Overview, Information Bulletin, Syllabus, Public Notices, Question Papers, Candidate FAQs, and Candidate Services)
- [x] Screen-Aware Contextual AI Integration passing active tab and active document context to `AIButton`
- [x] Sandbox simulation badges and mock adapter boundary
- [x] Automated test suite (76/76 tests passing across all packages, workers, and API)
- [ ] Phase 8: Ayushman Bharat PM-JAY Service Platform Integration

---

## Current Architecture

1. **Recreated JEE Main Portal Layer (`apps/web/src/app/services/jee-main/page.tsx`):** Authentic, candidate-facing government examination portal under `Ministry of Education → National Testing Agency (NTA) → JEE (Main) 2026`. Offers traditional browsing across Information Bulletin, Syllabus (Physics, Chemistry, Math), Public Notices with category filters, Question Papers & Final Answer Keys (2024 & 2025), FAQs, and Sandbox-labelled Candidate Services with one-click application launch.
2. **Screen-Aware Contextual AI Orchestrator (`apps/api/src/ai` & `apps/web/src/components/ai`):** Global floating circular trigger (`◯ AI`) dynamically captures the active service tab, active notice/syllabus item, and portal route. Sanchay AI answers questions grounded in indexed official JEE bulletins with verifiable citations and dispatches registered navigation action cards (`jee.open_section`, `jee.check_eligibility`).
3. **Knowledge & RAG Layer (`apps/api/src/knowledge` & `workers/knowledge-ingestion`):** Authoritative government source registry, strict SSRF domain allowlisting, semantic chunking, dense vector embeddings, hybrid lexical/vector search, and verifiable citation generation.
4. **Document Storage & Vault Layer (`apps/api/src/document` & `apps/api/src/storage`):** Isolated private object storage outside PostgreSQL, magic bytes signature inspection, opaque storage keys (`documents/<userId>/<docId>/<version>`), and asynchronous antivirus scanning (`PENDING_SCAN` → `VERIFIED` / `QUARANTINED`).
5. **Application Engine Layer (`apps/api/src/application`):** Service-agnostic processing engine driving dynamic form generation from registered capability requirements, server-side state transitions, and deterministic auto-filling.
6. **Catalog & Registry Layer (`apps/api/src/catalog`):** Thin NestJS controllers providing cached-safe query endpoints for Departments, Organizations, Services, Capabilities, and Requirements from PostgreSQL.
7. **Identity & Ownership Layer (`apps/api/src/auth` & `apps/api/src/me`):** Authenticated citizen context strictly derived from validated token (`req.user`), server-side ownership checks on all user applications, documents, and profile data.

---

## Security Status

- **IMPLEMENTED:**
  - Zero-Trust AI Boundary: Zero direct SQL/database access and zero direct S3/storage access for Qwen3; all actions go through registered tools with server-side authorization.
  - Least-Privilege Prompt Context: Only task-required fields and active screen metadata are assembled into prompt context; whole profiles or document vaults are never sent.
  - Strict Privacy Boundary: Public JEE inquiries (e.g. syllabus, answer key, notices) use only public knowledge and never retrieve private citizen vault documents.
  - Explicit Sandbox Indicators: Any simulated candidate action or score lookup is clearly labelled **"SANDBOX / DEVELOPMENT SIMULATION"**; no real NTA submission is claimed or attempted.
  - High-Risk Action Confirmation Gate: Consequential submissions require explicit citizen confirmation with anti-replay protection.
  - Prompt Injection Defenses: User messages, retrieved evidence, and tool outputs are treated strictly as untrusted data.
  - Strict SSRF & Domain Allowlist Protection: Blocks private IPs, loopback, cloud metadata endpoints (`169.254.169.254`), and unallowed external domains.
  - Server-side ownership authorization on all documents and applications.
  - Magic bytes file signature verification blocking MIME spoofing.
  - Persistent sanitized audit logging (`AuditService`).

---

## Testing Status

- **Unit & Security Tests:** **95 tests across 18 test suites — ALL PASSING (100%)**.
  - `packages/config` (2 tests)
  - `packages/validation` (12 tests — including Gender and Category enum validation & normalization)
  - `packages/shared` (1 test)
  - `apps/api/src/health` (2 tests)
  - `apps/api/src/auth` (7 tests)
  - `apps/api/src/me` (MeService profile & addresses) (5 tests)
  - `apps/api/src/me` (Ownership IDOR) (5 tests)
  - `apps/api/src/me` (Category, Gender & Profile Data Flow) (7 tests)
  - `apps/api/src/audit` (1 test)
  - `apps/api/src/catalog` (5 tests)
  - `apps/api/src/catalog` (Public Safety) (1 test)
  - `apps/api/src/application` (5 tests)
  - `apps/api/src/application` (Ownership & IDOR) (5 tests)
  - `apps/api/src/document` (4 tests)
  - `apps/api/src/document` (Ownership & Security IDOR) (4 tests)
  - `apps/api/src/knowledge` (5 tests)
  - `apps/api/src/knowledge` (SSRF & Domain Security) (6 tests)
  - `apps/api/src/ai` (Orchestrator & Intent Resolution) (3 tests)
  - `apps/api/src/ai` (Security, Injection & Confirmation) (4 tests)
  - `apps/api/src/ai` (JEE Navigation, Screen Context & RAG Conditionality) (23 tests)
- **Vercel API Deployment Status:** `sanchay-api` (standalone backend) `● READY`, `sanchay` (unified web + serverless API) `● READY`.
- **Current Test Result:** 100% Passed (95/95 unit and security tests passing).
- **AI Engine:** OpenRouter Free Qwen (`qwen/qwen3-30b-a3b`) real LLM generation active for runtime with automatic deterministic fallback on missing key / timeout.

---

## Current Task

- Completed: **Emergency Phase E3 — Authentication & Session Stability (ADR-028)**.
  - **Objective**: Stabilize and verify the end-to-end authentication and session layer across local and production environments following E2 permanent serverless bundling.
  - **Authentication Architecture**:
    1. Passwordless OTP challenge initiation (`POST /api/v1/auth/login`) with audit logging.
    2. Challenge verification (`POST /api/v1/auth/verify`) generating cryptographic stateless tokens with 7-day expiration and DB/in-memory session backing.
    3. Session inspection (`GET /api/v1/auth/session`) extracting identity context via `AuthGuard` and `CurrentUser` decorator.
    4. Session revocation (`POST /api/v1/auth/logout`) invalidating active sessions with full audit trail.
    5. Strict authorization enforcement preventing cross-user data access (`403 Forbidden` IDOR protection in `MeService`, `ApplicationService`, `DocumentService`).
    6. Structured JSON error envelopes for invalid credentials (401), missing tokens (401), expired sessions (401), and malformed requests (400).
    7. Verified zero exposure of secrets, tokens, or personal identifiers in error responses or logs.

---

## Next Task

- **Phase 8 — Ayushman Bharat PM-JAY Service Platform Integration:** Implement authentic Ayushman Bharat health scheme portal recreation, hospital empaneled search, SECC 2011 eligibility verification, e-KYC card generation capability, and contextual AI health assistance.

---

## Last Validation

- **Typecheck:** Passed (`pnpm typecheck` across all 10 workspaces, 0 errors)
- **Tests:** Passed (95/95 unit and security tests passing across all packages)
- **Build:** Passed (`apps/api` and `apps/web` production builds completed successfully; self-contained serverless bundle generated)
- **Authentication & Session Stability:** Passed (Login, verification, session validation, logout, and IDOR protection verified)
- **Validation Date:** 2026-08-17T17:00:00+05:30
