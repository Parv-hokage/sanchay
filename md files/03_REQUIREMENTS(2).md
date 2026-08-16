# 03 — System Requirements Specification
# SANCHAY — Unified Government Digital Service Platform

**Product:** Sanchay  
**MVP:** NTA / JEE Main + Ayushman Bharat  
**Version:** 2.0  
**Status:** Foundation Specification

---

# 0. Purpose

This document defines **precise, testable system requirements** derived from the PRD and User Stories.

It answers:

> **What must the system do?**

It does not decide the exact programming language, database, cloud provider, or UI implementation.

---

# 1. Requirement Language

| Term | Meaning |
|---|---|
| **SHALL** | Mandatory |
| **SHOULD** | Recommended |
| **MAY** | Optional / future |

| Priority | Meaning |
|---|---|
| **P0** | Required for SIH MVP |
| **P1** | Important production capability |
| **P2** | Future capability |

Format:

```text
REQ-[DOMAIN]-[NUMBER]
```

---

# 2. Product Architecture Requirements

## REQ-CORE-001 — Unified Platform

**P0**

Sanchay SHALL provide one citizen-facing platform through which supported government services can be discovered and accessed.

## REQ-CORE-002 — Department Hierarchy

**P0**

The platform SHALL support a hierarchy equivalent to:

```text
Department / Domain
  ↓
Organization / Provider
  ↓
Service
  ↓
Workflow
```

## REQ-CORE-003 — Service-as-Module

**P0**

Supported government services SHALL be represented as modular service integrations rather than hardcoded one-off application flows.

## REQ-CORE-004 — Existing Infrastructure Compatibility

**P0**

The platform SHALL support authorized interaction with existing government systems where integrations are available.

## REQ-CORE-005 — No False Replacement

**P0**

The platform SHALL clearly distinguish between Sanchay functionality and underlying official government infrastructure.

---

# 3. Identity Requirements

## REQ-ID-001 — One Account Per Verified Identity

**P0**

A verified citizen identity SHALL map to at most one Sanchay platform account.

## REQ-ID-002 — Unique UID

**P0**

Every Sanchay account SHALL have one unique internal platform UID.

## REQ-ID-003 — UID Independence

**P0**

The UID SHALL NOT be derived from Aadhaar, phone number, email, name, or date of birth.

## REQ-ID-004 — UID Stability

**P0**

The platform UID SHALL remain stable for the lifetime of the account.

## REQ-ID-005 — Approved Identity Verification

**P0**

Account creation SHALL use an approved identity-verification mechanism.

## REQ-ID-006 — Aadhaar Is Not Universal UID

**P0**

Aadhaar SHALL NOT be used as the universal Sanchay account identifier.

Where officially authorized, Aadhaar MAY be used as one verification/authentication mechanism.

## REQ-ID-007 — Alternative Verification

**P0**

The platform architecture SHALL allow supported citizens who do not use Aadhaar to authenticate through another approved mechanism where available.

## REQ-ID-008 — Duplicate Registration Prevention

**P0**

The system SHALL detect an existing verified identity before creating a new account.

## REQ-ID-009 — Authentication Linking

**P0**

Multiple approved authentication methods MAY be linked to one Sanchay UID after appropriate verification.

## REQ-ID-010 — Account Recovery

**P0**

Account recovery SHALL restore access to the existing UID rather than creating another account.

---

# 4. Navigation Requirements

## REQ-NAV-001 — Department Discovery

**P0**

Users SHALL be able to browse government departments/domains.

## REQ-NAV-002 — Organization Discovery

**P0**

Users SHALL be able to view relevant organizations/service providers within a department.

## REQ-NAV-003 — Service Discovery

**P0**

Users SHALL be able to discover services within an organization.

## REQ-NAV-004 — Search

**P0**

Users SHALL be able to search supported government services.

## REQ-NAV-005 — Recommendations

**P1**

