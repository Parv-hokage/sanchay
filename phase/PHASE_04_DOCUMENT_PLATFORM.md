# PHASE 4 — PRIVATE DOCUMENT PLATFORM & VAULT
# SANCHAY — Unified Government Digital Service Platform

**Phase:** 4  
**Status:** Next  
**Depends On:** Phase 3 — Application Engine & Deterministic Auto-Fill  
**Primary Goal:** Build a secure private citizen-document platform so Sanchay can store, manage, process, and authorize access to documents required by government services.

---

# 1. Phase Objective

Phase 4 introduces the secure document layer of Sanchay.

Government applications frequently require citizens to repeatedly upload the same documents.

Sanchay should instead provide a secure private document vault:

```text
Citizen
   ↓
Secure Upload
   ↓
Validation
   ↓
Malware Scanning
   ↓
Private Object Storage
   ↓
Document Metadata
   ↓
Access Control
   ↓
Authorized Application
   ↓
Document Retrieval
```

The document platform must be designed as a reusable infrastructure layer.

It must NOT be built specifically for JEE or Ayushman.

---

# 2. Phase Principle

> **A citizen's document is private by default. Storage, retrieval, processing, and sharing must all be explicitly authorized and auditable.**

Authentication alone does not grant unrestricted document access.

---

# 3. Scope

## In Scope

- Private document vault
- Secure upload authorization
- File type validation
- File size validation
- Upload lifecycle
- Private object storage
- Document metadata
- Document versions
- Malware scanning queue
- Document processing state
- Document access authorization
- Application-to-document authorization
- Document access logs
- Secure document listing
- Secure document download/access
- Document deletion
- Retention foundation
- Frontend document vault UI
- Upload UI
- Document status UI
- Security tests
- E2E tests
- Local development flow

## Out of Scope

Do NOT implement:

- OCR-based identity extraction
- AI document understanding
- LLM document analysis
- Automatic document classification using AI
- Production government document submission
- Government-specific document APIs
- Full RAG document ingestion
- Cross-user document sharing
- Public document URLs

These belong to later phases unless explicitly required by existing specifications.

---

# 4. Document Architecture

Use the following conceptual architecture:

```text
Frontend
   ↓
Authenticated API
   ↓
Authorization
   ↓
Document Service
   ↓
Upload Validation
   ↓
Private Object Storage
   ↓
Document Metadata
   ↓
Malware Scan Queue
   ↓
Processing Result
   ↓
AVAILABLE / REJECTED
```

The database stores document metadata.

The actual binary file must NOT be stored directly inside PostgreSQL.

---

# 5. Storage Architecture

Use:

```text
PostgreSQL
    ↓
Document Metadata

Object Storage
    ↓
Actual File
```

For local development, use the existing local infrastructure or an S3-compatible local object-storage solution if already defined by the project documentation.

For production, use the object-storage architecture defined in the existing deployment/security specifications.

Do not make the frontend responsible for object-storage authorization.

---

# 6. Private Storage

Document objects must be private.

Do NOT expose:

```text
/public/documents/...
```

Do NOT expose permanent public URLs.

Use controlled access such as:

```text
Authenticated User
        ↓
Backend Authorization
        ↓
Short-lived / controlled object access
        ↓
Private Document
```

The exact mechanism must follow `11_SECURITY.md` and `14_DEPLOYMENT.md`.

---

# 7. Upload Flow

The upload flow should be:

```text
User
 ↓
Select Document
 ↓
Backend Authorization
 ↓
Upload Validation
 ↓
Create Document Record
 ↓
Store File Privately
 ↓
Queue Malware Scan
 ↓
Scan
 ↓
AVAILABLE / REJECTED
```

A document must not become available for application use before the required security scan succeeds.

---

# 8. Upload Authorization

Before an upload is accepted:

1. Authenticate the user.
2. Determine the authenticated citizen.
3. Verify that the document belongs to that citizen.
4. Validate file metadata.
5. Validate file size.
6. Validate allowed file type.
7. Create the document record.
8. Store privately.
9. Queue scanning.

Never trust a client-supplied user ID.

---

# 9. File Validation

Validate at the backend.

At minimum validate:

- File size
- MIME type
- File extension
- File signature/magic bytes where practical
- Filename safety
- Storage key safety

Do not rely only on the browser-provided MIME type.

Reject unsupported file types.

The exact allowed file types and limits must follow the existing project requirements/security documents.

Do not invent unnecessarily broad limits.

---

# 10. Filename Security

Never use the raw user filename directly as the storage path.

Bad:

```text
uploads/<userFilename>
```

