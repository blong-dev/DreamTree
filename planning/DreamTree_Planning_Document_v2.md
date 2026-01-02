# DreamTree Webapp: Comprehensive Planning Document v2

## Executive Summary

DreamTree is a personal development webapp that guides users through a structured workbook for career clarity and life planning. The free tier delivers the complete workbook experience with intelligent heuristic connections. The paid tier adds AI coaching, agentic workflows, and advanced integrations.

**Key Differentiators:**
- Data sovereignty via cryptographic user keys
- Anonymous start → claim later flow (cookie-based persistence)
- Conversational/chat-like UX that feels like texting through a workbook
- "Magic moments" where the app remembers and connects user inputs across exercises
- Standalone tools that unlock progressively and integrate seamlessly
- User-customizable visual preferences from first interaction

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Initial | Original planning document |
| 2.0 | Current | Updated module structure from edited source files, design decisions, UX paradigm shift to conversational interface, color/typography specifications |

---

## Part 1: Confirmed Decisions

### Core Product Decisions

| Topic | Decision | Notes |
|-------|----------|-------|
| Framework | Next.js | Static export to Cloudflare Pages |
| Hosting | GitHub → Cloudflare Pages | Free tier friendly |
| Database | Cloudflare D1 | SQLite, serverless |
| Go-live target | After Phase 3 | Full free tier + polish |

### Data & Privacy Decisions

| Topic | Decision | Notes |
|-------|----------|-------|
| Mastery/Energy/Focus ratings | Slider UI → stored as ordinal (1-5) | Numeric storage for analysis |
| Resume upload | Moved to paid tier | AI-assisted parsing |
| Longform text parsing | Moved to paid tier | AI suggests skills |
| Skill tagging (free tier) | Manual tagging | Checkboxes from user's skill list |
| Love section (1.4) | Full PII treatment | Encrypted with user key, we store nothing readable |
| AI token budget | Decide at Phase 4 | Not needed for MVP |

### UX Paradigm Decisions

| Topic | Decision | Notes |
|-------|----------|-------|
| Primary UX | Conversational/chat-like | Exercises populate like text messages |
| Scrolling | Scroll up for previous content | Like a chat history |
| Navigation | Top nav links to index/TOC | Links back into conversation position |
| Timestamps | Once per day at session start | Minimal, not per message |
| Save behavior | Auto-save on input | No explicit save buttons |
| Module transitions | Titles and overviews inline | Seamless, don't break flow |
| Brainstorm/Idea Trees | Standalone tool | Unlocks at Module 2.3 |
| Partner/collab features | Post-MVP | Not in initial build |
| Tree metaphor visuals | Minimal for MVP | Dashboard growth animation post-MVP |

### Design Decisions

| Element | Decision | Specification |
|---------|----------|---------------|
| Background colors | User choice at onboarding | ivory, creamy tan, brown, bluish charcoal, black |
| Text colors | User choice at onboarding | Same palette as backgrounds |
| Font families | User choice at onboarding | Sans (Inter), Serif (Lora), Typewriter (Courier Prime) |
| Color values | See Design System section | Refined palette below |

---

## Part 2: Complete Module Structure (From Edited Source)

### Part 1: Roots — Understanding Your Foundation
**Purpose:** Document your history, skills, preferences, and values  
**Estimated Total Time:** 8-12 hours across 5 modules  
**Outputs:** Skills inventory, location preferences, flow tracking system, value compass

#### Module 1.1: Work Factors 1
**Focus:** Skills, Talents & Knowledge  
**Time:** 2-3 hours  
**Tools:** Ranking Grid, SOARED Framework, 16Personalities.com

