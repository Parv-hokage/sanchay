# PHASE 2 — GOVERNMENT SERVICE PLATFORM
# SANCHAY — Unified Government Digital Service Platform

**Phase:** 2  
**Status:** Planned  
**Depends On:** Phase 1 — Identity & Citizen Foundation  
**Primary Goal:** Build the reusable government-service platform layer and the first fully navigable Sanchay product experience.

---

# 1. Phase Objective

Phase 2 transforms Sanchay from an identity foundation into a functioning government-service platform.

The phase establishes the reusable hierarchy:

```text
Department
    ↓
Organization
    ↓
Government Service
    ↓
Service Capabilities
    ↓
Capability Requirements
    ↓
Service Integration / Adapter
```

It also creates the first meaningful local visual experience of Sanchay.

At the end of this phase, a developer should be able to run Sanchay locally and navigate:

```text
Home
 ↓
Department
 ↓
Service
 ↓
Service Details
 ↓
Capabilities
```

using real backend data rather than hardcoded frontend pages.

JEE Main and Ayushman Bharat may appear as seeded demonstration services, but their real government integrations remain future-phase work.

---

# 2. Phase Principle

> **Build the platform that can contain hundreds of government services, not two hardcoded government websites.**

Every service must use the same underlying service model.

A future service should be addable by registering:

```text
Department
+
Organization
+
Service
+
Capabilities
+
Requirements
+
Integration
```

without redesigning the Sanchay core.

---

# 3. Scope

## In Scope

### Service Platform

- Departments
- Organizations
- Government Services
- Service Capabilities
- Capability Requirements
- Service Integrations
- Service registry
- Service discovery
- Service metadata
- Service status
- Service categorization

### Backend

- Service registry APIs
- Department APIs
- Organization APIs
- Capability APIs
- Requirement APIs
- Service discovery APIs
- Service detail APIs
- Authorization foundation for service capabilities

### Frontend

- Sanchay home directory
- Department navigation
- Service listing
- Service cards
- Service detail pages
- Capability listing
- Recommended services
- Search/filter foundation
- Responsive layout
- Empty/loading/error states
- Context-aware service navigation
- Local visual product experience

### Local Development

- Seeded demo service data
- Local PostgreSQL data
- Local API
- Local Next.js application
- Functional navigation using backend data

### Initial Demonstration Services

Seed:

```text
Education
 └── NTA
      └── JEE Main

Healthcare
 └── Ayushman Bharat
```

These are demonstration service records.

Do NOT claim that government actions are functional unless an authorized integration exists.

---

# 4. Out of Scope

Do NOT implement in Phase 2:

- Real NTA API integration
- Real Ayushman API integration
- Government scraping
- CAPTCHA bypass
- Private government endpoints
- Application submission
- Payment
- Auto-fill engine
- Full eligibility engine
- RAG ingestion
- Embeddings
- Vector search
- AI orchestrator
- AI tool execution
- Document processing
- Malware scanning
- Production deployment

The service architecture must prepare for these later phases without pretending they already work.

---

# 5. Dependencies

Phase 2 depends on:

```text
PHASE 0 — Foundation
        ↓
PHASE 1 — Identity
        ↓
PHASE 2 — Government Service Platform
```

Required source-of-truth documents:

```text
00_CURRENT_STATE.md
01_PRD.md
02_USER_STORIES.md
03_REQUIREMENTS.md
04_DESIGN.md
05_USER_FLOWS.md
06_TECH_STACK.md
07_ARCHITECTURE.md
08_DATABASE.md
09_API.md
10_AI_RAG.md
11_SECURITY.md
12_IMPLEMENTATION.md
13_TESTING.md
18_TASKS.md
19_DECISIONS.md
phase/PHASE_01_IDENTITY.md
```

---

# 6. Core Domain Model

The core hierarchy is:

```text
Department
    │
    ├── Organization
    │       │
    │       └── Government Service
    │               │
    │               ├── Capability
    │               │      └── Requirement
    │               │
    │               └── Integration
    │
    └── Other Organizations
```

Example:

```text
Education
    ↓
National Testing Agency
    ↓
JEE Main
    ↓
├── Exam Information
├── Eligibility Information
├── Registration
├── Application Status
├── Answer Key
└── Results
```

The capability list must represent what the service supports, not what Sanchay wishes it supported.

---

# 7. Department

A department is a high-level citizen-facing government domain.

Examples:

```text
Education
Healthcare
Finance
Transport
Employment
Housing
```

Departments should contain metadata such as:

- Name
- Description
- Icon/visual identifier
- Status
- Display order
- Visibility

Only fields defined by the existing database/requirements should be introduced.

---

# 8. Organization

An organization represents the government body associated with a service.

Examples:

```text
National Testing Agency
National Health Authority
```

Organizations belong to the appropriate service/domain structure defined in `08_DATABASE.md`.

---

# 9. Government Service

A Government Service represents an individual citizen-facing service.

Examples:

```text
JEE Main
Ayushman Bharat
```

A service should have sufficient metadata to support:

- Display name
- Description
- Organization
- Department
- Status
- Category
- Official source/reference information
- Service icon/visual identity where supported
- Availability state

---

# 10. Service Capability

Capabilities represent actions or information a service can provide.

Examples:

```text
JEE Main
 ├── Exam Information
 ├── Eligibility
 ├── Registration
 ├── Application Status
 ├── Answer Key
 └── Results
```

```text
Ayushman Bharat
 ├── Scheme Information
 ├── Eligibility
 ├── Beneficiary Services
 └── Status
```

Capabilities must be explicit.

Do not give AI or users an implied capability that does not exist in the service registry.

---

# 11. Capability Types

Capabilities may represent:

```text
INFORMATION
ELIGIBILITY
APPLICATION
STATUS
DOCUMENT
RESULT
ACTION
```

Use the exact type system defined by `08_DATABASE.md` and `09_API.md`.

Do not create a new taxonomy if an existing one already exists.

---

# 12. Capability Requirements

A capability may require specific information.

Example:

```text
JEE Application
       ↓
Required:
- Name
- Date of Birth
- Contact
- Address
- Category
- Educational information
```

Phase 2 only defines and stores these requirements.

The actual auto-fill engine belongs to Phase 3.

---

# 13. Service Integration

Every service may have an integration boundary.

Conceptually:

```text
GovernmentService
       ↓
ServiceIntegration
       ↓
Adapter
       ↓
External Government System
```

Phase 2 creates the registry and adapter abstraction.

It does not require a live external government connection.

---

# 14. Adapter Contract

The architecture should support a common adapter interface.

Conceptually:

```text
ServiceAdapter
├── getCapabilities()
├── getPublicInformation()
├── getStatus()
├── getUserData()
└── executeAction()
```

Only methods that are actually supported by a specific service should be enabled.

Do not implement fake external behavior merely to satisfy the interface.

---

# 15. Backend API

Implement the documented Phase 2 endpoints from `09_API.md`.

The API should support:

```text
GET departments
GET department
GET organizations
GET services
GET service
GET service capabilities
GET capability
GET capability requirements
```

Use query/filter parameters only where defined by the API contract.

Follow:

```text
Controller
 ↓
Validation
 ↓
Authorization
 ↓
Service
 ↓
Repository
 ↓
Database
```

Controllers must remain thin.

---

# 16. Public vs Private Service Data

The service directory primarily contains public service metadata.

Example public information:

```text
JEE Main
- Description
- Organization
- Available capabilities
- Official links
- Service status
```

Do not expose citizen-specific information through public service endpoints.

Private citizen data remains protected by Phase 1 authorization.

---

# 17. Authorization

Phase 2 must preserve Phase 1 security guarantees.

A user must not gain additional access merely because a service exists in the directory.

Service discovery can be public where appropriate.

Citizen-specific capabilities must require:

```text
Authentication
+
Authorization
+
Consent where required
```

---

# 18. Frontend Product Experience

Phase 2 is the first phase where the Sanchay interface should feel like the actual product.

The UI should use the design system defined in `04_DESIGN.md`.

It must not look like a collection of unrelated government websites.

---

# 19. Home Page

The home page should provide:

```text
Header
├── Sanchay identity
├── Profile
└── Authentication state

Sidebar / Navigation
├── Home
├── Departments
├── Applications
├── Documents
└── Profile

Main Content
├── Welcome / platform introduction
├── Department categories
├── Recommended services
└── Popular / available services

Floating AI trigger
```

The exact visual implementation must follow `04_DESIGN.md`.

---

# 20. Department Experience

Clicking a department should show:

```text
Department
 ↓
Description
 ↓
Available organizations/services
 ↓
Recommended services
```

Example:

```text
EDUCATION

National Testing Agency

┌─────────────────────┐
│ JEE Main            │
│ Entrance examination│
│ View service →      │
└─────────────────────┘
```

---

# 21. Service Page

Clicking a service should open a unified Sanchay service page.

