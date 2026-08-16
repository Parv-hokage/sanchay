# 08 — Database Design
# SANCHAY — Unified Government Digital Service Platform

**Product:** Sanchay  
**Primary Database:** PostgreSQL  
**Vector Search:** pgvector  
**Cache / Queue:** Redis  
**Object Storage:** S3-compatible storage  
**ORM:** Prisma  
**Version:** 1.0  
**Status:** Database Foundation

---

# 1. Purpose

This document defines Sanchay's persistent data model.

The database must support:

- One Sanchay identity per citizen
- Citizen profiles
- Linked government-service identities
- Consent and permissions
- Government services and capabilities
- Applications
- Documents
- Service-specific data
- RAG knowledge
- AI conversations and tool execution metadata
- Notifications
- Payments
- Audit events
- Data retention
- Security and access boundaries

The database SHALL be designed for **Sanchay as a platform**, not for JEE or Ayushman alone.

---

# 2. Database Principles

## 2.1 PostgreSQL as Source of Truth

PostgreSQL is the primary transactional source of truth for Sanchay-managed data.

Redis is not a permanent source of truth.

Object storage is the source of truth for large binary files.

The vector index is a searchable representation of knowledge, not the authoritative source document.

---

# 3. High-Level Data Architecture

```text
                           SANCHAY DATA
                                │
        ┌───────────────────────┼────────────────────────┐
        ↓                       ↓                        ↓
   Citizen Domain          Service Domain           AI Domain
        │                       │                        │
        ├── Users               ├── Services            ├── Conversations
        ├── Profiles            ├── Capabilities        ├── Messages
        ├── Identities          ├── Integrations        └── Tool Calls
        ├── Consents            └── Applications
        └── Documents
                                │
                 ┌──────────────┴──────────────┐
                 ↓                             ↓
          Knowledge Domain                Audit Domain
                 │                             │
          Sources / Documents             Audit Events
          Chunks / Embeddings
```

---

# 4. Data Storage Boundaries

Sanchay uses three primary storage systems.

```text
PostgreSQL
├── Structured citizen data
├── Service metadata
├── Applications
├── Permissions
├── Audit metadata
└── Knowledge metadata + vectors

Object Storage
└── Large files / documents

Redis
├── Cache
├── Queue
└── Temporary state
```

---

# 5. Identity Domain

## 5.1 users

Represents a Sanchay account.

Conceptual fields:

```text
id
sanchay_uid
status
created_at
updated_at
last_login_at
```

Rules:

- `id` is the internal database primary key.
- `sanchay_uid` is the citizen-facing stable Sanchay identifier.
- `sanchay_uid` must be unique.
- Sanchay UID must not contain personal information.
- Account status supports lifecycle management.

---

# 6. Sanchay UID

The Sanchay UID is the stable identity anchor.

Example:

```text
sanchay_uid = UUID / UUID-like opaque identifier
```

The UID must NOT encode:

- Aadhaar number
- Phone number
- Email
- Date of birth
- Name
- Address

The UID is an internal Sanchay identity, not a replacement for government identity systems.

---

# 7. identity_links

Stores protected relationships between a Sanchay account and an external identity/service account.

Conceptual fields:

```text
id
user_id
service_id
external_subject_reference
status
verified_at
created_at
updated_at
```

Important:

`external_subject_reference` should be protected and should not be exposed to the AI unless strictly required.

---

# 8. Authentication Data

Authentication credentials should preferably be handled by a dedicated identity/authentication provider.

Sanchay PostgreSQL should store only the metadata required by the application.

Avoid storing raw passwords when an external identity provider is used.

Possible fields:

```text
user_id
identity_provider
provider_subject
status
last_authenticated_at
```

---

# 9. Profile Domain

## 9.1 profiles

Stores reusable citizen profile information.

Potential fields:

```text
id
user_id
full_name
date_of_birth
gender
preferred_language
created_at
updated_at
```

Highly sensitive values should be encrypted or stored in a protected field system according to the security design.

---

# 10. addresses

Addresses should be modeled separately from the core profile because a citizen may have multiple addresses.

Conceptual fields:

```text
id
user_id
address_type
address_line_1
address_line_2
city
district
state
postal_code
country
is_primary
created_at
updated_at
```

