# 17 — Changelog
# SANCHAY

All meaningful product, architecture, security, API, and implementation changes should be recorded here.

## Format

```text
## [Version] — YYYY-MM-DD

### Added
-

### Changed
-

### Fixed
-

### Security
-

### Deprecated
-

### Removed
-
```

---

## [0.1.0] — Initial Architecture Baseline

### Added

- Product architecture documentation.
- Unified Sanchay service-platform concept.
- Sanchay UID model.
- Traditional UI + AI interaction model.
- Service capability architecture.
- Government service adapter model.
- PostgreSQL + pgvector direction.
- RAG architecture.
- AI tool execution architecture.
- Database design.
- API design.
- Security baseline.
- Implementation/testing/deployment/monitoring documentation framework.

### Services

- JEE / NTA selected as initial education-domain service.
- Ayushman Bharat selected as initial healthcare-domain service.

### Security

- Zero Trust direction.
- Least-privilege citizen data access.
- AI direct database access prohibited.
- AI arbitrary government access prohibited.
- Consequential actions require appropriate confirmation.

---

## [0.1.0] — 2026-08-16 — Phase 0: Foundation & Monorepo Setup

### Added

- Monorepo workspace initialized with pnpm workspaces (`apps/`, `packages/`, `workers/`).
- Core shared packages: `@sanchay/types`, `@sanchay/config`, `@sanchay/validation`, `@sanchay/shared`.
- Complete Prisma relational schema (`prisma/schema.prisma`) defining 20 models across all domain boundaries in `08_DATABASE.md`.
- Generated Prisma client v6.19.3.
- NestJS API backend (`apps/api`) with Helmet security headers, CORS origin validation, Global Exception Filter, Request ID middleware (`x-request-id`), Transform Interceptor, Logging Interceptor, and Health Check endpoint.
- OpenAPI / Swagger documentation at `/docs`.
- Next.js 15 Web Application (`apps/web`) with Tailwind design system tokens, Shell Navigation (Sidebar, Header), Sanchay Home Directory, Error Boundary, Loading Skeletons, and persistent Sanchay AI trigger widget.
- Worker scaffolds for knowledge ingestion, document processing, and scheduled jobs.
- Local development infrastructure via `infrastructure/docker-compose.yml` (PostgreSQL + pgvector, Redis).
- Continuous Integration pipeline via `.github/workflows/ci.yml`.
- Unit test suite (12/12 passing) and 100% typecheck passing across all workspace projects.
- `00_CURRENT_STATE.md` operational snapshot tracking.

---

## [0.2.0] — 2026-08-16 — Phase 1: Identity & Citizen Foundation

### Added

- Authentication engine with passwordless challenge and OTP / Mock IDP verification (`POST /api/v1/auth/login`, `POST /api/v1/auth/verify`).
- Server-side session lifecycle with token validation and revocation (`POST /api/v1/auth/logout`, `GET /api/v1/auth/session`).
- Stable, opaque, unique Sanchay UID generation (UUID v4) decoupled from sensitive citizen attributes (ADR-007).
- Authenticated citizen context resolution (`@CurrentUser()`, `AuthGuard`).
- Citizen account overview endpoint (`GET /api/v1/me`).
- Citizen profile management (`GET /api/v1/me/profile`, `PATCH /api/v1/me/profile`).
- Address book with full CRUD and primary address toggling (`GET / POST / PATCH / DELETE /api/v1/me/addresses`).
- Contact methods management (`GET / POST /api/v1/me/contacts`).
- External identity provider links with reference masking (`GET / POST / DELETE /api/v1/me/identity-links`).
- Purpose-specific data consent registry with one-click revocation (`GET / POST / PATCH /api/v1/me/consents`).
- Persistent audit logging service (`AuditService`) storing sanitized actor, action, resource, and correlation IDs in `AuditEvent` table.
- Automated IDOR / BOLA security test suite (`apps/api/src/me/me.ownership.spec.ts`) verifying cross-user access rejection across addresses, identity links, and consents.
- Frontend Identity Hub (`/profile`), Login dialog (`LoginModal`), and live session provider (`AuthContext`).
- Full test suite: 29/29 passing tests across packages and backend API.

