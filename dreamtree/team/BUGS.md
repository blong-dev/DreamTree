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
**Status**: `review`
**Assigned**: Queen Bee
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
**Status**: `review`
**Assigned**: Fizz
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
**Status**: `open`
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

**Files Likely Involved**:
- `src/app/skills/page.tsx` (new)
- `src/components/skills/SkillsPage.tsx` (new, optional)
- Uses existing `/api/data/skills` endpoint
- Workbook content/connections for 1.1 may need updates

**Acceptance Criteria**:
- [ ] `/skills` route renders
- [ ] Skills displayed grouped by section
- [ ] Accessible, navigable list
- [ ] WB 1.1 references link to `/skills` page
- [ ] Build passes

---

## In Progress

<!-- Bugs currently being worked on -->

### BUG-015: Input field position and Continue button alignment
**Status**: `open`
**Priority**: `high`
**Area**: design-system
**Found by**: User walkthrough

**Description**:
Two layout issues:

1. **Input field position** — Should be consistently positioned ~20% from the bottom of the screen by default. Currently floats wherever the content ends.

2. **Continue buttons** — Should be right-aligned. Currently centered or left-aligned.

**Expected Behavior**:
- Input field anchored at consistent vertical position (20% from bottom)
- Continue buttons right-aligned
- Creates predictable, professional layout

**Files Likely Involved**:
- `src/app/globals.css` — Layout and button alignment
- `src/components/workbook/WorkbookView.tsx` — Input area positioning
- `src/components/shell/InputArea.tsx` — If input uses this component
- `src/components/conversation/ConversationThread.tsx` — Continue button container

**Acceptance Criteria**:
- [ ] Input field positioned ~20% from bottom of viewport
- [ ] All Continue buttons right-aligned
- [ ] Layout consistent across exercises
- [ ] Works on different screen sizes
- [ ] Build passes

---

### BUG-014: Prompts require extra Continue before input appears
**Status**: `open`
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

**Root Cause Hypothesis**:
Prompt blocks are treated like content blocks, requiring Continue to advance. Instead, prompt animation completion should automatically reveal the input — no intermediate step.

**Files Likely Involved**:
- `src/components/workbook/WorkbookView.tsx` — block advancement logic
- Possibly `PromptInput.tsx` or message rendering

**Acceptance Criteria**:
- [ ] Prompt question animates
- [ ] Input field appears automatically after question animation completes
- [ ] No extra Continue click between question and input
- [ ] Content blocks still require Continue (unchanged)
- [ ] Tool blocks behave similarly (tool appears when intro text completes)
- [ ] Build passes

---

## Review (Awaiting QA)

<!-- Bugs completed by workers, awaiting Pazz verification -->

*No bugs awaiting review.*

---

## Improvements (Non-Blocking)

**Tech debt, performance, and efficiency opportunities. Not bugs — the app works, these make it better.**

---

### IMP-001: Mutable Map in render path
**Found by**: Fizz
**Phase**: 1
**Impact**: `medium`
**Area**: workbook
**Files**:
- `src/components/workbook/WorkbookView.tsx:358`

**Finding**:
`promptResponseMap.set()` is called during save handlers, mutating a `useMemo` result. While functionally working, this violates React's immutability principles and could cause subtle bugs with stale closures or missed re-renders.

**Recommendation**:
Use `useState` for response maps, or create a new Map on updates to trigger proper re-renders.

---

### IMP-002: ToolEmbed has 15 useState declarations
**Found by**: Fizz
**Phase**: 1
**Impact**: `medium`
**Area**: workbook
**Files**:
- `src/components/workbook/ToolEmbed.tsx:96-155`

**Finding**:
ToolEmbed maintains separate useState for each tool type's data (listItems, soaredData, rankingItems, etc.). This creates 15+ state variables regardless of which tool is actually rendered, wasting memory and making the component hard to maintain.

**Recommendation**:
Use a discriminated union pattern with a single `toolData` state, or extract each tool's state into custom hooks (`useListBuilder`, `useSOARED`, etc.).

---

### IMP-003: Expensive messages rebuild on every displayedBlockIndex change
**Found by**: Fizz
**Phase**: 1
**Impact**: `medium`
**Area**: workbook
**Files**:
- `src/components/workbook/WorkbookView.tsx:174-225`

**Finding**:
The `messages` useMemo rebuilds the entire messages array when `displayedBlockIndex` changes. This includes re-parsing content for ALL blocks 0 to N, not just the new one.

**Recommendation**:
Consider incremental message building — keep previous messages stable and only compute the new one, or use a more efficient data structure.

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

### IMP-006: ConversationThread re-renders on every message array change
**Found by**: Fizz
**Phase**: 1
**Impact**: `low`
**Area**: conversation
**Files**:
- `src/components/conversation/ConversationThread.tsx:106-128`

**Finding**:
The message list is mapped on every render without React.memo on MessageRenderer. If messages array reference changes (even with same content), all message components re-render.

**Recommendation**:
Wrap MessageRenderer in React.memo with proper comparison, or ensure messages array has stable references for unchanged messages.

---

### IMP-007: TypingEffect creates interval per character
**Found by**: Fizz
**Phase**: 1
**Impact**: `low`
**Area**: conversation
**Files**:
- `src/components/conversation/TypingEffect.tsx:46-57`

**Finding**:
TypingEffect uses `setInterval` with state updates for each character. For long text, this creates many rapid state updates. Effect is minor due to 30ms interval, but not optimal.

