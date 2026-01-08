# DreamTree

> **Career development web app** that transforms a comprehensive workbook into an interactive, chat-like experience. Users progress through guided self-discovery and career planning using a tree metaphor.

---

## Working with Braedon

**Ask before assuming.** Braedon typically has more context than what's in the conversation. Before searching Google Drive, making architectural assumptions, or diving into implementation, ask what files or context he can provide directly.

**Trust the specs.** DreamTree has been in development conceptually for 7 years. The specifications are comprehensive and intentional. Trust existing documentation rather than suggesting alternatives unless asked.

**He's a solo founder building this himself.** No team to coordinate with. Decisions can be made quickly. The goal is rapid development—days, not months.

**Local files are current.** His most recent work is local, not in Google Drive. If he mentions having files, wait for him to share them.

---

## Quick Reference

| Item | Value |
|------|-------|
| **Stack** | Next.js → Cloudflare Pages, D1 (SQLite) |
| **MVP Scope** | Parts 1 & 2 (Roots + Trunk) |
| **Database** | 40 tables total |
| **Content** | 821 stem rows, 680 content blocks, 171 prompts, 29 tools, 19 connections |
| **Design** | User-owned aesthetic (5 backgrounds × 5 fonts) |
| **Auth** | Anonymous → Claimed flow with PII encryption |

---

## The Tree Metaphor

| Part | Name | Focus |
|------|------|-------|
| **Part 1** | Roots | Self-knowledge—skills, values, personality, what energizes you |
| **Part 2** | Trunk | Connecting past to future—values alignment, decision frameworks, storytelling |
| **Part 3** | Branches | Reaching into the world—networking, job search, professional presence |

---

## Architecture Overview

### Content Flow

```
stem (sequencing backbone)
  ├── content_blocks (static text: headings, instructions, notes)
  ├── prompts (user inputs: textarea, slider, checkbox, etc.)
  └── tools (interactive components: list_builder, ranking_grid, etc.)
```

**Exercise ID pattern**: `1.1.1.v1` = Part.Module.Exercise.Version

**Progression**: Strictly linear based on `stem.sequence`. Users unlock content sequentially.

### Database Tables (40 total)

**Core (6)**: users, auth, emails, sessions, user_settings, user_modules

**User Data Tier 1 (16)**: Structured, frequently-referenced
- Profile: user_profile, user_values, user_skills, user_stories
- Experiences: user_experiences, user_experience_skills
- Preferences: user_locations, user_career_options, user_budget
- Job Search: user_companies, user_contacts, user_jobs
- Tools: user_flow_logs, user_idea_trees, user_idea_nodes, user_idea_edges

**User Data Tier 2 (4)**: Generic/catch-all
- user_responses, user_lists, user_list_items, user_checklists

**Assessments (1)**: user_competency_scores

**Content (7)**: stem, content_blocks, prompts, tools, connections, data_objects, ongoing_practices

**Reference (4)**: personality_types, competencies, competency_levels, skills

**Attribution (2)**: references, content_sources

### Key Tables

**stem**: Backbone table defining sequence and hierarchy
```
id, part, module, exercise, activity, sequence, block_type, content_id, connection_id
```
- `block_type`: 'content' | 'prompt' | 'tool'
- `content_id`: References content_blocks, prompts, or tools based on block_type

**connections**: Cross-references between exercises (19 defined)
- Methods: 'custom', 'hydrate', 'auto_populate', 'reference_link'
- Enable data flow between exercises (e.g., skills from Module 1 appear in Module 2)

---

## Tools (29 total)

