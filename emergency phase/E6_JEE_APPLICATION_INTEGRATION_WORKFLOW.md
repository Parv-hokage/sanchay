# EMERGENCY PHASE E6 --- JEE APPLICATION INTEGRATION & WORKFLOW STABILITY

## STATUS

Main roadmap: FROZEN at Phase 7

Previous emergency phases: - E1 --- Architecture & Dependency Audit ✅ -
E2 --- Permanent API Packaging & Vercel Fix ✅ - E3 --- Authentication &
Session Stability ✅ - E4 --- Database & API Data Stability ✅ - E5 ---
Profile & Citizen Data Integrity ✅

Current phase: E6

Phase type: JEE Application / Form Workflow / Profile Integration / AI
Interaction / Submission Readiness

------------------------------------------------------------------------

# 0. HOW TO RUN

The user should only need to tell Antigravity:

DO E6

When the user says `DO E6`:

1.  Read this entire file.
2.  Read E1--E5 emergency documentation.
3.  Read the SAME `emergency phase/EMERGENCY_EXECUTION_LOG.md`.
4.  Execute E6 exactly as specified.
5.  Update the SAME execution log after EVERY major step.
6.  Fix only confirmed issues.
7.  Run all quality gates.
8.  Push through Git → Vercel automatic deployment.
9.  Verify production.
10. STOP.

DO NOT START E7.

------------------------------------------------------------------------

# 1. OBJECTIVE

E6 exists to stabilize the JEE application workflow end-to-end.

The target flow is:

``` text
Sanchay Profile
      ↓
JEE Application
      ↓
Profile-owned information displayed read-only
      ↓
User reviews application
      ↓
User supplies only genuinely application-specific information
      ↓
Validation
      ↓
Save progress
      ↓
Review
      ↓
Explicit user confirmation
      ↓
Submission / next official action
```

The application must be deterministic, accessible, easy for both humans
and AI to understand, and safe.

------------------------------------------------------------------------

# 2. CRITICAL PRODUCT RULES

These rules are NON-NEGOTIABLE.

## PROFILE-OWNED DATA

The following must come from Sanchay Profile where applicable:

-   name
-   date of birth
-   gender
-   category
-   contact information
-   address
-   other identity fields owned by Profile

Application cannot edit them.

If incorrect:

``` text
User → My Profile → correct information
↓
Application reads corrected information
```

AI cannot directly modify them.

------------------------------------------------------------------------

## APPLICATION-OWNED DATA

Application-specific fields may be entered by the user where required.

Examples may include:

-   examination choices
-   paper/session choices
-   exam centre preferences
-   academic details that are explicitly application-owned
-   declaration/consent
-   other fields defined by the actual JEE application requirements

Do not assume a field is application-owned. Inspect the actual
implementation and official requirement source already used by the
project.

------------------------------------------------------------------------

# 3. MANDATORY EXECUTION LOG

Continue using exactly:

``` text
emergency phase/EMERGENCY_EXECUTION_LOG.md
```

Do NOT create another log.

After EVERY major step, append an accurate entry containing:

``` text
Phase:
Step:
Status:
What I was instructed to do:
What I actually did:
Files inspected:
Files changed:
Commands executed:
Browser/manual verification performed:
Evidence/results:
Problems encountered:
How they were resolved:
Why the change was necessary:
Verification:
Next step:
```

If browser verification is unavailable:

``` text
SKIPPED — browser verification unavailable; equivalent API/static verification performed.
```

Never claim a browser interaction was tested if it was not.

------------------------------------------------------------------------

# 4. READ E1--E5 FIRST

Inspect:

``` text
EMERGENCY_E1_ARCHITECTURE_AUDIT.md
E2 documentation
E3_AUTHENTICATION_SESSION_STABILITY.md
E4_DATABASE_API_DATA_STABILITY.md
E5_PROFILE_CITIZEN_DATA_INTEGRITY.md
EMERGENCY_EXECUTION_LOG.md
00_CURRENT_STATE.md
md files/17_CHANGELOG.md
```

