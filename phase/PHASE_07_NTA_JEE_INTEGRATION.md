# PHASE 07 — JEE SERVICE RECREATION & AI INTEGRATION
# SANCHAY — Unified Government Digital Service Platform

**Phase:** 7  
**Status:** Next  
**Depends On:** Phase 6 — AI Orchestrator & Tool Authorization  
**Primary Goal:** Recreate the important user-facing parts of the JEE Main service inside Sanchay, preserve a familiar/traditional way of using the service, and add a contextual AI layer that understands the JEE service, its official information, and the user's current screen.

---

# 1. THE ACTUAL VISION

Sanchay should NOT simply build another generic JEE application form.

Sanchay should make JEE Main feel like a **service inside Sanchay**.

The user should be able to use it traditionally:

```text
Sanchay
  ↓
Education
  ↓
NTA
  ↓
JEE Main
  ↓
Information
Syllabus
Information Bulletin
FAQ
Question Papers
Public Notices
Documents
Results / relevant candidate services
Application / candidate services
```

while also having Sanchay AI available at any point.

The core idea is:

```text
                JEE MAIN INSIDE SANCHAY

                     JEE SERVICE
                          │
              ┌───────────┴───────────┐
              ↓                       ↓
       TRADITIONAL MODE           AI MODE
              │                       │
       Browse / click / read     Ask / understand /
       / use services            retrieve / assist
              │                       │
              └───────────┬───────────┘
                          ↓
                    SAME SERVICE
                    SAME SOURCES
                    SAME CONTEXT
```

The AI should make the traditional experience easier, not replace it.

---

# 2. OFFICIAL JEE SERVICE REFERENCE

The current official JEE Main site exposes major sections including:

- Home
- About Us
- Information
  - Syllabus
  - Information Bulletin
- FAQ
- Question Papers
- Candidates' Corner / e-Services
- Archive
- Public Notices
- Documents
- Contact

The official site also publishes current documents such as information bulletins, syllabi, public notices, answer keys, recorded response-sheet notices, result/NTA-score notices, and other candidate information.

Use the official JEE Main website as the authoritative reference for the service structure and official content.

Do NOT blindly copy the entire website.

Recreate only the important user-facing functionality required for the Sanchay experience.

---

# 3. THREE LAYERS OF PHASE 7

Phase 7 has three layers.

## Layer 1 — JEE Service Recreation

Recreate the important JEE experience inside Sanchay.

## Layer 2 — Traditional Usage

The user can navigate and use the recreated service normally without AI.

## Layer 3 — AI Augmentation

The AI understands:

- The JEE service
- The current section
- The current page
- Official JEE knowledge
- Available Sanchay citizen context
- Available capabilities

and can help the user understand or perform authorized tasks.

---

# 4. WHAT WE ARE NOT BUILDING

Do NOT:

- Recreate every page of the official website.
- Clone every backend system of NTA.
- Claim to be NTA.
- Copy protected/private functionality.
- Bypass CAPTCHA.
- Bypass NTA authentication.
- Reverse engineer private APIs.
- Automatically submit real applications without an authorized integration.
- Pretend a mock action is a real government action.

This is a **Sanchay service experience based on official public information and authorized capabilities**.

---

# 5. JEE SERVICE HOME

Create an authentic-looking JEE Main service homepage inside Sanchay.

It should feel familiar to someone who already uses the JEE Main website while still following Sanchay's design system.

Suggested structure:

```text
┌─────────────────────────────────────────────────────────────┐
│ SANCHAY                                  Profile            │
├─────────────────────────────────────────────────────────────┤
│ Education / NTA / JEE Main                                  │
│                                                             │
│                 JOINT ENTRANCE                              │
│                 EXAMINATION (MAIN)                          │
│                                                             │
│ Official JEE Main Service                                   │
│                                                             │
│ [Information] [Syllabus] [Bulletin] [FAQ]                  │
│ [Question Papers] [Public Notices] [Documents]              │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Important Notices                                      │ │
│ │ • Latest official update                              │ │
│ │ • Latest examination notice                            │ │
│ │ • Latest result / answer-key notice                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Candidate Services                                          │
│ [Application / Candidate Services] [Status]                 │
│                                                             │
│                                             ◯ AI            │
└─────────────────────────────────────────────────────────────┘
```

