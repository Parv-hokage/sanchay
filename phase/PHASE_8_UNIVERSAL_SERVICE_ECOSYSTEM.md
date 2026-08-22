# PHASE 8 — UNIVERSAL SERVICE ECOSYSTEM
## Autonomous Execution & Documentation Contract

**Status:** READY FOR EXECUTION  
**Purpose:** Convert Sanchay from a single-service implementation into a reusable ecosystem where future government services can be added through standardized templates, adapters, AI actions, profile resolution, document handling, and universal forms.

---

## 0. EXECUTION MODE

This is an **execution file**, not merely a design document.

After uploading this MD to Antigravity:

1. Read the entire file first.
2. Inspect the repository and existing architecture.
3. Read the existing project Markdown documentation before changing architecture.
4. Compare the requirements below with the actual implementation.
5. Create an internal execution plan.
6. Execute the work autonomously.
7. Maintain the required Markdown documentation throughout execution.
8. Run verification after meaningful changes.
9. Fix discovered problems instead of merely reporting them.
10. Update the Markdown files with what was **actually** done.
11. Review Git, commit, push, deploy, and verify production.
12. STOP after Phase 8.

Do not ask the user to manually inspect routine files, forms, logs, tests, deployment settings, or verification steps unless absolutely necessary.

**Never fabricate evidence, test results, deployment status, files, or completed work.**

---

# 1. CORE OBJECTIVE

Sanchay must become a **platform**, not a collection of individually coded government websites.

Future services such as:

- JEE Main
- Ayushman Bharat
- Scholarships
- Government certificates
- Admissions
- Welfare schemes
- Exams
- Registrations
- Other public services

must reuse the same infrastructure.

The next service should NOT require rebuilding:

- authentication
- profile retrieval
- AI context
- document retrieval
- document upload
- form rendering
- form filling
- validation
- confirmation
- audit logging

If the same capability is needed twice, make it reusable infrastructure.

---

# 2. FIRST ACTION — FULL REPOSITORY AUDIT

Before modifying code, inspect:

- repository structure
- packages/workspaces
- API
- web application
- AI architecture
- authentication/session system
- Sanchay Profile
- document vault/storage
- application system
- JEE implementation
- forms
- action/tool registry
- validation
- audit logging
- database schema
- service catalog
- deployment configuration
- existing emergency-phase documentation

Read relevant existing MD files before architectural changes.

The repository is the implementation source of truth. This document defines the required target architecture.

---

# 3. UNIVERSAL SERVICE ARCHITECTURE

Target architecture:

```text
Sanchay AI
    ↓
Universal Action Engine
    ↓
Service Registry
    ↓
Service Adapter
    ↓
External Government Service
```

Each service should define only service-specific information:

- service ID
- metadata
- capabilities
- requirements
- profile fields
- documents
- form schema
- validation
- service-specific actions
- submission/status behavior

Universal functionality must remain service-agnostic.

---

# 4. SERVICE ADAPTER CONTRACT

Create/generalize a practical service adapter contract.

Conceptually:

```ts
interface ServiceAdapter {
  serviceId: string;
  name: string;
  capabilities: ServiceCapability[];

  getRequirements(): Promise<ServiceRequirement[]>;
  getFormSchema(): Promise<FormSchema>;

  executeAction(
    action: ServiceAction,
    context: AuthenticatedUserContext
  ): Promise<ActionResult>;
}
```

Adapt this to the existing architecture rather than blindly copying it.

---

# 5. UNIVERSAL PROFILE RESOLVER

The Sanchay Profile is the canonical citizen identity source.

Services must not create duplicate ownership of:

- full name
- DOB
- gender
- category
- contact information
- addresses
- academic qualifications
- identity information

Services declare required profile fields.

The platform resolves those fields from the **authenticated user's actual profile**.

Required flow:

```text
Authenticated User
       ↓
Authenticated User ID
       ↓
Profile Resolver
       ↓
Canonical Sanchay Profile
       ↓
Service/Form/AI
```

The AI must never invent profile values.

If a required value is missing, the AI must identify it as missing and ask the user to provide/update it.

