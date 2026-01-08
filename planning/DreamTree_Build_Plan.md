# DreamTree Build Plan

> **For**: Claude Code execution  
> **Scope**: MVP (Parts 1 & 2)  
> **Stack**: Next.js → Cloudflare Pages, D1 (SQLite)  
> **Timeline**: Phases 1-5, sequential

---

## Pre-Build: Project Setup

### Repository Structure
```
dreamtree/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── (auth)/             # Auth routes (login, signup, reset)
│   │   ├── (main)/             # Main app routes
│   │   │   ├── page.tsx        # Dashboard
│   │   │   ├── workbook/       # Conversation interface
│   │   │   ├── tools/[id]/     # Tool pages
│   │   │   └── profile/        # Profile page
│   │   ├── api/                # API routes
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles + CSS variables
│   ├── components/
│   │   ├── shell/              # AppShell, NavBar, Header, InputArea
│   │   ├── conversation/       # MessageContent, MessageUser, Thread
│   │   ├── forms/              # TextInput, TextArea, Slider, etc.
│   │   ├── tools/              # Tool-specific components
│   │   ├── feedback/           # Button, Toast, Tooltip, etc.
│   │   ├── overlays/           # Modal, TOCPanel, Backdrop
│   │   └── onboarding/         # OnboardingFlow, steps
│   ├── lib/
│   │   ├── db/                 # D1 client, queries
│   │   ├── auth/               # Auth utilities, encryption
│   │   ├── hooks/              # Custom React hooks
│   │   └── utils/              # Helpers (timestamps, IDs, etc.)
│   └── types/                  # TypeScript definitions
├── migrations/                 # D1 migrations
├── seed/                       # CSV imports, reference data
├── public/                     # Static assets
├── wrangler.toml               # Cloudflare config
└── package.json
```

### Initial Commands
```bash
npx create-next-app@latest dreamtree --typescript --tailwind --app --src-dir
cd dreamtree
npm install @cloudflare/next-on-pages wrangler
npm install nanoid bcryptjs
npm install -D @types/bcryptjs
```

### wrangler.toml
```toml
name = "dreamtree"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "dreamtree-db"
database_id = "<create-and-fill>"
```

---

## Phase 1: Foundation (Database + Auth + Onboarding)

### 1.1 Database Schema

**File**: `migrations/0001_initial.sql`

Create all 40 tables in dependency order:

```sql
-- REFERENCE TABLES (no dependencies)
-- personality_types, competencies, competency_levels, skills, references

-- CONTENT TABLES (reference only)
-- content_blocks, prompts, tools, connections, data_objects, ongoing_practices, stem

-- CORE TABLES
-- users, auth, emails, sessions, user_settings, user_modules

-- USER DATA TIER 1
-- user_profile, user_values, user_skills, user_stories, user_experiences,
-- user_experience_skills, user_locations, user_career_options, user_budget,
-- user_flow_logs, user_companies, user_contacts, user_jobs,
-- user_idea_trees, user_idea_nodes, user_idea_edges

-- USER DATA TIER 2
-- user_responses, user_lists, user_list_items, user_checklists

-- ASSESSMENTS
-- user_competency_scores

-- ATTRIBUTION
-- content_sources
```

**Deliverables**:
- [ ] Complete SQL migration file with all tables, constraints, indexes
- [ ] Apply migration: `wrangler d1 execute dreamtree-db --file=migrations/0001_initial.sql`

### 1.2 Seed Content Data

**File**: `seed/import-content.ts`

Import from provided CSVs:
- `stem.csv` (843 rows)
- `content_blocks.csv` (669 rows)
- `prompts.csv` (171 rows)
- `tools.csv` (29 rows)
- `connections.csv` (12 rows)
- `data_objects.csv` (30 rows)
- `ongoing_practices.csv` (5 rows)

**Deliverables**:
- [ ] CSV parsing script
- [ ] D1 batch insert (500 rows per batch for D1 limits)
- [ ] Verify row counts match

### 1.3 Seed Reference Data

**File**: `seed/import-reference.ts`

