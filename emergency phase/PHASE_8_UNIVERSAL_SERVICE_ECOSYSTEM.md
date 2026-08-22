# PHASE 8 — UNIVERSAL SERVICE ECOSYSTEM
## Architecture, Reusability Blueprint & Multi-Service Integration

**Phase Status:** COMPLETE & PRODUCTION VERIFIED  
**Version:** 0.9.0  
**Completion Date:** 2026-08-22  

---

## 1. Architectural Objective

Sanchay is a universal, extensible digital governance platform. Rather than building custom code for each individual government service, Sanchay provides reusable core infrastructure that all future government services integrate with:

```text
Citizen / User
      ↓
Sanchay AI & Web Portal
      ↓
Universal AI Action Engine (Centralized Action Registry)
      ↓
Universal Profile Resolver (Canonical Sanchay Profile as Single Source of Truth)
      ↓
Universal Form Engine (Machine-Readable Schema & Field State Machine)
      ↓
Universal Service Registry
      ↓
Service Adapters (e.g. JEE Main Adapter, National Scholarship Adapter)
      ↓
External Government Authority Adapter / Endpoint
```

---

## 2. Core Reusable Subsystems

### 2.1. Universal Service Adapter Contract
Every service implements the standard `ServiceAdapter` interface (`apps/api/src/catalog/adapters/service-adapter.interface.ts`):
- `serviceId`: Unique identifier (e.g., `srv-jee-001`, `srv-nsp-001`).
- `name`: Display name.
- `slug`: URL and routing slug (`jee-main`, `national-scholarship`).
- `organization` & `department`: Institutional hierarchy metadata.
- `getRequirements()`: Declares required and optional profile/document/input fields.
- `getFormSchema()`: Returns machine-readable form sections, field types, validation constraints, and profile source bindings.
- `validateApplication()`: Deterministic server-side application validator.
- `executeAction()`: Executes service-specific actions (e.g. `check_eligibility`, `open_section`).

### 2.2. Universal Service Registry
Centralized in `apps/api/src/catalog/service-registry.service.ts`:
- Registers service adapters dynamically.
- Injects services into catalog controllers, AI orchestrator, and application engines.
- Exposes `listRegisteredServices()`, `getServiceRequirements()`, `getUniversalFormSchema()`, and `executeServiceAction()`.

### 2.3. Universal Profile Resolver & Field State Machine
Implemented in `apps/api/src/me/profile-resolver.service.ts`:
- Resolves declared service requirements against the authenticated user's canonical Sanchay Profile (`MeService`).
- Classifies each field into deterministic states:
  - `PROFILE_VERIFIED`: Auto-resolved from citizen profile with verified badge and edit lock.
  - `USER_PROVIDED`: Entered by the citizen in the draft.
  - `AI_EXTRACTED`: Parsed from conversation.
  - `MISSING`: Required by service but not yet provided.
  - `LOCKED`: Read-only / cannot be modified outside profile.
- Zero AI hallucinations or silent fallback user substitutions.

### 2.4. Universal AI Action Registry
Integrated in `apps/api/src/ai/tools/tool-registry.service.ts`:
- `service.get_requirements`: Discovers requirements for any registered service.
- `service.get_form_schema`: Retrieves universal form schema.
- `profile.resolve_requirements`: Deterministically resolves citizen profile attributes.
- `application.autofill`: Auto-fills verified data into application drafts.
- `application.review`: Generates transparent application review sheet.
- `application.submit_mock`: High-risk consequential action requiring explicit confirmation.
- `document.list`: Lists verified citizen documents.
- `scholarship.check_eligibility`: Deterministic eligibility evaluation for merit scholarships.

### 2.5. Mock Second Service Proof (`national-scholarship`)
Implemented in `apps/api/src/catalog/adapters/national-scholarship.adapter.ts`:
- Proves that a new service (National Merit Scholarship Scheme) reuses 100% of authentication, profile resolution, document vault access, form validation, AI context, and audit logging with zero duplication.

---

## 3. How Future Services Are Added

To onboard any new government service (e.g. Civil Services, State Scholarship, Welfare Grant):
1. **Define Service Adapter**: Implement `ServiceAdapter` in `apps/api/src/catalog/adapters/<service-slug>.adapter.ts`.
2. **Declare Requirements & Form Schema**: Specify required profile fields (e.g., `fullName`, `category`, `income`) and application fields (e.g., `examCenter`, `course`).
3. **Define Validation & Actions**: Implement `validateApplication()` and any domain-specific actions (e.g., `check_eligibility`).
4. **Register in `ServiceRegistryService`**: Call `this.registerAdapter(newAdapter)`.
5. **Add Automated Tests**: Verify requirements, validation, and profile resolution.
6. **Deploy**: The service immediately inherits Sanchay authentication, profile auto-fill, document vault linking, AI chat support, review screens, and audit logging.

---

## 4. Verification & Quality Gate Results

- **Automated Tests:** `pnpm test` $\rightarrow$ **21 test suites, 123 tests passing (100%)**.
- **Typecheck:** `pnpm typecheck` $\rightarrow$ **0 errors across all 10 workspace packages/apps**.
- **Monorepo Build:** `pnpm build` $\rightarrow$ **All packages, serverless API bundle (355 KB), and Next.js web application built cleanly**.
- **Identity Chain Regression Test:** `apps/api/src/me/me.identity-chain.spec.ts` $\rightarrow$ **PASS (6/6 tests passing)**.
- **Universal Ecosystem Spec:** `apps/api/src/catalog/universal-ecosystem.spec.ts` $\rightarrow$ **PASS (13/13 tests passing)**.
