# Analytics Validation Document

> **Author**: Buzz
> **Date**: 2026-01-09
> **Status**: Complete
> **Prerequisite for**: Analytics scaffolding

---

## V1: Encryption Audit

### Executive Summary

**CRITICAL FINDING**: DreamTree has encryption architecture designed but **NOT implemented**. The cryptographic code exists (`src/lib/auth/encryption.ts`) but is never called. All PII is stored in plaintext.

### Current State

| Component | Status |
|-----------|--------|
| Encryption library | ✓ Implemented (AES-GCM, PBKDF2) |
| Key derivation | ✓ Working (password → wrapping key) |
| Data key wrapping | ✓ Working (stored in auth table) |
| Field encryption | ✗ **NEVER CALLED** |
| Field decryption | ✗ **NEVER CALLED** |

### Field-by-Field Audit

| Field | Table | Currently Encrypted? | Should Be Encrypted? | Status |
|-------|-------|---------------------|---------------------|--------|
| **IDENTITY** |
| email | emails | NO | YES | ❌ GAP |
| display_name | user_profile | NO | YES | ❌ GAP |
| **BUDGET/EXPENSES** |
| monthly_expenses | user_budget | NO | YES | ❌ GAP |
| annual_needs | user_budget | NO | YES | ❌ GAP |
| hourly_batna | user_budget | NO | YES | ❌ GAP |
| BudgetCalculator JSON | user_responses | NO | YES | ❌ GAP |
| **LOVE CONTENT** |
| Module 1.4 responses | user_responses | NO | YES | ❌ GAP |
| Love-tagged stories | user_stories | NO | YES | ❌ GAP |
| **NETWORKING** |
| contact.name | user_contacts | NO | YES | ❌ GAP |
| contact.title | user_contacts | NO | YES | ❌ GAP |
| contact.linkedin_url | user_contacts | NO | YES | ❌ GAP |
| **GEOGRAPHIC** |
| location.name | user_locations | NO | NO | ✓ CORRECT |
| state_code | user_responses | NO | NO | ✓ CORRECT |
| **SALARY TARGETS** |
| salary_target | user_responses | NO | NO | ✓ CORRECT |
| **CAREER DATA** |
| All career responses | user_responses | NO | NO | ✓ CORRECT |
| All tool outputs | user_responses | NO | NO | ✓ CORRECT |
| Behavioral patterns | various | NO | NO | ✓ CORRECT |

### Recommendation

**Before analytics scaffolding**: File IMP ticket for encryption implementation. Analytics can proceed on career data (which is correctly unencrypted). PII encryption is a separate workstream.

### Impact on Analytics