---

# 6. UNIVERSAL AI ACTION ENGINE

Create or generalize a centralized action registry.

Possible reusable actions:

### Profile
- GET_PROFILE
- GET_ACADEMIC_PROFILE
- GET_ADDRESSES

### Documents
- SEARCH_DOCUMENT
- GET_DOCUMENT
- DOWNLOAD_DOCUMENT
- UPLOAD_DOCUMENT

### Forms
- GET_FORM_SCHEMA
- FILL_FORM
- VALIDATE_FORM
- REVIEW_FORM
- CONFIRM_FORM

### Applications
- CREATE_APPLICATION
- GET_APPLICATION
- GET_APPLICATION_STATUS
- SAVE_APPLICATION

### Services
- GET_REQUIREMENTS
- CHECK_ELIGIBILITY

Service adapters may expose additional service-specific actions through the same registry.

Do NOT create one-off AI tool systems for each service.

---

# 7. AI MUST NEVER BE THE SECURITY BOUNDARY

Required architecture:

```text
User
 ↓
AI
 ↓
Action Request
 ↓
Server Authorization
 ↓
Ownership Validation
 ↓
Consent / Permission Validation
 ↓
Service Adapter
 ↓
Execution
 ↓
Result
 ↓
AI
```

The AI may request an action.

The server decides whether it is authorized.

Protect against:

- cross-user access
- unauthorized documents
- unauthorized profile changes
- arbitrary storage access
- unauthorized application submission

---

# 8. UNIVERSAL DOCUMENT ENGINE

Government services repeatedly need documents.

Create/reuse one document abstraction supporting:

- document search
- metadata
- retrieval
- download
- upload
- validation
- application association
- ownership checks

The AI should understand requests such as:

> Send me my 12th marksheet.

and translate them into a structured document action.

Never expose raw filesystem paths to the AI.

---

# 9. UNIVERSAL DOCUMENT UPLOAD

Required flow:

```text
Service Requirement
        ↓
AI identifies missing document
        ↓
AI asks user to upload
        ↓
User uploads in chat
        ↓
File validation
        ↓
Document identification
        ↓
Authenticated ownership association
        ↓
Service adapter
        ↓
External upload
```

Do not create a custom upload architecture for each service.

---

# 10. UNIVERSAL FORM ENGINE — CRITICAL

Every future government form MUST use the Universal Form Engine.

Forms must be machine-readable and define:

- form ID
- sections
- fields
- field types
- required/optional
- data source
- editable state
- validation
- dependencies
- confirmation requirements
- document requirements
- submission behavior

Example:

```json
{
  "field": "fullName",
  "source": "profile.fullName",
  "state": "PROFILE_VERIFIED",
  "editable": false
}
```

---

# 11. AI-FIRST FORM COMPLETION

The user should NOT manually walk through every field if Sanchay already knows the information.

Required workflow:

```text
User: Apply for JEE

AI:
1. Load form schema
2. Resolve authenticated Sanchay Profile
3. Auto-fill known information
4. Identify missing information
5. Ask ONLY for missing information
6. Capture answers
7. Validate
8. Update visible form
9. Show complete review
10. Ask for explicit confirmation
11. Submit only after confirmation
```

Never ask the user for information that is already reliably available from their profile.

---

# 12. FIELD STATES

Standardize field states where practical:

```text
PROFILE_VERIFIED
USER_PROVIDED
AI_EXTRACTED
MISSING
INVALID
VALID
REQUIRES_CONFIRMATION
LOCKED
```

Example:

```json
{
  "field": "fullName",
  "value": "resolved from profile",
  "source": "SANCHAY_PROFILE",
  "state": "PROFILE_VERIFIED",
  "editable": false
}
```

---

# 13. CHAT AND FORM MUST SHARE STATE

The AI chat and visible form must operate on the same application/form state.

If AI sets:

```text
Exam City = Noida
```

the visible form must update.

If the user changes it to Delhi in the form, the AI must see Delhi.

There must be one authoritative application state, not separate chat/form copies.

---

