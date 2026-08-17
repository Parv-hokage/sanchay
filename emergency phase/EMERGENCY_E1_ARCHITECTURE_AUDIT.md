# EMERGENCY PHASE E1 — ARCHITECTURE & DEPENDENCY AUDIT

**Main Roadmap Status:** FROZEN at Phase 7  
**Emergency Phase:** E1 (Investigation & Audit Only)  
**Execution Date:** 2026-08-17  
**Author:** Antigravity Engineering (AI Pair Programmer)  
**Scope:** Investigation only — zero application code or deployment modifications made in this phase.

---

## 1. Current Repository & Application Architecture

The Sanchay platform is structured as a TypeScript monorepo managed via `pnpm` workspaces:

```text
sanchay/
├── apps/
│   ├── api/          # NestJS v10 REST API backend (Port 4000 locally, Vercel Serverless in prod)
│   └── web/          # Next.js 15.5 App Router citizen web application & government portal
├── packages/
│   ├── config/       # Environment variables & schema configuration via Zod
│   ├── shared/       # API response envelopes, error codes, constants
│   ├── types/        # Core domain TypeScript interfaces & canonical enums (Gender, Category)
│   └── validation/   # Shared Zod validation schemas (UpdateProfileSchema, Auth DTOs)
├── workers/
│   ├── document-processing/  # ClamAV scan mock, MIME magic byte validator, storage key engine
│   ├── knowledge-ingestion/  # HTML parser, semantic chunker, vector embeddings, SSRF guard
│   └── scheduled-jobs/       # Background maintenance tasks & cron definitions
├── prisma/
│   ├── schema.prisma         # PostgreSQL schema with 28 models
│   └── seed.ts               # Database seed script for services & catalog
├── package.json              # Monorepo root configuration
├── pnpm-workspace.yaml       # Workspace definition (apps/*, packages/*, workers/*)
├── pnpm-lock.yaml            # Lockfile (pnpm v11.22.0)
├── tsconfig.base.json        # Base TypeScript compiler options
└── vercel.json               # Root Vercel configuration
```

### Architectural Components
- **Frontend**: Next.js 15.5 (React 19, TailwindCSS, Lucide Icons, React Markdown).
- **Backend**: NestJS 10.4 (Express adapter, Swagger/OpenAPI, Helmet, Class Validator).
- **Database / ORM**: PostgreSQL with `pgvector` extension via Prisma ORM (v6.19.3, 28 models).
- **Authentication**: Passwordless OTP / mock IdP session management decoupled from citizen UID.
- **Storage**: Private object storage provider (`StorageService`) with hash-verified versioning.
- **AI Engine**: OpenRouter Qwen3 (`qwen/qwen3-30b-a3b`) with deterministic fallback rules.
- **Deployment Targets**: 
  - `sanchay` (Next.js web portal on Vercel)
  - `sanchay-api` (NestJS serverless API on Vercel)

---

## 2. API Runtime Dependency Graph

Tracing every runtime dependency reachable from the serverless entrypoint:

```text
apps/api/api/index.js (Vercel Serverless Function Entrypoint)
└── apps/api/src/serverless.ts (NestJS Serverless Bootstrap)
    └── apps/api/src/app.module.ts
        ├── Common Filters & Interceptors
        │   ├── LoggingInterceptor (apps/api/src/common/interceptors/logging.interceptor.ts)
        │   ├── TransformInterceptor (apps/api/src/common/interceptors/transform.interceptor.ts)
        │   └── GlobalHttpExceptionFilter (apps/api/src/common/filters/http-exception.filter.ts)
        │       └── @sanchay/shared (AppErrorCode, standard API envelopes)
        ├── HealthModule
        │   └── HealthController (apps/api/src/health/health.controller.ts)
        │       └── @sanchay/config (appConfig)
        ├── AuthModule
        │   ├── AuthController (apps/api/src/auth/auth.controller.ts)
        │   │   └── @sanchay/validation (LoginDto, VerifyOtpDto)
        │   └── AuthService (apps/api/src/auth/auth.service.ts)
        │       └── @sanchay/types (Gender, CitizenCategory, Session)
        ├── MeModule
        │   ├── MeController (apps/api/src/me/me.controller.ts)
        │   │   └── @sanchay/validation (UpdateProfileSchema, AddressDto)
        │   └── MeService (apps/api/src/me/me.service.ts)
        │       └── @sanchay/types (CitizenProfile, Address, ConsentRecord)
        ├── CatalogModule
        │   ├── CatalogController (apps/api/src/catalog/catalog.controller.ts)
        │   └── CatalogService (apps/api/src/catalog/catalog.service.ts)
        ├── ApplicationModule
        │   ├── ApplicationController (apps/api/src/application/application.controller.ts)
        │   └── ApplicationService (apps/api/src/application/application.service.ts)
        │       └── @sanchay/types (FieldSource, ApplicationStatus, CitizenCategory)
        ├── DocumentModule
        │   ├── DocumentController (apps/api/src/document/document.controller.ts)
        │   └── DocumentService (apps/api/src/document/document.service.ts)
        │       ├── @sanchay/types (DocumentRecord, DocumentStatus)
        │       └── @sanchay/worker-document-processing (Scan, MIME validation)
        ├── KnowledgeModule
        │   ├── KnowledgeController (apps/api/src/knowledge/knowledge.controller.ts)
        │   └── KnowledgeService (apps/api/src/knowledge/knowledge.service.ts)
        │       ├── @sanchay/types (KnowledgeChunk, SearchResult)
        │       └── @sanchay/worker-knowledge-ingestion (Chunker, SSRF Guard, Embeddings)
        └── AiModule
            ├── AiController (apps/api/src/ai/ai.controller.ts)
            └── AiService (apps/api/src/ai/ai.service.ts)
                ├── IntentDetectionService (apps/api/src/ai/services/intent-detection.service.ts)
                │   └── @sanchay/types (IntentType, ConversationContext)
                ├── CapabilityResolverService (apps/api/src/ai/services/capability-resolver.service.ts)
                └── ToolRegistryService (apps/api/src/ai/tools/tool-registry.service.ts)
                    └── @sanchay/types (ToolDefinition, ExecutionCard)
```

---

## 3. Internal Package Dependency Table

| Internal Package | Imported In (API) | Runtime vs Compile-Time | How TypeScript Resolves It | How Standard Node/Vercel Resolves It | Physical Location in Clean Deployment |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `@sanchay/types` | `auth.service.ts`, `me.service.ts`, `application.service.ts`, `ai.service.ts`, `document.service.ts`, `knowledge.service.ts` | **Runtime** (enums: `Gender`, `CitizenCategory`, `FieldSource`) & **Compile-time** (interfaces) | `tsconfig.json` `paths` $\rightarrow$ `packages/types/src/index.ts` | `node_modules/@sanchay/types` (symlink to `packages/types`) | Symlink to `../../packages/types` (breaks when `apps/api` isolated by Vercel Lambda) |
| `@sanchay/config` | `health.controller.ts`, `main.ts`, `worker-*` | **Runtime** (`appConfig` object loaded from `.env` via Zod) | `tsconfig.json` `paths` $\rightarrow$ `packages/config/src/index.ts` | `node_modules/@sanchay/config` (symlink to `packages/config`) | Symlink to `../../packages/config` (breaks when `apps/api` isolated by Vercel Lambda) |
| `@sanchay/shared` | `http-exception.filter.ts`, `transform.interceptor.ts` | **Runtime** (`AppErrorCode` enum, envelope formatting) | `tsconfig.json` `paths` $\rightarrow$ `packages/shared/src/index.ts` | `node_modules/@sanchay/shared` (symlink to `packages/shared`) | Symlink to `../../packages/shared` (breaks when `apps/api` isolated by Vercel Lambda) |
| `@sanchay/validation` | `me.controller.ts`, `auth.controller.ts` | **Runtime** (`UpdateProfileSchema`, `LoginDto` Zod schemas) | `tsconfig.json` `paths` $\rightarrow$ `packages/validation/src/index.ts` | `node_modules/@sanchay/validation` (symlink to `packages/validation`) | Symlink to `../../packages/validation` (breaks when `apps/api` isolated by Vercel Lambda) |
| `@sanchay/worker-document-processing` | `document.service.ts` | **Runtime** (`validateMimeSignature`, `scanDocumentBuffer`) | `tsconfig.json` `paths` $\rightarrow$ `workers/document-processing/src/index.ts` | `node_modules/@sanchay/worker-document-processing` | Symlink to `../../workers/document-processing` |
| `@sanchay/worker-knowledge-ingestion` | `knowledge.service.ts` | **Runtime** (`validateSafeGovernmentUrl`, `semanticChunk`, `generateDeterministicEmbedding`) | `tsconfig.json` `paths` $\rightarrow$ `workers/knowledge-ingestion/src/index.ts` | `node_modules/@sanchay/worker-knowledge-ingestion` | Symlink to `../../workers/knowledge-ingestion` |

