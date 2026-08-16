# 02 — User Stories
# SANCHAY — Unified Government Digital Service Platform

**Product:** Sanchay  
**Scope:** NTA / JEE Main + Ayushman Bharat MVP  
**Version:** 2.0  
**Status:** Foundation Specification

---

# 1. Purpose

This document defines the capabilities users and platform roles need to accomplish.

It translates the PRD into testable user-centered stories.

It does not define database schema, API contracts, visual styling, or implementation technology.

---

# 2. Roles

## Citizen

Primary user of Sanchay.

## Service Integrator

Authorized role responsible for integrating a government service.

## Platform Administrator

Responsible for platform and service administration.

## Knowledge Administrator

Responsible for approved government knowledge sources.

---

# 3. Priority

```text
P0 = Essential for SIH MVP
P1 = Important production capability
P2 = Future capability
```

---

# 4. Identity & Account

## US-ID-001 — Create Sanchay Account

**Priority:** P0

> As a citizen, I want to create one Sanchay account so that I can access multiple government services from the same platform.

### Acceptance Criteria

- Identity verification occurs through a supported mechanism.
- Existing verified identity is checked before account creation.
- A new UID is generated only when an existing account is not found.
- Duplicate registration directs the user to the existing account/recovery flow.

---

## US-ID-002 — One Person, One Platform UID

**Priority:** P0

> As a citizen, I want my verified identity to correspond to one Sanchay account so that I do not accidentally create multiple platform identities.

### Acceptance Criteria

- Duplicate verified identities cannot create separate accounts.
- The platform UID is unique.
- The UID is not Aadhaar, phone number, email, or another public identifier.

---

## US-ID-003 — Use Multiple Authentication Methods

**Priority:** P0

> As a citizen, I want supported authentication methods to connect to my existing Sanchay account so that changing how I authenticate does not create another account.

### Acceptance Criteria

- Additional methods require appropriate verification.
- One verified identity cannot be linked to multiple accounts.
- Authentication methods map to the same UID after successful linking.

---

## US-ID-004 — Account Recovery

**Priority:** P0

> As a citizen, I want to recover my existing account so that losing access to one authentication method does not force me to create another account.

---

# 5. Main Navigation

## US-NAV-001 — Browse Departments

**Priority:** P0

> As a citizen, I want to browse government departments/domains so that I can find services without knowing the underlying portal.

Example:

```text
Education
Healthcare
Employment
Transport
Benefits
```

---

## US-NAV-002 — Browse Services Within a Department

**Priority:** P0

> As a citizen, I want to open a department and see its available organizations and services so that I can navigate government services through one consistent hierarchy.

Example:

```text
Education
  ↓
NTA
  ↓
JEE Main
```

---

## US-NAV-003 — Search Services

**Priority:** P0

> As a citizen, I want to search for a government service so that I can find it without navigating the entire hierarchy.

---

## US-NAV-004 — View Recommended Services

**Priority:** P1

> As a citizen, I want to see relevant/recommended services so that I can discover services that may be useful to me.

Recommendations must respect privacy and authorized profile use.

---

# 6. Traditional Service Experience

## US-TRAD-001 — Use Services Without AI

**Priority:** P0

> As a citizen, I want to use Sanchay through normal navigation so that AI is optional.

---

## US-TRAD-002 — Service Appears as Part of Sanchay

**Priority:** P0

> As a citizen, I want integrated government services to feel like sections of Sanchay so that I do not have to repeatedly learn different website interfaces.

Where an authorized integration is unavailable, the platform should clearly provide the official external portal instead.

---

## US-TRAD-003 — Service Page

**Priority:** P0

> As a citizen, I want each service to have a consistent service page so that I know where to find eligibility, requirements, application, status, and official links.

---

## US-TRAD-004 — Open Official Portal

**Priority:** P0

> As a citizen, I want to open the official government portal when I prefer the original experience or when Sanchay cannot perform an action directly.

---

# 7. Contextual AI

## US-AI-001 — Open Sanchay AI Anywhere

**Priority:** P0

> As a citizen, I want a small persistent AI control available throughout Sanchay so that I can ask for help without leaving my current workflow.

---

## US-AI-002 — ChatGPT-Like AI Experience

**Priority:** P0

> As a citizen, I want Sanchay AI to provide a familiar conversational experience so that I can communicate naturally instead of learning a new interaction model.

---

## US-AI-003 — AI Knows Current Context

**Priority:** P0

