# 05 — User Flows
# SANCHAY — Unified Government Digital Service Platform

**Product:** Sanchay  
**Scope:** Unified platform + contextual AI + service capabilities  
**MVP:** NTA / JEE Main + Ayushman Bharat  
**Version:** 1.0  
**Status:** Foundation Flow Specification

---

# 1. Purpose

This document defines **how users move through Sanchay**.

It describes:

- Navigation
- Authentication
- Service discovery
- AI interaction
- Context preservation
- Knowledge retrieval
- Eligibility
- Data/document reuse
- Application workflows
- Service actions
- Status/retrieval
- Official portal fallback
- Errors
- End-to-end journeys

It does not define implementation technology.

---

# 2. Core Flow Principle

Sanchay has two interfaces over the same underlying service capabilities:

```text
                 SERVICE CAPABILITIES
                         │
              ┌──────────┴──────────┐
              ↓                     ↓
       Traditional UI          Sanchay AI
```

A user may move between them without losing relevant context.

---

# 3. Global Platform Flow

```text
Open Sanchay
     ↓
Home
     ↓
Choose:
 ├── Department
 ├── Search
 └── Sanchay AI
     ↓
Service
     ↓
Service Home
     ↓
Choose:
 ├── Information
 ├── Eligibility
 ├── Application
 ├── Documents
 ├── Status
 ├── Result/Data
 └── AI
```

---

# 4. First-Time User Flow

```text
Open Sanchay
     ↓
Create / Login
     ↓
Identity Verification
     ↓
Existing verified identity?
     ├── YES → Existing UID → Login
     └── NO  → Create Sanchay UID
                     ↓
                 Basic Profile
                     ↓
                 Consent
                     ↓
                 Home
```

The onboarding experience should collect only information needed at that stage.

---

# 5. Returning User Flow

```text
Open Sanchay
     ↓
Authenticate
     ↓
Resolve existing UID
     ↓
Load authorized profile/context
     ↓
Home
```

The user should not need to recreate their account.

---

# 6. Department Discovery Flow

Example:

```text
Home
 ↓
Departments
 ↓
Education
 ↓
Organizations / Services
 ↓
NTA
 ↓
JEE Main
```

Alternative:

```text
Home
 ↓
Search
 ↓
"JEE"
 ↓
JEE Main
```

---

# 7. AI Service Discovery Flow

User:

> "I want to apply for JEE."

```text
Open / use AI
      ↓
Understand intent
      ↓
Identify candidate service
      ↓
JEE Main
      ↓
Check whether service is supported
      ↓
Open JEE service context
```

If multiple services match:

```text
Ambiguous intent
      ↓
Ask clarification
      ↓
User selects service
      ↓
Continue
```

---

# 8. Service Context Flow

When a user opens a service, Sanchay creates a service context.

Example:

```text
User
Department: Education
Organization: NTA
Service: JEE Main
Page: Application
Section: Personal Information
Action: Filling
```

This context becomes available to relevant Sanchay AI operations.

---

# 9. Persistent AI Flow

At any supported point:

```text
Current Sanchay page
       ↓
       ◯ AI
       ↓
Open Sanchay AI
       ↓
Load current context
       ↓
Chat-style interface
       ↓
User asks question / requests action
       ↓
AI determines capability
```

The AI should not require the user to restate known context.

---

# 10. Contextual AI Flow

Example:

Current page:

```text
Education
→ NTA
→ JEE Main
→ Application
→ Personal Details
```

User opens AI:

> "What does this mean?"

Flow:

```text
User message
    ↓
AI receives:
 ├── Department = Education
 ├── Organization = NTA
 ├── Service = JEE Main
 ├── Page = Application
 └── Section = Personal Details
    ↓
Retrieve relevant official/service context
    ↓
Generate explanation
    ↓
Show answer + source where applicable
```

---

# 11. AI → Traditional Flow

```text
User in AI
   ↓
"Open the application"
   ↓
AI identifies action
   ↓
Traditional application interface
   ↓
Same service context preserved
```

---

# 12. Traditional → AI → Traditional Flow

