# DreamTree Team Manager

This file contains coordination protocols and routing tables for the DreamTree team.

---

## Team Intro Docs

**Each team member has a dedicated intro doc. Read yours first:**

| Role | Intro Doc | Owns |
|------|-----------|------|
| **Queen Bee** | `QUEEN.md` | Coordination, user communication, bug filing |
| **Fizz** | `FIZZ.md` | UI/UX, components, CSS, workbook, conversation |
| **Buzz** | `BUZZ.md` | Database, auth, API, security, connections |
| **Pazz** | `PAZZ.md` | QA, testing, verification |
| **Rizz** | `RIZZ.md` | Marketing, copy, campaigns, brand voice |

**Area deep-dives:** See `areas/*.md` for technical patterns and gotchas.

---

## Before Routing Any Task

**Every task exists to serve DreamTree's soul. Before writing code, understand what we're protecting.**

DreamTree is a **trusted companion** that guides users through self-discovery via conversation. The defining metaphor: "Texting through a guided workbook."

### The Four Pillars (Quick Reference)

| Pillar | What It Means | Area Impact |
|--------|---------------|-------------|
| **Conversational Intimacy** | Chat-like UI, typing effects, one message at a time | Conversation, Workbook, Shell |
| **User Autonomy** | No gamification, no time pressure, edit past answers | All areas - no points/badges anywhere |
| **Data Sovereignty** | User-owned data, encryption, full export | Auth, Database |
| **Magic Moments** | Past inputs resurface meaningfully | Database (connections), Workbook |

### Soul Violation Escalation

**Escalate to Manager immediately if any task would:**
- Add form-like UI (multiple inputs visible at once, wizard steps)
- Add gamification (points, badges, streaks, confetti)
- Add time pressure (countdowns, session warnings)
- Break the conversation metaphor (prompts shown twice, jarring transitions)
- Reduce data transparency (unclear storage, no export)

**Do not implement soul violations even if technically correct.** Soul > Spec > Implementation.

---

## Team Overview

| Area | File | Primary Scope | Owner Focus |
|------|------|---------------|-------------|
| Database & Data | `areas/database.md` | `src/lib/db/`, `migrations/`, `src/lib/connections/` | Schema, queries, connections |
| Auth & Security | `areas/auth.md` | `src/lib/auth/` | Sessions, encryption, user identity |
| Shell & Navigation | `areas/shell.md` | `src/components/shell/`, `overlays/` | Layout, navigation, TOC |
| UI Primitives | `areas/ui-primitives.md` | `src/components/forms/`, `feedback/`, `icons/` | Form controls, feedback, icons |
| Conversation UI | `areas/conversation.md` | `src/components/conversation/` | Chat interface, messages |
| Tools | `areas/tools.md` | `src/components/tools/` | 15 interactive tools |
| Features | `areas/features.md` | `src/components/dashboard/`, `onboarding/`, `profile/` | Dashboard, onboarding, profile |
| Workbook | `areas/workbook.md` | `src/app/workbook/`, `src/components/workbook/`, `api/workbook/` | Exercise delivery, responses |
| Design System | `areas/design-system.md` | `src/app/globals.css` | CSS tokens, theming, a11y |

---

## Spec Ownership

**The Manager owns all specification files in `/planning/`.** Implementation is delegated to areas.

### Spec File Index

| Spec File | Size | Primary Areas | Update Trigger |
|-----------|------|---------------|----------------|
| `DreamTree_Design_System.md` | 36 KB | Design System, all UI areas | Color/spacing/font changes |
| `DreamTree_Component_Spec.md` | 328 KB | All component areas | Component prop/behavior changes |
| `DreamTree_Data_Architecture_v4.md` | 123 KB | Database, Auth, Workbook | Schema/data flow changes |
| `DreamTree_Build_Plan.md` | 24 KB | Manager (coordination) | Phase completion, scope changes |
| `DreamTree_Project_Summary.md` | 11 KB | Manager (overview) | Major feature additions |

### Spec Update Protocol

1. **Before changing behavior**: Check spec first. If spec differs from intent, clarify with user.
2. **After implementation**: If implementation intentionally differs from spec, Manager updates spec.
3. **Cross-area changes**: Manager notifies affected areas after spec updates.

---

## Dependency Graph

```
                    ┌─────────────────┐
                    │  Design System  │
                    │   (foundation)  │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
   ┌──────────┐       ┌────────────┐      ┌──────────┐
   │ Database │       │   Shell    │      │    UI    │
   │ & Data   │       │ & Nav      │      │Primitives│
   └────┬─────┘       └─────┬──────┘      └────┬─────┘
        │                   │                   │
        ▼                   │                   │
   ┌──────────┐             │         ┌────────┴────────┐
   │   Auth   │             │         │                 │
   └────┬─────┘             │         ▼                 ▼
        │                   │   ┌────────────┐   ┌──────────┐
        │                   │   │Conversation│   │  Tools   │
        │                   │   └─────┬──────┘   └────┬─────┘
        │                   │         │               │
        └───────────┬───────┴─────────┴───────────────┘
                    │
                    ▼
            ┌───────────────┐
            │   Features    │
            │(Dashboard etc)│
            └───────┬───────┘
                    │
                    ▼
            ┌───────────────┐
            │   Workbook    │
            │ (integrator)  │
            └───────────────┘
```

