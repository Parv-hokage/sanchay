# EMERGENCY PHASE E3 --- AUTHENTICATION & SESSION STABILITY

## STATUS

Main roadmap: FROZEN at Phase 7 Emergency phase: E3 Previous phase: E2
--- Permanent API Packaging & Vercel Fix Phase type: Authentication /
API stability

## HOW TO RUN

The user should only need to tell Antigravity:

DO E3

When the user says `DO E3`, read this entire file and execute it
exactly.

------------------------------------------------------------------------

# 1. OBJECTIVE

Now that E2 has permanently fixed the API packaging/deployment
architecture, stabilize the authentication and session layer in
production.

E2 is COMPLETE:

-   Self-contained serverless bundle: PASS
-   Internal @sanchay/\* runtime references: 0
-   TypeScript source runtime references: 0
-   Isolated runtime: PASS
-   Typecheck: PASS
-   Tests: PASS
-   Build: PASS
-   Git push: SUCCESS
-   Vercel production: READY
-   Production health: HTTP 200

DO NOT reopen or redesign the E2 packaging architecture unless an
authentication failure proves that it is directly involved.

The goal of E3 is:

``` text
User
↓
Login
↓
Session/token creation
↓
Authenticated API request
↓
Session validation
↓
User identity
↓
Authorized protected resource
↓
Logout / session invalidation
```

Authentication must work reliably both locally and in production.

------------------------------------------------------------------------

# 2. ABSOLUTE RULES

DO NOT:

-   build new product features;
-   modify JEE functionality;
-   modify AI functionality;
-   modify conversation memory;
-   redesign Profile;
-   redesign the database;
-   change the database schema unless an authentication migration is
    absolutely required and documented;
-   change frontend design;
-   reopen E2 unnecessarily;
-   create another Vercel project;
-   manually run `vercel deploy`;
-   use browser automation;
-   expose secrets;
-   print JWT secrets, passwords, cookies, tokens, or API keys;
-   weaken authentication to make tests pass;
-   disable guards;
-   bypass authorization;
-   create insecure fallback authentication.

Use CLI/API/terminal verification wherever possible.

------------------------------------------------------------------------

# 3. FIRST --- READ EXISTING AUTH ARCHITECTURE

Before changing anything, inspect the existing implementation.

Find and understand:

``` text
apps/api/src/auth/
apps/api/src/me/
apps/api/src/common/
guards
strategies
JWT configuration
session logic
auth controllers
auth services
database models
frontend auth client
API client
middleware/interceptors
```

Also inspect:

``` text
prisma/schema.prisma
apps/api/package.json
.env.example
```

Do not assume the exact filenames.

Determine whether the current system uses:

-   JWT
-   cookies
-   sessions
-   refresh tokens
-   access tokens
-   a combination

Document the actual architecture before modifying it.

------------------------------------------------------------------------

# 4. AUTHENTICATION FLOW AUDIT

Trace the complete flow:

``` text
Login request
↓
Validation
↓
Credential verification
↓
User lookup
↓
Token/session creation
↓
Response
↓
Frontend storage/transmission
↓
Protected request
↓
Authentication guard
↓
Current user
↓
Authorization
```

Identify where authentication can fail.

Do not make speculative fixes.

------------------------------------------------------------------------

# 5. PRODUCTION ENVIRONMENT AUDIT

Inspect environment variable NAMES only.

Never output secret values.

Identify all variables used by authentication, such as:

``` text
JWT_SECRET
JWT_EXPIRES_IN
SESSION_SECRET
COOKIE_SECRET
DATABASE_URL
FRONTEND_URL
API_URL
```

Use the actual variables in the repository rather than assuming these
names exist.

For every authentication-related variable report:

``` text
Variable:
Used by:
Required locally:
Required production:
Production configured:
Build-time or runtime:
```

If a required production variable is missing, document it clearly.

Do NOT print its value.

------------------------------------------------------------------------

# 6. AUTH ENDPOINT AUDIT

Identify the actual endpoints.

At minimum test the equivalents of:

``` text
POST /api/v1/auth/login
GET  /api/v1/auth/session
GET  /api/v1/auth/verify
POST /api/v1/auth/logout
```

If the project uses different endpoints, use the actual routes.

Do not invent routes.

------------------------------------------------------------------------

# 7. LOGIN TEST

Using a valid test account or existing project test mechanism:

Test:

``` text
Login
↓
Successful response
↓
Authenticated identity returned
```

Verify:

-   correct HTTP status;
-   structured JSON response;
-   no HTML error;
-   no server crash;
-   user identity is correct;
-   token/session is created correctly.

Do NOT print the token.

If credentials are unavailable, use the existing test fixtures or report
that production credential verification cannot be completed.

Do not create fake authentication bypasses.

------------------------------------------------------------------------

# 8. SESSION TEST

After authentication, test the session endpoint.

Expected behavior:

``` text
Authenticated request
↓
Current user returned
```

Verify:

-   correct user;
-   correct user ID;
-   session/token recognized;
-   protected route accepts authentication.

Then test the same endpoint without authentication.

Expected:

``` text
401 Unauthorized
```

or the project's intended equivalent.

It must NOT return another user's information.

------------------------------------------------------------------------

# 9. AUTHORIZATION TEST

Authentication and authorization are different.

Test:

``` text
User A
↓
User A protected resource
↓
ALLOW

User A
↓
User B protected resource
↓
DENY
```

Verify that authenticated identity cannot be used to access another
user's private data.

At minimum test a protected profile/resource endpoint.

Expected unauthorized ownership access:

``` text
403 Forbidden
```

or the project's intended authorization response.

Never return private data.

------------------------------------------------------------------------

# 10. LOGOUT TEST

Test:

``` text
Authenticated
↓
Logout
↓
Session/token invalidated according to architecture
↓
Protected request
↓
Rejected
```

Use the actual project's token/session model.

If JWT access tokens are intentionally stateless and logout only clears
client-side state, document that behavior rather than pretending the
server invalidates the token.

------------------------------------------------------------------------

# 11. FRONTEND AUTH CLIENT AUDIT

Inspect:

``` text
apps/web/
api-client
auth context
login flow
session hydration
logout flow
```

Determine:

-   where authentication state is stored;
-   how credentials are sent;
-   whether cookies require credentials;
-   whether authorization headers are attached;
-   how 401 responses are handled;
-   whether stale sessions are cleared.

Do NOT redesign the UI.

Fix only actual authentication bugs.

------------------------------------------------------------------------

# 12. API RESPONSE CONTRACT

Authentication endpoints must consistently return JSON.

For example:

Success:

``` json
{
  "data": {
    "...": "..."
  }
}
```

Use the project's existing response envelope.

Do NOT introduce a second response envelope.

Do NOT return:

``` text
HTML
Vercel error page
raw stack trace
secret values
```

Authentication errors should be structured and safe.

------------------------------------------------------------------------

# 13. ERROR HANDLING

Verify these cases:

### Invalid credentials

Expected:

``` text
401
```

or the project's existing intended status.

### Missing authentication

Expected:

``` text
401
```

### Invalid/expired token

Expected:

``` text
401
```

### Authenticated but unauthorized resource

Expected:

``` text
403
```

### Malformed request

Expected:

``` text
400 / 422
```

as appropriate.

No case should cause a generic production function crash.

------------------------------------------------------------------------

# 14. SECURITY REQUIREMENTS

Never expose:

-   password hashes;
-   JWT secrets;
-   session secrets;
-   access tokens;
-   refresh tokens;
-   cookies;
-   API keys;
-   database passwords.

Do not log sensitive authentication data.

Verify passwords are never returned in API responses.

Verify authorization is enforced server-side.

Never trust:

``` text
userId
email
profileId
```

from the client when the authenticated identity can be obtained from the
server-side session/token.

------------------------------------------------------------------------

# 15. DATABASE AUTH DATA

Inspect the existing Prisma authentication-related models.

Verify:

-   user lookup works;
-   unique identifiers work;
-   password/auth data is handled safely;
-   no accidental duplicate-user behavior;
-   production database connection works.

