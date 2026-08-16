# 06 — Technology Stack
# SANCHAY — Unified Government Digital Service Platform

**Product:** Sanchay  
**Scope:** Unified government-service platform + contextual AI + RAG + service capabilities  
**MVP:** NTA / JEE Main + Ayushman Bharat  
**Version:** 1.0  
**Status:** Technical Foundation  
**Decision Owner:** Technical Lead / Architect

---

# 1. Purpose

This document defines the technologies and technical standards used to build Sanchay.

It answers:

> **What technologies will we use, why are we using them, and where do they belong?**

Technology choices must support the core Sanchay requirements:

- Unified citizen-facing platform
- One citizen profile / UID
- Traditional government-service UI
- Contextual AI
- Official-source RAG
- Vector search
- Government-service capability/tool execution
- Secure data and document handling
- Modular service integrations
- Strong auditability
- Horizontal scalability
- Future addition of many government services

---

# 2. Technology Principles

## 2.1 TypeScript-First

The primary application stack SHALL use TypeScript wherever practical.

Benefits:

- One language across frontend/backend
- Shared types
- Strong API contracts
- Easier developer onboarding
- Reduced duplication

Python MAY be introduced later for specialized AI/ML workloads where it provides a meaningful advantage.

---

## 2.2 API-First

All major platform capabilities SHALL be exposed through well-defined internal APIs/services.

The frontend SHALL NOT directly access protected databases, government credentials, or privileged integrations.

---

## 2.3 Modular, Not Microservice-First

The MVP SHOULD use a **modular monolith + workers** rather than immediately splitting everything into microservices.

Reason:

```text
Too early:
Frontend
 ↓
10 microservices
 ↓
5 queues
 ↓
multiple databases
 ↓
distributed debugging
```

Preferred MVP:

```text
Frontend
   ↓
API / Application Server
   ├── Identity
   ├── Profile
   ├── Services
   ├── Applications
   ├── AI
   ├── RAG
   ├── Documents
   ├── Integrations
   └── Audit
          ↓
      PostgreSQL
          ↓
     Workers / Queue
```

Modules can later be extracted into independent services when scale or organizational boundaries justify it.

---

## 2.4 Provider Independence

The application SHALL avoid unnecessary hard-coupling to one:

- LLM provider
- Embedding provider
- Vector database
- Object-storage provider
- Government integration provider

Provider-specific code SHOULD be isolated behind interfaces/adapters.

---

## 2.5 Security by Architecture

Security SHALL NOT be added only after implementation.

Authentication, authorization, consent, auditability, secret management, data isolation, and AI tool permissions must exist in the architecture from the beginning.

---

# 3. Recommended Stack — Summary

| Layer | Technology |
|---|---|
| Web Frontend | Next.js + React + TypeScript |
| UI | Tailwind CSS + accessible component system |
| Client State | TanStack Query + minimal local state |
| Forms | React Hook Form + Zod |
| Backend | NestJS + TypeScript |
| API Contract | REST + OpenAPI |
| Validation | Zod / class-validator at appropriate boundaries |
| Primary DB | PostgreSQL |
| Vector Search | PostgreSQL + pgvector for MVP |
| Cache | Redis |
| Queue | BullMQ + Redis |
| ORM | Prisma |
| Object Storage | S3-compatible storage |
| AI Orchestration | Application-owned orchestration layer |
| LLM | Provider-agnostic adapter |
| Embeddings | Provider-agnostic embedding adapter |
| RAG | Custom retrieval pipeline + pgvector |
| Search | PostgreSQL full-text + vector/hybrid search |
| Auth | OIDC/OAuth2-compatible architecture + secure session/token strategy |
| API Docs | OpenAPI / Swagger |
| Testing | Vitest + Playwright |
| Observability | OpenTelemetry + structured logs + error tracking |
| CI/CD | GitHub Actions |
| Containers | Docker |
| Reverse Proxy / Edge | Managed platform/CDN or Nginx where required |
| Secrets | Cloud secret manager / deployment secret store |
| Analytics | Privacy-conscious product analytics, if required |
| AI Evaluation | Versioned evaluation datasets + automated RAG/tool tests |

---

# 4. Frontend

## 4.1 Framework

**Next.js + React + TypeScript**

### Why

