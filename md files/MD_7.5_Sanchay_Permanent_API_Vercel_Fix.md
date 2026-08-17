# Sanchay --- MD 7.5

## Permanent API / Vercel Deployment Stabilization

**Priority:** CRITICAL

## Objective

Fix the Sanchay API deployment architecture permanently. The current
production Vercel deployment crashes with:

``` text
500 INTERNAL_SERVER_ERROR
FUNCTION_INVOCATION_FAILED
Cannot find module '@sanchay/config'
```

This is a deployment/runtime dependency problem, not a single endpoint
problem.

## Non-negotiable requirements

The final API deployment MUST:

-   Build from a clean checkout.
-   Produce a self-contained serverless deployment artifact.
-   Resolve every runtime `@sanchay/*` dependency.
-   Never depend on local `dist/` folders or IDE caches.
-   Never rely on TypeScript `paths` alone for Node runtime resolution.
-   Return JSON from `/api/v1/*`, including errors.
-   Keep authentication working.
-   Keep Profile and Category updates working.
-   Keep JEE application data read-only and sourced from Profile.
-   Preserve existing tests and functionality.

## 1. Diagnose the complete dependency graph

Inspect:

``` text
apps/api/src/serverless.ts
apps/api/vercel.json
root vercel.json
apps/api/package.json
packages/*/package.json
pnpm-workspace.yaml
```

Trace every runtime import reachable from the serverless entrypoint.

Search for all:

``` text
@sanchay/config
@sanchay/types
@sanchay/shared
@sanchay/validation
@sanchay/*
../../packages/
../../../packages/
../../workers/
../../../workers/
```

Do NOT fix packages one-by-one after deployment failures. Audit the
entire dependency graph first.

## 2. Fix runtime resolution, not only TypeScript

TypeScript `paths` can make compilation succeed while Node still fails
at runtime.

Do not treat:

``` json
"paths": {
  "@sanchay/config": ["../../packages/config/src/index.ts"]
}
```

as proof that production can resolve `@sanchay/config`.

The production serverless artifact must either:

1.  bundle internal workspace packages into the API function, OR
2.  include their compiled runtime output in a structure Node can
    resolve.

Choose one coherent strategy and apply it to ALL runtime workspace
dependencies.

Do not commit generated `dist/` directories merely to hide the problem.

## 3. Package configuration

Audit every internal package's:

``` json
main
types
exports
```

Do not point production runtime to TypeScript source unless the selected
runtime bundler explicitly supports it.

Do not leave:

``` json
"main": "./dist/index.js"
```

when `dist/index.js` will not exist in the clean deployment.

## 4. Vercel serverless configuration

Inspect `apps/api/vercel.json` and the API serverless entrypoint.

There must be one clear API entrypoint.

Do not accidentally deploy:

-   the Next.js web output;
-   the root web Vercel configuration;
-   a stale `dist/serverless.js`;
-   a nonexistent output path;
-   a development server.

The configured output must exactly match the artifact actually generated
by the API build.

## 5. Clean-build verification

Simulate a fresh CI environment.

Remove generated build output and verify:

``` bash
pnpm install --frozen-lockfile
pnpm build
```

If the repository's lockfile requires a different install command, use
the least permissive correct command.

The build must not depend on:

``` text
existing dist/
existing node_modules/
IDE caches
TypeScript caches
Vercel caches
```

## 6. Verify the actual deployment artifact

After building, inspect the real serverless output.

Confirm the configured entrypoint exists.

Search the generated JavaScript for unresolved runtime imports such as:

``` text
require("@sanchay/config")
require("@sanchay/types")
require("@sanchay/shared")
require("@sanchay/validation")
```

If they remain, prove that the deployed artifact contains resolvable
copies of those packages or bundle them.

A successful `pnpm build` alone is NOT sufficient.

## 7. API JSON contract

For all:

``` text
/api/v1/*
```

the server must return JSON.

Never allow a Vercel HTML error page to be returned where the frontend
expects JSON.

Validation errors must be structured JSON, not generic HTML.

## 8. Frontend API URL

Audit the web API client and production environment variables.

Remove stale mixtures of:

``` text
old Vercel deployment
preview deployment
localhost
hardcoded old API URL
```

Use one canonical production API URL.

Check:

``` text
VITE_API_BASE_URL
NEXT_PUBLIC_* variables
api-client.ts
web API proxy routes
```

## 9. Authentication

These must continue working:

``` text
/api/v1/auth/login
/api/v1/auth/session
/api/v1/auth/verify
/api/v1/auth/logout
```

Do not turn validation failures into fake session-expired errors.

## 10. Profile and Category rules

Profile is the single source of truth.

Category is edited ONLY in My Profile.

JEE reads it read-only from Profile.

Canonical values:

``` text
GENERAL
EWS
OBC_NCL
SC
ST
```

Gender:

``` text
MALE
FEMALE
OTHER
```

Display labels may be human-readable, but API payloads must use
canonical values.

Profile updates should use minimal PATCH payloads, for example:

``` json
{
  "category": "OBC_NCL"
}
```

Do not resend the entire profile unnecessarily.

## 11. JEE application