---

# 11. contact_methods

Supports reusable contact information.

```text
id
user_id
type
value_reference
is_verified
is_primary
created_at
updated_at
```

Examples:

```text
PHONE
EMAIL
```

Sensitive values should not be unnecessarily exposed to AI.

---

# 12. Consent Domain

## 12.1 consents

Records user consent for specific purposes.

```text
id
user_id
service_id
purpose
scope
status
granted_at
revoked_at
version
created_at
```

Example:

```text
User
 ↓
Consent:
"Allow Sanchay to use profile data for JEE application"
```

Consent must be purpose-specific where required.

---

# 13. permissions

Represents authorization rules.

Conceptual fields:

```text
id
subject_type
subject_id
resource_type
resource_id
action
effect
created_at
expires_at
```

Examples:

```text
USER → APPLICATION → READ
USER → DOCUMENT → USE_FOR_APPLICATION
USER → JEE → SUBMIT_APPLICATION
```

---

# 14. Service Domain

## 14.1 departments

Examples:

```text
Education
Healthcare
Employment
Transport
Finance
```

Fields:

```text
id
name
slug
description
status
created_at
updated_at
```

---

# 15. organizations

Represents government organizations/agencies.

Examples:

```text
NTA
Ayushman Bharat / relevant authority
```

Fields:

```text
id
department_id
name
slug
official_domain
description
status
created_at
updated_at
```

---

# 16. services

Represents a citizen-facing government service.

Examples:

```text
JEE Main
Ayushman Bharat
```

Fields:

```text
id
organization_id
name
slug
description
official_url
status
version
created_at
updated_at
```

Relationship:

```text
Department
   ↓
Organization
   ↓
Service
```

---

# 17. service_capabilities

This is one of the most important tables in Sanchay.

It defines what a service can actually do.

Fields:

```text
id
service_id
name
slug
type
description
status
requires_authentication
requires_consent
requires_confirmation
audit_required
created_at
updated_at
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

Example:

```text
JEE Main
├── CHECK_ELIGIBILITY
├── PREPARE_APPLICATION
├── SUBMIT_APPLICATION
├── GET_RESULT
├── GET_ANSWER_KEY
├── GET_ADMIT_CARD
└── GET_APPLICATION_STATUS
```

Not every service has the same capabilities.

---

# 18. service_capability_requirements

Defines data required for a capability.

Example:

```text
Capability:
PREPARE_JEE_APPLICATION

Required:
- Name
- Date of birth
- Category
- Address
- Exam preferences
- Required documents
```

Conceptual fields:

```text
id
capability_id
field_key
required
source
validation_rule
```

This supports dynamic service workflows.

---

# 19. service_integrations

Stores metadata about the technical integration.

```text
id
service_id
integration_type
base_reference
status
version
health_status
created_at
updated_at
```

Do NOT store raw government credentials in ordinary database fields.

Secrets belong in a secure secret manager.

---

# 20. Service Data Strategy

Sanchay should NOT create one giant table:

```text
user
 ├── jee_data
 ├── ayushman_data
 ├── passport_data
 ├── scholarship_data
 └── ...
```

Instead:

```text
User
 ↓
Service
 ↓