The platform SHOULD provide relevant service recommendations where sufficient authorized context exists.

## REQ-NAV-006 — Consistent Hierarchy

**P0**

The navigation hierarchy SHALL remain consistent across supported departments and services.

---

# 5. Traditional Interface Requirements

## REQ-UI-001 — Non-AI Service Access

**P0**

Every supported service SHALL have a traditional navigation path that does not require AI.

## REQ-UI-002 — Standard Service Layout

**P0**

Supported integrated services SHALL expose a consistent set of service concepts such as:

- Overview
- Eligibility
- Requirements
- Application
- Documents
- Status
- Official portal

Only applicable sections need to be displayed for a specific service.

## REQ-UI-003 — Unified Experience

**P0**

Where authorized integration exists, the user SHALL experience the integrated service as part of Sanchay rather than being unnecessarily redirected between unrelated interfaces.

## REQ-UI-004 — Official Portal Access

**P0**

The platform SHALL provide access to the official government portal where one exists.

## REQ-UI-005 — Context Preservation

**P0**

Moving between supported traditional service views SHALL preserve relevant service context.

---

# 6. Contextual AI Requirements

## REQ-AI-001 — Persistent AI Entry Point

**P0**

A Sanchay AI entry point SHALL be available throughout the supported platform experience.

## REQ-AI-002 — Conversational Interface

**P0**

Sanchay AI SHALL support a conversational interaction model.

## REQ-AI-003 — Current Department Context

**P0**

The AI context SHALL include the current department/domain where applicable.

## REQ-AI-004 — Current Organization Context

**P0**

The AI context SHALL include the current organization/service provider where applicable.

## REQ-AI-005 — Current Service Context

**P0**

The AI context SHALL include the current government service.

## REQ-AI-006 — Current Page Context

**P0**

The AI context SHALL include the current page or workflow state where relevant.

## REQ-AI-007 — Current Action Context

**P0**

The AI context SHOULD include the action currently being performed, such as eligibility checking, application completion, document upload, or review.

## REQ-AI-008 — Authorized User Context

**P0**

The AI MAY use relevant authorized citizen profile information when required for the current task.

## REQ-AI-009 — Contextual Questions

**P0**

The AI SHALL be capable of responding to contextual questions without requiring the user to repeat known service context.

## REQ-AI-010 — Context Preservation

**P0**

Opening or closing the AI SHALL NOT unnecessarily reset the citizen's current service/workflow context.

## REQ-AI-011 — Controlled Tool Use

**P0**

AI-initiated actions SHALL execute only through explicitly authorized tools/service interfaces.

## REQ-AI-012 — No Unrestricted Data Access

**P0**

The AI SHALL NOT have unrestricted direct access to protected databases or document storage.

## REQ-AI-013 — Consequential Confirmation

**P0**

The AI SHALL require explicit citizen confirmation before consequential actions such as final submission or payment.

## REQ-AI-014 — No False Completion

**P0**

The AI SHALL NOT claim that an action succeeded unless the underlying authorized system confirms success.

---

# 7. Citizen Profile Requirements

## REQ-PROFILE-001 — Profile

**P0**

Every Sanchay account SHALL have an associated citizen profile.

## REQ-PROFILE-002 — Profile Visibility

**P0**

The citizen SHALL be able to view relevant information stored in their profile.

## REQ-PROFILE-003 — Profile Editing

**P0**

The citizen SHALL be able to edit profile fields that are permitted to be user-editable.

## REQ-PROFILE-004 — Data Classification

**P0**

The system SHOULD distinguish between user-provided, verified, and service-derived information.

## REQ-PROFILE-005 — Authorized Reuse

**P0**

The system SHALL be able to reuse authorized profile information in supported service workflows.

## REQ-PROFILE-006 — Field Mapping

**P0**

The system SHALL support mapping common profile attributes to service-specific fields.