Record completion in the execution log.

------------------------------------------------------------------------

# 5. JEE APPLICATION ARCHITECTURE AUDIT

Find all JEE application code.

Likely areas include:

``` text
apps/web/src/app/services/jee-main/
apps/api/src/application/
apps/api/src/services/
apps/web/src/components/
```

Use actual project paths.

Map:

``` text
Application route
↓
Page/components
↓
API client
↓
API controller
↓
Application service
↓
Prisma
```

Identify:

-   application state;
-   step state;
-   field definitions;
-   validation;
-   persistence;
-   progress saving;
-   profile hydration;
-   submission logic;
-   review logic.

Do NOT change anything yet.

Update the execution log.

------------------------------------------------------------------------

# 6. STEP-BY-STEP FORM AUDIT

Determine the actual application steps.

For EVERY step document:

``` text
Step number:
Purpose:
Fields:
Source of each field:
Required fields:
Validation:
API persistence:
Editable by user:
Read-only:
Next action:
Previous action:
```

The UI must make the current step obvious.

The user must always know:

``` text
WHERE AM I?
WHAT DO I NEED TO DO?
WHAT IS ALREADY PROVIDED?
WHAT HAPPENS NEXT?
```

Fix only confirmed usability/functional defects.

Update the execution log.

------------------------------------------------------------------------

# 7. PROFILE FIELD RENDERING

Every profile-owned field shown in the application must clearly indicate
that it is sourced from Profile.

Preferred pattern:

``` text
Category
OBC-NCL
✓ From Sanchay Profile
```

The field must be visibly read-only.

Do NOT rely only on:

``` html
disabled
```

if disabled controls become inaccessible or unreadable.

Use accessible read-only presentation where appropriate.

The user should be able to understand:

``` text
This information comes from my profile.
I cannot edit it here.
```

Provide a clear route/action to Profile if the value is wrong.

------------------------------------------------------------------------

# 8. CATEGORY --- CRITICAL

The JEE application requires category.

Verify the complete flow:

``` text
Profile.category
↓
API
↓
Application state
↓
Category display
↓
Review
↓
Submission payload
```

Verify actual canonical values.

Do NOT invent category values.

Do NOT silently default missing category to GENERAL.

If category is missing:

``` text
Application blocked at the appropriate step
+
Clear message:
"Complete your category in My Profile before continuing."
+
Profile action
```

If category is invalid:

``` text
Block progression
+
Do not submit
+
Do not mutate Profile
```

Update the execution log.

------------------------------------------------------------------------

# 9. GENDER --- CRITICAL

Verify:

``` text
Profile.gender
↓
JEE application
```

Use the actual canonical project enum.

Do not silently transform unknown values.

If a mapping is required, centralize it.

Do not duplicate gender mapping in multiple components.

Update the execution log.

------------------------------------------------------------------------

# 10. NO DUPLICATE EDITABLE STATE

Search application code for local state representing profile-owned
fields:

``` text
category
gender
fullName
dateOfBirth
phone
email
address
```

Determine whether the state is:

``` text
display-only
```

or:

``` text
editable second source of truth
```

If editable duplication exists:

FIX IT.

The application should derive profile-owned values from the profile
source.

Do not maintain:

``` text
profile.category
+
application.category
```

as independently editable values.

Update the execution log.

------------------------------------------------------------------------

# 11. APPLICATION-SPECIFIC FIELDS

Identify fields that genuinely belong to the JEE application.

For each:

``` text
Field:
Source:
Required:
Validation:
Persisted:
Editable:
Used in submission:
```

Do not make everything read-only.

The user must still be able to complete information that genuinely
belongs to the application.

Update the execution log.

------------------------------------------------------------------------

# 12. FORM VALIDATION

Validation must exist at the API boundary.

Frontend validation is not enough.

Test:

``` text
missing required field
invalid enum
invalid date
invalid ID
unexpected value
empty string
malformed request
```

The API must reject invalid application data.

Do not allow frontend-only validation to determine security/integrity.

Update the execution log.