The exact visual design should be polished and authentic, not a pixel-perfect copy.

---

# 6. IMPORTANT JEE SECTIONS

Recreate the main sections users actually need.

At minimum:

```text
Information
Syllabus
Information Bulletin
FAQ
Question Papers
Public Notices
Documents
Candidate Services
Application / Relevant Service Entry
```

Where appropriate, support:

```text
Answer Keys
Response Sheets
Results / NTA Scores
Admit Cards
Examination City Information
Correction Information
```

These should be driven by official indexed data where available.

---

# 7. AUTHENTICITY

The service should feel believable and familiar.

Use:

- JEE Main terminology
- NTA terminology
- Government-service information hierarchy
- Official source references
- Clear notices
- Document lists
- Candidate-focused navigation

But do NOT misrepresent Sanchay as NTA.

Clearly identify:

```text
Provided through Sanchay
Source: National Testing Agency / JEE Main official sources
```

where appropriate.

---

# 8. TRADITIONAL MODE

The user must be able to use the JEE service without AI.

Example:

```text
User wants syllabus.

Education
 ↓
NTA
 ↓
JEE Main
 ↓
Syllabus
 ↓
View / Download
```

Another:

```text
User wants answer key.

Education
 ↓
NTA
 ↓
JEE Main
 ↓
Public Notices / Documents
 ↓
Answer Key
 ↓
View
```

Another:

```text
User wants result information.

Education
 ↓
NTA
 ↓
JEE Main
 ↓
Candidate Services / Results
 ↓
View
```

The AI is an enhancement, not a mandatory dependency.

---

# 9. AI ENTRY POINT

The global Sanchay AI trigger remains available.

Example:

```text
                         ◯
                        AI
```

It should be small, circular, persistent, and unobtrusive.

When the user opens it from JEE:

```text
Context:
Education
→ NTA
→ JEE Main
```

When the user opens it from a specific section:

```text
Context:
Education
→ NTA
→ JEE Main
→ Information Bulletin
```

When inside a candidate/application flow:

```text
Context:
Education
→ NTA
→ JEE Main
→ Candidate Service
→ Application
```

---

# 10. THE AI'S MAIN PURPOSE

The AI should make the traditional website easier to use.

It should answer questions like:

> What is the JEE eligibility?

> Where is the information bulletin?

> What documents do I need?

> Has the answer key been released?

> Where can I find my response sheet?

> What does this notice mean?

> What does this section of the form mean?

> Find the official information about this.

> Take me to the relevant section.

> Help me complete this task.

---

# 11. AI MUST USE OFFICIAL JEE KNOWLEDGE

The AI should not simply rely on its pretrained knowledge.

Architecture:

```text
Official JEE Sources
        ↓
Phase 5 Ingestion
        ↓
Knowledge Sources
        ↓
Chunks / Embeddings
        ↓
Retrieval
        ↓
Evidence[]
        ↓
AI
        ↓
Answer + Citation
```

The official JEE website and its official documents should be treated as the authoritative source for JEE-specific information.

Examples of useful source categories:

```text
Information Bulletin
Syllabus
Public Notices
Documents
FAQ
Question Papers
Answer Keys
Response Sheet Notices
Result / NTA Score Notices
Admit Card Notices
Advisories
Application Notices
```

---

# 12. "TRAIN AI" MEANING

Do NOT train/fine-tune the Qwen model from scratch for Phase 7.

When we say:

> "Train the AI on the JEE site"

the intended implementation is:

```text
Official JEE Content
        ↓
Ingestion
        ↓
Cleaning
        ↓
Chunking
        ↓
Embeddings
        ↓
pgvector
        ↓
Retrieval
        ↓
Qwen
```

This is RAG grounding.

The model should use current official information retrieved at runtime.