## REQ-PROFILE-007 — Data Minimization

**P0**

Only required and authorized profile information SHALL be used for a service action.

---

# 8. Consent Requirements

## REQ-CONSENT-001 — Consent

**P0**

The platform SHALL obtain consent where required before sharing citizen information with a service.

## REQ-CONSENT-002 — Consent Explanation

**P0**

Before consent, the platform SHALL communicate what information is being requested, why it is needed, and which service will use it.

## REQ-CONSENT-003 — Consent Record

**P0**

Relevant consent decisions SHALL be auditable.

## REQ-CONSENT-004 — No Unrelated Sharing

**P0**

The platform SHALL NOT share unrelated profile information with a service merely because it is available.

---

# 9. Document Requirements

## REQ-DOC-001 — Document Management

**P0**

The platform SHALL provide secure management of supported citizen documents.

## REQ-DOC-002 — Required Document Detection

**P0**

The system SHALL identify required documents for supported workflows.

## REQ-DOC-003 — Existing Document Detection

**P0**

The system SHALL identify when an authorized existing document can satisfy a requirement.

## REQ-DOC-004 — Missing Documents

**P0**

The system SHALL clearly identify missing required documents.

## REQ-DOC-005 — Authorized Document Sharing

**P0**

Documents SHALL only be shared with a service through an authorized workflow.

---

# 10. RAG / Knowledge Requirements

## REQ-RAG-001 — Official Sources

**P0**

The RAG knowledge base SHALL prioritize approved authoritative government sources.

## REQ-RAG-002 — Supported Source Types

**P0**

The knowledge ingestion system SHALL support approved sources such as webpages, PDFs, bulletins, notifications, circulars, FAQs, and guidelines.

## REQ-RAG-003 — Source Metadata

**P0**

Indexed knowledge SHALL retain source metadata sufficient to identify its origin.

## REQ-RAG-004 — Retrieval Before Government Answer

**P0**

Supported government-information responses SHALL retrieve relevant knowledge before generation.

## REQ-RAG-005 — Source Attribution

**P0**

Important government-information responses SHALL provide source attribution where available.

## REQ-RAG-006 — Source Versioning

**P0**

The system SHALL track source version/update information where available.

## REQ-RAG-007 — Stale Content

**P0**

The knowledge system SHALL be capable of identifying stale or superseded information.

## REQ-RAG-008 — No Unsupported Government Claims

**P0**

The AI SHALL NOT present unsupported generated content as an official rule, requirement, eligibility condition, or policy.

## REQ-RAG-009 — Retrieval Traceability

**P0**

Important government-information responses SHALL be internally traceable to the knowledge retrieved for the response.

---

# 11. Eligibility Requirements

## REQ-ELIG-001 — Eligibility Check

**P0**

Supported structured eligibility conditions SHALL be evaluated before unnecessary application steps.

## REQ-ELIG-002 — Current Requirements

**P0**

Eligibility evaluation SHALL use the currently supported official requirements.

## REQ-ELIG-003 — Deterministic Evaluation

**P0**

Eligibility conditions that can be expressed deterministically SHOULD be evaluated using deterministic rules rather than relying solely on free-form LLM reasoning.

## REQ-ELIG-004 — Ineligibility Explanation

**P0**

The platform SHALL explain applicable reasons for ineligibility and provide supporting official information where available.

## REQ-ELIG-005 — No Unsupported Eligibility

**P0**

The platform SHALL NOT make a definitive eligibility decision solely from unsupported AI inference.

---

# 12. Application Requirements

## REQ-APP-001 — Start Workflow

**P0**

The platform SHALL initialize supported application workflows after identifying the service and applicable eligibility conditions.

## REQ-APP-002 — Required Fields

**P0**

The platform SHALL identify required application fields.

## REQ-APP-003 — Automatic Pre-Fill

**P0**

Supported fields SHALL be pre-filled using authorized profile information when available.

