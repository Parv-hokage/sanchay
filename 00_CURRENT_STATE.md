# SANCHAY — Current Project State

## Project Status

- **Current Phase:** Phase 2 — Government Service Platform & Navigable UI (Completed) → Ready for Phase 3 (Applications & Deterministic Auto-Fill)
- **Current Version:** 0.3.0
- **Overall Completion:** 40% (Foundation, Identity & Sanchay UID, Government Service Platform hierarchy, Catalog & Discovery APIs, Database Seeder, and Navigable Next.js Frontend with dynamic Service & Department Pages operational)
- **Last Updated:** 2026-08-16T15:03:00+05:30

---

## Product Summary

Sanchay (संचय) is a unified citizen-facing government digital-service platform designed to eliminate fragmentation across government services. It provides a standardized department/service hierarchy, dual-mode access (traditional navigation and context-aware conversational AI), unified citizen identity (Sanchay UID), deterministic form auto-filling with explicit citizen consent, RAG-grounded official government knowledge, and an extensible service adapter architecture with NTA/JEE Main and Ayushman Bharat as initial demonstration services.

---

## Documentation Status

| Document | File Name | Status | Purpose / Description |
|---|---|---|---|
| 00 | `00_CURRENT_STATE.md` | Complete | Current operational snapshot and implementation reality |
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
| 19 | `md files/19_DECISIONS.md` | Complete | Architectural Decision Records (ADR-001 to ADR-022) |
| Phase 1 | `phase/PHASE_01_IDENTITY.md` | Complete | Phase 1 implementation specification |
| Phase 2 | `phase/PHASE_02_SERVICE_PLATFORM.md` | Complete | Phase 2 implementation specification |

---

## Repository State

- **Repository Structure:**
  ```text
  sanchay/
  ├── apps/
  │   ├── api/                 # NestJS 10 REST API (Auth, Me, Catalog, Audit, Health)
  │   └── web/                 # Next.js 15 App Router Web App (Dynamic Catalog, Depts, Services, Profile)
  ├── packages/
  │   ├── types/               # @sanchay/types domain interfaces & DTOs
  │   ├── config/              # @sanchay/config Zod env validator
  │   ├── validation/          # @sanchay/validation input validators
  │   └── shared/              # @sanchay/shared envelopes & error codes
  ├── workers/
  │   ├── knowledge-ingestion/ # @sanchay/worker-knowledge-ingestion (stub only)
  │   ├── document-processing/ # @sanchay/worker-document-processing (stub only)
  │   └── scheduled-jobs/      # @sanchay/worker-scheduled-jobs (stub only)
  ├── prisma/
  │   ├── schema.prisma        # Complete PostgreSQL schema (28 models defined)
  │   └── seed.ts              # Deterministic database seeder for demo catalog
  ├── infrastructure/
  │   └── docker-compose.yml   # PostgreSQL (pgvector) & Redis local dev config
  ├── .github/
  │   └── workflows/ci.yml     # GitHub Actions CI workflow
  ├── phase/                   # Phase specifications
  └── md files/                # 19 specification documents
  ```
- **Applications:**
  - `apps/api`: Operational NestJS modules: `PrismaModule`, `AuditModule`, `AuthModule`, `MeModule`, `CatalogModule`, `HealthModule`.
  - `apps/web`: Operational Next.js pages: Dynamic Home (`/`), Departments Directory (`/departments`), Department Detail (`/departments/[slug]`), Unified Service Details (`/services/[slug]`), Citizen Profile Hub (`/profile`), `AuthProvider`, `LoginModal`, `AIButton`.
- **Database:**
  - `prisma/schema.prisma`: 28 models defined; Prisma Client v6.19.3 generated.
  - `prisma/seed.ts`: Seeds 4 Departments, 4 Organizations, 4 Services, 13 Capabilities, and Mock integration adapters.

---

## Implemented