---

## [0.3.0] — 2026-08-16 — Phase 2: Government Service Platform & Navigable UI

### Added

- Government Service Platform Architecture: Reusable hierarchical domain model (Department → Organization → Government Service → Service Capability → Capability Requirements → Integration Adapter).
- Catalog & Registry Module (`CatalogModule`):
  - `GET /api/v1/departments`: Active departments with service and agency counts.
  - `GET /api/v1/departments/:idOrSlug`: Department details with participating agencies and services.
  - `GET /api/v1/organizations`: Subordinate government testing agencies and authorities.
  - `GET /api/v1/organizations/:idOrSlug`: Organization details.
  - `GET /api/v1/services`: Filterable and searchable service registry.
  - `GET /api/v1/services/recommendations`: Featured popular services.
  - `GET /api/v1/services/:idOrSlug`: Complete service details, capabilities, and requirements.
  - `GET /api/v1/services/:idOrSlug/capabilities`: Service capability queries.
  - `GET /api/v1/services/:idOrSlug/capabilities/:capIdOrSlug`: Specific capability and requirements.
- Database Seeder (`prisma/seed.ts`):
  - Deterministic demo catalog data for Education (NTA / JEE Main), Healthcare (NHA / Ayushman Bharat), Finance (CBDT / PAN), and Transport (MoRTH / Driving License).
  - 13 realistic service capabilities with requirement field mappings.
  - Mock integration adapter records (`JEEAdapter`, `AyushmanAdapter`).
- Automated Test Suite: 35/35 passing tests (Catalog queries, search/filtering, recommendations, public data safety isolation).

---

## [0.4.0] — 2026-08-16 — Phase 3: Application Engine & Deterministic Auto-Fill

### Added

- Application Engine Architecture: Service-agnostic application processing engine (`ApplicationModule`) driving dynamic form generation from registered capability requirements.
- Application Lifecycle State Machine: Server-side transition validator enforcing sequential stages (`DRAFT` → `IN_PROGRESS` → `READY_FOR_REVIEW` → `SUBMITTING` → `SUBMITTED`, plus terminal failure handling).
- Deterministic Auto-Fill Subsystem: Consent-aware auto-fill mapping verified citizen data (`fullName`, `dateOfBirth`, `gender`, `address`, `phone`, `email`) with `FieldSource.PROFILE` and `verified: true` tracking.
- Consequential Action Safeguards: Explicit citizen review sheet (`/review`) and confirmation agreement (`/confirm`) preventing accidental or unconfirmed submissions.
- Idempotent Mock Submission Adapter: Handles `Idempotency-Key` headers and generates deterministic authority reference codes (e.g. `JEE2026-NTA-XXXXX`, `ABPMJAY-2026-XXXXX`).
- REST Application APIs (`09_API.md` compliant):
  - `GET /api/v1/applications`: Citizen applications listing with status filters.
  - `POST /api/v1/applications`: Create draft application from capability requirements.
  - `GET /api/v1/applications/:id`: Application details & fields (ownership protected).
  - `PATCH /api/v1/applications/:id/fields`: Update field values and advance wizard step.
  - `POST /api/v1/applications/:id/autofill`: Execute deterministic auto-fill.
  - `GET /api/v1/applications/:id/review`: Review-ready aggregated payload.
  - `POST /api/v1/applications/:id/confirm`: Explicit citizen confirmation lock.
  - `POST /api/v1/applications/:id/submit`: Mock authority submission with reference generation.
  - `GET /api/v1/applications/:id/events`: Lifecycle audit history.
  - `GET /api/v1/applications/:id/status`: Real-time status lookup.
- Next.js 15 Application Experience (`apps/web`):
  - Multi-Step Application Wizard (`ApplicationWizard`) with progress stepper, auto-fill tags, draft saving, and field validation.
  - Transparent Review Sheet (`ApplicationReview`) with structured sections and confirmation agreement.
  - Submission Success Screen (`ApplicationSuccess`) with reference ID banner and sandbox disclaimer.
  - Citizen Applications Dashboard (`/applications`).
  - New Application Initiator (`/applications/new`).