- Strong React ecosystem
- Server/client rendering options
- Good routing
- Good performance
- Strong TypeScript support
- Suitable for complex authenticated dashboards
- Easy deployment
- Can support a progressively enhanced public-facing experience

---

## 4.2 UI Styling

**Tailwind CSS**

Use a centralized Sanchay design-token system.

Do not scatter arbitrary values throughout components.

The design system should define:

- Colors
- Typography
- Spacing
- Radius
- Shadows
- Focus states
- Motion
- Breakpoints

---

## 4.3 Component System

Use an accessible reusable component architecture.

Recommended foundation:

**Radix UI primitives or an equivalent accessible component layer**, combined with Sanchay-specific components.

Core components include:

```text
Sidebar
Header
DepartmentCard
OrganizationCard
ServiceCard
ServiceHeader
ServiceNavigation
OfficialSource
AIButton
AIWorkspace
AIMessage
AIContext
EligibilityResult
ConsentDialog
DocumentCard
ApplicationProgress
ApplicationSection
RecommendationCard
ConfirmationDialog
StatusBadge
OfficialPortalLink
```

---

# 5. Frontend State Management

## Server State

**TanStack Query**

Use for:

- User profile
- Services
- Applications
- Documents metadata
- Notifications
- Service status
- API requests

## Local UI State

Use React state/context for small local state.

Do not introduce a global state library unless a real cross-screen state requirement appears.

---

# 6. Forms

**React Hook Form + Zod**

Use for:

- Government forms
- Profile editing
- Consent forms
- Application preparation
- Configuration forms

The frontend SHALL NOT be the ultimate authority for validation.

Final validation belongs at the backend/service boundary.

---

# 7. Backend

## 7.1 Framework

**NestJS + TypeScript**

Why:

- Strong modular architecture
- Dependency injection
- Guards/interceptors/pipes
- Good testing structure
- Good support for REST APIs
- Suitable for a large modular application
- Clear separation of platform modules

---

# 8. Backend Module Structure

Conceptual structure:

```text
backend/
├── auth/
├── identity/
├── users/
├── profiles/
├── consent/
├── documents/
├── departments/
├── organizations/
├── services/
├── capabilities/
├── applications/
├── notifications/
├── ai/
├── rag/
├── integrations/
├── payments/
├── audit/
├── admin/
└── common/
```

The exact directory structure may evolve.

---

# 9. API Architecture

Primary application API:

**REST + OpenAPI**

Reason:

- Easy integration
- Easy debugging
- Clear contracts
- Good support for government-service adapters
- Strong documentation
- Language-independent

GraphQL is NOT required for the MVP.

Internal asynchronous workflows MAY use queues/events.

---

# 10. API Contract

OpenAPI SHALL be generated/maintained as the API contract.

Every public/internal application endpoint should define:

- Request
- Response
- Authentication
- Authorization
- Validation
- Errors
- Rate limits where relevant

Example conceptual API:

```text
GET    /api/v1/departments
GET    /api/v1/services
GET    /api/v1/services/:id
GET    /api/v1/services/:id/capabilities

GET    /api/v1/me
PATCH  /api/v1/me

GET    /api/v1/applications
GET    /api/v1/applications/:id

POST   /api/v1/ai/chat
POST   /api/v1/ai/actions/:action

GET    /api/v1/documents
POST   /api/v1/documents

GET    /api/v1/sources/:id
```

These are architectural examples, **not final API contracts**. Final endpoints belong in `08_API.md`.

---

# 11. Primary Database

## PostgreSQL

PostgreSQL SHALL be the primary transactional database.

It will store:

- Users
- Sanchay UID mappings
- Profiles
- Consent records
- Departments
- Organizations
- Services
- Capabilities
- Applications
- Application state
- Document metadata
- Knowledge metadata
- Audit records
- Integration configuration metadata
- Notifications

---

# 12. ORM

**Prisma**

Reasons:

- Strong TypeScript integration
- Type-safe database access
- Good migration workflow
- Good developer experience
- Suitable for PostgreSQL

Raw SQL MAY be used for:

- Complex queries
- Performance-critical operations
- pgvector queries
- PostgreSQL-specific functionality

Raw SQL should be isolated and documented.

---

# 13. Vector Database

## MVP Decision: PostgreSQL + pgvector

The MVP SHALL use **pgvector inside PostgreSQL** unless testing proves a dedicated vector database is necessary.