Create reference data:
- `personality_types` (16 MBTI types)
- `competencies` (15 OECD competencies)
- `competency_levels` (75 rows: 15 × 5)
- `skills` (master list — extract from Sydney Fine categories)

**Deliverables**:
- [ ] MBTI types with career-focused summaries
- [ ] OECD competencies by category (Delivery/Interpersonal/Strategic)
- [ ] Level descriptions for each competency
- [ ] Initial skills list (can be expanded)

### 1.4 Auth System

**Files**: 
- `src/lib/auth/session.ts` — Session management
- `src/lib/auth/password.ts` — Password hashing
- `src/lib/auth/encryption.ts` — PII encryption (data key wrapping)
- `src/app/api/auth/[...route]/route.ts` — Auth API routes

**Auth Flow**:
```
New visitor → Create user (is_anonymous=1) + session + settings
             ↓
Claim account → Create auth + email, update user (is_anonymous=0)
             ↓
Return (same device) → Session cookie valid → Continue
             ↓
Return (new device) → Login → Load data
```

**API Routes**:
- `POST /api/auth/session` — Create anonymous session
- `POST /api/auth/signup` — Claim account (email/password)
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Clear session
- `POST /api/auth/reset-request` — Password reset email
- `POST /api/auth/reset-confirm` — Set new password

**Encryption Implementation**:
```typescript
// On signup
const dataKey = crypto.getRandomValues(new Uint8Array(32));
const wrappingKey = await deriveKey(password, salt); // PBKDF2
const wrappedDataKey = await wrapKey(dataKey, wrappingKey);
// Store wrappedDataKey in auth table

// On login
const wrappingKey = await deriveKey(password, salt);
const dataKey = await unwrapKey(wrappedDataKey, wrappingKey);
// Hold dataKey in session for PII operations
```

**Deliverables**:
- [ ] Session creation/validation middleware
- [ ] Password hashing with bcrypt
- [ ] Data key generation and wrapping
- [ ] All auth API routes
- [ ] Cookie handling (httpOnly, secure)

### 1.5 Onboarding Flow

**Files**: `src/components/onboarding/*`, `src/app/(auth)/onboarding/page.tsx`

**Steps**:
1. **WelcomeStep** — Introduction, "Get Started" button
2. **NameStep** — Text input for display name
3. **VisualsStep** — Background (5 options) + Font (5 options) selection
4. **CompleteStep** — Confirmation, "Begin" button

**Visual Selection Logic**:
```typescript
const backgrounds = ['ivory', 'creamy-tan', 'brown', 'charcoal', 'black'];
const fonts = ['inter', 'lora', 'courier-prime', 'shadows-into-light', 'jacquard-24'];

// Text colors are auto-selected based on background
const textColorMap = {
  'ivory': ['brown', 'charcoal', 'black'],
  'creamy-tan': ['brown', 'charcoal', 'black'],
  'brown': ['ivory', 'creamy-tan'],
  'charcoal': ['ivory', 'creamy-tan'],
  'black': ['ivory', 'creamy-tan'],
};
```

**Deliverables**:
- [ ] OnboardingFlow container with step management
- [ ] All 4 step components
- [ ] ColorSwatch and FontPreview components
- [ ] Save to user_settings on complete
- [ ] Redirect to dashboard

---

## Phase 2: Core Conversation UI

### 2.1 Design System Implementation

**File**: `src/app/globals.css`

Implement CSS variables from Design System spec:

```css
:root {
  /* Colors */
  --color-ivory: #FAF8F5;
  --color-creamy-tan: #E8DCC4;
  --color-brown: #5C4033;
  --color-charcoal: #2C3E50;
  --color-black: #1A1A1A;
  
  /* Semantic - Light */
  --color-primary-light: #1B7B6D;
  --color-success-light: #2D6A4F;
  --color-warning-light: #B5651D;
  --color-error-light: #9B2C2C;
  --color-muted-light: #6B6B6B;
  
  /* Semantic - Dark */
  --color-primary-dark: #4ECDC4;
  --color-success-dark: #6BCB77;
  --color-warning-dark: #F4A261;
  --color-error-dark: #E57373;
  --color-muted-dark: #A0A0A0;
  
  /* Spacing (4px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  
  /* Typography */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.563rem;
  --text-2xl: 1.938rem;
  --text-3xl: 2.438rem;
  
  /* Borders & Radii */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  --border-thin: 1px;
  
  /* Transitions */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  
  /* Z-Index Scale */
  --z-content: 0;
  --z-header: 10;
  --z-input: 20;
  --z-nav: 30;
  --z-backdrop: 40;
  --z-modal: 50;
  --z-toast: 60;
  
  /* Layout */
  --content-max-width: 720px;
  --message-max-width: 65ch;
}

/* Theme classes applied to body */
.theme-light {
  --color-bg: var(--color-ivory);
  --color-text: var(--color-charcoal);
  --color-primary: var(--color-primary-light);
  /* ... */
}

.theme-dark {
  --color-bg: var(--color-charcoal);
  --color-text: var(--color-ivory);
  --color-primary: var(--color-primary-dark);
  /* ... */
}
```

**Deliverables**:
- [ ] Complete CSS variables
- [ ] Theme class generation from user settings
- [ ] Font loading (Google Fonts)
- [ ] Font-specific adjustments (size, letter-spacing)

### 2.2 App Shell

**Files**: `src/components/shell/*`

**Components**:
- **AppShell** — Root layout, responsive nav positioning
- **NavBar** — 4 items (Home, Contents, Tools, Profile)
- **NavItem** — Icon + label, active state
- **Header** — Breadcrumb bar, auto-hide after 20s
- **Breadcrumb** — Part › Module › Exercise trail
- **InputArea** — Bottom input region

**Responsive Behavior**:
```
< 768px (mobile):   Nav at bottom, single column
768-1023px (tablet): Nav at bottom, wider content
≥ 1024px (desktop):  Nav rail on left, max-width content
```

**Deliverables**:
- [ ] AppShell with responsive layout
- [ ] NavBar with all 4 items
- [ ] Header with auto-hide behavior
- [ ] Breadcrumb component
- [ ] InputArea (fixed bottom)

### 2.3 Conversation Components

**Files**: `src/components/conversation/*`

**Components**:
- **ConversationThread** — Container, scroll management, message sequencing
- **MessageContent** — DreamTree content (left-aligned, no bubble)
- **MessageUser** — User responses (right-aligned, bubble)
- **TypingEffect** — Character reveal animation
- **Timestamp** — Date markers
- **Divider** — Section separators

**Message Display Pattern**:
```
DreamTree content: left-aligned, no bubble, plain text
User responses: right-aligned, subtle bubble (primary @ 15% opacity)
```

**Deliverables**:
- [ ] ConversationThread with scroll-to-bottom
- [ ] MessageContent with content_type handling (heading, instruction, note)
- [ ] MessageUser with bubble styling
- [ ] TypingEffect (optional, can defer)
- [ ] Timestamp and Divider

### 2.4 Content Rendering Engine

**Files**: `src/lib/content/*`, `src/app/(main)/workbook/page.tsx`

**Core Logic**:
```typescript
// Get user's current position
const currentPosition = await db.query(`
  SELECT MAX(s.sequence) as position
  FROM user_responses ur
  JOIN stem s ON s.id = ur.stem_id
  WHERE ur.user_id = ?
`, [userId]);

// Get next content batch (up to next prompt/tool)
const nextContent = await db.query(`
  SELECT s.*, 
    CASE s.block_type
      WHEN 'content' THEN cb.content
      WHEN 'prompt' THEN p.prompt_text
      WHEN 'tool' THEN t.name
    END as content,
    CASE s.block_type
      WHEN 'content' THEN cb.content_type
      WHEN 'prompt' THEN p.input_type
      WHEN 'tool' THEN 'tool'
    END as type
  FROM stem s
  LEFT JOIN content_blocks cb ON s.block_type = 'content' AND s.content_id = cb.id
  LEFT JOIN prompts p ON s.block_type = 'prompt' AND s.content_id = p.id
  LEFT JOIN tools t ON s.block_type = 'tool' AND s.content_id = t.id
  WHERE s.sequence > ?
  ORDER BY s.sequence
  LIMIT 50
