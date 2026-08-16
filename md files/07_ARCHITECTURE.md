# 07 — System Architecture
# SANCHAY — Unified Government Digital Service Platform

**Product:** Sanchay  
**MVP Services:** NTA / JEE Main + Ayushman Bharat  
**Architecture Style:** Modular Monolith + Workers + Service Adapters  
**AI Model:** Contextual AI with RAG + Authorized Tool/Capability Execution  
**Version:** 1.0  
**Status:** Technical Architecture

---

# 1. Purpose

This document defines how Sanchay's components work together.

It translates the requirements and technology stack into an actual system architecture covering:

- Citizen identity
- Sanchay UID
- Government-linked user data
- Traditional service interfaces
- Sanchay AI
- RAG
- Vector search
- Service capabilities
- Government integrations
- Applications
- Documents
- Authorization
- Consent
- Audit
- Background processing
- Scalability
- Failure isolation

---

# 2. Core Architectural Principle

> **Sanchay AI operates on least-privilege, task-scoped access. Public government knowledge is broadly accessible through approved sources, while citizen-specific government data is accessed only through authenticated, authorized, and purpose-specific service capabilities.**

The AI SHALL NOT receive unrestricted access to government databases.

---

# 3. Architecture Goals

The architecture must:

1. Provide one unified citizen experience.
2. Support traditional navigation and AI interaction.
3. Allow AI to understand the current service context.
4. Retrieve authoritative public information.
5. Retrieve authorized citizen-specific information.
6. Execute only explicitly supported service capabilities.
7. Minimize exposure of private data.
8. Reuse citizen information where authorized.
9. Support many government services without redesigning the core.
10. Isolate failures between government integrations.
11. Support auditability of sensitive actions.
12. Scale from an SIH prototype to a large platform.

---

# 4. High-Level Architecture

```text
                              CITIZEN
                                 │
                                 ↓
                       ┌───────────────────┐
                       │   SANCHAY WEB UI  │
                       │   Next.js/React   │
                       └─────────┬─────────┘
                                 │
                    ┌────────────┴────────────┐
                    ↓                         ↓
            Traditional UI              Sanchay AI
                    │                         │
                    └────────────┬────────────┘
                                 ↓
                         SANCHAY API CORE
                                 │
       ┌─────────────────────────┼──────────────────────────┐
       ↓                         ↓                          ↓
   Identity &                Service Core                AI Layer
   Citizen Data                  │                          │
       │                  ┌───────┴───────┐          ┌─────┼─────┐
       │                  ↓               ↓          ↓     ↓     ↓
       │             Capabilities    Applications  RAG   Data  Tools
       │                  │               │          │     │     │
       └──────────────────┼───────────────┼──────────┼─────┼─────┘
                          ↓               ↓          ↓     ↓
                     PostgreSQL        Redis      pgvector
                          │
                          ↓
                    Object Storage
                          │
                          ↓
                   Service Adapters
                     ┌────┴────┐
                     ↓         ↓
                    NTA     Ayushman
                     ↓         ↓
              Government Systems
```

---

# 5. Two Interfaces, One System

Sanchay has two primary interfaces:

```text
                    Sanchay Service
                           │
              ┌────────────┴────────────┐
              ↓                         ↓
       Traditional UI              Sanchay AI
              │                         │
              └────────────┬────────────┘
                           ↓
                    Same backend
                    Same capabilities
                    Same permissions
                    Same service state
```

AI is NOT a separate application.

The AI and traditional UI operate over the same underlying service model.

---

# 6. User Login Architecture

The login process establishes the user's Sanchay identity.

```text
User
 ↓
Login
 ↓
Authentication
 ↓
Identity verification
 ↓
Resolve Sanchay UID
 ↓
Load authorized account context
 ↓
Load permitted profile metadata
 ↓
Create secure session
 ↓
Sanchay Home
```

The login process SHALL NOT automatically expose every piece of government data to the AI.

---

