# 04 — UI/UX Design Specification
# SANCHAY — Unified Government Digital Service Platform

**Product:** Sanchay  
**Design Direction:** Modern, trustworthy, citizen-centric, scalable  
**MVP:** NTA / JEE Main + Ayushman Bharat  
**Version:** 1.0  
**Status:** Foundation Design Specification

---

# 1. Design Objective

Sanchay should visually communicate:

> **"This is one platform containing many government services."**

The design must NOT feel like:

- A JEE website with extra features
- An Ayushman website with a chatbot
- A ChatGPT clone
- A generic SaaS dashboard
- A traditional government portal

It should feel like a **modern public digital-service platform** capable of containing hundreds of services.

---

# 2. Primary UX Principle

> **Traditional navigation is the foundation. AI is the contextual assistance layer.**

The user should be able to complete supported tasks without AI.

AI should appear when the citizen wants:

- Help
- Explanation
- Discovery
- Eligibility guidance
- Form assistance
- Recommendations
- Automation

---

# 3. Information Architecture

The core hierarchy is:

```text
Sanchay
│
├── Home
│
├── Departments
│   ├── Education
│   │   ├── NTA
│   │   │   ├── JEE Main
│   │   │   └── CUET
│   │   ├── CBSE
│   │   ├── UGC
│   │   └── Scholarships
│   │
│   ├── Healthcare
│   │   └── Ayushman Bharat
│   │
│   ├── Employment
│   ├── Transport
│   ├── Benefits
│   └── Other Domains
│
├── My Applications
├── My Documents
├── My Profile
│
└── Sanchay AI
```

This hierarchy must be visually understandable from the first interaction.

---

# 4. Design Personality

### Desired

- Calm
- Trustworthy
- Clean
- Modern
- Premium
- Accessible
- Familiar
- Spacious
- Professional

### Avoid

- Excessive gradients
- Excessive glassmorphism
- Neon "AI" aesthetics
- Dense government-form appearance
- Too many cards
- Excessive animations
- Overly playful illustrations
- Dark patterns

The visual language should inspire **confidence**, especially because users are handling identity and government services.

---

# 5. Layout System

The primary desktop experience should use a persistent left navigation area with a flexible main content area.

Concept:

```text
┌──────────────┬─────────────────────────────────────────┐
│              │                                         │
│   SANCHAY    │             Main Content                │
│              │                                         │
│   Home       │                                         │
│   Departments│                                        │
│              │                                         │
│   Education  │                                         │
│   Healthcare │                                         │
│   Employment │                                         │
│              │                                         │
│   ─────────  │                                         │
│   Applications│                                        │
│   Documents  │                                         │
│   Profile    │                                    ◯ AI │
│              │                                         │
└──────────────┴─────────────────────────────────────────┘
```

On mobile, the navigation should transform into a compact menu/drawer.

---

# 6. Global Navigation

Primary navigation:

- Home
- Departments
- My Applications
- My Documents
- My Profile

Optional secondary navigation:

- Help
- Notifications
- Settings
- Support

The navigation should remain predictable across all services.

---

# 7. Home Page

The homepage should prioritize **service discovery**, not the chatbot.

### Suggested structure

```text
Header
  ↓
Welcome / Search
  ↓
Departments
  ↓
Popular Services
  ↓
Recommended Services
  ↓
Recent Applications
  ↓
Helpful Information
```

### Example

```text
What do you need today?

[ Search government services... ]

Departments

[ Education ] [ Healthcare ]
[ Employment ] [ Transport ]
[ Benefits  ] [ Certificates ]

Popular Services

JEE Main
Ayushman Bharat
Scholarships
...
```

The AI entry point remains available as a small floating control.

---

# 8. Department Page

Example:

```text
Education
Government education services

────────────────────────────────

Popular

NTA
National Testing Agency

[ JEE Main ]
[ CUET ]

Other Services

[ Scholarships ]
[ CBSE ]
[ UGC ]
...
```

The department page should communicate that many organizations/services belong to the same government domain.

---

# 9. Organization Page

Example:

```text
NTA
National Testing Agency

Services

[ JEE Main ]
[ CUET ]
[ Other Services ]

Official Information
```

The organization page should be lightweight.

Users should quickly reach the actual service.

---

# 10. Service Page

Every integrated service should have a standardized structure.

Example:

```text
← Education / NTA

JEE Main
National Testing Agency

[ Start Application ] [ Ask Sanchay AI ]

Overview
Eligibility
Requirements
Documents
Application
Status
Official Website
```

The exact tabs/actions vary by service.

---

# 11. Integrated Service Principle

When an authorized integration exists, the service should feel like part of Sanchay.

Avoid:

```text
"CLICK HERE TO LEAVE SANCHAY"
```

Instead:

```text
Sanchay
  → Education
    → NTA
      → JEE Main
```

The underlying government system may still be external, but the citizen-facing experience should remain coherent.

When direct integration is unavailable, use clear language:

> **Continue on the official NTA website**

and clearly identify the destination as official.

---

# 12. Persistent AI Button

The AI should be represented by a **small circular floating control**.

Concept:

```text
┌──────────────────────────────────────┐
│                                      │
│                              ◯       │
│                              AI      │
└──────────────────────────────────────┘
```

Requirements:

- Always accessible in supported views
- Visually noticeable but not dominant
- Does not cover important controls
- Accessible by keyboard
- Accessible to screen readers
- Has clear open/close state

The button should feel like:

> **"Help is always here."**

not:

> **"This website is a chatbot."**

---

# 13. Sanchay AI Interface

When the user opens AI, the interface should transition into a **modern conversational workspace inspired by familiar chat applications**.

It should not copy another product's branding or exact interface.

### Desktop concept

```text
┌─────────────────────────────────────────────────────────┐
│ ← Back to JEE Main                         Sanchay AI   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              Sanchay AI                                 │
│                                                         │
│ User                                                     │
│ "Can I apply for JEE?"                                  │
│                                                         │
│ Sanchay AI                                               │
│ "Based on the current requirements and the information   │
│ available in your profile, you can proceed..."          │
│                                                         │
│ Source                                                   │
│ NTA Information Bulletin                                │
│                                                         │
│─────────────────────────────────────────────────────────│
│ Ask Sanchay anything...                           🎙     │
└─────────────────────────────────────────────────────────┘
```

The AI experience should feel familiar, calm, and focused.

---

# 14. AI Context Indicator

The AI interface should subtly show what context it is using.

Example:

```text
Context

Education
NTA
JEE Main
Application
```

This increases trust and helps the user understand why the AI is responding to a particular service.

The context indicator should be compact, not distracting.

---

# 15. AI Contextual Behavior

If the user is on:

```text
Education
→ NTA
→ JEE Main
→ Application
→ Personal Information
```

and asks:

> "What does this mean?"

The AI should understand the current page/field.

If the user navigates to:

```text
Healthcare
→ Ayushman Bharat
→ Eligibility
```

the same AI instance now operates with the new context.

The user should not have to start a separate conversation for every service.

---

# 16. AI Response Components

AI responses should support distinct visual blocks for:

### Explanation

Normal conversational answer.

### Official Source

```text
Official source
NTA Information Bulletin
[View source]
```

### Action

```text
[Continue application]
```

### Confirmation

```text
You're about to submit this application.

[Cancel] [Confirm]
```

### Warning

```text
This information could not be verified
from an authoritative source.
```

These states should be visually distinguishable.

---

# 17. Eligibility UI

## Eligible

```text
✓ You can proceed

JEE Main application

Your available information satisfies
the supported eligibility checks.

[Continue]
```

## Not eligible

```text
You cannot proceed

Reason

The current applicable requirement
is not satisfied.

[View official requirement]
```

The UI should explain rather than simply show red/green indicators.

---

# 18. Application UI

Applications should avoid overwhelming users with giant forms.

Use progressive sections.

```text
JEE Main Application

████████████████░░░░  80%

✓ Personal Information
✓ Contact
✓ Documents
✓ Photograph

→ Exam Centre
→ Review
```

The system should show which information was:

- Already available
- Automatically populated
- Entered by the user
- Still required

---

# 19. Auto-Filled Fields

Auto-filled fields should be visually understandable.

Example:

```text
Full Name
┌──────────────────────────┐
│ Parv Mittal              │ ✓ From profile
└──────────────────────────┘
```

The user should be able to inspect/edit permitted values.

Avoid excessive animation.

A subtle confirmation state is sufficient.

---

# 20. Missing Information

Instead of displaying dozens of empty fields:

```text
We already have most of your information.

We only need:

1. Exam city preference
2. Category confirmation
3. Final review
```