This allows JEE information to be updated without retraining the model.

---

# 13. JEE SOURCE REGISTRY

Create/register authoritative JEE sources using the Phase 5 source architecture.

At minimum support:

```text
JEE Main Official Website
JEE Information Bulletin
JEE Syllabus
JEE FAQ
JEE Public Notices
JEE Documents
JEE Question Papers
JEE Answer Keys
JEE Response Sheet Notices
JEE Result / Score Notices
JEE Candidate Advisories
```

Store source metadata such as:

```text
Source URL
Title
Publisher
Service
Publication Date
Last Checked
Content Type
Authority Level
Version
```

Do not duplicate the Phase 5 knowledge architecture.

---

# 14. SOURCE AUTHORITY

For JEE-specific facts, prioritize:

```text
Official NTA / JEE Main source
        ↓
Official JEE document
        ↓
Official public notice
        ↓
Other approved official source
```

Do not treat random websites as authoritative JEE sources.

If an answer cannot be verified from approved official sources:

```text
I couldn't verify this from the available official JEE sources.
```

---

# 15. CITATIONS

AI answers should cite the source used.

Example:

```text
According to the JEE Main 2026 Information Bulletin,
...

Source:
JEE Main 2026 Information Bulletin
```

The citation should allow the user to open/view the relevant source where possible.

---

# 16. CURRENT-SCREEN CONTEXT

The AI must know the current Sanchay page.

Example:

User is viewing:

```text
JEE Main
→ Information Bulletin
```

User asks:

> What is this document about?

The AI should understand that "this document" refers to the current bulletin.

Do not make the user repeatedly explain where they are.

---

# 17. SCREEN CONTEXT PAYLOAD

Conceptually:

```json
{
  "department": "education",
  "organization": "nta",
  "service": "jee-main",
  "section": "information-bulletin",
  "route": "/education/nta/jee-main/information-bulletin"
}
```

Only send the context required for the current task.

---

# 18. AI NAVIGATION

The AI should be able to help users navigate the recreated JEE service.

Example:

User:

> Where is the syllabus?

AI:

```text
The official JEE Main syllabus is here.

[Open Syllabus]
```

The action should navigate to the corresponding Sanchay JEE section.

The AI must not invent routes.

Only registered Sanchay navigation actions may be executed.

---

# 19. AI RETRIEVAL TASKS

The AI should be capable of retrieving information from the JEE service.

Examples:

```text
"Show me the latest public notice."

"Find the 2026 information bulletin."

"Find the final answer key."

"Show me the official syllabus."

"Find the response-sheet notice."

"Has the result been released?"

"Show me the latest advisory."
```

The AI should use RAG and/or registered service capabilities.

---

# 20. ANSWER KEY / RESPONSE SHEET

This is an important example of the intended experience.

If official data exists:

```text
User:
"Find my answer sheet."

AI:
"I found the official response-sheet/answer-key
information for JEE Main 2026."

[Open Official Information]
```

If the user has authorized candidate credentials and an actual supported service capability exists:

```text
AI
 ↓
Authorized Candidate Capability
 ↓
Government/Mock Adapter
 ↓
Response Sheet
```

If no authorized integration exists:

```text
AI:
"I can show you the official response-sheet information,
but I can't access your private candidate record yet."
```

Never fabricate a response sheet.

---

# 21. APPLICATION EXPERIENCE

Phase 7 should NOT attempt to recreate every part of the NTA application portal.

Instead, build the **main useful application experience** inside Sanchay where appropriate.

Example:

```text
Start Application
        ↓
Basic Information
        ↓
Personal Information
        ↓
Academic Information
        ↓
Category
        ↓
Contact
        ↓
Documents
        ↓
Review
```

The traditional workflow should be understandable and usable.

---

# 22. AI-ASSISTED APPLICATION

This is where Sanchay becomes meaningfully different.

User:

> Fill this application for me.

Flow:

```text
User Request
    ↓
AI understands current JEE application
    ↓
Capability Resolver
    ↓
Required Application Fields
    ↓
Authorized Citizen Data
    ↓
Deterministic Auto-Fill
    ↓
Verification Flags
    ↓
User Review
```

The AI assists.

The backend controls the actual data mapping.

---

# 23. TRADITIONAL VS AI EXPERIENCE

The same task should be possible both ways.

Example:

## Traditional

```text
Find Information Bulletin
 ↓
Information
 ↓
Information Bulletin
 ↓
Open
```

## AI

```text
"Open the JEE information bulletin."

 ↓

AI

[Open Information Bulletin]
```

Another:

## Traditional

```text
Public Notices
 ↓
Find answer-key notice
 ↓
Open
```

## AI

```text
"Find the final answer key."

 ↓

AI retrieves the official notice

[Open Final Answer Key]
```

This demonstrates the value of Sanchay.

---

# 24. AI ACTIONS

The AI may perform only registered actions.

Potential actions:

```text
jee.open_section
jee.find_document
jee.search_official_information
jee.open_notice
jee.open_syllabus
jee.open_bulletin
jee.open_question_paper
jee.open_answer_key
jee.open_response_sheet_information
jee.open_result_information
jee.create_application
jee.autofill_application
jee.validate_application
jee.review_application
jee.get_application_status
```

All actions must pass through Phase 6 authorization.

---

# 25. CONSEQUENTIAL ACTIONS

High-risk actions require:

```text
AI proposes
 ↓
User reviews
 ↓
Explicit confirmation
 ↓
Backend re-validates
 ↓
Execute
 ↓
Audit
```

Never:

```text
AI
 ↓
Automatically submit
```

---

# 26. GOVERNMENT ADAPTER

Use the service adapter architecture.

```text
JEE Service
      ↓
NTA Adapter Interface
      ↓
Mock/Sandbox Adapter
```

If a legitimate official integration is available in the future:

```text
JEE Service
      ↓
NTA Adapter Interface
      ↓
Official NTA Integration
```

Do not bypass protected systems.

Do not reverse engineer private APIs.

Do not bypass CAPTCHA.

---

# 27. MOCK MODE

During development, clearly label simulated functionality.

Example:

```text
SANDBOX MODE

This action simulates the government service.
No real NTA submission will occur.
```

Use mock data only where necessary.

Never make mock data look like a real government transaction.

---

# 28. JEE SERVICE UI

Create a polished UI with:

- Sanchay global shell
- Department breadcrumb
- JEE identity
- Familiar information architecture
- Notice cards
- Document lists
- Candidate services
- Search
- AI trigger
- Contextual AI workspace

Do not make it look like a generic SaaS dashboard.

It should feel like:

```text
Government service
+
Modern Sanchay usability
+
AI assistance
```

---

# 29. VISUAL AUTHENTICITY

Use the official JEE site as a reference for:

- Information hierarchy
- Terminology
- Section names
- Service organization
- Notice/document presentation
- Candidate-focused navigation

Do NOT directly copy copyrighted design assets or pretend to be the official site.

Use Sanchay branding and design tokens.

---

# 30. JEE HOME INFORMATION

The home experience should prioritize:

```text
Latest Updates
Important Notices
Quick Links
Information
Syllabus
Information Bulletin
FAQ
Question Papers
Candidate Services
Documents
```

The user should be able to reach common tasks quickly.

---

# 31. SEARCH

Implement JEE-specific search.

Search should cover:

```text
Notices
Documents
Syllabus
Bulletins
FAQs
Question Papers
Answer Keys
Results / score notices
```

The search may combine:

```text
Traditional keyword search
+
RAG semantic search
```

Do not expose unrelated Sanchay services in JEE search unless explicitly requested.

---

# 32. AI SEARCH VS NORMAL SEARCH

Both should coexist.

Normal search:

```text
User types:
"answer key"

 ↓

Search results
```

AI:

```text
User asks:
"Which is the latest final answer key for Paper 1?"

 ↓

RAG
 ↓
Official evidence
 ↓
AI answer
 ↓
[Open]
```

