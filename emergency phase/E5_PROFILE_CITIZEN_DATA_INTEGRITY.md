# EMERGENCY PHASE E5 --- PROFILE & CITIZEN DATA INTEGRITY

## STATUS

Main roadmap: FROZEN at Phase 7

Previous emergency phases: - E1 --- Architecture & Dependency Audit ✅ -
E2 --- Permanent API Packaging & Vercel Fix ✅ - E3 --- Authentication &
Session Stability ✅ - E4 --- Database & API Data Stability ✅

Current phase: E5

Phase type: Profile / Citizen Data / Ownership / Read-only Application
Integrity

------------------------------------------------------------------------

# 0. HOW TO RUN

The user should only need to tell Antigravity:

DO E5

When the user says `DO E5`:

1.  Read this entire file.
2.  Read the existing E1--E4 emergency documentation.
3.  Read and continue using the SAME `EMERGENCY_EXECUTION_LOG.md`.
4.  Execute E5 exactly as specified.
5.  Update the SAME execution log after EVERY major step.
6.  Make only confirmed, minimal fixes.
7.  Run all required verification.
8.  Push through the existing Git → Vercel pipeline.
9.  Verify production.
10. STOP.

DO NOT START E6.

------------------------------------------------------------------------

# 1. OBJECTIVE

E5 exists to make the Sanchay citizen profile the single trusted source
of user-provided identity/application information.

The core rule is:

``` text
USER PROFILE
     ↓
SOURCE OF TRUTH
     ↓
APPLICATION
```

The application form must NOT maintain a second editable copy of
profile-owned information.

For profile-owned fields:

``` text
Profile owns the data.
Application reads the data.
User changes the data in Profile.
Application reflects the updated Profile data.
```

The application must NOT silently modify profile data.

The AI must NOT directly modify profile data.

The AI may:

-   explain profile information;
-   identify possible mistakes;
-   tell the user which profile field appears incorrect;
-   provide an action to open Profile;
-   explain how changing Profile will affect the application.

The AI must NOT autonomously change the profile.

------------------------------------------------------------------------

# 2. KNOWN PRODUCT REQUIREMENT

This requirement is especially important for JEE.

The JEE application should consume profile information such as:

-   name;
-   date of birth;
-   gender;
-   category;
-   category certificate status where applicable;
-   contact details;
-   other profile-owned identity information.

The application should display these values as:

``` text
Value
✓ From Sanchay Profile
```

or the project's existing equivalent.

The user must NOT edit these values inside the application form.

If something is wrong:

``` text
User:
"My category is wrong."

AI:
"Your Sanchay Profile currently says OBC-NCL.
You can correct it in My Profile.
I cannot change your profile from the application."
```

The application then reads the corrected profile value.

------------------------------------------------------------------------

# 3. ABSOLUTE RULES

DO NOT:

-   redesign the entire Profile UI;
-   redesign the JEE application;
-   add new application features;
-   modify AI reasoning architecture;
-   modify authentication architecture;
-   modify database architecture;
-   reopen E1;
-   reopen E2;
-   reopen E3;
-   reopen E4;
-   allow AI to mutate profile data;
-   allow application forms to mutate profile-owned fields;
-   duplicate profile data into a second source of truth;
-   weaken authorization;
-   expose private user information;
-   use browser automation;
-   manually deploy with `vercel deploy`.

Only fix confirmed profile/data-integrity problems.

------------------------------------------------------------------------

# 4. MANDATORY EXECUTION LOG

Continue using exactly:

``` text
emergency phase/EMERGENCY_EXECUTION_LOG.md
```

Do NOT create:

``` text
E5_EXECUTION_LOG.md
E5_LOG.md
execution-log-e5.md
```

The SAME execution log must be updated.

After every major step add:

``` text
Phase:
Step:
Status:
What I was instructed to do:
What I actually did:
Files inspected:
Files changed:
Commands executed:
Evidence/results:
Problems encountered:
How they were resolved:
Why the change was necessary:
Verification:
Next step:
```

The log must describe actual actions.

Do not claim verification that was not performed.

If something is skipped:

``` text
SKIPPED — reason: ...
```

------------------------------------------------------------------------

# 5. READ PREVIOUS PHASES

Before making changes inspect:

``` text
EMERGENCY_E1_ARCHITECTURE_AUDIT.md
E2 documentation
E3_AUTHENTICATION_SESSION_STABILITY.md
E4_DATABASE_API_DATA_STABILITY.md
EMERGENCY_EXECUTION_LOG.md
00_CURRENT_STATE.md
md files/17_CHANGELOG.md
```

Record this in the execution log.

------------------------------------------------------------------------

# 6. PROFILE ARCHITECTURE AUDIT

Find the actual Profile implementation.

Inspect:

``` text
apps/api/src/me/
apps/web/
prisma/schema.prisma
```

Find:

-   profile controller;
-   profile service;
-   profile DTOs;
-   profile validation;
-   profile database model;
-   profile API client;
-   profile UI;
-   current-user/session integration.

Determine exactly:

``` text
Who owns each profile field?
Where is it stored?
Who can change it?
How is it returned?
How does frontend consume it?
```

Do not assume field names.

Update the execution log.

------------------------------------------------------------------------

# 7. FIELD OWNERSHIP MATRIX

Create an actual matrix based on the current code.

At minimum investigate:

  --------------------------------------------------------------------------
  Field          Source of      Editable Where Application    AI Editable?
                 Truth                         Editable?      
  -------------- -------------- -------------- -------------- --------------
  Name           Profile        Profile        NO             NO

  DOB            Profile        Profile        NO             NO

  Gender         Profile        Profile        NO             NO

  Category       Profile        Profile        NO             NO

  Contact        Profile        Profile        NO             NO

  Academic data  Verify actual  Actual owner   Actual         NO unless
                 architecture                  behavior       explicitly
                                                              authorized

  Address        Verify actual  Actual owner   Actual         NO
                 architecture                  behavior       
  --------------------------------------------------------------------------

Do NOT blindly apply this table if the current architecture
intentionally differs.

The audit must reflect the actual code.

Update the execution log.

------------------------------------------------------------------------

# 8. PROFILE API AUDIT

Inspect profile endpoints.

Identify actual routes such as:

``` text
GET /api/v1/me/profile
PATCH /api/v1/me/profile
PUT /api/v1/me/profile
```

Use actual routes.

Verify:

### READ

Authenticated user can read their own profile.

### UPDATE

Authenticated user can update permitted profile fields.

### OWNERSHIP

User A cannot update User B's profile.

### RESPONSE

Profile responses do not expose secrets or internal security data.

### VALIDATION

Invalid profile values are rejected.

Update the execution log.

------------------------------------------------------------------------

# 9. PROFILE FIELD VALIDATION

Audit important fields.

Check:

-   category enum;
-   gender enum;
-   date of birth;
-   phone;
-   email;
-   names;
-   state/district if present;
-   certificate-related values if present.

Verify that API validation and database constraints agree.

Pay special attention to category values because the JEE application
requires category information.

Examples may include:

``` text
GENERAL
OBC-NCL
SC
ST
EWS
```

BUT use the project's actual enum/representation.

Do not invent values.

Update the execution log.

------------------------------------------------------------------------

# 10. PROFILE → APPLICATION DATA FLOW

This is one of the most important E5 checks.

Trace the actual flow:

``` text
Database Profile
↓
API
↓
Frontend profile state
↓
Application page
↓
Application form
```

Determine whether the application:

### A. Reads live profile data

GOOD.

### B. Copies profile data into local application state only for display

Potentially acceptable if it is read-only and refreshed correctly.

### C. Creates a second editable profile source

BAD.

### D. Stores a stale snapshot that can silently override profile data

BAD unless explicitly required for historical application records.

Document the actual behavior.

Update the execution log.

------------------------------------------------------------------------

# 11. APPLICATION EDITABILITY AUDIT

Inspect the JEE application page and related components.

Find profile-owned fields such as:

``` text
category
gender
name
date of birth
contact information
```

Verify these fields cannot be edited from the application.

Expected behavior:

``` text
PROFILE VALUE
✓ From Sanchay Profile
Read-only
```

If the application currently allows editing profile-owned information:

FIX IT.

Do not merely disable the HTML input visually.

The API must also reject unauthorized profile mutation through
application routes.

Update the execution log.

------------------------------------------------------------------------