This reinforces Sanchay's core value proposition.

---

# 21. Recommendation UI

Example:

```text
Choose your exam centre

Recommended for you

★ Noida
  Closest based on your selected location

Other options

Delhi
Ghaziabad
Greater Noida

[Select]
```

Recommendations must never appear as mandatory choices.

---

# 22. Profile Design

The profile should feel like a **citizen information and permissions center**, not a social profile.

Sections:

```text
My Profile

Personal Information
Contact Information
Address
Education
Documents
Connected Identity Methods
Data Sharing & Permissions
Security
```

---

# 23. Data Sharing UI

The user should be able to understand where information goes.

Example:

```text
Data Sharing

NTA / JEE Main
✓ Basic information
✓ Education information
✓ Required documents

Ayushman Bharat
✓ Required identity information
✓ Required documents

[Manage permissions]
```

Avoid technical privacy language where simpler wording works.

---

# 24. Applications Dashboard

Example:

```text
My Applications

JEE Main
NTA
Application
In Progress
[Continue]

Ayushman Bharat
Healthcare
Completed
[View]

View all →
```

The dashboard should become increasingly useful as Sanchay supports more services.

---

# 25. Documents Dashboard

Example:

```text
My Documents

Identity
  Aadhaar / approved identity reference

Education
  Class 10 Certificate
  Class 12 Certificate

Other
  Photograph
  Signature

[Add document]
```

Sensitive values should be appropriately masked.

---

# 26. Official Source Component

Use a standardized source component:

```text
┌───────────────────────────────────────┐
│ Official source                       │
│ NTA Information Bulletin              │
│ Updated: [date if available]          │
│                                       │
│ [View official source]                │
└───────────────────────────────────────┘
```

This should visually communicate authority without overwhelming the user.

---

# 27. Confirmation Design

Consequential actions need strong confirmation.

Example:

```text
Review before submission

You are about to submit:
JEE Main Application

Name: ...
Exam city: ...
Documents: ...

This action cannot be undone.

[Go Back]                 [Confirm Submission]
```

Payment should follow a similar pattern.

---

# 28. Error States

Errors should be:

- Clear
- Calm
- Actionable
- Honest

Example:

```text
We couldn't connect to NTA right now.

Your application has NOT been submitted.

You can:
[Try again]
[Open official NTA portal]
```

Never show false success.

---

# 29. Loading States

Use meaningful status messages instead of generic spinners.

Examples:

```text
Checking official requirements...
Finding your service...
Preparing your application...
Checking available information...
Retrieving official sources...
```

For long AI operations, show progress or streaming.

---

# 30. Typography

Typography should prioritize:

- Readability
- Clear hierarchy
- Accessible sizes
- Strong headings
- Comfortable body text

Suggested hierarchy:

```text
Display
H1
H2
H3
Body
Secondary
Caption
```

Avoid overly decorative typefaces.

---

# 31. Color System

The final palette should communicate:

- Trust
- Government/public-service credibility
- Accessibility
- Clear action states

Use a restrained base palette with a distinct Sanchay accent.

Do not rely on color alone to communicate:

- Success
- Warning
- Error
- Eligibility
- Status

Use icons, text, and structure as well.

Exact color tokens should be finalized during visual implementation.

---

# 32. Spacing & Components

The design system should define reusable tokens for:

- Spacing
- Radius
- Typography
- Shadows
- Borders
- Buttons
- Inputs
- Cards
- Navigation
- Tabs
- Dialogs
- Toasts
- Status badges

The system should favor consistency over visual novelty.

---

# 33. Component Architecture

Reusable components should include concepts such as:

```text
<SanchaySidebar />
<DepartmentCard />
<OrganizationCard />
<ServiceCard />
<ServiceHeader />
<ServiceNavigation />
<OfficialSource />
<AIButton />
<AIWorkspace />
<AIMessage />
<AIContext />
<EligibilityResult />
<ConsentRequest />
<DocumentCard />
<ApplicationProgress />
<ApplicationSection />
<RecommendationCard />
<ConfirmationDialog />
<GovernmentPortalLink />
<ApplicationStatus />
```

Exact component names may change during implementation.

---

# 34. Responsive Design

## Desktop

- Persistent sidebar
- Large content area
- Floating AI button
- Multi-column service/recommendation layouts

