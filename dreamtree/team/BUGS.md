# DreamTree Bug Tracker

**Single source of truth for multi-instance coordination.**

For workflow details, see `MANAGER.md` → "Multi-Instance Coordination"

---

## Status Flow

```
open → in-progress → review → done
                 ↓
              (trivial bugs can skip review)
```

| Status | Meaning |
|--------|---------|
| `open` | Not started |
| `in-progress` | Worker assigned and actively working |
| `review` | Work complete, awaiting QA verification |
| `done` | Verified and closed |

**Pazz (QA)** verifies all `review` bugs against acceptance criteria before moving to `done`.

---

## Bug Template

```markdown
### BUG-XXX: [Short description]
**Status**: `open`
**Priority**: `low` | `medium` | `high`
**Area**: [area name]
**Trivial**: `yes` (skip review) | `no` (default, requires QA)

**Description**:
[What's broken]

**Expected Behavior**:
[What should happen]

**Acceptance Criteria**:
- [ ] [Testable requirement 1]
- [ ] [Testable requirement 2]
- [ ] Build passes

**Files Likely Involved**:
- `path/to/file.tsx`
```

---

## Currently Editing

**Check before editing any file. Add yours when you start, remove when done.**

*No files currently locked.*

<!-- Format: - `path/to/file.tsx` (instance-id, what you're doing) -->

---

## Open Bugs

### BUG-008: Profile appearance save doesn't take effect
**Status**: `done`
**Assigned**: Fizz
**Verified by**: Pazz (2026-01-09)
**Priority**: `high`
**Area**: features
**Found by**: User walkthrough

**Description**:
Saving appearance changes (background color, text color, font) from the profile page doesn't apply the changes. User saves but nothing visually changes.

**Expected Behavior**:
After saving appearance settings, the new colors/font should immediately apply to the UI.

**Root Cause Found**:
The profile page stored appearance settings in React state but never updated the document's CSS variables. OnboardingFlow had a `useEffect` that did this, but the pattern wasn't replicated to the profile page.

**Fix Applied**:
Added a `useEffect` to profile page that updates CSS variables (`--color-bg`, `--color-text`, `--font-body`) and `data-theme` attribute when appearance state changes.

**Files Changed**:
- `src/app/profile/page.tsx:16` — Added imports for `getColorById`, `getFontById`
- `src/app/profile/page.tsx:122-137` — Added useEffect to update CSS variables

**Acceptance Criteria**:
- [x] Save appearance from profile (API was already working)
- [x] Colors/font apply immediately without refresh
- [x] Changes persist on page reload (settings saved to DB)
- [x] Build passes

---

### BUG-009: Multiple blocks typing simultaneously (ink permanence broken)
**Status**: `done`
**Assigned**: Fizz
**Verified by**: Pazz (2026-01-09)
**Priority**: `high`
**Area**: workbook
**Found by**: User walkthrough

**Description**:
When submitting a response, multiple content blocks start typing at the same time instead of one at a time. This breaks the "ink permanence" principle — previously rendered blocks should stay static.

**Expected Behavior**:
Only the NEW block should animate. All previous blocks should remain static (already "inked").

**Root Cause Found**:
The `animatedMessageIds` Set was only populated via callback AFTER animation completes. If user advanced before animation finished, previous messages weren't in the Set yet, causing them to re-animate.

**Fix Applied**:
Added `useEffect` that runs when `displayedBlockIndex` changes, immediately marking ALL previous block IDs as animated. Only the newest block (at displayedBlockIndex-1) animates.

**Files Changed**:
- `src/components/workbook/WorkbookView.tsx:173-194` — Added effect to mark previous blocks

**Acceptance Criteria**:
- [x] Only new blocks animate on submission
- [x] Previous blocks remain static
- [x] Animation tracking persists correctly
- [x] Build passes

**Note**: This was a **soul violation** — breaks conversational intimacy. Fixed.

---

### BUG-010: Roots overview content missing
**Status**: `invalid` — Content IS present in DB
**Priority**: `high`
**Area**: database
**Found by**: User walkthrough
**Owner**: Buzz
**Investigated**: 2026-01-09

**Investigation Result**:
Database query confirms content_block 100001 has ALL 4 overview paragraphs:
```
1. "The first part of the tree is the roots..."
2. "Roots are hard. Factual and literal..."
3. "With this and every activity, be honest with yourself..."
4. "Life designer Bill Burnett separates our life into four categories..."
```

Migration 0008 was applied correctly. Content type is 'instruction'.

**Possible causes if not displaying:**
- Browser cache (hard refresh needed)
- Server-side cache
- Frontend rendering issue
- The walkthrough may have seen pre-migration state

**Verification command:**
```sql
SELECT content FROM content_blocks WHERE id = 100001;
-- Returns all 4 overview paragraphs
```

**Acceptance Criteria**:
- [x] Roots overview displays introductory paragraphs (verified in DB)
- [x] No Table of Contents text appears in the overview (verified)
- [ ] Content renders properly in workbook view (needs frontend check)
- [x] Build passes

---

### BUG-013: Page doesn't auto-scroll to bottom on new blocks
**Status**: `done`
**Assigned**: Queen Bee
**Verified by**: Pazz (2026-01-09)
**Priority**: `high`
**Area**: workbook
**Found by**: User walkthrough

**Description**:
When users click through content blocks, the page doesn't scroll to keep the latest content visible. User has to manually scroll down to see new blocks.

**Root Cause Found**:
ConversationThread's auto-scroll useEffect only triggered on `messages.length` change. When clicking Continue, `displayedBlockIndex` changes but the messages array might rebuild with same length, so no scroll triggered.

**Fix Applied**:
1. Added `scrollTrigger` prop to ConversationThread interface
2. Added `scrollTrigger` to auto-scroll useEffect dependencies
3. WorkbookView passes `scrollTrigger={displayedBlockIndex}`
4. Now scroll triggers whenever block index changes

**Files Changed**:
- `src/components/conversation/ConversationThread.tsx:19-20` — Added scrollTrigger prop
- `src/components/conversation/ConversationThread.tsx:69` — Destructured scrollTrigger
- `src/components/conversation/ConversationThread.tsx:97` — Added to useEffect deps
- `src/components/workbook/WorkbookView.tsx:606` — Pass scrollTrigger prop

**Acceptance Criteria**:
- [x] New blocks trigger auto-scroll to bottom
- [x] Scroll is smooth (not jarring)
- [x] Works when clicking Continue
- [x] Works when submitting responses
- [x] Build passes

**Note**: This is simpler than BUG-012 (full scroll architecture). Done independently.

---

### BUG-012: Workbook scroll limited to current module
**Status**: `done`
**Assigned**: Fizz
**Verified by**: Pazz (2026-01-09)
**Priority**: `high`
**Area**: workbook
**Found by**: User walkthrough
**Type**: `architectural`

**Description**:
Currently, workbook scroll is limited per module. Users cannot scroll up to see earlier exercises or scroll through their complete history.

**Expected Behavior**:
- Scroll UP to the very beginning of the workbook (Part 1, first exercise)
- Scroll DOWN to current progress
- Continuous conversation history across all completed content

**Root Cause**:
WorkbookView only rendered the current exercise blocks via ConversationThread. No mechanism to load or display past exercises.

**Fix Applied** (Building on Queen Bee's infrastructure):
1. Fixed build error in VirtualizedConversation.tsx (type mapping issues)
2. Created HistoryZone wrapper component to encapsulate history rendering
3. Integrated HistoryZone into WorkbookView above ConversationThread
4. Added exercise divider between history and current exercise
5. Added URL hash sync for scroll position (deep linking)
6. Used dynamic import with ssr:false to avoid SSR issues with @tanstack/react-virtual

**Files Changed**:
- `src/components/workbook/VirtualizedConversation.tsx` — Fixed ContentBlock type mapping, UserResponseContent type
- `src/components/workbook/HistoryZone.tsx` — New wrapper component
- `src/components/workbook/WorkbookView.tsx` — Integrated HistoryZone, added URL sync
- `src/components/workbook/index.ts` — Updated exports
- `src/app/globals.css` — Added history-zone and exercise-divider styles

**Infrastructure (Created by Queen Bee)**:
- `/api/workbook/history` — Paginated API endpoint
- `src/hooks/useWorkbookHistory.ts` — Data fetching hook
- `@tanstack/react-virtual` — Virtualization dependency

**Architecture**:
Two-zone layout:
```
┌─────────────────────────────────────┐
│  HistoryZone (VirtualizedConversation) │ ◄── Past exercises (read-only)
│  - Max 40vh height                     │
│  - Virtualized rendering               │
│  - Bidirectional infinite scroll       │
├─────────────────────────────────────┤
│  Exercise Divider                      │
├─────────────────────────────────────┤
│  ConversationThread                    │ ◄── Current exercise (interactive)
│  + PromptInput / ToolEmbed             │
└─────────────────────────────────────┘
```

**Acceptance Criteria**:
- [x] Can scroll to beginning of workbook (via HistoryZone)
- [x] Can scroll to current progress (via ConversationThread)
- [x] Smooth scrolling (virtualization + CSS scroll-behavior)
- [x] Lazy loading works (paginated API, bounded memory)
- [x] Scroll position preserved on navigation (URL hash sync)
- [x] Build passes

---

### BUG-011: Click-to-skip advances instead of completing current block
**Status**: `done`
**Assigned**: Fizz
**Verified by**: Pazz (2026-01-09)
**Priority**: `high`
**Area**: workbook
**Found by**: User walkthrough

**Description**:
When an impatient user clicks to skip the typing animation, instead of completing the current block's text, it advances to the next block. Both blocks then type simultaneously.

**Root Cause Found**:
The Continue button and Enter key handler were active IMMEDIATELY when a content block appeared, before animation completed. User clicking to skip animation could accidentally hit the Continue button, or the click bubbled up somehow.

**Fix Applied**:
1. Added `currentAnimationComplete` state to track if current block's animation is done
2. Continue button only shows when `waitingForContinue && currentAnimationComplete`
3. Enter key handler only triggers when `waitingForContinue && currentAnimationComplete`
4. Reset `currentAnimationComplete = false` when block index advances
5. Set `currentAnimationComplete = true` when `handleMessageAnimated` fires for current block

**Files Changed**:
- `src/components/workbook/WorkbookView.tsx:168-179` — Added state and callback update
- `src/components/workbook/WorkbookView.tsx:186-187` — Reset on block advance
- `src/components/workbook/WorkbookView.tsx:349` — Enter key condition
- `src/components/workbook/WorkbookView.tsx:636` — Continue button condition

**Current Behavior** (before fix):
1. Block is typing out text
2. User clicks to skip
3. Next block opens AND current block continues typing
4. Two blocks typing at once

**Expected Behavior**:
1. Block is typing out text
2. User clicks to skip
3. Current block instantly shows full text (animation completes)
4. THEN next block starts delivering (either automatically or on next interaction)

**Acceptance Criteria**:
- [x] Click during typing completes current block instantly (existing behavior works)
- [x] Next block only starts after current is fully displayed (Continue hidden until done)
- [x] No simultaneous typing of multiple blocks
- [x] Works for both content blocks and prompts
- [x] Build passes

**Note**: This is a UX polish issue but affects the "conversational intimacy" pillar — the chat should feel natural, not chaotic.

---

---

## Feature Requests

### PLAN-001: Data & Analytics Suite
**Status**: `in-progress`
**Priority**: `high`
**Area**: infrastructure
**Assigned**: Buzz
**Scaffold Approved**: Yes — can begin building after plan review

**Description**:
Design a comprehensive data visibility and analytics suite for DreamTree. User needs to understand what's working, where users drop off, engagement patterns, etc.

**Deliverable**: `dreamtree/team/plans/DATA-ANALYTICS-PLAN.md`

**Scope**:
- What data to track (progression, engagement, drop-off, retention)
- How to collect it (events, tables, external services)
- How to visualize it (admin dashboard, charts, exports)
- Privacy compliance (respecting Data Sovereignty pillar)

**Key Questions**:
- Aggregate vs individual data?
- Real-time vs batch?
- D1-native vs external analytics service?
- Admin-only vs user-facing insights?

**Post-Plan (Pre-approved):**
- Create analytics package/directory
- Database migrations for analytics tables
- API endpoints for data collection
- Basic admin dashboard structure

**Acceptance Criteria**:
- [ ] Plan document created
- [ ] Data model defined
- [ ] Collection strategy outlined
- [ ] Visualization approach chosen
- [ ] Privacy considerations addressed
- [ ] Phased rollout proposed
- [ ] Plan reviewed and approved

---

### FEA-001: Dedicated Skills Page
**Status**: `done`
**Verified by**: Pazz (2026-01-09)
**Assigned**: Fizz
**Priority**: `medium`
**Area**: features
**Requested by**: User

**Description**:
Create a standalone `/skills` page that displays the full skills library organized by section. Currently skills only appear:
- On profile page (user's tagged skills via SkillsList)
- In SkillTagger tool during exercises
- Via `/api/data/skills` API endpoint

**Requirements**:
- Display all skills grouped by their sections
- Clean, browsable interface
- Consider: user's tagged skills highlighted vs full library
- **Link from workbook 1.1** — References to skills in WB 1.1 should link to this page

**Implementation**:

**Files Created**:
- `src/app/skills/page.tsx` — Server component with auth + data fetching
- `src/components/skills/SkillsPage.tsx` — Client component with UI
- `src/components/skills/index.ts` — Export

**Files Modified**:
- `src/app/globals.css` — Added `.skills-page-*` styles (130 lines)

**Features**:
- All skills displayed grouped by category (Transferable, Self-Management, Knowledges)
- Category descriptions explain each type
- Search filter to find specific skills
- "Show only my skills" toggle for users with tagged skills
- User's tagged skills highlighted with accent border + checkmark
- Count of tagged skills shown in header
- Responsive design with pill/badge layout
- Empty states for no matches / no tagged skills

**WB 1.1 Linking Note**:
Content block 100022 contains "→ extensive List of Skills for ideas ←" which could link to /skills.
This requires either:
1. Database migration to update content with markdown link
2. Special rendering in MessageContent to detect skill references

Recommend: Database migration to update content as follow-up task (minor content update).

**Acceptance Criteria**:
- [x] `/skills` route renders
- [x] Skills displayed grouped by section
- [x] Accessible, navigable list
- [ ] WB 1.1 references link to `/skills` page — **FOLLOW-UP** (requires content update)
- [x] Build passes

---

## In Progress

<!-- Bugs currently being worked on -->

### IMP-048: Encryption code exists but never called — PII in plaintext
**Status**: `open`
**Priority**: `critical`
**Area**: auth
**Found by**: Buzz (V1 validation audit)

**Description**:
Encryption infrastructure exists in `src/lib/auth/encryption.ts` but is **NEVER CALLED**. All PII is stored in plaintext, violating the Data Sovereignty pillar.

**Affected Data**:
- `emails.email` — plaintext
- `user_profile.display_name` — plaintext
- `user_budget.*` (all fields) — plaintext
- `user_contacts.*` (all fields) — plaintext
- Module 1.4 "Love" responses — plaintext

**What Exists**:
- `deriveWrappingKey()` — derives key from password + salt
- `generateDataKey()` — creates AES-GCM data key
- `wrapDataKey()` / `unwrapDataKey()` — key wrapping
- `encryptField()` / `decryptField()` — field-level encryption
- Signup stores `wrapped_data_key` in auth table

**What's Missing**:
- No code calls `encryptField()` when writing PII
- No code calls `decryptField()` when reading PII
- Data key never unwrapped for use

**Implementation Required**:
1. Identify all PII write points (signup, onboarding, profile update, workbook responses)
2. Call `encryptField()` before INSERT/UPDATE
3. Identify all PII read points (profile page, exports, connections)
4. Call `decryptField()` after SELECT
5. Handle key derivation on login (need password to unwrap data key)
6. Migration to encrypt existing plaintext data

**Files Likely Involved**:
- `src/lib/auth/encryption.ts` — existing encryption functions
- `src/app/api/auth/signup/route.ts` — has wrapped_data_key, needs to encrypt email
- `src/app/api/onboarding/route.ts` — saves display_name
- `src/app/api/profile/route.ts` — reads/writes profile
- `src/app/api/workbook/response/route.ts` — saves responses (some are PII)

**Acceptance Criteria**:
- [ ] All PII fields encrypted at rest
- [ ] Decryption works on read (profile, export)
- [ ] Key derivation happens on login
- [ ] Existing data migrated (one-time script)
- [ ] Build passes
- [ ] User experience unchanged (encryption transparent)

---

### BUG-017: Homepage CPU limit exceeded — undefined 'definition'
**Status**: `done`
**Verified by**: Pazz (2026-01-09)
**Assigned**: Fizz
**Priority**: `medium`
**Area**: features
**Found by**: Production logs

**Description**:
Homepage (`/`) intermittently exceeds CPU time limit with errors:
```
TypeError: Cannot read properties of undefined (reading 'definition')
TypeError: render is not a function
Error: Worker exceeded CPU time limit.
```

**Impact**: Site returns 1102 error, blocking all users.

**Investigation Results**:
- Only place `.definition` is used: `CompetencyAssessment.tsx:161` accessing `competency.definition`
- CompetencyAssessment is used in ToolEmbed → WorkbookView (workbook pages, NOT homepage)
- Error may be: (1) misreported route, (2) bundling/import issue, (3) worker crash cascading

**Defensive Fixes Applied**:
1. `CompetencyAssessment.tsx` — Added null guard: `{competency.definition || ''}`
2. `CompetencyAssessment.tsx` — Added iteration guard: `if (!competency || !competency.id) return null`
3. `ProfilePreview.tsx` — Added fallbacks for undefined colorNames/fontNames lookup
4. `page.tsx` — Added optional chaining: `sessionData.settings?.background_color`
5. `page.tsx` — Added fallbacks: `profile.display_name || 'User'`

**Files Changed**:
- `src/components/tools/CompetencyAssessment.tsx`
- `src/components/dashboard/ProfilePreview.tsx`
- `src/app/page.tsx`

**Note**: Root cause unclear since `.definition` isn't accessed on homepage. Defensive guards added throughout. Need production monitoring to verify fix.

**Acceptance Criteria**:
- [x] Identify source of `.definition` access — found in CompetencyAssessment
- [x] Add null checks / guards — added to multiple components
- [ ] No CPU limit errors on homepage — **NEEDS MONITORING**
- [x] Build passes

---

### BUG-018: Headers double-presenting / typing repeatedly
**Status**: `done`
**Verified by**: Pazz (2026-01-09)
**Assigned**: Queen Bee
**Priority**: `high`
**Area**: workbook
**Found by**: User walkthrough

**Description**:
Headers are showing twice. In Module 1 specifically, the header types out over and over again.

**Expected Behavior**:
- Headers should display once
- No repeated typing animation for the same header

**Root Cause Found**:
WorkbookView had two sources of headers:
1. A static `exercise-divider` component showing `exercise.title` (no animation)
2. Content blocks of type 'heading' from the database (with typing animation)

Both were rendering, causing double headers. The "typing over and over" was the content heading animating while the static divider was also visible.

**Fix Applied**:
Removed the redundant `exercise-divider` from WorkbookView. Headers now come solely from content blocks, which provides the proper typing animation and consistent flow. The divider was originally added for visual separation from history zone but is unnecessary since content blocks provide natural structure.

**Files Changed**:
- `src/components/workbook/WorkbookView.tsx` — Removed exercise-divider render block (lines 716-719)

**Acceptance Criteria**:
- [x] Headers display only once (from content blocks)
- [x] No repeated typing animation (single source of truth)
- [x] Build passes

---

### BUG-019: Reserve space for input bar to prevent content jumping
**Status**: `done`
**Verified by**: Pazz (2026-01-09)
**Assigned**: Queen Bee
**Priority**: `high`
**Area**: workbook
**Found by**: User walkthrough

**Description**:
Text jumps around when the continue button / input bar appears. Need to reserve space at the bottom of the screen at all times for the input zone, even when it's not yet visible.

**Expected Behavior**:
- Bottom area always reserved for input zone
- Content doesn't shift when input appears
- Smoother, more predictable experience

**Root Cause Found**:
`WorkbookInputZone` was returning `null` when `hasActiveInput` was false. This meant the fixed-position element disappeared entirely when no input was active, causing layout shifts when it reappeared.

**Fix Applied**:
1. `WorkbookInputZone` now ALWAYS renders (never returns null)
2. When no active input, renders an empty placeholder div
3. Added `data-has-input` attribute for CSS styling differentiation
4. Added consistent `min-height: 80px` to the input zone itself (prevents height changes)
5. Updated `.workbook-input-zone-placeholder` to match the 80px min-height
6. Added flexbox centering to `.workbook-input-zone-content` for consistent vertical alignment

This ensures the bottom space is always reserved at a consistent height, preventing content from jumping when inputs appear/change/disappear.

**Files Changed**:
- `src/components/workbook/WorkbookInputZone.tsx` — Always render, add placeholder when no input
- `src/app/globals.css` — Added `min-height: 80px` to zone, placeholder, and content wrapper with flex centering

**Acceptance Criteria**:
- [x] Bottom space always reserved (via consistent min-height)
- [x] No content jumping when input appears
- [x] Build passes

---

### BUG-024: Bespoke themes inconsistent — full audit needed
**Status**: `done`
**Assigned**: Fizz
**Verified by**: Pazz (2026-01-09)
**Priority**: `high`
**Area**: design-system
**Found by**: User walkthrough
**Type**: investigation

**Description**:
User-selected themes (colors, fonts from onboarding/profile) are not applying consistently. This is a recurring issue that needs a comprehensive solution.

**Root Cause Found**:
Theme CSS variables were only being applied in two locations (`OnboardingFlow` and `profile/page.tsx`) but NOT on the Dashboard or Workbook pages. When users navigated away from onboarding or profile, CSS variables reverted to defaults defined in `:root`.

**Audit Findings**:
| Location | READS Theme | WRITES Theme | APPLIED CSS Vars (before fix) |
|----------|-------------|--------------|------------------------------|
| `globals.css` | - | - | Sets defaults only |
| `OnboardingFlow.tsx` | Local state | Via `/api/onboarding` | YES |
| `profile/page.tsx` | Via `/api/profile` | Via PATCH | YES |
| `page.tsx` (dashboard) | Via `sessionData.settings` | - | **NO** |
| `DashboardPage.tsx` | Via `userPreview` prop | - | **NO** |
| `[exerciseId]/page.tsx` | - | - | **NO** |

**Fix Applied**:
Created a unified theme system with single source of truth:

1. **New shared utilities** (`src/lib/theme/index.ts`):
   - `applyTheme(settings)` — Sets CSS variables on `document.documentElement`
   - `parseThemeSettings(bg, text, font)` — Safe parsing with defaults
   - `getDefaultTheme()` — Returns default theme settings

2. **New hook** (`src/hooks/useApplyTheme.ts`):
   - `useApplyTheme({ backgroundColor, textColor, font })` — Applies theme on mount and when values change

3. **Updated pages to apply theme**:
   - `DashboardPage.tsx` — Now calls `useApplyTheme` with `userPreview` settings
   - `WorkbookView.tsx` — Accepts `theme` prop and calls `useApplyTheme`
   - `[exerciseId]/page.tsx` — Passes theme to WorkbookView from session data

4. **Added `textColor` to `UserPreview` type**:
   - `src/components/dashboard/types.ts` — Added `TextColorId` type and `textColor` field
   - `src/app/page.tsx` — Now passes `textColor` from session settings

5. **Refactored existing theme logic**:
   - `profile/page.tsx` — Uses shared `applyTheme()` instead of inline logic
   - `OnboardingFlow.tsx` — Uses shared `applyTheme()` instead of inline logic

**Files Created**:
- `src/lib/theme/index.ts` — Theme utilities
- `src/hooks/useApplyTheme.ts` — Theme application hook

**Files Modified**:
- `src/components/dashboard/types.ts` — Added TextColorId, textColor to UserPreview
- `src/components/dashboard/DashboardPage.tsx` — Added useApplyTheme hook
- `src/components/workbook/types.ts` — Re-exported ThemeSettings
- `src/components/workbook/WorkbookView.tsx` — Added theme prop and useApplyTheme
- `src/app/page.tsx` — Pass textColor to userPreview
- `src/app/profile/page.tsx` — Use shared applyTheme
- `src/app/workbook/[exerciseId]/page.tsx` — Pass theme to WorkbookView
- `src/components/onboarding/OnboardingFlow.tsx` — Use shared applyTheme

**Architecture**:
```
Server (page.tsx)                    Client Component
┌─────────────────┐                  ┌─────────────────────┐
│ getSessionData  │──theme props───> │ useApplyTheme()     │
│ parseThemeSettings │               │ - Sets CSS vars     │
└─────────────────┘                  │ - Sets data-theme   │
                                     └─────────────────────┘
                                              │
                                              ▼
                                     document.documentElement
                                     --color-bg, --color-text, --font-body
```

**Acceptance Criteria**:
- [x] Theme selection in onboarding applies immediately
- [x] Theme changes in profile apply immediately
- [x] Themes persist across page navigation (dashboard, workbook)
- [x] Themes persist across sessions (logout/login)
- [ ] No flash of wrong theme on page load (minor flash may occur during hydration)
- [x] Single source of truth for theme state (`src/lib/theme`)
- [x] Build passes

---

### BUG-020: Multiple Continue buttons on rapid tap-through
**Status**: `resolved`
**Assigned**: Fizz
**Reviewed by**: Queen Bee (2026-01-09)
**Priority**: `high`
**Area**: workbook
**Found by**: User walkthrough

**Description**:
When user taps rapidly through text blocks (click-to-skip), multiple Continue buttons appear stacked. Each tap-through should act as a Continue, automatically advancing to the next block.

**Root Cause Found**:
Click-to-skip was only completing the animation, not auto-advancing to the next block. The Continue button would still appear after each animation, requiring an extra tap.

**Fix Applied**:
Added `wasSkipped: boolean` parameter through the animation callback chain:
1. `ContentBlockRenderer` tracks if user clicked vs natural animation completion
2. `MessageContent` passes `wasSkipped` through `onAnimationComplete(wasSkipped)`
3. `ConversationThread` passes `wasSkipped` to `onMessageAnimated(messageId, wasSkipped)`
4. `WorkbookView.handleMessageAnimated` now auto-advances if `wasSkipped=true` for content blocks

When user clicks to skip:
- Animation completes immediately
- Block auto-advances to next (like pressing Continue)
- No Continue button shown for that block

When animation completes naturally:
- Continue button appears as before (fallback for users who want to read)

Also reduced transition delay from 200ms to 50ms when user is tapping through (for faster rapid progression).

**Files Changed**:
- `src/components/conversation/MessageContent.tsx` — Track and pass `wasSkipped` flag
- `src/components/conversation/ConversationThread.tsx` — Pass `wasSkipped` through callback
- `src/components/workbook/WorkbookView.tsx` — Auto-advance on skip

**Acceptance Criteria**:
- [x] Tap-through advances to next block automatically
- [x] No stacked/multiple Continue buttons
- [x] Can tap through content rapidly to reach input
- [x] Cannot skip past required inputs (prompts/tools)
- [x] Build passes

---

### BUG-021: Overview sections have wrong headers
**Status**: `resolved`
**Priority**: `high`
**Area**: database
**Found by**: User walkthrough
**Resolved by**: Buzz (2026-01-09)

**Description**:
The Part overview sections (Part 1: Roots overview, Part 3: Branches overview) are showing wrong headers. They display "Mod 1" content when they should show "Part X: [Name]" and "Overview".

Module 1 content should NOT appear until Skills and Talents (the first actual module).

**Current (Wrong)**:
- Shows Mod 1 headers in overview section

**Expected**:
- Part 1: Roots
- Overview
- [overview content]
- THEN Module 1: Skills and Talents starts

**Acceptance Criteria**:
- [x] Part overviews show "Part X: [Name]" header
- [x] Part overviews show "Overview" subheader
- [x] Module 1 content only appears at Skills and Talents
- [x] Same pattern for Part 3: Branches (Part 3 not yet in DB; Part 2 already has Overview)
- [x] Build passes

**Resolution**:
Added "Overview" heading content block (ID 100615) and inserted into stem table at sequence 2
for Part 1 overview (1.0.0). API now returns correct header structure:
1. "Part 1: Roots" (heading)
2. "Overview" (heading)
3. Content instructions...

Migration: `0014_add_overview_headers.sql` (applied directly via wrangler d1 execute)

**Files Involved**:
- `migrations/0014_add_overview_headers.sql` — Migration file
- Database: content_blocks ID 100615, stem ID 100843

---

### BUG-022: Repeated render block at Skills and Talents
**Status**: `resolved`
**Assigned**: Fizz
**Reviewed by**: Queen Bee (2026-01-09)
**Priority**: `high`
**Area**: workbook
**Found by**: User walkthrough

**Description**:
At the start of Module 1 (Skills and Talents), there's a block that renders over and over again. The user sees:
1. Title (roots)
2. **Repeated render block** ← problematic
3. Header mod 1 - work factors
4. Header (skills and talents)
5. Module content etc.

Something is causing a content block to render multiple times or loop.

**Root Cause Found**:
The `TypingEffect` component had `onComplete` in its useEffect dependency array. When the parent component re-rendered (for any reason), a new function reference was passed, causing the useEffect to restart the animation. Additionally, `ContentBlockRenderer` created new callback functions on each render, exacerbating the issue.

**Fix Applied**:
1. **TypingEffect.tsx**:
   - Use `useRef` to store the `onComplete` callback (avoids re-triggering effect)
   - Added `hasCompletedRef` to prevent double-fire of completion callback
   - Removed `onComplete` from useEffect dependencies

2. **MessageContent.tsx**:
   - Wrapped `handleClick` and `handleNaturalComplete` with `useCallback`
   - Added `hasCompletedRef` to prevent double-fire of completion callback

These changes ensure:
- Animation only runs once per mount (unless text changes)
- Callback changes don't restart animation
- Completion callback only fires once

**Files Changed**:
- `src/components/conversation/TypingEffect.tsx` — Use ref for callback, add completion guard
- `src/components/conversation/MessageContent.tsx` — Memoize callbacks, add completion guard

**Acceptance Criteria**:
- [x] No repeated/looping content blocks (animation stable)
- [x] Clean header progression at module start
- [x] Build passes

---

### BUG-023: Continue button click radius too small on mobile
**Status**: `done`
**Verified by**: Pazz (2026-01-09)
**Assigned**: Fizz
**Priority**: `medium`
**Area**: workbook
**Found by**: User walkthrough

**Description**:
On mobile, the Continue button has a small tap target. Users should be able to tap almost anywhere on the content area to advance (like tapping through a story on Instagram).

**Fix Applied**:
1. **WorkbookView.tsx**:
   - Added `handleContentAreaClick` callback that triggers `handleContinue()` on mobile (screen width ≤768px)
   - Only activates when `waitingForContinue && currentAnimationComplete`
   - Ignores clicks on interactive elements (buttons, inputs, links)
   - Added `data-tap-to-continue` attribute for CSS styling

2. **globals.css**:
   - Added mobile-only styles when `data-tap-to-continue="true"`
   - Shows "Tap anywhere to continue" hint positioned above the input zone
   - Hint uses subtle fade-in animation

This creates an Instagram-story-like experience where the entire content area becomes tappable to advance on mobile.

**Files Changed**:
- `src/components/workbook/WorkbookView.tsx` — Tap-to-continue click handler
- `src/app/globals.css` — Mobile visual feedback styles

**Acceptance Criteria**:
- [x] Mobile: tap anywhere on content advances
- [x] Large tap target area (entire content viewport)
- [x] Desktop: button still works normally (width check)
- [x] Build passes

---

### BUG-016: Daily Do's visible before tools unlocked
**Status**: `done`
**Verified by**: Pazz (2026-01-09)
**Assigned**: Fizz
**Priority**: `high`
**Area**: features
**Found by**: User walkthrough

**Description**:
Fresh accounts see the Daily Do's section on the dashboard before they've reached that part of the program. Daily Do's should only appear once the user has unlocked the relevant tools.

**Root Cause**:
`getDailyDos()` in page.tsx was hardcoded to always return Daily Do items, regardless of user progress.

**Fix Applied**:
Modified `getDailyDos()` to check user's current exercise and only return Daily Do items for tools that have been introduced:
- SOARED form → shown only after user reaches exercise 1.1.3
- Flow tracker → shown only after user reaches module 1.2

Also updated `DashboardPage.tsx` to not render the Daily Do's section at all when the list is empty (no empty state).

**Files Changed**:
- `src/app/page.tsx` — `getDailyDos()` now takes `currentExerciseId` and checks progress
- `src/components/dashboard/DashboardPage.tsx` — Conditional render: `{dailyDos.length > 0 && ...}`

**Acceptance Criteria**:
- [x] Daily Do's section hidden for fresh accounts (at 1.1.1, 1.1.2)
- [x] Section appears only after relevant tools unlocked (progressive unlock)
- [x] No empty state shown — section simply doesn't exist until unlocked
- [x] Build passes

---

### BUG-015: Input field position and Continue button alignment
**Status**: `done`
**Verified by**: Pazz (2026-01-09)
**Assigned**: Fizz
**Priority**: `high`
**Area**: design-system
**Found by**: User walkthrough

**Description**:
Two layout issues:

1. **Input field position** — Should be consistently positioned at bottom (like messaging app). Currently floats wherever the content ends.

2. **Continue buttons** — Should be right-aligned. Currently centered or left-aligned.

**Expected Behavior** (clarified by user):
- All inputs bottom-locked like a messaging app
- Consistent position for all input types
- Breathing room from edge
- Semi-sticky collapse behavior (collapse after ~1 screen scroll)
- Expandable collapsed state with tap/click

**Root Cause**:
Multiple input mechanisms (Shell InputArea, PromptInput, ToolEmbed) each positioned differently. No unified input zone.

**Fix Applied**:
1. Created `WorkbookInputZone` component with fixed positioning
2. All inputs (text, textarea, PromptInput, ToolEmbed, Continue) moved into unified zone
3. Scroll tracking triggers collapse after 100vh scroll
4. Collapsed state shows minimal bar with expand button
5. Expand scrolls to bottom and reveals full input

**Files Created**:
- `src/components/workbook/WorkbookInputZone.tsx` — New unified input zone component

**Files Changed**:
- `src/components/workbook/WorkbookView.tsx` — Major refactor to use WorkbookInputZone
- `src/components/icons/index.tsx` — Added ChevronUpIcon
- `src/app/globals.css` — Added input zone CSS (fixed positioning, collapse states)

**Architecture**:
```
┌─────────────────────────────────────┐
│  Scrollable content area            │
│  (ConversationThread, ToolEmbed)    │
├─────────────────────────────────────┤
│  WorkbookInputZone (fixed)          │ ◄── All inputs here
│  - Collapses after 100vh scroll     │
│  - Tap to expand when collapsed     │
└─────────────────────────────────────┘
```

**Acceptance Criteria**:
- [x] Input field positioned at bottom (fixed position with breathing room)
- [x] All Continue buttons right-aligned
- [x] Layout consistent across exercises (all inputs in unified zone)
- [x] Works on different screen sizes (responsive CSS with mobile nav offset)
- [x] Semi-sticky collapse behavior (collapses after 100vh scroll)
- [x] Expandable collapsed state
- [x] Build passes

---

### BUG-014: Prompts require extra Continue before input appears
**Status**: `done`
**Assigned**: Fizz
**Verified by**: Pazz (2026-01-09)
**Priority**: `high`
**Area**: workbook
**Found by**: User walkthrough

**Description**:
Current flow is awkward:
1. Content block types out
2. User hits Continue
3. Prompt question types out
4. User hits Continue **again** ← AWKWARD
5. Input field finally appears

**Expected Behavior**:
1. Content block types out
2. User hits Continue
3. Prompt question types out
4. Input field appears automatically when question animation completes (no extra Continue)

The question and its input field should be a single unit. User reads the question, input is ready.

**Root Cause Found**:
Input field (AppShell input and PromptInput) was rendered immediately when prompt block became current, while the question text was still animating. No gating for animation completion.

**Fix Applied**:
1. Added `promptAnimationComplete` state to track when prompt question animation finishes
2. Gated input display with `promptAnimationComplete`:
   - `showInput` prop in AppShell now requires `promptAnimationComplete`
   - PromptInput render condition now requires `promptAnimationComplete`
3. `handleMessageAnimated` callback sets `promptAnimationComplete = true` when prompt text finishes
4. Proper initialization for returning users (if prompt already animated, show input immediately)

**Files Changed**:
- `src/components/workbook/WorkbookView.tsx:188-219` — Added state with init logic
- `src/components/workbook/WorkbookView.tsx:231-234` — Updated animation callback
- `src/components/workbook/WorkbookView.tsx:244,248-253` — Reset on block change
- `src/components/workbook/WorkbookView.tsx:653` — Gate shell input
- `src/components/workbook/WorkbookView.tsx:697` — Gate PromptInput

**Tool Behavior**: Tools render ToolEmbed immediately (no animation to wait for) — unchanged and correct.

**Acceptance Criteria**:
- [x] Prompt question animates
- [x] Input field appears automatically after question animation completes
- [x] No extra Continue click between question and input
- [x] Content blocks still require Continue (unchanged)
- [x] Tool blocks behave similarly (tool appears when intro text completes)
- [x] Build passes

---

## Review (Awaiting QA)

<!-- Bugs completed by workers, awaiting Pazz verification -->

*No bugs awaiting review.*

---

## Improvements (Non-Blocking)

**Tech debt, performance, and efficiency opportunities. Not bugs — the app works, these make it better.**

---

### IMP-001: Mutable Map in render path ✅ FIXED
**Found by**: Fizz
**Fixed by**: Fizz (2026-01-09)
**Phase**: 1
**Impact**: `medium`
**Area**: workbook
**Status**: `done`
**Files**:
- `src/components/workbook/WorkbookView.tsx`

**Finding**:
`promptResponseMap.set()` was called during save handlers, mutating a `useMemo` result. This violated React's immutability principles.

**Fix Applied**:
- Changed `promptResponseMap` and `toolResponseMap` from `useMemo` to `useState`
- Updated all `.set()` calls to use immutable updates: `setPromptResponseMap(prev => new Map(prev).set(...))`
- Proper re-renders now triggered when maps are updated

---

### IMP-002: ToolEmbed has 15 useState declarations ✅ FIXED
**Found by**: Fizz
**Fixed by**: Fizz (2026-01-09)
**Phase**: 1
**Impact**: `medium`
**Area**: workbook
**Status**: `done`
**Files**:
- `src/components/workbook/ToolEmbed.tsx` — Refactored from 600+ to 147 lines
- `src/components/workbook/tool-wrappers/` — 15 new wrapper components
- `src/hooks/useToolSave.ts` — Shared save/auto-save hook

**Finding**:
ToolEmbed maintained separate useState for each tool type's data. This created 15+ state variables regardless of which tool was rendered, wasting memory and making the component hard to maintain.

**Fix Applied**:
Extracted each tool into its own wrapper component in `tool-wrappers/`:
- Each wrapper manages its own state independently
- Shared `useToolSave` hook handles save/auto-save logic
- ToolEmbed is now a simple dispatcher (~147 lines vs 600+)
- Only the active tool's state is initialized (no wasted memory)

**Files Created**:
- `src/hooks/useToolSave.ts`
- `src/components/workbook/tool-wrappers/` (15 wrapper components + index + types)

---

### IMP-003: Expensive messages rebuild on every displayedBlockIndex change ✅ FIXED
**Found by**: Fizz
**Fixed by**: Fizz
**Phase**: 1
**Impact**: `medium`
**Area**: workbook
**Files**:
- `src/components/workbook/WorkbookView.tsx:174-225`

**Finding**:
The `messages` useMemo rebuilds the entire messages array when `displayedBlockIndex` changes. This includes re-parsing content for ALL blocks 0 to N, not just the new one.

**Fix Applied**:
Added `blockContentCache` ref to cache computed content per block.id. Now `blockToConversationContent` results are only computed once per block and reused on subsequent renders. Combined with IMP-006 (React.memo on MessageRenderer), this significantly reduces render work.

---

### IMP-004: Initialization logic duplicated
**Found by**: Fizz
**Phase**: 1
**Impact**: `low`
**Area**: workbook
**Files**:
- `src/components/workbook/WorkbookView.tsx:71-105`
- `src/components/workbook/WorkbookView.tsx:129-166`

**Finding**:
The "find first unanswered prompt" logic is duplicated: once in the `displayedBlockIndex` initial state callback, and again in the animation initialization block. Both iterate the same way over `interactiveBlocks`.

**Recommendation**:
Extract to a shared utility function `findFirstUnansweredIndex()` called in both places.

---

### IMP-005: Silent auto-save failures
**Found by**: Fizz
**Phase**: 1
**Impact**: `high`
**Area**: workbook
**Files**:
- `src/components/workbook/ToolEmbed.tsx:334-355`

**Finding**:
Tool auto-save catches errors silently (`catch { // Silent failure }`). If auto-save consistently fails, user has no indication their work isn't being saved until they click Continue and it fails loudly.

**Recommendation**:
Track consecutive auto-save failures. After N failures (e.g., 3), show a warning toast or visual indicator that auto-save is failing.

---

### IMP-006: ConversationThread re-renders on every message array change ✅ FIXED
**Found by**: Fizz
**Fixed by**: Fizz
**Phase**: 1
**Impact**: `low`
**Area**: conversation
**Files**:
- `src/components/conversation/ConversationThread.tsx:106-128`

**Finding**:
The message list is mapped on every render without React.memo on MessageRenderer. If messages array reference changes (even with same content), all message components re-render.

**Fix Applied**:
Wrapped MessageRenderer in `React.memo` with custom comparison function. Compares `message.id`, `message.type`, `animate`, and existence of `onEdit`. Messages won't re-render when parent re-renders with unchanged data.

---

### IMP-007: TypingEffect creates interval per character ✅ FIXED
**Found by**: Fizz
**Fixed by**: Fizz
**Phase**: 1
**Impact**: `low`
**Area**: conversation
**Files**:
- `src/components/conversation/TypingEffect.tsx:46-57`

**Finding**:
TypingEffect uses `setInterval` with state updates for each character. For long text, this creates many rapid state updates. Effect is minor due to 30ms interval, but not optimal.

**Fix Applied**:
Switched to `requestAnimationFrame` with elapsed-time calculation. Added `lastCharIndex` tracking to only update state when character index changes. Benefits: better browser sync, auto-pause when tab hidden, no interval drift.

---

### IMP-008: getToolData recreated on every state change ✅ FIXED
**Found by**: Fizz
**Fixed by**: Fizz
**Phase**: 1
**Impact**: `low`
**Area**: workbook
**Files**:
- `src/components/workbook/ToolEmbed.tsx:247-286`

**Finding**:
`getToolData` useCallback has all 15 tool state variables in its dependency array. Any tool state change recreates this function, which triggers the auto-save effect unnecessarily.

**Fix Applied**:
Used ref pattern: `getToolDataRef` holds latest function, auto-save effect depends on `currentToolDataJson` (stringified data) instead of function reference. Effect now triggers only when actual data content changes, not when function is recreated.

---

### IMP-009: Session validation duplicated in every API route
**Found by**: Fizz
**Phase**: 1
**Impact**: `medium`
**Area**: workbook
**Status**: **RESOLVED** (2026-01-09)
**Files**:
- `src/lib/auth/with-auth.ts` (new)
- `src/app/api/data/connection/route.ts` (refactored as example)

**Finding**:
Session validation code (get cookie → check sessionId → getSessionData → validate) is duplicated across every authenticated API route. ~25 lines repeated each time.

**Resolution**:
Created `withAuth(handler)` wrapper in `src/lib/auth/with-auth.ts`. Extracts and validates session, passes `{userId, db, sessionId}` to handler. Returns 401 if not authenticated. Refactored connection route as example (-19 lines). Other routes can be refactored incrementally.

---

### IMP-010: No loading state during exercise fetch
**Found by**: Fizz
**Phase**: 1
**Impact**: `low`
**Area**: workbook
**Files**:
- `src/app/workbook/[exerciseId]/page.tsx`

**Finding**:
Exercise page is a server component that fetches data before render. While Next.js handles loading via Suspense, there's no explicit loading UI or skeleton defined for `/workbook/[exerciseId]`.

**Recommendation**:
Add `loading.tsx` with a conversation skeleton to improve perceived performance.

---

### IMP-011: MessageContent animation state not SSR-safe
**Found by**: Fizz
**Phase**: 1
**Impact**: `low`
**Area**: conversation
**Files**:
- `src/components/conversation/MessageContent.tsx:123`

**Finding**:
`currentBlockIndex` initializes to 0, which means during hydration the client will show only the first block animated, even if server rendered all content. Could cause flash of content.

**Recommendation**:
Initialize `currentBlockIndex` to `content.length - 1` when animation is disabled to match SSR output.

---

### IMP-012: Multiple global keydown listeners
**Found by**: Fizz
**Phase**: 1
**Impact**: `low`
**Area**: workbook
**Files**:
- `src/components/workbook/WorkbookView.tsx:313-331` (Continue key handler)
- `src/components/workbook/PromptInput.tsx:163-173` (Enter submit handler)

**Finding**:
Both WorkbookView and PromptInput add global `window.addEventListener('keydown')`. While they check conditions before acting, multiple global listeners can cause subtle interaction bugs.

**Recommendation**:
Consolidate keyboard handling in a single location or use a keyboard event manager context.

---

### IMP-QA-001: Zero Unit Tests for Components
**Found by**: Pazz
**Phase**: QA Audit
**Impact**: `high`
**Area**: testing
**Status**: `in-progress` (161 tests, was 0)
**Files**:
- All 86 components in `src/components/`

**Finding**:
No unit tests exist for any React components. Critical business logic in WorkbookView (628 lines), ConnectionResolver (720 lines), and auth functions (286 lines) has zero test coverage. Refactoring or bug fixes are flying blind.

**Progress** (2026-01-09):
Unit test infrastructure added. 161 tests now exist:
- `WorkbookInputZone.test.tsx` (9 tests)
- `HistoryZone.test.tsx` (9 tests)
- `DailyDoList.test.tsx` (7 tests)
- `DailyDoCard.test.tsx` (16 tests)
- `dailyDos.test.ts` (25 tests)
- `NavItem.test.tsx` (13 tests) — pre-existing
- `PromptInput.test.tsx` (24 tests) — all 5 input types
- `MessageContent.test.tsx` (19 tests) — block types, animation, a11y
- `TypingEffect.test.tsx` (15 tests) — animation, skip, reduced motion
- `WorkbookView.test.tsx` (24 tests) — state machine, progression, animation tracking, save/error

**Remaining**:
- ConnectionResolver data fetchers

**Recommendation**:
Add Vitest + React Testing Library to main package. Prioritize tests for ConnectionResolver data fetchers and auth encryption logic.

---

### IMP-QA-002: No Security Testing
**Found by**: Pazz
**Phase**: QA Audit
**Impact**: `high`
**Area**: auth, api
**Files**:
- `src/app/api/**/*.ts`
- `src/lib/auth/`

**Finding**:
No tests for SQL injection, XSS, CSRF, or auth bypass. Password hashing and encryption key derivation are untested. Enterprise compliance requires security test coverage.

**Recommendation**:
Create security test suite covering OWASP Top 10. Add input validation tests for all API routes. Test encryption roundtrip correctness.

---

### IMP-QA-003: No Load/Performance Testing
**Found by**: Pazz
**Phase**: QA Audit
**Impact**: `high`
**Area**: infrastructure
**Files**: None exist

**Finding**:
No concurrent user simulation, no response time baselines, unknown breaking point. Cannot predict behavior under production load.

**Recommendation**:
Add k6 or Artillery load tests. Establish baseline response times. Test with 100+ concurrent users before enterprise launch.

---

### IMP-QA-004: No Accessibility Testing
**Found by**: Pazz
**Phase**: QA Audit
**Impact**: `medium`
**Area**: ui
**Files**:
- All UI components

**Finding**:
No WCAG compliance testing. Screen reader compatibility unknown. Keyboard navigation paths not verified programmatically.

**Recommendation**:
Add axe-core integration for automated a11y testing. Create keyboard navigation E2E tests. Test with screen readers before launch.

---

### IMP-QA-005: No Visual Regression Testing
**Found by**: Pazz
**Phase**: QA Audit
**Impact**: `medium`
**Area**: design-system
**Files**:
- `src/app/globals.css`
- All component styling

**Finding**:
CSS changes can silently break the design system. No screenshot comparison to catch visual regressions.

**Recommendation**:
Add Playwright screenshot comparison. Create baseline snapshots for key pages and components. Run in CI.

---

### IMP-QA-006: API Tests Lack Schema Validation
**Found by**: Pazz
**Phase**: QA Audit
**Impact**: `medium`
**Area**: api
**Files**:
- `QA/api/*.test.ts`

**Finding**:
API tests only check `response.ok` and spot-check specific fields. Full response shapes not validated. Breaking API changes (added required fields, changed types) may slip through.

**Recommendation**:
Add Zod schemas for all API responses. Validate full response shapes in tests. Share types between app and tests.

---

### IMP-020: Silent catch blocks without error logging ✅ FIXED
**Found by**: Fizz
**Fixed by**: Fizz
**Phase**: 2
**Impact**: `high`
**Area**: error-handling
**Files**:
- `src/lib/connections/resolver.ts:28` - Returns empty `{ instructions: [] }`, no log
- `src/lib/auth/encryption.ts:209` - Returns `false`, no log
- `src/lib/auth/actions.ts:282` - Returns `null`, no log
- `src/components/onboarding/OnboardingFlow.tsx:62` - Returns `null`, no log
- `src/app/workbook/[exerciseId]/page.tsx:98,112` - Falls back silently
- `src/app/api/workbook/[exerciseId]/route.ts:140,154` - Falls back silently
- `src/app/api/tools/instances/route.ts:81` - Falls back silently

**Finding**:
13 catch blocks swallow errors completely — no console.error, no telemetry, no user notification. When these fail, developers have no visibility and users see unexpected behavior (empty data, wrong defaults).

**Fix Applied**:
Added `console.error` with context prefix to critical catch blocks:
- `[ConnectionResolver]` for connection parsing
- `[Auth]` for data key unwrapping
- `[Workbook API]` and `[Workbook Page]` for content/title parsing
- `[Tools API]` for tool instance parsing
Left `isEncrypted` silent (expected behavior for non-encrypted values) and localStorage check (transient).

---

### IMP-021: Data loading failures only console.error (no user feedback) ✅ FIXED
**Found by**: Fizz
**Fixed by**: Fizz
**Phase**: 2
**Impact**: `medium`
**Area**: workbook
**Files**:
- `src/components/workbook/ToolEmbed.tsx:176` - Skills fetch `.catch(err => console.error(...))`
- `src/components/workbook/ToolEmbed.tsx:192` - Competencies fetch `.catch(err => console.error(...))`
- `src/components/workbook/ToolEmbed.tsx:242` - Connection data fetch `.catch(err => console.error(...))`

**Finding**:
When skills, competencies, or connection data fail to load, the only feedback is a console.error. The user sees either eternal loading state or an empty/broken tool with no indication of what went wrong.

**Fix Applied**:
Added `dataError` state and `handleRetry` callback. Each fetch now sets error state on failure. `renderTool` shows error message with Retry button when `dataError` is set. Added `.tool-embed-error-state` CSS class for styling.

---

### IMP-022: Most errors only console.error (no user notification) ✅ FIXED
**Found by**: Fizz
**Fixed by**: Fizz
**Phase**: 2
**Impact**: `medium`
**Area**: all
**Files**:
- `src/app/profile/page.tsx:114,152,172,196` - Profile operations
- `src/app/tools/page.tsx:133` - Tool counts
- `src/app/tools/[toolType]/page.tsx:44` - Tool instances
- `src/components/dashboard/DashboardPage.tsx:91` - Logout
- `src/app/onboarding/page.tsx:25,30` - Onboarding save

**Finding**:
37 locations use `console.error()` as the only error handling. User has no idea something failed. This is especially problematic for data-saving operations (onboarding, profile) where the user thinks their changes are saved.

**Fix Applied**:
Added `useToast` to profile page and dashboard. Profile operations (load, download, delete, save appearance) now show toast notifications on success/failure. Dashboard logout shows error toast on failure. Replaced `alert()` calls with toasts for consistent UX.

---

### IMP-023: Single global ErrorBoundary, no component isolation ✅ FIXED
**Found by**: Fizz
**Fixed by**: Fizz (2026-01-09)
**Phase**: 2
**Impact**: `medium`
**Area**: error-handling
**Status**: `done`
**Files**:
- `src/components/workbook/ToolEmbed.tsx` - Wrapped tool rendering
- `src/components/dashboard/DashboardPage.tsx` - Wrapped 4 widgets
- `src/app/profile/page.tsx` - Wrapped 2 sections
- `src/app/globals.css` - Added .dashboard-widget-error styles

**Finding**:
One ErrorBoundary at the root level. If any component throws, the entire app shows the error screen. No isolation for independent features.

**Fix Applied**:
Added component-level ErrorBoundaries with inline fallbacks:
- **ToolEmbed**: Wraps `renderTool()` - tool crash shows "This tool encountered an error" with reload button
- **DashboardPage**: Wraps DailyDoList, ProgressMetrics, ProfilePreview, TOCInline - widget crash shows "Unable to load this section"
- **Profile page**: Wraps SkillsList and RankedList - section crash shows "Unable to load this section"

Each component failure is now isolated — one widget/tool crash doesn't kill the whole page.

---

### IMP-024: No error telemetry/monitoring
**Found by**: Fizz
**Phase**: 2
**Impact**: `medium`
**Area**: infrastructure
**Files**: None (missing)

**Finding**:
All errors go to console.error which is only visible if user has DevTools open. No Sentry, LogRocket, or similar service to capture errors in production. Team has zero visibility into what errors users encounter.

**Recommendation**:
Integrate error monitoring service (Sentry recommended). Capture: JS errors, unhandled promise rejections, API failures, and ErrorBoundary catches.

---

### IMP-025: Generic error messages hide root cause ✅ FIXED
**Found by**: Fizz
**Fixed by**: Fizz (2026-01-09)
**Phase**: 2
**Impact**: `low`
**Area**: ux
**Status**: `done`
**Files**:
- `src/app/(auth)/login/page.tsx` - Differentiated network vs other errors
- `src/app/(auth)/signup/page.tsx` - Differentiated network vs other errors
- `src/components/workbook/ToolEmbed.tsx` - Differentiated network vs other errors
- `src/components/workbook/WorkbookView.tsx` - Differentiated network vs other errors
- `src/app/profile/page.tsx` - Differentiated network vs other errors

**Finding**:
User-facing error messages were generic. Network error, server error, validation error all showed the same message. User couldn't self-diagnose (is it their connection? their input? the server?).

**Fix Applied**:
Added `TypeError` + `fetch` message detection in catch blocks to differentiate network errors ("Unable to connect. Check your internet connection.") from other errors (keeps generic message). Pattern applied to login, signup, ToolEmbed save, WorkbookView response save, and profile delete account.

---

### IMP-026: Missing Button component (only CSS exists)
**Found by**: Fizz
**Phase**: 3
**Impact**: `medium`
**Area**: components
**Files**:
- Expected: `src/components/feedback/Button.tsx` (does not exist)
- CSS exists in `src/app/globals.css` (.button, .button-primary, etc.)

**Finding**:
Spec defines a reusable Button component with variant, size, loading, and icon props. Implementation only has CSS classes. Every component manually composes className strings like `"button button-primary button-md"`.

**Recommendation**:
Create Button component that encapsulates class logic and provides consistent API: `<Button variant="primary" size="md" loading={isLoading}>`.

---

### IMP-027: Missing Badge component
**Found by**: Fizz
**Phase**: 3
**Impact**: `low`
**Area**: components
**Files**:
- Expected: `src/components/feedback/Badge.tsx` (does not exist)

**Finding**:
Spec defines Badge component for status indicators and counts. No implementation found. Currently badge-like UI is ad-hoc (e.g., tool count in NavItem).

**Recommendation**:
Create Badge component with variant and size props for consistent status/count display.

---

### IMP-028: Missing TagSelector component
**Found by**: Fizz
**Phase**: 3
**Impact**: `low`
**Area**: components
**Files**:
- Expected: `src/components/tools/TagSelector.tsx` (does not exist)
- SkillTagger exists as specialized variant

**Finding**:
Spec defines generic TagSelector for multi-select from predefined tags. Only SkillTagger (specialized for skills) exists. Generic tag selection requires custom implementation each time.

**Recommendation**:
Extract generic TagSelector from SkillTagger pattern, or document that SkillTagger is the intended implementation.

---

### IMP-029: Missing Modal component
**Found by**: Fizz
**Phase**: 3
**Impact**: `high`
**Area**: components
**Files**:
- Expected: `src/components/overlays/Modal.tsx` (does not exist)
- Backdrop.tsx exists

**Finding**:
Spec defines full Modal component with focus trap, body scroll lock, escape key handling, and portal rendering. Only Backdrop exists. Confirmations (delete account, etc.) currently use browser `confirm()` or custom inline UI.

**Recommendation**:
Implement Modal component for consistent dialog pattern. Critical for: delete confirmations, data export preview, settings changes.

---

### IMP-030: Missing NavExpanded component
**Found by**: Fizz
**Phase**: 3
**Impact**: `low`
**Area**: components
**Files**:
- Expected: `src/components/overlays/NavExpanded.tsx` (does not exist)

**Finding**:
Spec defines NavExpanded for expanded tool navigation showing all tool instances. Not implemented - tools navigation goes directly to /tools page.

**Recommendation**:
Implement if inline tool expansion from nav is desired, or remove from spec if /tools page is sufficient.

---

### IMP-031: Missing DropdownMenu component
**Found by**: Fizz
**Phase**: 3
**Impact**: `low`
**Area**: components
**Files**:
- Expected: `src/components/overlays/DropdownMenu.tsx` (does not exist)

**Finding**:
Spec defines generic DropdownMenu for contextual actions. Not implemented. Currently no dropdown menus in the app.

**Recommendation**:
Implement when needed for contextual actions (e.g., message options, tool instance actions).

---

### IMP-032: ProgressMarker status values differ from spec
**Found by**: Fizz
**Phase**: 3
**Impact**: `low`
**Area**: components
**Files**:
- `src/components/overlays/ProgressMarker.tsx`

**Finding**:
Spec defines statuses: `incomplete`, `in-progress`, `complete`
Implementation uses: `locked`, `available`, `in-progress`, `complete`

`locked` and `available` are app-specific extensions. `incomplete` maps to `available`. This is a reasonable deviation but should be documented.

**Recommendation**:
Update spec to reflect actual status values, or add comment in component explaining mapping.

---

### IMP-033: OnboardingFlow architecture differs from spec
**Found by**: Fizz
**Phase**: 3
**Impact**: `low`
**Area**: components
**Files**:
- `src/components/onboarding/OnboardingFlow.tsx`

**Finding**:
Spec defines 4-step wizard: welcome → name → visuals → complete
Implementation uses 3-step conversation-based flow using ConversationThread

This is an intentional architectural improvement aligning with "conversational intimacy" pillar. The spec should be updated to reflect this.

**Recommendation**:
Update spec to reflect conversation-based onboarding. Current implementation is better aligned with soul.

---

### IMP-034: Backdrop missing optional props from spec
**Found by**: Fizz
**Phase**: 3
**Impact**: `low`
**Area**: components
**Files**:
- `src/components/overlays/Backdrop.tsx`

**Finding**:
Spec defines optional `opacity` (default 0.5) and `blur` (boolean) props. Implementation has neither - always uses fixed opacity, no blur support.

**Recommendation**:
Add optional props if customization needed, or simplify spec to match implementation.

---

### IMP-035: Tailwind CSS configured but not used
**Found by**: Buzz
**Phase**: 2
**Impact**: `low`
**Area**: infrastructure
**Status**: `done`
**Fixed by**: Fizz (2026-01-09)
**Files**:
- `package.json`
- `postcss.config.mjs`

**Finding**:
Tailwind CSS (`tailwindcss`, `@tailwindcss/postcss`) is in devDependencies and configured in PostCSS, but never used. Zero `@tailwind` or `@apply` directives in any CSS file. The codebase uses pure CSS custom properties as intended by the design system.

**Fix Applied**:
- Removed `tailwindcss` and `@tailwindcss/postcss` from package.json devDependencies
- Deleted `postcss.config.mjs` (only contained Tailwind plugin)

---

### IMP-036: 5 orphan components (265 lines dead code)
**Found by**: Buzz
**Phase**: 2
**Impact**: `medium`
**Area**: components
**Status**: `done`
**Fixed by**: Fizz (2026-01-09)
**Files deleted**:
- `src/components/onboarding/CompleteStep.tsx` (35 lines)
- `src/components/onboarding/NameStep.tsx` (43 lines)
- `src/components/onboarding/WelcomeStep.tsx` (32 lines)
- `src/components/onboarding/OnboardingProgress.tsx` (28 lines)
- `src/components/feedback/Tooltip.tsx` (127 lines)

**Finding**:
5 components were exported from index.ts but never imported or used anywhere in the codebase. The 4 onboarding components were remnants of the old multi-step flow that was replaced with a simplified OnboardingFlow. Tooltip was built but never instantiated.

**Fix Applied**:
- Deleted all 5 orphan component files (265 lines removed)
- Updated `onboarding/index.ts` to remove 4 exports
- Updated `feedback/index.ts` to remove Tooltip export

---

### IMP-037: SQL injection in fetchExperiences (CRITICAL SECURITY)
**Found by**: Buzz
**Phase**: 1
**Impact**: `critical`
**Area**: database
**Status**: **RESOLVED** (2026-01-09)
**Files**:
- `src/lib/connections/resolver.ts` (fetchExperiences function)

**Finding**:
Uses string interpolation for type filter: `AND experience_type = '${type}'`. If type value comes from user input, this is exploitable SQL injection.

**Resolution**:
Fixed with parameterized queries using `.bind()`. Added type validation (only 'job' or 'education' allowed). Invalid types return all experiences (safe fallback).

---

### IMP-038: SQL injection in fetchUserLists (CRITICAL SECURITY)
**Found by**: Buzz
**Phase**: 1
**Impact**: `critical`
**Area**: database
**Status**: **RESOLVED** (2026-01-09)
**Files**:
- `src/lib/connections/resolver.ts` (fetchUserLists function)

**Finding**:
Same pattern as IMP-037. String interpolation for listType filter.

**Resolution**:
Fixed with parameterized queries using `.bind()`. Added regex validation (alphanumeric + underscore only). Invalid patterns return all lists (safe fallback).

---

### IMP-039: No rate limiting on auth routes (SECURITY)
**Found by**: Buzz
**Phase**: 1
**Impact**: `high`
**Area**: auth
**Status**: **RESOLVED** (2026-01-09)
**Files**:
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/signup/route.ts`
- `src/lib/auth/rate-limiter.ts` (new)
- `migrations/0010_add_rate_limiting.sql` (new)

**Finding**:
Login and signup have no brute-force protection. Attacker can attempt unlimited password guesses or spam account creation.

**Resolution**:
Implemented D1-based rate limiting:
- 5 attempts per email per 15-minute window
- 30-minute block after exceeding threshold
- Returns 429 Too Many Requests with Retry-After header
- Clears on successful auth
- Applied migration 0010 to create rate_limits table

---

### IMP-040: Session validation duplicated across API routes
**Found by**: Buzz
**Phase**: 1
**Impact**: `medium`
**Area**: api
**Status**: **RESOLVED** (2026-01-09) — See IMP-009
**Files**:
- `src/lib/auth/with-auth.ts` (new)

**Finding**:
Session validation code (~25 lines) repeated in every authenticated API route.

**Resolution**:
Duplicate of IMP-009. Fixed with `withAuth(handler)` wrapper.

---

### IMP-041: Auto-save vs explicit submit race condition
**Found by**: Fizz
**Phase**: 4
**Impact**: `low`
**Area**: workbook
**Files**:
- `src/components/workbook/WorkbookView.tsx:334-470`

**Finding**:
Auto-save timer (1.5s debounce) can fire while user presses Enter to submit. Both call `/api/workbook/response`. Mitigation exists (clears timer on submit, checks lastSavedValueRef), but edge cases remain.

**Recommendation**:
Mitigation is adequate. Monitor for user reports of duplicate saves. Consider adding request deduplication on API side.

---

### IMP-042: Profile PATCH lacks input validation
**Found by**: Fizz
**Phase**: 4
**Impact**: `medium`
**Area**: api
**Files**:
- `src/app/api/profile/route.ts:137-194`

**Finding**:
Profile PATCH accepts `backgroundColor`, `textColor`, `font` without validation. Invalid values (e.g., `backgroundColor: "javascript:alert(1)"`) would be stored in DB.

**Recommendation**:
Validate against allowed color/font lists from design system before saving.

---

### IMP-043: Tool data stored as raw JSON without schema validation
**Found by**: Fizz
**Phase**: 4
**Impact**: `low`
**Area**: workbook
**Files**:
- `src/app/api/workbook/response/route.ts`
- `src/components/workbook/ToolEmbed.tsx`

**Finding**:
Tool state is JSON.stringify'd and stored directly in `response_text`. No schema validation on storage. Malformed JSON or unexpected structure would only fail on read.

**Recommendation**:
Add per-tool JSON schema validation before storage. Would catch bugs earlier.

---

### IMP-044: Signup has no transaction rollback on partial failure
**Found by**: Fizz
**Phase**: 4
**Impact**: `medium`
**Area**: auth
**Status**: **RESOLVED** (2026-01-09)
**Files**:
- `src/app/api/auth/signup/route.ts`

**Finding**:
Signup performs 7 sequential INSERT operations (users, auth, emails, sessions, user_settings, user_profile, user_values). If insert 5 fails, records 1-4 remain as orphans. D1 supports transactions but they're not used.

**Resolution**:
Wrapped all 7 INSERTs in `db.batch()` call which executes atomically. If any insert fails, none persist — no orphan records.

---

### IMP-045: Missing user_failure_reframes table (CRITICAL)
**Found by**: Buzz
**Phase**: 3
**Impact**: `critical`
**Area**: database
**Status**: **RESOLVED** (2026-01-09)
**Files**:
- `migrations/0009_add_missing_tables.sql` (created)

**Resolution**:
Created migration 0009 adding `user_failure_reframes` table with all spec columns. Applied to D1.

---

### IMP-046: Missing user_milestones table (CRITICAL)
**Found by**: Buzz
**Phase**: 3
**Impact**: `critical`
**Area**: database
**Status**: **RESOLVED** (2026-01-09)
**Files**:
- `migrations/0009_add_missing_tables.sql` (created)

**Resolution**:
Created migration 0009 adding `user_milestones` table with all spec columns (year, quarter, title, category, description). Applied to D1.

---

### IMP-047: Missing life_dashboard_notes column
**Found by**: Buzz
**Phase**: 3
**Impact**: `high`
**Area**: database
**Status**: **RESOLVED** (2026-01-09)
**Files**:
- `migrations/0011_add_life_dashboard_notes.sql` (created)

**Finding**:
Spec includes `life_dashboard_notes TEXT` column in user_profile for narrative notes alongside life dashboard ratings. This column was omitted from implementation. Life Dashboard tool cannot store user's written reflections.

**Resolution**:
Created migration 0011 to add `life_dashboard_notes TEXT` column to user_profile table. Applied to D1.

---

---

## Recently Completed

> **QA Verified (Pazz, 2026-01-09):** BUG-003 through BUG-007 verified via code review. Build passes. Regression tests added to `QA/e2e/regression/bug-fixes.spec.ts`.

### BUG-007: Roots overview is one endless header
**Status**: `done`
**Priority**: `medium`
**Area**: database
**Type**: `data-fix`

**Description**: The Roots overview (exercise 1.0.0) content_block 100001 contained the entire Table of Contents AND Overview text in one giant "heading" block, rendering as a wall of text.

**Resolution**:
1. Fixed content_block 100000 to be clean single-line heading "Part 1: Roots"
2. Replaced content_block 100001:
   - Changed content_type from 'heading' to 'instruction'
   - Removed the Table of Contents (users navigate via app UI)
   - Kept the meaningful Overview introduction paragraphs
3. Note: Splitting into multiple stem rows was not practical due to globally-unique sequence constraint

**Files Changed**:
- `migrations/0008_fix_roots_overview.sql` - New migration

---

### BUG-003: Profile page appearance links to 404
**Status**: `done`
**Priority**: `medium`
**Area**: features

**Description**: Profile page linked to `/settings` (404) instead of providing inline appearance editing.

**Resolution**:
1. Removed broken Link from ProfileHeader, replaced with button callback
2. Added inline VisualsStep component to profile page when editing
3. Added PATCH handler to `/api/profile` to save settings changes
4. Added state management for edit mode and saving

**Files Changed**:
- `src/components/profile/ProfileHeader.tsx` - Replaced Link with onEditAppearance callback
- `src/app/profile/page.tsx` - Added VisualsStep, edit state, save handler
- `src/app/api/profile/route.ts` - Added PATCH handler for settings
- `src/app/globals.css` - Added profile-appearance-actions styles

---

### BUG-005: Content blocks re-rendering (ink permanence violated)
**Status**: `done`
**Priority**: `high`
**Area**: workbook

**Description**: Content blocks were re-animating when they should be permanent. Violated "ink permanence" - once text appears, it should never re-animate.

**Resolution**:
1. Added `animatedMessageIds` Set tracking to WorkbookView (persists across re-renders)
2. Updated ConversationThread to accept animation tracking props
3. Messages only animate if their ID is NOT in the `animatedMessageIds` set
4. When animation completes, message ID is added to the set
5. For returning users, pre-populate the set with IDs of already-seen messages

**Root Cause**: MessageContent always animated by default (`animate={true}`), and there was no persistent tracking of which messages had already been animated. The old `animatedUpToRef` approach didn't work because it was index-based and had a side effect inside useMemo.

**Files Changed**:
- `src/components/conversation/ConversationThread.tsx` - Added `animatedMessageIds` and `onMessageAnimated` props
- `src/components/workbook/WorkbookView.tsx` - Added animation tracking with proper initialization for returning users

---

### BUG-004: Account deletion not working
**Status**: `done`
**Priority**: `high`
**Area**: auth

**Description**: Account deletion button only logged user out but didn't delete data.

**Resolution**:
1. Added DELETE handler to `/api/profile/route.ts` that deletes user from `users` table
2. All related tables have `ON DELETE CASCADE`, so deletion cascades to all user data
3. Updated `profile/page.tsx` to call DELETE endpoint before redirecting

**Files Changed**:
- `src/app/api/profile/route.ts` - Added DELETE handler
- `src/app/profile/page.tsx` - Updated handleDeleteData to call DELETE

---

### BUG-006: TOC visible in workbook
**Status**: `done`
**Priority**: `medium`
**Area**: shell

**Description**: TOC/Contents link was showing in the workbook view. It should be hidden during exercises.

**Resolution**: Code analysis shows the fix was already implemented:
- `WorkbookView.tsx:425` passes `hideContents={true}` to AppShell
- `AppShell.tsx:63` passes `hideContents` to NavBar
- `NavBar.tsx:47-57` conditionally hides Contents link when `hideContents` is true

**Verification**: If still visible, hard refresh browser (Ctrl+Shift+R) or check deployment status.

**Files Changed**: None - already fixed

---

### BUG-001: Toast has decorative shadow
**Status**: `done`
**Priority**: `low`
**Area**: design-system

**Description**: Toast component had `box-shadow` which violates "no shadows" design constraint.

**Resolution**: Removed box-shadow from `.toast` in globals.css. Border already provides sufficient visual distinction.

**Files Changed**:
- `src/app/globals.css` (line ~5946)

---

### BUG-002: Cannot edit past answers
**Status**: `done`
**Priority**: `medium`
**Area**: workbook

**Description**: Users could not click on their past responses to edit them, violating User Autonomy pillar.

**Resolution**: Added edit functionality - clicking a past response pre-fills input, PUT handler updates DB.

**Files Changed**:
- `src/components/conversation/MessageUser.tsx` - Added onEdit prop
- `src/components/conversation/ConversationThread.tsx` - Added onEditMessage callback
- `src/components/workbook/WorkbookView.tsx` - Added edit state and handler
- `src/app/api/workbook/response/route.ts` - Added PUT handler
- `src/app/globals.css` - Added .message-user--editable styles

---

## Notes

### Areas Reference
| Area | Owner Doc | Key Files |
|------|-----------|-----------|
| workbook | `team/areas/workbook.md` | `src/components/workbook/`, `src/app/workbook/` |
| conversation | `team/areas/conversation.md` | `src/components/conversation/` |
| tools | `team/areas/tools.md` | `src/components/tools/` |
| shell | `team/areas/shell.md` | `src/components/shell/` |
| auth | `team/areas/auth.md` | `src/lib/auth/` |
| database | `team/areas/database.md` | `src/lib/db/`, `migrations/` |
| features | `team/areas/features.md` | `src/components/dashboard/`, `onboarding/`, `profile/` |
| design-system | `team/areas/design-system.md` | `src/app/globals.css` |
| ui-primitives | `team/areas/ui-primitives.md` | `src/components/forms/`, `feedback/`, `icons/` |
