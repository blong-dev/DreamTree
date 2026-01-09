# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## The Soul of DreamTree

**Before writing any code, understand what we're building and why.**

DreamTree is **not** a career quiz, a job board, or a productivity tool.

DreamTree is a **trusted companion** that guides users through self-discovery via conversation. It's the experience of sitting with a thoughtful coach who asks good questions, listens to your answers, and helps you see patterns you couldn't see alone.

**The defining metaphor**: "Texting through a guided workbook."

### The Four Pillars

Every implementation decision should serve these pillars:

#### 1. Conversational Intimacy
The interface should feel like a dialogue, not a form.
- **DreamTree speaks** (left-aligned, no bubble) — like receiving a message from a friend
- **You respond** (right-aligned, subtle bubble) — like sending a reply
- **Typing effect** creates the feeling that DreamTree is "thinking" before responding
- **The UI recedes** — chrome auto-hides, leaving just you and the conversation
- **History scrolls up** — new content appears at the bottom, like any chat app

The conversation metaphor isn't decoration. It's the core emotional experience.

#### 2. User Autonomy & Respect
DreamTree never rushes you, gamifies your progress, or makes you feel behind.
- **No time pressure** — work at your own pace
- **Click to skip** typing if you're impatient — respects your time
- **No forced flows** — you can scroll back, edit previous answers, explore
- **Your aesthetic** — you choose colors and fonts; it's YOUR space
- **No gamification** — no points, badges, streaks, or leaderboards

The tone is professional coaching, not an app trying to "engage" you.

#### 3. Data Sovereignty
Your data belongs to you. Period.
- **User-derived encryption** for sensitive PII — even Braedon can't read it
- **Full export** anytime — JSON for restore, ZIP for reading
- **Delete everything** with confirmation
- **Open source core** — trust through transparency

This isn't privacy theater. It's architectural commitment.

#### 4. Magic Moments (Connections)
The app remembers what you've said and weaves it back meaningfully.
- Exercise 2.1 might say: "Remember when you described feeling energized by [X]? Let's find work that gives you more of that."
- Your SOARED stories become resume bullet points
- Your values from Part 1 inform your non-negotiables in Part 2
- 34+ connection points where past inputs resurface

These moments create the feeling of being truly heard and understood.

### What Soul Violations Look Like

If your implementation does any of these, stop and reconsider:
- **Form-like UI** — multiple inputs visible at once, wizard steps, progress bars with percentages
- **Gamification** — points, badges, streaks, confetti, celebratory animations
- **Time pressure** — countdowns, session warnings, "complete by" deadlines
- **Data opacity** — analytics without consent, unclear what's stored, no export option
- **Broken conversation** — prompts shown twice, jarring transitions, non-chat layouts

---

## Team Delegation

**For task routing and area-specific guidance, see `team/MANAGER.md`.**

The codebase is organized into 9 work areas with dedicated documentation:

| Area | File | Focus |
|------|------|-------|
| Database & Data | `team/areas/database.md` | Schema, queries, connections |
| Auth & Security | `team/areas/auth.md` | Sessions, encryption |
| Shell & Navigation | `team/areas/shell.md` | Layout, nav, overlays |
| UI Primitives | `team/areas/ui-primitives.md` | Forms, feedback, icons |
| Conversation | `team/areas/conversation.md` | Chat interface |
| Tools | `team/areas/tools.md` | 15 interactive tools |
| Features | `team/areas/features.md` | Dashboard, onboarding, profile |
| Workbook | `team/areas/workbook.md` | Exercise delivery |
| Design System | `team/areas/design-system.md` | CSS, theming |

Before starting work, identify the relevant area and read its documentation for patterns, gotchas, and testing guidance.

---

## Build Commands

```bash
npm run dev          # Start development server
npm run build        # Production build (validates TypeScript)
npm run build:pages  # Build for Cloudflare (OpenNext)
npm run deploy       # Build and deploy to Cloudflare Workers
npm run lint         # ESLint
npm install --legacy-peer-deps  # Install dependencies (legacy-peer-deps required)
```