- Automated Test Suite: 45/45 passing tests (including IDOR/BOLA security suite `application.ownership.spec.ts`).

---

## [0.5.0] — 2026-08-16 — Phase 4: Private Document Platform & Vault

### Added

- Private Document Vault Architecture: Generic citizen document platform storing binaries in isolated private object storage (`.sanchay-vault/`) and metadata in PostgreSQL.
- Storage Layer & Signature Inspection (`StorageService`):
  - Magic bytes file signature verification (`%PDF`, `\xFF\xD8\xFF`, `\x89PNG`, `RIFF...WEBP`) blocking MIME and extension spoofing.
  - Opaque sanitized storage keys (`documents/<userId>/<docId>/<version>`) defeating path traversal and filename injection.
  - Size limitation enforcement (5MB max).
- Asynchronous Antivirus Worker (`@sanchay/worker-document-processing`):
  - Async queue scanning simulation with EICAR test signature detection.
  - State machine transition: `PENDING_SCAN` → `VERIFIED` / `QUARANTINED`.
- Document APIs (`09_API.md` compliant):
  - `POST /api/v1/documents/upload`: Multipart upload with magic bytes inspection, version creation, and scan queueing.
  - `GET /api/v1/documents`: List citizen vault documents with category/status filters.
  - `GET /api/v1/documents/:id`: Document metadata with strict ownership check.
  - `GET /api/v1/documents/:id/download`: Authorized binary stream with consequential scan safeguards and access logging.
  - `DELETE /api/v1/documents/:id`: Soft delete with audit logging.
  - `GET /api/v1/documents/:id/logs`: Access audit history.
- Next.js 15 Document Vault Experience (`apps/web`):
  - Sovereign Vault Dashboard (`/documents`) with category filter tabs and real-time status badges.
  - Drag-and-Drop Document Uploader (`DocumentUploadModal`) with live scanning feedback.
  - Document Viewer Drawer (`DocumentDetailModal`) with authorized download trigger and metadata inspect.
  - Sidebar Navigation linked to `/documents`.
- Automated Test Suite: 53/53 passing tests (including IDOR/BOLA security suite `document.ownership.spec.ts` and malware quarantine verification).

---

## [0.6.0] — 2026-08-16 — Phase 5: RAG & Official Government Knowledge Platform

### Added

- Source-Grounded Knowledge Retrieval Platform (`KnowledgeModule` & `@sanchay/worker-knowledge-ingestion`):
  - Official Government Source Registry tracking domain authority (`AuthorityLevel.TIER_1_OFFICIAL_GOV`), URLs, and freshness timestamps (`lastCheckedAt`).
  - Strict SSRF & Domain Allowlist Protection blocking loopback, private RFC1918 subnets, and cloud metadata (`169.254.169.254`).
  - Source Poisoning Safeguard: Retrieved content treated strictly as untrusted evidence data, never executed.
  - HTML & Document Parser: Strips scripts/styles/nav elements and extracts structured headings and sections.
  - Semantic Chunker: Logical section/paragraph chunking preserving heading hierarchy and page citations.
  - Deterministic Embedding Generator & Cosine Similarity Engine.
  - Hybrid RAG Retrieval & Reranking Engine: Combines lexical keyword matching with dense vector cosine similarity and Reciprocal Rank Fusion (RRF).
  - Structured Citation Builder attaching source titles, URLs, section names, and page numbers.
- REST Knowledge APIs (`09_API.md` compliant):
  - `GET /api/v1/knowledge/search`: Hybrid search returning structured `Evidence[]` with relevance scores and citations.
  - `GET /api/v1/knowledge/sources`: List registered official government sources with freshness status.
  - `POST /api/v1/knowledge/sources`: Register new verified government source with SSRF verification.
  - `POST /api/v1/knowledge/sources/:id/sync`: Trigger ingestion sync and freshness update.