Why:

- One primary data platform
- Lower operational complexity
- Easy metadata filtering
- Transactions and metadata remain close to vectors
- Good fit for SIH prototype
- Easier local development
- Avoids premature infrastructure complexity

Concept:

```text
PostgreSQL
├── Relational data
└── pgvector
    └── Embeddings
```

---

# 14. Future Vector Database Option

If Sanchay reaches a scale where vector workloads require independent infrastructure, the vector layer SHOULD be abstracted so that a dedicated system such as Qdrant can be introduced.

The application should depend on:

```text
VectorStore interface
```

rather than directly coupling all RAG logic to one provider.

---

# 15. Redis

**Redis**

Use for:

- Short-lived caching
- Rate limiting
- Session-related temporary data where appropriate
- Queue backend
- Temporary AI state
- Distributed locks where necessary

Redis SHALL NOT be treated as the permanent source of truth for citizen data.

---

# 16. Background Jobs

**BullMQ + Redis**

Use workers for:

- Knowledge ingestion
- Website/document crawling where authorized
- PDF extraction
- Text processing
- Embedding generation
- Vector indexing
- Document processing
- Virus scanning
- Notification delivery
- Periodic source refresh
- Integration polling where officially permitted

Concept:

```text
API
 ↓
Queue
 ↓
Worker
 ↓
Task
 ↓
Database / Object Storage / Vector Store
```

---

# 17. AI Architecture

Sanchay AI SHALL be implemented as an **application-owned orchestration layer**, not as a raw LLM endpoint.

```text
User
 ↓
Sanchay AI API
 ↓
Context Builder
 ↓
Intent / Capability Resolver
 ↓
┌───────────────┬─────────────────┐
↓               ↓                 ↓
RAG           User Data        Service Tools
↓               ↓                 ↓
Knowledge     Profile         Gov Integrations
└───────────────┴─────────────────┘
                ↓
               LLM
                ↓
         Response / Action
                ↓
        Authorization Check
                ↓
             User
```

---

# 18. LLM Strategy

The exact LLM provider is a deployment decision and SHALL NOT be hardcoded into the product architecture.

Create an internal interface conceptually equivalent to:

```text
LLMProvider
├── generate()
├── stream()
└── toolCall()
```

This allows model/provider replacement without rewriting the AI layer.

---

# 19. AI Tool Calling

AI SHALL NOT directly execute arbitrary code.

Instead:

```text
User Request
    ↓
LLM identifies tool
    ↓
Tool request
    ↓
Sanchay authorization layer
    ↓
Capability permission check
    ↓
Tool execution
    ↓
Verified result
    ↓
LLM formats response
```

Example:

```text
getJeeAnswerKey()
getJeeResult()
getApplicationStatus()
prepareJeeApplication()
```

Tools are service capabilities, not unrestricted backend functions.

---

# 20. Service Capability Registry

Every integrated service SHALL declare its available capabilities.

Conceptual schema:

```text
Service
  ↓
Capability
├── id
├── name
├── type
├── permissions
├── requiredData
├── requiredConsent
├── executionMethod
├── confirmationRequired
└── auditRequired
```

Capability types:

```text
KNOWLEDGE
RETRIEVE
DOCUMENT
ACTION
STATUS
TRANSFORM
```

This allows Sanchay AI to determine what it can and cannot do.

---

# 21. RAG Architecture

Sanchay RAG SHALL follow:

```text
Official Source
      ↓
Ingestion
      ↓
Extraction
      ↓
Normalization
      ↓
Chunking
      ↓
Metadata
      ↓
Embedding
      ↓
pgvector
      ↓
Hybrid Retrieval
      ↓
Reranking
      ↓
Context Construction
      ↓
LLM
      ↓
Answer + Citation
```

---

# 22. RAG Sources

Approved sources may include:

- Official government webpages
- Official PDFs
- Information bulletins
- Notifications
- Circulars
- Rules
- Guidelines
- FAQs
- Official announcements

Third-party information SHOULD NOT be treated as authoritative government policy.

---

# 23. RAG Metadata

Every indexed knowledge chunk SHOULD retain metadata such as:

```text
source_id
source_url
title
organization
department
service
document_type
published_at
updated_at
retrieved_at
version
language
content_hash
authority_level
```

This allows:

- Filtering
- Citation
- Freshness checks
- Version tracking
- Source debugging

---

# 24. Hybrid Retrieval

The initial RAG system SHOULD combine:

```text
Keyword / Full Text Search
          +
Vector Similarity Search
          ↓
Candidate Results
          ↓
Reranking
          ↓
Final Context
```

Pure vector search should not be assumed to be sufficient for exact government terms, dates, notification numbers, and form names.

---

# 25. RAG Chunking

Chunking should preserve semantic meaning.

Avoid blindly splitting documents at arbitrary character counts.

Prefer boundaries such as:

- Headings
- Sections
- Paragraph groups
- Tables where extractable
- FAQ entries
- Notification sections

Each chunk should retain enough metadata to reconstruct its source.

---

# 26. RAG Freshness

Government information changes.

The ingestion system SHOULD support:

```text
Source
 ↓
Hash/version check
 ↓
Changed?
 ├── NO → Keep current
 └── YES
      ↓
Reprocess
      ↓
New embeddings
      ↓
Update index
```

Superseded information should be identifiable.

---

# 27. AI Context Architecture

The context builder should construct:

```text
AI Context
├── User
├── Permissions
├── Department
├── Organization
├── Service
├── Page
├── Workflow
├── Current field
├── Conversation
├── Retrieved knowledge
└── Available capabilities
```

Do not blindly send the entire user profile or entire database to the model.

Use minimum necessary context.

---

# 28. AI Memory

Conversation history SHOULD be scoped appropriately.

Distinguish:

```text
Conversation context
≠
Citizen profile
≠
Government service data
```

Permanent citizen information SHALL remain in the appropriate secure data store rather than being treated as chatbot memory.

---

# 29. Authentication

Authentication architecture SHOULD be compatible with:

- OIDC
- OAuth 2.0
- Secure session management
- Approved identity-verification providers
- Government SSO where officially available

The exact provider depends on approved integrations and deployment requirements.

---

# 30. Sanchay UID

The internal UID SHALL be:

- Random
- Non-sequential
- Non-meaningful
- Unique
- Stable

Example conceptual format:

```text
sanchay_uid = UUID
```

The UID must not encode:

- Aadhaar
- Phone
- Email
- Date of birth
- Name

---

# 31. Authorization

Use layered authorization:

```text
Authentication
      ↓
Account authorization
      ↓
Resource authorization
      ↓
Service authorization
      ↓
Capability authorization
      ↓
Action execution
```

AI tool calls must pass through the same authorization model.

---

# 32. Documents

Use **S3-compatible object storage** for binary files.

PostgreSQL stores metadata, not large binary files.

```text
PostgreSQL
  └── document metadata

Object Storage
  └── encrypted document
```

Possible production providers include AWS S3 or another compliant S3-compatible storage service.

The application should abstract storage behind an interface.

---

# 33. Document Processing

Document pipeline:

```text
Upload
 ↓
Authentication
 ↓
Authorization
 ↓
Virus / malware scan
 ↓
Type validation
 ↓
Metadata extraction
 ↓
Optional OCR
 ↓
Encrypted object storage
 ↓
Metadata in PostgreSQL
```

Temporary files should be cleaned after processing.

---

# 34. Search Architecture

Sanchay has two distinct search problems.

### Service Search

Find:

```text
JEE
Ayushman
Scholarship
Driving Licence
```

Use PostgreSQL full-text search initially.

### Knowledge Search

Find relevant government information.

Use:

```text
Keyword + Vector + Reranking
```

Do not mix service discovery and knowledge retrieval into one undifferentiated index.

---

# 35. Government Service Integration

Each government integration SHALL use an adapter.

Concept:

```text
Sanchay Core
     ↓
Service Adapter
     ↓
Official Government System
```

Example:

```text
JEEAdapter
AyushmanAdapter
FutureServiceAdapter
```

Adapters isolate government-specific API formats and workflows from the Sanchay core.

---

# 36. Integration Methods

Depending on official availability and authorization, a service MAY integrate through:

- REST API
- SOAP/API gateway where applicable
- Government SSO
- Approved data exchange
- Webhook
- Official deep link
- Other authorized integration mechanisms

Sanchay SHALL NOT bypass:

- CAPTCHA
- Authentication
- Authorization
- Rate limits
- Anti-bot mechanisms
- Private endpoints
- Other security controls