> As a citizen, I want Sanchay AI to understand the department, organization, service, page, and workflow I am currently viewing so that I do not have to repeat the context.

### Example

Current page:

```text
Education
→ NTA
→ JEE Main
→ Application
→ Personal Details
```

User:

> "What does this field mean?"

AI should understand the current field/page context.

---

## US-AI-004 — Ask About Current Screen

**Priority:** P0

> As a citizen, I want to ask the AI about what I am currently seeing so that I can understand confusing fields, instructions, or requirements.

---

## US-AI-005 — Preserve Context When Switching

**Priority:** P0

> As a citizen, I want to open and close AI without losing my current service or application context.

---

# 8. AI Service Discovery

## US-AI-006 — Describe Desired Outcome

**Priority:** P0

> As a citizen, I want to say what I want to accomplish in natural language so that I do not need to know the department or service name.

Example:

> "I want to apply for JEE."

---

## US-AI-007 — Clarify Ambiguous Intent

**Priority:** P0

> As a citizen, I want the AI to ask a clarification question when my request could refer to multiple services.

---

# 9. Official Government Information

## US-KB-001 — Ask Government Questions

**Priority:** P0

> As a citizen, I want to ask questions about government services and receive understandable answers.

---

## US-KB-002 — Official Source Grounding

**Priority:** P0

> As a citizen, I want answers to be grounded in official sources so that I can trust and verify important information.

---

## US-KB-003 — View Source

**Priority:** P0

> As a citizen, I want to see the official source behind important information so that I can verify it myself.

---

# 10. Citizen Profile

## US-PROFILE-001 — Maintain One Profile

**Priority:** P0

> As a citizen, I want one reusable profile so that I do not repeatedly enter the same personal information.

---

## US-PROFILE-002 — View My Information

**Priority:** P0

> As a citizen, I want to see what information Sanchay has about me so that I understand what can be reused.

---

## US-PROFILE-003 — Reuse Authorized Data

**Priority:** P0

> As a citizen, I want authorized profile information to be reused in supported applications so that repetitive form filling is reduced.

---

## US-PROFILE-004 — Control Data Sharing

**Priority:** P0

> As a citizen, I want to understand and control what information is shared with a government service.

---

# 11. Documents

## US-DOC-001 — Store Authorized Documents

**Priority:** P0

> As a citizen, I want to keep authorized documents available in Sanchay so that I can reuse them across supported workflows.

---

## US-DOC-002 — Detect Existing Documents

**Priority:** P0

> As a citizen, I want Sanchay to recognize when a required document is already available so that I do not upload it repeatedly.

---

## US-DOC-003 — Identify Missing Documents

**Priority:** P0

> As a citizen, I want to know which documents are missing before I start or submit an application.

---

# 12. Eligibility

## US-ELIG-001 — Check Eligibility Before Application

**Priority:** P0

> As a citizen, I want Sanchay to check applicable eligibility before taking me through unnecessary application steps.

---

## US-ELIG-002 — Explain Ineligibility

**Priority:** P0

> As a citizen, I want to know why I cannot proceed and see the relevant official requirement.

---

## US-ELIG-003 — Continue When Eligible

**Priority:** P0

> As an eligible citizen, I want Sanchay to continue directly into the relevant workflow.

---

# 13. Application Automation

## US-APP-001 — Start Application Through AI

**Priority:** P0

> As a citizen, I want to tell Sanchay AI to help me apply for a service so that it can guide me through the process.

---

## US-APP-002 — Pre-Fill Application

**Priority:** P0

> As a citizen, I want Sanchay to automatically populate supported fields using authorized profile information.

---

## US-APP-003 — Ask Only for Missing Information

**Priority:** P0

> As a citizen, I want the AI to ask only for information that is missing or requires my decision.

---

## US-APP-004 — Explain Form Fields

**Priority:** P0

> As a citizen, I want to ask the AI what a field means while I am filling a form.

---

## US-APP-005 — Review Application

**Priority:** P0

> As a citizen, I want to review the completed application before submission.

---

## US-APP-006 — Confirm Consequential Actions

**Priority:** P0

> As a citizen, I want to explicitly confirm important actions so that AI cannot submit or pay without my approval.

---

# 14. Recommendations

## US-REC-001 — Recommend Choices

**Priority:** P1

> As a citizen, I want Sanchay to recommend suitable options, such as an exam centre, when the service provides multiple choices.

---

## US-REC-002 — Understand Recommendation

**Priority:** P1

> As a citizen, I want to know why an option was recommended.

---

## US-REC-003 — Retain User Control