`, [currentPosition]);
```

**Deliverables**:
- [ ] Content fetching by sequence
- [ ] Block type routing (content → MessageContent, prompt → Form, tool → Tool)
- [ ] Progress tracking (user_responses, user_modules)
- [ ] Auto-save on prompt completion

### 2.5 Form Inputs

**Files**: `src/components/forms/*`

**Components** (from prompts.input_type):
- **TextInput** — Single-line (`text_input`)
- **TextArea** — Multi-line, expandable (`textarea`)
- **Slider** — Ordinal scale (`slider`)
- **Checkbox** — Binary (`checkbox`)
- **CheckboxGroup** — Multi-select (`checkbox_group`)
- **RadioGroup** — Single select (`radio`)
- **Select** — Dropdown (`select`)

**Props Pattern**:
```typescript
interface FormInputProps {
  promptId: string;
  inputType: string;
  inputConfig?: Record<string, unknown>;
  initialValue?: string;
  onSubmit: (value: string) => void;
  disabled?: boolean;
}
```

**Deliverables**:
- [ ] All form input components
- [ ] Input config parsing (labels, options)
- [ ] Validation states
- [ ] Keyboard submission (Enter for single-line, Cmd+Enter for multi)

---

## Phase 3: Tools

### 3.1 Tool Architecture

**Files**: `src/components/tools/*`, `src/app/(main)/tools/[id]/page.tsx`

**Dual-Context Pattern**:
Tools work both embedded in conversation AND as standalone pages.

```typescript
interface ToolProps {
  toolId: string;
  context: 'embedded' | 'standalone';
  connectionId?: string;  // For data hydration
  onComplete?: (data: unknown) => void;
}
```

**Tool Page Structure**:
- List of instances (cards)
- Create new instance button
- Instance detail view (edit mode)

### 3.2 Core Tools (MVP Priority)

Build in this order (frequency of use in Parts 1-2):

| Priority | Tool | ID | Complexity |
|----------|------|-----|------------|
| 1 | list_builder | 100000 | Medium |
| 2 | soared_form | 100001 | Medium |
| 3 | ranking_grid | 100003 | High |
| 4 | skill_tagger | 100002 | High |
| 5 | mbti_selector | 100004 | Low |
| 6 | flow_tracker | 100006 | Medium |
| 7 | life_dashboard | 100007 | Low |
| 8 | budget_calculator | 100005 | Medium |
| 9 | bucketing_tool | 100027 | Medium |
| 10 | competency_assessment | 100028 | High |
| 11 | idea_tree | 100010 | High |
| 12 | failure_reframer | 100009 | Low |
| 13 | mindset_profiles | 100008 | Low |
| 14 | career_timeline | 100012 | Medium |
| 15 | career_assessment | 100013 | Medium |
| 16 | job_combiner | 100011 | Medium |

**Deliverables per tool**:
- [ ] Component implementation
- [ ] Data storage (which user table?)
- [ ] Standalone page view
- [ ] Embedded view

### 3.3 Tool Data Mapping

| Tool | Primary Storage | Notes |
|------|-----------------|-------|
| list_builder | user_lists + user_list_items | Generic |
| soared_form | user_stories | Structured SOARED fields |
| ranking_grid | user_skills (rank), user_locations (rank) | Updates rank field |
| skill_tagger | user_skills, user_experience_skills | Junction table |
| mbti_selector | user_settings.personality_type | Single field |
| flow_tracker | user_flow_logs | Daily entries |
| life_dashboard | user_profile.life_dashboard_* | 4 fields |
| budget_calculator | user_budget | Single row |
| bucketing_tool | user_skills (updates mastery/rank) | Batch update |
| competency_assessment | user_competency_scores | 15 scores |
| idea_tree | user_idea_trees + nodes + edges | Graph structure |
| failure_reframer | user_stories (story_type='reframe') | Story variant |
| career_timeline | user_career_options + custom | Timeline data |
| career_assessment | user_career_options (scores) | Score fields |