### Reading the Graph
- **Upstream changes** (toward Design System) require downstream updates
- **Workbook** is the integrator - it consumes from all other areas
- **Foundation areas** (Design System, Database) have no dependencies

---

## Task Routing Table

Use this table to quickly identify which area owns a task.

| Task Type | Primary Area | May Also Involve |
|-----------|--------------|------------------|
| Add new database table | Database | - |
| Modify schema/migration | Database | Workbook (if stem-related) |
| Add new SQL query | Database | - |
| Fix connection resolver | Database | Workbook |
| Session/auth bugs | Auth | - |
| Password/encryption | Auth | - |
| Add auth route | Auth | Workbook |
| NavBar changes | Shell | - |
| TOC panel changes | Shell | Features (TOCInline) |
| Layout structure | Shell | - |
| Breadcrumb updates | Shell | Workbook |
| New form control | UI Primitives | - |
| Toast/tooltip changes | UI Primitives | - |
| New icon | UI Primitives | - |
| Error boundary | UI Primitives | - |
| Chat interface | Conversation | Workbook |
| Message rendering | Conversation | - |
| Typing effect | Conversation | - |
| New tool component | Tools | Database (if new data) |
| Tool bug fix | Tools | - |
| Tool data hydration | Tools | Database |
| Dashboard widget | Features | - |
| Onboarding flow | Features | Auth, Database |
| Profile display | Features | Database |
| Progress metrics | Features | Database |
| Exercise page | Workbook | - |
| Response handling | Workbook | Database |
| API route (workbook) | Workbook | Auth |
| Prompt rendering | Workbook | Conversation |
| CSS variables | Design System | - |
| Color changes | Design System | All UI areas |
| Spacing/typography | Design System | All UI areas |
| New CSS component class | Design System | Relevant component area |
| Data API route | Database | Tools (if for tool data) |
| Skills/competencies fetch | Database | Tools |
| Connection resolution | Database | Workbook |
| Auth middleware | Auth | - |
| Login/signup pages | Features | Auth |

---

## Delegation Guide

### Single-Area Tasks
Most tasks belong to a single area. Route based on:
1. **File location**: Where does the change happen?
2. **Responsibility**: What system does it affect?

### Cross-Area Tasks
Some tasks span multiple areas. Manager coordinates:

| Cross-Area Pattern | Areas Involved | Coordination |
|--------------------|----------------|--------------|
| New feature end-to-end | Database → Auth → UI → Workbook | Sequence by dependency |
| Design system update | Design System → All UI | Design System first, then notify |
| New tool with data | Database → Tools → Workbook | Database types first |
| Auth-gated feature | Auth → Feature area | Auth contract first |

### Escalation to Manager
Route to Manager when:
- Task affects 3+ areas
- Spec clarification needed
- Architectural decision required
- Change log update needed
- **Soul violation detected** — Do not proceed, escalate immediately

---

## Coordination Protocols

### Before Cross-Area Work
1. Read relevant area files to understand boundaries
2. Identify interface contracts that will be affected
3. Plan sequence based on dependency graph
4. **Verify the task serves DreamTree's soul**

### After Completing Work
1. **Single area**: Mark task complete, no coordination needed
2. **Cross-area**: Notify affected areas of interface changes
3. **Spec impact**: Manager updates `/planning/` docs
4. **Breaking changes**: Manager updates all affected area files

### Change Log Updates
Manager maintains the Change Log in `/CLAUDE.md` after:
- Phase completions
- Major feature additions
- Architectural changes
- Breaking changes to interfaces

---

## Multi-Instance Coordination

**Multiple Claude instances may work on this codebase simultaneously. This section ensures they don't conflict.**

### The Bug Tracker: `team/BUGS.md`

All bugs and tasks are tracked in `team/BUGS.md`. This is the **single source of truth** for work coordination.

### The Message Board: `team/BOARD.md`

Async communication between instances. Check this when you start a session, post updates when you finish work or hit blockers. Tag others with `@Name`.

### The Crawl Plan: `team/CRAWL.md`

Systematic codebase exploration plan. Four phases of deep analysis. Check this for your current assignments and deliverables when in Learn Mode.

### Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  1. READ team/BUGS.md and team/BOARD.md                     │
│     - See what's open, in-progress, done                    │
│     - Check "Currently Editing" section for file locks      │
│     - Check BOARD.md for team messages and context          │
├─────────────────────────────────────────────────────────────┤
│  2. CLAIM your work                                         │
│     - Change status: open → in-progress (your-instance-id)  │
│     - Add files you'll edit to "Currently Editing"          │
│     - Save BUGS.md immediately                              │
├─────────────────────────────────────────────────────────────┤
│  3. WORK on the bug                                         │
│     - Follow area docs for patterns                         │
│     - Update progress notes in BUGS.md as you go            │
├─────────────────────────────────────────────────────────────┤
│  4. COMPLETE                                                │
│     - Mark status: done                                     │
│     - List files changed                                    │
│     - Remove from "Currently Editing"                       │
│     - Move to "Recently Completed" section                  │
│     - Post update to BOARD.md                               │
└─────────────────────────────────────────────────────────────┘
```

### Instance Identification

Use one of these as your instance ID:
- Your plan file name (e.g., `fizzy-kindling-hearth`)
- Sequential ID assigned by user (e.g., `claude-A`, `claude-B`)
- Any unique identifier agreed with user

### File Conflict Prevention

**Before editing a file**, check the "Currently Editing" section in BUGS.md:
- If file is listed by another instance → wait or coordinate with user
- If file is free → add it to "Currently Editing" with your instance ID

**After editing**, remove from "Currently Editing".

### Cross-Instance Communication

Instances communicate through **BOARD.md** and **BUGS.md**:
- **BOARD.md** — Status updates, blockers, coordination messages
- **BUGS.md** — Technical progress notes, file warnings
- **Tag teammates** — Use `@Fizz`, `@Buzz`, `@Pazz`, `@Queen` in BOARD.md
- **Dependencies** — "BUG-005 must complete before BUG-006"

### Routing Bug Work

Each bug has an **Area** field that maps to an area doc:

| Bug Area | Read First |
|----------|------------|
| workbook | `areas/workbook.md` |
| conversation | `areas/conversation.md` |
| tools | `areas/tools.md` |
| shell | `areas/shell.md` |
| auth | `areas/auth.md` |
| database | `areas/database.md` |
| features | `areas/features.md` |
| design-system | `areas/design-system.md` |
| ui-primitives | `areas/ui-primitives.md` |

### QA Verification (Pazz)

**Pazz** is the QA instance. All non-trivial bugs go through review before closing.

**Workflow:**
```
Worker completes bug → Status: "review" → Pazz verifies → Status: "done"
```

**Pazz responsibilities:**
1. Monitor BUGS.md for `review` status bugs
2. Test against acceptance criteria (checkboxes in bug report)
3. Verify build passes (`npm run build`)
4. Check for regressions in related areas
5. **Pass** → Move to `done`, add verification note
6. **Fail** → Back to `in-progress`, add failure notes, tag worker in BOARD.md

**Skip review for trivial bugs:**
- Bugs marked `Trivial: yes` can go straight to `done`
- Examples: typo fixes, comment updates, config tweaks

**Acceptance criteria checklist:**
- [ ] All criteria in bug report checked off
- [ ] Build passes
- [ ] No console errors
- [ ] Soul pillars not violated

---

## Quality Gates

Every task completion should pass these checks:

| Check | Question | Fail Action |
|-------|----------|-------------|
| **Soul** | Does this serve the four pillars? | Rework or escalate |
| **Spec** | Does this match `/planning/` specs? | Update spec or rework |
| **Boundaries** | Did you stay within area scope? | Coordinate with other areas |
| **UX** | Would a user feel coached, not processed? | Rework |
| **Data** | Does data flow correctly to connections? | Verify with Database |

---

## Quick Reference

### How to Use This System

**Starting a task:**
1. **Soul check**: Will this serve DreamTree's pillars?
2. Identify the primary area using the routing table
3. Read that area's file for context, patterns, and gotchas
4. Check dependencies - do you need upstream work first?

**During work:**
1. Stay within area boundaries
2. If crossing boundaries, check coordination protocols
3. Follow area-specific patterns and conventions
4. **If you notice a soul violation, stop and escalate**

**After work:**
1. Verify against area's testing guidelines
2. If cross-area, notify other areas
3. If spec divergence, notify Manager
4. **Verify the user experience feels like coaching, not processing**

### File Locations

```
dreamtree/
├── team/
│   ├── MANAGER.md          ← You are here
│   └── areas/
│       ├── database.md
│       ├── auth.md
│       ├── shell.md
│       ├── ui-primitives.md
│       ├── conversation.md
│       ├── tools.md
│       ├── features.md
│       ├── workbook.md
│       └── design-system.md
├── CLAUDE.md               ← Project-level guidance, soul, build commands
├── planning/               ← Specifications (Manager-owned)
└── src/                    ← Implementation
```
