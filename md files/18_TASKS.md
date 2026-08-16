# 18 — Development Tasks
# SANCHAY

**Status:** Initial Backlog  
**Version:** 1.0

## Priority Legend

```text
P0 = Blocking / foundational
P1 = Required for MVP
P2 = Important
P3 = Future
```

---

# Phase 0 — Foundation

## P0

- [x] Initialize repository structure.
- [x] Configure TypeScript.
- [x] Configure linting and formatting.
- [x] Configure environment validation.
- [x] Configure CI.
- [x] Configure PostgreSQL.
- [x] Configure Prisma.
- [x] Configure Redis.
- [x] Implement base API.
- [x] Implement structured error handling.
- [x] Implement request IDs.
- [x] Implement secure logging.

# Phase 1 — Identity

## P0

- [x] Select authentication provider/strategy.
- [x] Implement login.
- [x] Implement logout.
- [x] Implement session handling.
- [x] Implement Sanchay UID.
- [x] Implement user table.
- [x] Implement profile.
- [x] Implement authorization middleware.
- [x] Implement ownership checks.

# Phase 2 — Service Platform

## P0

- [x] Departments.
- [x] Organizations.
- [x] Services.
- [x] Capabilities.
- [x] Capability requirements.
- [x] Service registry.
- [x] Integration registry.

# Phase 3 — Applications

## P1

- [ ] Application creation.
- [ ] Application fields.
- [ ] Field validation.
- [ ] Auto-fill engine.
- [ ] Application state machine.
- [ ] Review screen.
- [ ] Confirmation.
- [ ] Idempotent submission.
- [ ] Application status.

# Phase 4 — Documents

## P1

- [ ] Upload authorization.
- [ ] Private object storage.
- [ ] File validation.
- [ ] Malware scanning.
- [ ] Document metadata.
- [ ] Document versions.
- [ ] Access logs.
- [ ] Retention policy.

# Phase 5 — RAG

## P1

- [ ] Source registry.
- [ ] Official-source allowlist.
- [ ] Fetcher.
- [ ] HTML extraction.
- [ ] PDF extraction.
- [ ] OCR pipeline where required.
- [ ] Semantic chunking.
- [ ] Embeddings.
- [ ] pgvector.
- [ ] Hybrid search.
- [ ] Reranking.
- [ ] Citations.
- [ ] Versioning.
- [ ] Change detection.
- [ ] RAG evaluation dataset.

# Phase 6 — AI

## P1

- [ ] AI provider abstraction.
- [ ] Conversation system.
- [ ] Intent detection.
- [ ] Service context.
- [ ] Capability resolver.
- [ ] Context builder.
- [ ] Tool registry.
- [ ] Tool authorization.
- [ ] Tool input validation.
- [ ] Tool output validation.
- [ ] AI action states.
- [ ] Confirmation UI.
- [ ] AI evaluation.

# Phase 7 — JEE

## P1

- [ ] Confirm authorized NTA integration path.
- [ ] Implement JEE service definition.
- [ ] Implement JEE capabilities.
- [ ] Implement JEE public knowledge ingestion.
- [ ] Implement eligibility rules.
- [ ] Implement application mapping.
- [ ] Implement result retrieval where officially supported.
- [ ] Implement answer-key retrieval where officially supported.
- [ ] Implement application status where officially supported.
- [ ] Test failure states.

# Phase 8 — Ayushman

## P1

- [ ] Confirm authorized integration path.
- [ ] Implement service definition.
- [ ] Implement capabilities.
- [ ] Ingest official public knowledge.
- [ ] Implement supported eligibility/data flows.
- [ ] Implement supported document/status flows.
- [ ] Test failure states.

# Phase 9 — Security

## P0

- [ ] Secrets manager.
- [ ] HTTPS.
- [ ] CORS restrictions.
- [ ] CSRF protections where applicable.
- [ ] Rate limiting.
- [ ] SSRF protections.
- [ ] Secure file upload.
- [ ] Malware scanning.
- [ ] Audit logging.
- [ ] Dependency scanning.
- [ ] SAST.
- [ ] DAST.
- [ ] Authorization test suite.
- [ ] AI red-team tests.
- [ ] RAG poisoning tests.
- [ ] Penetration test.

# Phase 10 — Deployment

## P1

- [ ] Development environment.
- [ ] Staging environment.
- [ ] Production environment.
- [ ] CI/CD.
- [ ] Database migration pipeline.
- [ ] Backups.
- [ ] Restore test.
- [ ] Monitoring.
- [ ] Alerting.
- [ ] Rollback process.

# Current Sprint

Move selected tasks here only after prioritization.

```text
No sprint tasks selected yet.
```

# Task Rules

- Every implementation task should map to an MD requirement.
- Mark blocked tasks explicitly.
- Do not silently change scope.
- Completed tasks require tests.
- Security-sensitive tasks require security review.
- Integration tasks require documented external assumptions.
