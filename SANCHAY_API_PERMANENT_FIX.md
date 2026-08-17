# SANCHAY — PERMANENT API ARCHITECTURE FIX

## Goal

Fix the recurring production problem where the Sanchay frontend expects JSON from the API but receives HTML.

Current errors include:

- `API connection error (500): Expected JSON response but received text/html`
- `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

Do NOT patch this by blindly changing `response.json()`. Find and fix the actual routing/base-URL problem.

---

## 1. Architecture

There are TWO production Vercel projects:

### Frontend
` sanchay `

Responsible for the web UI.

### Backend
` sanchay-api `

Responsible for the NestJS API, authentication, profile, applications, catalog, knowledge, AI, and database.

The production flow MUST be:

```text
Sanchay Frontend
      ↓
ONE central API client
      ↓
ONE canonical production API base URL
      ↓
sanchay-api
      ↓
NestJS
      ↓
JSON response
```

It must NOT accidentally become:

```text
Sanchay Frontend
      ↓
its own Next.js deployment
      ↓
HTML page
      ↓
JSON.parse()
      ↓
ERROR
```

---

## 2. Trace the failing request FIRST

Before changing code, trace the Service Directory/catalog request.

Find the exact frontend code that loads the catalog.

Record:

1. HTTP method
2. Full URL
3. Request body/headers
4. HTTP status
5. Response Content-Type
6. First part of response body
7. Which Vercel project handled the request

Do the same for authentication.

Do NOT guess.

---

## 3. Find the canonical API base URL

Search the whole repository for:

```text
API_BASE_URL
NEXT_PUBLIC_API_BASE_URL
VITE_API_BASE_URL
NEXT_PUBLIC_API_URL
VITE_API_URL
localhost:4000
/api/v1/
sanchay-three.vercel.app
sanchay-api
```

Find the central API client.

There must be ONE canonical place where API URLs are constructed.

No individual component should hardcode API URLs.

---

## 4. Production environment

Configure the FRONTEND Vercel project with the actual stable production URL of `sanchay-api`.

Use the repository's actual framework convention:

- Next.js → appropriate `NEXT_PUBLIC_*` variable
- Vite → appropriate `VITE_*` variable

Do NOT invent a domain.

Do NOT use an old deployment-specific URL if a stable production API domain exists.

Do NOT expose:

```text
AI_API_KEY
DATABASE_PASSWORD
JWT_SECRET
```

to the browser.

---

## 5. Central API client

All frontend API requests must go through the central API client.

This includes:

- Service Catalog
- Authentication
- Profile
- Applications
- JEE Application
- Knowledge
- AI Chat
- Document Vault
- Service Details
- Any future service

Search for direct:

```text
fetch(
axios(
/api/v1/
localhost:4000
```

and review every bypass.

---

## 6. JSON response protection

The API client should:

1. Send the request.
2. Check `response.ok`.
3. Check the Content-Type.
4. Parse JSON only when the response is actually JSON.
5. Give a useful diagnostic if HTML is returned.

Conceptually:

```ts
const response = await fetch(url, options);
const contentType = response.headers.get("content-type") ?? "";

if (!contentType.includes("application/json")) {
  const body = await response.text();

  throw new ApiError(
    "API returned a non-JSON response. Check API_BASE_URL and routing."
  );
}

const data = await response.json();

if (!response.ok) {
  throw new ApiError(data?.message ?? "API request failed");
}

return data;
```

Do not silently treat HTML as successful API data.

---

## 7. Backend Vercel routing

Inspect:

```text
apps/api/vercel.json
root vercel.json
apps/api/package.json
apps/api/nest-cli.json
apps/api/serverless.ts
```

Ensure the `sanchay-api` Vercel project is actually running the NestJS serverless application.

The API project must NOT inherit the Next.js frontend output configuration.

The existing `@sanchay/types` workspace fix MUST remain intact.

Do not revert it.

---

## 8. API health endpoint

Use the existing health endpoint if present.

Expected:

```text
GET /api/v1/health
```

It must return JSON.

For example:

```json
{
  "status": "ok"
}
```

Do not create a duplicate health system if one already exists.

---

## 9. Test the catalog FIRST

Find the actual catalog endpoint from the code.

Call the production endpoint directly on `sanchay-api`.

Verify:

- correct HTTP status
- `Content-Type: application/json`
- valid catalog JSON

Then load the Service Directory through the real production frontend.

The browser must no longer show:

```text
API connection error
Expected JSON response but received text/html
```

---

## 10. Test authentication

Test:

```text
Mock Citizen ID (Instant Demo)
citizen_demo
```

Click:

```text
Continue to Verification
```

Expected:

- request reaches `sanchay-api`
- response is JSON
- authentication succeeds
- profile loads

Also test an invalid ID.

Expected:

- JSON error
- useful UI error
- NEVER `Unexpected token '<'`

---

## 11. Test Profile

Verify:

- profile loads
- personal details load
- category loads
- academic qualifications load
- profile updates work

Profile remains the single source of truth.

---

## 12. Test Applications

Verify:

```text
My Applications
JEE Main Application
/services/jee-main/apply
```

Application data must load from the backend.

Profile-owned information remains read-only inside applications.

---

## 13. Test AI

Verify:

```text
POST /api/v1/ai/chat
```

Confirm:

- request reaches the backend
- response is JSON
- Qwen/OpenRouter configuration works
- RAG works
- conversation memory works
- profile context works
- application action works

Do not change AI behavior unless the investigation proves the AI endpoint itself is being misrouted.

---

## 14. Smoke-test critical API routes

Use the repository's ACTUAL route names.

At minimum test:

```text
GET  /api/v1/health
GET  /api/v1/catalog
POST /api/v1/auth/...
GET  /api/v1/profile/...
POST /api/v1/ai/chat
GET  /api/v1/knowledge/...
GET  /api/v1/applications/...
```

Every API endpoint must return JSON unless it is intentionally documented otherwise.

An API route must NEVER accidentally return the frontend's HTML document.

---

## 15. Prevent future regressions

Add automated smoke coverage that verifies critical production API responses have:

```text
Content-Type: application/json
```

and are not HTML.

Also add a test for the canonical API base URL configuration.

This is important: do not just fix today's catalog request. Make it difficult for another component to accidentally point at the frontend deployment.

---

## 16. Vercel environment verification

Inspect BOTH Vercel projects:

```text
sanchay
sanchay-api
```

Verify Production environment variables.

The frontend must have the public API base URL.

The backend must have its backend-only variables.

Never put backend secrets in public frontend variables.

---

## 17. No more patch loop

Do NOT do:

```text
API broken
→ random rewrite
→ deploy
→ another endpoint breaks
→ hardcode another URL
→ deploy again
```

Establish one architecture:

```text
ONE FRONTEND
      ↓
ONE CENTRAL API CLIENT
      ↓
ONE PRODUCTION API BASE URL
      ↓
ONE SANCHAY-API BACKEND
      ↓
NESTJS
```

---

## 18. Clean verification

Run:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

Then deploy the affected Vercel projects using the repository's established commands.

Verify:

```text
sanchay → READY
sanchay-api → READY
```

But READY alone is NOT sufficient.

Test the actual browser.

---

## 19. Definition of Done

The fix is complete ONLY when all of these work in production:

### Service Directory
Loads without an API connection error.

### Sign In
Mock login works without JSON parsing errors.

### Profile
Loads correctly.

### Applications
Loads correctly.

### JEE
Loads correctly.

### AI
Responds correctly.

### API
Returns JSON rather than frontend HTML.

---

## 20. Documentation

Update the EXISTING project documentation:

```text
00_CURRENT_STATE.md
17_CHANGELOG.md
```

Also update the current phase MD if this work belongs to it.

Document:

- canonical API architecture
- frontend/backend separation
- production API base URL
- Vercel configuration
- required environment variables
- JSON API contract
- smoke tests
- production verification

Do NOT create duplicate documentation for the same problem.

---

# FINAL INSTRUCTION TO ANTIGRAVITY

Treat this as an INFRASTRUCTURE problem, NOT a UI problem.

The screenshot proves the frontend is receiving:

```text
text/html
```

when it expects:

```text
application/json
```

Trace the request to the exact server that generated the HTML.

Fix the API base URL/routing at the source.

Then verify ALL major API consumers.

Do not stop after making one endpoint work.

The permanent target architecture is:

```text
ALL Sanchay frontend API requests
        ↓
CENTRAL API CLIENT
        ↓
CORRECT PRODUCTION SANCHAY-API
        ↓
NESTJS
        ↓
JSON
```

Do not report "fixed" until the real production browser successfully passes:

1. Service Directory
2. Sign In
3. Profile
4. Applications
5. JEE
6. AI