```text
JEE Application
      ↓
User encounters confusing field
      ↓
◯ AI
      ↓
Ask:
"What does this mean?"
      ↓
AI explains current field
      ↓
Close AI
      ↓
Return to SAME application field
```

This is a core Sanchay interaction.

---

# 13. Generic AI Request Flow

Every AI request should conceptually follow:

```text
User Request
     ↓
Understand Intent
     ↓
Identify Current Context
     ↓
Identify Required Capability
     ↓
Capability Supported?
   ↙          ↘
 YES           NO
 ↓              ↓
Authorize       Safe fallback
 ↓
Retrieve required data
 / knowledge
 ↓
Execute / answer
 ↓
Verify result
 ↓
Present result
```

---

# 14. Knowledge Request Flow

Example:

> "What is the JEE eligibility?"

```text
User request
    ↓
Current service = JEE
    ↓
Knowledge capability
    ↓
Retrieve official sources
    ↓
Retrieve relevant chunks
    ↓
Rerank/contextualize
    ↓
AI generates explanation
    ↓
Official source shown
```

The answer must not be presented as an official rule unless supported by authoritative information.

---

# 15. Service Data Retrieval Flow

Example:

> "Show my JEE answer key."

```text
User request
      ↓
Current service = JEE
      ↓
Identify capability:
GET_ANSWER_KEY
      ↓
Check authentication
      ↓
Check authorization
      ↓
Call authorized service integration
      ↓
Receive result
      ↓
Verify response
      ↓
Display answer key
```

If unavailable:

```text
No authorized capability
      ↓
Tell user
      ↓
Provide official portal/fallback
```

---

# 16. AI Transformation Flow

Example:

> "Explain question 17 from my answer key."

```text
User request
      ↓
Retrieve answer key / question data
      ↓
Identify question 17
      ↓
Retrieve available authoritative information
      ↓
AI explains
      ↓
Clearly distinguish:
Official answer
vs
AI explanation
```

AI explanation must not modify the underlying official data.

---

# 17. Action Flow

Example:

> "Help me apply for JEE."

```text
Intent
 ↓
Identify JEE
 ↓
Check capability:
PREPARE_APPLICATION
 ↓
Check eligibility
 ↓
Load authorized profile
 ↓
Load authorized documents
 ↓
Map fields
 ↓
Identify missing information
 ↓
Ask user only for missing decisions/data
 ↓
Prepare application
 ↓
Review
 ↓
Confirmation
 ↓
Execute authorized action
 ↓
Receive authoritative result
 ↓
Show result
```

---

# 18. Eligibility Flow

```text
User requests service
       ↓
Identify current official requirements
       ↓
Load authorized relevant profile data
       ↓
Evaluate structured rules
       ↓
 ┌───────────────┴───────────────┐
 ↓                               ↓
Eligible                     Not eligible
 ↓                               ↓
Continue                     Explain reason
 ↓                            + source
Application
```

---

# 19. Application Pre-Fill Flow

```text
Application starts
      ↓
Retrieve required fields
      ↓
Match fields to authorized profile
      ↓
 ┌──────────────┴──────────────┐
 ↓                             ↓
Data available              Data missing
 ↓                             ↓
Pre-fill                   Ask user
 ↓                             ↓
Show source/status          Record answer
 └──────────────┬──────────────┘
                ↓
             Review
```

---

# 20. Document Flow

```text
Service requires document
       ↓
Check authorized document store
       ↓
Document exists?
   ↙           ↘
 YES            NO
 ↓               ↓
Check validity   Identify missing
 ↓               ↓
Reuse           Ask user / official path
```

The platform must not share a document without appropriate authorization.

---

# 21. Consent Flow

```text
Service requires data
       ↓
Determine required fields
       ↓
Show:
 ├── What
 ├── Why
 └── Where
       ↓
User consent required?
   ↙          ↘
 YES           NO
 ↓              ↓
Request       Continue under
consent       applicable basis
 ↓
User decision
 ├── Allow
 └── Decline
```