| Exercise | Name | Key Activities | Output |
|----------|------|----------------|--------|
| 1.1.1 | Transferable Skills Inventory | Professional Talents Audit, Challenge Stories, SOARED Stories, Skills Organization, Top 10 Ranking | Top 10 ranked transferable skills |
| 1.1.2 | Self-Management Skills Assessment | MBTI Discovery, Dichotomy Self-Rating, Soft Skills ID, Top 10 Ranking, Evidence | Top 10 ranked soft skills |
| 1.1.3 | Knowledge Audit | Professional Knowledge, Educational Knowledge, Personal Interests, Mastery Rating | Complete knowledge inventory |

#### Module 1.2: Work Factors 2
**Focus:** Environment, People & Compensation  
**Time:** 1.5-2 hours  
**Tools:** Ranking Grid, Budget Template

| Exercise | Name | Key Activities | Output |
|----------|------|----------------|--------|
| 1.2.1 | Macro Environment Preferences | Location Desires, Past Analysis, Internet Research, Network Research, Top 10 Ranking | Top 10 ranked locations |
| 1.2.2 | Micro Environment Preferences | Workplace History, Ideal Workplace Description | Ideal workplace profile |
| 1.2.3 | People Preferences | Negative Influences, Positive Influences, Ideal Colleague/Supervisor Profile | Ideal people profile |
| 1.2.4 | Compensation Analysis | Salary History, Budget Creation, Benefits Assessment, Compensation Structure | BATNA, benefit values |

#### Module 1.3: Priorities, Ecstasy & Flow
**Focus:** Prioritizing work factors and understanding peak performance  
**Time:** 1 hour + ongoing daily tracking  
**Tools:** Ranking Grid, Flow Tracking Worksheet  
**Ongoing:** Daily flow tracking through Part 3

| Exercise | Name | Key Activities | Output |
|----------|------|----------------|--------|
| 1.3.1 | Work Factor Prioritization | Five-Factor Ranking | Prioritized work factors (1-5) |
| 1.3.2 | Flow State Mapping | Memorable Past, Recent Past, Present (ongoing) | Flow patterns, high-engagement activities |

#### Module 1.4: Love
**Focus:** Relationships, meaning, and what you care about  
**Time:** 1-1.5 hours  
**Privacy:** Full PII treatment - encrypted, user-key only

| Exercise | Name | Key Activities | Output |
|----------|------|----------------|--------|
| 1.4.1 | Family Reflection | Childhood Stories, Relationships Impact, Caregiving, Lessons | Family impact summary |
| 1.4.2 | Community Connection | Group ID, Involvement Analysis, Goals | Community profile |
| 1.4.3 | World Perspective | Global Issues, Historical Lessons, Cultural Learning, Future Vision | World values statement |
| 1.4.4 | Self-Understanding | Self-Critique, Strengths, Core Identity, Major Events, Greatest Gift | Self-understanding summary |

#### Module 1.5: Health
**Focus:** Mental health, discipline, and daily practice  
**Time:** 1.5 hours + ongoing daily practices  
**Ongoing:** Daily skill sharpening (15+ min), mindfulness (5-20 min), routine tracking

| Exercise | Name | Key Activities | Output |
|----------|------|----------------|--------|
| 1.5.1 | Skill Sharpening Practice | Skill Selection, Daily Practice (ongoing) | Daily practice routine |
| 1.5.2 | Grit Development | Role Models, Habit Assessment, Promise Keeping, Accountability | Accountability plan |
| 1.5.3 | Mindfulness Practice | Daily Mindfulness Setup | Mindfulness routine |
| 1.5.4 | Routine Establishment | Routine Design | Daily routine schedule |

---

### Part 2: Trunk — Connecting Your Past to Your Future
**Purpose:** Clarify values, develop mindset, generate possibilities, craft identity story  
**Estimated Total Time:** 8-12 hours across 5 modules

#### Module 2.1: Finding The Light
**Focus:** Current life assessment and values clarification  
**Time:** 1.5-2 hours