JEE must consume citizen information and academic information directly
from Profile.

Category must display as read-only, for example:

``` text
Category
OBC-NCL
✓ From Sanchay Profile
```

If the user says the category is wrong, AI must direct them to My
Profile.

AI must NOT directly mutate Profile data.

## 12. Validation

Zod validation errors must be returned as proper 400/422-style JSON
errors.

They must never become generic 500 crashes.

Examples:

``` text
Category value is invalid.
Gender value is invalid.
```

The frontend must display the actual server validation message.

## 13. Git → Vercel pipeline

Do NOT manually deploy with:

``` bash
vercel deploy
```

The intended pipeline is:

``` text
Antigravity changes
        ↓
git add
        ↓
git commit
        ↓
git push origin main
        ↓
GitHub
        ↓
Vercel Git Integration
        ↓
sanchay-api automatic production deployment
```

Verify the existing `sanchay-api` Vercel project is connected to the
correct GitHub repository and `main` branch.

Do not create a second deployment mechanism if Git integration already
exists.

## 14. No browser automation

To save tokens:

**DO NOT use browser/web-control automation.**

Do not open or operate the Vercel dashboard.

Do not manually scroll logs.

Do not use screenshots for verification.

Use terminal/API commands only.

The user will inspect the final deployment manually.

## 15. Git safety

Before committing:

``` bash
git status
git diff --stat
```

Never commit:

``` text
.env
.env.local
API keys
database passwords
JWT secrets
credentials
service-account files
```

Then:

``` bash
git add <intended files>
git commit -m "fix(api): make Vercel serverless deployment self-contained"
git push origin main
```

Do not force-push or rewrite history.

## 16. Documentation

Update:

``` text
00_CURRENT_STATE.md
md files/17_CHANGELOG.md
```

Document:

-   root cause;
-   permanent runtime-resolution strategy;
-   Vercel configuration;
-   verification results;
-   Git commit;
-   deployment status.

Do not claim production success until the automatic Vercel deployment
has actually completed successfully.

## 17. Required verification

Run:

``` bash
pnpm typecheck
pnpm test
pnpm build
```

Then verify at minimum:

``` text
GET  /api/v1/health
POST /api/v1/auth/login
GET/POST /api/v1/auth/session
GET  /api/v1/me/profile
PATCH /api/v1/me/profile
```

Also verify all five categories:

``` text
GENERAL
EWS
OBC_NCL
SC
ST
```

and:

``` text
MALE
FEMALE
OTHER
```

## 18. Exact execution order

Follow this order:

1.  Inspect repository structure.
2.  Inspect `serverless.ts`.
3.  Inspect API Vercel configuration.
4.  Inspect root Vercel configuration.
5.  Trace every runtime import.
6.  Audit every `@sanchay/*` dependency.
7.  Audit relative imports escaping `apps/api`.
8.  Choose ONE self-contained deployment strategy.
9.  Implement it consistently.
10. Remove obsolete/conflicting configuration.
11. Clean generated build directories.
12. Perform a clean install/build.
13. Inspect the actual serverless artifact.
14. Confirm no unresolved internal runtime modules.
15. Run typecheck.
16. Run tests.
17. Run build.
18. Update the MD documentation.
19. `git status`.
20. `git diff --stat`.
21. Commit.
22. `git push origin main`.
23. STOP.

Do NOT manually run `vercel deploy`.

Do NOT use browser automation.

Do NOT keep changing code after the successful push unless the user
reports a new production failure.

## 19. Definition of done

The task is complete only when:

-   [ ] Clean API build passes.
-   [ ] Typecheck passes.
-   [ ] Full tests pass.
-   [ ] Serverless artifact exists.
-   [ ] Artifact contains/resolves all runtime workspace dependencies.
-   [ ] `@sanchay/config` resolves.
-   [ ] `@sanchay/types` resolves.
-   [ ] `@sanchay/shared` resolves.
-   [ ] `@sanchay/validation` resolves.
-   [ ] No unresolved `@sanchay/*` runtime imports remain.
-   [ ] `/api/v1/health` works.
-   [ ] Authentication works.
-   [ ] Profile GET works.
-   [ ] Profile PATCH works.
-   [ ] Category selection works.
-   [ ] Category validation works.
-   [ ] JEE reads category from Profile.
-   [ ] JEE category remains read-only.
-   [ ] API errors are JSON.
-   [ ] Git push succeeds.
-   [ ] Git → Vercel automatic deployment triggers.
-   [ ] Production deployment reaches Ready.
-   [ ] No `Cannot find module` serverless startup errors occur.

## 20. Final report

After completing the work, report:

``` text
MD 7.5 COMPLETE

Root cause:
<one sentence>

Permanent fix:
<one sentence>

Tests:
- Typecheck: PASS/FAIL
- Tests: PASS/FAIL
- Build: PASS/FAIL

Git:
- Commit: <SHA>
- Branch: main
- Push: PASS/FAIL

Vercel:
- Automatic Git deployment triggered: YES/NO
- Production deployment: READY/FAILED

Do not make any further changes.
```

**CRITICAL:** Never claim production success unless the production
deployment actually succeeds.