------------------------------------------------------------------------

# 13. PROGRESS SAVING

Audit whether application progress is persisted.

The intended model is:

``` text
User fills Step 1
↓
Save
↓
Leave/reload
↓
Return
↓
Progress restored
```

Verify:

-   current step;
-   completed fields;
-   application state;
-   profile-derived values;
-   application-owned values.

Do not store secrets in localStorage.

Do not rely exclusively on browser state for persistent application
progress.

If persistence is already implemented correctly, do not rewrite it.

Update the execution log.

------------------------------------------------------------------------

# 14. REFRESH / BACK / REOPEN

Test the application state under:

``` text
refresh
back
forward
reopen application
close/reopen browser where practical
```

The application must not unexpectedly:

-   lose saved progress;
-   reset profile data;
-   duplicate records;
-   create another application;
-   submit automatically.

If browser testing is unavailable, perform equivalent API/state
verification and document the limitation.

Update the execution log.

------------------------------------------------------------------------

# 15. REVIEW STEP

The review page is CRITICAL.

Before submission the user must be able to see:

``` text
Profile information
Application information
Missing information
Validation errors
```

Profile-owned fields must still show:

``` text
✓ From Sanchay Profile
```

Application-owned fields must be clearly distinguishable.

The review step must NOT silently modify data.

Update the execution log.

------------------------------------------------------------------------

# 16. SUBMISSION SAFETY

Submission must be an explicit user action.

NEVER:

``` text
opening application
↓
automatic submit
```

NEVER:

``` text
AI says "apply"
↓
immediate irreversible submission
```

The safe flow is:

``` text
User asks AI to help apply
↓
Application opens
↓
User reviews
↓
Application validates
↓
User explicitly confirms
↓
Submission occurs
```

If the current product intentionally does not submit to an external
government portal, document the current boundary clearly.

Do not fake successful external submission.

Update the execution log.

------------------------------------------------------------------------

# 17. AI → APPLICATION INTEGRATION

Audit what happens when user asks:

``` text
Apply for JEE
Apply for me
Open JEE application
Continue my JEE application
```

The AI must distinguish:

### INFORMATION REQUEST

``` text
"What is JEE eligibility?"
```

→ answer.

### NAVIGATION

``` text
"Open JEE application"
```

→ navigate/action card.

### APPLICATION ASSISTANCE

``` text
"Apply for me"
```

→ open/continue application and assist.

It must NOT respond with a generic government-service list after the
user has clearly specified JEE.

Context must preserve:

``` text
serviceId = jee-main
```

where applicable.

Update the execution log.

------------------------------------------------------------------------

# 18. AI APPLICATION ASSISTANCE

The AI may help the user understand what is currently displayed.

For example:

``` text
User:
"Is everything filled?"

AI:
"Your profile information is populated. You still need to complete X and Y."
```

If a profile value is wrong:

``` text
User:
"My category is wrong."

AI:
"Your Profile currently says OBC-NCL.
I cannot change it here.
Open My Profile to correct it."
```

AI must NOT:

-   invent values;
-   change profile;
-   bypass validation;
-   fabricate submission;
-   claim the application was submitted when it wasn't.

Update the execution log.

------------------------------------------------------------------------

# 19. AI-FRIENDLY HTML / ACCESSIBILITY

This is a major requirement.

The application should be easy for both:

``` text
humans
+
AI/browser automation
```

to understand.

Use semantic elements and stable identifiers.

Important controls should have:

-   meaningful `<label>`;
-   stable `id`;
-   stable `name`;
-   accessible role;
-   clear button text;
-   predictable form structure;
-   visible validation messages;
-   `aria-describedby` where appropriate;
-   no critical action represented only by an icon;
-   no important field identified only by visual position.

Examples:

``` html
<label for="category">Category</label>
<div id="category" aria-readonly="true">
  OBC-NCL
</div>
```

or an equivalent accessible read-only control.

Buttons should say:

``` text
Continue
Back
Save & Continue
Review Application
Submit Application
Open My Profile
```

Do not use ambiguous text like:

``` text
>>
Next
✓
```

for critical actions.

Update the execution log.

------------------------------------------------------------------------

# 20. CATEGORY SELECTOR / INTERACTION

If an actual user-editable application-owned category selector exists,
verify:

-   it is visible;
-   clickable;
-   keyboard accessible;
-   has a label;
-   options are rendered;
-   selection persists;
-   validation works.

BUT if category is Profile-owned:

DO NOT create an application category selector.

It must be read-only and sourced from Profile.

This distinction is critical.

Update the execution log.

------------------------------------------------------------------------

# 21. FORM VISIBILITY / UI

Fix confirmed issues such as:

-   low contrast;
-   text hidden behind backgrounds;
-   inaccessible buttons;
-   clipped controls;
-   broken responsive layout;
-   invisible selected values;
-   unreadable disabled fields;
-   modal/overlay blocking controls;
-   incorrect z-index;
-   buttons not receiving pointer events.

Do NOT redesign the whole application.

Make targeted fixes only.

Update the execution log.

------------------------------------------------------------------------

# 22. API APPLICATION CONTRACT

Inspect application API request/response contracts.

Ensure the frontend does not depend on fragile undocumented structures.

Verify:

``` text
GET application
POST/PATCH application
GET progress
POST/submit
```

or the project's actual equivalents.

Check:

-   response envelopes;
-   validation errors;
-   application IDs;
-   profile data;
-   step/progress data.

Do not introduce double response envelopes.

Update the execution log.

------------------------------------------------------------------------

# 23. APPLICATION OWNERSHIP

Verify:

``` text
User A
↓
Application A
↓
ALLOW

User A
↓
Application B
↓
DENY
```

Do this at API level.

Do not rely on frontend hiding.

Update the execution log.

------------------------------------------------------------------------

# 24. TEST MATRIX

Add/update tests for:

``` text
JEE application creation
JEE application retrieval
Profile hydration
Category propagation
Gender propagation
Missing category
Invalid category
Read-only profile fields
Application-owned field editing
Progress persistence
Application ownership
AI → JEE navigation
AI → JEE application assistance
No false submission
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

# 25. FIX ONLY CONFIRMED ISSUES

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

Do not rewrite working systems.

After every fix update the SAME execution log.

------------------------------------------------------------------------

# 26. PRODUCTION DEPLOYMENT

Before commit:

``` bash
git status
git diff --stat
```

Verify no secrets/private data are staged.

Commit:

``` text
fix(jee): stabilize application workflow and profile integration
```

Push:

``` bash
git push origin main
```

Do NOT manually run:

``` text
vercel deploy
```

Use automatic Git → Vercel deployment.

------------------------------------------------------------------------

# 27. PRODUCTION VERIFICATION

After Vercel reaches READY:

Verify via CLI/API where possible:

``` text
GET /api/v1/health
GET /api/v1/services/jee-main
authenticated profile
authenticated application
```

Then verify the JEE application route manually ONLY if browser access is
available.

If browser verification is not available:

``` text
SKIPPED — browser verification unavailable.
Equivalent API/static verification performed.
```

Do not claim UI behavior was verified without actually verifying it.

------------------------------------------------------------------------

# 28. LIVE JEE TEST SCENARIO

Use this exact logical scenario:

``` text
1. Open JEE Main application.
2. Verify Profile-owned fields are visible.
3. Verify category is visible.
4. Verify category says From Sanchay Profile.
5. Verify profile-owned fields cannot be edited.
6. Verify application-owned fields can be completed.
7. Continue through each step.
8. Verify validation blocks incomplete required fields.
9. Save progress.
10. Reload/reopen.
11. Verify progress persists.
12. Open review.
13. Verify profile/application values.
14. Verify no automatic submission.
15. Verify explicit submission action exists only if supported.
```

Do NOT submit a real government application.

If an external official submission endpoint is not integrated, clearly
document:

``` text
External submission:
NOT IMPLEMENTED / NOT TESTED
```

Do not fake success.

------------------------------------------------------------------------

# 29. EXECUTION LOG FINALIZATION

Update:

``` text
emergency phase/EMERGENCY_EXECUTION_LOG.md
```

with the final E6 entry:

``` text
Phase: E6
Step: Final Production Verification
Status:
JEE route:
PASS/FAIL/SKIPPED
Profile integration:
PASS/FAIL
Category:
PASS/FAIL
Read-only profile fields:
PASS/FAIL
Application-owned fields:
PASS/FAIL
Validation:
PASS/FAIL
Progress persistence:
PASS/FAIL
Review:
PASS/FAIL
Submission safety:
PASS/FAIL
AI application assistance:
PASS/FAIL
AI JEE navigation:
PASS/FAIL
Accessibility/AI interaction:
PASS/FAIL/SKIPPED
Cross-user isolation:
PASS/FAIL
Typecheck:
PASS/FAIL
Tests:
PASS/FAIL
Build:
PASS/FAIL
Git:
SUCCESS/FAILED
Vercel:
READY/FAILED
Production:
PASS/FAIL
Next step:
STOP — do not start E7
```

------------------------------------------------------------------------

# 30. DEFINITION OF DONE

E6 is COMPLETE only when:

\[ \] E1--E5 reviewed \[ \] Same execution log reused \[ \] JEE
architecture audited \[ \] Every application step mapped \[ \]
Profile-owned fields identified \[ \] Profile-owned fields are read-only
\[ \] Profile source of truth preserved \[ \] Category flow verified \[
\] Missing category handled safely \[ \] Gender flow verified \[ \]
Application-owned fields identified \[ \] Application validation
verified \[ \] Progress persistence verified \[ \] Refresh/reopen
behavior verified or limitation documented \[ \] Review step verified \[
\] Submission safety verified \[ \] No false submission \[ \] AI JEE
navigation verified \[ \] AI application assistance verified \[ \] AI
cannot mutate profile \[ \] AI cannot fabricate submission \[ \]
Semantic/AI-friendly form structure audited \[ \] Critical buttons
accessible \[ \] Application ownership verified \[ \] Confirmed issues
fixed only \[ \] Typecheck passes \[ \] Tests pass \[ \] Build passes \[
\] Git diff reviewed \[ \] Git commit created \[ \] Git push succeeds \[
\] Vercel READY \[ \] Production API verified \[ \] JEE production route
verified where possible \[ \] Execution log finalized \[ \]
Current-state/changelog updated

------------------------------------------------------------------------

# 31. CRITICAL STOP RULE

If the problem belongs to:

-   API packaging → E2
-   Authentication → E3
-   Database infrastructure → E4
-   Profile source of truth → E5

DO NOT silently expand E6.

Record:

``` text
OUT OF SCOPE — belongs to E<phase>
```

If E6 is blocked:

``` text
E6 BLOCKED
```

STOP.

Do not start E7.

------------------------------------------------------------------------

# 32. FINAL RESPONSE

After completing E6, respond ONLY with:

E6 COMPLETE

JEE application workflow: `<one sentence>`{=html}

Profile integration: PASS / FAIL

Category: PASS / FAIL

Gender: PASS / FAIL

Profile-owned fields read-only: PASS / FAIL

Application-owned fields: PASS / FAIL

Validation: PASS / FAIL

Progress persistence: PASS / FAIL

Review: PASS / FAIL

Submission safety: PASS / FAIL

AI JEE navigation: PASS / FAIL

AI application assistance: PASS / FAIL

AI profile mutation protection: PASS / FAIL

AI-friendly HTML/accessibility: PASS / FAIL / SKIPPED

Cross-user isolation: PASS / FAIL

Typecheck: PASS / FAIL

Tests: PASS / FAIL

Build: PASS / FAIL

Git commit: `<SHA>`{=html}

Git push: SUCCESS / FAILED

Vercel: READY / FAILED

Production verification: PASS / FAIL

Execution log: UPDATED

E6 status: COMPLETE / BLOCKED

DO NOT START E7.

STOP AFTER E6.
