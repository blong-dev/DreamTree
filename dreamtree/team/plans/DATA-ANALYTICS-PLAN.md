# DreamTree Data & Analytics Plan

> **Status**: Draft
> **Author**: Buzz
> **Date**: 2026-01-09
> **Deliverable for**: PLAN-001

---

## Executive Summary

DreamTree needs visibility into user behavior to understand what's working and where users struggle. This plan proposes a **privacy-respecting, D1-native analytics system** that provides aggregate insights without compromising the Data Sovereignty pillar.

**Key principles:**
- Aggregate metrics, not individual surveillance
- D1-native (no external analytics services)
- Admin-only dashboard (not user-facing for MVP)
- Event-driven architecture for flexibility
- Respects encrypted PII boundaries

---

## Part 1: Current State Analysis

### What We Currently Track

| Data Type | Table | Granularity | Analytics Value |
|-----------|-------|-------------|-----------------|
| User accounts | `users` | Per user | Basic counts |
| Sessions | `sessions` | Per login | Session frequency |
| Responses | `user_responses` | Per prompt/tool | Completion tracking |
| Module status | `user_modules` | Per module | Progress markers |
| Checklists | `user_checklists` | Per item | Task completion |
| Rate limits | `rate_limits` | Per attempt | Security metrics |

### What We Can Calculate Today

```sql
-- Active users (last 7 days)
SELECT COUNT(DISTINCT user_id) FROM sessions
WHERE last_seen_at > datetime('now', '-7 days')

-- Exercise completion rate
SELECT exercise_id, COUNT(DISTINCT user_id) as completions
FROM user_responses GROUP BY exercise_id ORDER BY completions DESC

-- Tool usage
SELECT tool_id, COUNT(*) as uses FROM user_responses
WHERE tool_id IS NOT NULL GROUP BY tool_id
```

### Critical Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| No time tracking | Can't measure engagement depth | HIGH |
| No content engagement | Don't know if users read instructions | HIGH |
| No drop-off tracking | Can't identify problem areas | HIGH |
| No explicit progress status | Must infer from responses | MEDIUM |
| No device/browser data | Can't segment users | LOW |

---

## Part 2: Metrics Framework

### Tier 1: Operational Metrics (Track Always)

These are essential for understanding product health.

| Metric | Question It Answers | How to Calculate |
|--------|---------------------|------------------|
| **DAU/WAU/MAU** | How many users are active? | Distinct users with session activity |
| **Exercise Completion Rate** | What % finish each exercise? | Responses / Total who started |
| **Part Completion Funnel** | How many finish Parts 1, 2, 3? | Module completion counts |
| **Tool Adoption** | Which tools are most used? | Response count by tool_id |
| **Session Frequency** | How often do users return? | Sessions per user per week |
| **Error Rate** | Are there technical issues? | Error events / Total requests |

### Tier 2: Engagement Metrics (Track with Events)

These require event-level data.

| Metric | Question It Answers | Requires |
|--------|---------------------|----------|
| **Time to Complete** | How long does each exercise take? | Start/end timestamps |
| **Drop-off Points** | Where do users abandon? | Started but not completed tracking |
| **Revision Frequency** | Do users edit responses? | Response version tracking |
| **Return Rate** | Do users come back after completing? | Session patterns over time |
| **Tool Interaction Depth** | How thoroughly do users use tools? | Tool input events |

### Tier 3: Insight Metrics (Future)

These are nice-to-have for deeper analysis.

| Metric | Question It Answers | Requires |
|--------|---------------------|----------|
| **Cohort Analysis** | Do newer users behave differently? | Acquisition date grouping |
| **Content Effectiveness** | Which instructions lead to better responses? | A/B testing framework |
| **Sentiment Trends** | Are users frustrated or satisfied? | Optional feedback collection |

---

## Part 3: Data Collection Strategy

### Option Analysis