**Priority:** P0

> As a citizen, I want recommendations to remain recommendations until I confirm my choice.

---

# 15. Applications

## US-STATUS-001 — View Applications

**Priority:** P0

> As a citizen, I want one place to see my supported government applications.

---

## US-STATUS-002 — Track Application

**Priority:** P1

> As a citizen, I want to see the status of supported applications without visiting multiple portals.

---

# 16. JEE User Stories

## US-JEE-001 — Find JEE

**Priority:** P0

> As a student, I want to find JEE Main through Education → NTA so that I can access it without searching for a separate website.

---

## US-JEE-002 — Ask JEE AI Questions

**Priority:** P0

> As a student, I want to ask Sanchay AI questions while viewing JEE so that it understands the JEE context automatically.

---

## US-JEE-003 — Check JEE Eligibility

**Priority:** P0

> As a student, I want Sanchay to check applicable JEE eligibility before beginning the application.

---

## US-JEE-004 — Prepare JEE Application

**Priority:** P0

> As an eligible student, I want Sanchay to use my authorized profile information to reduce JEE form filling.

---

## US-JEE-005 — Select Exam Centre

**Priority:** P1

> As a student, I want Sanchay to help me choose an exam centre and provide recommendations where reliable official data is available.

---

# 17. Ayushman User Stories

## US-AYU-001 — Find Ayushman

**Priority:** P0

> As a citizen, I want to find Ayushman Bharat through Healthcare so that I do not need to locate a separate portal.

---

## US-AYU-002 — Ask Ayushman AI Questions

**Priority:** P0

> As a citizen, I want to ask questions about Ayushman while viewing the service and have the AI understand the context.

---

## US-AYU-003 — Check Ayushman Eligibility

**Priority:** P0

> As a citizen, I want Sanchay to guide me through applicable Ayushman eligibility requirements.

---

## US-AYU-004 — Reuse Authorized Information

**Priority:** P0

> As a citizen, I want supported Ayushman workflows to reuse authorized profile and document information.

---

# 18. Service Integration

## US-INT-001 — Add Government Service

**Priority:** P1

> As an authorized service integrator, I want to add a government service through a standard integration model so that it becomes available inside Sanchay.

---

## US-INT-002 — Define Service Structure

**Priority:** P1

> As an authorized service integrator, I want to define the service's metadata, requirements, eligibility, documents, actions, sources, and official portal.

---

## US-INT-003 — Connect Authorized API

**Priority:** P1

> As an authorized service integrator, I want to connect approved government APIs so that supported actions can be performed through Sanchay.

---

## US-INT-004 — Add Service Without Core Redesign

**Priority:** P0

> As the platform, I want new services to use the same core service architecture so that adding a new department/service does not require rebuilding Sanchay.

---

# 19. Knowledge Administration

## US-KA-001 — Add Official Source

**Priority:** P0

> As a knowledge administrator, I want to add approved government sources so that Sanchay AI can retrieve authoritative information.

---

## US-KA-002 — Track Source Version

**Priority:** P0

> As a knowledge administrator, I want to track source versions and dates so that outdated information can be identified.

---

## US-KA-003 — Handle Stale Sources

**Priority:** P0

> As a knowledge administrator, I want outdated or superseded sources to be flagged or removed from active retrieval.

---

# 20. Administration

## US-ADMIN-001 — Manage Services

**Priority:** P1

> As a platform administrator, I want to enable, disable, or configure supported services so that unreliable integrations do not affect citizens.

---

## US-ADMIN-002 — Monitor Integrations

**Priority:** P1

> As a platform administrator, I want to monitor service integrations so that failures can be detected.

---

# 21. Accessibility

## US-ACC-001 — Mobile Access

**Priority:** P0

> As a citizen, I want Sanchay to work well on mobile devices.

---

## US-ACC-002 — Simple Language

**Priority:** P0

> As a citizen, I want complex government instructions explained in understandable language.

---

## US-ACC-003 — Multiple Languages

**Priority:** P1

> As a citizen, I want supported government information to be available in multiple Indian languages.

Initial target: English and Hindi.

---

# 22. Core End-to-End Story

## US-E2E-001 — Complete Government Task Through Sanchay

**Priority:** P0

> As a citizen, I want to tell Sanchay what government task I want to accomplish and complete it through one platform without needing to understand the underlying portal structure.

### Expected Journey