DO NOT redesign the schema during E3.

If a schema defect is discovered, document it for a later emergency
phase unless it prevents authentication from functioning.

------------------------------------------------------------------------

# 16. AUTOMATED TESTS

Add or update authentication tests only where necessary.

At minimum cover:

``` text
Login success
Invalid credentials
Missing authentication
Valid session
Invalid/expired authentication
Unauthorized resource access
Logout behavior
User isolation
```

Run:

``` bash
pnpm test
```

All existing tests must continue passing.

Do not delete existing tests just because they fail.

Fix the underlying issue.

------------------------------------------------------------------------

# 17. TYPECHECK AND BUILD

Run:

``` bash
pnpm typecheck
pnpm test
pnpm build
```

All must pass.

Do NOT proceed to deployment if the build is broken.

------------------------------------------------------------------------

# 18. PRODUCTION VERIFICATION

E2 already proved the production API starts.

Now verify authentication against the actual production API using
CLI/API requests where possible.

Do not use browser automation.

Test:

``` text
Production health
↓
Production login
↓
Production session
↓
Production protected endpoint
↓
Production unauthorized endpoint
↓
Production logout
```

Do not print secrets or tokens.

------------------------------------------------------------------------

# 19. GIT

Before committing:

``` bash
git status
git diff --stat
```

Only include E3 changes.

Commit:

``` text
fix(auth): stabilize authentication and session handling
```

Then:

``` bash
git push origin main
```

Do NOT manually run:

``` bash
vercel deploy
```

Use the existing Git → Vercel pipeline.

------------------------------------------------------------------------

# 20. PRODUCTION DEPLOYMENT

After pushing:

``` text
git push
↓
GitHub
↓
Vercel
↓
Production
```

Verify using CLI/API tools.

Do not use browser automation.

Confirm:

``` text
Vercel deployment = READY
```

Then retest production authentication.

------------------------------------------------------------------------

# 21. IF SOMETHING FAILS

DO NOT randomly patch.

Classify the failure:

``` text
Authentication logic
Session/token logic
Environment variable
Cookie configuration
Frontend auth client
API response contract
Database
Authorization
Deployment
```

Determine the root cause first.

If the failure is unrelated to E3:

STOP.

Document it.

Do not modify unrelated systems.

If the failure is caused by E2 infrastructure:

STOP and document it rather than silently redesigning E2.

------------------------------------------------------------------------

# 22. DEFINITION OF DONE

E3 is COMPLETE only when:

\[ \] Existing auth architecture understood \[ \] Production auth
environment variables verified \[ \] Login works \[ \] Invalid login is
rejected \[ \] Session works \[ \] Missing auth is rejected \[ \]
Invalid/expired auth is rejected \[ \] Authorization works \[ \]
Cross-user access is rejected \[ \] Logout behavior works according to
architecture \[ \] No sensitive data is exposed \[ \] Auth errors return
JSON \[ \] Frontend auth flow works \[ \] Existing tests pass \[ \] New
auth tests pass where required \[ \] Typecheck passes \[ \] Build passes
\[ \] Git commit created \[ \] Git push succeeds \[ \] Automatic Vercel
deployment succeeds \[ \] Production authentication verified

------------------------------------------------------------------------

# 23. FINAL RESPONSE

After completing E3, respond ONLY with:

E3 COMPLETE

Authentication architecture: `<one sentence>`{=html}

Login: PASS / FAIL

Session: PASS / FAIL

Authorization: PASS / FAIL

Cross-user isolation: PASS / FAIL

Logout: PASS / FAIL

Invalid authentication: PASS / FAIL

Sensitive data exposure: PASS / FAIL

Typecheck: PASS / FAIL

Tests: PASS / FAIL

Build: PASS / FAIL

Git commit: `<SHA>`{=html}

Git push: SUCCESS / FAILED

Vercel: READY / FAILED

Production auth: PASS / FAIL

E3 status: COMPLETE / BLOCKED

DO NOT START E4.

STOP AFTER E3.
