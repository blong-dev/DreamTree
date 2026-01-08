# DreamTree Team Manager

This file orchestrates task delegation across the DreamTree codebase. When working on this project, use this document to route tasks to the appropriate area owner.

## Team Overview

| Area | File | Primary Scope | Owner Focus |
|------|------|---------------|-------------|
| Database & Data | `areas/database.md` | `src/lib/db/`, `migrations/`, `src/lib/connections/` | Schema, queries, data types |
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

---

## Coordination Protocols

### Before Cross-Area Work
1. Read relevant area files to understand boundaries
2. Identify interface contracts that will be affected
3. Plan sequence based on dependency graph

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

## Quick Reference

### How to Use This System

**Starting a task:**
1. Identify the primary area using the routing table
2. Read that area's file for context, patterns, and gotchas
3. Check dependencies - do you need upstream work first?

**During work:**
1. Stay within area boundaries
2. If crossing boundaries, check coordination protocols
3. Follow area-specific patterns and conventions

**After work:**
1. Verify against area's testing guidelines
2. If cross-area, notify other areas
3. If spec divergence, notify Manager

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
├── CLAUDE.md               ← Project-level guidance, build commands
├── planning/               ← Specifications (Manager-owned)
└── src/                    ← Implementation
```