| Approach | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **D1 Event Log** | Simple, private, no deps | Query performance at scale | **YES - MVP** |
| **Cloudflare Analytics** | Built-in, zero effort | Limited customization | Supplement only |
| **External (Posthog/Mixpanel)** | Feature-rich | Privacy violation, cost | **NO** |
| **Analytics Events Table** | Structured, queryable | Schema design needed | **YES - MVP** |

### Recommended: D1-Native Event Logging

**Why D1-native:**
1. **Privacy**: Data stays in Cloudflare, user-controlled
2. **Simplicity**: No external integrations
3. **Cost**: Included in existing D1 usage
4. **Performance**: D1 handles millions of rows efficiently
5. **Alignment**: Respects Data Sovereignty pillar

---

## Part 4: Schema Design

### New Table: `analytics_events`

```sql
CREATE TABLE analytics_events (
    id TEXT PRIMARY KEY,
    user_id TEXT,                    -- NULL for anonymous/aggregate events
    session_id TEXT,
    event_type TEXT NOT NULL,        -- Enum of allowed event types
    target_type TEXT,                -- 'exercise', 'prompt', 'tool', 'page'
    target_id TEXT,                  -- The specific ID
    event_data TEXT,                 -- JSON for additional context
    created_at TEXT NOT NULL,

    -- Indexes for common queries
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_events_user ON analytics_events(user_id, created_at);
CREATE INDEX idx_events_type ON analytics_events(event_type, created_at);
CREATE INDEX idx_events_target ON analytics_events(target_type, target_id);
```

### Event Types (Controlled Vocabulary)

```typescript
type AnalyticsEventType =
  // Session events
  | 'session_start'
  | 'session_end'

  // Exercise events
  | 'exercise_start'
  | 'exercise_complete'
  | 'exercise_abandon'     // Started but left without completing

  // Content events
  | 'content_view'         // Content block became visible
  | 'prompt_view'          // Prompt shown to user
  | 'prompt_submit'        // User submitted response

  // Tool events
  | 'tool_open'            // Tool component rendered
  | 'tool_interact'        // User interacted with tool
  | 'tool_submit'          // User saved tool response

  // Navigation events
  | 'page_view'            // Route change
  | 'scroll_depth'         // How far user scrolled

  // Error events
  | 'error'                // Client or server error
```

### Event Data Examples

```json
// exercise_start
{
  "event_type": "exercise_start",
  "target_type": "exercise",
  "target_id": "1.2.3",
  "event_data": null
}

// exercise_complete
{
  "event_type": "exercise_complete",
  "target_type": "exercise",
  "target_id": "1.2.3",
  "event_data": "{\"duration_ms\": 325000, \"prompts_answered\": 3}"
}

// tool_submit
{
  "event_type": "tool_submit",
  "target_type": "tool",
  "target_id": "100000",  // ListBuilder
  "event_data": "{\"items_count\": 7}"
}

// error
{
  "event_type": "error",
  "target_type": "api",
  "target_id": "/api/workbook/response",
  "event_data": "{\"status\": 500, \"message\": \"Database timeout\"}"
}
```

### New Table: `analytics_aggregates` (Materialized Views)

For expensive queries, pre-compute daily aggregates:

```sql
CREATE TABLE analytics_aggregates (
    id TEXT PRIMARY KEY,
    metric_name TEXT NOT NULL,       -- 'daily_active_users', 'exercise_completions', etc.
    dimension TEXT,                  -- 'exercise_id', 'tool_id', 'part', NULL for total
    dimension_value TEXT,            -- '1.2.3', '100000', '1', NULL
    metric_value REAL NOT NULL,      -- The computed value
    period_start TEXT NOT NULL,      -- Start of aggregation period
    period_end TEXT NOT NULL,        -- End of aggregation period
    computed_at TEXT NOT NULL        -- When aggregate was computed
);

CREATE INDEX idx_aggregates_metric ON analytics_aggregates(metric_name, period_start);
CREATE INDEX idx_aggregates_dimension ON analytics_aggregates(dimension, dimension_value);
```

---

## Part 5: Collection Implementation

### Client-Side Collection

Add a lightweight analytics module to the frontend:

```typescript
// src/lib/analytics/track.ts

interface TrackEvent {
  type: AnalyticsEventType;
  targetType?: 'exercise' | 'prompt' | 'tool' | 'page';
  targetId?: string;
  data?: Record<string, unknown>;
}

export async function track(event: TrackEvent): Promise<void> {
  // Don't track in development
  if (process.env.NODE_ENV === 'development') return;

  // Fire and forget - don't block UI
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  }).catch(() => {
    // Silently fail - analytics should never break the app
  });
}

// Usage in components:
// track({ type: 'exercise_start', targetType: 'exercise', targetId: '1.2.3' });
```

### Server-Side Collection

For server-side events (API errors, response saves):

```typescript
// src/lib/analytics/server.ts

export async function trackServerEvent(
  db: D1Database,
  event: Omit<TrackEvent, 'sessionId'> & { userId?: string; sessionId?: string }
): Promise<void> {
  const id = nanoid();
  const now = new Date().toISOString();

  await db.prepare(`
    INSERT INTO analytics_events (id, user_id, session_id, event_type, target_type, target_id, event_data, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    event.userId || null,
    event.sessionId || null,
    event.type,
    event.targetType || null,
    event.targetId || null,
    event.data ? JSON.stringify(event.data) : null,
    now
  ).run();
}
```

### API Endpoint

```typescript
// src/app/api/analytics/track/route.ts

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, targetType, targetId, data } = body;

  // Validate event type against allowed list
  if (!ALLOWED_EVENT_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
  }

  // Get session context (optional - track even if not logged in)
  const sessionId = getSessionIdFromCookie(request.headers.get('cookie'));
  let userId = null;

  if (sessionId) {
    const session = await getSessionData(db, sessionId);
    userId = session?.user.id;
  }

  await trackServerEvent(db, { type, targetType, targetId, data, userId, sessionId });

  return NextResponse.json({ success: true });
}
```

---

## Part 6: Privacy Compliance

### Data Sovereignty Alignment

| Principle | How We Comply |
|-----------|---------------|
| **User owns their data** | Events linked by user_id can be exported/deleted |
| **No PII in analytics** | Never store response content, only metadata |
| **Aggregate by default** | Dashboard shows totals, not individuals |
| **Transparency** | Privacy policy discloses operational metrics |
| **Minimal collection** | Only collect what's actionable |

### What We DON'T Track

- Response content (what users write)
- Personal identifiers (name, email in events)
- Detailed session replay
- Third-party cookies
- Cross-site tracking
- IP addresses (beyond Cloudflare's basic logging)

### Data Retention

```sql
-- Purge raw events older than 90 days (keep aggregates forever)
DELETE FROM analytics_events WHERE created_at < datetime('now', '-90 days');

-- Run weekly via Cloudflare scheduled worker
```

### User Data Export

Include analytics events in the existing data export:

```typescript
// Add to /api/profile/export
const events = await db.prepare(
  'SELECT * FROM analytics_events WHERE user_id = ?'
).bind(userId).all();

export.analytics_events = events.results;
```

### User Data Deletion

On account deletion, remove analytics events:

```sql
-- CASCADE should handle this if FK is set, otherwise:
DELETE FROM analytics_events WHERE user_id = ?;
```

---

## Part 7: Admin Dashboard

### MVP Dashboard Sections

#### 1. Overview (Home)

| Metric | Visualization |
|--------|---------------|
| Total Users | Big number |
| DAU / WAU / MAU | Line chart over time |
| Active Sessions | Real-time counter |
| Workbook Completion Rate | Progress bar |

#### 2. Funnel Analysis

```
Part 1 Start ─────▶ Part 1 Complete ─────▶ Part 2 Start ─────▶ Part 2 Complete
    100%                   75%                  60%                   40%