### 3.4 Connections Implementation

**File**: `src/lib/connections/*`

Connections define data flow between exercises. Current CSV has 12 connections with rough instructions.

**Connection Schema** (refined):
```typescript
interface Connection {
  id: string;
  name: string;
  method: 'fetch' | 'hydrate' | 'transform' | 'custom';
  params: {
    source_table?: string;
    source_query?: string;
    target_tool?: string;
    transform?: string;
    instructions?: string[];
  };
}
```

**Implementation Pattern**:
```typescript
async function executeConnection(connectionId: string, userId: string) {
  const connection = await getConnection(connectionId);
  
  switch (connection.method) {
    case 'fetch':
      // Query source table, return raw data
      return fetchData(connection.params.source_query, userId);
    
    case 'hydrate':
      // Fetch and pre-populate tool
      const data = await fetchData(connection.params.source_query, userId);
      return { toolId: connection.params.target_tool, initialData: data };
    
    case 'transform':
      // Fetch, transform, return
      const raw = await fetchData(connection.params.source_query, userId);
      return applyTransform(raw, connection.params.transform);
    
    case 'custom':
      // Execute custom logic per instructions
      return executeCustom(connection.params.instructions, userId);
  }
}
```

**Deliverables**:
- [ ] Refine connections.csv with proper method/params
- [ ] Connection executor
- [ ] Integration with tool rendering

---

## Phase 4: Navigation & Pages

### 4.1 Dashboard

**File**: `src/app/(main)/page.tsx`

**Sections**:
1. **Daily Dos** — Tools with reminders due today
2. **Progress Summary** — Parts/Modules/Exercises completed
3. **Profile Preview** — Name, top skills, visual settings
4. **Quick TOC** — Continue where you left off

**Daily Dos Query**:
```sql
SELECT t.* FROM tools t
WHERE t.has_reminder = 1
  AND t.id IN (
    -- Tool is unlocked
    SELECT DISTINCT s.content_id FROM stem s
    JOIN user_responses ur ON ur.stem_id <= s.id
    WHERE ur.user_id = ? AND s.block_type = 'tool'
  )
  AND NOT EXISTS (
    -- No entry within reminder period
    SELECT 1 FROM user_flow_logs ufl
    WHERE ufl.user_id = ?
      AND ufl.logged_date >= date('now', '-1 day')
      AND t.id = 100006  -- flow_tracker specific
  );
```

**Deliverables**:
- [ ] Dashboard layout
- [ ] DailyDoList component
- [ ] ProgressMetrics component
- [ ] ProfilePreview component

### 4.2 TOC Panel

**Files**: `src/components/overlays/TOCPanel.tsx`

**Structure**:
```
Part 1: Roots
  Module 1.1: Skills
    Exercise 1.1.1: Experience ✓
    Exercise 1.1.2: Stories ◐
    Exercise 1.1.3: Knowledge 🔒
  Module 1.2: Environment
    ...
Part 2: Trunk
  ...
```

**States**: locked | available | in-progress | complete

**Deliverables**:
- [ ] TOCPanel sliding overlay
- [ ] TOCPart, TOCModule, TOCExercise components
- [ ] Progress state calculation
- [ ] Navigation on click

### 4.3 Tools Index

**File**: `src/app/(main)/tools/page.tsx`

Grid of unlocked tools with:
- Icon
- Name
- Instance count
- Last used

**Deliverables**:
- [ ] Tools grid layout
- [ ] Tool card component
- [ ] Filter by unlocked
- [ ] Sort by recent

### 4.4 Profile Page

**File**: `src/app/(main)/profile/page.tsx`

**Sections**:
1. **Identity** — Name, headline, summary
2. **Skills** — Top 10 per category
3. **Values** — Work/Life/Compass statements
4. **Settings** — Visual preferences, account
5. **Export** — Download data (future)

**Deliverables**:
- [ ] Profile layout
- [ ] Editable sections
- [ ] Settings panel
- [ ] Account management (email, password)