Analytics is **UNBLOCKED** because:
- Career data (what we want to analyze) is correctly plaintext
- PII fields (what we DON'T analyze) need encryption but that's separate work
- Analytics schema won't touch encrypted fields

---

## V2: Schema Review

### Proposed Analytics Schema

```sql
CREATE TABLE analytics_events (
    id TEXT PRIMARY KEY,
    user_id TEXT,                    -- FK, nullable for anonymous
    session_id TEXT,
    event_type TEXT NOT NULL,
    target_type TEXT,                -- 'exercise', 'prompt', 'tool', 'page'
    target_id TEXT,
    event_data TEXT,                 -- JSON
    created_at TEXT NOT NULL
);

CREATE TABLE analytics_aggregates (
    id TEXT PRIMARY KEY,
    metric_name TEXT NOT NULL,
    dimension TEXT,
    dimension_value TEXT,
    metric_value REAL NOT NULL,
    period_start TEXT NOT NULL,
    period_end TEXT NOT NULL,
    computed_at TEXT NOT NULL
);
```

### Privacy Review

| Column | Contains PII? | Analyzable? | Notes |
|--------|---------------|-------------|-------|
| user_id | Pseudonymous | Yes | Links to user but not real identity |
| session_id | No | Yes | Random ID |
| event_type | No | Yes | Controlled vocabulary |
| target_type | No | Yes | 'exercise', 'tool', etc. |
| target_id | No | Yes | '1.2.3', '100000', etc. |
| event_data | **MUST REVIEW** | Conditional | See below |
| created_at | No | Yes | Timestamp |

### event_data Restrictions

The `event_data` JSON field must NEVER contain:
- ❌ Response content (what users write)
- ❌ Names, emails, or identity info
- ❌ Budget/expense amounts
- ❌ Contact information

It CAN contain:
- ✓ Duration (time_ms)
- ✓ Counts (items_count, prompts_answered)
- ✓ Completion status (boolean)
- ✓ UI state (scroll_depth, viewport_height)

### Schema Verdict: ✓ APPROVED

Schema is privacy-safe. Enforcement happens at collection layer.

---

## V3: Instrumentation Points

### MVP Events Map

| Event | File | Location | Trigger | Notes |
|-------|------|----------|---------|-------|
| `session_start` | `middleware.ts` | Session creation | On new session cookie | Include device_type |
| `session_end` | N/A | Inferred | No event, use last_seen gap | |
| `page_view` | `middleware.ts` | Route change | Every request | pathname only |
| `exercise_start` | `WorkbookView.tsx` | `useEffect` | On exerciseId change | First view of exercise |
| `exercise_complete` | `WorkbookView.tsx` | Response submit | Last prompt/tool answered | Include duration |
| `prompt_view` | `WorkbookView.tsx` | Block render | When prompt block displays | |
| `prompt_submit` | `PromptInput.tsx` | `onSubmit` | User submits response | NO content |
| `tool_open` | `ToolEmbed.tsx` | `useEffect` | Tool component mounts | |
| `tool_submit` | `ToolEmbed.tsx` | `handleSave` | User saves tool data | items_count only |
| `error` | API routes | catch block | On 500 errors | endpoint + status |

### Instrumentation Code Locations

```
src/
├── middleware.ts
│   └── Line ~30: Add session_start, page_view
├── components/workbook/
│   ├── WorkbookView.tsx
│   │   ├── Line ~150: exercise_start (useEffect on exerciseId)
│   │   └── Line ~400: exercise_complete (after final response)
│   ├── PromptInput.tsx
│   │   └── Line ~80: prompt_submit (onSubmit handler)
│   └── ToolEmbed.tsx
│       ├── Line ~50: tool_open (useEffect on mount)
│       └── Line ~120: tool_submit (handleSave)
└── app/api/
    └── */route.ts: error events in catch blocks
```

### Instrumentation Verdict: ✓ MAPPED

All MVP events have clear code locations identified.

---

## V4: API Contract

### Track Endpoint

```typescript
// POST /api/analytics/track

// Request
interface TrackRequest {
  eventType: AnalyticsEventType;
  targetType?: 'exercise' | 'prompt' | 'tool' | 'page' | 'api';
  targetId?: string;
  data?: EventData;
}

// Response
interface TrackResponse {
  success: boolean;
  eventId?: string;
  error?: string;
}

// Event Types (controlled vocabulary)
type AnalyticsEventType =
  | 'session_start'
  | 'page_view'
  | 'exercise_start'
  | 'exercise_complete'
  | 'prompt_view'
  | 'prompt_submit'
  | 'tool_open'
  | 'tool_submit'
  | 'error';

// Event Data (metadata only, NO content)
interface EventData {
  duration_ms?: number;
  items_count?: number;
  prompts_answered?: number;
  scroll_depth?: number;
  error_status?: number;
  error_endpoint?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop';
}
```

### Client SDK

```typescript
// src/lib/analytics/track.ts

export async function track(
  eventType: AnalyticsEventType,
  options?: {
    targetType?: string;
    targetId?: string;
    data?: EventData;
  }
): Promise<void> {
  // Skip in development
  if (process.env.NODE_ENV !== 'production') return;

  // Fire and forget
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType,
      ...options,
    }),
    keepalive: true, // Survives page unload
  }).catch(() => {
    // Silent fail - never break the app
  });
}
```

### Server Helper

```typescript
// src/lib/analytics/server.ts

export async function trackServer(
  db: D1Database,
  eventType: AnalyticsEventType,
  options: {
    userId?: string;
    sessionId?: string;
    targetType?: string;
    targetId?: string;
    data?: EventData;
  }
): Promise<string> {
  const eventId = nanoid();
  const now = new Date().toISOString();

  await db.prepare(`
    INSERT INTO analytics_events
    (id, user_id, session_id, event_type, target_type, target_id, event_data, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    eventId,
    options.userId || null,
    options.sessionId || null,
    eventType,
    options.targetType || null,
    options.targetId || null,
    options.data ? JSON.stringify(options.data) : null,
    now
  ).run();

  return eventId;
}
```

### API Contract Verdict: ✓ FINALIZED

TypeScript interfaces defined and ready for implementation.

---

## V5: Admin Dashboard Wireframe

### Route Structure

```
/admin                    → Overview dashboard
/admin/funnel             → Completion funnel
/admin/exercises          → Exercise-level metrics
/admin/tools              → Tool usage stats
/admin/errors             → Error log
```

### Overview Page (`/admin`)

```
┌─────────────────────────────────────────────────────────────────┐
│  DREAMTREE ADMIN                                    [Logout]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐│
│  │    DAU      │  │    WAU      │  │    MAU      │  │  Total  ││
│  │    127      │  │    892      │  │   2,341     │  │  5,678  ││
│  │   +12%      │  │    +8%      │  │    +15%     │  │         ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘│
│                                                                 │
│  COMPLETION FUNNEL (Last 30 days)                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Started     ████████████████████████████████████  2,341     ││
│  │ Part 1      ██████████████████████████           1,756 (75%)││
│  │ Part 2      ████████████████                     1,170 (50%)││
│  │ Part 3      ██████████                             702 (30%)││
│  │ Completed   ██████                                 468 (20%)││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  TOP DROP-OFF EXERCISES                    MOST USED TOOLS      │
│  ┌──────────────────────────┐              ┌──────────────────┐ │
│  │ 1. 1.2.3 Values (47%)    │              │ 1. ListBuilder   │ │
│  │ 2. 2.1.1 SOARED (38%)    │              │ 2. FlowTracker   │ │
│  │ 3. 1.3.2 Skills (31%)    │              │ 3. SkillTagger   │ │
│  └──────────────────────────┘              └──────────────────┘ │
│                                                                 │
│  RECENT ERRORS                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 10:23  500  /api/workbook/response  "Database timeout"  x3  ││
│  │ 09:45  401  /api/profile            "Invalid session"   x1  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Funnel Page (`/admin/funnel`)