---

# 37. Integration Failure Isolation

One failing government integration should not bring down Sanchay.

Example:

```text
NTA unavailable
      ↓
JEE functions affected
      ↓
Ayushman remains operational
      ↓
Sanchay remains available
```

Use:

- Timeouts
- Circuit breakers where appropriate
- Retry policies
- Queue-based retries for asynchronous operations
- Clear user-facing errors

---

# 38. Payments

Payment functionality SHALL use the official/authorized payment mechanism exposed by the relevant service.

Sanchay SHALL NOT store unnecessary payment credentials.

Payment state must come from the authoritative payment/service response.

---

# 39. Notifications

Notification channels MAY include:

- In-app notifications
- Email
- SMS
- Push notifications

The notification system should be asynchronous.

```text
Event
 ↓
Queue
 ↓
Notification Worker
 ↓
Channel Provider
```

---

# 40. Audit Logging

Audit events SHALL be stored separately from ordinary application logs.

Important events include:

- Login
- Identity linking
- Consent
- Profile changes
- Document access
- Data sharing
- AI tool execution
- Application submission
- Payment attempts
- Service integration actions
- Administrative changes

Audit records should contain enough information to reconstruct important events without unnecessarily storing sensitive content.

---

# 41. Logging

Use structured JSON logs.

Example conceptual fields:

```text
timestamp
request_id
user_id
service_id
capability_id
action
status
latency
error_code
```

Sensitive values SHALL NOT be logged.

---

# 42. Observability

Use:

**OpenTelemetry**

for:

- HTTP traces
- Database traces
- Queue traces
- AI operation traces
- Integration traces

Metrics should include:

- API latency
- Error rate
- Queue depth
- RAG latency
- Retrieval quality metrics
- Tool execution failures
- Government integration availability
- AI token/cost metrics where available

---

# 43. Error Tracking

Use a production error-tracking platform such as Sentry or an equivalent.

The exact provider is not architecturally mandatory.

Errors should contain:

- Request correlation ID
- Service context
- Capability context
- Environment
- Stack trace

Do not include secrets or unnecessary citizen data.

---

# 44. Testing Stack

## Unit

**Vitest**

Test:

- Business logic
- Eligibility rules
- Field mappings
- Capability resolution
- RAG utilities
- Authorization policies

## Integration

Test:

- PostgreSQL
- Redis
- Service adapters
- API boundaries
- RAG retrieval

## E2E

**Playwright**

Test:

- Login
- Navigation
- Service discovery
- AI interaction
- Application flows
- Profile reuse
- Confirmation
- Error states

---

# 45. AI Testing

AI must be tested differently from ordinary CRUD features.

Maintain versioned evaluation datasets covering:

### RAG

- Retrieval relevance
- Citation correctness
- Source authority
- Freshness
- No-answer behavior

### AI

- Intent recognition
- Context awareness
- Hallucination resistance
- Prompt injection resistance
- Tool selection

### Tools

- Correct capability selection
- Authorization
- Confirmation
- Error handling
- Result fidelity

---

# 46. Prompt Injection Defense

Government documents and webpages SHALL be treated as **untrusted content**, even when they come from an authoritative source.

Retrieved text must not be allowed to override system/developer instructions or tool authorization.

Concept:

```text
Official content
      ↓
Retrieved as DATA
      ↓
AI context
      ↓
Never treated as executable instructions
```

---

# 47. AI Safety Boundary

The model should never receive unrestricted access to:

```text
Database
File system
Government credentials
Internal secrets
```

Instead:

```text
LLM
 ↓
Approved Tool
 ↓
Authorization
 ↓
Validated Input
 ↓
Service Adapter
 ↓
Verified Result
```

---

# 48. Environment Management

Environments:

```text
local
development
staging
production
```

Each environment SHALL have separate:

- Credentials
- Database
- Storage
- API keys
- Service integration credentials where possible

---

# 49. Environment Variables

Sensitive configuration SHALL be supplied through environment/secret management.

Examples:

```text
DATABASE_URL
REDIS_URL

LLM_PROVIDER_KEY
EMBEDDING_PROVIDER_KEY

OBJECT_STORAGE_ENDPOINT
OBJECT_STORAGE_BUCKET
OBJECT_STORAGE_ACCESS_KEY
OBJECT_STORAGE_SECRET_KEY

AUTH_ISSUER
AUTH_CLIENT_ID
AUTH_CLIENT_SECRET

SERVICE_API_* 
```