Prefer an opaque storage key:

```text
documents/<citizenId>/<documentId>/<versionId>
```

or the exact secure storage-key scheme defined by the architecture.

Sanitize filenames used only for display.

---

# 11. Document Metadata

Store metadata such as:

- Document ID
- Citizen owner
- Document type/category
- Original display filename
- MIME type
- Size
- Storage key
- Upload timestamp
- Current status
- Scan status
- Version
- Created/updated timestamps
- Retention metadata where supported

Do not store unnecessary sensitive information.

---

# 12. Document Status

Use a clear document lifecycle.

Conceptually:

```text
PENDING_SCAN
      ↓
SCANNING
      ↓
AVAILABLE
```

Failure path:

```text
PENDING_SCAN
      ↓
SCANNING
      ↓
REJECTED
```

Deletion:

```text
AVAILABLE
      ↓
DELETED
```

Use the authoritative database/API state definitions if they differ.

Do not expose raw scanner internals to the citizen.

---

# 13. Malware Scanning

Scanning must happen asynchronously.

Architecture:

```text
Upload
 ↓
Object Storage
 ↓
Queue
 ↓
Document Processing Worker
 ↓
Malware Scanner
 ↓
Result
 ↓
Document Status Update
```

The web request must not wait for a long-running malware scan.

The worker must update the document state after scanning.

---

# 14. Malware Scanner

Create the scanning boundary so the implementation can use a real scanner.

For local development, a deterministic mock/sandbox scanner may be used if a production malware scanner is unavailable.

The mock must be clearly identified as a development-only implementation.

Do NOT claim that a mock scanner provides production malware protection.

---

# 15. Scanner Failure

If scanning fails unexpectedly:

```text
Document
 ↓
SCAN_ERROR
```

The document must NOT become available.

It should remain quarantined/restricted until successfully scanned or explicitly rejected.

---

# 16. Document Versions

A document may have multiple versions.

Conceptually:

```text
Document
 ├── Version 1
 ├── Version 2
 └── Version 3
```

Only the appropriate current version should be treated as active.

Do not overwrite previous versions if version retention is required by the existing schema.

Every version must retain its own:

- Storage reference
- Metadata
- Scan status
- Timestamp
- Audit trail

---

# 17. Document Ownership

Every document must have an owner.

User A:

```text
Document A → ALLOW
```

User A attempting:

```text
Document B owned by User B → DENY
```

This must be enforced server-side.

Never rely on the frontend to hide another user's documents.

---

# 18. Application-to-Document Access

Applications may require documents.

Example:

```text
JEE Application
 ↓
Required Document
 ↓
Citizen Document Vault
 ↓
Authorized Document
```

The application engine must not receive unrestricted access to the entire vault.

It should request only the required document/capability.

---

# 19. Document Access Authorization

Every document access request must verify:

```text
Authenticated User
        ↓
Document Ownership / Delegation
        ↓
Purpose
        ↓
Application Context where applicable
        ↓
Authorization
        ↓
Access
```

No authorization:

```text
DENY
```

---

# 20. Document Access Logs

Track meaningful access events.

Examples:

```text
DOCUMENT_UPLOADED
DOCUMENT_SCAN_STARTED
DOCUMENT_SCAN_COMPLETED
DOCUMENT_SCAN_REJECTED
DOCUMENT_VIEWED
DOCUMENT_DOWNLOADED
DOCUMENT_ATTACHED_TO_APPLICATION
DOCUMENT_VERSION_CREATED
DOCUMENT_DELETED
DOCUMENT_ACCESS_DENIED
```

Do not log raw document contents.

Do not log unnecessary sensitive metadata.

---

# 21. Secure Download / Access

Documents must never be served through unrestricted public static routes.

Preferred conceptual flow:

```text
GET /document/:id/access
        ↓
Authentication
        ↓
Authorization
        ↓
Audit
        ↓
Controlled Access
```

If object-storage signed URLs are used:

- Keep them short-lived.
- Generate them only after authorization.
- Never persist them as permanent document URLs.
- Do not expose storage credentials to the frontend.

---

# 22. Document Deletion

Deletion must be authorized.

The user must only be able to delete their own eligible documents.

Before deletion, consider:

- Whether an active application references the document.
- Whether retention rules prevent deletion.
- Whether audit requirements require metadata retention.

The exact retention/deletion behavior must follow the existing product/security documentation.

---

# 23. Retention

Implement the foundation for document retention.

Documents may eventually have policies such as:

```text
Temporary
Application-linked
Long-term
User-managed
```

Do not invent legal retention periods.

