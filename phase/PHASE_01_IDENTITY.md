# PHASE 1 — IDENTITY & CITIZEN FOUNDATION
# SANCHAY — Unified Government Digital Service Platform

**Phase:** 1  
**Status:** Planned  
**Depends On:** Phase 0 — Foundation  
**Primary Goal:** Establish a secure, reusable citizen identity and ownership layer for the entire Sanchay platform.

---

# 1. Phase Objective

Phase 1 establishes the identity foundation on which every future Sanchay service will depend.

At the end of this phase, Sanchay should be able to securely determine:

- Who the citizen is.
- Which Sanchay account belongs to them.
- Which Sanchay UID belongs to them.
- Which profile data belongs to them.
- Which identity links belong to them.
- Which consents they have granted.
- Which resources they are authorized to access.

This phase must establish the security boundary before government services, AI, RAG, and application automation are connected.

---

# 2. Phase Principle

> **Authentication establishes who the user is. Authorization determines what that user may access or do.**

The frontend, AI, request body, URL, or query parameters must never be trusted to determine ownership.

The backend is authoritative.

---

# 3. Scope

## In Scope

### Identity
- Authentication
- Login
- Logout
- Session management
- Session expiration
- Session revocation
- Current-user context

### Sanchay Identity
- Sanchay UID generation
- UID uniqueness
- UID protection
- User record

### Citizen Profile
- Profile creation/initialization
- Profile retrieval
- Profile update
- Address management
- Contact methods

### Identity Links
- Identity-link data model
- Secure identity-link abstraction
- Ownership protection
- Future government identity integration boundary

### Consent
- Consent creation
- Consent retrieval
- Consent revocation
- Purpose/service association
- Consent versioning
- Consent auditability

### Authorization
- Authentication guards
- Ownership checks
- Resource-level authorization
- IDOR/BOLA protection

### Security
- Authentication protection
- Rate limiting foundation
- Sensitive-event audit logging
- Secure error handling
- Sensitive-data protection

---

# 4. Out of Scope

Do NOT implement in Phase 1:

- JEE integration
- Ayushman integration
- Government API integration
- Government scraping
- RAG
- Embeddings
- AI orchestration
- AI tool execution
- Application engine
- Auto-fill engine
- Eligibility engine
- Payment system
- Government document retrieval
- Production government identity verification unless an officially authorized integration already exists
- Full service directory

These belong to later phases.

---

# 5. Dependencies

Phase 1 depends on:

```text
PHASE 0
Foundation
 ├── Monorepo
 ├── PostgreSQL
 ├── Prisma
 ├── NestJS API
 ├── Next.js frontend
 ├── Shared packages
 └── CI
```

Required source-of-truth documents:

```text
01_PRD.md
02_USER_STORIES.md
03_REQUIREMENTS.md
05_USER_FLOWS.md
07_ARCHITECTURE.md
08_DATABASE.md
09_API.md
11_SECURITY.md
12_IMPLEMENTATION.md
18_TASKS.md
19_DECISIONS.md
```

---

# 6. Identity Architecture

Conceptual model:

```text
                    CITIZEN
                       │
                       ↓
                 Authentication
                       │
                       ↓
                   User Account
                       │
              ┌────────┼────────┐
              ↓        ↓        ↓
          Sanchay UID Profile  Sessions
                       │
                 ┌─────┴─────┐
                 ↓           ↓
             Addresses   Contacts
                       │
                 Identity Links
                       │
                    Consents
```

---

# 7. Sanchay UID Requirements

The Sanchay UID must be:

- Globally unique.
- Opaque.
- Unpredictable.
- Non-sequential.
- Non-sensitive.
- Independent from Aadhaar.
- Independent from phone number.
- Independent from email.
- Safe to use as a platform identifier.

The UID must NOT be:

- An authentication secret.
- A password.
- An OTP.
- Derived from sensitive government identifiers.

Uniqueness must be enforced at the database level.

---

# 8. Authentication Requirements

The authentication implementation must use the authentication strategy defined by `06_TECH_STACK.md` and `09_API.md`.

It must support the documented:

- Login flow.
- Logout flow.
- Session creation.
- Session validation.
- Session expiration.
- Session revocation.
- Current authenticated-user context.

Authentication failures must not reveal unnecessary information.

Example:

Do not expose whether a sensitive account exists through overly specific login errors.

---

# 9. Session Requirements

Sessions must support:

```text
Create
 ↓
Authenticate
 ↓
Use
 ↓
Expire / Revoke
```

Sensitive events may require session rotation/re-authentication according to the security architecture.

The implementation must support server-side revocation where the selected authentication architecture requires it.

Never rely solely on the frontend to determine whether a session is valid.

---

# 10. Current User Context

Protected backend operations must derive the authenticated user from the verified authentication context.

Correct:

```text
Request
 ↓
Verified session/token
 ↓
Authenticated User
 ↓
Authorization
```

Incorrect:

```text
Request body:
{
  "userId": "..."
}
```