# 7. Sanchay UID Architecture

The Sanchay UID is the internal identity anchor.

Properties:

- Unique
- Stable
- Random
- Non-sequential
- Non-meaningful
- Does not encode personal information

Conceptually:

```text
Sanchay UID
     │
     ├── Sanchay Account
     ├── Profile
     ├── Consents
     ├── Linked Services
     ├── Applications
     └── Authorized Documents
```

Government identifiers should be stored as protected linked identifiers where necessary rather than becoming the public Sanchay UID.

---

# 8. Government Identity Linking

Where a government service requires an external identity:

```text
Sanchay UID
     ↓
Authorized service identity link
     ↓
Government Service Account
```

The mapping SHALL be protected.

The AI should not need to know every underlying identifier simply because the user has linked the service.

---

# 9. Data Access Model

Sanchay separates data into three broad classes.

## 9.1 Public Information

Examples:

- Rules
- Eligibility requirements
- Syllabus
- Notifications
- Deadlines
- Public FAQs
- Public service information

Primary source:

```text
Official Government Sources
        ↓
Sanchay Knowledge Layer
        ↓
RAG
        ↓
AI
```

---

## 9.2 Citizen-Specific Data

Examples:

- Application status
- Admit card
- Result
- Answer key
- Profile information
- Authorized documents

This data requires:

```text
Authentication
+
Authorization
+
Purpose / capability
```

---

## 9.3 Sensitive / Highly Restricted Data

Examples may include:

- Identity credentials
- Authentication secrets
- Private government identifiers
- Sensitive documents
- Payment credentials

These SHALL NOT be placed into general AI context.

Access should occur only through tightly controlled backend operations when strictly required.

---

# 10. Least-Privilege AI Context

The AI does NOT receive the entire user profile after login.

Instead:

```text
User Login
    ↓
Secure account context
    ↓
User asks request
    ↓
Determine required capability
    ↓
Determine required data
    ↓
Authorization
    ↓
Retrieve minimum required data
    ↓
Create task-specific AI context
    ↓
LLM
```

Example:

```text
User:
"What is the JEE application deadline?"

Required:
✓ JEE public knowledge

Not required:
✗ Aadhaar
✗ Address
✗ Documents
✗ Previous applications
```

For:

```text
"Fill my JEE application."
```

The system may need:

```text
✓ Authorized profile fields
✓ Authorized application data
✓ Required document metadata/files
✓ JEE requirements
```

Only the required information should be exposed to the AI workflow.

---

# 11. AI Data Boundary

```text
                     SANCHAY AI
                         │
          ┌──────────────┴──────────────┐
          ↓                             ↓
   PUBLIC KNOWLEDGE              PRIVATE DATA
          │                             │
   RAG / official sources        Backend-controlled
          │                      task-specific access
          │                             │
          └──────────────┬──────────────┘
                         ↓
                       LLM
```

The LLM should never have direct database credentials.

---

# 12. AI Architecture

```text
User Request
     ↓
AI API
     ↓
Context Builder
     ↓
Intent Detection
     ↓
Service Identification
     ↓
Capability Resolution
     ↓
Authorization
     │
     ├───────────────┬───────────────────┐
     ↓               ↓                   ↓
    RAG          User Data          Service Tool
     ↓               ↓                   ↓
Official         Protected         Service Adapter
Knowledge        Backend               ↓
     │               │            Government System
     └───────────────┴───────────────────┘
                     ↓
                    LLM
                     ↓
              Verified Response
```

---

# 13. AI Request Lifecycle

Every request follows this conceptual flow:

```text
1. Receive request
        ↓
2. Resolve authenticated user
        ↓
3. Resolve current service/page context
        ↓
4. Understand intent
        ↓
5. Identify required capability
        ↓
6. Determine required data
        ↓
7. Check authorization
        ↓
8. Retrieve public/private context
        ↓
9. Execute tool if required
        ↓
10. Verify result
        ↓
11. Generate response
        ↓
12. Record audit event when required
        ↓
13. Return to user
```