Application / Linked Account / Service Record
```

This allows new services to be added without redesigning the user table.

---

# 21. Applications Domain

## 21.1 applications

Represents a citizen's application to a government service.

Fields:

```text
id
user_id
service_id
external_application_reference
status
current_step
submitted_at
created_at
updated_at
```

Status examples:

```text
DRAFT
IN_PROGRESS
READY_FOR_REVIEW
SUBMITTED
PROCESSING
COMPLETED
REJECTED
CANCELLED
FAILED
```

---

# 22. application_fields

Stores structured application values.

```text
id
application_id
field_key
field_value
source
verified
created_at
updated_at
```

Possible sources:

```text
USER
PROFILE
GOVERNMENT
SYSTEM
AI_ASSISTED
```

Critical fields should have stronger validation.

Sensitive values should be encrypted/protected as required.

---

# 23. application_events

Tracks important application state transitions.

```text
id
application_id
event_type
actor_type
actor_id
metadata
created_at
```

Examples:

```text
APPLICATION_CREATED
FIELD_UPDATED
DOCUMENT_ATTACHED
REVIEW_STARTED
SUBMISSION_CONFIRMED
SUBMITTED
STATUS_UPDATED
```

This supports debugging and auditability.

---

# 24. Documents Domain

## 24.1 documents

Stores document metadata.

```text
id
user_id
document_type
storage_key
mime_type
file_size
status
created_at
updated_at
deleted_at
```

The actual binary file belongs in object storage.

---

# 25. document_versions

Allows document replacement/versioning.

```text
id
document_id
version
storage_key
content_hash
mime_type
file_size
created_at
```

This prevents destructive replacement of important files.

---

# 26. document_access_logs

Tracks sensitive document access.

```text
id
document_id
user_id
actor_type
purpose
action
created_at
```

Examples:

```text
VIEW
DOWNLOAD
ATTACH_TO_APPLICATION
AI_PROCESS
```

---

# 27. Knowledge Domain

The knowledge system is separate from citizen transactional data.

## 27.1 knowledge_sources

Represents an authoritative source.

```text
id
service_id
organization_id
source_type
url
title
authority_level
status
last_checked_at
created_at
updated_at
```

Source types:

```text
WEBPAGE
PDF
NOTIFICATION
CIRCULAR
FAQ
GUIDELINE
RULE
```

---

# 28. knowledge_documents

Represents a captured/versioned source document.

```text
id
source_id
content_hash
title
published_at
retrieved_at
version
language
status
created_at
updated_at
```

This allows Sanchay to identify changed government documents.

---

# 29. knowledge_chunks

Stores searchable chunks.

```text
id
knowledge_document_id
chunk_index
content
token_count
metadata
created_at
```

Metadata may include:

```text
section
heading
page
language
effective_date
```

---

# 30. Embeddings / pgvector

The vector representation belongs with the knowledge chunk.

Conceptually:

```text
knowledge_chunks
        │
        └── embedding VECTOR
```

The exact vector dimension depends on the selected embedding model.

The embedding model must be documented as part of the deployment configuration.

---

# 31. RAG Retrieval Model

```text
User question
      ↓
Service context
      ↓
Keyword search
      +
Vector search
      ↓
Candidate chunks
      ↓
Reranking
      ↓
Final chunks
      ↓
AI context
```

Knowledge chunks should retain their source relationship so the AI can provide citations.

---

# 32. Knowledge Freshness

Government information changes.

Use:

```text
source
 ↓
content hash
 ↓
changed?
 ├── NO → keep version
 └── YES
      ↓
new knowledge_document
      ↓
new chunks
      ↓
new embeddings
```

Old versions should remain identifiable rather than silently overwriting historical information.

---

# 33. AI Domain

## 33.1 conversations

Stores AI conversation metadata.

```text
id
user_id
service_id
title
status
created_at
updated_at
```

Avoid storing unnecessary sensitive context.

---

# 34. messages

Stores conversation messages.

```text
id
conversation_id
role
content
created_at
```

Roles:

```text
USER
ASSISTANT
SYSTEM / INTERNAL
```

Sensitive service data should not automatically be persisted as permanent conversation history.

---

# 35. ai_tool_calls

Records tool/capability executions.

```text
id
conversation_id
user_id
service_id
capability_id
status
request_reference
result_reference
created_at
completed_at
```

Do not store sensitive tool payloads unless required.

---

# 36. AI Context

AI context should be constructed dynamically.

Do NOT create a database field like:

```text
users.full_ai_context
```

Instead:

```text
User
+
Current Service
+
Current Page
+
Authorized Data
+
Retrieved Knowledge
+
Available Capabilities
+
Conversation Context
```

The backend creates the task-specific context at request time.

---

# 37. Notifications

## notifications

```text
id
user_id
type
title
body_reference
status
read_at
created_at
```

Examples:

```text
APPLICATION_UPDATE
DEADLINE_REMINDER
DOCUMENT_REQUIRED
SERVICE_NOTIFICATION
```

---

# 38. Payments

Payment records should be service-specific and minimal.

## payments

```text
id
user_id
application_id
provider_reference
amount
currency
status
initiated_at
completed_at
```

Possible statuses:

```text
INITIATED
PENDING
SUCCESS
FAILED
UNKNOWN
REFUNDED
```

Never assume payment success without authoritative confirmation.

---

# 39. Audit Domain

## audit_events

Stores security and important business events.

```text
id
user_id
actor_type
action
resource_type
resource_id
service_id
capability_id
status
request_id
metadata
created_at
```

Examples:

```text
LOGIN
CONSENT_GRANTED
PROFILE_UPDATED
DOCUMENT_ACCESSED
AI_TOOL_EXECUTED
APPLICATION_SUBMITTED
PAYMENT_INITIATED
```

Audit metadata must avoid unnecessary sensitive payloads.

---

# 40. Relationship Overview

```text
USER
 │
 ├──────── PROFILE
 │
 ├──────── ADDRESSES
 │
 ├──────── CONTACT METHODS
 │
 ├──────── CONSENTS
 │
 ├──────── PERMISSIONS
 │
 ├──────── IDENTITY LINKS ───── SERVICE
 │
 ├──────── DOCUMENTS
 │
 ├──────── APPLICATIONS ─────── SERVICE
 │                              │
 │                              └── CAPABILITIES
 │
 ├──────── CONVERSATIONS ───── SERVICE
 │                  │
 │                  ├── MESSAGES
 │                  └── TOOL CALLS ─── CAPABILITY
 │
 └──────── NOTIFICATIONS

