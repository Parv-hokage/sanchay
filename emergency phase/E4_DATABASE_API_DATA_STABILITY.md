# EMERGENCY PHASE E4 --- DATABASE & API DATA STABILITY

## STATUS

Main roadmap: FROZEN at Phase 7 Emergency phase: E4 Previous phases: -
E1 --- Architecture & Dependency Audit ✅ - E2 --- Permanent API
Packaging & Vercel Fix ✅ - E3 --- Authentication & Session Stability ✅

Phase type: Database / API / Data Integrity / Production Stability

------------------------------------------------------------------------

# 0. HOW TO RUN

The user should only need to tell Antigravity:

DO E4

When the user says `DO E4`:

1.  Read this entire file.
2.  Read the existing E1, E2, and E3 emergency documentation.
3.  Create/use the fixed execution log described below.
4.  Execute E4 exactly as specified.
5.  Update the SAME execution log file after EVERY major step.
6.  Commit and push only E4 changes.
7.  Verify the automatic Vercel deployment.
8.  STOP after E4.

DO NOT START E5.

------------------------------------------------------------------------

# 1. MANDATORY EXECUTION LOG

This is a permanent requirement for ALL emergency phases from E4 onward.

Create exactly ONE file:

``` text
emergency phase/EMERGENCY_EXECUTION_LOG.md
```

Use the existing emergency-phase folder if its exact path differs.

DO NOT create a new log for every step.

DO NOT create duplicate logs.

DO NOT create timestamped copies.

The SAME FILE must be rewritten/updated throughout E4.

## After EVERY major step, update the log.

Each entry MUST contain:

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

Be factual.

Do not write vague statements such as:

"Fixed database."

Instead write:

"Inspected Prisma schema, identified X relation, changed Y because Z,
ran command A, received result B, then verified C."

## CRITICAL RULE

The execution log must describe what ACTUALLY happened.

Never claim something was done if it was not done.

Never omit an error that occurred during the phase.

Never hide a failed test.

If something is skipped, write:

``` text
SKIPPED — reason: ...
```

At the end of E4 the log must contain the complete chronological record
of the phase.

------------------------------------------------------------------------

# 2. OBJECTIVE

E4 exists to stabilize the Sanchay database and API data layer after
E1--E3.

The objective is NOT to redesign the database.

The objective is to verify and fix only genuine production-critical
problems involving:

``` text
API
↓
Prisma
↓
Database
↓
Data validation
↓
Transactions
↓
User ownership
↓
Production persistence
```

We need confidence that:

-   production API reads persistent data correctly;
-   production API writes persistent data correctly;
-   user data belongs to the correct user;
-   important relationships work;
-   API failures do not silently corrupt data;
-   local development is not accidentally hiding database problems;
-   serverless requests do not rely on in-memory state for persistent
    application data.

------------------------------------------------------------------------

# 3. ABSOLUTE RULES

DO NOT:

-   redesign the database;
-   rewrite Prisma schema without evidence;
-   delete production data;
-   reset the production database;
-   run destructive migrations;
-   drop tables;
-   truncate tables;
-   modify JEE logic;
-   modify AI logic;
-   modify authentication architecture;
-   modify frontend UI;
-   reopen E1;
-   reopen E2;
-   reopen E3 unless evidence proves E4 depends on them;
-   create another Vercel project;
-   use browser automation;
-   manually deploy using `vercel deploy`;
-   expose database passwords;
-   expose connection strings;
-   expose JWT secrets;
-   expose API keys;
-   print private user data;
-   create fake test data in production unless explicitly safe and
    documented.

Use CLI/API/database tooling only.

------------------------------------------------------------------------

# 4. READ PREVIOUS EMERGENCY PHASES

Before touching anything, inspect:

``` text
EMERGENCY_E1_ARCHITECTURE_AUDIT.md
E2 permanent API packaging documentation
E3 authentication/session documentation
```

Also inspect:

``` text
00_CURRENT_STATE.md
md files/17_CHANGELOG.md
```

Understand what has already been fixed.

DO NOT undo previous architecture.

------------------------------------------------------------------------

# 5. CREATE/INITIALIZE EXECUTION LOG