```

#### 3. Exercise Heatmap

| Exercise | Started | Completed | Drop-off Rate |
|----------|---------|-----------|---------------|
| 1.1.1    | 500     | 450       | 10%           |
| 1.1.2    | 450     | 380       | 16%           |
| 1.2.1    | 380     | 200       | **47%** ⚠️    |

#### 4. Tool Usage

| Tool | Uses | Avg Items | Avg Duration |
|------|------|-----------|--------------|
| ListBuilder | 1,234 | 8.3 | 4m 30s |
| FlowTracker | 890 | 5.1 | 2m 15s |
| SOAREDForm | 567 | N/A | 12m 45s |

#### 5. Error Log

| Timestamp | Type | Endpoint | Message | Count |
|-----------|------|----------|---------|-------|
| Today | 500 | /api/workbook/response | DB timeout | 3 |

### Tech Stack for Dashboard

**Option A: Server Components + CSS (Recommended)**
- Use existing design system
- No new dependencies
- Fast, lightweight

**Option B: Chart Library**
- `recharts` or `chart.js` for visualizations
- Adds ~50KB to bundle
- Better for complex charts

**Recommendation**: Start with Option A. Add chart library only if needed.

### Access Control

```typescript
// src/middleware.ts - add admin check
if (pathname.startsWith('/admin')) {
  const session = await getSessionData(db, sessionId);
  if (!session?.user.is_admin) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

Add `is_admin` column to `users` table (migration required).

---

## Part 8: Implementation Roadmap

### Phase 1: Foundation (Week 1)

**Goal**: Get event collection working

- [ ] Create migration for `analytics_events` table
- [ ] Create `/api/analytics/track` endpoint
- [ ] Add `track()` utility to frontend
- [ ] Instrument: `session_start`, `session_end`, `page_view`
- [ ] Verify events are being captured

**Files to create:**
- `migrations/0012_add_analytics.sql`
- `src/app/api/analytics/track/route.ts`
- `src/lib/analytics/track.ts`
- `src/lib/analytics/server.ts`

### Phase 2: Core Metrics (Week 2)

**Goal**: Track exercise and tool engagement

- [ ] Instrument: `exercise_start`, `exercise_complete`
- [ ] Instrument: `tool_open`, `tool_submit`
- [ ] Instrument: `prompt_submit`
- [ ] Add duration tracking (time between start/complete)
- [ ] Create basic query functions

**Files to modify:**
- `src/components/workbook/WorkbookView.tsx` (exercise events)
- `src/components/workbook/ToolEmbed.tsx` (tool events)
- `src/components/workbook/PromptInput.tsx` (prompt events)

### Phase 3: Admin Dashboard (Week 3)

**Goal**: Visualize the data

- [ ] Add `is_admin` column to users
- [ ] Create `/admin` route with protection
- [ ] Build Overview page
- [ ] Build Funnel page
- [ ] Build Exercise Heatmap page

**Files to create:**
- `migrations/0013_add_admin_flag.sql`
- `src/app/admin/page.tsx`
- `src/app/admin/funnel/page.tsx`
- `src/app/admin/exercises/page.tsx`
- `src/components/admin/` (dashboard components)

### Phase 4: Aggregation & Retention (Week 4)

**Goal**: Performance optimization

- [ ] Create `analytics_aggregates` table
- [ ] Build daily aggregation job (Cloudflare Cron)
- [ ] Implement 90-day retention for raw events
- [ ] Add data export for analytics events
- [ ] Performance testing with synthetic load

### Phase 5: Polish & Iterate (Ongoing)

- [ ] Add error tracking integration
- [ ] Build tool usage dashboard
- [ ] Add cohort analysis
- [ ] User feedback collection (optional)
- [ ] A/B testing framework (optional)

---

## Part 9: Cost Analysis

### D1 Usage Estimates

| Component | Reads/Day | Writes/Day | Cost Impact |
|-----------|-----------|------------|-------------|
| Event tracking | ~10K | ~5K | Minimal |
| Dashboard queries | ~500 | 0 | Minimal |
| Aggregation jobs | ~1K | ~100 | Minimal |

**D1 Free Tier**: 5M reads/day, 100K writes/day
**Estimated Usage**: <1% of free tier

### No Additional Costs

- No external analytics service fees
- No additional Cloudflare workers needed
- Cron triggers included in Workers plan

---

## Part 10: Success Criteria

### MVP Success (Phase 1-3)

- [ ] Can answer: "How many users are active today?"
- [ ] Can answer: "Which exercise has the highest drop-off?"
- [ ] Can answer: "Which tool is most used?"
- [ ] Dashboard loads in <2 seconds
- [ ] No impact on user-facing performance

### Full Success (Phase 4-5)

- [ ] Can answer: "Where do users spend the most time?"
- [ ] Can answer: "Do users who complete Part 1 return for Part 2?"
- [ ] Can answer: "What's the error rate for each API endpoint?"
- [ ] Aggregates computed automatically
- [ ] Raw data purged after 90 days

---

## Appendix A: Sample Queries

### Daily Active Users

```sql
SELECT DATE(created_at) as day, COUNT(DISTINCT user_id) as dau
FROM analytics_events
WHERE event_type = 'session_start'
  AND created_at > datetime('now', '-30 days')
GROUP BY DATE(created_at)
ORDER BY day DESC
```

### Exercise Completion Funnel

```sql
WITH exercise_starts AS (
  SELECT target_id, COUNT(DISTINCT user_id) as started
  FROM analytics_events
  WHERE event_type = 'exercise_start'
  GROUP BY target_id
),
exercise_completes AS (
  SELECT target_id, COUNT(DISTINCT user_id) as completed
  FROM analytics_events
  WHERE event_type = 'exercise_complete'
  GROUP BY target_id
)
SELECT
  s.target_id as exercise_id,
  s.started,
  COALESCE(c.completed, 0) as completed,
  ROUND(100.0 * COALESCE(c.completed, 0) / s.started, 1) as completion_rate
FROM exercise_starts s
LEFT JOIN exercise_completes c ON s.target_id = c.target_id
ORDER BY s.target_id
```

### Tool Usage Stats

```sql
SELECT
  target_id as tool_id,
  COUNT(*) as total_uses,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(json_extract(event_data, '$.items_count')) as avg_items
FROM analytics_events
WHERE event_type = 'tool_submit'
  AND created_at > datetime('now', '-7 days')
GROUP BY target_id
ORDER BY total_uses DESC
```

### Drop-off Detection

```sql
-- Exercises where users start but don't complete
SELECT
  s.target_id as exercise_id,
  COUNT(DISTINCT s.user_id) as started,
  COUNT(DISTINCT c.user_id) as completed,
  COUNT(DISTINCT s.user_id) - COUNT(DISTINCT c.user_id) as dropped_off
FROM analytics_events s
LEFT JOIN analytics_events c
  ON s.user_id = c.user_id
  AND s.target_id = c.target_id
  AND c.event_type = 'exercise_complete'
WHERE s.event_type = 'exercise_start'
GROUP BY s.target_id
HAVING dropped_off > 0
ORDER BY dropped_off DESC
```

---

## Appendix B: Privacy Policy Update

Add to privacy policy:

> **Operational Analytics**
>
> DreamTree collects anonymized usage data to improve the product experience. This includes:
> - Which exercises and tools you interact with (not what you write)
> - How long you spend on different sections
> - General navigation patterns
>
> This data is:
> - Never sold to third parties
> - Stored securely on Cloudflare infrastructure
> - Automatically deleted after 90 days
> - Included in your data export upon request
> - Deleted when you delete your account
>
> We do NOT track:
> - Your response content
> - Personal identifying information
> - Your activity outside DreamTree

---

## Summary

This plan provides a privacy-respecting, D1-native analytics system that:

1. **Answers key questions** about user engagement and drop-off
2. **Respects Data Sovereignty** by avoiding PII and external services
3. **Costs nothing extra** using existing Cloudflare infrastructure
4. **Scales incrementally** from basic metrics to advanced analysis
5. **Protects user trust** through transparency and data retention limits

**Recommended next step**: Review with Braedon, then begin Phase 1 implementation.