# 14. INTELLIGENT CROSS-CHECK

Before consequential submission, show a structured review:

```text
APPLICATION REVIEW

✓ Name — From Sanchay Profile
✓ DOB — From Sanchay Profile
✓ Category — From Sanchay Profile

✓ Exam Session — User selected
✓ Exam Paper — User selected
✓ Exam City — User selected

Please confirm these details before submission.

[Confirm & Submit]
[Edit]
```

Never silently submit.

---

# 15. SERVICE REQUIREMENT ENGINE

Each service should declare:

```text
Required Profile Fields
Required Documents
Required Application Fields
Optional Fields
Validation Rules
Submission Requirements
```

The universal engine uses these requirements to determine what is already known and what remains necessary.

---

# 16. SERVICE CONNECTOR ISOLATION

External API/browser automation/website-specific complexity must stay inside the service adapter.

Example:

```text
Universal Engine
       ↓
JEE Adapter
       ↓
JEE External System
```

```text
Universal Engine
       ↓
Ayushman Adapter
       ↓
Ayushman External System
```

External selectors, browser automation, API quirks, and service-specific logic must not leak into the universal platform.

---

# 17. MOCK SECOND SERVICE PROOF

Before Phase 8 is complete, create a small mock second service.

The purpose is to prove that another service can reuse the universal architecture without duplicating:

- authentication
- profile retrieval
- AI context
- document retrieval
- document upload
- form rendering
- form filling
- validation
- confirmation
- audit logging

Do NOT build the full Ayushman Bharat integration.

---

# 18. MANDATORY MARKDOWN DOCUMENTATION

Documentation is part of the implementation.

Maintain these files:

```text
00_CURRENT_STATE.md
md files/17_CHANGELOG.md
emergency phase/EMERGENCY_EXECUTION_LOG.md
emergency phase/PHASE_8_UNIVERSAL_SERVICE_ECOSYSTEM.md
```

If an existing project MD is the correct source for a subsystem, update that file rather than creating duplicates.

Do not create random documentation files.

---

# 19. EXECUTION LOG — REQUIRED AFTER EVERY MEANINGFUL STEP

For every meaningful step, append/update:

```md
## Log Entry N

- Phase:
- Step:
- Status:

### What I was instructed to do

### What I actually did

### Files inspected

### Files changed

### Commands executed

### Evidence/results

### Problems encountered

### How they were resolved

### Why the change was necessary

### Verification

### Next step
```

**Important:** The log must describe what actually happened.

Never turn planned work into fake completed work.

---

# 20. CHANGE DOCUMENTATION RULE

Whenever code changes are made:

1. Identify which MD documentation is affected.
2. Update the relevant MD file.
3. Record the actual implementation.
4. Record important architectural decisions.
5. Record meaningful tests.
6. Record deployment state if applicable.
7. Record limitations/issues if any.

Do not document meaningless line-by-line edits.

Document meaningful architectural and behavioral changes.

---

# 21. CURRENT STATE RULE

`00_CURRENT_STATE.md` must describe the actual repository state after this phase.

It should cover:

- current architecture
- active services
- universal capabilities
- profile source of truth
- document system
- form system
- AI action system
- authentication
- deployment
- known limitations
- phase status

Remove/update stale claims where Phase 8 changes them.

---

# 22. CHANGELOG RULE

`md files/17_CHANGELOG.md` must record the Phase 8 work, including:

- major architecture changes
- reusable infrastructure
- important fixes
- verification
- deployment
- commit SHA

Preserve historical entries.

---

# 23. PHASE 8 DOCUMENT RULE

`emergency phase/PHASE_8_UNIVERSAL_SERVICE_ECOSYSTEM.md` must become the authoritative reference for:

- objective
- architecture
- requirements
- implementation status
- decisions
- files changed
- verification
- limitations
- how future services are added

Update it continuously as implementation progresses.

---

# 24. FUTURE SERVICE TEMPLATE

Document a standard process:

```text
1. Define service metadata
2. Declare required profile fields
3. Declare required documents
4. Define form schema
5. Define validation
6. Define capabilities
7. Implement service adapter
8. Register adapter
9. Add tests
10. Verify using Universal Engine
11. Deploy
```