### Core Tools (Parts 1-2)
| ID | Name | Purpose |
|----|------|---------|
| 100000 | list_builder | Dynamic list with add/remove/reorder |
| 100001 | soared_form | SOARED story framework |
| 100002 | skill_tagger | Tag skills from stories |
| 100003 | ranking_grid | Pairwise comparison ranking (1-10) |
| 100004 | mbti_selector | 4-letter personality type entry |
| 100005 | budget_calculator | Monthly/annual budget, BATNA |
| 100006 | flow_tracker | Daily energy/focus tracking (**daily reminder**) |
| 100007 | life_dashboard | Rate work/play/love/health (1-10) |
| 100008 | mindset_profiles | Five designer mindsets display |
| 100009 | failure_reframer | Reframe failures as learning |
| 100010 | idea_tree | Visual brainstorming tree |
| 100011 | job_combiner | Combine ideas into job descriptions |
| 100012 | career_timeline | 5-year career planning |
| 100013 | career_assessment | Score career options |
| 100027 | bucketing_tool | Drag-and-drop into 5 ranked buckets |
| 100028 | competency_assessment | OECD competency self-assessment |

### Job Search Tools (Part 3)
IDs 100014-100026: job_analyzer, credential_writer, resume_builder, company_tracker, company_researcher, research_tracker, contact_tracker, networking_tracker, outreach_tracker, meeting_prep, meeting_notes, referral_tracker, opportunity_tracker

---

## Design System

### User-Owned Aesthetic

Users choose at onboarding:

**Backgrounds (5)**:
| Name | Hex | Type |
|------|-----|------|
| Ivory | #FAF8F5 | Light |
| Creamy Tan | #E8DCC4 | Light |
| Brown | #5C4033 | Dark |
| Bluish Charcoal | #2C3E50 | Dark |
| Black | #1A1A1A | Dark |

**Fonts (5)**:
| Name | Family | Character |
|------|--------|-----------|
| Clean Sans | Inter | Modern, neutral |
| Classic Serif | Lora | Warm, literary |
| Typewriter | Courier Prime | Raw, authentic |
| Handwritten | Shadows Into Light | Personal, journal-like |
| Vintage Display | Jacquard 24 | Retro dot-matrix |

### Constrained Pairings (WCAG AA)

Only valid combinations shown to users. All meet 4.5:1 minimum contrast.

### Message Display

| Element | Treatment |
|---------|-----------|
| DreamTree content | Left-aligned, no bubble |
| User responses | Right-aligned, subtle bubble |

### Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Nav at bottom |
| Tablet | 768px - 1023px | Nav at bottom, wider content |
| Desktop | ≥ 1024px | Nav rail on left |

### Z-Index Scale

| Layer | Z-Index |
|-------|---------|
| Content | 0 |
| Header | 10 |
| Input | 20 |
| Nav | 30 |
| Backdrop | 40 |
| Modal/Panel | 50 |
| Toast | 60 |

---

## Key Frameworks

**SOARED** (Original by Braedon):
- **S**ituation, **O**bstacle, **A**ction, **R**esult, **E**valuation, **D**iscovery

**Skills Taxonomy** (Sydney Fine):
- Transferable Skills (verbs): things you can do
- Self-Management Skills (adjectives): how you work
- Knowledges (nouns): what you know

**Competency Framework** (OECD-adapted):
- 15 competencies across 3 categories (Delivery, Interpersonal, Strategic)
- 5 proficiency levels

**Life Dashboard** (Burnett):
- Four categories: Work, Play, Love, Health (rate 1-10)

---

## Encryption Model

PII fields encrypted with user-derived key:
- Module 1.4 "Love" content
- Budget Calculator data
- Networking Prep data
- Geographic/address data

**Key architecture**: Password → PBKDF2/Argon2 → Wrapping Key → encrypts random Data Key → encrypts PII fields

**Password recovery**: Account recoverable, but encrypted PII permanently lost (intentional privacy tradeoff).

---

## File Reference

### Specification Documents
| Document | Purpose |
|----------|---------|
| DreamTree_Build_Plan.md | Phased implementation plan |
| DreamTree_Component_Spec.md | UI component definitions (13,000+ lines) |
| DreamTree_Data_Architecture_v4.md | Database schema and data flows |
| DreamTree_Design_System.md | Visual tokens, colors, typography |
| DreamTree_Spec_Fixes.md | Issue tracker |
| DreamTree_Project_Summary.md | Quick onboarding reference |

