# DreamTree: Project Summary & Build Guide (v2)

> **Purpose:** This is the canonical project document. It contains everything needed to understand DreamTree before building or reading detailed specs. It supersedes the original Planning Document v2 and Project Summary v1.

---

## Table of Contents

1. [Project Vision](#1-project-vision)
2. [Technical Foundation](#2-technical-foundation)
3. [Product Structure](#3-product-structure)
4. [User Journey](#4-user-journey)
5. [Data Architecture Overview](#5-data-architecture-overview)
6. [The 14 Connections](#6-the-14-connections)
7. [Reference Content & Attribution](#7-reference-content--attribution)
8. [Component Inventory](#8-component-inventory)
9. [Document Index](#9-document-index)
10. [Build Sequence](#10-build-sequence)
11. [Outstanding Work](#11-outstanding-work)

---

## 1. Project Vision

### What DreamTree Is

DreamTree is a personal development webapp that guides users through a structured workbook for career clarity and life planning. It transforms a comprehensive career workbook into a conversational, chat-like experience.

### Who It's For

- Career changers seeking clarity
- Recent graduates planning their path
- Professionals reassessing their direction
- Anyone doing intentional life design

### Core Experience

Users progress through a 3-part, 15-module workbook via a chat-like interface. Content appears like received messages; user responses appear like sent messages. The experience is:

- **Conversational** — feels like texting through a workbook
- **Continuous** — seamless flow between exercises and modules
- **Persistent** — auto-saves after every input
- **Personal** — "magic moments" where the app remembers and connects inputs across exercises

### Key Differentiators

| Feature | Description |
|---------|-------------|
| **Anonymous start → claim later** | Cookie-based persistence, optional account creation |
| **Data sovereignty** | User-derived encryption keys for PII |
| **Magic moments** | 14 connection points where past inputs surface meaningfully |
| **Standalone tools** | Unlock progressively, work embedded or standalone |
| **Visual customization** | User-chosen colors and fonts from first interaction |

---

## 2. Technical Foundation

### Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Framework** | Next.js | Static export |
| **Hosting** | Cloudflare Pages | Via GitHub integration |
| **Database** | Cloudflare D1 | SQLite, serverless |
| **Auth** | Email/password (MVP) | Passkey/wallet post-MVP |

### Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| D1 over Postgres | Simpler, serverless, sufficient for workbook data |
| Static export | Fast, cheap, globally distributed |
| SQLite JSON fields | Flexible response storage without schema migrations |
| User-derived encryption | True privacy — even we can't read their PII |

---

## 3. Product Structure

### The Workbook: 3 Parts, 15 Modules

#### Part 1: Roots — Understanding Your Foundation
*Purpose: Document history, skills, preferences, values*

| Module | Focus | Key Outputs |
|--------|-------|-------------|
| 1.1 Work Factors 1 | Skills, Talents, Knowledge | Top 10 transferable skills, Top 10 soft skills, Knowledge inventory, **MBTI type** |
| 1.2 Work Factors 2 | Environment, People, Compensation | Location preferences, Workplace profile, BATNA |
| 1.3 Priorities & Flow | Work factor priorities, Peak performance | Prioritized factors, Flow patterns |
| 1.4 Love | Relationships, Meaning | Family/community/world/self reflections **(PII encrypted)** |
| 1.5 Health | Mental health, Discipline | Daily practice routines |

#### Part 2: Trunk — Connecting Past to Future
*Purpose: Clarify values, develop mindset, generate possibilities*

| Module | Focus | Key Outputs |
|--------|-------|-------------|
| 2.1 Finding the Light | Life assessment, Values | Value compass |
| 2.2 Reality | Mindset, Action, Reframing | Creator's mentality, Failure reframes |
| 2.3 Landmarking | Generating possibilities | 3 idea trees, 9+ job possibilities |
| 2.4 Launching Pad | Planning options | 3 five-year plans with scores |
| 2.5 Story Weaving | Professional identity | Identity story, SOARED stories, **Competency level assessment** |

#### Part 3: Branches — Reaching Into the World
*Purpose: Create presence, build network, take action*

| Module | Focus | Key Outputs |
|--------|-------|-------------|
| 3.1 Intentional Impressions | Research, Content | Analyzed job postings, Resume drafts |
| 3.2 Constructing the Projection | Online presence | Clean Google results, LinkedIn, Resume |
| 3.3 Networking | Building relationships | Contact lists, Conversation skills |
| 3.4 Research | Company investigation | Company profiles |
| 3.5 Action | Active networking | Growing network, Opportunities |

*See DreamTree.md for complete workbook content.*

### The 10 Tools

| Tool | Purpose | Has Reminder | Frequency |
|------|---------|--------------|-----------|
| **Flow Tracker** | Daily energy/engagement tracking | Yes | Daily |
| **Failure Reframer** | Setback reframing | Yes | Weekly |
| **Budget Calculator** | Income/expense tracking **(PII encrypted)** | Yes | Monthly |
| **SOARED Story** | Structured achievement story framework | Yes | Monthly |
| **Networking Prep** | Contact tracking, interview prep **(PII encrypted)** | Yes | Daily |
| **Job Prospector** | Job opportunity tracking | Yes | Daily |
| **List Builder** | Dynamic lists for adding/removing/reordering | No | — |
| **Ranking Grid** | Pairwise comparison for prioritizing | No | — |
| **Idea Tree** | Word association brainstorming | No | — |
| **Resume Builder** | Resume construction from SOARED/skills | No | — |

**Dual-Context Design:** Every tool works both:
- **Embedded** — within conversation flow, tied to specific exercise
- **Standalone** — dedicated page, user-created instances

**Daily Dos:** Tools with reminders appear in Daily Dos only after being unlocked. Reminders check if the tool has been used within its frequency period.

### Visual Customization

Users choose at onboarding (editable in settings):

| Option | Choices |
|--------|---------|
| **Background** | Ivory, Creamy Tan, Brown, Bluish Charcoal, Black |
| **Text** | Ivory, Creamy Tan, Brown, Bluish Charcoal, Black |
| **Font** | Clean Sans, Classic Serif, Typewriter, Handwritten, Vintage Display |

---

## 4. User Journey

### 4.1 User States

```
[New Visitor]
      │
      ▼
[Anonymous] ──── cookie-based ID, data in D1
      │
      │ claims account (email/password)
      ▼
[Claimed] ──── auth linked, data migrated
      │
      ├── same device return ──► seamless (cookie valid)
      │
      └── new device return ──► login ──► load account data
                                    │
                                    └── no data found ──► JSON restore or fresh start
```

### 4.2 Progression

- **Strictly linear** — must complete exercise N-1 to access exercise N
- **Module completion** — all required exercises answered
- **Tool unlocks** — specific exercises unlock specific tools
- **Ongoing activities** — Flow tracking (daily), Failure reframing (weekly), etc. continue through Part 3
- **Daily Dos** — "Resume Workbook" card shown until workbook complete; tool reminders shown for unlocked tools

### 4.3 Merge Logic

When data merge is needed (JSON restore, account claim with existing data):

- **Module-level granularity** — newer `last_modified_at` wins
- **Standalone tools** — additive merge with hash dedup
- **Simple rule, clearly communicated** — no complex UI

### 4.4 External Assessment

Module 1.1.2 sends users to 16personalities.com. They return and enter their MBTI type via typeahead selector. App then surfaces their type's name and career-focused summary.

### 4.5 Competency Assessment

Module 2.5.1 guides users through a 15-competency self-assessment:
- For each competency, user sees definition and 5 unlabeled level descriptions
- User selects best fit (scored 1-5)
- Results calculate category averages (Delivery, Interpersonal, Strategic) and overall average
- Strengths: score ≥ floor(overall avg + 0.3)
- Improvements: score ≤ floor(overall avg - 0.3)
- Annual re-assessment prompt based on `assessed_at` timestamp

---

## 5. Data Architecture Overview

### 5.1 Database: 19 Tables

| Category | Tables |
|----------|--------|
| **Core** (6) | users, auth, emails, sessions, user_settings, user_modules |
| **Response** (4) | exercise_responses, tool_instances, user_competency_scores, exercise_skills |
| **Content** (2) | exercise_content, exercise_sequence |
| **Reference** (5) | personality_types, competencies, competency_levels, skills, tool_types |
| **Attribution** (2) | references, content_sources |

*See Section 12 and Schema Diagram for complete details.*

### 5.2 Exercise ID Pattern

All exercise-related data uses versioned IDs:

```
"1.1.1.v1" = Part 1, Module 1, Exercise 1, Version 1
```

This supports:
- Content versioning without breaking historical responses
- A/B testing different content variants
- Deprecation without data loss

### 5.3 Auth Model (MVP)

- Email/password only
- Password hashed (bcrypt/Argon2)
- Passkey/wallet deferred to post-MVP

### 5.4 Encryption Model

```
[Password] → [Wrapping Key] → unwraps → [Data Key] → encrypts → [PII Fields]
```

- Random data key generated at account creation
- Wrapped with password-derived key
- Password change = re-wrap, no re-encryption
- Password recovery = account saved, **PII lost forever**

### 5.5 What's Encrypted (PII)

| Location | Content |
|----------|---------|
| Module 1.4 "Love" | Deeply personal reflections |
| Budget Calculator | Income, expenses, financial numbers |
| Networking Prep | Names, contact info, relationship notes |
| Settings/Profile | Address, geographic data |

### 5.6 JSON Export/Import

- User can export all their data as JSON
- Import triggers module-level merge (newer wins)
- Encrypted fields exported as-is (need password to decrypt)
- No auth data in export
- Custom skills exported separately

---

## 6. The 14 Connections

"Magic moments" where the app remembers and surfaces past inputs. These are **queries, not tables** — defined in code at `/src/config/connections/`.

| # | From | To | What Happens |
|---|------|-----|--------------|
| 1 | 1.5 Joy Sources | 2.1 Intro | "Remember when you said [X]? Let's find jobs that give you that feeling." |
| 2 | 1.3 Superpowers | 2.2 Strength filtering | Superpowers feed into strength-based job filtering |
| 3 | 1.2 Purpose Verbs | 2.3 SOARED framing | Purpose verbs echo in story framing |
| 4 | 1.4 Love | 2.4 Non-negotiables | Love section informs non-negotiables |
| 5 | 1.1 Childhood dreams | 2.5 Reflection | "What would 8-year-old you think?" |
| 6 | 2.1 Job interests | 3.1 Networking targets | Job interests guide networking |
| 7 | 2.3 SOARED stories | 3.2 Resume bullets | Stories become resume content |
| 8 | 2.2 Strengths | 3.3 Interview talking points | Strengths frame interview prep |
| 9 | 1.3 + 2.3 | 3.4 "Tell me about yourself" | Superpowers + SOARED = elevator pitch |
| 10 | 2.5 Decision framework | 3.5 Offer evaluation | Framework echoes in evaluating offers |
| 11 | Throughout | 3.1 Networking prep | All self-knowledge feeds networking |
| 12 | 1.5 Joy sources | Budget tool | Joy vs. expenses alignment check |
| 13 | 2.4 Non-negotiables | Job Prospector | Non-negotiables filter job listings |
| 14 | 1.2 + 1.3 | Failure Reframer | Purpose + Superpowers reframe setbacks |

---

## 7. Reference Content & Attribution

### 7.1 Reference Tables

| Table | Rows | Content | Usage |
|-------|------|---------|-------|
| `personality_types` | 16 | Code, name, career-focused summary | Surface user's type after MBTI selection |
| `competencies` | 15 | Name, definition, category, relevant_modules | Competency assessment exercise |
| `competency_levels` | 75 | Level descriptions per competency (15 × 5) | Unlabeled options in selector, results display |
| `skills` | 500+ | Master list + user custom skills | Searchable tagger for SOARED stories, etc. |
| `tool_types` | 10 | Tool config, reminder settings | Metadata, unlock points, Daily Dos logic |

### 7.2 Attribution System

- `references` table stores all sources with Chicago-formatted citations
- `citation_number` assigned by first appearance in content (for `[n]` links)
- `short_citation` for tooltip display
- `metadata` JSON stores influence, key concepts, application notes
- `content_sources` join table maps exercises → references
- Usage types: direct_quote, framework, concept, adaptation, inspiration
- Enables: Credits page with anchor links, inline citation tooltips, legal audit

### 7.3 Categories in Bibliography

- Career Development & Life Design
- Personality & Career Fit
- Psychology, Performance & Mindset
- Communication & Storytelling
- Networking & Social Theory
- Skills Assessment & Classification
- Organizational Frameworks
- Online Resources

### 7.4 Key Sources to Attribute

| Source | Usage |
|--------|-------|
| Sydney Fine | Three-category skills framework |
| OECD | Competency Framework (15 competencies, 5 levels) |
| Csikszentmihalyi | Flow theory |
| Burnett & Evans | Designing Your Life |
| Various (see DreamTree.md) | Full bibliography in workbook |

---

## 8. Component Inventory

### 8.1 Existing Specs (Sections 1-10)

| Category | Components |
|----------|------------|
| **Shell & Nav** | AppShell, NavBar, NavItem, Header, Breadcrumb, InputArea |
| **Conversation** | MessageContent, MessageUser, TypingEffect, Timestamp, Divider, ConversationThread |
| **Form Inputs** | TextInput, TextArea, Slider, Checkbox, CheckboxGroup, RadioGroup, Select |
| **Structured Inputs** | ListBuilder, RankingGrid, TagSelector, SkillTagger, SOAREDForm |
| **Feedback** | Button, Toast, Tooltip, SaveIndicator, ProgressMarker, Badge, EmptyState |
| **Overlays** | Backdrop, Modal, TOCPanel |
| **Onboarding** | OnboardingFlow, WelcomeStep, NameStep, VisualsStep, CompleteStep |
| **Tools** | ToolPage, ToolInstanceCard, FlowTracker, FailureReframer, BudgetCalculator, IdeaTree, JobProspector, ResumeBuilder, NetworkingPrep |
| **Pages** | Dashboard (with DailyDoList, DailyDoCard), Profile, Settings, Workbook |

### 8.2 New Components (Section 11)

| Component | Purpose | Spec Status |
|-----------|---------|-------------|
| **InlineCitation** | `[n]` marker with tooltip, links to credits page | ✅ Complete |
| **CreditsPage** | Flat alphabetical bibliography, anchor targets | ✅ Complete |
| **MBTISelector** | Typeahead for personality type selection | ✅ Complete |
| **MBTIResultDisplay** | Code + name + summary display | ✅ Complete |
| **CompetencyLevelSelector** | 15-step assessment flow | ✅ Complete |
| **CompetencyResultsDisplay** | Averages, level, strengths/improvements | ✅ Complete |
| **CompetencyCard** | Contextual single-competency display | ✅ Complete |
| **SkillsBrowser** | Searchable, filterable skill picker | ✅ Complete |
| **AddCustomSkillModal** | Add user-created skills | ✅ Complete |

### 8.3 Updated Components (Section 12)

| Component | Update | Spec Status |
|-----------|--------|-------------|
| **Daily Dos Logic** | Unlock checks, monthly frequency, data transformation | ✅ Complete |

---

## 9. Document Index

### Data Architecture

| Document | Content |
|----------|---------|
| **Section 11: User/Auth & Encryption** | User states, merge logic, timestamps, auth model, encryption approach, PII scope |
| **Section 12: Database Schema (Revised v2)** | All 19 tables with SQL, indexes, cascade deletes, JSON export, seed files, Daily Dos logic, competency logic |
| **Schema Diagram (v2)** | Visual overview, relationships, data flow, competency flow, skills tagging flow |

### Component Specifications

| Document | Content |
|----------|---------|
| **Section 1: Component Philosophy** | Core principles, nav model, component inventory, z-index, breakpoints |
| **Section 2: Shell & Navigation** | AppShell, NavBar, Header, Breadcrumb |
| **Section 3: Conversation Components** | Messages, typing effect, timestamps, thread |
| **Section 4: Form Inputs** | Text, textarea, slider, checkbox, radio, select |
| **Section 5: Structured Inputs** | ListBuilder, RankingGrid, TagSelector, SOAREDForm |
| **Section 6: Feedback & Status** | Button, toast, tooltip, save indicator, progress |
| **Section 7: Overlays** | Backdrop, modal, TOC panel |
| **Section 8: Onboarding** | Flow, steps, progress indicator |
| **Section 9: Tool Components** | Tool architecture, all 10 tools |
| **Section 10: Page Components** | Dashboard, Profile, Settings, Workbook |
| **Section 11: Credits, Assessments & Skills** | InlineCitation, CreditsPage, MBTI components, Competency components, SkillsBrowser |
| **Section 12: Daily Dos Updates** | Updated tool_types, SQL queries, data transformation |

### Design & Content

| Document | Content |
|----------|---------|
| **Design System** | Colors, typography, spacing, tokens |
| **DreamTree.md** | Complete workbook content |
| **Credits & Sources** | Full bibliography with metadata |
| **Planning Document v2** | Original planning (superseded by this summary) |

---

## 10. Build Sequence

### Phase 1: Foundation
1. Database schema (D1 setup, all 19 tables)
2. Auth system (email/password, session management, encryption key handling)
3. Anonymous user flow (cookie → users table → sessions table)

### Phase 2: Core API
4. User settings CRUD (including personality_type)
5. Exercise responses CRUD (with encryption for PII fields)
6. Module progress tracking (timestamps, completion logic)
7. Tool instances CRUD (with hash generation for dedup)

### Phase 3: Data Operations
8. JSON export endpoint
9. JSON import with merge logic
10. Account claim flow (anonymous → authenticated)
11. Password change (re-wrap data key)
12. Password recovery (with PII loss)
13. Account deletion (cascade delete)

### Phase 4: UI Shell
14. App shell, navigation, routing
15. Onboarding flow
16. Basic conversation container

### Phase 5: Conversation & Inputs
17. Message components (content, user responses)
18. Form input components (text, textarea, slider, etc.)
19. Structured inputs (ListBuilder, RankingGrid, etc.)

### Phase 6: Tools
20. Tool page shell and instance cards
21. Individual tools (parallelizable: SOARED, FlowTracker, etc.)

### Phase 7: Pages & Polish
22. Dashboard (with Daily Dos, updated logic)
23. Profile page
24. Settings page
25. Connections config (the 14 magic moments)

### Phase 8: Reference & Attribution
26. Seed scripts for reference tables (personality_types, competencies, competency_levels, skills, references)
27. Credits/Sources page with InlineCitation
28. MBTI selector and result display
29. Competency selector and results display
30. Skills browser/tagger with custom skill support

### Phase 9: Edge Cases & Hardening
31. Returning user flows (new device, no data, etc.)
32. Error handling, loading states
33. Accessibility audit
34. Annual competency re-assessment prompt

### Phase 10: Go Live
35. Performance optimization
36. Final QA
37. Launch 🚀

---

## 11. Outstanding Work

### Specs Complete ✅

| Item | Status |
|------|--------|
| Credits/Sources Page | ✅ Section 11 |
| MBTI Selector | ✅ Section 11 |
| MBTI Result Display | ✅ Section 11 |
| Competency Level Selector | ✅ Section 11 |
| Competency Results Display | ✅ Section 11 |
| Competency Card | ✅ Section 11 |
| Skills Browser/Tagger | ✅ Section 11 |
| Add Custom Skill Modal | ✅ Section 11 |
| Daily Dos Logic (updated) | ✅ Section 12 |

### Seed Data Preparation

| Data | Rows | Source | Work Needed |
|------|------|--------|-------------|
| Personality types | 16 | Custom career-focused | Write summaries |
| Competencies | 15 | OECD framework | Extract definitions |
| Competency levels | 75 | OECD framework | Extract 5 descriptions per competency |
| Skills | 500+ | Workbook content | Extract and categorize |
| Tool types | 10 | Defined in spec | Create seed file |
| References | 20+ | Credits & Sources doc | Structure with citation_number, Chicago format |
| Exercise content | ~200 | DreamTree.md | Parse and structure |
| Content sources | ~50 | Manual mapping | Map exercises → references |

### Decisions Deferred

| Item | Notes |
|------|-------|
| Passkey/wallet auth | Requires solving encryption key derivation |
| AI features (paid tier) | Phase 4+ |
| Partner/collab features | Post-MVP |
| Tree metaphor visuals | Dashboard animation post-MVP |
| Skill suggestions based on MBTI/competencies | Future enhancement |

---

## Quick Reference

### Exercise ID Format
```
"1.1.1.v1" = Part.Module.Exercise.Version
```

### Encrypted PII Locations
- Module 1.4 (Love)
- Budget Calculator
- Networking Prep
- Geo data in settings

### Daily Reminders (with unlock check)
| Tool | Frequency |
|------|-----------|
| Flow Tracker | Daily |
| Networking Prep | Daily |
| Job Prospector | Daily |
| Failure Reframer | Weekly |
| Budget Calculator | Monthly |
| SOARED Story | Monthly |

### Competency Threshold Logic
```
Strength: score ≥ floor(overall_avg + 0.3)
Improvement: score ≤ floor(overall_avg - 0.3)
```

### Merge Rule
Newer `last_modified_at` wins at module level. Standalone tools are additive with hash dedup.

### Table Count
19 tables total (6 core, 4 response, 2 content, 5 reference, 2 attribution)

---

*Document Version: 2.0*  
*Last Updated: January 2025*  
*Status: Ready for build*