```
┌─────────────────────────────────────────────────────────────────┐
│  COMPLETION FUNNEL                          [7d] [30d] [90d]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Filter: [All Users ▼]  [All Time ▼]                           │
│                                                                 │
│  PART 1: ROOTS                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 1.1 Skills        ████████████████████████████  2,341 (100%)││
│  │ 1.2 Values        ██████████████████████████    2,107 (90%) ││
│  │ 1.3 Personality   ████████████████████████      1,990 (85%) ││
│  │ 1.4 Love          ██████████████████            1,521 (65%) ││
│  │ ─────────────────────────────────────────────────────────── ││
│  │ Part 1 Complete   ████████████████              1,404 (60%) ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  PART 2: TRUNK                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 2.1 Stories       ██████████████                1,404 (60%) ││
│  │ 2.2 Decisions     ████████████                  1,170 (50%) ││
│  │ 2.3 Priorities    ██████████                      936 (40%) ││
│  │ ─────────────────────────────────────────────────────────── ││
│  │ Part 2 Complete   ████████                        702 (30%) ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Exercises Page (`/admin/exercises`)

```
┌─────────────────────────────────────────────────────────────────┐
│  EXERCISE METRICS                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Sort: [Drop-off Rate ▼]  Filter: [Part 1 ▼]                   │
│                                                                 │
│  ┌─────────┬─────────┬───────────┬───────────┬────────────────┐│
│  │ Exercise│ Started │ Completed │ Drop-off  │ Avg Duration   ││
│  ├─────────┼─────────┼───────────┼───────────┼────────────────┤│
│  │ 1.2.3   │   890   │    472    │   47% ⚠️  │    12m 30s     ││
│  │ 1.1.4   │   756   │    479    │   37%     │     8m 15s     ││
│  │ 1.3.2   │   612   │    423    │   31%     │    15m 45s     ││
│  │ 1.1.1   │  2341   │   2107    │   10%     │     3m 20s     ││
│  │ ...     │   ...   │    ...    │   ...     │      ...       ││
│  └─────────┴─────────┴───────────┴───────────┴────────────────┘│
│                                                                 │
│  Click exercise for detailed breakdown                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tools Page (`/admin/tools`)