The user can choose whichever interaction style they prefer.

---

# 33. AI CHAT UI

Use the existing Sanchay AI UI from Phase 6.

When opened from JEE:

```text
┌──────────────────────────────────────────────┐
│ Sanchay AI                                   │
│                                              │
│ Context                                      │
│ Education → NTA → JEE Main                   │
│                                              │
│ "What can I help you with?"                  │
│                                              │
│ You: Has the answer key been released?      │
│                                              │
│ AI: According to the latest official...     │
│                                              │
│ Sources                                      │
│ • Official JEE Main notice                   │
│                                              │
│ [Open Source]                                │
└──────────────────────────────────────────────┘
```

---

# 34. AI SHOULD UNDERSTAND THE SCREEN

Examples:

### On Syllabus

User:

> Is this the latest syllabus?

AI:

```text
I found the current indexed official syllabus.
Here is the source and publication information.

[Open Syllabus]
```

### On Information Bulletin

User:

> What does this mean for me?

AI:

Use the current bulletin context and official evidence.

### On Public Notice

User:

> Explain this notice.

AI:

Summarize the current notice and cite the source.

The AI should not require the user to copy-paste the page.

---

# 35. AI ACTION + INFORMATION COMBINATION

The AI should be able to combine:

```text
Understand
+
Retrieve
+
Navigate
+
Prepare
+
Act
```

Example:

> "I want to know whether I'm eligible and then start the application."

Flow:

```text
Eligibility Capability
 ↓
Official Evidence
 ↓
Eligibility Result
 ↓
AI Explanation
 ↓
User approval
 ↓
Application Capability
 ↓
Application Draft
```

Do not perform consequential actions without confirmation.

---

# 36. PERSONAL DATA BOUNDARY

When the user is only asking public JEE questions:

```text
Public JEE Knowledge
```

is enough.

Do NOT retrieve private citizen data.

When the user asks:

> Fill my application.

then:

```text
Application Requirements
 ↓
Required Citizen Fields
 ↓
Authorized Data
```

Only those fields should be accessed.

---

# 37. SOURCE / DATA FRESHNESS

JEE information changes.

Therefore the AI must prefer current indexed official sources.

Store:

```text
Published Date
Last Checked
Source Version
```

When two sources conflict:

```text
Prefer the newer authoritative official source.
```

If the conflict cannot be resolved:

```text
Tell the user that the official sources appear inconsistent.
```

Do not silently invent a resolution.

---

# 38. IMPORTANT NOTICE EXPERIENCE

Create a useful notice section.

Each notice can show:

```text
Title
Date
Category
Short description
Source
[Read]
```

Example categories:

```text
Application
Admit Card
Answer Key
Response Sheet
Result
Correction
Advisory
Examination City
General
```

The categories should be based on actual official JEE material rather than invented categories.

---

# 39. DOCUMENT EXPERIENCE

For official documents:

```text
Document title
Publication date
Category
Source
File type
[View]
```

For indexed documents:

```text
Ask AI about this document
```

The AI can explain the document using retrieved evidence.

---

# 40. QUESTION PAPERS

Support the important official question-paper experience.

Users should be able to:

```text
Select year
Select paper
Select date/shift where available
Open document
```

The AI may answer questions based on indexed official question-paper content.

Do not fabricate questions or answer keys.

---

# 41. ANSWER KEY EXPERIENCE

Support official answer-key discovery.

Example:

```text
Answer Keys

2026
 ├── Session 1
 ├── Session 2
 └── Paper / Subject

[View Official Answer Key]
```

Only show information that exists in the indexed official source.

---

# 42. RESULT EXPERIENCE

Where official result/score information is available:

```text
Results / NTA Scores

2026
 ├── Paper 1
 └── Paper 2

[View Official Information]
```

Private candidate result retrieval requires authorized candidate access.

---

# 43. AUTHENTICATION BOUNDARY

Public JEE information should remain accessible without requiring private identity information.

Private candidate actions require appropriate authentication.

Do NOT force Aadhaar or Sanchay UID into public browsing.

