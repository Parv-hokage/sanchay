# 14 — Deployment & Infrastructure
# SANCHAY — Unified Government Digital Service Platform

**Status:** Deployment Blueprint  
**Version:** 1.0

## 1. Environments

Maintain separate:

```text
Development
Staging
Production
```

No production credentials in development.

## 2. Production Architecture

```text
Users
 ↓
DNS
 ↓
CDN/WAF
 ↓
Frontend
 ↓
API
 ├── PostgreSQL
 ├── Redis
 ├── Object Storage
 ├── AI Providers
 └── Integration Gateway
       ├── NTA
       └── Ayushman
```

Workers run separately from the synchronous API.

## 3. Deployment Components

Minimum production components:

- Web application
- API
- PostgreSQL
- Redis
- Worker runtime
- Private object storage
- Secrets manager
- Monitoring
- WAF/CDN

## 4. Containerization

Where containers are used:

- Minimal images
- Non-root users
- Pinned dependencies
- No privileged containers
- Health checks
- Resource limits
- Image scanning

## 5. CI/CD

```text
Push
 ↓
Lint
 ↓
Typecheck
 ↓
Unit tests
 ↓
Integration tests
 ↓
SAST
 ↓
Dependency scan
 ↓
Secret scan
 ↓
Build
 ↓
Image scan
 ↓
Staging
 ↓
E2E
 ↓
Approval
 ↓
Production
```

## 6. Deployment Strategy

Prefer:

```text
Build immutable artifact
 ↓
Deploy to staging
 ↓
Validate
 ↓
Promote same artifact
 ↓
Production
```

Do not rebuild different code for production.

## 7. Database Migrations

```text
Migration created
 ↓
Review
 ↓
Test on staging
 ↓
Backup verification
 ↓
Production migration
 ↓
Application deployment
```

Prefer backward-compatible migrations for rolling deployments.

## 8. Environment Variables

Typical categories:

```text
DATABASE_URL
REDIS_URL
OBJECT_STORAGE_*
AUTH_*
LLM_*
EMBEDDING_*
MONITORING_*
SERVICE_INTEGRATION_*
```

Actual secrets must live in a secrets manager.

## 9. Secret Rules

Never commit:

- API keys
- Database passwords
- Government credentials
- JWT secrets
- Encryption keys

Rotate production secrets periodically and after compromise.

## 10. Networking

Production database, Redis, workers, and storage should use private networking where supported.

Only required services should be publicly reachable.

## 11. Scaling

Scale independently:

```text
Frontend
API
Workers
RAG ingestion
Document processing
```

PostgreSQL and Redis scaling should be driven by measured load.

## 12. Backups

PostgreSQL:

- Automated backups
- Point-in-time recovery where available
- Restore testing

Object storage:

- Versioning where appropriate
- Lifecycle policy
- Recovery strategy

## 13. Rollback

Every deployment must have a rollback strategy.

Application rollback:

```text
Previous artifact
```

Database rollback should preferably be achieved through forward-compatible migration design rather than destructive reverse migrations.

## 14. Health Checks

Provide:

```text
/live
/ready
/health
```

Do not expose sensitive infrastructure details.

## 15. Production Release Checklist

```text
✓ Tests pass
✓ Security checks pass
✓ Migration tested
✓ Backup verified
✓ Environment variables present
✓ Secrets available
✓ Health checks pass
✓ Monitoring active
✓ Rollback available
✓ Government integration health checked
```

## 16. Deployment Principle

> **Production should be reproducible, observable, recoverable, and isolated from development.**
