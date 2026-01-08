# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Build Commands

```bash
npm run dev          # Start development server
npm run build        # Production build (validates TypeScript)
npm run lint         # ESLint
npm install --legacy-peer-deps  # Install dependencies (legacy-peer-deps required)
npx wrangler pages deploy .next  # Deploy to Cloudflare
```

## Architecture

**Stack**: Next.js 16 (App Router) → Cloudflare Pages, D1 (SQLite)

**CSS Strategy**: CSS custom properties only (no Tailwind utilities in components). All design tokens live in `globals.css`.

**Auth Model**: Anonymous users get sessions; "claim account" adds email/password. PII fields use AES-GCM encryption with user-derived keys.

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

## MANDATORY: Post-Task Quality Check

**After completing ANY task, perform this verification:**

1. **Double check your work** - Review all changes made
2. **Check all documentation thoroughly** - Ensure specs in `/planning/` match implementation
3. **Think through user experience** - Would this actually work for users? Does it make sense in context?
4. **Verify data flow** - Does it capture and move data how we need it to?
5. **Check connections** - Does it work with the connections system? Are data sources aligned?

This applies to: new features, bug fixes, refactors, tool implementations, and schema changes.

## Build Status

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Foundation (DB, Auth, Onboarding) | **Complete** |
| 2 | Conversation UI (Design System, Messages, Forms) | **Complete** |
| 2.5 | Connections Audit | **Complete** |
| 3 | Tools (16 MVP tools) | **Complete** |
| 4 | Navigation (Dashboard, TOC, Profile) | **Complete** |
| 5 | Polish (Feedback, A11y, Performance) | **Complete** |
| 6 | Workbook Content Delivery | **Complete** |

## Reference

- **Content Data**: `/planning/tables/*.csv` (stem, prompts, tools, connections)
- **Build Tracking**: Decision log and change log in this file below

---

## Learnings (Compounding Engineering)

Mistakes and patterns discovered during development. Add new learnings as they occur to avoid repeating issues.

### General
- Always use `--legacy-peer-deps` when running `npm install`
- bcryptjs works in edge runtime, native bcrypt does NOT

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

### Auth
- All users start anonymous - full workbook access without account
- Session cookie: HttpOnly, Secure (prod), SameSite=Lax

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-07 | Z-index: UI (0-40), overlays (100-400) | Clean separation, room to grow |
| 2026-01-07 | Typing effect: YES | 30ms/char, click-to-skip |
| 2026-01-07 | Connections audit before Phase 3 | Map data flows before building tools |
| 2026-01-07 | Resolved z-index spec conflict | Design System had 50/60/70; updated to 20/30/40 for cleaner scale |

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
  - Tool embedding placeholder via ToolEmbed
  - User response persistence to user_responses table
  - Session management with anonymous user support
- **Branding Update**: Acorn brand identity
  - New brand colors: Sage (#7D9471), Rust (#A0522D)
  - Primary accent changed from teal to sage
  - Added `AcornIcon` component (`src/components/icons/`)
  - Added brand lockup (acorn + "dreamtree" wordmark) to NavBar
  - CSS variables updated in `globals.css`