**Deployment**: Uses `@opennextjs/cloudflare` to deploy Next.js to Cloudflare Workers.

---

## Architecture

**Stack**: Next.js 15 (App Router) → Cloudflare Workers, D1 (SQLite)

**CSS Strategy**: CSS custom properties only (no Tailwind utilities in components). All design tokens live in `globals.css`.

**Auth Model**: Accounts required. Users sign up → onboarding → workbook. D1 sessions with cookies. PII fields use AES-GCM encryption with user-derived keys.

### The Three-Part Journey (The Tree)

| Part | Metaphor | Focus |
|------|----------|-------|
| **1: Roots** | Self-knowledge | Who are you? Skills, values, personality, what energizes you |
| **2: Trunk** | Connecting | Bridge past to future. Stories, decision frameworks, priorities |
| **3: Branches** | Reaching out | Into the world. Networking, job search, professional presence |

Linear progression, but not rigid. Complete exercise N-1 to access N, but there's no "done" button. The conversation flows seamlessly.

### Content Flow

```
stem (821 rows, sequencing backbone)
├── content_blocks (static text: headings, instructions)
├── prompts (user inputs: textarea, slider, checkbox)
└── tools (interactive components: list_builder, ranking_grid)
```

**Exercise IDs**: `1.1.1.v1` = Part.Module.Exercise.Version

**Progression**: Linear based on `stem.sequence`. Users unlock content sequentially.

### Database

40 tables in `migrations/0001_initial.sql`. Types in `src/types/database.ts`.

---

## MANDATORY: Specification Adherence

**This project has specs refined over 7 years. Every implementation decision MUST follow these specs exactly.**

### Before Writing ANY Code:

1. **Read the relevant spec** in `/planning/`
2. **Use exact values** - hex codes, spacing, z-index from specs
3. **Match props exactly** - Component Spec defines what props exist
4. **Do NOT invent alternatives** or add features not in specs

### Specification Files

| File | When to Reference |
|------|-------------------|
| `DreamTree_Design_System.md` | ANY visual/styling work |
| `DreamTree_Component_Spec.md` | Building ANY component |
| `DreamTree_Data_Architecture_v4.md` | ANY data work |
| `DreamTree_Build_Plan.md` | Planning ANY feature |
| `component parts/*.md` | Detailed specs by component category |

### Critical Values (Never Guess)

**Colors**:
| Name | Hex | Usage |
|------|-----|-------|
| Ivory | `#FAF8F5` | Light background |
| Creamy Tan | `#E8DCC4` | Warm background |
| Brown | `#5C4033` | Dark background/text |
| Charcoal | `#2C3E50` | Dark background/text |
| **Sage** | `#7D9471` | **Primary accent (brand)** |
| **Rust** | `#A0522D` | **Secondary accent (brand)** |
| Black | `#1A1A1A` | Darkest background |

**Spacing** (4px base): space-1 (4px) through space-16 (64px)

**Z-Index** (UI: 0-40, Overlays: 100-400):
```
UI:       z-base: 0, z-raised: 10, z-header: 20, z-nav: 30, z-input: 40
Overlays: z-backdrop: 100, z-overlay: 200, z-modal: 300, z-tooltip: 400
```

**Fonts**: inter, lora, courier-prime, shadows-into-light, jacquard-24

### Color Pairing Rules (WCAG AA)

- Light backgrounds (Ivory, Creamy Tan) → Dark text only (Brown, Charcoal, Black)
- Dark backgrounds (Brown, Charcoal, Black) → Light text only (Ivory, Creamy Tan)

### Design Constraints

- **NO SHADOWS** - Use borders only
- **User-owned aesthetic** - Colors/fonts chosen at onboarding
- **Reduced motion** - All animations must respect `prefers-reduced-motion`
- **Font weights** - Shadows Into Light and Jacquard 24 only have weight 400