---

## Phase 5: Polish & Launch Prep

### 5.1 Feedback Components

- [ ] Toast notifications (auto-dismiss)
- [ ] SaveIndicator (auto-save confirmation)
- [ ] ProgressMarker (completion states)
- [ ] EmptyState (no content placeholders)
- [ ] Tooltip (hover info)

### 5.2 Accessibility Audit

- [ ] WCAG AA contrast verification
- [ ] Keyboard navigation (all interactive elements)
- [ ] Focus management (modals, overlays)
- [ ] Screen reader testing
- [ ] Touch targets (44px minimum)

### 5.3 Performance

- [ ] Content pagination (don't load all 843 stems)
- [ ] Image optimization
- [ ] Font subsetting
- [ ] D1 query optimization
- [ ] Edge caching strategy

### 5.4 Error Handling

- [ ] API error responses
- [ ] Client error boundaries
- [ ] Offline detection
- [ ] Session expiry handling

### 5.5 Testing

- [ ] Auth flow (anonymous → claimed → return)
- [ ] Content progression (all 843 sequences)
- [ ] Tool operations (CRUD)
- [ ] Responsive breakpoints
- [ ] Cross-browser (Chrome, Safari, Firefox)

---

## Open Decisions

### Auth Questions
1. **Session duration?** — Suggest 30 days, refresh on activity
2. **Password requirements?** — Suggest 8+ chars, no complexity rules
3. **Reset link expiry?** — Suggest 1 hour

### Content Questions
1. **Connections refinement** — 12 connections need method/params defined
2. **Skills master list** — Source for initial ~200 skills?
3. **MBTI summaries** — Career-focused summaries for 16 types?

### UX Questions
1. **Typing effect** — Include or skip for MVP?
2. **Tool reminders** — Only flow_tracker has reminder; add more?
3. **Progress persistence** — Auto-save frequency?

---

## File Checklist

### Migrations
- [ ] `migrations/0001_initial.sql` — All 40 tables

### Seed Data
- [ ] `seed/content.ts` — Import CSVs
- [ ] `seed/reference.ts` — MBTI, competencies, skills

### Lib
- [ ] `src/lib/db/client.ts` — D1 wrapper
- [ ] `src/lib/db/queries.ts` — Common queries
- [ ] `src/lib/auth/session.ts` — Session management
- [ ] `src/lib/auth/password.ts` — Password hashing
- [ ] `src/lib/auth/encryption.ts` — PII encryption
- [ ] `src/lib/content/engine.ts` — Content sequencing
- [ ] `src/lib/connections/executor.ts` — Connection logic

### Components (60+)
See Component Spec sections 2-10 for full list.

### Pages
- [ ] `src/app/(auth)/login/page.tsx`
- [ ] `src/app/(auth)/signup/page.tsx`
- [ ] `src/app/(auth)/onboarding/page.tsx`
- [ ] `src/app/(main)/page.tsx` — Dashboard
- [ ] `src/app/(main)/workbook/page.tsx` — Conversation
- [ ] `src/app/(main)/tools/page.tsx` — Tools index
- [ ] `src/app/(main)/tools/[id]/page.tsx` — Tool detail
- [ ] `src/app/(main)/profile/page.tsx` — Profile

### API Routes
- [ ] `src/app/api/auth/[...route]/route.ts`
- [ ] `src/app/api/content/route.ts`
- [ ] `src/app/api/responses/route.ts`
- [ ] `src/app/api/tools/[id]/route.ts`

---

## Estimated Effort

| Phase | Components | Estimate |
|-------|------------|----------|
| Phase 1: Foundation | 15 | 2-3 days |
| Phase 2: Conversation UI | 20 | 2-3 days |
| Phase 3: Tools | 25 | 4-5 days |
| Phase 4: Navigation | 15 | 2-3 days |
| Phase 5: Polish | 10 | 2-3 days |
| **Total** | **85** | **12-17 days** |

---

*Ready for Claude Code execution. Start with Phase 1.1 (Database Schema).*
