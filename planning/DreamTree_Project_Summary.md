# DreamTree Project Summary

> **Purpose**: Onboarding document for Claude instances working with Braedon on DreamTree development.

---

## Working with Braedon

**Ask before assuming.** Braedon typically has more context than what's in the conversation. Before searching Google Drive, making architectural assumptions, or diving into implementation details, ask what files or context he can provide directly.

**He works fast and has done the thinking.** DreamTree has been in development conceptually for 7 years. The specs are comprehensive and intentional. Trust the existing documentation rather than suggesting alternatives unless asked.

**He's a solo founder building this himself.** No team to coordinate with. Decisions can be made quickly. The goal is rapid development—days, not months.

**Local files are current.** His most recent work is local, not in Google Drive. If he mentions having files, wait for him to share them.

---

## What DreamTree Is

DreamTree is a **career development web application** that transforms Braedon's comprehensive workbook into an interactive, chat-like experience. Users progress through a guided journey of self-discovery and career planning.

### The Metaphor

The application uses a tree metaphor:
- **Roots (Part 1)**: Self-knowledge—skills, values, personality, what energizes you
- **Trunk (Part 2)**: Connecting past to future—values alignment, decision frameworks, storytelling
- **Branches (Part 3)**: Reaching into the world—networking, job search, professional presence

### Core Experience

The interface feels like **texting through a guided workbook**. Content appears conversationally (left-aligned, no bubble), and users respond in message bubbles (right-aligned). The aesthetic draws from quality journals, modern messaging apps, and professional coaching.

**Key differentiator**: Data sovereignty. Users own their data. The core app will be open source, with paid AI coaching add-ons as the business model.

---

## Technical Architecture

### Stack
- **Framework**: Next.js → Cloudflare Pages
- **Database**: Cloudflare D1 (SQLite)
- **Deployment**: Cloudflare

### Database Overview (40 tables)

**Core (6 tables)**: users, auth, emails, sessions, user_settings, user_modules

**User Data - Tier 1 (16 tables)**: Structured, frequently-referenced data
- Profile & Identity: user_profile, user_values, user_skills, user_stories
- Experiences: user_experiences, user_experience_skills
- Preferences: user_locations, user_career_options, user_budget
- Job Search: user_companies, user_contacts, user_jobs
- Tools: user_flow_logs, user_idea_trees, user_idea_nodes, user_idea_edges

**User Data - Tier 2 (4 tables)**: Generic/catch-all
- user_responses, user_lists, user_list_items, user_checklists

**Assessments (1 table)**: user_competency_scores

**Content (7 tables)**: 
- stem (sequencing backbone)
- content_blocks (static content)
- prompts (user inputs)
- tools (tool definitions)
- connections (cross-references)
- data_objects, ongoing_practices (documentation)

**Reference (4 tables)**: personality_types, competencies, competency_levels, skills

**Attribution (2 tables)**: references, content_sources

### Content Structure

The `stem` table is the backbone—it defines hierarchical location (part/module/exercise/activity) and global sequence for every content block, prompt, or tool reference.

**Scale**: 1,186 stem rows (sequence 1-1186), covering all three parts

**Exercise ID pattern**: `1.1.1.v1` = Part.Module.Exercise.Version

**Block types in stem**:
- `content` → static text from content_blocks
- `prompt` → user input from prompts table
- `tool` → embedded tool from tools table

**Connections**: 64 documented cross-references between exercises, tracking data flow throughout the workbook

### User Progression

Strictly linear based on `stem.sequence`. Users unlock content sequentially. Tools unlock when users reach the exercise that introduces them.

---

## Tools

DreamTree includes **27 tools** that unlock as users progress through the workbook:

### Core Tools (Parts 1-2)
| ID | Tool | Purpose |
|----|------|---------|
| 100000 | list_builder | Dynamic list with add/remove/reorder |
| 100001 | soared_form | SOARED story framework |
| 100002 | skill_tagger | Tag skills from stories |
| 100003 | ranking_grid | Pairwise comparison ranking (1-10) |
| 100004 | mbti_selector | 4-letter personality type entry |
| 100005 | budget_calculator | Monthly/annual budget, BATNA |
| 100006 | flow_tracker | Daily energy/focus tracking (**has reminder: daily**) |
| 100007 | life_dashboard | Rate work/play/love/health (1-10) |
| 100008 | mindset_profiles | Five designer mindsets display |
| 100009 | failure_reframer | Reframe failures as learning |
| 100010 | idea_tree | Visual brainstorming tree |
| 100011 | job_combiner | Combine ideas into job descriptions |
| 100012 | career_timeline | 5-year career planning |
| 100013 | career_assessment | Score career options |

### Job Search Tools (Part 3)
| ID | Tool | Purpose |
|----|------|---------|
| 100014 | job_analyzer | Extract keywords from job descriptions |
| 100015 | credential_writer | Rewrite credentials using employer language |
| 100016 | resume_builder | Structured resume building |
| 100017 | company_tracker | Track target companies |
| 100018 | company_researcher | Research template for companies |
| 100019 | research_tracker | Track research progress |
| 100020 | contact_tracker | Track networking contacts |
| 100021 | networking_tracker | Log daily networking activities |
| 100022 | outreach_tracker | Log outreach and responses |
| 100023 | meeting_prep | Prepare for meetings |
| 100024 | meeting_notes | Capture meeting outcomes |
| 100025 | referral_tracker | Track referrals received |
| 100026 | opportunity_tracker | Track job pipeline |