---

## 4. Current Build Pipeline Sequence

When `pnpm build` executes in the root monorepo:

1. **Prisma Generation**: `prisma generate --schema=./prisma/schema.prisma` generates `@prisma/client` into root `node_modules`.
2. **Topological Package Builds**:
   - `packages/types` $\rightarrow$ `tsc` $\rightarrow$ `packages/types/dist/`
   - `packages/config` $\rightarrow$ `tsc` $\rightarrow$ `packages/config/dist/`
   - `packages/shared` $\rightarrow$ `tsc` $\rightarrow$ `packages/shared/dist/`
   - `packages/validation` $\rightarrow$ `tsc` $\rightarrow$ `packages/validation/dist/`
   - `workers/document-processing` $\rightarrow$ `tsc` $\rightarrow$ `workers/document-processing/dist/`
   - `workers/knowledge-ingestion` $\rightarrow$ `tsc` $\rightarrow$ `workers/knowledge-ingestion/dist/`
   - `workers/scheduled-jobs` $\rightarrow$ `tsc` $\rightarrow$ `workers/scheduled-jobs/dist/`
3. **API Build (`apps/api`)**:
   - `prisma generate --schema=../../prisma/schema.prisma`
   - `nest build` (compiles TypeScript to `apps/api/dist/`)
   - `node scripts/bundle-serverless.js` (bundles `src/serverless.ts` with all inlined `@sanchay/*` packages into `apps/api/dist/serverless.bundle.js`)
4. **Web Build (`apps/web`)**:
   - `next build` (compiles Next.js 15 pages and static routes to `apps/web/.next/`)

---

## 5. Serverless Artifact Analysis

- **Serverless Entrypoint**: `apps/api/api/index.js`
- **Compiled Bundle Target**: `apps/api/dist/serverless.bundle.js` (215 KB)
- **Inspection of Bundle Contents**:
  - Contains inlined code for `@sanchay/types`, `@sanchay/config`, `@sanchay/shared`, `@sanchay/validation`, and workers.
  - Runtime references to `@sanchay/*`: **0**
  - References to `../../packages/`: **0**
  - References to TypeScript source (`.ts` files): **0**
- **External Dependencies in Lambda**:
  - `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/swagger`
  - `@prisma/client`
  - `class-transformer`, `class-validator`, `helmet`, `reflect-metadata`, `rxjs`, `uuid`, `zod`, `dotenv`
  - These external packages are standard npm packages installed in `node_modules`.

---

## 6. Vercel Configuration Audit

### Root `vercel.json`
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "installCommand": "pnpm install --no-frozen-lockfile",
  "buildCommand": "pnpm build",
  "outputDirectory": "apps/web/.next"
}
```
*Purpose*: Deploys the `sanchay` frontend project on Vercel with Next.js App Router.

### API `apps/api/vercel.json`
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "functions": {
    "api/index.js": {
      "includeFiles": "dist/**"
    }
  },
  "rewrites": [
    {
      "source": "/api/v1/:match*",
      "destination": "/api"
    },
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ]
}
```
*Purpose*: Deploys the `sanchay-api` backend project on Vercel as a standalone serverless function.

---

## 7. Environment Variable Audit

| Variable Name | Used By | Required at Build-Time | Required at Runtime | Default / Fallback |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Global / API / Web | No | Yes | `'development'` |
| `PORT` | API (`main.ts`) | No | Yes (local only) | `4000` |
| `DATABASE_URL` | Prisma / API | Yes (`prisma generate`) | Yes | `'postgresql://postgres:postgres@localhost:5432/sanchay'` |
| `DIRECT_URL` | Prisma (migrations) | No | Optional | Same as `DATABASE_URL` |
| `JWT_SECRET` | Auth / Security | No | Yes | Fallback dev secret |
| `CORS_ALLOWED_ORIGINS` | API CORS | No | Yes | `'*'` |
| `OPENROUTER_API_KEY` | AI Service (Qwen3) | No | Optional | Deterministic rule fallback if unset |
| `OPENROUTER_MODEL` | AI Service (Qwen3) | No | Optional | `'qwen/qwen3-30b-a3b'` |
| `STORAGE_DRIVER` | Document Storage | No | Yes | `'LOCAL'` |
| `STORAGE_LOCAL_PATH` | Storage Path | No | Yes | `'.sanchay-vault'` |

