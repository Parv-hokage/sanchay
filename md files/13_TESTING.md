# 13 — Testing & Quality Assurance
# SANCHAY — Unified Government Digital Service Platform

**Status:** QA Strategy  
**Version:** 1.0

## 1. Purpose

Testing must verify correctness, security, reliability, AI quality, and service integration behavior.

## 2. Testing Pyramid

```text
                 E2E
                /   \
           Integration
              /     \
            Unit     AI/RAG
```

Security testing runs across every layer.

## 3. Unit Tests

Test:

- Validation
- Field mapping
- Eligibility rules
- Capability resolution
- Authorization helpers
- State transitions
- RAG chunking
- Citation mapping
- Utility functions

## 4. Integration Tests

Test:

- PostgreSQL
- Redis
- Object storage
- Authentication
- API modules
- Service adapters
- RAG retrieval
- Workers

## 5. API Tests

Every endpoint should test:

```text
Happy path
Authentication failure
Authorization failure
Validation failure
Not found
Conflict
Rate limit
Unexpected dependency failure
```

## 6. Authorization Tests

Mandatory scenarios:

```text
User A → User B application
User A → User B document
Wrong service
Wrong capability
Missing consent
Revoked consent
Expired session
Stale confirmation
```

All must fail safely.

## 7. E2E Tests

Core journeys:

1. Register/login.
2. Complete profile.
3. Browse department.
4. Open JEE.
5. Ask public AI question.
6. Retrieve authorized result.
7. Start application.
8. Auto-fill.
9. Review.
10. Confirm.
11. Submit through mocked adapter.
12. Receive status.
13. Open Ayushman.
14. Use AI in service context.

## 8. AI Evaluation

Measure:

- Correctness
- Groundedness
- Citation accuracy
- Retrieval recall
- Retrieval precision
- Tool selection
- Tool argument correctness
- Refusal correctness
- No-answer behavior
- Action-result fidelity

## 9. RAG Evaluation

Maintain a versioned evaluation set:

```text
Question
Service
Expected source
Expected facts
Expected citation
Difficulty
```

Run after changes to:

- Embeddings
- Chunking
- Retrieval
- Reranking
- Prompting
- LLM

## 10. AI Security Testing

Test:

- Prompt injection
- Data exfiltration attempts
- Tool escalation
- Cross-user access
- Arbitrary URL requests
- Arbitrary SQL requests
- False submission claims
- Malicious documents

Expected result: deny, safely refuse, or route through authorized controls.

## 11. RAG Security Testing

Test:

- Fake government sources
- Poisoned documents
- Outdated documents
- Conflicting documents
- Prompt injection in documents
- Citation mismatch

## 12. Service Adapter Testing

Use mocks/sandboxes where available.

Test:

```text
Success
Timeout
5xx
Malformed response
Authentication failure
Rate limit
Duplicate request
Partial response
Unknown status
```

Never use production government accounts in automated tests unless explicitly authorized.

## 13. Document Testing

Test:

- Valid PDF
- Invalid file
- Oversized file
- Malicious file
- Wrong MIME type
- Duplicate document
- Expired signed URL
- Unauthorized download

## 14. Performance Testing

Measure:

- API latency
- AI latency
- Retrieval latency
- Database queries
- Worker throughput
- Upload throughput
- Concurrent users

Load-test before major deployment.

## 15. Reliability Testing

Test:

- Database unavailable
- Redis unavailable
- LLM unavailable
- RAG unavailable
- Government service unavailable
- Worker crash
- Duplicate job
- Network timeout

The platform should degrade gracefully.

## 16. Regression Testing

Every release runs:

```text
Unit
Integration
API
Security
Critical E2E
AI/RAG evaluation
```

## 17. Test Data

Use synthetic/anonymized data.

Never use real citizen data in ordinary development/testing.

## 18. Quality Gates

Production deployment requires:

- Critical tests passing.
- No unresolved critical security findings.
- AI evaluation within approved thresholds.
- Migration tested.
- Rollback plan available.
- Monitoring available.

## 19. Testing Principle

> **A feature is not complete because it works once. It is complete when its expected behavior, failure behavior, security boundaries, and regression behavior are tested.**