---

# 14. RAG Architecture

```text
Official Government Source
          ↓
Source Collector
          ↓
Document Extraction
          ↓
Normalization
          ↓
Chunking
          ↓
Metadata
          ↓
Embedding
          ↓
PostgreSQL + pgvector
          ↓
Hybrid Retrieval
          ↓
Reranking
          ↓
Context Builder
          ↓
LLM
          ↓
Answer + Source
```

RAG is primarily responsible for authoritative public knowledge.

It is NOT the mechanism for accessing private citizen data.

---

# 15. Public Knowledge Flow

Example:

> "What is the JEE age requirement?"

```text
User
 ↓
AI
 ↓
Service = JEE
 ↓
Knowledge capability
 ↓
RAG
 ↓
Official NTA/JEE sources
 ↓
Relevant passages
 ↓
LLM
 ↓
Answer + source
```

No private citizen data is required.

---

# 16. Private Data Retrieval Flow

Example:

> "Show my JEE result."

```text
User
 ↓
Authenticated session
 ↓
AI identifies RESULT capability
 ↓
Authorization check
 ↓
Resolve user's linked JEE identity
 ↓
Service adapter
 ↓
Authorized government system
 ↓
Result
 ↓
Backend verifies response
 ↓
AI formats result
 ↓
User
```

The LLM does not directly query the government system.

---

# 17. Service Capability Architecture

Every service declares capabilities.

```text
Service
│
├── Knowledge
├── Retrieve
├── Documents
├── Actions
├── Status
└── Transform
```

Example:

```text
JEE Main
│
├── KNOWLEDGE
│   ├── eligibility
│   ├── syllabus
│   ├── dates
│   └── notifications
│
├── RETRIEVE
│   ├── result
│   ├── answer_key
│   └── admit_card
│
├── ACTION
│   ├── prepare_application
│   ├── select_centre
│   └── submit_application
│
└── STATUS
    └── application_status
```

The exact capabilities depend on what the authorized government integration exposes.

---

# 18. AI Tool Architecture

AI tools are controlled service capabilities.

```text
LLM
 ↓
Tool Request
 ↓
Capability Resolver
 ↓
Authorization
 ↓
Input Validation
 ↓
Consent Check
 ↓
Service Adapter
 ↓
Government System
 ↓
Verified Response
 ↓
LLM
```

The model cannot invent arbitrary tool names or arbitrary API calls.

---

# 19. Government Integration Architecture

```text
                    Sanchay Core
                         │
                Integration Gateway
                         │
             ┌───────────┴───────────┐
             ↓                       ↓
        NTA Adapter             Ayushman Adapter
             ↓                       ↓
        NTA Systems           Ayushman Systems
```

Government-specific logic belongs inside adapters.

Sanchay core should not depend on the internal implementation details of one government portal.

---

# 20. Service Adapter Contract

Conceptually:

```text
ServiceAdapter
├── getCapabilities()
├── getPublicInformation()
├── getUserData()
├── getStatus()
├── executeAction()
└── getDocuments()
```

Not every adapter must implement every capability.

Unsupported methods must be explicitly unavailable.

---

# 21. JEE Architecture

```text
Sanchay
  ↓
Education
  ↓
NTA
  ↓
JEE Main Service
  │
  ├── Knowledge → RAG
  ├── Eligibility → Rules + official requirements
  ├── Application → Service capability
  ├── Result → Authorized retrieval
  ├── Answer Key → Authorized retrieval
  ├── Admit Card → Authorized retrieval
  └── Status → Authorized retrieval
```

---

# 22. Ayushman Architecture

```text
Sanchay
  ↓
Healthcare
  ↓
Ayushman Bharat
  │
  ├── Public information
  ├── Eligibility
  ├── Citizen data
  ├── Documents
  ├── Supported actions
  └── Status
```

The same core architecture is reused.

---

# 23. Traditional Service Architecture