Use Sanchay identity only where the actual task requires citizen-specific access.

---

# 44. SECURITY

Follow Phase 6 and `11_SECURITY.md`.

Explicitly protect against:

- Cross-user candidate data access
- Unauthorized application access
- Unauthorized response-sheet access
- Forged candidate IDs
- Tool parameter tampering
- Mock/live confusion
- Government credential leakage
- Prompt injection
- Source poisoning
- Unauthorized private-data retrieval
- Unauthorized submission
- Confirmation replay

---

# 45. TESTING

## Traditional UX

Test:

```text
Home
 ↓
Information
 ↓
Syllabus
 ↓
Bulletin
 ↓
FAQ
 ↓
Question Papers
 ↓
Notices
 ↓
Documents
```

## AI

Test:

```text
Question
 ↓
Correct JEE context
 ↓
Correct RAG evidence
 ↓
Correct answer
 ↓
Citation
```

## Navigation

Test:

```text
"Open the syllabus"
"Open the latest notice"
"Find the answer key"
"Open the information bulletin"
```

## Task Assistance

Test:

```text
"Help me start my JEE application."
 ↓
Correct capability
 ↓
Correct application
```

## Privacy

Test:

```text
Public question
 ↓
No private citizen data retrieved
```

## Private task

```text
Application task
 ↓
Only required fields retrieved
```

## Security

Test:

- Unauthorized candidate access
- Cross-user data
- Prompt injection
- Tool escalation
- Confirmation replay
- Source poisoning

---

# 46. LOCAL DEMONSTRATION

Phase 7 MUST be visually demonstrable locally.

Run:

```text
Web
API
Workers
PostgreSQL
Redis
```

The user should be able to open the local Sanchay application and demonstrate:

```text
Sanchay
 ↓
Education
 ↓
NTA
 ↓
JEE Main
 ↓
Traditional navigation
 ↓
Open official information
 ↓
Open AI
 ↓
Ask JEE question
 ↓
Receive grounded answer
 ↓
See citation
 ↓
Navigate using AI
 ↓
Perform a safe mock task
```

Provide the actual localhost URL in the final report.

---

# 47. ACCEPTANCE CRITERIA

Phase 7 is complete only when:

### JEE Service

- JEE Main exists inside Education → NTA.
- Main important JEE sections exist.
- Service feels authentic and familiar.
- Sanchay branding remains clear.

### Traditional Mode

- User can navigate without AI.
- Information can be opened normally.
- Documents can be viewed.
- Notices can be browsed.
- Question papers can be browsed.
- Candidate-service boundaries are clear.

### AI

- AI opens globally.
- AI knows the JEE context.
- AI knows the current section/screen.
- AI answers JEE questions using official RAG evidence.
- AI provides citations.
- AI can navigate to registered sections.
- AI can assist with safe tasks.

### RAG

- Official JEE sources are indexed/registered.
- Information Bulletin is available to RAG.
- Syllabus is available to RAG.
- Public Notices are available to RAG.
- Documents are available to RAG.
- FAQ is available to RAG.
- Relevant answer-key/response-sheet/result information is available when indexed.
- Source freshness is represented.

### Actions

- Registered AI actions work.
- Backend authorization remains authoritative.
- Private data is least-privilege.
- Consequential actions require confirmation.
- Mock actions are clearly labelled.

### Quality

- Unit tests pass.
- Integration tests pass.
- Security tests pass.
- E2E tests pass.
- Typecheck passes.
- Lint passes.
- Production build passes.
- Local visual verification passes.

---

# 48. PHASE DELIVERABLES

```text
✓ JEE Main Sanchay service
✓ Education → NTA → JEE Main hierarchy
✓ Authentic main JEE experience
✓ Important JEE sections
✓ Traditional browsing mode
✓ Official information/document presentation
✓ JEE source registry
✓ JEE RAG grounding
✓ JEE contextual AI
✓ Current-screen context
✓ AI citations
✓ AI navigation
✓ AI information retrieval
✓ JEE document assistance
✓ Answer-key information support
✓ Response-sheet information support
✓ Result information support
✓ Application assistance foundation
✓ Authorized citizen-data auto-fill where supported
✓ Mock/sandbox task execution
✓ Government adapter boundary
✓ Security controls
✓ Local visual demonstration
✓ Tests
✓ Documentation updates
```