The supplied `userId` must never override the authenticated identity.

---

# 11. Citizen Profile

A citizen profile belongs to exactly one Sanchay user.

The profile layer should support the fields defined by the existing database and requirements documents.

The implementation must not collect additional sensitive information merely because it may be useful later.

Principle:

> **Collect data because a documented requirement needs it, not because the system might eventually use it.**

---

# 12. Profile Operations

Required operations:

```text
GET current profile
CREATE / initialize profile
UPDATE current profile
GET current addresses
CREATE/update/delete own address where supported
GET current contact methods
Create/update/delete own contact method where supported
```

Every operation must enforce ownership.

---

# 13. Profile Update Flow

```text
User
 ↓
Authenticated Session
 ↓
Profile Request
 ↓
DTO Validation
 ↓
Ownership / Current-User Resolution
 ↓
Business Validation
 ↓
Database Transaction
 ↓
Audit Sensitive Change
 ↓
Response
```

Frontend validation is supplementary.

Backend validation is mandatory.

---

# 14. Identity Links

Identity links represent a controlled relationship between a Sanchay account and an external identity/service.

Conceptually:

```text
Sanchay UID
     │
     ↓
Identity Link
     │
     ↓
External Service Identity
```

The system must not assume that all citizens have the same external identity.

Do not make Aadhaar the universal Sanchay identity.

---

# 15. Identity-Link Security

Identity links are sensitive.

Requirements:

- Server-side authorization.
- Restricted access.
- No unnecessary frontend exposure.
- No unnecessary AI exposure.
- Audit sensitive changes.
- Encryption/protection where required by the security architecture.
- No use as public identifiers.

Do not implement an external identity verification mechanism without an officially supported integration.

---

# 16. Consent Model

Consent answers:

```text
WHO?
WHAT DATA?
FOR WHAT PURPOSE?
FOR WHICH SERVICE?
WHEN?
WHICH VERSION?
CURRENTLY VALID?
```

Example:

```text
Citizen
 ↓
JEE Application
 ↓
Required profile information
 ↓
Purpose: Application preparation/submission
 ↓
Consent
```

Consent must not become a blanket permission for unrestricted data access.

---

# 17. Consent Lifecycle

```text
REQUESTED
    ↓
GRANTED
    ↓
ACTIVE
    ↓
REVOKED / EXPIRED
```

Invalid transitions must be rejected.

The exact state model must remain consistent with `08_DATABASE.md`.

---

# 18. Consent Revocation

Where revocation is supported:

```text
User
 ↓
Revokes consent
 ↓
Backend validates ownership
 ↓
Consent state changes
 ↓
Audit event
 ↓
Future access blocked
```

Revocation must affect future authorization decisions.

---

# 19. Authorization Model

Every protected resource must answer:

```text
Who is requesting?
What resource?
Which service?
Which capability?
What operation?
Is the user allowed?
```

Authorization must be enforced on the backend.

---

# 20. Ownership Rule

For a user-owned resource:

```text
authenticatedUser.id
        ==
resource.userId
```

or an explicitly documented authorized relationship.

Never use:

```text
frontend says this belongs to me
```

as proof of ownership.

---

# 21. IDOR / BOLA Protection

The following must be tested:

```text
User A
  ↓
User B profile
```

```text
User A
  ↓
User B identity link
```

```text
User A
  ↓
User B consent
```

Expected:

```text
ACCESS DENIED
```

The API must not leak unnecessary information about another user's resource.

---

# 22. Authentication vs Authorization

These are separate controls.

```text
Authentication
"What account is this?"

Authorization
"Can this account perform this action?"
```

A valid login does not grant access to every Sanchay resource.

---

# 23. API Boundary

Expected architecture:

```text
Frontend
   ↓
API Controller
   ↓
Authentication Guard
   ↓
DTO Validation
   ↓
Authorization Guard
   ↓
Application Service
   ↓
Repository
   ↓
PostgreSQL
```

Controllers should not contain core business logic.

---

# 24. Error Handling

Authentication and authorization errors must use the API error conventions defined in `09_API.md`.

Do not expose:

- Database errors.
- Stack traces.
- Internal IDs unnecessarily.
- Authentication secrets.
- Sensitive identity details.

Errors should be safe for production.

---

# 25. Rate Limiting

Phase 1 must establish rate limiting for authentication-sensitive operations where required.

At minimum consider:

```text
Login
Authentication attempts
Session operations
Password/credential recovery if applicable
Identity verification operations if introduced
```

The implementation must use the infrastructure defined by the project rather than inventing an unrelated mechanism.

---

# 26. Audit Events

Sensitive identity operations should produce audit events.

Examples:

```text
LOGIN
LOGIN_FAILED
LOGOUT
SESSION_REVOKED
PROFILE_UPDATED
IDENTITY_LINK_CREATED
IDENTITY_LINK_UPDATED
IDENTITY_LINK_REMOVED
CONSENT_GRANTED
CONSENT_REVOKED
```

Do not store sensitive secrets in audit logs.