Before starting technical work:

Create or update:

``` text
emergency phase/EMERGENCY_EXECUTION_LOG.md
```

Record:

``` text
Phase: E4
Step: Initialization
Status: STARTED
What I was instructed to do:
Run E4 database/API stability phase.

What I actually did:
...

Files inspected:
...

Files changed:
...

Commands executed:
...

Evidence/results:
...

Problems encountered:
None / ...

How they were resolved:
N/A / ...

Why the change was necessary:
...

Verification:
...

Next step:
...
```

Then continue.

------------------------------------------------------------------------

# 6. DATABASE ARCHITECTURE AUDIT

Inspect:

``` text
prisma/schema.prisma
prisma/migrations/
apps/api/src/
```

Identify:

-   database provider;
-   Prisma version;
-   client generation;
-   connection configuration;
-   major models;
-   relations;
-   ownership fields;
-   unique constraints;
-   indexes;
-   cascade behavior;
-   nullable fields;
-   required fields.

Do NOT modify anything yet.

Update the execution log immediately after this step.

------------------------------------------------------------------------

# 7. PRODUCTION DATABASE CONFIGURATION

Inspect environment variable NAMES only.

Never print values.

Determine the actual production database configuration.

Identify:

``` text
DATABASE_URL
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
DIRECT_URL
other actual database variables
```

Use only variables that actually exist in the project.

Determine:

``` text
Which variable is used by Prisma?
Which variable is used by the application?
Which database is production?
Is a pooler used?
Is SSL required?
```

Do NOT expose credentials.

Update the execution log.

------------------------------------------------------------------------

# 8. PRISMA GENERATION AUDIT

Verify:

``` text
prisma generate
```

works cleanly.

Determine:

-   where Prisma Client is generated;
-   whether production build generates it;
-   whether the serverless bundle expects it externally;
-   whether the generated Prisma client exists in production;
-   whether Prisma engine files are available.

Do NOT change configuration unless an actual issue is found.

Update the execution log.

------------------------------------------------------------------------

# 9. API DATABASE CONNECTION AUDIT

Trace:

``` text
API request
↓
service
↓
Prisma
↓
database
```

Inspect the database service/provider.

Determine:

-   connection lifecycle;
-   pool configuration;
-   serverless compatibility;
-   connection reuse;
-   transaction handling;
-   error handling;
-   timeout handling.

Pay particular attention to serverless behavior.

Do NOT create a new database layer if the current one is correct.

Update the execution log.

------------------------------------------------------------------------

# 10. READ TEST

Using a safe existing endpoint, verify that production can read
persistent database data.

At minimum identify one endpoint that reads:

``` text
catalog/service
```

or another non-sensitive persistent resource.

Verify:

``` text
HTTP status
response structure
database-backed content
```

Do not expose private user data.

Update the execution log.

------------------------------------------------------------------------

# 11. WRITE TEST

Identify a safe existing database-backed write operation.

Prefer an existing test fixture or non-destructive test path.

Verify:

``` text
API request
↓
validation
↓
database write
↓
database persistence
↓
subsequent read
```

Do NOT create arbitrary production records.

If safe production write testing is impossible:

``` text
SKIPPED — production write test not safe
```

Then use an isolated test database/local production-equivalent database.

Update the execution log.

------------------------------------------------------------------------

# 12. TRANSACTION AUDIT

Search for:

``` text
$transaction
transaction
createMany
updateMany
deleteMany
```

Identify operations that logically require atomicity.

Look for dangerous patterns such as:

``` text
write A
write B
write C
```

where A/B/C must either all succeed or all fail.

Do NOT redesign everything.

Only fix a transaction if there is a clear integrity risk.

Update the execution log.

------------------------------------------------------------------------

# 13. USER DATA OWNERSHIP AUDIT

Because E3 established authentication, verify database operations
correctly bind data to the authenticated user.

Search for:

``` text
userId
req.user
request.user
currentUser
profileId
conversationId
applicationId
```

Verify that sensitive resources use server-side authenticated identity.

Example:

``` text
Authenticated User A
↓
request applicationId belonging to User B
↓
DENY
```

The API must never trust a client-supplied user ID when authenticated
identity is available.