| Exercise | Name | Key Activities | Output |
|----------|------|----------------|--------|
| 2.1.1 | Life Assessment | Life Dashboard (work, play, love, health ratings) | Current state assessment |
| 2.1.2 | Values Exploration | Work Values (7 questions), Life Values (10 questions) | Work & life values statements |
| 2.1.3 | Values Alignment | Alignment Analysis, Value Compass Definition | Value compass |

#### Module 2.2: Reality
**Focus:** Mindset development, action orientation, reframing failure  
**Time:** 1.5-2 hours + ongoing weekly practice  
**Ongoing:** Weekly failure reframing through Part 3

| Exercise | Name | Key Activities | Output |
|----------|------|----------------|--------|
| 2.2.1 | Creator's Mentality | Mindset Character Profiles (5 mindsets) | Internalized mindsets |
| 2.2.2 | Action Triggers | Defining Success, Confronting Fear, Past Success, Resilience | Action plan |
| 2.2.3 | Reframing Failure | Failure Log & Reframe (ongoing weekly) | Growth opportunities log |

#### Module 2.3: Landmarking
**Focus:** Generating possibilities and making career choices  
**Time:** 2-2.5 hours  
**Tools:** Idea Tree Builder (standalone tool)

| Exercise | Name | Key Activities | Output |
|----------|------|----------------|--------|
| 2.3.1 | New Growth (Idea Trees) | Idea Tree Creation (3 trees from flow activities) | Three idea trees |
| 2.3.2 | Reading the Leaves | Combining Ideas into Jobs | 9+ job possibilities |
| 2.3.3 | Making Choices | Defining Three Options | Three defined career paths |

#### Module 2.4: Launching Pad
**Focus:** Planning and evaluating career options  
**Time:** 1.5-2 hours

| Exercise | Name | Key Activities | Output |
|----------|------|----------------|--------|
| 2.4.1 | Framework Development | Career Path Timelines, Career Path Titles | Three 5-year plans |
| 2.4.2 | Support Assessment | Option Assessments (resources, excitement, confidence, etc.) | Scored options (/100) |
| 2.4.3 | Unknowns Identification | Questions for each option | Research questions |

#### Module 2.5: Story Weaving
**Focus:** Crafting professional identity story  
**Time:** 2.5-3 hours  
**Tools:** SOARED Framework, Competency Framework

| Exercise | Name | Key Activities | Output |
|----------|------|----------------|--------|
| 2.5.1 | Choosing Your Level | Level Identification (1-5 competency) | Target professional level |
| 2.5.2 | Persuasive Storytelling | Motive, Purpose, Content, Audience | Story framework |
| 2.5.3 | Drafting Your Story | Identity Story (~1 page), Allegory (~1 page) | Complete identity narrative |

---

### Part 3: Branches — Reaching Into the World
**Purpose:** Create professional presence, build network, take action  
**Estimated Total Time:** 10-15 hours + ongoing daily practice

#### Module 3.1: Intentional Impressions
**Focus:** Researching employer language and creating targeted content  
**Time:** 2-3 hours  
**Tools:** Job Prospects Spreadsheet (Tab 1)

| Exercise | Name | Key Activities | Output |
|----------|------|----------------|--------|
| 3.1.1 | Initial Research | Job Description Collection, Spreadsheet Documentation | 2-10 analyzed postings |
| 3.1.2 | Writing Your Content | Keywords, Credibility, Job Title, Credentials, Summary, Headline | Resume content drafts |

#### Module 3.2: Constructing the Projection
**Focus:** Building professional presence across platforms  
**Time:** 3-4 hours  
**Required:** Professional photograph

| Exercise | Name | Key Activities | Output |
|----------|------|----------------|--------|
| 3.2.1 | Google Audit | Search Yourself, Clean Up Results | Clean search results |
| 3.2.2 | Facebook Update | Profile Picture, Privacy, Content Audit, About Section | Professional Facebook |
| 3.2.3 | Resume/CV Creation | Resume Draft | Draft resume |
| 3.2.4 | LinkedIn Optimization | Picture, Headline, Position, Profile, Experience, Groups | Complete LinkedIn |