If a developer needs to rebuild profile, document, form, or AI infrastructure, STOP and determine why the universal architecture is insufficient.

---

# 25. TESTING

Run appropriate repository quality gates, including where supported:

```bash
pnpm typecheck
pnpm test
pnpm build
```

Also verify:

- profile → AI consistency
- profile → form consistency
- AI → form filling
- missing-field detection
- form validation
- confirmation
- document retrieval
- document upload
- ownership isolation
- cross-user protection
- action authorization
- audit logging
- mock second service
- JEE regression

Do not claim PASS without evidence.

---

# 26. DEPLOYMENT

After implementation:

1. Check Git status.
2. Review Git diff.
3. Ensure secrets are not staged.
4. Commit meaningful changes.
5. Push to the correct branch.
6. Allow the connected Vercel pipeline to deploy.
7. Verify deployment.
8. Test relevant production endpoints.
9. Record the actual deployment result and commit SHA in Markdown.

Do not invent deployment results.

---

# 27. AUTONOMOUS ERROR RECOVERY

When a build/test/deployment problem occurs:

1. Read the real error.
2. Identify root cause.
3. Fix root cause.
4. Re-run failed verification.
5. Update documentation.
6. Continue.

Do not merely report routine engineering errors to the user.

---

# 28. DO NOT OVERENGINEER

Reuse existing:

- framework
- database
- validation
- authentication
- storage
- testing
- deployment
- AI infrastructure

Do not introduce technology without a demonstrated need.

Prefer the smallest architecture that satisfies these requirements.

---

# 29. NO DUPLICATION TEST

Before completing Phase 8, answer in the documentation:

> If Ayushman Bharat is added tomorrow, what infrastructure can be reused without modifying the core platform?

The expected reusable areas are:

- authentication
- profile resolver
- AI context
- action registry
- document engine
- upload engine
- form engine
- validation
- confirmation
- audit
- application state
- reusable UI form components

Only service-specific requirements and adapter logic should normally be new.

---

# 30. FINAL ACCEPTANCE CHECKLIST

Phase 8 is complete only when applicable items are verified:

- [ ] Repository architecture audited
- [ ] Universal service contract exists
- [ ] Service adapter architecture exists
- [ ] Service registry exists
- [ ] Universal AI action registry exists
- [ ] Canonical profile resolver exists
- [ ] Document retrieval is reusable
- [ ] Document upload is reusable
- [ ] Universal form schema exists
- [ ] AI can fill forms
- [ ] AI asks only for missing information
- [ ] Chat and form share state
- [ ] Cross-check/confirmation exists
- [ ] Server-side authorization protects actions
- [ ] Audit logging exists
- [ ] Mock second service uses the framework
- [ ] Existing JEE functionality remains intact
- [ ] Required Markdown documentation updated
- [ ] Execution log updated
- [ ] Current state updated
- [ ] Changelog updated
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Build passes
- [ ] Git status reviewed
- [ ] Commit created
- [ ] Git push successful
- [ ] Vercel deployment verified
- [ ] Production verification completed
- [ ] No P0/P1 unresolved issues
- [ ] Ayushman Bharat NOT started

---

# 31. FINAL STOP CONDITION

When all acceptance criteria are satisfied:

1. Update every required Markdown file.
2. Record the final commit SHA.
3. Record deployment status.
4. Record production verification.
5. Mark Phase 8 COMPLETE.
6. STOP.

Do NOT automatically start Ayushman Bharat.

Do NOT start another development phase.

The next phase will be started separately by the user.

---

# FINAL PRINCIPLE

The goal is not merely to make Sanchay work.

The goal is to make Sanchay **easy to extend correctly**.

A future developer should be able to add a new government service primarily by supplying:

- service-specific requirements
- profile requirements
- documents
- form schema
- validation
- capabilities
- adapter logic

while reusing the existing Sanchay ecosystem.

**If the same problem has to be solved twice, turn it into reusable infrastructure before continuing.**