- Next.js 15 Knowledge Experience (`apps/web`):
  - Dedicated Public Knowledge Explorer (`/knowledge`) with verified authority registry.
  - Interactive Knowledge Search Widget (`KnowledgeSearchWidget`) with instant suggested queries, relevance badges, and source links.
  - Embedded Service Knowledge Search on Service Detail page (`/services/[slug]`).
  - Sidebar Navigation linked to `/knowledge`.
- Automated Test Suite: 64/64 passing tests across 16 test suites (including `knowledge.ssrf.spec.ts` and `knowledge.service.spec.ts`).

---

## [0.7.0] — 2026-08-16 — Phase 6: AI Orchestrator & Tool Authorization

### Added

- AI Provider Abstraction & Qwen3 Adapter (`AiModule` & `Qwen3Adapter`):
  - Model-agnostic `AIProvider` interface with server-side credentials and local deterministic reasoning fallback.
  - Architectural Decision Record (`ADR-023`) adopting Qwen3 as sovereign default model family.
- Context Builder & Intent Detection (`ContextBuilderService` & `IntentDetectionService`):
  - Least-privilege prompt building without full user profile or whole database dumps.
  - Structured intent taxonomy (`KNOWLEDGE_QUERY`, `ELIGIBILITY_CHECK`, `START_APPLICATION`, `FILL_APPLICATION`, `CHECK_APPLICATION_STATUS`, `FIND_DOCUMENT`, `NAVIGATE_SERVICE`, `GENERAL_HELP`).
- Capability Resolver & Tool Registry (`CapabilityResolverService` & `ToolRegistryService`):
  - Mapping of user intents to registered service capabilities (`JEE_START_APPLICATION`, `AYUSHMAN_CARD_GENERATION`).
  - Risk classification system (LOW, MEDIUM, HIGH) enforcing explicit citizen confirmation on consequential actions.
  - Anti-replay safeguards on action confirmations.
- REST AI APIs (`09_API.md` compliant):
  - `POST /api/v1/ai/chat`: Interactive chat with intent resolution, RAG citations, and action cards.
  - `GET /api/v1/ai/conversations`: Citizen conversation history listing.
  - `GET /api/v1/ai/conversations/:id`: Single conversation message stream.
  - `POST /api/v1/ai/conversations/:id/confirm`: Consequential action confirmation trigger.
- Next.js 15 AI Workspace Experience (`apps/web`):
  - Global Floating Circular AI Trigger (`◯ AI`) on all pages.
  - ChatGPT-style Conversational Workspace Drawer (`AIWorkspaceDrawer.tsx`) with active service context badge.
  - Rich Message Bubble Stream with markdown formatting, verifiable citations list, and actionable Action Cards (`[Start Application]`, `[Review & Auto-fill]`).
  - Confirmation Modal for high-risk consequential submissions.
- Automated Test Suite: 71/71 passing tests across 18 test suites (including `ai.orchestrator.spec.ts` and `ai.security.spec.ts`).

---

## [0.8.0] — 2026-08-16 — Phase 7: JEE Service Recreation & AI Integration

### Added

- Authentic JEE Main Service Portal (`apps/web/src/app/services/jee-main/page.tsx`):
  - Strict government hierarchy breadcrumb: `Ministry of Education → National Testing Agency (NTA) → JEE (Main) 2026`.
  - Live announcements and Public Notices ticker.
  - 6 traditional browsing tabs: Information Bulletin explorer, Subject-wise Syllabus browser (Physics, Chemistry, Math), Public Notices board with category filtering, Question Papers & Final Answer Keys repository (2024 & 2025), Candidate FAQs, and Candidate Services.
  - Clear **"SANDBOX / DEVELOPMENT SIMULATION"** indicator for mock application and score inquiry flows.
- Official JEE Knowledge Base & Runtime RAG Ingestion:
  - Official Information Bulletins, Syllabus unit breakdowns, Final Answer Key releases, Response Sheet challenges, and NTA score circulars indexed with `AuthorityLevel.TIER_1_OFFICIAL_GOV`.
