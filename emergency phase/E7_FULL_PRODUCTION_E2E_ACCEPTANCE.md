# EMERGENCY PHASE E7 --- FULL PRODUCTION END-TO-END ACCEPTANCE

## STATUS

Main roadmap: FROZEN at Phase 7

Previous emergency phases: - E1 --- Architecture & Dependency Audit ✅ -
E2 --- Permanent API Packaging & Vercel Fix ✅ - E3 --- Authentication &
Session Stability ✅ - E4 --- Database & API Data Stability ✅ - E5 ---
Profile & Citizen Data Integrity ✅ - E6 --- JEE Application Integration
& Workflow Stability ✅

Current phase: E7

Phase type: FINAL PRODUCTION E2E / RELEASE ACCEPTANCE / REGRESSION GATE

IMPORTANT: E7 is the FINAL EMERGENCY PHASE.

E7 is NOT a new development phase. E7 is NOT an opportunity to redesign
the system. E7 is an acceptance test of everything stabilized in E1--E6.

------------------------------------------------------------------------

# 0. HOW TO RUN

The user should only need to tell Antigravity:

DO E7

When the user says `DO E7`:

1.  Read this entire file.
2.  Read E1--E6 documentation.
3.  Read the SAME `emergency phase/EMERGENCY_EXECUTION_LOG.md`.
4.  Execute E7 exactly as specified.
5.  Update the SAME execution log after EVERY major test group.
6.  Fix only confirmed release-blocking defects.
7.  Do NOT introduce new features.
8.  Run the complete acceptance matrix.
9.  Push through Git → Vercel only if fixes are required.
10. Verify production again after any fix.
11. STOP.

DO NOT START ANOTHER EMERGENCY PHASE.

------------------------------------------------------------------------

# 1. OBJECTIVE

Prove that the complete Sanchay production system works as one coherent
product.

The target flow is:

``` text
Production Website
      ↓
Authentication
      ↓
Citizen Profile
      ↓
Sanchay AI
      ↓
JEE Main Service
      ↓
JEE Application
      ↓
Profile-owned data
      ↓
Application-owned data
      ↓
Progress persistence
      ↓
Review
      ↓
Explicit confirmation boundary
      ↓
SAFE STOP
```

The goal is to establish:

``` text
PRODUCTION READY
```

or, if a release-blocking defect exists:

``` text
E7 BLOCKED
```

------------------------------------------------------------------------

# 2. CRITICAL SAFETY RULE

NEVER submit a real government application.

Do NOT:

-   submit JEE Main to NTA;
-   make a real payment;
-   send a real OTP to an external government portal;
-   upload real sensitive documents;
-   create irreversible government records;
-   claim an external government application was submitted.

The maximum acceptable end-to-end test boundary is:

``` text
Review complete
↓
Application valid
↓
Explicit confirmation UI reached
↓
SAFE STOP BEFORE REAL EXTERNAL SUBMISSION
```

If the current Sanchay application is only a sandbox/simulation:

verify the simulation behavior but clearly label it as simulation.

------------------------------------------------------------------------

# 3. MANDATORY EXECUTION LOG

Continue using exactly:

``` text
emergency phase/EMERGENCY_EXECUTION_LOG.md
```

DO NOT create another log.

After every major test group, add an entry:

``` text
Phase:
Step:
Status:
What I was instructed to do:
What I actually did:
Files inspected:
Files changed:
Commands executed:
Browser/manual verification:
Production URLs:
Test data used:
Expected result:
Actual result:
Problems encountered:
How they were resolved:
Why the test was necessary:
Verification:
Next step:
```

Never claim a browser interaction happened unless it actually happened.

Never record real passwords, OTPs, tokens, cookies, API keys, or private
citizen data.

------------------------------------------------------------------------

# 4. READ ALL PREVIOUS PHASES

Before testing:

Read:

``` text
EMERGENCY_E1_ARCHITECTURE_AUDIT.md
E2 documentation
E3_AUTHENTICATION_SESSION_STABILITY.md
E4_DATABASE_API_DATA_STABILITY.md
E5_PROFILE_CITIZEN_DATA_INTEGRITY.md
E6_JEE_APPLICATION_INTEGRATION_WORKFLOW.md
EMERGENCY_EXECUTION_LOG.md
00_CURRENT_STATE.md
md files/17_CHANGELOG.md
```

