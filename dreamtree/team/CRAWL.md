# Codebase Crawl Plan

**Systematic exploration of the entire DreamTree codebase. No edits — learn and document only.**

---

## Team Assignments

| Name | Primary Focus | Secondary Focus |
|------|---------------|-----------------|
| **Fizz** | Core user flow (workbook, conversation) | Performance patterns |
| **Buzz** | Infrastructure (database, auth, API) | Dead code / orphans |
| **Pazz** | UI layer (shell, tools, features) | Test coverage gaps |
| **Queen Bee** | Spec alignment, coordination | Documentation accuracy |

---

## Phase 1: Area Deep Dives (Immediate)

Each team member owns specific areas. Read every file, understand every pattern, document findings.

### Fizz — Core Flow
```
src/components/workbook/      ← Exercise delivery system
src/components/conversation/  ← Chat interface
src/app/workbook/            ← Workbook pages
src/app/api/workbook/        ← Workbook API routes
```

**Deliverables:**
- [ ] Map complete user journey from exercise start to completion
- [ ] Document all state management patterns
- [ ] Identify all re-render triggers
- [ ] List all API calls and their responses
- [ ] Find performance bottlenecks

### Buzz — Infrastructure
```
src/lib/db/                  ← Database queries
src/lib/auth/                ← Authentication
src/lib/connections/         ← Data flow between exercises
src/app/api/                 ← All API routes
migrations/                  ← Schema history
```

**Deliverables:**
- [ ] Document every database query
- [ ] Map auth flow (signup → session → protected routes)
- [ ] Trace ConnectionResolver data paths
- [ ] List all API routes with methods and purposes
- [ ] Find unused queries/routes

### Pazz — UI Layer
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
- [ ] Inventory all components with props
- [ ] Map component dependency tree
- [ ] Identify shared patterns vs one-offs
- [ ] Find components missing test coverage
- [ ] List accessibility gaps

---

## Phase 2: Cross-Cutting Analysis

After area deep dives, each member analyzes a concern across the ENTIRE codebase.

### Fizz — Error Handling Audit
```
Every file in src/
```
- [ ] Find all try/catch blocks
- [ ] Find all .catch() handlers
- [ ] Identify silent failures (empty catch blocks)
- [ ] List user-facing error states
- [ ] Map error boundaries

### Buzz — Dependency Analysis
```
package.json
Every import statement
```
- [ ] List all npm dependencies with purpose
- [ ] Find unused dependencies
- [ ] Map internal import graph
- [ ] Identify circular dependencies
- [ ] Find orphan files (nothing imports them)

### Pazz — Type Safety Audit
```
src/types/
Every TypeScript file
```
- [ ] Find all `any` types
- [ ] Find all type assertions (as X)
- [ ] Identify missing return types
- [ ] List unsafe type patterns
- [ ] Map type dependencies

---

## Phase 3: Spec Alignment

Compare implementation against specs in `/planning/`.

### Fizz — Component Spec Alignment
```
Compare: planning/DreamTree_Component_Spec.md
Against: src/components/
```
- [ ] Every component matches spec props
- [ ] Every component matches spec behavior
- [ ] List deviations with justification or concern

### Buzz — Data Architecture Alignment
```
Compare: planning/DreamTree_Data_Architecture_v4.md
Against: src/lib/db/, migrations/
```
- [ ] Schema matches spec
- [ ] Queries follow spec patterns
- [ ] Connections work as specified
- [ ] List deviations

### Pazz — Design System Alignment
```
Compare: planning/DreamTree_Design_System.md
Against: src/app/globals.css
```
- [ ] All tokens match spec values
- [ ] Color pairings follow WCAG rules
- [ ] Spacing/typography follows scale
- [ ] List deviations

---

## Phase 4: Integration Mapping

Map how everything connects.

### Fizz — Data Flow Map
```
User action → API → Database → Response → UI update
```
- [ ] Document 5 key user flows end-to-end
- [ ] Identify where data transforms
- [ ] Find potential race conditions

### Buzz — State Management Map
```
Client state, server state, URL state
```
- [ ] Map all useState/useRef usage
- [ ] Map all API state (loading, error, data)
- [ ] Identify state that should be shared vs local

### Pazz — Event Flow Map
```
User input → Handler → Side effect → UI feedback
```
- [ ] Document all keyboard shortcuts
- [ ] Map all click handlers
- [ ] Identify missing feedback states

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

| Phase | Focus | Duration |
|-------|-------|----------|
| 1 | Area Deep Dives | Until complete |
| 2 | Cross-Cutting Analysis | After Phase 1 |
| 3 | Spec Alignment | After Phase 2 |
| 4 | Integration Mapping | After Phase 3 |

**No phase skipping. Finish one before starting the next.**

---

## Coordination

- **Blockers**: Post to BOARD.md immediately, tag @Queen
- **Questions**: Post to BOARD.md, tag relevant team member
- **Overlaps**: If you find something in another member's area, note it and tag them
- **Progress**: Update BOARD.md when you complete a deliverable checkbox

---

## Victory Condition

When all phases complete, we will have:
1. Complete understanding of every file's purpose
2. Documented map of all data flows
3. Prioritized improvement backlog
4. Spec alignment report
5. Team expertise across the entire codebase

Then we execute with precision.