## REQ-APP-004 — Missing Information

**P0**

The system SHALL identify unavailable required information.

## REQ-APP-005 — Minimal Questioning

**P0**

The AI SHOULD avoid requesting information already available and authorized for the current workflow.

## REQ-APP-006 — User Decisions

**P0**

The system SHALL explicitly request user input for decisions that cannot or should not be inferred.

## REQ-APP-007 — Application Review

**P0**

The citizen SHALL be able to review the application before consequential submission.

## REQ-APP-008 — Editable Data

**P0**

The citizen SHALL be able to correct permitted information before submission.

## REQ-APP-009 — Submission Confirmation

**P0**

Final submission SHALL require explicit citizen confirmation.

---

# 13. Recommendations

## REQ-REC-001 — Recommendations

**P1**

The system SHOULD provide recommendations when a supported service offers multiple valid choices.

## REQ-REC-002 — Recommendation Basis

**P1**

The platform SHOULD explain relevant factors behind recommendations.

## REQ-REC-003 — User Control

**P0**

Recommendations SHALL NOT automatically become final selections without appropriate confirmation.

---

# 14. Payment

## REQ-PAY-001 — Payment Amount

**P0**

The platform SHALL display the applicable official payment amount before payment where available.

## REQ-PAY-002 — Authorized Payment

**P0**

Payments SHALL use authorized service/payment mechanisms.

## REQ-PAY-003 — Payment Confirmation

**P0**

Payment SHALL only be shown as successful after confirmation from the underlying authorized system.

---

# 15. Existing Portal Integration

## REQ-PORTAL-001 — Official URL

**P0**

Each supported service SHALL maintain its verified official portal URL where applicable.

## REQ-PORTAL-002 — Deep Links

**P1**

The platform SHOULD support official deep links where available.

## REQ-PORTAL-003 — Government SSO

**P1**

The platform SHOULD support authorized government SSO integrations where available.

## REQ-PORTAL-004 — No Security Bypass

**P0**

The platform SHALL NOT bypass authentication, authorization, CAPTCHA, rate limits, or other government security mechanisms.

---

# 16. Application Status

## REQ-STATUS-001 — Supported Status

**P1**

Where authorized, the platform SHOULD retrieve application status from the underlying government service.

## REQ-STATUS-002 — Authorized Status

**P0**

Application status SHALL originate from an authorized source.

## REQ-STATUS-003 — No Fabricated Status

**P0**

The platform SHALL NOT fabricate or infer official status when authoritative status is unavailable.

---

# 17. Service Integration

## REQ-INTEG-001 — Standard Service Contract

**P0**

Integrated services SHALL use a standardized service integration model.

## REQ-INTEG-002 — Service Isolation

**P0**

Service-specific business logic SHALL remain isolated from the platform core.

## REQ-INTEG-003 — Service Configuration

**P1**

The service model SHOULD support configuration of:

- Metadata
- Requirements
- Eligibility
- Documents
- Field mappings
- RAG sources
- Actions
- APIs
- Status
- Official portal

## REQ-INTEG-004 — Add Service Without Core Redesign

**P0**

Adding a new supported service SHALL NOT require redesigning the core account, navigation, AI, or traditional UI systems.

## REQ-INTEG-005 — Failure Isolation

**P1**

Failure of one service integration SHOULD NOT make unrelated services unavailable.

---

# 18. NTA / JEE Requirements

## REQ-JEE-001 — JEE Knowledge

**P0**

Sanchay SHALL provide approved JEE information through the knowledge system.

## REQ-JEE-002 — JEE Eligibility

**P0**

Sanchay SHALL support eligibility guidance for the supported JEE workflow using current approved requirements.

## REQ-JEE-003 — JEE Fields

**P0**

Sanchay SHALL identify required JEE application information.

## REQ-JEE-004 — JEE Documents

**P0**

