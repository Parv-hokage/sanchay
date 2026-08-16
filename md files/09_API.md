# 09 — API Specification
# SANCHAY — Unified Government Digital Service Platform

**Product:** Sanchay  
**API Style:** REST + OpenAPI  
**API Version:** v1  
**Backend:** NestJS + TypeScript  
**Database:** PostgreSQL  
**AI:** Application-owned orchestration layer  
**Status:** API Contract Foundation  
**Version:** 1.0

---

# 1. Purpose

This document defines the API contract between:

- Sanchay frontend
- Sanchay backend
- AI orchestration
- RAG system
- Citizen data services
- Government service adapters
- Background workers
- Administration systems

The API is the boundary through which application components communicate.

---

# 2. API Principles

The API SHALL follow these principles:

1. REST for primary synchronous APIs.
2. Versioned endpoints.
3. JSON request/response format unless explicitly required otherwise.
4. HTTPS in all non-local environments.
5. Authentication for protected resources.
6. Authorization at resource and capability level.
7. Consistent error format.
8. Input validation at the API boundary.
9. Pagination for large collections.
10. Idempotency for sensitive/retryable actions.
11. Request correlation IDs.
12. No direct frontend access to databases.
13. No direct LLM access to databases.
14. Government-specific protocols remain behind service adapters.
15. API contracts are documented through OpenAPI.

---

# 3. API Base URL

Production:

```text
https://api.sanchay.gov.example/api/v1
```

> The final production domain is not established by this document. The example domain is illustrative only.

Local:

```text
http://localhost:<PORT>/api/v1
```

---

# 4. API Versioning

The initial API version is:

```text
/api/v1
```

Breaking changes require a new API version.

Example:

```text
/api/v1/...
/api/v2/...
```

Non-breaking changes may be introduced within the same major API version.

---

# 5. Request Headers

Recommended standard headers:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
X-Request-ID: <uuid>
```

For retry-sensitive operations:

```http
Idempotency-Key: <unique-key>
```

The API should generate a request ID if the client does not provide one.

---

# 6. Authentication Model

Protected APIs require an authenticated Sanchay session/token.

```text
Client
 ↓
Authentication Provider
 ↓
Access Token / Session
 ↓
Sanchay API
 ↓
Authentication verification
 ↓
Authorization
 ↓
Resource
```

The exact identity provider is intentionally not hardcoded here.

---

# 7. Authorization Model

Authentication answers:

> Who is this?

Authorization answers:

> Is this user allowed to perform this operation?

Authorization is evaluated at multiple levels:

```text
User
 ↓
Resource
 ↓
Service
 ↓
Capability
 ↓