```
┌─────────────────────────────────────────────────────────────────┐
│  TOOL USAGE                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┬───────┬─────────┬───────────┬───────────┐│
│  │ Tool             │ Opens │ Submits │ Save Rate │ Avg Items ││
│  ├──────────────────┼───────┼─────────┼───────────┼───────────┤│
│  │ ListBuilder      │ 1,890 │  1,654  │    87%    │    8.3    ││
│  │ FlowTracker      │ 1,234 │    987  │    80%    │    5.1    ││
│  │ SkillTagger      │   890 │    756  │    85%    │   12.4    ││
│  │ SOAREDForm       │   567 │    423  │    75%    │    N/A    ││
│  │ RankingGrid      │   456 │    398  │    87%    │    N/A    ││
│  │ BudgetCalculator │   234 │    189  │    81%    │    N/A    ││
│  │ ...              │   ... │    ...  │    ...    │    ...    ││
│  └──────────────────┴───────┴─────────┴───────────┴───────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Dashboard Verdict: ✓ WIREFRAMED

Layout defined. Implementation uses existing design system (no chart library needed for MVP).

---

## V6: Privacy Compliance Check

### Event-by-Event Privacy Audit

| Event Type | PII Risk | event_data Contents | Compliant? |
|------------|----------|---------------------|------------|
| `session_start` | LOW | `{device_type}` | ✓ YES |
| `page_view` | LOW | `{pathname}` (no query params) | ✓ YES |
| `exercise_start` | NONE | `null` | ✓ YES |
| `exercise_complete` | LOW | `{duration_ms, prompts_answered}` | ✓ YES |
| `prompt_view` | NONE | `null` | ✓ YES |
| `prompt_submit` | **HIGH** | Must be `null` - NO CONTENT | ⚠️ ENFORCE |
| `tool_open` | NONE | `null` | ✓ YES |
| `tool_submit` | **MEDIUM** | `{items_count}` only - NO CONTENT | ⚠️ ENFORCE |
| `error` | LOW | `{status, endpoint}` - no user data | ✓ YES |

### Enforcement Rules

```typescript
// In /api/analytics/track validation

const ALLOWED_EVENT_DATA_KEYS = [
  'duration_ms',
  'items_count',
  'prompts_answered',
  'scroll_depth',
  'error_status',
  'error_endpoint',
  'device_type',
  'pathname',
];

function validateEventData(data: unknown): boolean {
  if (!data) return true;
  if (typeof data !== 'object') return false;

  const keys = Object.keys(data);
  return keys.every(key => ALLOWED_EVENT_DATA_KEYS.includes(key));
}
```

### Aggregate Safety

All events can be safely aggregated:
- ✓ `COUNT(DISTINCT user_id)` — counts users, doesn't identify them
- ✓ `AVG(duration_ms)` — average time, no individual exposure
- ✓ `GROUP BY target_id` — groups by exercise/tool, not user

### Retention Policy

```sql
-- Run weekly via Cloudflare Cron
DELETE FROM analytics_events
WHERE created_at < datetime('now', '-90 days');

-- Aggregates kept forever (already anonymized)
```

### Data Export

Analytics events included in user export:
```typescript
// In /api/profile/export
const analyticsEvents = await db.prepare(
  'SELECT * FROM analytics_events WHERE user_id = ?'
).bind(userId).all();
```

### Data Deletion

On account deletion:
```sql
-- CASCADE or explicit
DELETE FROM analytics_events WHERE user_id = ?;
```

### Privacy Verdict: ✓ COMPLIANT

All events pass privacy check with enforcement rules in place.

---

## Summary

| Task | Status | Key Finding |
|------|--------|-------------|
| V1: Encryption Audit | ✓ COMPLETE | Code exists but unused. Analytics unblocked. |
| V2: Schema Review | ✓ APPROVED | Schema is privacy-safe |
| V3: Instrumentation | ✓ MAPPED | All code locations identified |
| V4: API Contract | ✓ FINALIZED | TypeScript interfaces ready |
| V5: Dashboard | ✓ WIREFRAMED | 5 pages designed |
| V6: Privacy Check | ✓ COMPLIANT | All events pass with enforcement |

---

## Cleared for Scaffolding

All validation tasks complete. Ready to implement:

- [ ] Migration `0012_add_analytics.sql`
- [ ] `/api/analytics/track` endpoint
- [ ] `src/lib/analytics/` module
- [ ] Admin route structure

---

## Appendix: IMP Ticket for Encryption

**IMP-048: PII Encryption Not Implemented**

**Priority**: HIGH (separate from analytics work)

**Finding**: Encryption code exists in `src/lib/auth/encryption.ts` but is never called. All PII stored in plaintext.

**Fields needing encryption**:
- `emails.email`
- `user_profile.display_name`
- `user_budget.*` (all fields)
- `user_contacts.*` (all fields)
- Module 1.4 responses in `user_responses`

**Recommendation**: Separate workstream to implement encryption integration.