Government/legal retention requirements must be configured only when authoritative requirements are available.

---

# 24. Document Vault UI

Build a real Sanchay document experience.

Example:

```text
MY DOCUMENTS

[ + Upload Document ]

────────────────────────────

Identity
┌───────────────────────────┐
│ Identity Document         │
│ Available ✓               │
└───────────────────────────┘

Education
┌───────────────────────────┐
│ Class 12 Certificate      │
│ Available ✓               │
└───────────────────────────┘

Other
┌───────────────────────────┐
│ New Document              │
│ Scanning...               │
└───────────────────────────┘
```

The visual language must remain consistent with Sanchay.

---

# 25. Upload UI

The upload experience should communicate:

```text
Select file
 ↓
Uploading
 ↓
Security scanning
 ↓
Available / Rejected
```

Show appropriate:

- Progress
- Status
- Error messages
- Retry option where safe
- File information
- Scan state

Do not expose internal security implementation details.

---

# 26. Document Detail

A document detail view may show:

- Display name
- Type
- Size
- Upload date
- Status
- Version
- Application associations where appropriate
- Available actions

Do not expose storage keys, internal paths, scanner internals, or credentials.

---

# 27. API

Implement document APIs according to `09_API.md`.

Conceptually:

```text
List documents
Get document metadata
Create upload
Upload / finalize document
Get document status
Access/download document
Delete document
Get document versions
Get document access history where authorized
```

Exact routes and methods must follow the existing API contract.

Do not create a parallel API design.

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
Document Service
 ↓
Storage Service
 ↓
Queue
 ↓
Document Processing Worker
 ↓
Scanner
 ↓
Database
```

Keep storage and scanning implementations behind interfaces.

This allows local mock infrastructure to be replaced by production infrastructure without changing the application domain.

---

# 29. Worker Architecture

Use the existing worker structure:

```text
workers/document-processing
```

Implement the required processing flow there.

The worker must:

1. Receive a document job.
2. Retrieve the private object.
3. Run the configured scanner.
4. Update scan/document state.
5. Record the relevant audit event.
6. Handle failure safely.
7. Avoid exposing file contents in logs.

---

# 30. Security Requirements

Follow `11_SECURITY.md`.

Phase 4 must specifically protect against:

- IDOR/BOLA
- Path traversal
- Malicious filenames
- MIME spoofing
- File-signature mismatch
- Oversized uploads
- Malicious files
- Public object exposure
- Unauthorized signed URLs
- Expired access tokens
- Cross-user document access
- Storage credential exposure
- Scanner bypass
- Race conditions between upload and availability
- Sensitive data leakage in logs

---

# 31. Threat Model

Explicitly test:

```text
Attacker
 ↓
Changes document ID
 ↓
Attempts another user's document
 ↓
DENY
```

```text
Attacker
 ↓
Uploads malicious executable disguised as PDF
 ↓
Validation / scan
 ↓
REJECT
```

```text
Attacker
 ↓
Requests document before scan
 ↓
DENY
```

```text
Attacker
 ↓
Uses expired access URL
 ↓
DENY
```

```text
Attacker
 ↓
Attempts path traversal
 ↓
REJECT
```

---

# 32. Testing

## Unit Tests

Test:

- File validation
- Filename sanitization
- Storage-key generation
- Ownership checks
- Document states
- Version creation
- Retention checks
- Authorization rules

## Integration Tests

Test:

- Upload metadata creation
- Private storage
- Queue creation
- Worker processing
- Scanner result
- Status update
- Access logging
- Deletion

## Security Tests

Test:

- Cross-user access
- IDOR
- Path traversal
- MIME spoofing
- Oversized files
- Unscanned access
- Expired signed access
- Unauthorized deletion
- Unauthorized version access

## E2E

At minimum:

```text
Login
 ↓
My Documents
 ↓
Upload Document
 ↓
Upload Complete
 ↓
Scanning
 ↓
Available
 ↓
Open Document
 ↓
View Metadata
 ↓
Create New Version
 ↓
Delete / Manage Document
```

Also verify that another authenticated user cannot access the document.

---

# 33. Visual Acceptance Criteria

When running locally, the user should be able to see:

```text
Sanchay
 ↓
My Documents
 ↓
Upload
 ↓
Document appears as "Scanning"
 ↓
Document becomes "Available"
 ↓
Open document
 ↓