Actual variable names belong in deployment/configuration documentation.

Secrets SHALL never be committed to Git.

---

# 50. Local Development

Recommended:

```text
Docker Compose
├── PostgreSQL
├── pgvector
├── Redis
└── Sanchay application
```

Developers should be able to start the core platform with minimal setup.

Local mock service adapters SHOULD be available for development when official government credentials/APIs are unavailable.

---

# 51. Mock Integration Strategy

Because government APIs may not be available during development/SIH:

```text
Service Interface
      ↓
 ┌────┴─────┐
 ↓          ↓
Mock       Official
Adapter    Adapter
```

The mock adapter must behave according to the same capability contract.

The UI must never falsely represent mock data as a real government transaction.

---

# 52. Deployment

The exact hosting provider is not locked by this document.

The deployment architecture SHALL support:

```text
CDN / Edge
    ↓
Next.js Frontend
    ↓
API / Backend
    ↓
PostgreSQL
    ↓
Redis
    ↓
Workers
    ↓
Object Storage
    ↓
Government Integrations
```

AI/RAG infrastructure may be managed services or self-hosted depending on cost, compliance, and scale.

---

# 53. Containerization

Use **Docker** for backend/worker environments.

Benefits:

- Reproducible builds
- Consistent development
- Easier staging
- Easier migration between hosting providers

---

# 54. CI/CD

Use **GitHub Actions**.

Pipeline:

```text
Push / Pull Request
      ↓
Lint
      ↓
Type Check
      ↓
Unit Tests
      ↓
Integration Tests
      ↓
Build
      ↓
Security Checks
      ↓
Deploy Staging
      ↓
E2E
      ↓
Production Approval
      ↓
Deploy
```

Production deployment should support rollback.

---

# 55. Dependency Management

Use a consistent package manager across the TypeScript monorepo.

Recommended:

**pnpm**

The repository MAY use a workspace/monorepo structure:

```text
apps/
  web/
  api/
  worker/

packages/
  ui/
  types/
  config/
  ai/
  service-contracts/
```

The exact repository structure is finalized in `07_ARCHITECTURE.md`.

---

# 56. Monorepo Strategy

A monorepo is recommended for the MVP because frontend/backend/shared packages need common types and contracts.

Potential shared packages:

```text
@sanchay/types
@sanchay/ui
@sanchay/service-contracts
@sanchay/config
```

Do not share backend-only code with the browser.

---

# 57. Type Safety

Shared types SHOULD be generated from API contracts where possible.

Avoid manually duplicating:

```text
Frontend type
Backend type
API documentation type
```

Prefer one source of truth.

---

# 58. Security Tooling

Recommended categories:

- Dependency vulnerability scanning
- Secret scanning
- Static analysis
- Container scanning
- SAST
- DAST where appropriate
- Rate-limit testing
- Authorization testing

Tools can be selected during implementation/deployment based on project constraints.

---

# 59. Scalability Strategy

Initial architecture:

```text
Modular Monolith
+
Workers
+
PostgreSQL
+
Redis
+
Object Storage
```

Scale horizontally:

```text
               Load Balancer
                    │
          ┌─────────┼─────────┐
          ↓         ↓         ↓
        API 1     API 2     API N
          │         │         │
          └─────────┼─────────┘
                    ↓
               PostgreSQL
                    +
                  Redis
                    +
                 Workers
```

Do not introduce microservices solely for architectural aesthetics.

---

# 60. When to Split Services

A module may become an independent service when one or more are true:

- Independent scaling requirement
- Independent deployment requirement
- Strong security boundary
- Separate team ownership
- Government integration requires isolation
- Reliability requires isolation
- Performance profile differs significantly

Potential future services:

```text
AI Service
RAG Service
Identity Service
Document Service
Government Integration Gateway
Notification Service
```

These are future extraction candidates, not MVP requirements.

---

# 61. Recommended MVP Architecture

