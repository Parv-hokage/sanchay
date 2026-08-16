# 12 — Implementation Plan
# SANCHAY — Unified Government Digital Service Platform

**Status:** Implementation Blueprint  
**Version:** 1.0

## 1. Purpose

This document converts the approved PRD, requirements, architecture, database, API, AI/RAG, and security specifications into an executable development plan.

The implementation must follow the existing MD files as the source of truth.

## 2. Implementation Principles

1. Build the platform foundation before individual government services.
2. Keep JEE and Ayushman implementations behind the same service-capability architecture.
3. Prefer deterministic backend logic for critical decisions.
4. Keep AI orchestration separate from authorization.
5. Never allow the LLM direct database or government access.
6. Implement security controls alongside features, not afterward.
7. Every feature requires tests and documentation.
8. Avoid premature microservices.
9. Use feature flags for incomplete/experimental capabilities.
10. Do not invent unsupported government APIs.

## 3. Repository Structure

```text
sanchay/
├── apps/
│   ├── web/
│   └── api/
├── workers/
│   ├── knowledge-ingestion/
│   ├── document-processing/
│   └── scheduled-jobs/
├── packages/
│   ├── shared/
│   ├── types/
│   ├── validation/
│   └── config/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docs/
├── tests/
└── infrastructure/
```

The exact monorepo tooling may be selected during implementation without changing the architecture.

## 4. Backend Modules

```text
api/
├── auth/
├── users/
├── profiles/
├── identity-links/
├── consent/
├── departments/
├── organizations/
├── services/
├── capabilities/
├── applications/
├── documents/
├── knowledge/
├── ai/
├── notifications/
├── payments/
├── audit/
├── integrations/
└── health/
```

## 5. Frontend Modules

```text
web/
├── auth/
├── home/
├── departments/
├── services/
├── applications/
├── documents/
├── profile/
├── notifications/
├── ai/
├── shared/
└── design-system/
```

## 6. Implementation Order

### Phase 0 — Foundation

Build:

- Repository
- TypeScript configuration
- Environment configuration
- Linting/formatting
- CI checks
- PostgreSQL connection
- Prisma
- Redis
- Base API
- Error handling
- Request IDs
- Logging
- Configuration validation

### Phase 1 — Identity

Build:

- Authentication integration
- User creation
- Sanchay UID
- Session handling
- Profile
- Identity links
- Basic authorization

### Phase 2 — Service Platform

Build:

- Departments
- Organizations
- Services
- Capabilities
- Capability requirements
- Service registry
- Integration registry

### Phase 3 — Applications

Build:

- Draft applications
- Dynamic fields
- Field validation
- Auto-fill engine
- Review state
- Confirmation
- Submission state machine

### Phase 4 — Documents

Build:

- Upload authorization
- Private object storage
- Malware scanning
- Document metadata
- Versioning
- Access control

### Phase 5 — RAG

Build:

- Source registry
- Source ingestion
- Extraction
- Chunking
- Embeddings
- pgvector
- Hybrid retrieval
- Reranking
- Citations
- Freshness/versioning

### Phase 6 — AI

Build:

- Conversation system
- Intent detection
- Service context
- Capability resolution
- Context builder
- Tool execution
- AI response types
- Confirmation/action UI
- AI evaluation

### Phase 7 — First Integrations

Implement JEE and Ayushman through adapters.

Do not hardcode service-specific logic into the AI core.

### Phase 8 — Security Hardening

Complete:

- Authorization testing
- SSRF protection
- File scanning
- Secret management
- Rate limiting
- Audit logging
- AI red teaming
- RAG poisoning tests
- Dependency scanning
- Penetration testing

### Phase 9 — Production

Complete:

- CI/CD
- Staging
- Production
- Database migrations
- Backups
- Monitoring
- Alerting
- Incident response

## 7. Service Adapter Implementation

Every government integration implements a common contract.

```text
ServiceAdapter
├── getCapabilities()
├── getPublicInformation()
├── getUserData()
├── getStatus()
├── executeAction()
└── getDocuments()
```

Only supported methods should be exposed.

## 8. Auto-Fill Engine

```text
Application Requirements
        ↓
Field Mapping
        ↓
Authorized User Data
        ↓
Validation
        ↓
Populate
        ↓
Mark Source
        ↓
User Review
```

Sources must be tracked:

```text
PROFILE
GOVERNMENT
USER
SYSTEM
AI_ASSISTED
```

AI may assist with interpretation, but critical field mapping should be deterministic.

## 9. Eligibility Engine

```text
Official Rules
     ↓
Structured Rules
     ↓
User Attributes
     ↓
Eligibility Result
     ↓
AI Explanation
```

The LLM should explain eligibility rather than independently inventing eligibility logic.

## 10. RAG Implementation

```text
Source
 ↓
Fetcher
 ↓
Extractor
 ↓
Normalizer
 ↓
Chunker
 ↓
Embedder
 ↓
Vector Index
 ↓
Hybrid Retrieval
 ↓
Reranker
 ↓
Context Builder
```

Failed ingestion must preserve the previous known-good version.

## 11. AI Orchestrator

```text
User Message
 ↓
Context Resolver
 ↓
Intent
 ↓
Service
 ↓
Capability
 ↓
Authorization
 ↓
Required Data
 ↓
RAG / Tool
 ↓
Result Verification
 ↓
LLM
 ↓
Response
```

## 12. Government Action Flow

```text
AI prepares action
 ↓
User review
 ↓
Explicit confirmation
 ↓
Authorization
 ↓
Idempotency check
 ↓
Adapter
 ↓
Government system
 ↓
Response validation
 ↓
Persist authoritative state
 ↓
Audit
```

## 13. Database Implementation

Use Prisma migrations.

Rules:

- No manual production schema changes.
- Every schema change has a migration.
- Critical relationships use foreign keys.
- Sensitive fields receive explicit protection.
- Indexes are added based on expected access patterns.
- Destructive migrations require review.

## 14. API Implementation

Use NestJS modules with:

```text
Controller
 ↓
DTO validation
 ↓
Authorization
 ↓
Application service
 ↓
Repository / integration
 ↓
Response mapper
```

Controllers should not contain business logic.

## 15. Security Implementation

Security must be implemented at every layer:

```text
Frontend validation
+
API validation
+
Authorization
+
Database constraints
+
Service adapter restrictions
+
Audit
```

Frontend controls are never treated as security boundaries.

## 16. Testing During Implementation

Every feature must ship with appropriate tests.

Minimum:

```text
Unit
Integration
Authorization
E2E
```

AI/RAG features additionally require:

```text
Retrieval evaluation
Groundedness evaluation
Prompt injection tests
Tool authorization tests
```

## 17. Definition of Done

A feature is complete only when:

- Implementation exists.
- API contract is documented.
- Database changes are migrated.
- Authorization exists.
- Security requirements are satisfied.
- Tests pass.
- Errors are handled.
- Audit requirements are implemented.
- Monitoring is added where necessary.
- Documentation is updated.

## 18. Development Rule

> Never solve a feature by silently violating an existing MD file.

If requirements conflict, stop and record the conflict in `19_DECISIONS.md`.

## 19. Implementation Principle

> **Build Sanchay as a reusable government-service platform first, then plug JEE and Ayushman into it. Do not build two separate websites and call them a platform.**
