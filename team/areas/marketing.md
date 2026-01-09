# Marketing Area

**Owner:** Rizz

---

## Overview

The marketing area covers all user-facing copy and communication strategy. This includes landing pages, in-app microcopy, email templates, and campaign materials.

**Philosophy first:** All marketing work must align with `team/private/PHILOSOPHY.md`.

---

## Files

```
marketing/                     ← Reusable toolkit (future spin-off)
├── README.md

src/components/               ← Copy lives in components
├── landing/                  ← Landing page components
└── (various)                 ← Buttons, empty states, errors

team/
├── RIZZ.md                   ← Role definition
├── private/PHILOSOPHY.md     ← Source of truth for voice
└── areas/marketing.md        ← This file
```

---

## Copy Locations

| Copy Type | Location |
|-----------|----------|
| Landing page | `src/components/landing/LandingPage.tsx` |
| Button labels | Individual component files |
| Empty states | `EmptyState.tsx` and component-level |
| Error messages | API routes, ErrorBoundary |
| Onboarding | `OnboardingFlow.tsx` |
| Dashboard greetings | `DashboardGreeting.tsx` |

---

## Workflow

### Copy Change Process

1. **Identify** — Find copy that needs improvement
2. **Draft** — Write new copy aligned with philosophy
3. **Propose** — Post to BOARD.md with before/after
4. **Approval** — Queen Bee reviews
5. **Implement** — Update the relevant files
6. **Verify** — Check in browser, verify build passes

### Campaign Process

1. **Strategy** — Define goals, audience, message
2. **Draft** — Create all campaign materials
3. **Review** — Queen Bee approval
4. **Launch** — Execute campaign
5. **Analyze** — Measure results via analytics

---

## Patterns

### Copy as Code

Copy lives in component files, not a CMS. This means:
- Changes are version-controlled
- Copy is type-safe (TypeScript)
- No external dependencies

**Future:** The marketing toolkit may introduce a copy management system.

### Voice Consistency

All copy should:
- Sound conversational, not corporate
- Respect user autonomy (no pressure tactics)
- Be concise and clear
- Align with the four pillars (see `CLAUDE.md`)

---

## Testing

### Before Merging Copy Changes

1. **Build passes:** `npm run build`
2. **Visual check:** View in browser at all breakpoints
3. **Voice check:** Does it sound like us?
4. **Soul check:** Does it serve the pillars?

---

## Dependencies

| Area | Dependency |
|------|------------|
| Fizz | Builds components that contain copy |
| Buzz | Builds analytics to measure copy effectiveness |
| Buzz | Builds email infrastructure |
| Queen Bee | Approves all copy changes |

---

## Learnings

*Add insights about what works as you discover them.*

### Voice
- [Voice patterns that resonate]

### What Doesn't Work
- [Approaches that failed]

### A/B Test Results
- [Results from copy experiments]