```text
                         USER
                          │
                          ↓
                  Next.js / React
                          │
                     HTTPS/API
                          │
                          ↓
                    NestJS API
                          │
       ┌──────────────────┼──────────────────┐
       ↓                  ↓                  ↓
   PostgreSQL           Redis             Workers
       │                  │                  │
       │               Queue             Ingestion
       │                                  RAG
       │                               Documents
       │                               Notifications
       │
       ├── pgvector
       │
       └── Transactional Data

                    NestJS AI Layer
                          │
             ┌────────────┼────────────┐
             ↓            ↓            ↓
            RAG       Profile/Data    Tools
             │            │            │
             ↓            ↓            ↓
        pgvector       PostgreSQL   Adapters
                                      │
                           ┌──────────┴──────────┐
                           ↓                     ↓
                         NTA                 Ayushman
```

---

# 62. Technology Decisions

## DEC-TECH-001

**Decision:** TypeScript-first.

**Reason:** Shared types and simpler full-stack development.

## DEC-TECH-002

**Decision:** Next.js + React.

**Reason:** Mature frontend architecture and strong ecosystem.

## DEC-TECH-003

**Decision:** NestJS.

**Reason:** Modular backend suitable for a growing platform.

## DEC-TECH-004

**Decision:** PostgreSQL.

**Reason:** Reliable transactional database with strong relational features.

## DEC-TECH-005

**Decision:** pgvector for MVP.

**Reason:** Avoid unnecessary vector infrastructure while retaining a migration path.

## DEC-TECH-006

**Decision:** Redis + BullMQ.

**Reason:** Straightforward caching and background-job architecture.

## DEC-TECH-007

**Decision:** S3-compatible object storage.

**Reason:** Proper separation of binary files from transactional data.

## DEC-TECH-008

**Decision:** Application-owned AI orchestration.

**Reason:** Sanchay AI needs RAG, identity context, capability discovery, authorization, and service tools—not just text generation.

## DEC-TECH-009

**Decision:** Service adapter architecture.

**Reason:** Government systems will differ; integration-specific code must not leak into Sanchay core.

## DEC-TECH-010

**Decision:** Modular monolith before microservices.

**Reason:** Lower complexity for SIH/MVP while preserving clean module boundaries.

---

# 63. Technology Not Locked Yet

The following SHOULD remain configurable until testing/compliance requirements determine the final choice:

- Exact LLM provider/model
- Exact embedding model
- Exact cloud provider
- Exact object-storage provider
- Exact authentication/identity provider
- Exact government API gateway
- Exact observability vendor
- Exact dedicated vector DB, if pgvector becomes insufficient
- Exact payment provider where required by a government service

These choices must be recorded when finalized.

---

# 64. Technology Evaluation Rules

A technology should be selected based on:

1. Security
2. Reliability
3. Maintainability
4. Government-integration compatibility
5. Scalability
6. Performance
7. Developer productivity
8. Cost
9. Vendor lock-in
10. Community/ecosystem maturity

"Popular" alone is not a valid selection criterion.

---

# 65. Non-Negotiable Technical Rules

1. No secrets in source code.
2. No direct browser access to protected databases.
3. No unrestricted LLM database access.
4. No AI action without authorization.
5. No fabricated government results.
6. No bypassing government security controls.
7. No private citizen data in logs.
8. No large binary files in PostgreSQL.
9. No service-specific logic hardcoded into the core AI.
10. No unsupported service capability presented as available.
11. No production deployment without migrations and rollback strategy.
12. No major architecture change without updating the relevant MD files.

---

# 66. Dependency on Later Documents

This document establishes technology choices.

The following documents will refine them:

```text
06_TECH_STACK.md
       ↓
07_ARCHITECTURE.md
       ↓
08_DATABASE.md
       ↓
09_API.md
       ↓
10_SECURITY.md
       ↓
11_IMPLEMENTATION.md
       ↓
12_TESTING.md
       ↓
13_DEPLOYMENT.md
```

Exact schemas, endpoint contracts, architecture diagrams, implementation details, security controls, and deployment configurations belong in those documents.

---

# 67. Final Technical Position

Sanchay should be built as:

> **A TypeScript-first modular government-service platform with PostgreSQL as the transactional core, pgvector-powered RAG, Redis-backed asynchronous workers, S3-compatible document storage, and an application-owned AI orchestration layer that connects official knowledge, authorized citizen data, and service capabilities through secure tools.**

The architecture should start simple enough for an SIH prototype while remaining structurally capable of growing into a large multi-service government platform.