Action
```

AI requests must use the same authorization model as traditional UI requests.

---

# 8. Common Response Envelope

Successful responses SHOULD follow a consistent structure.

Example:

```json
{
  "data": {},
  "meta": {
    "requestId": "..."
  }
}
```

Collection:

```json
{
  "data": [],
  "meta": {
    "requestId": "...",
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

---

# 9. Error Response

All API errors SHOULD use a common structure:

```json
{
  "error": {
    "code": "APPLICATION_NOT_FOUND",
    "message": "The requested application could not be found.",
    "details": {},
    "requestId": "..."
  }
}
```

The API must not expose:

- Stack traces
- Database errors
- Secrets
- Internal credentials
- Sensitive implementation details

---

# 10. HTTP Status Codes

Use standard HTTP semantics.

```text
200 OK
201 Created
202 Accepted
204 No Content

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests

500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
504 Gateway Timeout
```

---

# 11. Authentication APIs

## POST /auth/login

Starts authentication.

The exact implementation depends on the selected identity provider.

Request:

```json
{
  "provider": "..."
}
```

Response:

```json
{
  "data": {
    "authenticationUrl": "..."
  }
}
```

---

## POST /auth/callback

Handles the approved authentication callback.

This endpoint must validate the identity-provider response before establishing a Sanchay session.

---

## POST /auth/logout

Terminates the current Sanchay session.

Response:

```text
204 No Content
```

---

## GET /auth/session

Returns the current authenticated session.

Response:

```json
{
  "data": {
    "authenticated": true,
    "user": {
      "id": "...",
      "sanchayUid": "..."
    }
  }
}
```

---

# 12. Current User API

## GET /me

Returns the authenticated user's basic account information.

Response:

```json
{
  "data": {
    "sanchayUid": "...",
    "status": "ACTIVE"
  }
}
```

Sensitive identifiers must not be returned unless required.

---

# 13. Profile APIs

## GET /me/profile

Returns the user's authorized profile.

---

## PATCH /me/profile

Updates permitted profile fields.

Request:

```json
{
  "fullName": "...",
  "preferredLanguage": "..."
}
```

The backend validates every field.

---

# 14. Identity Link APIs

## GET /me/identity-links

Returns linked government-service identities available to the user.

Sensitive external identifiers should be masked.

---

## POST /me/identity-links

Starts linking a government service identity.

Request:

```json
{
  "serviceId": "..."
}
```

Response may contain an authorization flow rather than directly returning credentials.

---

## DELETE /me/identity-links/:id

Removes a permitted service link.

The backend must verify that unlinking is allowed and record the relevant audit event.

---

# 15. Department APIs

## GET /departments

Returns available government departments.

Example:

```json
{
  "data": [
    {
      "id": "...",
      "name": "Education",
      "slug": "education"
    },
    {
      "id": "...",
      "name": "Healthcare",
      "slug": "healthcare"
    }
  ]
}
```

---

## GET /departments/:departmentId

Returns department details.

---

# 16. Organization APIs

## GET /organizations

Supports filtering by department.

Example:

```text
GET /organizations?departmentId=<id>
```

---

## GET /organizations/:organizationId

Returns organization metadata and supported services.

---

# 17. Service APIs

## GET /services

Returns discoverable government services.

Supported filters may include:

```text
department
organization
status
search
```

Example:

```text
GET /services?department=education&search=jee
```

---

## GET /services/:serviceId

Returns service information.

Response:

```json
{
  "data": {
    "id": "...",
    "name": "JEE Main",
    "organization": {},
    "officialUrl": "...",
    "status": "ACTIVE"
  }
}
```

---

# 18. Service Capability API

## GET /services/:serviceId/capabilities

Returns capabilities available for the service.

Example:

```json
{
  "data": [
    {
      "id": "...",
      "name": "Get Result",
      "slug": "get_result",
      "type": "RETRIEVE",
      "requiresAuthentication": true,
      "requiresConsent": true,
      "requiresConfirmation": false
    },
    {
      "id": "...",
      "name": "Submit Application",
      "slug": "submit_application",
      "type": "ACTION",
      "requiresAuthentication": true,
      "requiresConsent": true,
      "requiresConfirmation": true
    }
  ]
}
```

---

# 19. Service Context API

## GET /services/:serviceId/context

Returns the context needed by the service UI.

Example:

```json
{
  "data": {
    "service": {},
    "capabilities": [],
    "requirements": [],
    "availableActions": []
  }
}
```

The response must not automatically contain private citizen data.

---

# 20. Knowledge APIs

## GET /knowledge/search

Searches Sanchay's approved knowledge sources.

Query parameters:

```text
q
serviceId
language
page
pageSize
```

Example:

```text
GET /knowledge/search?q=JEE+eligibility&serviceId=...
```

Response:

```json
{
  "data": [
    {
      "sourceId": "...",
      "title": "...",
      "snippet": "...",
      "sourceUrl": "...",
      "publishedAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

# 21. RAG Internal API

RAG retrieval should normally remain an internal backend capability rather than a public endpoint.

Conceptual internal operation:

```text
retrieveKnowledge({
  query,
  serviceId,
  filters,
  topK
})
```

Flow:

```text
AI
 ↓
RAG Orchestrator
 ↓
Hybrid Search
 ↓
Reranking
 ↓
Knowledge Context
```

The frontend should not directly call the vector database.

---

# 22. Application APIs

## GET /applications

Returns applications belonging to the authenticated user.

Filters:

```text
serviceId
status
page
pageSize
```

Users can only access their own authorized applications.

---

## POST /applications

Creates a draft application.

Request:

```json
{
  "serviceId": "...",
  "capabilityId": "..."
}
```

Response:

```json
{
  "data": {
    "id": "...",
    "status": "DRAFT",
    "currentStep": "..."
  }
}
```

---

## GET /applications/:applicationId

Returns an authorized application.

---

## PATCH /applications/:applicationId

Updates permitted application fields.

---

# 23. Application Field APIs

## GET /applications/:applicationId/fields

Returns fields required by the application.

Example:

```json
{
  "data": [
    {
      "key": "full_name",
      "label": "Full Name",
      "value": "...",
      "source": "PROFILE",
      "required": true,
      "verified": true
    }
  ]
}
```

---

## PATCH /applications/:applicationId/fields

Updates permitted fields.

Critical fields require stricter validation.

---

# 24. Auto-Fill API

## POST /applications/:applicationId/autofill

Requests automatic population of fields from authorized user data.

Request:

```json
{
  "fields": [
    "full_name",
    "date_of_birth",
    "address"
  ]
}
```

The backend must:

1. Verify user ownership.
2. Verify service permissions.
3. Determine whether each field may be reused.
4. Retrieve only necessary data.
5. Apply deterministic mappings.
6. Return populated values.

---

# 25. Application Review API

## GET /applications/:applicationId/review

Returns the application in a review-safe representation.

It should clearly distinguish:

```text
Auto-filled
User-provided
Government-provided
Missing
Unverified
```

---

# 26. Application Submission

## POST /applications/:applicationId/submit

Submits an application through the authorized service integration.

Required:

```http
Authorization: Bearer <token>
Idempotency-Key: <unique-key>
```

Flow:

```text
Request
 ↓
Authentication
 ↓
Ownership
 ↓
Capability authorization
 ↓
Consent
 ↓
Validation
 ↓
Confirmation requirement
 ↓
Service adapter
 ↓
Government service
 ↓
Authoritative result
 ↓
Audit
```

The API must never return success unless the submission result is actually confirmed.

---

# 27. Application Confirmation

Consequential actions should have an explicit confirmation stage.

## POST /applications/:applicationId/confirm

Confirms that the user wants to perform the specified consequential operation.

The confirmation should be tied to the current application state/version to prevent stale approvals.

---

# 28. Application Status

## GET /applications/:applicationId/status

Returns the latest known status.

If the authoritative government service is queried in real time, the response should indicate that the status is freshly retrieved.

Example:

```json
{
  "data": {
    "status": "PROCESSING",
    "source": "OFFICIAL_SERVICE",
    "retrievedAt": "..."
  }
}
```

---

# 29. Government Data APIs

Government-specific data should normally NOT be exposed as generic:

```text
GET /government-data
```

Instead, data retrieval should be capability-based.

Example:

```text
GET /services/:serviceId/capabilities/get_result
```

or an internal capability execution mechanism.

This prevents the API from becoming an unrestricted government-data proxy.

---

# 30. Capability Execution API

## POST /services/:serviceId/capabilities/:capabilityId/execute

This is a protected endpoint for executing an explicitly registered service capability.

Request:

```json
{
  "input": {},
  "context": {
    "applicationId": "..."
  }
}
```

Backend flow:

```text
Request
 ↓
Authentication
 ↓
Service validation
 ↓
Capability validation
 ↓
Authorization
 ↓
Consent
 ↓
Input validation
 ↓
Confirmation check
 ↓
Service adapter
 ↓
Government system
 ↓
Result verification
 ↓
Audit
```

This endpoint must NOT accept arbitrary URLs, arbitrary API methods, or arbitrary SQL.

---

# 31. AI APIs

## POST /ai/chat

Primary conversational endpoint.

Request:

```json
{
  "conversationId": "...",
  "message": "Help me apply for JEE.",
  "context": {
    "serviceId": "...",
    "page": "application"
  }
}
```

The backend must validate the supplied context against the authenticated user's actual session.

The client cannot simply claim:

```text
serviceId = another user's service context
```

---

# 32. AI Chat Response

Example:

```json
{
  "data": {
    "conversationId": "...",
    "message": {
      "id": "...",
      "role": "ASSISTANT",
      "content": "I can help you prepare your JEE application."
    },
    "citations": [],
    "actions": []
  }
}
```

---

# 33. AI Action Response

When AI wants to perform an action:

```json
{
  "data": {
    "type": "ACTION_REQUIRED",
    "action": {
      "capabilityId": "...",
      "name": "submit_application",
      "requiresConfirmation": true
    }
  }
}
```

The frontend must render the appropriate confirmation UI.

---

# 34. AI Tool Execution

The AI model should NOT directly call public HTTP endpoints.

Internal architecture:

```text
LLM
 ↓
Tool Call
 ↓
AI Orchestrator
 ↓
Capability Registry
 ↓
Authorization
 ↓
Service Adapter
 ↓
Government System
```

This keeps tool permissions centralized.

---

# 35. Conversation APIs

## POST /conversations

Creates a conversation.

Request:

```json
{
  "serviceId": "..."
}
```

---

## GET /conversations

Lists the authenticated user's conversations.

---

## GET /conversations/:conversationId

Returns a conversation the user is authorized to access.

---

## GET /conversations/:conversationId/messages

Returns conversation messages.

Sensitive information should be minimized in persisted history.

---

# 36. Documents APIs

## GET /documents

Lists authorized document metadata.

---

## POST /documents/upload

Uploads a document.

Preferred flow:

```text
Request upload authorization
 ↓
Receive signed upload URL
 ↓
Upload to object storage
 ↓
Notify backend
 ↓
Scan/process
 ↓
Store metadata
```

Large files should not pass unnecessarily through the application server.

---

# 37. Document Upload Authorization

## POST /documents/upload-url

Request:

```json
{
  "fileName": "document.pdf",
  "mimeType": "application/pdf",
  "size": 123456
}
```

Response:

```json
{
  "data": {
    "uploadUrl": "...",
    "documentId": "...",
    "expiresAt": "..."
  }
}
```

The backend must validate:

- File type
- File size
- User permission
- Storage destination

---

# 38. Document APIs

## GET /documents/:documentId

Returns authorized document metadata.

---

## GET /documents/:documentId/download-url

Returns a short-lived authorized download URL.

---

## DELETE /documents/:documentId

Deletes a document where policy permits.

Deletion should generate the appropriate audit event.

---

# 39. Consent APIs

## GET /consents

Returns the authenticated user's consent records.

---

## POST /consents

Creates a consent decision.

Request:

```json
{
  "serviceId": "...",
  "purpose": "JEE_APPLICATION",
  "scope": [
    "PROFILE_DATA",
    "DOCUMENTS"
  ],
  "decision": "GRANT"
}
```

The backend should create a versioned consent record.

---

## DELETE /consents/:consentId

Revokes a revocable consent.

The system must determine the impact on ongoing applications/workflows.

---

# 40. Notifications APIs

## GET /notifications

Returns notifications for the authenticated user.

---

## PATCH /notifications/:id/read

Marks a notification as read.

---

# 41. Payment APIs

Payment APIs should be used only where the relevant government service officially supports an authorized payment flow.

## POST /applications/:applicationId/payment

Creates/initiates a payment attempt.

---

## GET /applications/:applicationId/payment

Returns payment status.

The API must distinguish:

```text
SUCCESS
PENDING
FAILED
UNKNOWN
```

`UNKNOWN` must never be converted to `SUCCESS`.

---

# 42. Admin APIs

Administrative APIs must be isolated from citizen APIs.

Potential groups:

```text
/admin/services
/admin/capabilities
/admin/knowledge
/admin/integrations
/admin/users
/admin/audit
```

All admin operations require strong authorization and audit logging.

---

# 43. Knowledge Administration APIs

Examples:

```text
POST   /admin/knowledge/sources
PATCH  /admin/knowledge/sources/:id
POST   /admin/knowledge/sources/:id/sync
GET    /admin/knowledge/documents
POST   /admin/knowledge/documents/:id/reindex
```

These are privileged operations.

---

# 44. Service Registration APIs

Admin/service-management layer may expose:

```text
POST /admin/services
POST /admin/services/:id/capabilities
PATCH /admin/services/:id
PATCH /admin/capabilities/:id
```

A service must be validated before being exposed to citizens.

---

# 45. Health APIs

## GET /health

Basic service health.

Should not expose infrastructure secrets.

---

## GET /health/ready

Checks whether the application can accept traffic.

---

## GET /health/live

Checks whether the process is alive.

---

# 46. Rate Limiting

Rate limiting should be applied based on risk.

Examples:

```text
Public search
→ moderate rate limit

AI chat
→ user/IP rate limit

Login
→ strict rate limit

Document upload
→ strict rate + size limits

Capability execution
→ strict capability-specific limit

Application submission
→ very strict + idempotency
```

Rate limits should not become the only security control.

---

# 47. Idempotency

The following operations SHOULD require an idempotency key:

- Application submission
- Payment initiation
- Government action execution
- Important document processing requests

Example:

```http
Idempotency-Key: 4d5c...
```

Same key + same operation should not create duplicate side effects.

---

# 48. Pagination

Collection APIs should use pagination.

Recommended:

```text
?page=1&pageSize=20
```

Maximum page size must be enforced.

Cursor pagination MAY be introduced for very large datasets.

---

# 49. Filtering and Sorting

Supported filters must be explicitly defined.

Example:

```text
GET /applications
    ?serviceId=...
    &status=SUBMITTED
    &page=1
    &pageSize=20
```

Do not allow arbitrary SQL-like filtering parameters.

---

# 50. API Security Rules

1. Every protected endpoint authenticates the caller.
2. Every resource endpoint checks ownership/authorization.
3. AI requests use the same authorization model.
4. Service actions require capability authorization.
5. Sensitive operations require appropriate consent.
6. Consequential operations require confirmation.
7. Input is validated server-side.
8. Output is filtered according to the user's permissions.
9. Secrets are never returned.
10. Internal errors are not exposed.
11. Rate limits apply to abuse-sensitive operations.
12. All important actions are auditable.

---

# 51. API and RAG Boundary

The browser should not directly access:

```text
PostgreSQL
pgvector
Redis
LLM provider credentials
Embedding provider credentials
Government credentials
```

Instead:

```text
Browser
 ↓
Sanchay API
 ↓
AI/RAG/Application Services
```

---

# 52. API and Government Integration Boundary

The public API should not expose government APIs directly.

Correct:

```text
Sanchay API
 ↓
Service Capability
 ↓
Service Adapter
 ↓
Official Government System
```

Incorrect:

```text
Browser
 ↓
Government API
```

and:

```text
Browser
 ↓
Generic proxy
 ↓
Arbitrary government URL
```

---

# 53. JEE Example API Flow

User:

> "Help me apply for JEE."

```text
POST /ai/chat
        ↓
AI identifies:
JEE + PREPARE_APPLICATION
        ↓
GET /services/:id/capabilities
        ↓
Authorization
        ↓
GET /me/profile
        ↓
POST /applications
        ↓
POST /applications/:id/autofill
        ↓
User reviews
        ↓
POST /applications/:id/confirm
        ↓
POST /applications/:id/submit
        ↓
NTA Adapter
        ↓
Official service
        ↓
Result
```

The AI may orchestrate these operations internally rather than literally calling every public endpoint itself.

---

# 54. JEE Answer Key API Flow

User:

> "Show my answer key."

```text
POST /ai/chat
        ↓
Resolve:
GET_ANSWER_KEY
        ↓
Authorization
        ↓
NTA Adapter
        ↓
Official result
        ↓
Verified response
        ↓
AI / UI
```

The exact government endpoint is intentionally not specified until an authorized official integration is confirmed.

---

# 55. Ayushman Example API Flow

```text
POST /ai/chat
        ↓
Identify Ayushman capability
        ↓
Authorization
        ↓
Retrieve required user/service data
        ↓
Ayushman Adapter
        ↓
Official system
        ↓
Verified result
        ↓
AI response
```

---

# 56. API Error Codes

Recommended application-level codes:

```text
AUTH_REQUIRED
AUTH_INVALID
ACCESS_DENIED

RESOURCE_NOT_FOUND
RESOURCE_CONFLICT
VALIDATION_FAILED

CONSENT_REQUIRED
CONFIRMATION_REQUIRED
CAPABILITY_UNAVAILABLE
CAPABILITY_NOT_AUTHORIZED

GOVERNMENT_SERVICE_UNAVAILABLE
GOVERNMENT_REQUEST_FAILED
GOVERNMENT_RESPONSE_UNVERIFIED

APPLICATION_NOT_READY
APPLICATION_SUBMISSION_FAILED
PAYMENT_PENDING
PAYMENT_FAILED

DOCUMENT_NOT_READY
DOCUMENT_ACCESS_DENIED

RAG_NO_RELIABLE_SOURCE
AI_REQUEST_FAILED
AI_ACTION_BLOCKED

RATE_LIMITED
INTERNAL_ERROR
```

---

# 57. API Observability

Every request should be traceable using:

```text
requestId
traceId
userId (when authenticated)
serviceId (when applicable)
capabilityId (when applicable)
```

Do not put sensitive personal information in request IDs or logs.

---

# 58. API Audit Events

Important operations should create audit records.

Examples:

```text
LOGIN
PROFILE_UPDATED
IDENTITY_LINKED
CONSENT_GRANTED
CONSENT_REVOKED
DOCUMENT_ACCESSED
AI_TOOL_EXECUTED
APPLICATION_CREATED
APPLICATION_SUBMITTED
PAYMENT_INITIATED
SERVICE_DATA_ACCESSED
```

Audit generation should occur reliably even when the user interacts through AI.

---

# 59. Asynchronous APIs

Long-running operations should return:

```http
202 Accepted
```

Example:

```text
POST /knowledge/sync
```

Response:

```json
{
  "data": {
    "jobId": "...",
    "status": "QUEUED"
  }
}
```

The job is processed by a worker.

---

# 60. Webhooks

Sanchay may receive webhooks only from verified/authorized external providers.

Webhook requirements:

- Signature verification
- Replay protection
- Idempotency
- Timestamp validation
- Event validation
- Audit logging

Webhook implementation is integration-specific.

---

# 61. API Contract Testing

Every API contract should be tested for:

```text
Authentication
Authorization
Validation
Success
Failure
Rate limits
Idempotency
Pagination
Audit
```

Government adapter contracts should also be tested using mocks.

---

# 62. OpenAPI

The final API should generate an OpenAPI specification.

The OpenAPI specification must define:

- Paths
- Methods
- Parameters
- Request schemas
- Response schemas
- Authentication
- Error responses
- Examples

OpenAPI becomes the contract between frontend/backend teams.

---

# 63. API Naming Rules

Use resource-oriented names.

Prefer:

```text
/applications
/services
/documents
/conversations
/notifications
```

Avoid:

```text
/getApplications
/doApplication
/fetchUserStuff
```

Actions that genuinely represent commands may use action endpoints where appropriate:

```text
/applications/:id/submit
/applications/:id/confirm
/documents/upload-url
```

---

# 64. API Data Minimization

Every endpoint should return only what the caller needs.

Example:

```text
GET /me/profile
```

should not automatically return:

```text
All government identities
All documents
All applications
All private identifiers
```

Use separate resource endpoints and explicit authorization.

---

# 65. AI Data Minimization

The AI API should accept:

```text
User message
+
validated service context
```

The backend determines what additional data the AI needs.

The client must NOT be trusted to declare:

```text
"Here is all private data you can use."
```

The backend is the authority.

---

# 66. Final API Architecture

```text
                         CLIENT
                           │
                           ↓
                     Sanchay API
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
     Identity          Service APIs        AI API
        │                  │                  │
        ↓                  ↓                  ↓
   User/Profile       Applications       AI Orchestrator
   Consent            Documents                │
   Permissions        Capabilities             │
        │                  │             ┌────┼────┐
        │                  │             ↓    ↓    ↓
        │                  │            RAG Data Tools
        │                  │             │    │    │
        └──────────────────┼─────────────┼────┼────┘
                           ↓             ↓    ↓
                       PostgreSQL     pgvector
                           │
                           ↓
                     Service Adapters
                       ┌────┴────┐
                       ↓         ↓
                      NTA     Ayushman
```

---

# 67. Non-Negotiable API Rules

1. The browser never accesses the database directly.
2. The browser never accesses government private APIs directly.
3. The LLM never accesses the database directly.
4. The LLM never receives unrestricted government credentials.
5. AI tool execution always passes through authorization.
6. Government actions use registered service capabilities.
7. Consequential actions require appropriate confirmation.
8. Sensitive data is returned only when necessary.
9. Government results are never fabricated.
10. Every important operation is traceable and auditable.
11. Idempotency protects retryable side effects.
12. All API contracts are versioned and documented.

---

# 68. Relationship to Other MD Files

```text
07_ARCHITECTURE.md
        ↓
   defines system
        ↓
08_DATABASE.md
        ↓
   defines data
        ↓
09_API.md
        ↓
   defines communication
        ↓
10_SECURITY.md
        ↓
   defines protection
        ↓
11_IMPLEMENTATION.md
        ↓
   defines construction
```

This document defines **how Sanchay components communicate**, not how individual functions are implemented.

---

# 69. Final API Position

> **Sanchay's API is a versioned, authorization-first REST interface that exposes platform resources and registered service capabilities while keeping databases, AI infrastructure, and government integrations behind controlled backend boundaries. AI and traditional interfaces use the same APIs and authorization model, ensuring that conversational actions and conventional UI actions are subject to the same security, validation, consent, and audit controls.**
