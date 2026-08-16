# 15 — Monitoring, Observability & Operations
# SANCHAY — Unified Government Digital Service Platform

**Status:** Observability Blueprint  
**Version:** 1.0

## 1. Purpose

Monitoring must detect:

- Application failures
- Security incidents
- Government integration failures
- AI failures
- RAG quality degradation
- Performance problems
- Capacity problems

## 2. Observability

Use:

```text
Logs
Metrics
Traces
```

with a shared request/trace ID.

## 3. Application Metrics

Track:

- Request rate
- Error rate
- Latency
- 4xx/5xx rates
- Authentication failures
- Authorization failures
- Database latency
- Queue depth

## 4. Infrastructure Metrics

Track:

- CPU
- Memory
- Disk
- Network
- Database connections
- Database storage
- Redis memory
- Worker utilization

## 5. Government Integration Metrics

Per service:

```text
Availability
Latency
Error rate
Timeouts
Rate limits
Authentication failures
Circuit-breaker state
```

A failure in one integration must not hide the health of others.

## 6. AI Metrics

Track:

- Requests
- Latency
- Model usage
- Token usage
- Tool calls
- Tool failures
- Refusals
- Context size
- Estimated cost

## 7. RAG Metrics

Track:

- Retrieval latency
- Retrieval volume
- Top-K usage
- Citation rate
- Source freshness
- No-answer rate
- Retrieval evaluation score
- Reranker performance

## 8. Security Monitoring

Alert on:

- Repeated failed logins
- Authorization failures
- Unusual document access
- Mass tool calls
- Suspicious admin actions
- Secret access anomalies
- SSRF attempts
- Rate-limit abuse

## 9. Logs

Logs should contain:

```text
timestamp
level
service
requestId
traceId
event
safe metadata
```

Never log secrets or unnecessary sensitive data.

## 10. Audit vs Operational Logs

Operational logs answer:

> "What happened technically?"

Audit logs answer:

> "Who performed which sensitive action?"

Keep them conceptually separate.

## 11. Alert Severity

```text
P0 — Critical platform/security incident
P1 — Major outage or high-risk security issue
P2 — Significant degradation
P3 — Minor issue
```

## 12. Alert Examples

P0:

- Suspected citizen-data breach
- Government credential compromise
- Unauthorized mass access

P1:

- API unavailable
- Database unavailable
- Major authentication failure

P2:

- One government integration degraded
- High AI latency
- Queue backlog

## 13. AI Quality Alerts

Alert on:

- Sudden citation failures
- Sudden no-answer increase
- Tool selection regression
- Unsupported claim increase
- RAG retrieval degradation

## 14. Dashboards

Recommended dashboards:

```text
Platform Health
API
Database
Workers
Government Integrations
AI
RAG
Security
Business/Application
```

## 15. SLO Candidates

Initial targets should be defined after baseline measurements.

Examples:

```text
API availability
Critical endpoint latency
Government integration availability
AI response latency
RAG freshness
```

Do not invent unrealistic SLOs before measuring the system.

## 16. Incident Flow

```text
Alert
 ↓
Triage
 ↓
Contain
 ↓
Investigate
 ↓
Recover
 ↓
Verify
 ↓
Postmortem
```

## 17. Monitoring Principle

> **Monitoring is not only about knowing whether Sanchay is online. It must tell us whether citizens are receiving correct, secure, and authoritative service.**