# 12. CATEGORY REQUIREMENT

JEE application category is mandatory where required by the official
application flow.

Verify:

``` text
Profile.category
↓
JEE application category
```

If the category is missing:

The application should clearly show that the user needs to
complete/update their Profile.

It must NOT invent a category.

It must NOT silently default to:

``` text
GENERAL
```

It must NOT let AI guess the category.

If category is invalid:

``` text
Block application progression
+
Explain that Profile must be corrected
```

Update the execution log.

------------------------------------------------------------------------

# 13. PROFILE CHANGE PROPAGATION

Verify:

``` text
Profile:
Category = OBC-NCL

Application:
Category = OBC-NCL
```

Then update the profile in a safe local/test environment:

``` text
Category = EWS
```

Verify the application subsequently reflects:

``` text
EWS
```

without manually editing the application.

If the application intentionally stores a historical snapshot after
official submission, document that distinction.

Before submission:

``` text
Application reads current Profile.
```

After official submission:

``` text
Historical submitted application data may be immutable.
```

Do not change this behavior without evidence.

Update the execution log.

------------------------------------------------------------------------

# 14. AI PROFILE BEHAVIOR

Inspect:

``` text
AI services
AI controllers
AI adapters
AI workspace
profile tools/actions
```

Verify AI can:

``` text
"What category do I have?"
→ Read authorized profile information
```

AI can:

``` text
"My category is wrong."
→ Explain current value
→ Tell user to open Profile
→ Provide Profile action
```

AI must NOT:

``` text
"My category is wrong."
→ silently change category
```

AI must NOT execute arbitrary profile mutations.

The server must enforce this even if the client sends a malicious
request.

Update the execution log.

------------------------------------------------------------------------

# 15. AI LEAST PRIVILEGE

Verify AI only receives profile information necessary for the requested
task.

For example:

``` text
"What category do I have?"
```

should not require sending:

-   unrelated private fields;
-   passwords;
-   security data;
-   unrelated profile information.

If the project has a profile projection/DTO, verify it does not
unnecessarily expose sensitive fields.

Do not expose secrets.

Update the execution log.

------------------------------------------------------------------------

# 16. APPLICATION API OWNERSHIP

Inspect application endpoints.

Find operations involving:

``` text
applicationId
userId
profileId
```

Verify ownership is derived from authenticated user context.

A malicious request such as:

``` text
applicationId = another user's application
```

must not expose or modify another user's application.

Test safely.

Update the execution log.

------------------------------------------------------------------------

# 17. NO PROFILE MUTATION FROM APPLICATION

Search for application code that performs operations such as:

``` text
profile.update
user.update
me.update
category.update
gender.update
```

from application submission/update routes.

If profile-owned data is being mutated by application logic:

Determine whether it is:

``` text
intentional
or
an architecture violation
```

Only fix confirmed violations.

Update the execution log.

------------------------------------------------------------------------

# 18. DATABASE CONSISTENCY

Verify profile fields have a single authoritative storage location.

Search for duplicate fields across models.

Pay special attention to:

``` text
category
gender
dateOfBirth
name
phone
email
```

If the same field exists in:

``` text
Profile
Application
User
ApplicationField
```

determine why.

A historical application snapshot may be legitimate.

A second editable source of truth is not.

Do not automatically remove duplicate fields.

Document their purpose.

Update the execution log.

------------------------------------------------------------------------

# 19. TESTS

Add/update tests only where required.

At minimum verify:

``` text
Profile read
Profile update
Profile ownership
Invalid profile data
Application reads profile category
Application profile-owned fields are read-only
Missing category is handled
AI can read authorized category
AI cannot mutate profile
Cross-user application access denied
```

Run:

``` bash
pnpm typecheck
pnpm test
pnpm build
```

All must pass.

Do not delete tests.

Update the execution log.

------------------------------------------------------------------------

# 20. FIX ONLY CONFIRMED ISSUES

After the audit create:

``` text
Confirmed issue:
Evidence:
Impact:
Minimal fix:
Files:
Verification:
```

Fix ONLY confirmed issues.

Do not refactor unrelated code.

After every fix update:

``` text
emergency phase/EMERGENCY_EXECUTION_LOG.md
```

------------------------------------------------------------------------