---

## 8. Local vs Production Comparison

| Area | Local Environment | Production Vercel Lambda | Difference / Reason for Failure |
| :--- | :--- | :--- | :--- |
| **Monorepo Filesystem** | Full monorepo present on disk (`packages/`, `workers/`, `apps/`). | Isolated Lambda container (`/var/task/`) containing only `apps/api` and included files. | External monorepo folders (`../../packages/*`) are missing in isolated container. |
| **Workspace Symlinks** | `node_modules/@sanchay/*` symlinks resolve to local sibling directories. | Symlinks targeting `../../packages/*` break because parent directory is not in `/var/task`. | `require("@sanchay/config")` fails with `Cannot find module` if relying on unbundled symlinks. |
| **TypeScript Paths** | `tsconfig.json` `paths` allow `ts-node` and `vitest` to read `.ts` source files. | Node.js production runtime does not execute `.ts` source files. | Any package export pointing to `./src/index.ts` fails with `Cannot find module .../index.ts`. |
| **Compilation vs Bundling** | `tsc` compiles files individually, leaving `require("@sanchay/*")` as external calls. | Lambda environment has no resolvable `@sanchay/*` in `node_modules`. | Unbundled `tsc` output cannot resolve workspace packages at runtime without self-contained bundling. |
| **Serverless Entrypoint** | Directly loads Express/Nest in memory on localhost:4000. | Vercel Lambda invokes `api/index.js` which loads `serverless.bundle.js`. | Must be a single self-contained artifact. |

---

## 9. Exact Failure Chain

```text
1. SOURCE CODE:
   apps/api/src/health/health.controller.ts executes:
   import { appConfig } from '@sanchay/config';

2. TYPESCRIPT COMPILATION (UNBUNDLED):
   tsc resolves @sanchay/config via tsconfig paths to packages/config/src/index.ts.
   tsc outputs JavaScript containing:
   const config_1 = require("@sanchay/config");

3. MONOREPO PACKAGING MISMATCH:
   packages/config/package.json exports previously pointed to "./src/index.ts" or relied on pnpm symlinks.

4. VERCEL SERVERLESS DEPLOYMENT:
   Vercel packages apps/api into AWS Lambda /var/task.
   pnpm symlinks to ../../packages/config become dangling or unresolvable.

5. RUNTIME INVOCATION:
   Incoming request GET /api/v1/health triggers api/index.js.
   Node runtime encounters require("@sanchay/config").
   Node searches /var/task/node_modules/@sanchay/config.
   Target directory does not exist or points to missing TypeScript source.

6. CRASH:
   Cannot find module '@sanchay/config'
   500 INTERNAL_SERVER_ERROR / FUNCTION_INVOCATION_FAILED
```

---

## 10. Root Cause

**The Root Cause is Packaging Isolation vs Workspace Symlinks**: In a pnpm monorepo, internal `@sanchay/*` packages exist as filesystem symlinks outside the `apps/api` directory. When Vercel isolates and packages the API serverless function, it does not package external sibling directories (`../../packages/*`), rendering standard runtime `require("@sanchay/*")` calls and exported TypeScript source paths (`./src/index.ts`) unresolvable by the Node.js Lambda runtime.

---

## 11. Contributing Factors

1. **TypeScript Path Aliases Masking Runtime Dependencies**: `tsconfig.json` `paths` made TypeScript compilation (`tsc`) and local test runners succeed, concealing the fact that the emitted JavaScript still contained external `require("@sanchay/*")` statements.
2. **Package Export Leaks**: Previous package.json `exports` mappings pointed `import` or `default` to `./src/index.ts`, which failed when evaluated by Node without on-the-fly TypeScript transpilation.
3. **Multi-Project Deployment Separation**: The repository has two Vercel projects (`sanchay` for Next.js web and `sanchay-api` for NestJS API). The API project runs with root directory set to `apps/api`, where monorepo sibling packages are not packaged by default unless bundled.

---

## 12. ONE Recommended Permanent Architecture for Phase E2

### Self-Contained Serverless Artifact Bundling (esbuild)