Example:

```text
JEE MAIN
National Testing Agency

About the service

Available

CAPABILITIES

┌────────────────────────────┐
│ Exam Information           │
│ Learn about the examination│
│ View →                     │
└────────────────────────────┘

┌────────────────────────────┐
│ Eligibility                │
│ Check requirements         │
│ View →                     │
└────────────────────────────┘

┌────────────────────────────┐
│ Registration               │
│ Start when available       │
│ View →                     │
└────────────────────────────┘
```

The page must be generated from backend service/capability data.

Do not hardcode the JEE page structure specifically for JEE.

---

# 22. Service Cards

Service cards should display appropriate:

- Service name
- Organization
- Short description
- Status
- Available capabilities
- Relevant visual identity

Cards should link to dynamic service routes.

Example:

```text
/service/jee-main
/service/ayushman-bharat
```

The route should resolve the service from backend data.

---

# 23. Recommendations

Phase 2 should establish the recommendation UI foundation.

Recommendations may initially be simple deterministic rules such as:

```text
Department preference
Popular service
Recently viewed service
Available service
```

Do NOT implement ML/personalized AI recommendations yet.

The recommendation system must not infer sensitive attributes without an explicit requirement.

---

# 24. Search & Discovery

Implement a basic service discovery foundation.

Support, where defined by the API/design:

```text
Search service
Filter by department
Filter by category
Filter by organization
```

Do not implement semantic AI search yet.

That belongs to the future AI/RAG layers.

---

# 25. AI Integration Point

The global AI button should remain available.

However:

Phase 2 does NOT implement the AI orchestrator.

The UI should provide the correct contextual foundation for future AI.

When AI is eventually opened from:

```text
JEE Main page
```

the context should be capable of representing:

```text
Department: Education
Organization: NTA
Service: JEE Main
Current capability/page: ...
```

Do not implement actual AI reasoning in this phase.

---

# 26. Local Development Experience

This is a mandatory Phase 2 deliverable.

A developer must be able to run Sanchay locally.

Expected experience:

```bash
pnpm install
pnpm dev
```

Then access the frontend through the local development URL defined by the project configuration.

The local environment must run:

```text
Next.js
   ↓
NestJS API
   ↓
PostgreSQL
```

Redis may run as infrastructure where already configured.

---

# 27. Seed Data

Create deterministic development seed data.

At minimum:

```text
DEPARTMENT
Education

ORGANIZATION
National Testing Agency

SERVICE
JEE Main

DEPARTMENT
Healthcare

ORGANIZATION
National Health Authority / appropriate official organization record

SERVICE
Ayushman Bharat
```

Also seed realistic capabilities for demonstration.

Important:

Seed data must clearly represent demo/catalog data.

Do not represent fake API integrations as live.

---

# 28. Dynamic Data Requirement

The frontend must consume service data through the backend.

Do NOT hardcode:

```text
JEE Main
Ayushman Bharat
Education
Healthcare
```

directly into the primary service-directory components if the same information can be retrieved from the service registry.

The database should be the source for service catalog data.

---

# 29. Loading / Error / Empty States

Every service-directory screen must handle:

```text
Loading
Success
Empty
Error
```

Example:

```text
Loading services...
```

```text
No services available.
```

```text
Unable to load services.
Try again.
```

Do not leave blank screens.

---

# 30. Responsive Design

The Phase 2 interface must work on:

```text
Desktop
Tablet
Mobile
```

The desktop experience is the primary design target, but responsive behavior must be intentional.

---

# 31. Accessibility

Follow `04_DESIGN.md`.

At minimum:

- Keyboard navigation
- Visible focus
- Semantic structure
- Accessible buttons/links
- Appropriate labels
- Sufficient contrast
- Screen-reader-friendly navigation

---

# 32. Security Requirements

Follow `11_SECURITY.md`.

Important Phase 2 requirements:

- Service data validation
- Authorization on protected service operations
- No arbitrary external URLs
- Official-source allowlisting where applicable
- No government credentials in frontend
- No secrets in service metadata
- No client-controlled authorization
- Safe service identifiers
- Audit sensitive administrative changes

Public service catalog information may be cached where appropriate.

---

# 33. Testing Requirements

## Backend

Test:

- Department retrieval
- Organization retrieval
- Service retrieval
- Capability retrieval
- Requirement retrieval
- Invalid service ID
- Invalid capability ID
- Filtering/search behavior
- Authorization for protected endpoints

## Ownership / Security

Verify Phase 1 protections remain intact.