SERVICE
 │
 ├── ORGANIZATION
 ├── CAPABILITIES
 ├── INTEGRATIONS
 └── KNOWLEDGE SOURCES
              │
              └── KNOWLEDGE DOCUMENTS
                         │
                         └── KNOWLEDGE CHUNKS
                                  │
                                  └── VECTOR
```

---

# 41. Simplified ER Diagram

```text
┌──────────────┐
│    USERS     │
├──────────────┤
│ id           │
│ sanchay_uid  │
└──────┬───────┘
       │
       ├──────────────┐
       ↓              ↓
┌─────────────┐  ┌──────────────┐
│  PROFILES   │  │   CONSENTS   │
└─────────────┘  └──────────────┘
       │
       ├──────────────┐
       ↓              ↓
┌─────────────┐  ┌──────────────┐
│  DOCUMENTS  │  │ APPLICATIONS │
└─────────────┘  └──────┬───────┘
                        │
                        ↓
                  ┌────────────┐
                  │  SERVICES  │
                  └─────┬──────┘
                        │
              ┌─────────┴─────────┐
              ↓                   ↓
      ┌──────────────┐    ┌───────────────┐
      │ CAPABILITIES │    │ KNOWLEDGE     │
      └──────────────┘    │ SOURCES       │
                          └───────┬───────┘
                                  ↓
                         ┌────────────────┐
                         │ KNOWLEDGE DOCS │
                         └───────┬────────┘
                                 ↓
                         ┌────────────────┐
                         │ KNOWLEDGE      │
                         │ CHUNKS + VECTOR│
                         └────────────────┘
```

---

# 42. ID Strategy

Use opaque identifiers.

Recommended:

```text
UUID / UUIDv7
```

for major entities.

Do not use sequential IDs as public identifiers.

Example:

```text
user_id
application_id
document_id
conversation_id
capability_id
```

Public URLs should use opaque identifiers.

---

# 43. Foreign Keys

Use foreign-key constraints for core relationships.

Examples:

```text
profiles.user_id → users.id

applications.user_id → users.id
applications.service_id → services.id

service_capabilities.service_id → services.id

knowledge_sources.service_id → services.id

knowledge_documents.source_id → knowledge_sources.id

knowledge_chunks.knowledge_document_id
    → knowledge_documents.id
```

Referential integrity is mandatory for transactional domains.

---

# 44. Soft Delete vs Hard Delete

Use soft deletion where historical integrity matters.

Examples:

- Documents
- Applications
- Services
- Knowledge sources

Use hard deletion when required by:

- Retention policy
- User deletion rights
- Legal/compliance requirements
- Security requirements

Deletion policy must be defined before implementation.

---

# 45. Data Classification

Every sensitive domain should have an explicit classification.

```text
PUBLIC
INTERNAL
PERSONAL
SENSITIVE_PERSONAL
HIGHLY_RESTRICTED
```

Examples:

```text
Public:
Government notification