## Tablet

- Compact navigation
- Flexible content grid
- Floating AI control

## Mobile

- Bottom navigation or compact drawer
- Full-width content
- AI button positioned safely above bottom navigation
- Simplified cards
- Progressive application steps

---

# 35. Accessibility

The UI SHALL aim for strong accessibility.

Design requirements include:

- Keyboard navigation
- Visible focus states
- Semantic structure
- Screen-reader labels
- Sufficient contrast
- Large touch targets
- Reduced-motion consideration
- Clear error messages
- Accessible AI controls
- Accessible dialogs
- No color-only status communication

---

# 36. Trust UX

Sanchay handles sensitive government tasks, so trust should be visible.

The interface should make clear:

- Which service the user is accessing
- Whether information comes from an official source
- What data is being shared
- What the AI is doing
- Whether an action is simulated or real
- Whether the official government system confirmed an action

Trust should be built through clarity rather than excessive government branding.

---

# 37. Scalability as a Visual Principle

A user should be able to look at the Sanchay homepage and understand:

> JEE and Ayushman are examples of services, not the entire product.

Therefore:

**Good:**

```text
Education
  JEE Main
  CUET
  Scholarships
  CBSE
  ...

Healthcare
  Ayushman Bharat
  ...
```

**Bad:**

```text
JEE Website
+
Ayushman Website
```

The design must always communicate the platform ecosystem.

---

# 38. AI vs Traditional UX Rule

Neither interface should feel like a secondary feature.

```text
Traditional UI
    ↕
Same service state
    ↕
Contextual AI
```

A citizen can start traditionally, open AI, get assistance, close AI, and continue exactly where they were.

Likewise, an AI-driven workflow can transition into traditional UI when visual review is more appropriate.

---

# 39. Design Success Criteria

The design succeeds when:

1. A new user immediately understands that Sanchay contains many government services.
2. Departments are obvious.
3. Services are easy to discover.
4. JEE and Ayushman feel like services inside one ecosystem.
5. Traditional navigation feels complete.
6. AI is visible but not intrusive.
7. Opening AI feels familiar.
8. AI clearly understands the current context.
9. Official information looks trustworthy.
10. Application automation feels helpful rather than risky.
11. Users always know what is happening.
12. The interface works on mobile and desktop.
13. The design can scale from 2 services to hundreds without changing its fundamental structure.

---

# 40. Design Principle

> **Sanchay should feel like the front door to government services, not another government website.**

---

# 41. Design Boundary

This document defines **experience, interface, interaction, visual-system, and accessibility requirements**.

It does not define:

- Database structure
- API contracts
- Backend architecture
- RAG implementation
- Cloud infrastructure
- Authentication implementation

Those belong in the corresponding technical documents.


---

# 42. Service Capability UI

The UI should make it clear that each service is more than an information page.

A service may expose:

```text
Information
Documents
Applications
Results
Status
Actions
```

The exact set depends on the service.

---

# 43. AI Action Responses

Sanchay AI should distinguish between:

### Information

> "The current JEE application deadline is..."

### Retrieved Data

> "I found your JEE answer key."

### Action in Progress

> "I'm preparing your application..."

### Action Completed

> "Your application was successfully submitted."

### Action Unavailable

> "Sanchay cannot perform this action through the current integration. You can continue on the official portal."

These states should never be visually ambiguous.

---

# 44. AI Result Cards

When AI retrieves service data, use structured result components where useful.

Example:

```text
JEE Answer Key

Paper: JEE Main Session ...
Candidate: ...
Available: Yes

[Open]
[Ask AI About This]
```

For a result:

```text
JEE Result

Score: ...
Percentile: ...
Status: ...

[View Details]
[Ask Sanchay AI]
```

Sensitive information should be appropriately protected.

---

# 45. AI Action Confirmation

For consequential actions:

```text
Sanchay AI

I have prepared your application.

Before I submit it:

✓ Personal details
✓ Documents
✓ Exam centre
✓ Required fields

[Review]
[Confirm Submission]
```

The interface must distinguish **preparation** from **actual execution**.

---

# 46. Capability Availability

Service pages MAY display available capabilities.

Example:

```text
JEE Main

[Apply]
[Check Eligibility]
[View Result]
[Answer Key]
[Admit Card]
[Ask AI]
```

Only capabilities actually supported by the integration should be shown as active actions.