Sanchay SHALL identify required JEE documents for the supported workflow.

## REQ-JEE-005 — JEE Pre-Fill

**P0**

The MVP SHALL demonstrate authorized profile-based pre-filling for supported JEE fields.

## REQ-JEE-006 — JEE Missing Information

**P0**

The MVP SHALL identify missing JEE information and user decisions.

## REQ-JEE-007 — JEE Recommendations

**P1**

The platform SHOULD support exam-centre recommendations where reliable authorized data exists.

## REQ-JEE-008 — JEE Official Portal

**P0**

The platform SHALL provide access to the official NTA/JEE portal.

---

# 19. Ayushman Requirements

## REQ-AYU-001 — Ayushman Knowledge

**P0**

Sanchay SHALL provide approved Ayushman information through the knowledge system.

## REQ-AYU-002 — Ayushman Eligibility

**P0**

Sanchay SHALL support eligibility guidance for supported Ayushman workflows.

## REQ-AYU-003 — Ayushman Requirements

**P0**

The platform SHALL identify required information and documents for supported Ayushman workflows.

## REQ-AYU-004 — Ayushman Reuse

**P0**

The MVP SHALL demonstrate authorized profile/document reuse where the supported workflow permits it.

## REQ-AYU-005 — Ayushman Official Portal

**P0**

The platform SHALL provide access to the relevant official Ayushman portal.

---

# 20. Security

## REQ-SEC-001 — Authentication

**P0**

Protected resources SHALL require appropriate authentication.

## REQ-SEC-002 — Authorization

**P0**

Protected resources and actions SHALL enforce authorization.

## REQ-SEC-003 — Encryption

**P0**

Sensitive information SHALL be protected in transit and at rest using appropriate security controls.

## REQ-SEC-004 — Secret Management

**P0**

Secrets, API keys, credentials, and tokens SHALL NOT be hardcoded in source code.

## REQ-SEC-005 — User Isolation

**P0**

A citizen SHALL NOT access another citizen's protected information.

## REQ-SEC-006 — AI Security Boundary

**P0**

AI tools SHALL enforce the same authorization boundaries as direct application actions.

## REQ-SEC-007 — Auditability

**P0**

Security-sensitive and consequential actions SHALL be auditable.

---

# 21. Privacy

## REQ-PRIV-001 — Data Minimization

**P0**

The platform SHALL collect and retain only information required for supported functionality.

## REQ-PRIV-002 — Purpose Limitation

**P0**

Citizen information SHALL only be used for authorized purposes.

## REQ-PRIV-003 — Consent Visibility

**P0**

Citizens SHALL be able to understand relevant data-sharing decisions.

## REQ-PRIV-004 — Private AI Context

**P0**

Private citizen context SHALL only be provided to AI components when required and authorized for the current task.

## REQ-PRIV-005 — No Default Training Use

**P0**

Citizen private data SHALL NOT automatically be used as model-training data.

---

# 22. Accessibility

## REQ-ACC-001 — Responsive Experience

**P0**

Core journeys SHALL be usable on supported desktop and mobile devices.

## REQ-ACC-002 — Keyboard Accessibility

**P1**

Core workflows SHOULD support keyboard navigation.

## REQ-ACC-003 — Screen Reader Support

**P1**

Core workflows SHOULD support screen readers.

## REQ-ACC-004 — Clear Language

**P0**

Sanchay explanations SHALL use understandable language without changing official requirements.

## REQ-ACC-005 — Multilingual Architecture

**P1**

The system SHOULD support multilingual content.

Initial target:

- English
- Hindi

---

# 23. Reliability

## REQ-REL-001 — Safe Failure

**P0**

When an integration fails, Sanchay SHALL fail safely and clearly communicate that the requested action could not be completed.

## REQ-REL-002 — No False Success

**P0**

The platform SHALL NOT show success without underlying confirmation.

## REQ-REL-003 — Service Isolation