#### Module 3.3: Networking
**Focus:** Building professional relationships  
**Time:** 4-5 hours to learn + ongoing daily practice  
**Tools:** Job Prospects Spreadsheet (Tabs 2-3)

| Exercise | Name | Key Activities | Output |
|----------|------|----------------|--------|
| 3.3.1 | Mindset in Practice | Awareness, Curiosity, Bias to Action, Reframing, Collaboration | Internalized mindsets |
| 3.3.2 | The Art of Conversation | Ten Principles for Better Conversations | Conversation skills |
| 3.3.3 | Target Information | Information gathering goals | Information checklist |
| 3.3.4 | The Process of Networking | Company type, list, research, gatekeepers, relationships | Contact lists |
| 3.3.5 | Preparation | Meeting Prep, Negotiation Prep | Meeting readiness |

#### Module 3.4: Research
**Focus:** Deep company and contact investigation  
**Time:** 3-4 hours per round

| Exercise | Name | Key Activities | Output |
|----------|------|----------------|--------|
| 3.4.1 | Company Research Rounds | Research Checklist (5 small, 3 medium, 2 large) | Company profiles |
| 3.4.2 | Contact Identification | Gatekeeper ID, Target Employee ID | Contact lists |

#### Module 3.5: Action
**Focus:** Active networking and relationship building  
**Time:** Ongoing daily  
**Goal:** Multiple quality job offers

| Exercise | Name | Key Activities | Output |
|----------|------|----------------|--------|
| 3.5.1 | LinkedIn Network Growth | Daily Connection Requests | Growing network |
| 3.5.2 | Outreach Campaign | Gatekeeper Outreach, Target Outreach | Active conversations |
| 3.5.3 | Informational Meetings | Prep Checklist, Meeting Notes | Industry knowledge |
| 3.5.4 | Relationship Development | Follow-Up System, Referral Tracking | Professional relationships |
| 3.5.5 | Opportunity Development | Opportunity Tracker | Insider knowledge |

---

## Part 3: Exercise Type Taxonomy

| # | Type | Description | UI Component | Data Shape |
|---|------|-------------|--------------|------------|
| 1 | Free-Form Reflection | Open text, no structure | Rich text editor | `{ text, wordCount }` |
| 2 | Structured List | Add items one by one | Dynamic list | `{ items: [] }` |
| 3 | Ranked List | Fixed slots from larger list | Ranking grid → list | `{ rankedItems: [] }` |
| 4 | Scale/Slider | Item + position 1-5 | Horizontal slider | `{ itemId, rating }` |
| 5 | Pairwise Comparison | Compare A vs B | Ranking Grid tool | `{ comparisons, result }` |
| 6 | Tracking/Logging | Repeated daily/weekly | Calendar form | `{ entries: [] }` |
| 7 | Grid/Matrix | Two-dimensional input | Interactive grid | `{ rows, columns, cells }` |
| 8 | External Assessment | Leave app, return with result | Link + input | `{ type, result }` |
| 9 | Branching/Conditional | Different paths | Skip logic | `{ condition, responses }` |
| 10 | Template Output | Pulls from prior inputs | Preview + fields | `{ template, fields }` |
| 11 | Research & Collection | Gather external info | Spreadsheet-like | Relational tables |
| 12 | Story Composition | Framework-guided (SOARED) | Guided sections | `{ components, narrative }` |

---

## Part 4: Data Model

### Core Entities (Simplified)