Do NOT expose private information during testing.

Update the execution log.

------------------------------------------------------------------------

# 14. CROSS-USER DATABASE ISOLATION

Test safe ownership boundaries.

At minimum verify:

``` text
User A → own data → ALLOW
User A → User B data → DENY
Unauthenticated → private data → DENY
```

Expected response should follow the project's existing authorization
convention.

Do not modify authentication.

Do not expose User B's actual private data.

Update the execution log.

------------------------------------------------------------------------

# 15. VALIDATION AUDIT

Inspect API DTOs and validation schemas.

Identify endpoints where malformed input could cause:

-   invalid database writes;
-   unexpected null values;
-   type mismatch;
-   invalid enum;
-   oversized payload;
-   invalid IDs.

Do NOT add validation everywhere.

Only fix clearly unsafe or missing validation discovered during the
audit.

Update the execution log.

------------------------------------------------------------------------

# 16. ERROR HANDLING

Verify database errors do not leak:

-   SQL;
-   stack traces;
-   credentials;
-   connection strings;
-   internal filesystem paths.

Production API responses should remain safe structured JSON.

Test representative failures:

``` text
invalid ID
missing required field
unauthorized ownership
database unavailable if safely testable
```

Expected behavior:

``` text
400 / 401 / 403 / 404 / 409 / 500
```

as appropriate.

Do not turn every database error into HTTP 200.

Update the execution log.

------------------------------------------------------------------------

# 17. SERVERLESS PERSISTENCE AUDIT

Search for application state stored in:

``` text
global variables
module-level arrays
Map
Set
in-memory cache
local filesystem
temporary files
```

Determine whether any such state is incorrectly being used as persistent
application data.

Important:

Serverless instances are ephemeral.

Persistent application state must live in the database or an appropriate
external storage system.

Do NOT remove legitimate caches or runtime-only state without evidence.

Update the execution log.

------------------------------------------------------------------------

# 18. SQLITE / LOCAL DATABASE CHECK

Search the API for:

``` text
sqlite
sqlite3
better-sqlite3
.db
database.sqlite
```

Determine whether any production path accidentally uses SQLite/local
filesystem persistence.

If SQLite exists only for tests/development:

``` text
ACCEPTABLE — development/test only
```

If production can accidentally use it:

``` text
CRITICAL — production persistence risk
```

Fix only if confirmed.

Update the execution log.

------------------------------------------------------------------------

# 19. MIGRATION AUDIT

Inspect:

``` text
prisma/migrations/
```

Determine:

-   migration history;
-   latest migration;
-   whether schema and migration state match;
-   whether deployment expects migrations;
-   whether production has pending migrations.

DO NOT run destructive migration commands.

Never use:

``` text
prisma migrate reset
```

against production.

If a migration is required, document it before applying it.

Update the execution log.

------------------------------------------------------------------------

# 20. TEST SUITE

Run:

``` bash
pnpm typecheck
pnpm test
pnpm build
```

All existing tests must continue passing.

If database-specific tests exist, run them.

Do not delete tests to make the suite pass.

Update the execution log with exact results.

------------------------------------------------------------------------

# 21. FIX ONLY CONFIRMED ISSUES

After the audit, create a list:

``` text
Confirmed issue:
Evidence:
Impact:
Minimal fix:
Files affected:
```

Then fix ONLY confirmed E4 issues.

Do NOT make speculative improvements.

Do NOT refactor unrelated code.

After every actual fix:

UPDATE:

``` text
EMERGENCY_EXECUTION_LOG.md
```

with:

``` text
Step:
Files changed:
Before:
After:
Reason:
Verification:
```

------------------------------------------------------------------------

# 22. CLEAN VERIFICATION

After fixes:

Run:

``` bash
pnpm typecheck
pnpm test
pnpm build
```

Then run safe API/database tests.

Verify:

``` text
API starts
↓
database connects
↓
read works
↓
safe write works or is safely skipped
↓
ownership works
↓
errors are safe
```

Update the execution log.

------------------------------------------------------------------------

# 23. PRODUCTION VERIFICATION

Push only after local verification passes.

Use:

``` bash
git status
git diff --stat
```

Ensure ONLY E4 changes exist.

Commit:

``` text
fix(data): stabilize database and API persistence
```

Push:

``` bash
git push origin main
```

Do NOT manually run:

``` text
vercel deploy
```

Use Git → Vercel automatic deployment.

Update the execution log after the push.

------------------------------------------------------------------------

# 24. VERCEL PRODUCTION TEST

After automatic deployment reaches READY:

Verify:

``` text
GET /api/v1/health
```

Then verify at least:

``` text
production database-backed READ
production authentication-aware READ
production ownership/authorization
```

If safe:

``` text
production database-backed WRITE → READ
```

Otherwise document:

``` text
SKIPPED — production write test would create/modify persistent user data
```

Do not expose private data.

Update the execution log.

------------------------------------------------------------------------

# 25. DOCUMENTATION

Update:

``` text
00_CURRENT_STATE.md
md files/17_CHANGELOG.md
```

Record:

-   confirmed issues;
-   fixes;
-   database architecture;
-   production verification;
-   Git commit;
-   Vercel status.

Then update the SAME:

``` text
EMERGENCY_EXECUTION_LOG.md
```

with the complete final state.

------------------------------------------------------------------------

# 26. GIT SAFETY

Before committing:

``` bash
git status
git diff --stat
```

Verify:

-   no `.env`;
-   no secrets;
-   no database dumps;
-   no generated credentials;
-   no private user data;
-   no unrelated files.

Then commit.

------------------------------------------------------------------------

# 27. DEFINITION OF DONE

E4 is COMPLETE only when:

\[ \] E1 reviewed \[ \] E2 reviewed \[ \] E3 reviewed \[ \] Execution
log created \[ \] Execution log updated after every major step \[ \]
Database architecture audited \[ \] Prisma audited \[ \] Production
database configuration verified \[ \] API database connection verified
\[ \] Database read verified \[ \] Safe write verified OR explicitly
documented as skipped \[ \] Transaction risks audited \[ \] User
ownership audited \[ \] Cross-user isolation verified \[ \] Input
validation audited \[ \] Database error handling audited \[ \]
Serverless persistence audited \[ \] SQLite production risk checked \[
\] Migration state checked \[ \] Confirmed issues separated from
speculative issues \[ \] Only confirmed issues fixed \[ \] Typecheck
passes \[ \] Tests pass \[ \] Build passes \[ \] Git diff reviewed \[ \]
Commit created \[ \] Git push succeeds \[ \] Vercel deployment READY \[
\] Production database-backed API verified \[ \] Documentation updated
\[ \] Execution log finalized

------------------------------------------------------------------------

# 28. CRITICAL STOP RULE

If you discover a problem that belongs to:

-   authentication;
-   API packaging;
-   Vercel bundling;
-   frontend UI;
-   AI;
-   JEE;
-   Profile;

DO NOT silently expand E4.

Record it in:

``` text
EMERGENCY_EXECUTION_LOG.md
```

as:

``` text
OUT OF SCOPE — belongs to E<phase>
```

Then continue E4 only if possible.

If the issue blocks E4:

``` text
E4 BLOCKED
```

and STOP.

Do not start E5.

------------------------------------------------------------------------

# 29. FINAL RESPONSE

After completing E4, respond ONLY with:

E4 COMPLETE

Database architecture: `<one sentence>`{=html}

Confirmed issues: `<list>`{=html}

Issues fixed: `<list>`{=html}

Database read: PASS / FAIL

Safe write: PASS / FAIL / SKIPPED

Transaction integrity: PASS / FAIL

Cross-user isolation: PASS / FAIL

Validation: PASS / FAIL

Error handling: PASS / FAIL

Serverless persistence: PASS / FAIL

Prisma: PASS / FAIL

Typecheck: PASS / FAIL

Tests: PASS / FAIL

Build: PASS / FAIL

Git commit: `<SHA>`{=html}

Git push: SUCCESS / FAILED

Vercel: READY / FAILED

Production database API: PASS / FAIL

Execution log: UPDATED

E4 status: COMPLETE / BLOCKED

DO NOT START E5.

STOP AFTER E4.