# 21. PRODUCTION VERIFICATION

After local verification:

``` text
git status
git diff --stat
```

Verify no secrets/private data are staged.

Commit:

``` text
fix(profile): enforce profile as application data source of truth
```

Push:

``` text
git push origin main
```

Do NOT manually run:

``` text
vercel deploy
```

Use Git → Vercel automatic deployment.

------------------------------------------------------------------------

# 22. LIVE PRODUCTION TESTS

After Vercel reaches READY, test using CLI/API tools.

Do not use browser automation.

Verify:

``` text
GET /api/v1/health
```

Then:

``` text
GET profile
```

with an authenticated test context.

Then verify a safe application read.

Verify:

``` text
Profile category
=
Application category
```

Do NOT expose private user information.

If production mutation is unsafe:

``` text
SKIPPED — production mutation would modify persistent citizen data; verified using isolated/test environment.
```

Update the execution log.

------------------------------------------------------------------------

# 23. EXECUTION LOG FINALIZATION

The SAME:

``` text
emergency phase/EMERGENCY_EXECUTION_LOG.md
```

must contain the complete E5 history.

Add a final entry containing:

``` text
Phase: E5
Step: Final Production Verification
Status: COMPLETED / BLOCKED
Production deployment:
...
Profile read:
...
Profile ownership:
...
Application/profile consistency:
...
Category propagation:
...
AI profile access:
...
AI mutation protection:
...
Cross-user isolation:
...
Typecheck:
...
Tests:
...
Build:
...
Git commit:
...
Git push:
...
Vercel:
...
Production verification:
...
Next step:
STOP — do not start E6
```

------------------------------------------------------------------------

# 24. DEFINITION OF DONE

E5 is COMPLETE only when:

\[ \] E1--E4 reviewed \[ \] Same execution log reused \[ \] Profile
architecture audited \[ \] Field ownership matrix created \[ \] Profile
API audited \[ \] Profile validation audited \[ \] Profile ownership
verified \[ \] Application/profile data flow traced \[ \] Application
profile-owned fields are read-only \[ \] Application cannot mutate
profile-owned fields \[ \] Category flow verified \[ \] Missing category
handled safely \[ \] Profile changes propagate correctly \[ \] AI
profile access verified \[ \] AI profile mutation blocked \[ \] AI
least-privilege behavior verified \[ \] Application ownership verified
\[ \] Duplicate profile fields audited \[ \] Confirmed issues fixed only
\[ \] Tests pass \[ \] Typecheck passes \[ \] Build passes \[ \] Git
diff reviewed \[ \] Commit created \[ \] Git push succeeds \[ \] Vercel
deployment READY \[ \] Production profile read verified \[ \] Production
application read verified \[ \] Production profile/application
consistency verified \[ \] Execution log finalized \[ \] Documentation
updated

------------------------------------------------------------------------

# 25. CRITICAL STOP RULE

If you discover a problem belonging to:

-   API packaging → E2
-   Authentication → E3
-   Database infrastructure → E4
-   AI architecture → later dedicated phase
-   JEE application workflow → E6

DO NOT silently expand E5.

Record:

``` text
OUT OF SCOPE — belongs to E<phase>
```

If the issue blocks E5:

``` text
E5 BLOCKED
```

STOP.

Do not start E6.

------------------------------------------------------------------------

# 26. FINAL RESPONSE

After completing E5, respond ONLY with:

E5 COMPLETE

Profile source of truth: `<one sentence>`{=html}

Profile ownership: PASS / FAIL

Application read-only profile fields: PASS / FAIL

Category flow: PASS / FAIL

Profile → application consistency: PASS / FAIL

AI profile read: PASS / FAIL

AI profile mutation protection: PASS / FAIL

Least privilege: PASS / FAIL

Cross-user isolation: PASS / FAIL

Validation: PASS / FAIL

Typecheck: PASS / FAIL

Tests: PASS / FAIL

Build: PASS / FAIL

Git commit: `<SHA>`{=html}

Git push: SUCCESS / FAILED

Vercel: READY / FAILED

Production verification: PASS / FAIL

Execution log: UPDATED

E5 status: COMPLETE / BLOCKED

DO NOT START E6.

STOP AFTER E5.