1. **Single-File Serverless Bundle**:
   - Use `esbuild` during the `apps/api` build step (`scripts/bundle-serverless.js`) to bundle `src/serverless.ts` into a single, self-contained `apps/api/dist/serverless.bundle.js`.
   - All internal `@sanchay/*` code (`types`, `config`, `shared`, `validation`, and `workers`) is inlined directly into the bundle at compile-time.
   - Zero runtime `require("@sanchay/*")` or relative `../../packages/*` references remain in the artifact.
2. **Standard Package Exports**:
   - Every internal package (`packages/*`, `workers/*`) maintains strict, compiled `package.json` entrypoints:
     ```json
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "exports": {
       ".": {
         "types": "./dist/index.d.ts",
         "import": "./dist/index.js",
         "require": "./dist/index.js",
         "default": "./dist/index.js"
       }
     }
     ```
3. **Clean Vercel Function Entrypoint**:
   - `apps/api/api/index.js` cleanly requires `dist/serverless.bundle.js` directly, without runtime path-hacking or dynamic filesystem scanning.
   - Third-party dependencies (`@prisma/client`, `@nestjs/*`, `express`, `helmet`) are kept external and resolved standardly from npm `node_modules`.

---

## 13. Files Requiring Changes in Phase E2

| File | Proposed E2 Modification | Rationale |
| :--- | :--- | :--- |
| `apps/api/scripts/bundle-serverless.js` | Maintain robust esbuild bundler configuration | Inlines all internal `@sanchay/*` packages into `dist/serverless.bundle.js` |
| `apps/api/package.json` | Ensure `build` script triggers `prisma generate && nest build && node scripts/bundle-serverless.js` | Produces self-contained bundle automatically during every build |
| `apps/api/api/index.js` | Load `dist/serverless.bundle.js` directly | Clean, deterministic serverless entrypoint for Vercel |
| `packages/*/package.json` | Verify `exports` point only to compiled `dist/index.js` | Prevents runtime leaks to `.ts` source files |
| `workers/*/package.json` | Verify `exports` point only to compiled `dist/index.js` | Prevents runtime leaks to `.ts` source files |
| `00_CURRENT_STATE.md` | Document permanent bundling architecture | Preserves architectural documentation integrity |
| `md files/17_CHANGELOG.md` | Record E2 release stabilization | Full audit trail |

---

## 14. Risk Assessment

| Risk | Likelihood | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Decorator Metadata Stripping** | Low | High | `esbuild` is configured with `tsconfig: 'tsconfig.json'` respecting `emitDecoratorMetadata` and `experimentalDecorators`. |
| **Prisma Binary Architecture Mismatch** | Low | High | `@prisma/client` is explicitly marked `external` in esbuild so Prisma generates its native engine into `node_modules/.prisma/client`. |
| **Breaking Existing Tests** | Low | High | Vitest uses TypeScript source directly; `pnpm test` and `pnpm typecheck` remain 100% functional and unmodified. |
| **Frontend/JEE Regressions** | None | High | Zero changes to frontend UI, Profile single source of truth, or Category/Gender logic. |

---

## 15. Exact E2 Verification Plan

1. **Step 1: Clean Artifact Generation**:
   - Delete all `dist` folders.
   - Run `pnpm build`.
   - Verify `apps/api/dist/serverless.bundle.js` is generated (size ~215 KB).
2. **Step 2: Static Bundle Inspection**:
   - Grep `apps/api/dist/serverless.bundle.js` for `@sanchay/` $\rightarrow$ must return **0 matches**.
   - Grep `apps/api/dist/serverless.bundle.js` for `../../packages` $\rightarrow$ must return **0 matches**.
   - Grep `apps/api/dist/serverless.bundle.js` for `src/index.ts` $\rightarrow$ must return **0 matches**.
3. **Step 3: Isolated Runtime Execution**:
   - Execute a standalone Node script loading `apps/api/api/index.js` in an isolated process without monorepo workspace resolution.
   - Send simulated requests to `GET /api/v1/health` and `POST /api/v1/auth/login`.
   - Verify HTTP 200 JSON responses.
4. **Step 4: Full Quality Gate**:
   - `pnpm typecheck` (0 errors across 9 workspaces).
   - `pnpm test` (95/95 tests passing).
   - `pnpm build` (All packages + Next.js 29/29 routes).
5. **Step 5: Git Deployment**:
   - Commit changes: `fix(api): bundle monorepo dependencies for Vercel`.
   - Push to `origin main` for automatic Vercel production deployment.