- Screen-Aware Contextual AI Integration:
  - Global AI trigger (`◯ AI`) dynamically captures active portal section (`overview`, `bulletin`, `syllabus`, `notices`, `papers`, `faq`, `candidate-services`) and active document context.
  - Sanchay AI answers questions about syllabus, notices, and answer keys with verifiable official citations.
  - Registered AI navigation tools: `jee.open_section`, `jee.check_eligibility`.
  - Strict privacy boundary: Public JEE inquiries never access or leak private citizen vault documents.
- Automated Test Suite: 76/76 passing tests across 19 test suites (including `ai.jee.spec.ts`).

### Fixed

- AI Response Contract Unwrapping & Rendering Bug (`apps/api/src/ai/ai.controller.ts`, `apps/web/src/components/ai/AIWorkspaceDrawer.tsx`):
  - Standardized `AiController` to return domain payload directly to `TransformInterceptor`, eliminating double `data.data` nesting.
  - Made `AIWorkspaceDrawer` response parsing defensive to safely unpack content across all envelope variants.
  - Added 30s `AbortController` timeout to remote Qwen provider fetch in `Qwen3Adapter`.
- AI Quality Bug — Conditional RAG & Dynamic Breadcrumb Hierarchy:
  - Restricted RAG retrieval to factual knowledge queries (`KNOWLEDGE_QUERY`, `ELIGIBILITY_CHECK`), eliminating unrelated citations on greetings and capability inquiries.
  - Implemented `AIContextProvider` dynamically propagating full government hierarchy (`Ministry → Department → Service → Active Tab/Section`) to the AI Drawer.
  - Added real OpenRouter free Qwen (`qwen/qwen3-30b-a3b`) integration with automatic fallback to deterministic reasoning engine.
- Automated Test Suite: 79/79 passing tests across 19 test suites (all packages passing).

---

## [0.8.1] — 2026-08-17 — Step 7: JEE Main Application Sandbox & AI Application Flow

### Added

- **JEE Main Application Sandbox Wizard (`apps/web/src/app/services/jee-main/apply/page.tsx`)**:
  - Full 8-step wizard: Personal Details, Contact & Address, Academic Details (Class 10 & 12), Examination Details (Paper & Session Choice), City & Centre Preferences (4 Choices), Documents & Proofs Upload simulation, Comprehensive Citizen Review Sheet, and Consequential Confirmation.
  - **Single Source of Truth Architecture (ADR-024)**: Citizen identity, personal, category, and academic data is strictly **READ-ONLY** within the application form. Sanchay Profile (`/profile`) is the single source of truth for citizen data.
  - **Category Integration**: Added `CitizenCategory` (`GENERAL`, `EWS`, `OBC_NCL`, `SC`, `ST`) to Profile data model, API, and UI edit/view flow. Category is consumed dynamically by the JEE application.
  - Visible provenance indicators (`✓ From Sanchay Profile`, `⚠ Missing from Sanchay Profile` $\rightarrow$ `[Complete Profile]`).
  - Strict zero-trust consequential citizen confirmation guardrail before sandbox submission.
  - Generates deterministic reference numbers (`SANDBOX-JEE-2026-XXXXXX`) with live status dashboard tracking.
  - Prominently labeled with sandbox simulation indicators.

- **AI Profile Correction & Application Flow**:
  - Zero AI Profile Mutation: AI has read-only access and redirects any profile modification queries to My Profile (`/profile`) with navigation action cards (`[Open My Profile]`).
  - Contextual `START_APPLICATION` intent detection summarizing available vs missing profile credentials.
  - Action card routing directly to `/services/jee-main/apply`.

- **Safe Markdown Rendering in AI Workspace**:
  - Zero-vulnerability `MarkdownRenderer` component using `react-markdown` and `remark-gfm` with strict URL protocol sanitization (permits only `http:`, `https:`, `mailto:`, relative paths; rejects `javascript:`, `data:`, `file:`, `vbscript:`).

### Fixed

- **JEE Main Service Portal Contrast & Visual Hierarchy**:
  - Upgraded hero section to high-contrast WCAG AAA compliant styling (`bg-slate-900 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800`, crisp text-white headings, high-contrast amber buttons and badges).
  - Linked primary and candidate services CTA buttons to `/services/jee-main/apply`.

- **Automated Test Suite**: 81/81 passing tests across monorepo test suites.