A service page is driven by its capability definition.

```text
Service
 ↓
Capability Registry
 ↓
UI Renderer
 ↓
Available actions
```

Example:

```text
JEE Main

[Eligibility]
[Apply]
[Admit Card]
[Result]
[Answer Key]
[Application Status]
[Ask Sanchay AI]
```

Only supported capabilities are displayed as actionable.

---

# 24. AI ↔ Traditional UI Context

Both interfaces use the same service context.

Example:

```text
Department: Education
Organization: NTA
Service: JEE Main
Workflow: Application
Page: Personal Information
Field: Date of Birth
```

When AI opens:

```text
Current UI Context
        ↓
AI Context Builder
        ↓
Sanchay AI
```

When AI closes:

```text
AI
 ↓
Return to same application
 ↓
Same service
 ↓
Same page
 ↓
Same field
```

The user does not start over.

---

# 25. Application Architecture

```text
Application
│
├── Service
├── Citizen
├── Current State
├── Required Fields
├── Completed Fields
├── Documents
├── Selections
├── Consent
├── Submission State
└── Government Reference
```

The application state belongs to Sanchay's transactional backend while authoritative submission state comes from the government service.

---

# 26. Auto-Fill Architecture

```text
Application Schema
       ↓
Required Fields
       ↓
Field Mapping Engine
       ↓
Authorized User Data
       ↓
Match?
 ┌─────┴─────┐
 ↓           ↓
YES          NO
 ↓           ↓
Pre-fill    Ask user
 ↓           ↓
Validation
 └─────┬─────┘
       ↓
Review
```

AI may explain or assist with the mapping, but deterministic field mapping should be preferred for critical data.

---

# 27. Document Architecture

```text
Citizen
 ↓
Document Upload / Government Retrieval
 ↓
Authorization
 ↓
Security Scan
 ↓
Object Storage
 ↓
Metadata → PostgreSQL
```

AI may access a document only when the current authorized task requires it.

---

# 28. Document-to-AI Flow

Example:

> "What does this notification say?"

```text
User selects document
 ↓
Authorization
 ↓
Document retrieval
 ↓
Text extraction / OCR if needed
 ↓
AI context
 ↓
Explanation
```

The AI should not automatically receive every stored document.

---

# 29. Consent Architecture

Sensitive service actions should follow:

```text
Requested capability
       ↓
Required data identified
       ↓
Consent required?
       ↓
Show user:
 ├── Data required
 ├── Purpose
 ├── Government/service destination
 └── Consequence
       ↓
User approves
       ↓
Capability executes
```

Consent records must be auditable.

---

# 30. Authorization Architecture

Authorization is layered:

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
Action authorization
```

AI tool calls must pass through these controls.

---

# 31. Consequential Action Architecture

Examples:

- Application submission
- Payment
- Data sharing
- Document submission
- Profile changes

Flow:

```text
AI prepares action
       ↓
Show exact action
       ↓
User reviews
       ↓
Explicit confirmation
       ↓
Authorization
       ↓
Execution
       ↓
Authoritative result
       ↓
Audit
```

AI should not silently submit consequential actions.

---

# 32. Database Architecture

```text
                     PostgreSQL
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
 Transactional       Knowledge        Audit
    Data             Metadata          Data
        │                │
        │              pgvector
        │                │
        └────────────────┘
```

Potential major domains:

```text
users
identities
profiles
consents
departments
organizations
services
capabilities
applications
documents
knowledge_sources
knowledge_documents
knowledge_chunks
notifications
audit_events
integration_accounts
```

Final schema belongs in `08_DATABASE.md`.

---

# 33. Cache Architecture

```text
Application
 ↓
Redis
 ↓
Cache hit → return
Cache miss
 ↓
PostgreSQL / service
 ↓
Update cache
```

Do not cache sensitive information without an explicit security policy.

---

# 34. Background Worker Architecture

```text
API
 ↓
Redis / Queue
 ↓