Declining should produce a clear consequence rather than hidden failure.

---

# 22. Recommendation Flow

Example: JEE centre

```text
Service exposes choices
      ↓
Retrieve available official options
      ↓
Apply permitted recommendation factors
      ↓
Present options
      ↓
Explain recommendation
      ↓
User selects
      ↓
Selection becomes application data
```

AI recommendation does not automatically become the user's final choice.

---

# 23. Payment Flow

```text
Application ready
      ↓
Display official amount
      ↓
User chooses payment
      ↓
Authorized payment mechanism
      ↓
Payment processing
      ↓
Underlying service confirms?
   ↙             ↘
 YES              NO
 ↓                 ↓
Success          Not successful/
                 unknown
 ↓                 ↓
Continue         Explain accurately
```

No payment success may be displayed without confirmation.

---

# 24. Submission Flow

```text
Application prepared
      ↓
Review
      ↓
User confirms
      ↓
Authorization/security checks
      ↓
Submit through authorized integration
      ↓
Receive authoritative response
      ↓
 ┌───────────────┴───────────────┐
 ↓                               ↓
Success                       Failure
 ↓                               ↓
Show confirmation             Explain failure
Store status                  No false success
```

---

# 25. Application Status Flow

```text
My Applications
      ↓
Select application
      ↓
Request status
      ↓
Authorized status source
      ↓
Retrieve
      ↓
Display current official status
```

If status cannot be retrieved:

> "Sanchay could not verify the current status."

Never guess.

---

# 26. Official Portal Fallback

When Sanchay cannot perform an action:

```text
User requests action
      ↓
Capability unavailable
      ↓
Explain limitation
      ↓
Provide official portal
      ↓
Open official destination
```

The user should understand that they are leaving Sanchay or moving to an external official system.

---

# 27. JEE End-to-End Traditional Flow

```text
Home
 ↓
Education
 ↓
NTA
 ↓
JEE Main
 ↓
Eligibility
 ↓
Application
 ↓
Personal Information
 ↓
Contact
 ↓
Documents
 ↓
Exam Centre
 ↓
Review
 ↓
Confirmation
 ↓
Authorized Submission
 ↓
Application Status
```

---

# 28. JEE End-to-End AI Flow

User:

> "Help me apply for JEE."

```text
AI identifies JEE
      ↓
Current official requirements
      ↓
Eligibility
      ↓
Eligible
      ↓
Load profile
      ↓
Load documents
      ↓
Pre-fill
      ↓
Ask only:
 ├── Missing information
 └── User decisions
      ↓
Prepare application
      ↓
Review
      ↓
"Submit it"
      ↓
Ask confirmation
      ↓
User confirms
      ↓
Authorized submission
      ↓
Return authoritative result
```

---

# 29. JEE Answer Key Flow

Example:

> "Show me my answer key."

```text
Open Sanchay AI
      ↓
Current / selected service = JEE
      ↓
Identify ANSWER_KEY capability
      ↓
Authenticate
      ↓
Authorize
      ↓
Retrieve candidate answer key
      ↓
Display
      ↓
User:
"Explain question 17."
      ↓
Retrieve question/answer context
      ↓
AI explains
```

If the answer key is not yet officially available:

```text
Check official source
      ↓
Not available
      ↓
Tell user
      ↓
Optionally provide official announcement/status
```

---

# 30. JEE Result Flow

```text
User:
"Show my JEE result."

 ↓

Identify RESULT capability
 ↓
Authorize
 ↓
Retrieve result
 ↓
Display result
 ↓
Optional:
"Explain my percentile"
```

AI may explain the result but must distinguish interpretation from official result values.

---

# 31. Ayushman End-to-End Flow

```text
Home
 ↓
Healthcare
 ↓
Ayushman Bharat
 ↓
Overview / Eligibility
 ↓
Current official requirements
 ↓
Profile/data where authorized
 ↓
Eligibility guidance
 ↓
Required documents
 ↓
Supported action
 ↓
Review / confirmation
 ↓
Authorized action OR official portal
```

---

# 32. Generic "Any Service" Flow