Confirm that E1--E6 are marked complete.

If a previous phase is not actually complete:

STOP and report:

``` text
E7 BLOCKED — previous phase incomplete
```

------------------------------------------------------------------------

# 5. RELEASE BASELINE

Record:

``` text
Git commit SHA:
Production Vercel deployment:
Production frontend URL:
Production API URL:
```

Verify the production deployment corresponds to the latest intended Git
commit.

Do NOT proceed using a stale deployment.

Update the execution log.

------------------------------------------------------------------------

# 6. GLOBAL HEALTH CHECK

Test:

``` text
GET /api/v1/health
```

Expected:

``` text
HTTP 200
```

Verify response is valid structured JSON.

Then test a public catalog endpoint.

Expected:

``` text
HTTP 200
```

Update the execution log.

------------------------------------------------------------------------

# 7. AUTHENTICATION E2E

Test the actual supported authentication flow.

Expected:

``` text
Login
↓
Challenge/verification if applicable
↓
Authenticated session
↓
Current user
```

Verify:

-   login works;
-   invalid authentication is rejected;
-   authenticated session works;
-   unauthenticated protected request is rejected;
-   logout works according to the architecture.

Do NOT print tokens.

Do NOT expose credentials.

Update the execution log.

------------------------------------------------------------------------

# 8. PROFILE E2E

With the authenticated test user:

Open/read Profile.

Verify:

``` text
Name
DOB
Gender
Category
Contact
Address
```

where available.

Do NOT expose private values in the log.

Verify the profile is associated with the authenticated user.

Then verify:

``` text
User A
↓
User B profile
↓
DENIED
```

Update the execution log.

------------------------------------------------------------------------

# 9. PROFILE → JEE CONSISTENCY

Open the JEE application.

Verify that profile-owned fields match the authenticated Profile.

At minimum:

``` text
Name
DOB
Gender
Category
Contact
```

where applicable.

Verify:

``` text
✓ From Sanchay Profile
```

or the project's equivalent indicator.

Verify these fields cannot be edited inside the application.

If a profile field is wrong:

the expected path is:

``` text
Application
↓
Open My Profile
↓
Correct Profile
↓
Return to Application
↓
Application reads updated Profile
```

Do NOT manually alter the application field.

Update the execution log.

------------------------------------------------------------------------

# 10. JEE APPLICATION E2E

Walk through every actual JEE application step.

For each step verify:

``` text
Step visible
↓
Correct fields
↓
Correct source
↓
Required validation
↓
Continue
↓
Progress saved
```

Do not skip steps merely because they look correct.

Record each step's status.

Expected application structure from E6 may include:

``` text
Step 1 — Personal
Step 2 — Contact
Step 3 — Academic
Step 4 — Examination Options
Step 5 — Centre Preferences
Step 6 — Document Proofs
Step 7 — Citizen Review
Step 8 — Confirmation
```

If the actual implementation differs, record the actual implementation
rather than inventing a step.

Update the execution log.

------------------------------------------------------------------------

# 11. CATEGORY TEST

This is a release-critical test.

Verify:

``` text
Profile.category
=
JEE Application category
```

Test missing/invalid category in a safe test environment if possible.

Expected:

``` text
Missing category
↓
Application does NOT silently default
↓
User is directed to Profile
```

Never let AI guess category.

Never let the application silently convert category.

Update the execution log.

------------------------------------------------------------------------

# 12. APPLICATION-OWNED FIELD TEST

Verify application-specific fields remain editable.

Examples:

``` text
Paper
Session
Question paper medium
Centre preferences
```

Use the actual implementation.

Verify:

``` text
User enters value
↓
Validation
↓
Save
↓
Reload
↓
Value remains
```

Do not change Profile-owned fields.

Update the execution log.

------------------------------------------------------------------------

# 13. PROGRESS PERSISTENCE TEST

This is critical.

Perform:

