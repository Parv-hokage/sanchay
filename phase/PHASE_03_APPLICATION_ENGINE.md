# PHASE 3 — APPLICATION ENGINE & DETERMINISTIC AUTO-FILL
# SANCHAY — Unified Government Digital Service Platform

**Phase:** 3  
**Status:** Planned  
**Depends On:** Phase 2 — Government Service Platform  
**Primary Goal:** Turn registered service capabilities into secure, dynamic application workflows with deterministic form generation, consent-based citizen data auto-fill, validation, review, and explicit confirmation.

---

# 1. Phase Objective

Phase 3 introduces the core application engine of Sanchay.

A government service capability defines what information it requires, and Sanchay constructs the corresponding application experience without requiring a custom form implementation for every service.

Core flow:

```text
Government Service
        ↓
Capability
        ↓
Capability Requirements
        ↓
Application
        ↓
Dynamic Form
        ↓
Determine Required Citizen Data
        ↓
Consent
        ↓
Deterministic Auto-Fill
        ↓
Validation
        ↓
Citizen Review
        ↓
Explicit Confirmation
        ↓
Application Ready for Submission
```

Phase 3 does **not** require live government submission integrations.

The goal is to make the application engine real and integration-ready.

---

# 2. Phase Principle

> **AI may assist with the experience, but deterministic backend logic controls application data, validation, authorization, and consequential actions.**

The system must never allow an LLM to freely decide which citizen fields to submit.

---

# 3. Scope

## In Scope

- Application domain
- Application state machine
- Dynamic form generation
- Capability-driven fields
- Field metadata
- Field validation
- Citizen profile data mapping
- Deterministic auto-fill
- Field-level source tracking
- Consent checks
- Missing-data detection
- User-editable auto-filled values
- Review screen
- Explicit confirmation
- Application draft persistence
- Application events/audit trail
- Mock/sandbox submission boundary
- Application status foundation
- Frontend application wizard
- Security and authorization tests
- Local visual demonstration of the complete application flow

## Out of Scope

Do NOT implement:

- Real JEE submission
- Real Ayushman submission
- Real government payment
- CAPTCHA bypass
- Government credential storage
- AI-controlled submission
- Unrestricted AI access to citizen data
- Full RAG
- Production AI orchestrator
- Production government adapters

---

# 4. Application Architecture

The application engine must be reusable across services.

```text
Service
   ↓
Capability
   ↓
Requirements
   ↓
Form Schema
   ↓
Application
   ↓
Application Fields
   ↓
Validation
   ↓
Consent
   ↓
Auto-Fill
   ↓
Review
   ↓
Confirmation
   ↓
Adapter Boundary
```

A JEE application and an Ayushman application must use the same application engine.

Only their capability definitions, requirements, mappings, and eventual adapters should differ.

---

# 5. Application Lifecycle

Implement an explicit state machine.

Conceptually:

```text
DRAFT
  ↓
IN_PROGRESS
  ↓
READY_FOR_REVIEW
  ↓
AWAITING_CONFIRMATION
  ↓
CONFIRMED
  ↓
SUBMISSION_PENDING
  ↓
SUBMITTED
```

Failure/cancellation paths must be represented explicitly according to the existing database/API contracts.

Possible terminal states may include:

```text
CANCELLED
FAILED
REJECTED
```

Do not invent additional states if `08_DATABASE.md` or `09_API.md` already defines the authoritative state model.

---

# 6. State Transition Rules

The backend owns application state transitions.

Example:

```text
DRAFT
  → IN_PROGRESS        ✓
  → SUBMITTED          ✗

IN_PROGRESS
  → READY_FOR_REVIEW   ✓
  → SUBMITTED          ✗

READY_FOR_REVIEW
  → AWAITING_CONFIRMATION ✓

AWAITING_CONFIRMATION
  → CONFIRMED          ✓

CONFIRMED
  → SUBMISSION_PENDING ✓
```

The frontend must never be authoritative for state transitions.

---

# 7. Dynamic Form Generation

Forms must be generated from capability requirements.

Example:

```text
JEE Main Registration
        ↓
Requirements
        ↓
┌────────────────────────────┐
│ Full Name                  │
│ Date of Birth              │
│ Category                   │
│ Phone Number               │
│ Email                      │
│ Address                    │
│ Exam Centre                │
└────────────────────────────┘
```

The form must not require a custom React implementation specifically for JEE.