```
User
├── id (UUID, anonymous until account)
├── encryptedPII (name, email)
├── preferences { bgColor, textColor, fontFamily }
├── createdAt, accountCreatedAt, lastActiveAt

Profile (AI Context)
├── userId (anonymous ref)
├── personalityType (MBTI)
├── topSkills { transferable[], soft[], knowledge[] }
├── workFactorPriorities[]
├── valuesCompass
├── flowPatterns
├── careerOptions[]
├── identityStorySummary

Skill
├── id, name, type, masteryRating (1-5)
├── rank, evidence[], sourceExercise

Story (SOARED)
├── id, title, type
├── situation, obstacle, action, result, evaluation, discovery
├── skillsTagged[] (manual)

FlowEntry
├── date, activity, description
├── energy (1-5), focus (1-5), wasFlow

Company
├── name, size, industry, location
├── researchNotes, fitScore, status
├── contacts[], jobs[]

Contact
├── encryptedName (PII), role, type
├── connectionStrength, interactions[]

LoveSection (1.4)
├── userId, encryptedContent (entire section)
├── NOTE: Nothing readable stored
```

### D1 Schema (Key Tables)

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  encrypted_pii BLOB,
  public_key TEXT,
  preferences TEXT,
  created_at INTEGER,
  account_created_at INTEGER
);

CREATE TABLE responses (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  exercise_id TEXT,
  response_type TEXT,
  response_data TEXT,
  completed_at INTEGER
);

CREATE TABLE skills (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT,
  type TEXT,
  mastery INTEGER,
  rank INTEGER
);

CREATE TABLE flow_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  date TEXT,
  activity TEXT,
  energy INTEGER,
  focus INTEGER,
  was_flow BOOLEAN
);

CREATE TABLE love_section (
  user_id TEXT PRIMARY KEY,
  encrypted_content BLOB
);
```

---

## Part 5: Connection Map — "Magic Moments"

### Key Cross-Module Connections

| From | To | What Happens |
|------|-----|--------------|
| 1.1.1a Jobs list | 1.2.2a Workplace history | Pre-populate jobs |
| 1.1.1c SOARED stories | Skills list | Manual tag → skills extracted |
| 1.1.2a MBTI result | 1.1.2c Soft skills | Suggest type-typical skills |
| 1.2.4b Budget | 3.3.5 Negotiation | BATNA auto-populated |
| 1.3.2 Flow activities | 2.3.1 Idea tree starters | Seed brainstorm |
| 2.3.3 Career options | 3.1.1 Job titles | Seed job search |
| 2.5.3 Identity story | 3.2.3 Resume summary | Core narrative |
| 2.5.3 Identity story | 3.2.4 LinkedIn summary | Adapted version |
| 1.1.1 All skills | 3.1.1 Job matching | Auto-match requirements |
| 1.1.1c SOARED stories | 3.2.3 Resume bullets | Achievement bullets |
| 1.1.1c SOARED stories | 3.5.3 Interview prep | Story bank |

### Personalization Points

User's name appears in:
- Dashboard greeting
- Part/Module welcomes
- Milestone celebrations
- Generated documents
- AI coach (paid tier)

---

## Part 6: Standalone Tools

| Tool | Unlocks At | Purpose |
|------|------------|---------|
| Ranking Grid | 1.1.1e | Pairwise comparison |
| Flow Tracker | 1.3.2a | Daily energy/focus logging |
| Budget Calculator | 1.2.4b | BATNA calculation |
| Failure Reframer | 2.2.3 | Transform setbacks |
| Idea Tree Builder | 2.3.1 | Branching brainstorm |
| Job Prospects Tracker | 3.1.1 | 3-tab job search pipeline |
| Resume Builder | 3.2.3 | Generate from DreamTree data |
| Networking Prep | 3.3.5 | Meeting scripts, 19-min timer |

---

## Part 7: Design System

### Color Palette

| Name | Hex | Use |
|------|-----|-----|
| Ivory | `#FAF8F5` | Light background |
| Creamy Tan | `#E8DCC4` | Warm background |
| Brown | `#5C4033` | Earth background |
| Bluish Charcoal | `#2C3E50` | Dark background |
| Black | `#1A1A1A` | Darkest background |

### Typography