---

# 27. Database Requirements

Use the existing Prisma schema.

Phase 1 should primarily use:

```text
User
AuthSession
IdentityLink
Profile
Address
ContactMethod
Consent
Permission
AuditEvent
```

Do not redesign unrelated Phase 2+ tables unless an actual schema defect is discovered.

All schema changes require migrations.

---

# 28. Frontend Requirements

Implement only the identity-related UI required for this phase:

```text
Login
 ↓
Authenticated Shell
 ↓
Profile
 ↓
Profile Edit
 ↓
Consent visibility
 ↓
Logout
```

The frontend must use real backend authentication.

Do not implement fake local-only authentication.

---

# 29. Security Requirements

Phase 1 must satisfy relevant controls from `11_SECURITY.md`:

```text
✓ Secure authentication
✓ Session protection
✓ Server-side authorization
✓ Resource ownership
✓ Input validation
✓ Secure errors
✓ Rate limiting where required
✓ Audit events
✓ Secret protection
✓ Sensitive data minimization
```

A control is only considered implemented after code and tests demonstrate it.

---

# 30. Testing Requirements

## Authentication

```text
Valid login
Invalid login
Expired session
Revoked session
Logout
Unauthenticated protected request
```

## UID

```text
UID generated
UID unique
UID opaque
UID not sequential
Duplicate prevented
```

## Profile

```text
Read own profile
Update own profile
Invalid input rejected
Unauthorized access rejected
```

## Ownership

```text
User A → User A resource = ALLOW
User A → User B resource = DENY
```

Test this for every Phase 1 resource.

## Consent

```text
Create
Read own
Revoke
Unauthorized read
Unauthorized revoke
```

## Security

```text
Forged userId
Modified resource ID
Invalid session
Expired session
Missing authentication
Sensitive error response
```

---

# 31. Phase Deliverables

Phase 1 deliverables:

```text
✓ Authentication implementation
✓ Session implementation
✓ Sanchay UID implementation
✓ Citizen profile implementation
✓ Address/contact implementation
✓ Identity-link foundation
✓ Consent foundation
✓ Ownership authorization
✓ Security-sensitive audit events
✓ Phase 1 frontend
✓ API tests
✓ Authorization tests
✓ Integration tests
✓ Documentation updates
✓ Current-state update
```

---

# 32. Acceptance Criteria

Phase 1 is accepted only when:

### Identity

- A citizen can authenticate.
- A valid authenticated session can be recognized.
- A session can expire/revoke according to the implementation.
- A user has exactly one Sanchay identity.
- A Sanchay UID is unique and opaque.

### Profile

- A citizen can access their own profile.
- A citizen can update their own profile.
- Profile data is validated server-side.
- A citizen cannot access another citizen's profile.

### Identity Links

- Identity-link records are protected.
- Users cannot access another user's identity links.
- No unsupported external identity integration is fabricated.

### Consent

- Consent is associated with the correct citizen.
- Consent has a documented purpose/service relationship.
- Consent can be revoked where supported.
- Revoked consent affects future authorization.

### Security

- Protected endpoints require authentication.
- Ownership is enforced server-side.
- IDOR/BOLA tests pass.
- Sensitive identity events are auditable.
- No secrets appear in source code or logs.

### Quality

- Typecheck passes.
- Lint passes.
- Unit tests pass.
- Integration tests pass.
- API tests pass.
- Authorization tests pass.
- Production builds pass.

---

# 33. Phase Exit Gate

Do NOT mark Phase 1 complete merely because the UI exists.

The phase can move to Phase 2 only when:

```text
IDENTITY
   ↓
Authentication verified
   ↓
Sanchay UID verified
   ↓
Profile verified
   ↓
Ownership verified
   ↓
Consent verified
   ↓
Audit verified
   ↓
Security tests pass
   ↓
Build/tests pass
   ↓
CURRENT_STATE.md updated
   ↓
18_TASKS.md updated
   ↓
17_CHANGELOG.md updated
   ↓
PHASE 1 COMPLETE
```

---

# 34. Phase 2 Handoff

After Phase 1 is complete, the platform should be ready to safely build:

```text
PHASE 2
Government Service Platform

Departments
 ↓
Organizations
 ↓
Government Services
 ↓
Capabilities
 ↓
Requirements
 ↓
Service Registry
 ↓
Service Adapter Framework
```

Phase 2 must build on the identity and authorization foundation rather than bypassing it.

---

# 35. Documentation Synchronization

During Phase 1, update:

```text
00_CURRENT_STATE.md
18_TASKS.md
17_CHANGELOG.md
```

Also update:

```text
08_DATABASE.md
09_API.md
11_SECURITY.md
```

only if actual implementation changes their defined contracts/requirements.

Important architectural changes must be recorded in:

```text
19_DECISIONS.md
```

---

# 36. Phase 1 Rule

> **Do not build government-service features until Sanchay can reliably answer one fundamental security question: "Who is this citizen, and what exactly is this citizen allowed to access?"**