The same form engine must render another capability with different requirements.

---

# 8. Field Metadata

Application fields should support the metadata required by the existing schema/contracts, such as:

- Field identifier
- Label
- Type
- Required/optional
- Validation rules
- Source
- Editable status
- Sensitive classification
- Display instructions
- Ordering
- Dependencies where required

Do not add fields merely because they may be useful later.

---

# 9. Field Types

Support the field types actually required by documented service requirements.

Potential examples:

```text
TEXT
EMAIL
PHONE
DATE
NUMBER
SELECT
RADIO
CHECKBOX
ADDRESS
DOCUMENT
```

Do not build an unnecessarily large generic form engine.

---

# 10. Citizen Data Mapping

Sanchay maps application requirements to citizen-owned data deterministically.

Example:

```text
Application Requirement
"full_name"
        ↓
Profile.fullName
```

```text
Application Requirement
"phone"
        ↓
Verified ContactMethod.phone
```

```text
Application Requirement
"address"
        ↓
Profile Address
```

Mappings must be explicit and backend-controlled.

The LLM must never invent mappings.

---

# 11. Deterministic Auto-Fill

The auto-fill engine must be deterministic.

Flow:

```text
Application Field
      ↓
Field Mapping
      ↓
Authorized Citizen Data
      ↓
Validation
      ↓
Auto-Filled Value
      ↓
Source Metadata
```

Each auto-filled field should identify its source where appropriate.

Example:

```text
Full Name
Source: Sanchay Profile
Status: Verified
```

Do not expose unnecessary sensitive source information.

---

# 12. Auto-Fill Rules

The engine must:

- Retrieve only fields required by the current application.
- Respect authorization.
- Respect consent.
- Validate source data.
- Preserve user edits.
- Detect missing values.
- Flag conflicting values.
- Never silently overwrite a citizen-edited value.

---

# 13. Missing Data

If required data is unavailable:

```text
Required Field
      ↓
No authorized source
      ↓
Missing
      ↓
Ask citizen
```

Example:

```text
Exam Centre

We don't have this information yet.

Select your preferred centre:
[ Select centre ]
```

Never fabricate values.

---

# 14. Conflicting Data

If multiple authorized sources contain conflicting values:

```text
Source A → Value 1
Source B → Value 2
```

Do not silently choose one for a consequential application.

Flag the conflict and require citizen resolution where appropriate.

---

# 15. Consent

Auto-fill of private citizen data requires appropriate consent according to `11_SECURITY.md` and the existing consent architecture.

Conceptually:

```text
Application
   ↓
Required Data
   ↓
Purpose
   ↓
Consent
   ↓
Authorized Retrieval
```

Without the required consent:

```text
NO PRIVATE DATA RETRIEVAL
```

Consent must be scoped to purpose/service where required.

---

# 16. Sensitive Data

Sensitive citizen information requires stricter handling.

Examples may include:

- Government identifiers
- Financial information
- Health-related information
- Private documents
- Other sensitive fields defined by the security architecture

The application engine must retrieve only what is required.

Never load the complete citizen profile into application context merely because the user is authenticated.

---

# 17. Application Ownership

Every application belongs to exactly one citizen unless an explicitly authorized delegated model is introduced later.

A user may only:

- View their own applications.
- Modify their own drafts.
- Cancel eligible drafts.
- Confirm their own applications.
- View their own application events.

User A must never access User B's application.

---

# 18. Application Events

Track meaningful application lifecycle events.

Examples:

```text
APPLICATION_CREATED
FIELD_AUTO_FILLED
FIELD_UPDATED
VALIDATION_FAILED
REVIEW_READY
CONFIRMATION_REQUESTED
CONFIRMED
SUBMISSION_REQUESTED
SUBMISSION_SUCCEEDED
SUBMISSION_FAILED
CANCELLED
```

Use the event model defined by the existing schema.

Do not log sensitive field values unnecessarily.

---

# 19. Review Experience

Before confirmation, show a complete review screen.

Example:

```text
JEE MAIN APPLICATION

Personal Information
✓ Name
✓ Date of Birth
✓ Category

Contact
✓ Phone
✓ Email

Exam Preferences
✓ City
✓ Centre

Documents
✓ Required document

────────────────────────

[ Edit ]              [ Confirm ]
```

Auto-filled fields should be visibly distinguishable from manually entered fields without creating visual clutter.

---

# 20. Confirmation

Consequential actions require explicit citizen confirmation.

