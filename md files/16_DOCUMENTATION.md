# 16 — Documentation Strategy
# SANCHAY — Unified Government Digital Service Platform

**Status:** Documentation Standard  
**Version:** 1.0

## 1. Purpose

Documentation keeps the system understandable as the team, AI agents, services, and codebase grow.

## 2. Documentation Sources of Truth

```text
PRD → Product requirements
User Stories → User needs
Requirements → Functional/non-functional requirements
Design → UI/UX
User Flows → Journeys
Tech Stack → Technologies
Architecture → System structure
Database → Data model
API → API contracts
AI/RAG → AI behavior
Security → Security controls
Implementation → Build approach
Testing → QA
Deployment → Infrastructure
Monitoring → Operations
Decisions → Why decisions were made
```

## 3. Developer Setup

Document:

- Prerequisites
- Repository setup
- Environment variables
- Database setup
- Migrations
- Seed data
- Running API
- Running frontend
- Running workers
- Running tests

## 4. Architecture Documentation

Explain:

- System boundaries
- Major modules
- Data flow
- AI flow
- RAG flow
- Government integration flow
- Security boundaries

## 5. API Documentation

OpenAPI is the canonical machine-readable API contract.

Human documentation should explain:

- Authentication
- Common errors
- Examples
- Important workflows

## 6. Service Integration Documentation

Every government service should have a service-specific document containing:

```text
Service overview
Official sources
Capabilities
Data mappings
Integration requirements
Known limitations
Failure behavior
Testing approach
```

## 7. AI Documentation

Document:

- Model provider
- Prompt versions
- Tool definitions
- RAG sources
- Retrieval strategy
- Evaluation set
- Safety rules
- Cost controls

## 8. Security Documentation

Document:

- Threat model
- Data classification
- Secrets
- Authentication
- Authorization
- Incident response
- Security testing

Never publish actual secrets.

## 9. User Documentation

Explain in simple language:

- Creating an account
- Profile
- Finding services
- Using AI
- Applying
- Reviewing applications
- Documents
- Consent
- Status
- Troubleshooting

## 10. Documentation Rules

1. Update docs when behavior changes.
2. Do not document unsupported functionality as available.
3. Examples must use fake data.
4. API examples must remain valid.
5. Architecture diagrams must match reality.
6. Security-sensitive information must not be exposed.

## 11. AI Agent Rule

Every coding AI agent must read the relevant MD files before making changes.

If a conflict exists:

```text
Stop
 ↓
Explain conflict
 ↓
Reference relevant documents
 ↓
Record decision
 ↓
Continue after resolution
```

## 12. Documentation Principle

> **Documentation is part of the product, not a cleanup task after coding.**