Workers
 ├── Knowledge ingestion
 ├── Embedding generation
 ├── Document processing
 ├── OCR
 ├── Notifications
 ├── Integration polling
 └── Cleanup
```

Workers should be idempotent where possible.

---

# 35. Event Architecture

Important system events MAY be represented internally as events:

```text
USER_CREATED
CONSENT_GRANTED
DOCUMENT_UPLOADED
APPLICATION_CREATED
APPLICATION_SUBMITTED
RESULT_AVAILABLE
ANSWER_KEY_AVAILABLE
SERVICE_INTEGRATION_FAILED
```

Events can trigger asynchronous work without coupling modules directly.

---

# 36. Data Flow — Public Information

```text
Official Government Website / PDF
              ↓
       Approved Ingestion
              ↓
          RAG Store
              ↓
          Retrieval
              ↓
              AI
              ↓
        Citizen Response
```

---

# 37. Data Flow — Private Information

```text
Citizen Login
      ↓
Sanchay UID
      ↓
Authorized service identity
      ↓
User requests private information
      ↓
Capability authorization
      ↓
Service adapter
      ↓
Government system
      ↓
Verified result
      ↓
Task-scoped AI context
      ↓
Citizen
```

---

# 38. Data Flow — Application

```text
Citizen
 ↓
AI / Traditional UI
 ↓
Service Capability
 ↓
Eligibility
 ↓
Profile data
 ↓
Document data
 ↓
Missing information
 ↓
User decisions
 ↓
Review
 ↓
Confirmation
 ↓
Authorization
 ↓
Government adapter
 ↓
Government service
 ↓
Submission result
 ↓
Sanchay status
```

---

# 39. Data Flow — Answer Key

```text
Citizen:
"Show my answer key."

 ↓

Authenticate
 ↓
Identify JEE service
 ↓
Resolve ANSWER_KEY capability
 ↓
Authorize
 ↓
Government adapter
 ↓
NTA / authorized service
 ↓
Answer key
 ↓
Verify response
 ↓
Display
 ↓
Optional AI explanation
```

---

# 40. Data Flow — Result Explanation

```text
User:
"Explain my JEE percentile."

 ↓
Retrieve official result
 ↓
Verify source
 ↓
AI receives only required result data
 ↓
AI explanation
 ↓
Clearly label:
Official value
+
AI interpretation
```

---

# 41. Failure Isolation

A government integration failure must not crash Sanchay.

```text
                 SANCHAY
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
         NTA              Ayushman
          │                   │
       FAILURE             ONLINE
          │                   │
       JEE affected       Healthcare works
          │
       Sanchay remains online
```

Use:

- Timeouts
- Retries where safe
- Circuit breakers
- Queue-based retries
- Health checks
- Clear degraded-state UI

---

# 42. AI Failure Handling

## No reliable knowledge

```text
Question
 ↓
No authoritative evidence
 ↓
Do not fabricate
 ↓
Explain limitation
 ↓
Provide official source if available
```

## Tool failure

```text
Tool request
 ↓
Government system unavailable
 ↓
Do not claim success
 ↓
Show accurate failure
 ↓
Offer retry / official portal
```

## Ambiguous request

```text
User request
 ↓
Multiple possible services
 ↓
Ask clarification
 ↓
Continue
```

---

# 43. Security Boundary

```text
                INTERNET
                   │
                   ↓
              WEB FRONTEND
                   │
                   ↓
              API GATEWAY
                   │
          ┌────────┴────────┐
          ↓                 ↓
      Application         AI Layer
          │                 │
          └────────┬────────┘
                   ↓
              Authorization
                   │
       ┌───────────┼───────────┐
       ↓           ↓           ↓
    Database      RAG       Service Tools
       │                       │
       │                       ↓
       │                 Government APIs
       ↓
  Object Storage