The platform should support this abstract journey:

```text
Citizen
 ↓
Intent
 ↓
Service Discovery
 ↓
Service Context
 ↓
Capability Discovery
 ↓
Knowledge / Data / Document / Action
 ↓
Authorization
 ↓
Execution
 ↓
Verification
 ↓
Result
```

This is the core scalability flow.

---

# 33. Service Capability Flow

Every service can be thought of as:

```text
                SERVICE
                   │
       ┌───────────┼───────────┐
       ↓           ↓           ↓
   KNOWLEDGE      DATA       ACTIONS
       │           │           │
      RAG       APIs/Data    Tools/APIs
       │           │           │
       └───────────┼───────────┘
                   ↓
               Sanchay AI
```

The AI chooses the correct path based on the user's request.

---

# 34. Failure Flows

## Government Service Unavailable

```text
Request
 ↓
Integration failure
 ↓
"Government service is currently unavailable."
 ↓
Try again / Official portal
```

## AI Cannot Understand

```text
Request
 ↓
Low confidence / ambiguous
 ↓
Clarifying question
 ↓
User clarifies
 ↓
Continue
```

## RAG Has No Reliable Answer

```text
Question
 ↓
No authoritative evidence
 ↓
Do not fabricate
 ↓
Explain limitation
 ↓
Official source/search fallback
```

## Action Not Supported

```text
Request
 ↓
Capability missing
 ↓
Explain
 ↓
Official portal / manual path
```

---

# 35. Security Failure Flow

```text
Requested protected action
      ↓
Authentication / authorization check
      ↓
FAIL
      ↓
Do not execute
      ↓
Safe error
      ↓
Recovery/authentication path
```

AI must never bypass this flow.

---

# 36. Context Loss / Recovery

If the platform loses temporary UI context:

```text
Current session
 ↓
Context unavailable
 ↓
Recover from service/session state
 ↓
If recovery succeeds → Continue
 ↓
If not → Ask user to select service/context
```

The system must never silently execute an action against the wrong service.

---

# 37. Mobile Flow

On mobile:

```text
Home
 ↓
Department
 ↓
Service
 ↓
Floating AI
 ↓
Full-screen AI workspace
 ↓
Close / Back
 ↓
Return to same service state
```

The AI button must not interfere with navigation or critical controls.

---

# 38. Complete Sanchay Citizen Journey

```text
LOGIN
  ↓
HOME
  ↓
DEPARTMENT / SEARCH / AI
  ↓
SERVICE
  ↓
SERVICE CONTEXT
  ↓
KNOWLEDGE / DATA / DOCUMENTS / ACTION
  ↓
ELIGIBILITY
  ↓
PROFILE + AUTHORIZED DATA
  ↓
APPLICATION / SERVICE ACTION
  ↓
AI ASSISTANCE WHEN NEEDED
  ↓
REVIEW
  ↓
CONFIRMATION
  ↓
AUTHORIZED EXECUTION
  ↓
OFFICIAL RESULT
  ↓
APPLICATION / SERVICE STATUS
```

---

# 39. Core UX Rule

At any point:

```text
Traditional UI
      ↕
Sanchay AI
      ↕
Same service state
```

The user should never feel that switching interfaces means starting over.

---

# 40. Flow Success Criteria

The flow system succeeds when:

1. Users can discover services traditionally.
2. Users can discover services through AI.
3. AI understands current context.
4. AI can retrieve official knowledge.
5. AI can retrieve authorized service data.
6. AI can execute authorized service actions.
7. Unsupported actions receive safe fallbacks.
8. Eligibility prevents unnecessary work.
9. Profile data reduces repeated entry.
10. Documents can be reused when authorized.
11. Consequential actions require confirmation.
12. Traditional and AI interfaces share the same service state.
13. New services can use the same generic flow model.

---

# 41. Flow Boundary

This document defines **user and system interaction sequences**.

It does not define:

- API endpoint names
- Database schema
- LLM provider
- Vector database
- Hosting
- Programming language
- Detailed implementation

Those belong to later technical documents.