**P1**

One failed service integration SHOULD NOT take down unrelated services.

---

# 24. Performance

## REQ-PERF-001 — Responsive Navigation

**P0**

Common navigation interactions SHALL provide a responsive experience under expected MVP load.

## REQ-PERF-002 — AI Progress Feedback

**P1**

Long-running AI operations SHOULD provide progress/streaming/status feedback.

## REQ-PERF-003 — RAG Responsiveness

**P1**

RAG retrieval SHOULD meet an interactive latency target defined in the architecture/testing documents.

---

# 25. Scalability

## REQ-SCALE-001 — New Departments

**P0**

The platform SHALL support adding new departments/domains without redesigning the core platform.

## REQ-SCALE-002 — New Services

**P0**

The platform SHALL support adding new government services through the standardized service model.

## REQ-SCALE-003 — Knowledge Growth

**P1**

The knowledge system SHOULD support additional departments, services, documents, and languages without requiring a new RAG architecture.

## REQ-SCALE-004 — Model Flexibility

**P1**

The AI layer SHOULD allow supported models to be changed or upgraded without rewriting the entire platform.

---

# 26. Audit

## REQ-AUDIT-001 — Consequential Actions

**P0**

Relevant events such as consent, identity linking, application submission, payment attempts, and data sharing SHALL be auditable.

## REQ-AUDIT-002 — Audit Protection

**P0**

Audit records SHALL be protected against unauthorized modification.

## REQ-AUDIT-003 — AI Action Trace

**P1**

Important AI actions SHOULD be traceable internally to the tools/actions invoked.

---

# 27. SIH MVP Requirements

The prototype SHALL demonstrate:

### Platform
- Sanchay branding
- Department navigation
- Service hierarchy
- My Profile
- My Documents
- My Applications
- Traditional service experience
- Persistent AI entry point

### Identity
- One UID per verified prototype identity
- Duplicate prevention
- Login/recovery concept

### AI
- Chat-style interface
- Context-aware AI
- Service discovery
- Government Q&A
- RAG
- Official citations
- Current-screen assistance

### JEE
- Eligibility scenario
- Profile reuse
- Application preparation
- Missing information
- Review
- Official portal access

### Ayushman
- Information
- Eligibility guidance
- Profile/document reuse concept
- Official portal access

### Scalability
- Demonstration of a standardized service adapter/model

---

# 28. Out of Scope for MVP

The MVP SHALL NOT attempt to:

- Create a national identity system.
- Replace Aadhaar.
- Integrate every government portal.
- Bypass authentication or CAPTCHA.
- Access government systems without authorization.
- Automatically submit consequential applications without user confirmation.
- Claim real transactions where no authorized integration exists.
- Store unnecessary sensitive citizen information.

---

# 29. Requirement Traceability

Every requirement should eventually map through:

```text
REQ-ID
  ↓
Design
  ↓
User Flow
  ↓
Architecture
  ↓
Database / API / AI
  ↓
Implementation
  ↓
Test
```

Requirement IDs SHALL remain stable unless a formal change is approved.

---

# 30. Change Control

A requirement SHALL NOT be silently changed.

An approved change must:

1. Identify the requirement ID.
2. Record the reason.
3. Identify affected user stories.
4. Identify affected technical/design documents.
5. Update tests/tasks.
6. Record the decision in `19_DECISIONS.md`.

---

# 31. AI Development Rule

Any AI coding agent SHALL:

1. Read relevant requirements before implementation.
2. Reference requirement IDs for major work.
3. Never invent missing requirements.
4. Flag contradictions.
5. Preserve security and authorization boundaries.
6. Update tests when behavior changes.
7. Update documentation when approved behavior changes.
8. Clearly identify mock/prototype integrations.


---

# 32. Service Capability Requirements

## REQ-CAP-001 — Capability Registry

**P0**

Every integrated service SHALL expose a machine-readable or equivalently structured capability definition.