| Style | Font | Use |
|-------|------|-----|
| Clean Sans | Inter | Modern, professional |
| Classic Serif | Lora | Traditional, authoritative |
| Typewriter | Courier Prime | Workbook, authentic |

### Spacing Scale

```
xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px
```

---

## Part 8: Conversational UX

### Core Pattern

Content appears left-aligned like received messages. User responses appear right-aligned like sent messages. Scroll up for history.

```
[DreamTree content - left]
    "Skills are the most basic unit..."
                                    Thursday, January 2

[DreamTree prompt - left]
    Activity 1.1.1a
    "List every job you've had..."

                    [User response - right]
                    Marketing Coordinator
                    Barista
                    + Add another...
                                    [Done →]
```

### Navigation

Top bar shows: Part > Module > Exercise (clickable for TOC)

Menu (☰) opens table of contents with all Parts/Modules/Exercises. Current location highlighted. Clicking navigates to that point.

### Module Transitions

Inline, not page breaks. Summary of completed module, then header for new module, then content continues.

### Auto-Save

Save on every input (debounced). Subtle "Saved" indicator. No explicit save buttons.

---

## Part 9: Resource Content

| Resource | Surfaces At | Notes |
|----------|-------------|-------|
| List of Skills | 1.1.1, 1.1.2, 3.1.2 | Searchable sidebar |
| MBTI Descriptions | 1.1.2 | User's type only |
| Competency Framework | 2.5.1 | Relevant level only |
| SOARED Framework | 1.1.1c, 2.5.3, 3.5.3 | Quick reference |
| 10 Conversation Principles | 3.3.2 | Checklist card |
| 5 Designer Mindsets | 1.5, 2.2.1, 3.3.1 | Quick reference |

---

## Part 10: Build Phases

### Phase 1: Core Workbook (4-6 weeks)
- Landing page, onboarding
- Anonymous user flow
- Conversational UI framework
- Part 1 all modules
- Basic exercise types
- Ranking Grid tool
- Progress tracking
- Mobile responsive

### Phase 2: Complete Free Tier (4-6 weeks)
- Parts 2 and 3
- All 12 exercise types
- All 8 tools
- Account creation
- Data export
- Crypto key system

### Phase 3: Polish & Connections (2-4 weeks) — **GO LIVE**
- Full connection map
- Dashboard with insights
- Visualizations
- Skill tagging UI
- Resource integration
- Performance optimization

### Phase 4: Paid Tier Foundation (4-6 weeks)
- AI context system
- Resume parsing
- Basic AI coach
- Stripe integration
- Paywall

### Phase 5: Full AI Features (6-8 weeks)
- Skill extraction from text
- Socratic questioning
- Personalized recommendations
- Job market research
- Resume optimization
- Accountability check-ins

### Phase 6: Integrations (Ongoing)
- Calendar
- LinkedIn
- Job boards
- Google Drive

---

## Part 11: Source Files

### Module Files
- PART_1_MODULE_1_EDITED.md through PART_1_MODULE_5_EDITED.md
- PART_2_MODULE_1_EDITED.md through PART_2_MODULE_5_EDITED.md
- PART_3_MODULE_1_EDITED.md, PART_3_MODULE_2_EDITED.md
- PART_3_MODULE_3_PART1_EDITED.md, PART_3_MODULE_3_PART2_EDITED.md
- PART_3_MODULES_4_5_EDITED.md

### Resource Files
- CREDITS_AND_SOURCES_COMPLETE.md
- IntroandContents.md
- ListofSkills.md
- mbti-personality-types.md
- CompetencyFramework.md

---

## Appendix: Next Steps

Ready to proceed with:
- **B) Component Specification** — Every UI component with states
- **C) Data Schema Detail** — Full D1 tables, relationships, queries
- **D) Visual Design System** — Detailed tokens, component styles

Which would you like to tackle first?

---

*Document Version 2.0*