**Note**: Only flow_tracker currently has a reminder configured. The Spec Fixes document identified this—other tools that should have reminders (failure_reframer weekly, budget_calculator monthly, etc.) may need configuration updates.

---

## Design System

### User-Owned Aesthetic

Users choose their visual preferences at onboarding:

**Backgrounds** (5 options): Ivory, Creamy Tan, Brown, Bluish Charcoal, Black

**Fonts** (5 options): Clean Sans (Inter), Classic Serif (Lora), Typewriter (Courier Prime), Handwritten (Shadows Into Light), Vintage Display (Jacquard 24)

All color pairings are accessibility-first (WCAG AA minimum 4.5:1 contrast).

### Key Visual Decisions

- **Message display**: DreamTree content = left-aligned, no bubble. User responses = right-aligned, subtle bubble.
- **Navigation**: Bottom nav on mobile/tablet (<1024px), left rail on desktop (≥1024px)
- **Content width**: 65ch for messages, 720px max for content area
- **Auto-hide header**: Fades after 20s idle, returns on scroll up

### Semantic Colors

Two sets (light and dark backgrounds) for primary, success, warning, error, and muted states.

---

## Spec Fixes Status

**See DreamTree_Spec_Fixes.md for complete tracking.** Key issues include:

### Critical (Block Build)
1. ~~Missing tool specs~~: **RESOLVED** - 27 tools now defined in tools.csv
2. **The 14 Connections**: Now have 64 connections documented in connections.csv, but need audit against the "magic moments" claims in original spec
3. **Z-index conflicts**: Design System and Component Spec have different values
4. **Color/font naming mismatch**: Different names across documents need canonicalization

### Medium (Fix Before Launch)
- Mobile breakpoint: Use 768px everywhere (not 640px)
- DailyDoType naming: Align with tool_types.id
- Mastery scale: Store INTEGER 1-5, display letters a-e
- Tool reminders: Only flow_tracker has reminder configured; others may need it

### Fix Order
1. Color/font naming → Z-index → Breakpoints (before CSS)
2. Missing tools → Tool directions → DailyDoType (before tools)
3. Connections audit → Mastery scale (before content)
4. exercise_skills orphans (before launch)

---

## Key Frameworks in Workbook

**SOARED** (Original framework by Braedon):
- **S**ituation – describe the situation
- **O**bstacle – the problem faced
- **A**ction – step-by-step process taken
- **R**esult – outcome of actions
- **E**valuation – self-evaluation and reception
- **D**iscovery – what was learned

**Skills Taxonomy** (Sydney Fine):
- Transferable Skills (verbs): things you can do
- Self-Management Skills (adjectives): how you work
- Knowledges (nouns): what you know

**Competency Framework** (OECD-adapted):
- 15 competencies across 3 categories (Delivery, Interpersonal, Strategic)
- 5 levels of proficiency
- Used for self-assessment in Module 2.5

**Life Dashboard** (Burnett):
- Four categories: Work, Play, Love, Health
- Users rate 1-10 for life assessment

---

## Encryption Model

PII fields are encrypted with a user-derived key:
- Module 1.4 "Love" content (deeply personal)
- Budget Calculator data (financial)
- Networking Prep data (contacts/relationships)
- Geographic/address data

**Key architecture**: Password → PBKDF2/Argon2 → Wrapping Key → encrypts random Data Key → encrypts PII fields

**Password recovery limitation**: Account recoverable, but encrypted PII is permanently lost (intentional privacy tradeoff).

---

## Future Considerations (Post-MVP)

- User Wallet Export (portable data, potential DID/VC compatibility)
- Idea Graph Analysis (aggregate patterns across users)
- A/B Testing (variant groups for content)
- Skills Suggestions (AI-powered, semantic search)
- Passkey/Wallet Auth (encryption key derivation challenges)

---

## File Reference

### Specification Documents
| Document | Purpose |
|----------|---------|
| DreamTree.md | Original workbook content (6,400+ lines) |
| DreamTree_Component_Spec.md | UI component definitions (13,000+ lines) |
| DreamTree_Data_Architecture_v4.md | Database schema and data flows |
| DreamTree_Design_System.md | Visual tokens, colors, typography, spacing |
| DreamTree_Spec_Fixes.md | Issue tracker with 19 identified fixes |

### Content Data (CSVs)
| File | Purpose | Rows |
|------|---------|------|
| stem.csv | Content sequencing backbone | 1,186 |
| content_blocks.csv | Static content (headings, instructions, notes) | ~930 |
| prompts.csv | User input prompts | ~200 |
| tools.csv | Tool definitions | 27 |
| connections.csv | Cross-references between exercises | 64 |
| data_objects.csv | Key data artifacts documentation | — |
| ongoing_practices.csv | Recurring practices metadata | — |

### Database Schema
| File | Purpose |
|------|---------|
| usertables.sql | User data tables (Tier 1 + Tier 2) |
| dreamtree_master_complete.csv | Full denormalized content export |

---

*Last updated: January 2025*