```

No external user or LLM should bypass the API/security boundary.

---

# 44. AI Security Boundary

The LLM must NOT have:

```text
✗ Database credentials
✗ Government credentials
✗ Object-storage credentials
✗ Arbitrary HTTP access
✗ Arbitrary code execution
✗ Unrestricted filesystem access
```

It receives controlled context and invokes controlled tools.

---

# 45. Prompt Injection Boundary

Government webpages and documents are treated as **data**, not instructions.

```text
Official Document
       ↓
Extracted Content
       ↓
Retrieved as DATA
       ↓
AI Context
```

Retrieved content must never override:

- System instructions
- Security policy
- Authorization
- Tool permissions

---

# 46. Privacy Architecture

Principles:

- Data minimization
- Purpose limitation
- Least privilege
- Explicit consent where required
- Encryption in transit
- Encryption at rest
- Access logging
- Retention controls
- Secure deletion
- No unnecessary AI exposure

---

# 47. AI Privacy Rule

The system should follow:

> **Do not send data to the model simply because it exists. Send it because the current task requires it and the user is authorized to use it.**

Example:

```text
Question:
"When is JEE registration ending?"

AI context:
✓ JEE public knowledge
✗ User Aadhaar
✗ User address
✗ User documents
```

---

# 48. Scalability Architecture

MVP:

```text
Next.js
   ↓
NestJS modular backend
   ↓
PostgreSQL + pgvector
   +
Redis
   +
Workers
   +
Object Storage
```

Scale:

```text
                 Load Balancer
                      │
          ┌───────────┼───────────┐
          ↓           ↓           ↓
        API 1       API 2       API N
          │           │           │
          └───────────┼───────────┘
                      ↓
                 PostgreSQL
                      +
                    Redis
                      +
                   Workers
```

Government adapters can be independently scaled if required.

---

# 49. Service Expansion Architecture

Adding a new service should look like:

```text
New Government Service
        ↓
Define Service
        ↓
Define Capabilities
        ↓
Define Knowledge Sources
        ↓
Implement Adapter
        ↓
Define Permissions
        ↓
Define Data Mapping
        ↓
Test
        ↓
Register Service
        ↓
Available in Sanchay
```

The core AI should not need to be rewritten.

---

# 50. Future Microservice Extraction

The MVP should remain a modular monolith.

Potential future extraction:

```text
Sanchay Core
 ├── Identity Service
 ├── AI Service
 ├── RAG Service
 ├── Document Service
 ├── Integration Gateway
 ├── Notification Service
 └── Audit Service
```

Extraction should happen only when justified by:

- Scale
- Reliability
- Security boundaries
- Team ownership
- Independent deployment

---

# 51. Deployment Architecture

```text
                         CDN / Edge
                             │
                             ↓
                        Next.js Web
                             │
                           HTTPS
                             ↓
                        API Layer
                             │
            ┌────────────────┼────────────────┐
            ↓                ↓                ↓
       PostgreSQL          Redis           Workers
            │                │                │
         pgvector          Queue         RAG/Docs/etc.
            │
            ↓
      Object Storage

             API
              │
              ↓
       Integration Gateway
          ┌───┴───┐
          ↓       ↓
         NTA   Ayushman
```

---

# 52. Availability Strategy

Critical principles:

- Stateless API instances
- Horizontal scaling
- Managed PostgreSQL where possible
- Database backups
- Object-storage durability
- Queue retry
- Government integration timeouts
- Health checks
- Graceful degradation

Sanchay should remain usable even when one external service is temporarily unavailable.

---

# 53. Observability Architecture

```text
Frontend
Backend
Workers
AI
RAG
Integrations
   │
   ↓
OpenTelemetry
   │
   ├── Logs
   ├── Metrics
   └── Traces
```

Every important request should have a correlation/request ID.

---

# 54. Audit Architecture

Sensitive events:

```text
Action
 ↓
Authorization
 ↓
Execution
 ↓