Personal:
Name

Sensitive:
Application information

Highly Restricted:
Authentication credentials / protected identity secrets
```

The exact classification matrix belongs in `10_SECURITY.md`.

---

# 46. Encryption

Sensitive data should use:

```text
In transit:
TLS

At rest:
Provider/database encryption

Highly sensitive fields:
Application-level encryption where required
```

Encryption keys must be managed outside application source code.

---

# 47. Database Access Architecture

Application code should access PostgreSQL through controlled repositories/services.

```text
Frontend
 ↓
API
 ↓
Authorization
 ↓
Application Service
 ↓
Repository / ORM
 ↓
PostgreSQL
```

The AI does not bypass the application layer.

---

# 48. AI Database Access Rule

The following is prohibited:

```text
LLM
 ↓
SQL
 ↓
PostgreSQL
```

Preferred:

```text
LLM
 ↓
Approved capability
 ↓
Backend service
 ↓
Validated query
 ↓
Authorization
 ↓
PostgreSQL
```

The AI should never generate arbitrary SQL against citizen data.

---

# 49. Government Data Storage Rule

Sanchay should store only the government data required for a legitimate product function.

Prefer:

```text
Government system
      ↓
Authorized retrieval
      ↓
Use for task
      ↓
Store only if required
```

Do not create a permanent copy of every government database.

---

# 50. Service-Specific Data Strategy

When a service requires unique data structures, use a service-specific model or controlled extension rather than polluting the universal user schema.

Example:

```text
users
profiles
applications
      │
      └── service-specific data
```

For highly dynamic application fields, a controlled JSONB field MAY be used alongside strongly typed critical fields.

JSONB should not become an excuse for an unstructured database.

---

# 51. Indexing Strategy

Important indexes include:

```text
users.sanchay_uid
identity_links.user_id
identity_links.service_id

applications.user_id
applications.service_id
applications.status

service_capabilities.service_id

documents.user_id
documents.document_type

knowledge_documents.source_id
knowledge_chunks.knowledge_document_id

conversations.user_id
messages.conversation_id

audit_events.user_id
audit_events.created_at
audit_events.request_id
```

Additional indexes should be added based on measured query patterns.

---

# 52. Uniqueness Constraints

Examples:

```text
users.sanchay_uid UNIQUE

services.organization_id + services.slug UNIQUE

service_capabilities.service_id + service_capabilities.slug UNIQUE

knowledge_documents.source_id + content_hash UNIQUE

identity_links.user_id + service_id + external_subject_reference UNIQUE
```

Exact constraints are finalized during schema implementation.

---

# 53. Transactions

Use database transactions for operations that must remain atomic.

Example:

```text
Create application
+
Create initial application state
+
Create audit event
```

Either all required operations succeed or the transaction rolls back.

---

# 54. Idempotency

Important operations should support idempotency.

Especially:

- Application submission
- Payment initiation
- Government API calls
- Document processing jobs
- Notification jobs

Example:

```text
Request
 ↓
Idempotency key
 ↓
Already processed?
 ├── YES → return previous result
 └── NO  → execute
```

This prevents duplicate submissions.

---

# 55. Retention Strategy

Retention must be data-type specific.

Example policy categories:

```text
Temporary AI context
→ Short-lived

Cached data
→ Short-lived

Documents
→ Policy-driven

Application records
→ Longer retention

Audit records
→ Long retention

Knowledge versions
→ Retain according to source/version policy
```

Exact durations should be established based on legal, government, and product requirements.

---

# 56. Backup Strategy

PostgreSQL:

- Automated backups
- Point-in-time recovery where available
- Periodic restore testing

Object storage:

- Versioning where appropriate
- Backup/replication strategy
- Lifecycle policies

Redis:

- Treat as recoverable infrastructure, not primary data

Backups must be encrypted.

---

# 57. Disaster Recovery

Target architecture should support:

```text
Database failure
 ↓
Restore / failover
 ↓
Application reconnects

Worker failure
 ↓
Queue retains job
 ↓
Worker retries

Government service failure
 ↓