### Content Data (CSVs)
| File | Purpose | Rows |
|------|---------|------|
| stem_UPDATED.csv | Content sequencing | 821 |
| content_blocks_UPDATED.csv | Static content | 680 |
| prompts.csv | User input prompts | 171 |
| tools.csv | Tool definitions | 29 |
| connections_UPDATED.csv | Cross-references | 19 |
| data_objects.csv | Key data artifacts | — |
| ongoing_practices.csv | Recurring practices | — |

### Reference Data (CSVs)
| File | Purpose |
|------|---------|
| personality_types.csv | 16 MBTI types |
| competencies.csv | 15 OECD competencies |
| competency_levels.csv | 5 levels × 15 competencies |
| skills_master.csv | Skills reference list |
| sources.csv | Attribution data |

### Database Schema
| File | Purpose |
|------|---------|
| usertables.sql | User data tables (Tier 1 + Tier 2) |

---

## Build Phases

| Phase | Focus | Components |
|-------|-------|------------|
| **1** | Foundation | Database, Auth, Onboarding |
| **2** | Conversation UI | Design system, Messages, Input |
| **3** | Tools | All 29 tools, Connections |
| **4** | Navigation | Dashboard, TOC, Profile |
| **5** | Polish | Feedback, A11y, Performance |

---

## Open Issues (from Spec Fixes)

### Critical
1. ~~Missing tool specs~~ — **RESOLVED** (29 tools defined)
2. **Connections audit** — 19 connections need method/params refinement
3. ~~Z-index conflicts~~ — Use Component Spec values
4. ~~Color/font naming~~ — Canonical names established

### Medium
- Tool reminders — Only flow_tracker has reminder; others may need it
- Mastery scale — Store INTEGER 1-5, display letters a-e in UI

---

## Repository Structure

```
dreamtree/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── (auth)/             # Auth routes
│   │   ├── (main)/             # Main app routes
│   │   │   ├── page.tsx        # Dashboard
│   │   │   ├── workbook/       # Conversation interface
│   │   │   ├── tools/[id]/     # Tool pages
│   │   │   └── profile/        # Profile page
│   │   ├── api/                # API routes
│   │   └── globals.css         # CSS variables
│   ├── components/
│   │   ├── shell/              # AppShell, NavBar, Header
│   │   ├── conversation/       # Messages, Thread
│   │   ├── forms/              # TextInput, Slider, etc.
│   │   ├── tools/              # Tool-specific components
│   │   ├── feedback/           # Button, Toast, Tooltip
│   │   ├── overlays/           # Modal, TOCPanel
│   │   └── onboarding/         # OnboardingFlow
│   ├── lib/
│   │   ├── db/                 # D1 client, queries
│   │   ├── auth/               # Auth utilities, encryption
│   │   ├── hooks/              # Custom React hooks
│   │   └── utils/              # Helpers
│   └── types/                  # TypeScript definitions
├── migrations/                 # D1 migrations
├── seed/                       # CSV imports
└── wrangler.toml               # Cloudflare config
```

---

## Common Queries

### Get content at sequence position
```sql
SELECT s.*, 
  CASE s.block_type 
    WHEN 'content' THEN cb.content
    WHEN 'prompt' THEN p.prompt_text
    WHEN 'tool' THEN t.name
  END as resolved_content
FROM stem s
LEFT JOIN content_blocks cb ON s.block_type = 'content' AND s.content_id = cb.id
LEFT JOIN prompts p ON s.block_type = 'prompt' AND s.content_id = p.id
LEFT JOIN tools t ON s.block_type = 'tool' AND s.content_id = t.id
WHERE s.sequence = ?
```

### Get user's current position
```sql
SELECT MAX(s.sequence) as current_sequence
FROM user_responses ur
JOIN stem s ON ur.exercise_id = (s.part || '.' || s.module || '.' || s.exercise)
WHERE ur.user_id = ?
```

### Check if tool is unlocked
```sql
SELECT 1 FROM stem s
JOIN user_responses ur ON ur.exercise_id LIKE (s.part || '.' || s.module || '.%')
WHERE s.block_type = 'tool' 
  AND s.content_id = ?
  AND ur.user_id = ?
LIMIT 1
```