Correct:

```text
Review
 ↓
Confirm
 ↓
Submission request
```

Incorrect:

```text
AI says "submit it"
 ↓
Automatic submission
```

The AI must never bypass confirmation.

---

# 21. Mock Submission Boundary

Phase 3 may implement a mock submission adapter.

Example:

```text
Application
 ↓
Validated
 ↓
Confirmed
 ↓
Mock Adapter
 ↓
Mock Submission Result
```

The UI must clearly identify mock/sandbox behavior.

Never display a mock submission as a real government submission.

---

# 22. Frontend Application Wizard

Build the first real Sanchay application workflow.

Example:

```text
Service
 ↓
Capability
 ↓
Requirements
 ↓
Start Application
 ↓
Form
 ↓
Auto-Fill
 ↓
Review
 ↓
Confirmation
 ↓
Mock Submission / Pending Integration
```

The wizard must be generated from application/capability data where practical.

---

# 23. Application UI

Include:

- Progress indicator
- Current section
- Dynamic fields
- Validation messages
- Auto-fill indicators
- Missing-data indicators
- Save draft
- Back/next navigation
- Review
- Confirmation
- Success/failure state

Keep the interface consistent with the Sanchay design system.

---

# 24. Save Draft

Users should be able to leave an application and continue later where supported.

Drafts must be associated with:

```text
User
+
Service
+
Capability
```

Draft data must be securely stored.

---

# 25. Validation

Validation must occur at multiple levels:

```text
Frontend
   ↓
Backend DTO validation
   ↓
Application field validation
   ↓
Capability-specific validation
   ↓
Final review validation
```

Frontend validation is not sufficient.

---

# 26. AI Boundary

Phase 3 does not implement the complete AI orchestrator.

AI may eventually:

- Explain a field.
- Explain a requirement.
- Help find information.
- Explain validation errors.
- Help users navigate the application.

AI must NOT:

- Directly mutate application state without authorization.
- Invent field values.
- Select sensitive data without backend authorization.
- Bypass consent.
- Submit without confirmation.
- Directly access the database.

---

# 27. API

Implement only Phase 3 application APIs defined by `09_API.md`.

Conceptually:

```text
Create application
Get application
Update draft
Get application fields
Update field
Validate application
Auto-fill application
Prepare review
Request confirmation
Confirm application
Get application events
Cancel eligible application
```

Exact routes and methods must follow `09_API.md`.

Do not invent a parallel API contract.

---

# 28. Backend Architecture

Use:

```text
Controller
 ↓
Authentication
 ↓
Authorization
 ↓
Validation
 ↓
Application Service
 ↓
Application State Machine
 ↓
Field / Auto-Fill Service
 ↓
Repository
 ↓
Database
```

Keep state-transition logic centralized.

Do not scatter state changes across controllers.

---

# 29. Database

Use existing application models from `08_DATABASE.md`.

Expected relevant models include:

```text
Application
ApplicationField
ApplicationEvent
GovernmentService
ServiceCapability
ServiceCapabilityRequirement
User
Profile
Address
ContactMethod
Consent
AuditEvent
```

Modify the schema only if necessary.

All changes require migrations.

---

# 30. Security Requirements

Follow `11_SECURITY.md`.

Phase 3 must specifically protect against:

- IDOR/BOLA
- Unauthorized field access
- Unauthorized profile data retrieval
- Consent bypass
- State transition manipulation
- Replay of confirmation requests
- Duplicate submission
- Tampered application IDs
- Client-side authorization bypass
- Sensitive data leakage in logs
- AI over-privilege

Consequential operations should be idempotent where appropriate.

---

# 31. Testing

## Application State

Test:

- Valid transitions
- Invalid transitions
- Cancellation
- Failure handling
- Confirmation requirements

## Auto-Fill

Test:

- Correct mapping
- Missing source
- Invalid source
- Conflicting source
- User override
- Consent denied
- Unauthorized field retrieval

## Ownership

Test:

```text
User A → User A application = ALLOW
User A → User B application = DENY
```

## Validation

Test:

- Required field missing
- Invalid format
- Invalid selection
- Cross-field validation where required

## Security

Test:

- Forged application ID
- Forged user ID
- Consent bypass
- State transition tampering
- Duplicate confirmation
- Replay attempt
- Unauthorized auto-fill

## E2E

At minimum:

```text
Login
 ↓
Open JEE Main
 ↓
Start application
 ↓
Form loads dynamically
 ↓
Auto-fill available fields
 ↓
Review
 ↓
Edit a field
 ↓
Validate
 ↓
Confirm
 ↓
Mock submission
 ↓
View application status
```

---

# 32. Visual Acceptance Criteria

The user must be able to locally see a complete application experience:

```text
JEE MAIN
   ↓
Start Application
   ↓
Step 1 — Personal Information
   ↓
Step 2 — Contact
   ↓
Step 3 — Preferences
   ↓
Step 4 — Review
   ↓
Confirm
   ↓
Application Created / Mock Result
```

The UI must clearly communicate:

- What is being requested.
- What Sanchay already knows.
- What was auto-filled.
- What the user must provide.
- What will happen after confirmation.

---

# 33. Local Development

The entire Phase 3 flow must work locally.

Expected:

```bash
pnpm dev
```

Then:

```text
Login
 ↓
Open JEE Main
 ↓
Start application
 ↓
Auto-fill
 ↓
Review
 ↓
Confirm
 ↓
Mock submission
```

No real government credentials or integrations are required.

---

# 34. Acceptance Criteria

Phase 3 is accepted only when:

### Application Engine

- Applications can be created.
- Drafts can be saved.
- Application fields are generated from capability requirements.
- Field validation works.
- State transitions are enforced server-side.

### Auto-Fill

- Authorized citizen data can be mapped deterministically.
- Consent is respected.
- Missing data is detected.
- Conflicting data is handled safely.
- User edits are preserved.
- Auto-fill sources are visible where appropriate.

### Security

- Cross-user applications are inaccessible.
- Private data is retrieved only when required.
- Consent cannot be bypassed.
- State transitions cannot be forged.
- Confirmation cannot be bypassed.

### Frontend

- Application wizard works.
- Dynamic fields render.
- Auto-fill works.
- Review works.
- Confirmation works.
- Mock submission works.
- Error/loading states work.

### Quality

- Typecheck passes.
- Lint passes.
- Unit tests pass.
- Integration tests pass.
- E2E tests pass.
- Production build passes.

---

# 35. Phase Deliverables

```text
✓ Application state machine
✓ Dynamic application forms
✓ Capability-driven requirements
✓ Deterministic field mapping
✓ Consent-aware auto-fill
✓ Missing-data handling
✓ Conflict handling
✓ User field editing
✓ Draft persistence
✓ Review flow
✓ Explicit confirmation
✓ Application events
✓ Mock submission boundary
✓ Application UI
✓ API implementation
✓ Security tests
✓ E2E application flow
✓ Documentation updates
✓ Local visual demonstration
```

---

# 36. Phase Exit Gate

Phase 3 is complete only when:

```text
SERVICE CAPABILITY
       ↓
APPLICATION
       ↓
DYNAMIC FORM
       ↓
CITIZEN DATA
       ↓
CONSENT
       ↓
DETERMINISTIC AUTO-FILL
       ↓
VALIDATION
       ↓
USER REVIEW
       ↓
EXPLICIT CONFIRMATION
       ↓
MOCK / ADAPTER BOUNDARY
       ↓
AUDIT
       ↓
TESTING
       ↓
DOCUMENTATION
       ↓
PHASE 3 COMPLETE
```

Do not move to Phase 4 until this entire flow works locally and the security/ownership tests pass.

---

# 37. Phase 4 Handoff

After Phase 3, Sanchay should be ready for:

```text
PHASE 4 — PRIVATE DOCUMENT PLATFORM

Documents
 ↓
Secure Upload
 ↓
Object Storage
 ↓
Malware Scanning
 ↓
Document Metadata
 ↓
Access Control
 ↓
Retention
 ↓
Document Processing
```

The application engine will then be able to securely request and use required citizen documents.

---

# 38. Documentation Synchronization

After Phase 3:

Update:

```text
00_CURRENT_STATE.md
17_CHANGELOG.md
18_TASKS.md
```

If contracts change:

```text
08_DATABASE.md
09_API.md
11_SECURITY.md
12_IMPLEMENTATION.md
```

If architectural decisions change:

```text
19_DECISIONS.md
```

Documentation must describe actual implementation.

---

# 39. Phase 3 Rule

> **Sanchay must never submit what it merely guessed. Every consequential application value must come from an authorized source, explicit citizen input, or a deterministic documented transformation—and the citizen must retain final control.**