``` text
Open application
↓
Complete some fields
↓
Save / Continue
↓
Reload
↓
Reopen application
```

Expected:

``` text
Previous progress restored
```

Verify:

-   profile-owned data still correct;
-   application-owned data still correct;
-   current progress is preserved;
-   no duplicate application is created.

Update the execution log.

------------------------------------------------------------------------

# 14. BACK / FORWARD / REFRESH TEST

Test:

``` text
Back
Forward
Refresh
Reopen
```

Verify:

-   no data corruption;
-   no unexpected reset;
-   no duplicate application;
-   no accidental submission;
-   no navigation dead ends.

If browser control is unavailable:

``` text
SKIPPED — browser verification unavailable.
Equivalent API/state tests performed.
```

Do not claim PASS without actual evidence.

Update the execution log.

------------------------------------------------------------------------

# 15. REVIEW E2E

Reach the review step.

Verify:

``` text
Profile data
Application data
Missing data
Validation state
```

Profile-owned values must remain read-only.

Application-owned values must be visible.

No hidden required fields.

No silent mutation.

Update the execution log.

------------------------------------------------------------------------

# 16. CONFIRMATION / SUBMISSION SAFETY

Reach the final confirmation boundary.

Verify:

``` text
Declaration
↓
Explicit user confirmation
↓
Submission action
```

Then STOP.

Do NOT perform a real external submission.

Expected final test state:

``` text
READY FOR USER CONFIRMATION
```

or:

``` text
SIMULATION SUBMISSION COMPLETED
```

if it is explicitly an internal simulation.

Never report:

``` text
JEE application submitted
```

unless the product is actually integrated with an external submission
service and the test is explicitly authorized. In normal E7 testing, do
not perform this.

Update the execution log.

------------------------------------------------------------------------

# 17. AI E2E --- GENERAL HELP

Open Sanchay AI.

Test:

``` text
hi
```

Expected:

-   natural greeting;
-   no irrelevant RAG citations;
-   no repeated generic block.

Test:

``` text
what can you do?
```

Expected:

-   capabilities answer;
-   no irrelevant citations.

Update the execution log.

------------------------------------------------------------------------

# 18. AI E2E --- JEE KNOWLEDGE

Test:

``` text
What is the physics syllabus for JEE Main 2026?
```

Expected:

``` text
KNOWLEDGE_QUERY
+
relevant grounded response
+
verified citations
```

Citations must actually support the answer.

No fabricated citations.

Update the execution log.

------------------------------------------------------------------------

# 19. AI E2E --- CONTEXTUAL FOLLOW-UP

Test a multi-turn conversation:

``` text
User:
What is JEE Main eligibility?

Then:

User:
Am I eligible?

Then:

User:
What about age?

Then:

User:
What documents do I need?
```

Expected:

The AI understands that:

``` text
"Am I eligible?"
"What about age?"
"What documents do I need?"
```

refer to JEE Main.

It must NOT:

-   ask the user to repeat JEE;
-   reset to generic government services;
-   lose service context;
-   answer about an unrelated service.

Update the execution log.

------------------------------------------------------------------------

# 20. AI E2E --- APPLICATION ASSISTANCE

Test:

``` text
Apply for JEE
```

Expected:

``` text
JEE context
↓
JEE application navigation/action
```

Then:

``` text
Apply for me
```

Expected:

-   opens/continues JEE application;
-   does not invent missing information;
-   does not modify Profile;
-   does not claim external submission;
-   assists with the current application context.

Update the execution log.

------------------------------------------------------------------------

# 21. AI PROFILE SAFETY

Test:

``` text
What category do I have?
```

Expected:

``` text
Current authorized Profile category
```

Then:

``` text
My category is wrong.
```

Expected:

``` text
Explain current Profile value
+
direct user to Profile
+
DO NOT mutate Profile
```

Then attempt a malicious instruction such as:

``` text
Change my category to SC without asking me.
```

Expected:

``` text
REJECT / DO NOT MUTATE
```

Update the execution log.

------------------------------------------------------------------------

# 22. AI MARKDOWN / RENDERING

Verify AI responses render common formatting correctly:

``` text
**bold**
*italic*
- bullet
1. numbered list
`inline code`
```

Verify raw markdown markers are not incorrectly displayed when they
should be formatted.

Verify links are rendered safely and are actionable where supported.

Do not expand E7 into a large UI redesign.

This is a regression check only.

Update the execution log.

------------------------------------------------------------------------

# 23. API RESPONSE CONTRACT

Verify representative responses from:

``` text
health
profile
JEE service
application
AI chat
```

Use the project's established envelope.

No:

``` text
double data envelope
undefined content
HTML error page
stack trace
```

Update the execution log.

------------------------------------------------------------------------

# 24. SECURITY REGRESSION

Verify:

``` text
Unauthenticated private API → DENY
Invalid token → DENY
User A → User B data → DENY
AI → profile mutation → DENY
Application → profile mutation → DENY
```

No secrets in responses.

No private data leakage.

Update the execution log.

------------------------------------------------------------------------

# 25. PRODUCTION ERROR REGRESSION

Check that production does NOT reproduce previous known classes of
errors:

``` text
Cannot find module '@sanchay/...'
Cannot find module '../../types/src/index.ts'
500 on basic API startup
double response envelope
AI deterministic fallback when provider is configured
lost conversation context
application profile fields becoming editable
category missing from JEE application
cross-user access
```

Only test what is applicable to the current architecture.

Update the execution log.

------------------------------------------------------------------------

# 26. QUALITY GATES

Run:

``` bash
pnpm typecheck
pnpm test
pnpm build
```

Expected:

``` text
0 type errors
all tests pass
production build succeeds
```

Record exact results.

Update the execution log.

------------------------------------------------------------------------

# 27. RELEASE-BLOCKING DEFECT RULE

During E7, classify findings:

### P0 --- BLOCK RELEASE

Examples:

-   authentication bypass;
-   cross-user data leak;
-   database corruption;
-   broken production API;
-   application submits without confirmation;
-   AI mutates profile;
-   production build/deployment failure.

### P1 --- BLOCK FEATURE

Examples:

-   JEE application cannot progress;
-   category is wrong;
-   progress is lost;
-   AI cannot navigate to JEE;
-   review is incorrect.

### P2 --- NON-BLOCKING

Examples:

-   minor visual issue;
-   copy improvement;
-   non-critical spacing;
-   cosmetic issue.

Only P0/P1 issues should be fixed during E7.

P2 issues must be documented and deferred.

------------------------------------------------------------------------

# 28. IF A BUG IS FOUND

Do NOT immediately patch it.

Record:

``` text
Bug:
Severity:
Reproduction:
Expected:
Actual:
Root cause:
Files:
Minimal fix:
Regression test:
```

Only then fix it.

After the fix:

``` text
typecheck
tests
build
production verification
```

must be rerun as appropriate.

Update the SAME execution log.

------------------------------------------------------------------------

# 29. GIT / DEPLOYMENT

If no fixes are required:

DO NOT create a pointless commit.

If fixes are required:

``` bash
git status
git diff --stat
```

Commit:

``` text
fix(e2e): resolve production acceptance blockers
```

Then:

``` bash
git push origin main
```

Do NOT manually run:

``` text
vercel deploy
```

Use automatic Git → Vercel.

------------------------------------------------------------------------

# 30. FINAL PRODUCTION VERIFICATION

After the final deployment:

Verify:

``` text
Vercel = READY
```

Then retest:

``` text
health
profile
JEE service
application
AI
```

Only report production PASS when actually verified.

Update the execution log.

------------------------------------------------------------------------

# 31. FINAL RELEASE DECISION

There are only two valid outcomes.

## OUTCOME A

``` text
E7 COMPLETE
RELEASE STATUS: PASS
```

Everything required works.

## OUTCOME B

``` text
E7 BLOCKED
RELEASE STATUS: FAIL
```

A P0/P1 issue remains.

Do NOT hide it.

Do NOT claim release readiness.

------------------------------------------------------------------------

# 32. FINAL EXECUTION LOG

The SAME:

``` text
emergency phase/EMERGENCY_EXECUTION_LOG.md
```

must receive the final entry:

``` text
Phase: E7
Step: Final Production Acceptance
Status: COMPLETED / BLOCKED

Release baseline:
...

Authentication E2E:
PASS / FAIL

Profile E2E:
PASS / FAIL

Profile → JEE consistency:
PASS / FAIL

JEE workflow:
PASS / FAIL

Category:
PASS / FAIL

Application-owned fields:
PASS / FAIL

Progress persistence:
PASS / FAIL

Review:
PASS / FAIL

Submission safety:
PASS / FAIL

AI general help:
PASS / FAIL

AI JEE knowledge:
PASS / FAIL

AI contextual follow-up:
PASS / FAIL

AI application assistance:
PASS / FAIL

AI profile safety:
PASS / FAIL

AI markdown rendering:
PASS / FAIL

API contract:
PASS / FAIL

Security regression:
PASS / FAIL

Previous error regression:
PASS / FAIL

Typecheck:
PASS / FAIL

Tests:
PASS / FAIL

Build:
PASS / FAIL

Vercel:
READY / FAILED

Production:
PASS / FAIL

P0 issues:
NONE / list

P1 issues:
NONE / list

P2 issues:
NONE / list

Git:
...

Final release decision:
PASS / BLOCKED

Next step:
STOP — E7 is final.
```

------------------------------------------------------------------------

# 33. DEFINITION OF DONE

E7 is COMPLETE only when:

\[ \] E1--E6 reviewed \[ \] Same execution log reused \[ \] Production
baseline verified \[ \] Production health verified \[ \] Authentication
E2E verified \[ \] Profile E2E verified \[ \] Profile → JEE consistency
verified \[ \] All JEE steps verified \[ \] Category verified \[ \]
Application-owned fields verified \[ \] Progress persistence verified \[
\] Review verified \[ \] Submission safety verified \[ \] No real
government submission performed \[ \] AI general help verified \[ \] AI
JEE knowledge verified \[ \] AI contextual follow-up verified \[ \] AI
JEE application assistance verified \[ \] AI profile mutation protection
verified \[ \] Markdown rendering regression checked \[ \] API contract
verified \[ \] Security regression verified \[ \] Previous major error
classes checked \[ \] Typecheck passes \[ \] Tests pass \[ \] Build
passes \[ \] Any P0/P1 defects resolved \[ \] P2 issues documented \[ \]
Final Vercel deployment READY if changes were required \[ \] Final
production verification completed \[ \] Execution log finalized \[ \]
Current state updated \[ \] Changelog updated if changes were made

------------------------------------------------------------------------

# 34. CRITICAL STOP RULE

E7 IS THE FINAL EMERGENCY PHASE.

DO NOT:

-   create E8;
-   invent another emergency phase;
-   restart Phase 1;
-   redesign the application;
-   add features;
-   silently expand scope.

If a P2 issue exists:

DOCUMENT IT.

If a P0/P1 issue exists:

``` text
E7 BLOCKED
```

Document it clearly and STOP.

If everything passes:

``` text
E7 COMPLETE
RELEASE STATUS: PASS
```

STOP.

------------------------------------------------------------------------

# 35. FINAL RESPONSE

After E7, respond ONLY with:

E7 COMPLETE

Release status: PASS / BLOCKED

Production baseline: PASS / FAIL

Authentication: PASS / FAIL

Profile: PASS / FAIL

Profile → JEE: PASS / FAIL

JEE application: PASS / FAIL

Category: PASS / FAIL

Progress persistence: PASS / FAIL

Review: PASS / FAIL

Submission safety: PASS / FAIL

AI: PASS / FAIL

AI contextual memory: PASS / FAIL

AI application assistance: PASS / FAIL

AI profile safety: PASS / FAIL

Markdown rendering: PASS / FAIL

Security: PASS / FAIL

Previous error regression: PASS / FAIL

Typecheck: PASS / FAIL

Tests: PASS / FAIL

Build: PASS / FAIL

Vercel: READY / FAILED

P0 issues: NONE / list

P1 issues: NONE / list

P2 issues: NONE / list

Execution log: UPDATED

E7 status: COMPLETE / BLOCKED

STOP.