---

## MANDATORY: Post-Task Quality Check

**After completing ANY task, perform this verification:**

1. **Double check your work** - Review all changes made
2. **Check all documentation thoroughly** - Ensure specs in `/planning/` match implementation
3. **Think through user experience** - Would this actually work for users? Does it make sense in context?
4. **Verify data flow** - Does it capture and move data how we need it to?
5. **Check connections** - Does it work with the connections system? Are data sources aligned?
6. **Soul check** - Does this serve the four pillars? Would a user feel coached, not processed?

This applies to: new features, bug fixes, refactors, tool implementations, and schema changes.

---

## Build Status

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Foundation (DB, Auth, Onboarding) | **Complete** |
| 2 | Conversation UI (Design System, Messages, Forms) | **Complete** |
| 2.5 | Connections Audit | **Complete** |
| 3 | Tools (15 MVP tools) | **Complete** |
| 4 | Navigation (Dashboard, TOC, Profile) | **Complete** |
| 5 | Polish (Feedback, A11y, Performance) | **Complete** |
| 6 | Workbook Content Delivery | **Complete** |
| 7 | Auth System (Required accounts) | **Complete** |
| 8 | Data APIs & Tool Integration | **Complete** |
| 9 | Tool Response Storage Fix | **Complete** |
| 10 | Profile & Tools Pages | **Complete** |
| 11 | Connections System Repair | **Complete** |
| 12 | UX Bug Fixes (Chat-like experience) | **In Progress** |

### Roadmap (Not Yet Started)
- Anonymous mode (cookie-based persistence before account creation)
- AI coaching add-on (paid tier)
- Tool reminders (daily/weekly/monthly prompts)

---

## Reference

- **Content Data**: `/planning/tables/*.csv` (stem, prompts, tools, connections)
- **Build Tracking**: Decision log and change log in this file below
- **Live Site**: https://dreamtree.org

---

## Learnings (Compounding Engineering)

Mistakes and patterns discovered during development. Add new learnings as they occur to avoid repeating issues.

### General
- Always use `--legacy-peer-deps` when running `npm install`
- bcryptjs works in edge runtime, native bcrypt does NOT
- Use `@opennextjs/cloudflare` with `getCloudflareContext()` for D1 access

### Database
- SQLite has no BOOLEAN type - use INTEGER with 0/1
- Always check `result.results` array length, not truthiness
- D1 has max 100KB result size per query

### CSS/Styling
- NO box-shadows anywhere - use borders for elevation
- Shadows Into Light and Jacquard 24 only have font-weight 400
- Always use CSS custom properties, never hardcoded values

### Components
- Form components must be controlled (value + onChange required)
- TypingEffect needs stable keys to avoid re-animation
- Toast z-index must be 400 (above modals)

### Workbook
- Exercise IDs in URLs omit version (`1.2.3`), but DB may need it (`1.2.3.v1`)
- Resolve connections BEFORE rendering tools, not during
- One block at a time with click-to-continue for content blocks

### Auth
- Accounts now required - no anonymous access (roadmap item)
- Session cookie: HttpOnly, Secure (prod), SameSite=Lax
- Use `cookies().set()` in Server Components, not `new Headers()`
- Login redirects: existing user → dashboard, new user → onboarding
- Onboarding redirects to `/workbook` (skips dashboard on first login)

### Conversation UX
- New content appears at bottom (like chat apps)
- User can scroll back through history
- Enter key advances content blocks or submits input
- Auto-save silently (no visible indicator)

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-07 | Z-index: UI (0-40), overlays (100-400) | Clean separation, room to grow |
| 2026-01-07 | Typing effect: YES | 30ms/char, click-to-skip |
| 2026-01-07 | Connections audit before Phase 3 | Map data flows before building tools |
| 2026-01-07 | Resolved z-index spec conflict | Design System had 50/60/70; updated to 20/30/40 for cleaner scale |
| 2026-01-09 | OpenNext for Cloudflare | Replaced @cloudflare/next-on-pages with @opennextjs/cloudflare |