```text
Login
  ↓
Department / AI discovery
  ↓
Service
  ↓
Official requirements
  ↓
Eligibility
  ↓
Profile/document reuse
  ↓
Missing information
  ↓
User decisions
  ↓
Application preparation
  ↓
Review
  ↓
Confirmation
  ↓
Authorized action
  ↓
Status
```

---

# 23. Core Contextual AI Story

## US-E2E-002 — AI Understands Where I Am

**Priority:** P0

> As a citizen, I want Sanchay AI to understand my current location inside the platform so that I can ask contextual questions without explaining the entire situation.

### Example

```text
Current:
Education → NTA → JEE Main → Application → Personal Details

User:
"What does this field mean?"

AI:
Explains the current field in the current JEE workflow.
```

---

# 24. Product-Wide Rules

1. One verified citizen maps to one Sanchay platform UID.
2. Aadhaar is not the platform UID.
3. AI is optional.
4. Traditional service access is always a first-class experience.
5. AI understands current context.
6. Government answers should be grounded in official sources.
7. Eligibility should use structured rules where possible.
8. Profile data is reused only when authorized.
9. Recommendations do not override user decisions.
10. Consequential actions require confirmation.
11. Existing official portals remain accessible.
12. No government security mechanism may be bypassed.
13. New services must use the standardized service model.
14. Prototype/mock integrations must be clearly identified.

---

# 25. Story Traceability

Each P0 story should eventually map to:

```text
User Story
   ↓
Requirement
   ↓
Design
   ↓
User Flow
   ↓
Architecture
   ↓
API / Database / AI
   ↓
Implementation
   ↓
Test Case
```

The story ID should be preserved across this chain.


---

# 26. Service Capability Stories

## US-CAP-001 — Understand Available Service Capabilities

**Priority:** P0

> As a citizen, I want Sanchay to know what a service can actually do so that AI does not offer actions that are unavailable.

### Acceptance Criteria

- Each integrated service exposes a declared capability set.
- AI only offers supported capabilities.
- Unsupported requests receive a clear explanation/fallback.

---

## US-CAP-002 — Retrieve Service Information

**Priority:** P0

> As a citizen, I want Sanchay AI to retrieve information belonging to the service so that I can access it conversationally.

Examples:

- Answer keys
- Admit cards
- Results
- Application details
- Notifications

---

## US-CAP-003 — Perform Authorized Service Action

**Priority:** P0

> As a citizen, I want Sanchay AI to perform supported service actions so that I do not have to manually navigate every step.

Examples:

- Start application
- Prepare application
- Retrieve a document
- Check status

---

## US-CAP-004 — Explain Retrieved Service Data

**Priority:** P0

> As a citizen, I want AI to explain retrieved service information so that raw government data becomes easier to understand.

Example:

> "Explain question 17 from my answer key."

---

## US-CAP-005 — Use Current Service Context

**Priority:** P0

> As a citizen, I want AI to use the current service/page context when retrieving data or performing an action.

---

## US-CAP-006 — Know When It Cannot Act

**Priority:** P0

> As a citizen, I want Sanchay to clearly tell me when a requested action is unavailable or requires the official portal.

---

# 27. JEE Capability Stories

## US-JEE-CAP-001 — Retrieve Answer Key

**Priority:** P0

> As a JEE candidate, I want Sanchay AI to retrieve my available answer key when the authorized service makes it available.

---

## US-JEE-CAP-002 — Explain Answer Key

**Priority:** P0

> As a JEE candidate, I want Sanchay AI to explain or analyze retrieved answer-key information.

---

## US-JEE-CAP-003 — Retrieve Result

**Priority:** P0

> As a JEE candidate, I want Sanchay AI to retrieve my result when the authorized service makes it available.

---

## US-JEE-CAP-004 — Retrieve Admit Card

**Priority:** P0

> As a JEE candidate, I want Sanchay AI to retrieve my admit card when the authorized service makes it available.

---

## US-JEE-CAP-005 — Retrieve Notifications

**Priority:** P0

> As a JEE candidate, I want Sanchay AI to retrieve relevant official notifications so that I do not miss important changes.

---

# 28. Generic "Everything the Service Allows" Story

## US-CAP-007 — Unified Service Capability Access

**Priority:** P0

> As a citizen, I want Sanchay AI to provide access to every capability that is officially exposed and authorized for the current service, so that I can use the service without learning separate interfaces.

### Acceptance Criteria

- The capability registry defines what is available.
- AI can discover the relevant capability.
- Authorization is checked before execution.
- The user is informed before consequential actions.
- The AI reports the real result returned by the underlying service.