**Recommendation**:
Consider using CSS animation for cursor blink, and `requestAnimationFrame` batch approach for text reveal, or simpler: pre-compute timing and use a single timeout chain.

---

### IMP-008: getToolData recreated on every state change
**Found by**: Fizz
**Phase**: 1
**Impact**: `low`
**Area**: workbook
**Files**:
- `src/components/workbook/ToolEmbed.tsx:247-286`

**Finding**:
`getToolData` useCallback has all 15 tool state variables in its dependency array. Any tool state change recreates this function, which triggers the auto-save effect unnecessarily.

**Recommendation**:
Structure so auto-save only watches the relevant tool's state, not all tool states. Or use a ref for getToolData.

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
**Files**:
- All 86 components in `src/components/`

**Finding**:
No unit tests exist for any React components. Critical business logic in WorkbookView (628 lines), ConnectionResolver (720 lines), and auth functions (286 lines) has zero test coverage. Refactoring or bug fixes are flying blind.

**Recommendation**:
Add Vitest + React Testing Library to main package. Prioritize tests for WorkbookView state machine, ConnectionResolver data fetchers, and auth encryption logic.

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

### IMP-020: Silent catch blocks without error logging
**Found by**: Fizz
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

**Recommendation**:
At minimum: add console.error to all catch blocks. Better: add error telemetry service. Critical paths (auth, encryption) should surface failures more explicitly.

---

### IMP-021: Data loading failures only console.error (no user feedback)
**Found by**: Fizz
**Phase**: 2
**Impact**: `medium`
**Area**: workbook
**Files**:
- `src/components/workbook/ToolEmbed.tsx:176` - Skills fetch `.catch(err => console.error(...))`
- `src/components/workbook/ToolEmbed.tsx:192` - Competencies fetch `.catch(err => console.error(...))`
- `src/components/workbook/ToolEmbed.tsx:242` - Connection data fetch `.catch(err => console.error(...))`

**Finding**:
When skills, competencies, or connection data fail to load, the only feedback is a console.error. The user sees either eternal loading state or an empty/broken tool with no indication of what went wrong.

**Recommendation**:
Set error state and show user-friendly message: "Failed to load [X]. Tap to retry." Consider a retry button or automatic retry with backoff.

---

### IMP-022: Most errors only console.error (no user notification)
**Found by**: Fizz
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

**Recommendation**:
Add toast notifications for user-initiated actions that fail. Use `showToast('Failed to save', { type: 'error' })` pattern already in WorkbookView.

---

### IMP-023: Single global ErrorBoundary, no component isolation
**Found by**: Fizz
**Phase**: 2
**Impact**: `medium`
**Area**: error-handling
**Files**:
- `src/components/Providers.tsx:13-17` - Single ErrorBoundary wrapping entire app
- `src/components/feedback/ErrorBoundary.tsx` - Implementation

**Finding**:
One ErrorBoundary at the root level. If any component throws, the entire app shows the error screen. No isolation for independent features (tools, profile, dashboard could each have their own boundary).

**Recommendation**:
Add ErrorBoundary around:
- Each tool in ToolEmbed (tool crash shouldn't kill workbook)
- Dashboard widgets (one widget crash shouldn't kill dashboard)
- Profile sections (one section crash shouldn't kill profile page)

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

### IMP-025: Generic error messages hide root cause
**Found by**: Fizz
**Phase**: 2
**Impact**: `low`
**Area**: ux
**Files**:
- `src/app/(auth)/login/page.tsx:40` - "An error occurred. Please try again."
- `src/app/(auth)/signup/page.tsx:44` - "An error occurred. Please try again."
- `src/components/workbook/ToolEmbed.tsx:311` - "Failed to save. Please try again."

**Finding**:
User-facing error messages are generic. Network error, server error, validation error all show the same message. User can't self-diagnose (is it their connection? their input? the server?).

**Recommendation**:
Differentiate error types: network errors ("Check your connection"), validation errors (specific field), server errors ("Our servers are having issues"). Preserve original error in dev mode.

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
**Files**:
- `package.json`
- `postcss.config.mjs`

**Finding**:
Tailwind CSS (`tailwindcss`, `@tailwindcss/postcss`) is in devDependencies and configured in PostCSS, but never used. Zero `@tailwind` or `@apply` directives in any CSS file. The codebase uses pure CSS custom properties as intended by the design system.

**Recommendation**:
Remove `tailwindcss` and `@tailwindcss/postcss` from package.json. Remove or update postcss.config.mjs.

---

### IMP-036: 5 orphan components (265 lines dead code)
**Found by**: Buzz
**Phase**: 2
**Impact**: `medium`
**Area**: components
**Files**:
- `src/components/onboarding/CompleteStep.tsx` (35 lines)
- `src/components/onboarding/NameStep.tsx` (43 lines)
- `src/components/onboarding/WelcomeStep.tsx` (32 lines)
- `src/components/onboarding/OnboardingProgress.tsx` (28 lines)
- `src/components/feedback/Tooltip.tsx` (127 lines)

**Finding**:
5 components are exported from index.ts but never imported or used anywhere in the codebase. The 4 onboarding components are remnants of the old multi-step flow that was replaced with a simplified OnboardingFlow. Tooltip was built but never instantiated.

**Recommendation**:
Delete the 5 orphan files. Remove exports from `onboarding/index.ts` and `feedback/index.ts`.

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