Phase 2 must not introduce a route that bypasses existing authorization.

## Frontend

Test:

- Home loads
- Departments display
- Services display
- Service detail opens
- Capabilities display
- Loading state
- Empty state
- Error state
- Responsive layout where practical

## E2E

At minimum:

```text
Open Sanchay
 ↓
View Education
 ↓
Open JEE Main
 ↓
View capabilities
 ↓
Return
 ↓
Open Healthcare
 ↓
Open Ayushman Bharat
```

---

# 34. Visual Acceptance Criteria

This phase is considered visually successful when a developer can run Sanchay locally and clearly see:

```text
SANCHAY
   ↓
Departments
   ↓
Education
   ↓
JEE Main
   ↓
Capabilities
```

and:

```text
SANCHAY
   ↓
Departments
   ↓
Healthcare
   ↓
Ayushman Bharat
   ↓
Capabilities
```

The interface should communicate that these are sections of ONE platform, not two unrelated websites.

---

# 35. Phase Deliverables

```text
✓ Department registry
✓ Organization registry
✓ Government service registry
✓ Capability registry
✓ Capability requirements
✓ Service integration abstraction
✓ Phase 2 APIs
✓ Service discovery
✓ Dynamic service pages
✓ Department pages
✓ Service cards
✓ Recommendations foundation
✓ Seeded demo data
✓ Functional local development
✓ Responsive service directory UI
✓ Loading/error/empty states
✓ Phase 1 security preserved
✓ Unit/integration tests
✓ E2E service-navigation test
✓ Documentation updates
```

---

# 36. Acceptance Criteria

Phase 2 is accepted only when:

### Backend

- Departments can be retrieved.
- Organizations can be retrieved.
- Services can be retrieved.
- Capabilities can be retrieved.
- Capability requirements can be retrieved.
- Data is sourced from PostgreSQL.
- APIs follow `09_API.md`.

### Architecture

- Services use the reusable service model.
- Capabilities are explicit.
- Integrations are represented through adapters.
- JEE and Ayushman do not have separate hardcoded architectures.
- A future service can be added by registering data/configuration and an adapter where required.

### Frontend

- Home directory works.
- Departments work.
- Service listings work.
- Service detail pages work.
- Capabilities are displayed dynamically.
- The UI feels like one unified Sanchay platform.
- The interface runs locally.

### Security

- Existing Phase 1 authorization remains intact.
- No client-side authorization is trusted.
- No government credentials are exposed.
- No fake live integrations are presented as real.

### Quality

- Typecheck passes.
- Lint passes.
- Unit tests pass.
- Integration tests pass.
- E2E navigation passes.
- Production builds pass.

---

# 37. Phase Exit Gate

Do NOT mark Phase 2 complete merely because APIs exist.

The phase must reach:

```text
SERVICE MODEL
      ↓
DATABASE
      ↓
BACKEND API
      ↓
SEED DATA
      ↓
FRONTEND DIRECTORY
      ↓
DEPARTMENT NAVIGATION
      ↓
SERVICE PAGES
      ↓
CAPABILITY PAGES
      ↓
LOCAL HOSTING
      ↓
TESTING
      ↓
SECURITY VALIDATION
      ↓
DOCUMENTATION
      ↓
PHASE 2 COMPLETE
```

---

# 38. Phase 3 Handoff

Once Phase 2 is complete, Sanchay should have the platform needed to introduce:

```text
PHASE 3 — APPLICATION ENGINE

Service Capability
        ↓
Capability Requirements
        ↓
Application
        ↓
Dynamic Form
        ↓
User Data
        ↓
Deterministic Auto-Fill
        ↓
Validation
        ↓
Review
        ↓
Confirmation
```

Phase 3 will build the actual application/form automation layer on top of the service platform.

---

# 39. Documentation Synchronization

After Phase 2 implementation:

Update:

```text
00_CURRENT_STATE.md
17_CHANGELOG.md
18_TASKS.md
```

If contracts or architecture change, update the relevant:

```text
08_DATABASE.md
09_API.md
11_SECURITY.md
12_IMPLEMENTATION.md
```

If an important architectural decision is made:

```text
19_DECISIONS.md
```

The documentation must describe actual implementation, not intended future behavior.

---

# 40. Phase 2 Rule

> **If Sanchay cannot add a new government service without redesigning its core service architecture, Phase 2 has failed.**

The goal is not simply to make JEE and Ayushman visible.

The goal is to make the **Sanchay Service Platform** real.
