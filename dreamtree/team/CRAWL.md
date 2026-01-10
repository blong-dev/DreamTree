# Codebase Crawl Plan

**STATUS: ✅ COMPLETE** — All phases finished (see BOARD_HISTORY.md for details)

---

## Team Assignments

| Name | Primary Focus | Secondary Focus |
|------|---------------|-----------------|
| **Fizz** | Core user flow (workbook, conversation) | Performance patterns |
| **Buzz** | Infrastructure (database, auth, API) | Dead code / orphans |
| **Pazz** | UI layer (shell, tools, features) | Test coverage gaps |
| **Queen Bee** | Spec alignment, coordination | Documentation accuracy |

---

## Phase 1: Area Deep Dives ✅ COMPLETE

Each team member owns specific areas. Read every file, understand every pattern, document findings.

### Fizz — Core Flow ✅
```
src/components/workbook/      ← Exercise delivery system
src/components/conversation/  ← Chat interface
src/app/workbook/            ← Workbook pages
src/app/api/workbook/        ← Workbook API routes
```

**Deliverables:**
- [x] Map complete user journey from exercise start to completion
- [x] Document all state management patterns
- [x] Identify all re-render triggers
- [x] List all API calls and their responses
- [x] Find performance bottlenecks

### Buzz — Infrastructure ✅
```
src/lib/db/                  ← Database queries
src/lib/auth/                ← Authentication
src/lib/connections/         ← Data flow between exercises
src/app/api/                 ← All API routes
migrations/                  ← Schema history
```

**Deliverables:**
- [x] Document every database query
- [x] Map auth flow (signup → session → protected routes)
- [x] Trace ConnectionResolver data paths
- [x] List all API routes with methods and purposes
- [x] Find unused queries/routes

### Pazz — UI Layer ✅ (Split to Fizz/Buzz)
```
src/components/shell/        ← Layout, navigation
src/components/tools/        ← 15 interactive tools
src/components/forms/        ← Form primitives
src/components/feedback/     ← Toast, tooltip, etc.
src/components/dashboard/    ← Dashboard components
src/components/profile/      ← Profile components
src/components/onboarding/   ← Onboarding flow
src/components/icons/        ← Icon components
```

**Deliverables:**
- [x] Inventory all components with props
- [x] Map component dependency tree
- [x] Identify shared patterns vs one-offs
- [x] Find components missing test coverage
- [x] List accessibility gaps

---

## Phase 2: Cross-Cutting Analysis ✅ COMPLETE

After area deep dives, each member analyzes a concern across the ENTIRE codebase.

### Fizz — Error Handling Audit ✅
```
Every file in src/
```
- [x] Find all try/catch blocks
- [x] Find all .catch() handlers
- [x] Identify silent failures (empty catch blocks)
- [x] List user-facing error states
- [x] Map error boundaries

### Buzz — Dependency Analysis ✅
```
package.json
Every import statement
```
- [x] List all npm dependencies with purpose
- [x] Find unused dependencies
- [x] Map internal import graph
- [x] Identify circular dependencies
- [x] Find orphan files (nothing imports them)

### Pazz — Type Safety Audit ✅
```
src/types/
Every TypeScript file
```
- [x] Find all `any` types
- [x] Find all type assertions (as X)
- [x] Identify missing return types
- [x] List unsafe type patterns
- [x] Map type dependencies

---

## Phase 3: Spec Alignment ✅ COMPLETE

Compare implementation against specs in `/planning/`.

### Fizz — Component Spec Alignment ✅
```
Compare: planning/DreamTree_Component_Spec.md
Against: src/components/
```
- [x] Every component matches spec props
- [x] Every component matches spec behavior
- [x] List deviations with justification or concern

### Buzz — Data Architecture Alignment ✅
```
Compare: planning/DreamTree_Data_Architecture_v4.md
Against: src/lib/db/, migrations/
```
- [x] Schema matches spec
- [x] Queries follow spec patterns
- [x] Connections work as specified
- [x] List deviations

### Pazz — Design System Alignment ✅
```
Compare: planning/DreamTree_Design_System.md
Against: src/app/globals.css
```
- [x] All tokens match spec values
- [x] Color pairings follow WCAG rules
- [x] Spacing/typography follows scale
- [x] List deviations

---

## Phase 4: Integration Mapping ✅ COMPLETE

Map how everything connects.

### Fizz — Data Flow Map ✅
```
User action → API → Database → Response → UI update
```
- [x] Document 5 key user flows end-to-end
- [x] Identify where data transforms
- [x] Find potential race conditions

### Buzz — State Management Map ✅
```
Client state, server state, URL state
```
- [x] Map all useState/useRef usage
- [x] Map all API state (loading, error, data)
- [x] Identify state that should be shared vs local

### Pazz — Event Flow Map ✅
```
User input → Handler → Side effect → UI feedback
```
- [x] Document all keyboard shortcuts
- [x] Map all click handlers
- [x] Identify missing feedback states

---

## Output Requirements

**Every finding goes to BUGS.md Improvements section:**

```markdown
### IMP-XXX: [Title]
**Found by**: [Name]
**Phase**: [1/2/3/4]
**Impact**: `low` | `medium` | `high`
**Area**: [area]
**Files**:
- `path/to/file.tsx`

**Finding**:
[What you discovered]

**Recommendation**:
[What should be done — but don't do it yet]
```

**Post progress updates to BOARD.md daily.**

---

## Timeline

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Area Deep Dives | ✅ Complete |
| 2 | Cross-Cutting Analysis | ✅ Complete |
| 3 | Spec Alignment | ✅ Complete |
| 4 | Integration Mapping | ✅ Complete |

**No phase skipping. Finish one before starting the next.**

---

## Coordination

- **Blockers**: Post to BOARD.md immediately, tag @Queen
- **Questions**: Post to BOARD.md, tag relevant team member
- **Overlaps**: If you find something in another member's area, note it and tag them
- **Progress**: Update BOARD.md when you complete a deliverable checkbox

---

## Victory Condition ✅ ACHIEVED

When all phases complete, we will have:
1. ✅ Complete understanding of every file's purpose
2. ✅ Documented map of all data flows
3. ✅ Prioritized improvement backlog
4. ✅ Spec alignment report
5. ✅ Team expertise across the entire codebase

**Crawl complete. Execution phase active.**