## REQ-CAP-002 — Capability Categories

**P0**

A service capability definition SHALL support, where applicable:

- Knowledge
- Data retrieval
- Documents
- Actions
- Status
- Transformation/assistance

## REQ-CAP-003 — Capability Discovery

**P0**

Sanchay AI SHALL determine whether a requested operation is supported before attempting to execute it.

## REQ-CAP-004 — Capability Authorization

**P0**

A capability SHALL only be executed when the citizen, Sanchay, and underlying service are authorized to perform it.

## REQ-CAP-005 — Capability-Specific Permissions

**P0**

The platform SHALL apply permissions at the capability/action level where required.

## REQ-CAP-006 — Capability Result Integrity

**P0**

The AI SHALL represent the result returned by the underlying service accurately and SHALL NOT fabricate a result.

## REQ-CAP-007 — Unsupported Capability Handling

**P0**

When a requested capability is unavailable, the platform SHALL provide a clear fallback, such as:

- Official information
- Official portal link
- Manual workflow
- Explanation of unavailability

## REQ-CAP-008 — Capability Independence

**P0**

Adding a capability to one service SHALL NOT require changing the core Sanchay interaction model.

## REQ-CAP-009 — AI Action Boundary

**P0**

AI SHALL only execute actions through approved service tools, APIs, or explicitly authorized interfaces.

## REQ-CAP-010 — Consequential Action Confirmation

**P0**

Actions with legal, financial, application, or other consequential effects SHALL require explicit user confirmation at the appropriate point.

## REQ-CAP-011 — Service Data Retrieval

**P0**

Where an authorized service exposes citizen-specific data, Sanchay SHALL be capable of retrieving supported data through the defined integration.

Examples may include:

- Application status
- Admit card
- Result
- Answer key
- Certificates
- Notifications

## REQ-CAP-012 — AI Transformation

**P0**

The platform MAY use AI to explain, summarize, compare, or transform retrieved service information without altering the authoritative source data.

## REQ-CAP-013 — Capability Context

**P0**

The AI SHALL combine current service context with the requested capability when determining an action.

## REQ-CAP-014 — Capability Audit

**P0**

Consequential capability executions SHALL be auditable.

---

# 33. Generic Service Definition

A service integration SHOULD support a structure conceptually equivalent to:

```text
SERVICE
├── Identity / Access
├── Metadata
├── Knowledge Sources
├── Eligibility Rules
├── Required Data
├── Required Documents
├── Data Retrieval
├── Actions
├── Status
├── Recommendations
└── Official Portal
```

The actual implementation may differ, but the conceptual separation SHALL remain clear.

---

# 34. JEE Capability Requirements

## REQ-JEE-CAP-001 — Answer Key Retrieval

**P0**

Where the authorized NTA/JEE integration exposes a candidate's answer key, Sanchay SHALL support retrieving it.

## REQ-JEE-CAP-002 — Answer Key Explanation

**P0**

Sanchay AI SHALL be able to explain retrieved answer-key information without changing the underlying official data.

## REQ-JEE-CAP-003 — Result Retrieval

**P0**

Where officially exposed, Sanchay SHALL support retrieving a candidate's result.

## REQ-JEE-CAP-004 — Admit Card Retrieval

**P0**

Where officially exposed, Sanchay SHALL support retrieving a candidate's admit card.

## REQ-JEE-CAP-005 — Notification Retrieval

**P0**

The knowledge system SHALL support retrieval of relevant official JEE notifications.

---

# 35. Requirement Boundary for Service Actions

A service action is valid only when:

```text
Requested action
      ↓
Service capability exists
      ↓
Authorized integration exists
      ↓
Citizen is authorized
      ↓
Required data available
      ↓
Security checks pass
      ↓
Execute
      ↓
Receive authoritative result
      ↓
Show result
```

No step may be silently skipped for convenience.