- [x] Repository monorepo initialized (`pnpm` workspaces)
- [x] TypeScript base configuration with strict mode (`tsconfig.base.json`)
- [x] Shared domain types package (`@sanchay/types`)
- [x] Environment configuration validation with Zod (`@sanchay/config`)
- [x] Reusable validation schemas (`@sanchay/validation`)
- [x] Standard API envelopes and error codes (`@sanchay/shared`)
- [x] Complete Prisma schema for PostgreSQL (`prisma/schema.prisma` — 28 models)
- [x] Prisma Client generation (v6.19.3)
- [x] Database seeder script (`prisma/seed.ts`) populating demo catalog
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
- [x] Automated IDOR / BOLA security test suite (`apps/api/src/me/me.ownership.spec.ts`)
- [x] Department catalog endpoints (`GET /api/v1/departments`, `GET /api/v1/departments/:idOrSlug`)
- [x] Organization catalog endpoints (`GET /api/v1/organizations`, `GET /api/v1/organizations/:idOrSlug`)
- [x] Service catalog & search endpoints (`GET /api/v1/services`, `GET /api/v1/services/recommendations`, `GET /api/v1/services/:idOrSlug`)
- [x] Service capabilities & requirement endpoints (`GET /api/v1/services/:idOrSlug/capabilities`, `GET /api/v1/services/:idOrSlug/capabilities/:capIdOrSlug`)
- [x] Dynamic Next.js Home Page with search, department filtering, and featured services (`/`)
- [x] Dynamic Departments Directory (`/departments`) & Department Details (`/departments/[slug]`)
- [x] Dynamic Unified Sanchay Service Page (`/services/[slug]`) with capability inspector
- [x] Context-aware floating Sanchay AI entry point (`AIButton`)
- [x] Automated test suite (35/35 tests passing across all packages and API)
- [ ] Phase 3: Applications & Deterministic Auto-Fill engine
- [ ] Phase 4: Private Document Object Storage & Malware Scanner
- [ ] Phase 5: RAG Ingestion Pipeline & Hybrid Search
- [ ] Phase 6: AI Orchestrator & Tool Authorization
- [ ] Phase 7: NTA / JEE Main Service Adapter & Sandbox
- [ ] Phase 8: Ayushman Bharat Service Adapter & Sandbox

---

## Current Architecture

The codebase operates as a verified Government Service Platform:
1. **Catalog & Registry Layer (`apps/api/src/catalog`):** Thin NestJS controllers providing public, cached-safe query endpoints for Departments, Organizations, Services, Capabilities, and Requirements from PostgreSQL.
2. **Identity & Ownership Layer (`apps/api/src/auth` & `apps/api/src/me`):** Authenticated citizen context strictly derived from validated token (`req.user`), server-side ownership checks on all user resources, and audit logging.
3. **Frontend Layer (`apps/web`):** Next.js 15 App Router consuming real API endpoints for all directory views, service cards, and department hierarchies. Zero hardcoded service arrays.
4. **Data Layer (`prisma/schema.prisma` & `prisma/seed.ts`):** 28 models with clean domain boundaries and deterministic seeding for Education, Healthcare, Finance, and Transport.

---

## Database Status

- **Database Technology:** PostgreSQL 16 + pgvector
- **Active Models in Phase 2:** `Department`, `Organization`, `GovernmentService`, `ServiceCapability`, `ServiceCapabilityRequirement`, `ServiceIntegration`, `User`, `AuthSession`, `Profile`, `Address`, `ContactMethod`, `IdentityLink`, `Consent`, `AuditEvent`.
- **Seed Data:** 4 Departments, 4 Organizations, 4 Services, 13 Capabilities, 8 Requirements, 2 Mock Integrations.

---

## API Status

- **Implemented Modules (6 Modules):**
  - `PrismaModule`: Database lifecycle
  - `HealthModule`: System health
  - `AuditModule`: Audit event recording
  - `AuthModule`: Identity challenge & sessions
  - `MeModule`: Profile, addresses, links, consents
  - `CatalogModule`: Departments, organizations, services, capabilities, requirements, recommendations