Audit Event
```

Audit examples:

```text
LOGIN
CONSENT_GRANTED
DATA_ACCESSED
DOCUMENT_ACCESSED
AI_TOOL_EXECUTED
APPLICATION_SUBMITTED
PAYMENT_INITIATED
PROFILE_CHANGED
```

Audit logs must not unnecessarily store sensitive payloads.

---

# 55. Architecture Invariants

The following SHALL remain true unless formally changed:

1. AI does not have unrestricted database access.
2. AI does not have unrestricted government-system access.
3. Private data is task-scoped.
4. Public information can be served through the knowledge layer.
5. Service actions go through capability authorization.
6. Government-specific logic stays inside adapters.
7. Traditional UI and AI share service state.
8. Consequential actions require appropriate confirmation.
9. Unsupported capabilities are never presented as supported.
10. Government results are never fabricated.
11. Citizen data is not unnecessarily sent to the LLM.
12. Security controls apply equally to AI and traditional interfaces.

---

# 56. Example: Complete JEE AI Journey

User:

> "Help me apply for JEE."

```text
LOGIN
  ↓
Sanchay UID resolved
  ↓
Secure profile context
  ↓
User asks AI
  ↓
Identify:
Education → NTA → JEE Main
  ↓
Resolve:
PREPARE_APPLICATION
  ↓
Check official eligibility
  ↓
Use minimum required profile data
  ↓
Eligible?
  ↓
YES
  ↓
Retrieve required fields
  ↓
Auto-fill authorized data
  ↓
Find missing fields
  ↓
Ask user
  ↓
User provides choices
  ↓
Application prepared
  ↓
User reviews
  ↓
User confirms
  ↓
Capability authorization
  ↓
NTA Adapter
  ↓
Authorized NTA system
  ↓
Submission result
  ↓
Store application status
  ↓
Show official result
```

---

# 57. Example: JEE Answer Key Journey

User:

> "Show me my answer key."

```text
Authenticated user
      ↓
JEE context
      ↓
ANSWER_KEY capability
      ↓
Authorization
      ↓
NTA adapter
      ↓
Retrieve official answer key
      ↓
Verify
      ↓
Display
      ↓
User:
"Explain question 17."
      ↓
AI receives only required question/answer context
      ↓
Explanation
```

---

# 58. Example: Public Question

User:

> "When will JEE answer keys be released?"

```text
AI
 ↓
JEE context
 ↓
RAG
 ↓
Official NTA sources
 ↓
Retrieve latest authoritative information
 ↓
Answer
 ↓
Citation/source
```

No private data is touched.

---

# 59. Architecture Success Criteria

The architecture is successful when:

- One citizen can use many services through one platform.
- AI can understand service context.
- AI can answer using authoritative knowledge.
- AI can retrieve authorized citizen data.
- AI can invoke only approved capabilities.
- Private data is minimized.
- Traditional and AI flows remain interchangeable.
- Government-specific integrations remain isolated.
- New services can be added without redesigning Sanchay.
- One external integration failure does not take down the platform.
- Sensitive actions are auditable.

---

# 60. Relationship to Other MD Files

```text
01_PRD.md
   ↓
02_USER_STORIES.md
   ↓
03_REQUIREMENTS.md
   ↓
04_DESIGN.md
   ↓
05_USER_FLOWS.md
   ↓
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
```

This document defines **how the system is structured**.

It does not finalize:

- Exact database columns
- Exact API request/response schemas
- Detailed security controls
- Individual implementation tasks

Those belong to later documents.

---

# 61. Final Architecture Statement

> **Sanchay is architected as a unified, modular government-service platform where traditional interfaces and Sanchay AI operate over the same service capabilities. Public government knowledge is delivered through an authoritative RAG layer, while citizen-specific information and service actions are accessed through authenticated, authorized, task-scoped backend capabilities. The AI never receives unrestricted access to private databases or government systems; every consequential operation passes through explicit capability, authorization, validation, and audit boundaries.**

This architecture allows JEE and Ayushman Bharat to be the first services while keeping the platform structurally ready for many future government services.