View metadata
```

The experience should feel like a secure native part of Sanchay, not an external file-storage website.

---

# 34. Local Development

Phase 4 must work locally.

Use the existing development infrastructure.

Expected:

```bash
pnpm dev
```

plus the required Docker/local services.

The local environment should support:

```text
PostgreSQL
Redis
Object Storage
API
Worker
Web
```

If production object storage is unavailable locally, use a compatible local implementation.

If production malware scanning is unavailable locally, use a clearly labeled deterministic development scanner.

---

# 35. Data Privacy

Never send private document contents to the general AI context automatically.

Future AI access must be:

```text
Specific User Intent
        ↓
Specific Document
        ↓
Authorization
        ↓
Purpose
        ↓
Explicit Retrieval
```

Do not preload the citizen's entire document vault into an LLM context.

---

# 36. AI Boundary

Phase 4 does NOT implement document-aware AI.

AI may eventually help:

- Find a document.
- Explain why a document is required.
- Explain document status.
- Help navigate the vault.

AI must NOT:

- Automatically access every document.
- Upload documents without authorization.
- Share documents without authorization.
- Bypass malware scanning.
- Override retention rules.
- Expose document contents without authorization.

---

# 37. Database

Use the existing document models from `08_DATABASE.md`.

Expected relevant models include:

```text
CitizenDocument
DocumentVersion
DocumentAccessLog
User
Application
ApplicationField
AuditEvent
```

Modify the schema only where necessary.

All changes require migrations.

Do not duplicate existing document models.

---

# 38. Acceptance Criteria

Phase 4 is accepted only when:

### Storage

- Documents are stored outside PostgreSQL as binaries.
- Metadata is stored in PostgreSQL.
- Storage objects are private.
- No permanent public document URL exists.

### Upload

- Upload authorization works.
- File validation works.
- Unsafe files are rejected.
- Oversized files are rejected.
- Storage keys are safe.

### Scanning

- Uploaded documents enter a scan state.
- Documents cannot be used before successful scanning.
- Worker processing works.
- Scanner failure is handled safely.
- Mock scanner is clearly marked as development-only if used.

### Access

- Users can access only their own documents.
- Application access is purpose-limited.
- Access is audited.
- Unauthorized access is denied.

### Versions

- New versions can be created.
- Version metadata is preserved.
- Appropriate current version is identified.

### UI

- Document vault works.
- Upload flow works.
- Scan status is visible.
- Document detail works.
- Error/loading/empty states work.

### Security

- IDOR tests pass.
- File-security tests pass.
- Authorization tests pass.
- Scanner bypass tests pass.
- Storage exposure tests pass.

### Quality

- Typecheck passes.
- Lint passes.
- Unit tests pass.
- Integration tests pass.
- E2E tests pass.
- Production build passes.

---

# 39. Phase Deliverables

```text
✓ Private document vault
✓ Secure upload authorization
✓ File validation
✓ Private object storage
✓ Document metadata
✓ Document versions
✓ Malware scanning queue
✓ Document processing worker
✓ Scan status
✓ Secure access
✓ Access logs
✓ Document deletion
✓ Retention foundation
✓ Application-document authorization
✓ Document vault UI
✓ Upload UI
✓ Security tests
✓ E2E tests
✓ Local visual verification
✓ Documentation updates
```

---

# 40. Phase Exit Gate

Phase 4 is complete only when:

```text
CITIZEN
   ↓
UPLOAD
   ↓
VALIDATION
   ↓
PRIVATE STORAGE
   ↓
MALWARE SCAN
   ↓
AVAILABLE
   ↓
AUTHORIZED ACCESS
   ↓
APPLICATION USE
   ↓
AUDIT
   ↓
RETENTION / DELETE
   ↓
TESTING
   ↓
DOCUMENTATION
   ↓
PHASE 4 COMPLETE
```

Do not move to Phase 5 until this flow works locally and the security/ownership tests pass.

---

# 41. Phase 5 Handoff

After Phase 4, Sanchay should be ready for:

```text
PHASE 5 — RAG / KNOWLEDGE PLATFORM

Official Government Sources
        ↓
Source Registry
        ↓
Ingestion
        ↓
Parsing
        ↓
Chunking
        ↓
Embeddings
        ↓
pgvector
        ↓
Hybrid Search
        ↓
Reranking
        ↓
Citations
```

The document platform must remain separate from the public government knowledge ingestion system.

A citizen's private document is NOT automatically part of the public RAG corpus.

---

# 42. Documentation Synchronization

After Phase 4:

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
14_DEPLOYMENT.md
```

If architecture decisions change:

```text
19_DECISIONS.md
```

Documentation must describe actual implementation.

---

# 43. Phase 4 Rule

> **Private documents belong to the citizen, remain private by default, and become usable only after validation, successful security scanning, and explicit authorization.**