---

## Change Log

### 2026-01-07
- **Phase 1 Complete**: DB schema (40 tables), TypeScript types, seed data (3,221 rows), auth system, onboarding flow
- **Phase 2 Complete**: globals.css with Design System values, shell components (AppShell, NavBar, NavItem, Header, Breadcrumb, InputArea), conversation components (ConversationThread, MessageContent, MessageUser, TypingEffect, Timestamp, Divider), form components (TextInput, TextArea, Slider, Checkbox, CheckboxGroup, RadioGroup, Select)
- **Phase 2.5 Complete**: Connections infrastructure (`src/lib/connections/`), ConnectionResolver class, typed data sources (SOARED, skills, flow, values, careers), support for auto_populate, hydrate, reference_link, and custom connection methods
- **Phase 3 Complete**: All 15 MVP tools built in `src/components/tools/`:
  - ListBuilder, SOAREDForm, RankingGrid, FlowTracker, LifeDashboard, FailureReframer, BucketingTool
  - SkillTagger, MBTISelector, BudgetCalculator, IdeaTree, MindsetProfiles
  - CareerTimeline, CareerAssessment, CompetencyAssessment
  - Types for all tools in `types.ts`, comprehensive CSS in `globals.css`
  - JobCombiner removed (not needed for MVP)

### 2026-01-08
- **Phase 4 Complete**: Navigation and page components:
  - Overlay components: `src/components/overlays/` (Backdrop, TOCPanel, TOCPart, TOCModule, TOCExercise, ProgressMarker)
  - Dashboard components: `src/components/dashboard/` (DashboardGreeting, DailyDoList, DailyDoCard, ProgressMetrics, ProgressMetric, ProfilePreview, TOCInline, TOCInlinePart, TOCInlineModule, TOCInlineExercise)
  - Profile components: `src/components/profile/` (DataPolicyBanner, ProfileHeader, ProfileSection, SkillsList, RankedList, DataControls)
  - Tool page components: `src/components/tools/` (ToolPage, ToolInstanceCard)
  - Pages: Dashboard (`/`), Profile (`/profile`), Tools index (`/tools`)
  - Comprehensive CSS for all Phase 4 components in `globals.css`
- **Phase 5 Complete**: Polish and accessibility:
  - Feedback components: `src/components/feedback/` (Toast, ToastContainer, ToastContext, Tooltip, SaveIndicator, EmptyState, ErrorBoundary)
  - New icons: InfoIcon, AlertTriangleIcon, LoaderIcon
  - Providers wrapper with ToastProvider and ErrorBoundary
  - Accessibility improvements: skip link, focus-visible styles, screen reader utilities, reduced motion support
  - Touch target size enforcement (44px minimum)
  - Updated layout with proper metadata and font loading
- **Phase 6 Complete**: Workbook content delivery system:
  - API routes: `src/app/api/workbook/` ([exerciseId], response, progress)
  - Workbook pages: `/workbook` (redirect), `/workbook/[exerciseId]` (exercise view)
  - Workbook components: `src/components/workbook/` (WorkbookView, PromptInput, ToolEmbed, types)
  - Chat-like conversation interface using ConversationThread
  - Linear progression through stem sequence with typing effects
  - Structured prompt inputs (slider, checkbox, radio, select) via PromptInput
  - Tool embedding via ToolEmbed with auto-save
  - User response persistence to user_responses table