Circuit breaker / degraded state
 ↓
Retry later
```

Recovery objectives should be finalized during deployment planning.

---

# 58. Database Scalability

Initial:

```text
Single PostgreSQL deployment
+
Indexes
+
Connection pooling
+
pgvector
```

Future:

```text
Read replicas
+
Partitioning where justified
+
Dedicated vector DB if necessary
+
Service-specific data stores if justified
```

Do not prematurely distribute the database.

---

# 59. Migration Strategy

Use version-controlled migrations.

Rules:

1. Every schema change gets a migration.
2. Never manually modify production schema without a migration.
3. Migrations must be tested.
4. Destructive migrations require explicit review.
5. Backward-compatible migrations should be preferred for rolling deployments.

---

# 60. Seed Data

Development/staging seed data may include:

```text
Departments
Organizations
Services
Capabilities
Mock service integrations
Sample knowledge sources
```

Production seed data must be reviewed and controlled.

Never use real citizen data as development seed data.

---

# 61. Example JEE Data Model

```text
USER
 │
 ├── IDENTITY_LINK → NTA/JEE identity
 │
 ├── PROFILE
 │
 ├── DOCUMENTS
 │
 └── APPLICATION
        │
        ├── SERVICE = JEE MAIN
        │
        ├── APPLICATION FIELDS
        │
        ├── DOCUMENTS
        │
        └── GOVERNMENT REFERENCE
```

Answer key/result should normally be retrieved through the authorized JEE capability rather than blindly duplicated into the user's permanent profile.

---

# 62. Example Ayushman Data Model

```text
USER
 │
 ├── IDENTITY_LINK → Ayushman service
 │
 ├── PROFILE
 │
 ├── CONSENTS
 │
 └── SERVICE DATA / APPLICATION
        │
        ├── STATUS
        ├── DOCUMENTS
        └── GOVERNMENT REFERENCE
```

The exact data model depends on the official integration and authorized data available.

---

# 63. AI Conversation Data Rule

Conversation history must not become a second citizen database.

Do not store:

```text
Entire profile
+
Entire government records
+
Entire documents
```

inside conversation history.

Instead:

```text
Conversation
 ↓
References authorized resources
```

where possible.

---

# 64. Database Security Invariants

1. No public database access.
2. No direct LLM database access.
3. No raw government credentials in ordinary tables.
4. Sensitive data must have explicit access rules.
5. Foreign-key integrity must be preserved.
6. Public IDs must be opaque.
7. Development environments must not contain real citizen data.
8. Audit records must not expose unnecessary sensitive payloads.
9. Database backups must be protected.
10. Data retention must be enforced.

---

# 65. Final Data Architecture

```text
                         USER
                          │
                    Sanchay UID
                          │
       ┌──────────────────┼───────────────────┐
       ↓                  ↓                   ↓
    PROFILE            CONSENT            DOCUMENTS
       │                  │                   │
       └──────────────────┼───────────────────┘
                          ↓
                  LINKED SERVICES
                          │
             ┌────────────┼────────────┐
             ↓            ↓            ↓
            JEE       AYUSHMAN      FUTURE
             │            │            │
             └────────────┼────────────┘
                          ↓
                    APPLICATIONS
                          │
                    CAPABILITIES
                          │
                     GOVERNMENT
                     INTEGRATIONS


PUBLIC KNOWLEDGE
       │
       ↓
KNOWLEDGE SOURCES
       ↓
DOCUMENT VERSIONS
       ↓
CHUNKS + EMBEDDINGS
       ↓
RAG


AI
│
├── Conversations
├── Messages
└── Tool Calls
        │
        ↓
   CAPABILITIES


ALL SENSITIVE ACTIONS
        ↓
     AUDIT
```

---

# 66. Final Database Position

> **Sanchay's database is a platform-oriented PostgreSQL model centered around the Sanchay UID, reusable citizen profile, explicit consent, modular government services, service capabilities, applications, documents, authoritative knowledge, AI interaction metadata, and auditable actions. Citizen data remains separate from public knowledge, large files remain in object storage, vectors remain searchable through pgvector, and the AI never receives direct database access.**

This design allows Sanchay to add new government services without redesigning the core citizen identity or database architecture.
