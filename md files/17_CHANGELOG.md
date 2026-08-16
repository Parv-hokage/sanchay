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
- Next.js 15 Navigable Frontend Experience (`apps/web`):
  - Dynamic Home Directory (`/`): Real-time search, department filtering, featured services, and department cards.
  - Departments Directory (`/departments`) & Department Details (`/departments/[slug]`).
  - Unified Sanchay Service Page (`/services/[slug]`): Official domain badge, capabilities grid (Knowledge, Retrieve, Action, Document, Status), and requirement inspector.
  - Context-Aware `AIButton`: Passes active service/capability context to the conversational assistant shell.
- Automated Test Suite: 35/35 passing tests (Catalog queries, search/filtering, recommendations, public data safety isolation).