- **Branding Update**: Acorn brand identity
  - New brand colors: Sage (#7D9471), Rust (#A0522D)
  - Primary accent changed from teal to sage
  - Added `AcornIcon` component (`src/components/icons/`)
  - Added brand lockup (acorn + "dreamtree" wordmark) to NavBar
  - CSS variables updated in `globals.css`
- **Phase 7 Complete**: Auth system requiring accounts
  - Auth API routes: `/api/auth/login`, `/api/auth/signup`, `/api/auth/logout`
  - Auth pages: `/login`, `/signup` with forms
  - Middleware for route protection (`src/middleware.ts`)
  - Session cookie fix: use `cookies().set()` not `new Headers()`
  - LandingPage component for unauthenticated visitors
  - Dashboard server component with DashboardPage client wrapper
  - Onboarding saves to D1 via `/api/onboarding`
  - Onboarding redirects directly to `/workbook` (skips dashboard)
- **Phase 8 Complete**: Data APIs and tool integration
  - Data API: `/api/data/skills` - fetch skills for SkillTagger
  - Data API: `/api/data/competencies` - fetch competencies for CompetencyAssessment
  - Data API: `/api/data/connection` - fetch user data via ConnectionResolver
  - ToolEmbed updated to fetch skills/competencies on mount
  - ToolEmbed uses connectionId to pre-populate tools with user data
  - Fixed React hook warnings (useMemo for responseMap, inlined getScore)
  - Fixed MBTISelector a11y (added role="combobox")
  - Added missing CSS classes (`.tool-embed-loading`, `.tool-embed-header`, etc.)
- **Phase 9 Complete**: Tool response storage fix
  - Migration `0003_add_tool_id_to_responses.sql` adds `tool_id` column
  - `prompt_id` now nullable (response is for prompt OR tool, not both)
  - CHECK constraint ensures exactly one of prompt_id/tool_id is set
  - Response API updated to accept `toolId` parameter
  - ToolEmbed sends `toolId` instead of misusing `promptId`
  - WorkbookView now tracks tool and prompt responses separately
- **Phase 10 Complete**: Profile & Tools pages connected to D1
  - Migration `0004_add_display_name.sql` adds missing `display_name` column to `user_profile`
  - Profile API: `/api/profile` - fetches user profile, settings, skills, values from D1
  - Profile Export API: `/api/profile/export` - exports all user data for download
  - Tool Counts API: `/api/tools/counts` - fetches entry counts per tool type
  - Tool Instances API: `/api/tools/instances` - fetches tool instances for a tool type
  - Profile page now displays real user data (name, skills, values) from D1
  - Tools index page now shows real entry counts per tool
  - New `/tools/[toolType]` page integrates ToolPage and ToolInstanceCard components
  - Empty state messages shown when user has no data yet

### 2026-01-09
- **Phase 11 Complete**: Connections system fully functional
  - Fixed ConnectionResolver to query correct columns (`connection_type`, `data_object`, `transform`)
  - Added 10+ new data source fetchers: `fetchAllSkills`, `fetchKnowledgeSkills`, `fetchWorkValues`, `fetchLifeValues`, `fetchLocations`, `fetchCompetencyScores`, `fetchIdeaTrees`, `fetchUserLists`, `fetchProfileText`
  - Updated DataSourceType with all new source types
  - Migration `0005_refine_connections.sql`: Converted 12 vague "internal" connections (100000-100011) to proper forward connections with source/filter params
  - Migration `0006_add_connections.sql`: Added 16 new connections (100018-100033) for data flow between exercises
  - Migration `0007_update_stem_connections.sql`: Set connection_id on tool rows that need prior data
  - 34 total connections now properly configured for Parts 1-2
- **OpenNext Migration**: Switched from `@cloudflare/next-on-pages` to `@opennextjs/cloudflare`
  - Updated 17 files to use `getCloudflareContext()` instead of `getRequestContext()`
  - Added CloudflareEnv type augmentation for D1 database binding
  - Deployed to Cloudflare Workers at dreamtree.org
- **Phase 12 Started**: UX bug fixes for chat-like experience
  - Edit previous answers
  - Auto-save for text prompts
  - Convert onboarding to conversation-based UI (in progress)