- **Implemented Endpoints (24 Endpoints):**
  - `GET /api/v1/health`
  - `GET /docs` (Swagger OpenAPI)
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/verify`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/session`
  - `GET /api/v1/me`
  - `GET /api/v1/me/profile`
  - `PATCH /api/v1/me/profile`
  - `GET /api/v1/me/addresses`
  - `POST /api/v1/me/addresses`
  - `PATCH /api/v1/me/addresses/:id`
  - `DELETE /api/v1/me/addresses/:id`
  - `GET /api/v1/me/contacts`
  - `POST /api/v1/me/contacts`
  - `GET /api/v1/me/identity-links`
  - `POST /api/v1/me/identity-links`
  - `DELETE /api/v1/me/identity-links/:id`
  - `GET /api/v1/me/consents`
  - `POST /api/v1/me/consents`
  - `PATCH /api/v1/me/consents/:id/revoke`
  - `GET /api/v1/departments`
  - `GET /api/v1/departments/:idOrSlug`
  - `GET /api/v1/organizations`
  - `GET /api/v1/organizations/:idOrSlug`
  - `GET /api/v1/services`
  - `GET /api/v1/services/recommendations`
  - `GET /api/v1/services/:idOrSlug`
  - `GET /api/v1/services/:idOrSlug/capabilities`
  - `GET /api/v1/services/:idOrSlug/capabilities/:capIdOrSlug`

---

## Frontend Status

- **Implemented Pages:**
  - Dynamic Home Directory (`/`): Search, department filter, featured services (JEE Main, Ayushman), department categories.
  - Departments Directory (`/departments`): Overview of all central ministries.
  - Department Detail (`/departments/[slug]`): Participating agencies and services.
  - Unified Service Details (`/services/[slug]`): Organization badge, official URL, capability grid (Knowledge, Retrieve, Action, Document, Status), requirements inspector.
  - Citizen Profile Hub (`/profile`): Personal details, address book, identity links, consent revocation.
- **Implemented Components:**
  - `Header`, `Sidebar`, `DepartmentCard`, `ServiceCard`, `SearchFilterBar`, `LoginModal`, `AIButton`, `ErrorBoundary`, `LoadingSkeleton`.

---

## Government Integrations

### NTA / JEE Main
- **Status:** DEMO CATALOG / MOCK ADAPTER. (Catalog data seeded, capabilities mapped; no live government API calls made; planned for Phase 7).

### Ayushman Bharat PM-JAY
- **Status:** DEMO CATALOG / MOCK ADAPTER. (Catalog data seeded, capabilities mapped; no live government API calls made; planned for Phase 8).

---

## Security Status

- **IMPLEMENTED:**
  - Public catalog endpoints only expose public metadata (verified in `catalog.public-safety.spec.ts`).
  - Strict server-side ownership authorization on all citizen data (`me.ownership.spec.ts`).
  - Session verification & server-side revocation (`AuthGuard`).
  - Opaque Sanchay UID decoupled from personal data.
  - Persistent sanitized audit logging (`AuditService`).
  - Helmet security headers & CORS origin validation.
  - Request correlation tracking via `X-Request-ID`.
  - Global error filter hiding internal errors.

- **SCAFFOLDED:**
  - Rate limiting (Redis configured in Docker Compose).
  - Malware scanning (Worker stub).
  - AI Tool Guardrails (`AiToolExecution` schema & UI confirmation notice).

---

## Testing Status

- **Unit & Security Tests:** **35 tests across 10 test suites — ALL PASSING (100%)**.
  - `packages/config` (2 tests)
  - `packages/validation` (7 tests)
  - `packages/shared` (1 test)
  - `apps/api/src/health` (2 tests)
  - `apps/api/src/auth` (7 tests)
  - `apps/api/src/me` (5 tests)
  - `apps/api/src/me` (Ownership IDOR) (4 tests)
  - `apps/api/src/audit` (1 test)
  - `apps/api/src/catalog` (5 tests)
  - `apps/api/src/catalog` (Public Safety) (1 test)
- **Current Test Result:** 100% Passed (35/35 tests passing).

---

## Current Task

- Completed: **Phase 2 — Government Service Platform & Navigable UI**.

---

## Next Task

- **Phase 3 — Applications & Deterministic Auto-Fill:** Implement Application state machine, dynamic form field mapping from capability requirements, and deterministic auto-fill with explicit citizen consent.

---

## Last Validation

- **Typecheck:** Passed (`pnpm typecheck` across all 10 workspaces, 0 errors)
- **Lint:** Passed
- **Tests:** Passed (35/35 unit and security tests passing)
- **Build:** Passed (`apps/api` and `apps/web` production builds completed successfully)
- **Validation Date:** 2026-08-16T15:03:00+05:30