---

# 49. DOCUMENTATION SYNCHRONIZATION

After implementation update:

```text
00_CURRENT_STATE.md
00_DEVELOPMENT_ROADMAP.md
17_CHANGELOG.md
18_TASKS.md
```

Update where necessary:

```text
06_TECH_STACK.md
07_ARCHITECTURE.md
09_API.md
10_AI_RAG.md
11_SECURITY.md
12_IMPLEMENTATION.md
13_TESTING.md
14_DEPLOYMENT.md
15_MONITORING.md
19_DECISIONS.md
```

Documentation must distinguish:

```text
IMPLEMENTED
LIVE
SANDBOX / MOCK
SCAFFOLDED
PLANNED
```

Do not claim a live NTA integration if none exists.

---

# 50. PHASE EXIT GATE

The intended end-to-end experience is:

```text
                         SANCHAY
                            │
                         Education
                            │
                            NTA
                            │
                         JEE Main
                            │
             ┌──────────────┴──────────────┐
             ↓                             ↓
       Traditional                     AI Layer
          Mode                             │
             │                             ↓
      Browse / Search                Understand Context
      Read / Open                    Retrieve Official Data
      Use Service                    Answer
             │                       Cite
             │                       Navigate
             │                       Assist
             │                       Act
             └──────────────┬──────────────┘
                            ↓
                     Same JEE Service
```

The user should be able to experience the difference between:

```text
Using a government website normally
```

and:

```text
Using the same government service
with Sanchay AI understanding it.
```

That comparison is a central Phase 7 demonstration.

---

# 51. PHASE RULE

> **Do not replace the JEE service with a generic chatbot. Recreate the important service experience first, make it usable traditionally, then make Sanchay AI understand that service and help the citizen use it.**

---

# 52. ARCHITECTURAL PRINCIPLE: CITIZEN PROFILE IS THE SINGLE SOURCE OF TRUTH (ADR-024)

> **CITIZEN PROFILE IS THE SINGLE SOURCE OF TRUTH.**  
> Government applications consume authorized Profile data. Applications do not maintain a second editable copy of citizen identity/personal/academic information.  
> AI is read-only with respect to Profile data and cannot directly mutate Profile or Profile-derived application fields.

### Data Flow
```text
SANCHAY PROFILE (/profile)
         ↓
PROFILE VALIDATION
         ↓
APPLICATION FIELD MAPPING
         ↓
READ-ONLY APPLICATION VIEW (/services/jee-main/apply)
         ↓
USER REVIEW (Read-Only)
         ↓
USER CONFIRMATION (Statutory Declaration)
         ↓
SANDBOX SUBMISSION (SANDBOX-JEE-2026-XXXXXX)
```

### Core Tenets:
1. **Why Profile is the Source of Truth:** Prevents data fragmentation, desynchronization, and duplicate conflicting records across multiple government service applications.
2. **Read-Only Application Fields:** Personal identity, DOB, gender, category, contact, and academic qualifications are rendered strictly read-only in the application wizard with explicit provenance tags (`✓ From Sanchay Profile`, `⚠ Missing from Sanchay Profile`).
3. **Profile Correction Flow:** When data is incorrect or missing, users are guided to **My Profile** (`/profile`). Updating the profile immediately propagates the updated data across all active service applications without manual re-entry.
4. **Zero AI Profile Mutation:** Sanchay AI has read-only access to authorized profile credentials. AI cannot edit or claim to modify profile fields, and redirects all modification queries to My Profile with actionable navigation cards (`[Open My Profile]`).
5. **No Sensitive Data in Chat:** AI never requests Aadhaar numbers, full identity numbers, OTPs, or authentication secrets in conversational messages.


