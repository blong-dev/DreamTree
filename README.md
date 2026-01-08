# DreamTree

Interactive career development workbook built as a conversational web app.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Hosting**: Cloudflare Pages
- **Database**: Cloudflare D1 (SQLite)
- **Auth**: Custom session-based with PII encryption
- **Styling**: CSS custom properties (no Tailwind utilities in components)

---

## CRITICAL: Specification-Driven Development

**This project has comprehensive specifications that took 7 years to refine. All code MUST follow these specs exactly.**

### Spec Files Location

All specifications are in `/planning`:

| File | Purpose |
|------|---------|
| `DreamTree_Design_System.md` | **SOURCE OF TRUTH** for all visual values |
| `DreamTree_Component_Spec.md` | Component props, structure, HTML output |
| `DreamTree_Data_Architecture_v4.md` | Database schema, queries, relationships |
| `DreamTree_Build_Plan.md` | Implementation phases, file structure |
| `DreamTree_Project_Summary.md` | Quick reference overview |
| `component parts/*.md` | Detailed component specs by category |
| `tables/*.csv` | Content data (stem, prompts, tools, etc.) |

### Before Writing Code

1. **Read the relevant spec** - Don't guess, read
2. **Use exact values** - Hex codes, spacing, z-index from Design System
3. **Match props exactly** - Component Spec defines what props exist
4. **Follow HTML structure** - Component Spec shows exact rendered output
5. **Check accessibility** - WCAG AA is required, not optional

### Design System Values (Quick Reference)

**Colors**:
```
Ivory:       #FAF8F5 (light background)
Creamy Tan:  #E8DCC4 (warm background)
Brown:       #5C4033 (dark background/text)
Charcoal:    #2C3E50 (dark background/text)
Black:       #1A1A1A (darkest background)

Primary Light: #1B7B6D    Primary Dark: #4ECDC4
Success Light: #2D6A4F    Success Dark: #6BCB77
Warning Light: #B5651D    Warning Dark: #F4A261
Error Light:   #9B2C2C    Error Dark:   #E57373
Muted Light:   #6B6B6B    Muted Dark:   #A0A0A0
```

**Constrained Pairings** (WCAG AA):
- Light bg (Ivory, Creamy Tan) → Dark text only (Brown, Charcoal, Black)
- Dark bg (Brown, Charcoal, Black) → Light text only (Ivory, Creamy Tan)

**Spacing** (4px base):
```
space-1:  4px     space-6:  24px
space-2:  8px     space-8:  32px
space-3:  12px    space-10: 40px
space-4:  16px    space-12: 48px
space-5:  20px    space-16: 64px
```

**Z-Index** (from Design System):
```
z-base:    0       z-overlay: 200
z-raised:  10      z-modal:   300
z-nav:     50      z-tooltip: 400
z-header:  60
z-input:   70
```

**Border Radius**:
```
radius-sm:   4px     radius-xl:   16px
radius-md:   8px     radius-full: 9999px
radius-lg:   12px
```

**Fonts** (user-selectable):
| ID | Family |
|----|--------|
| inter | `'Inter', system-ui, sans-serif` |
| lora | `'Lora', Georgia, serif` |
| courier-prime | `'Courier Prime', monospace` |
| shadows-into-light | `'Shadows Into Light', cursive` |
| jacquard-24 | `'Jacquard 24', serif` |

### Key Design Principles

1. **NO SHADOWS** - Use borders only, no box-shadow
2. **User-owned aesthetic** - Colors and fonts are user-chosen at onboarding
3. **Accessibility first** - All pairings meet WCAG AA 4.5:1 contrast
4. **Reduced motion** - All animations respect `prefers-reduced-motion`
5. **Semantic color switching** - Light/dark themes have different semantic colors

---

## Project Structure

```
dreamtree/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── page.tsx            # Entry (onboarding check)
│   │   ├── globals.css         # CSS variables + design system
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── onboarding/         # Onboarding flow components
│   │   ├── shell/              # AppShell, NavBar, Header (Phase 2)
│   │   ├── conversation/       # Messages, Thread (Phase 2)
│   │   ├── forms/              # TextInput, Slider, etc. (Phase 2)
│   │   ├── tools/              # Tool components (Phase 3)
│   │   ├── feedback/           # Button, Toast, etc. (Phase 5)
│   │   └── overlays/           # Modal, TOCPanel (Phase 4)
│   ├── lib/
│   │   ├── db/                 # D1 client, queries
│   │   └── auth/               # Session, password, encryption
│   └── types/
│       └── database.ts         # TypeScript types for all tables
├── migrations/
│   ├── 0001_initial.sql        # Schema (40 tables)
│   └── 0002_seed_data.sql      # Reference + content data
├── planning/                   # SPECIFICATIONS (READ THESE)
└── CLAUDE.md                   # Build tracking, spec quick-ref
```

---

## Database

**40 tables** organized in tiers:

- **Core (6)**: users, auth, emails, sessions, user_settings, user_modules
- **User Data Tier 1 (16)**: Structured data (profile, skills, stories, etc.)
- **User Data Tier 2 (4)**: Generic storage (responses, lists, checklists)
- **Content (7)**: stem, content_blocks, prompts, tools, connections, etc.
- **Reference (4)**: personality_types, competencies, skills
- **Attribution (2)**: references, content_sources

**Seed data**: 3,221 rows (16 MBTI types, 15 competencies, 1336 skills, 29 tools, 679 content blocks, 170 prompts, 820 stem rows)

---

## MVP Scope

**Parts 1 & 2** of the workbook:
- **Part 1: Roots** - Self-discovery (skills, values, personality, energy)
- **Part 2: Trunk** - Life alignment (values, decisions, storytelling)

Part 3 (Branches - job search) is post-MVP.

---

## Build Phases

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Foundation (DB, Auth, Onboarding) | **Complete** |
| 2 | Conversation UI (Design System, Messages, Forms) | Not Started |
| 2.5 | Connections Audit (map data flows) | Not Started |
| 3 | Tools (16 MVP tools) | Not Started |
| 4 | Navigation (Dashboard, TOC, Profile) | Not Started |
| 5 | Polish (Feedback, A11y, Performance) | Not Started |

---

## Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run dev server
npm run dev

# Build
npm run build

# Deploy to Cloudflare
npx wrangler pages deploy .next
```

---

## Tracking

See `CLAUDE.md` for:
- Current sprint tasks
- Decision log
- Change log
- Spec quick-reference tables
- Common mistakes to avoid

---

## Content Flow

```
stem (sequencing backbone, 821 rows)
  ├── content_blocks (static text: headings, instructions, notes)
  ├── prompts (user inputs: textarea, slider, checkbox, etc.)
  └── tools (interactive components: list_builder, ranking_grid, etc.)
```

**Exercise ID pattern**: `1.1.1.v1` = Part.Module.Exercise.Version

**Progression**: Strictly linear based on `stem.sequence`. Users unlock content sequentially.

---

## Key Frameworks (Content)

- **SOARED** (Original by Braedon): Situation, Obstacle, Action, Result, Evaluation, Discovery
- **Skills Taxonomy** (Sydney Fine): Transferable, Self-Management, Knowledges
- **Competency Framework** (OECD-adapted): 15 competencies, 5 levels
- **Life Dashboard** (Burnett): Work, Play, Love, Health (1-10 ratings)

---

## Auth Model

- Anonymous users get session + can use app
- "Claim account" adds email/password
- PII fields encrypted with user-derived key
- Password loss = encrypted data lost (intentional privacy feature)
