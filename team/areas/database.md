# Database & Data Layer

This area owns all database schema, queries, data types, and the connections system that links user data across exercises.

---

## Soul

**Data flows through the tree. Past insights surface at the right moment. Nothing is forgotten.**

The database isn't just storage — it's the memory that makes DreamTree feel like a coach who actually listened to you. The connections system creates "Magic Moments" where past inputs resurface meaningfully.

### Why This Matters

1. **Recognition** — When Exercise 2.1 says "Remember when you described feeling energized by [X]?", users feel genuinely heard.
2. **Coherence** — Your values from Part 1 inform your non-negotiables in Part 2. The journey builds on itself.
3. **Efficiency** — SOARED stories become resume bullet points. Users don't re-enter data.
4. **Trust** — Users see their data working for them, not being extracted from them.

### The Magic Moments (Connections)

34+ connection points weave user data across exercises:

| Connection Example | The Magic |
|--------------------|-----------|
| Skills from 1.3 → 2.1 | "Your superpowers feed into job filtering" |
| Values from 1.4 → 2.2 | "What you love should inform your non-negotiables" |
| SOARED stories → 3.2 | "Your stories become resume content" |
| Flow logs → 2.3 | "Patterns in your energy inform career choices" |
| Competencies → 3.1 | "Your assessed strengths guide networking" |

### What a Soul Violation Looks Like

- **Data silos** — User enters skills in one exercise, has to re-enter them elsewhere
- **No memory** — Exercise doesn't acknowledge prior answers
- **Broken connections** — Tool shows empty when prior data exists
- **Unclear data flow** — User can't see how their inputs connect
- **Data extraction feel** — Asking for information without showing how it will be used

---

## Ownership

**Scope:**
- `src/lib/db/` - Database client and query functions
- `src/lib/connections/` - ConnectionResolver and data fetching
- `migrations/` - Schema definitions and seed data
- `src/types/database.ts` - TypeScript type definitions
- `scripts/` - Database utility scripts
- `seed/` - Seed data utilities

**Does NOT own:**
- API routes for workbook (owned by Workbook)
- Auth-specific queries like password verification (owned by Auth)

**Also owns:**
- `src/app/api/data/` - Data API routes
  - `skills/route.ts` - Fetch skills for SkillTagger
  - `competencies/route.ts` - Fetch competencies for CompetencyAssessment
  - `connection/route.ts` - Resolve connections for user data hydration
- `src/app/api/profile/` - Profile data routes
  - `route.ts` - Fetch user profile, settings, skills, values
  - `export/route.ts` - Export all user data for download
- `src/app/api/tools/` - Tool data routes
  - `counts/route.ts` - Entry counts per tool type
  - `instances/route.ts` - Tool instances for a specific tool type

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/db/index.ts` | Main database client with typed queries |
| `src/lib/connections/resolver.ts` | ConnectionResolver class for data hydration (262 lines) |
| `src/lib/connections/data-fetchers.ts` | 18 exported data fetcher functions (~450 lines) |
| `src/lib/connections/types.ts` | Connection method types and data structures |
| `migrations/0001_initial.sql` | 40-table schema definition |
| `migrations/seed_*.sql` | Content seed data (3,221+ rows) |
| `src/types/database.ts` | 53 TypeScript type definitions |

---

## Principles

### 1. Data Belongs to Users
All user data is:
- Exportable (JSON for restore, ZIP for human reading)
- Deletable (full account deletion with confirmation)
- Visible (Profile page shows what we store)
- Portable (no lock-in, standard formats)

### 2. Connections Create Magic
The `connections` table links data sources to tools:
- **from_exercise**: Where the data came from
- **to_exercise**: Where it's being used
- **connection_type**: How to fetch and transform the data
- **data_object**: What specific data to retrieve

### 3. Schema Reflects the Tree
Tables organized by the three-part journey:
- **Part 1 (Roots)**: Skills, values, flow logs, competencies
- **Part 2 (Trunk)**: Stories (SOARED), priorities, work preferences
- **Part 3 (Branches)**: Career options, networking contacts, resume content

---

## The Connections System

### How It Works

```
Exercise with connection_id → ConnectionResolver → User's past data → Tool pre-populated
```

1. **stem.connection_id** links an exercise to a connection
2. **connections table** defines what data to fetch and how
3. **ConnectionResolver** fetches and transforms the data
4. **Tool receives** pre-populated data from prior exercises

### Connection Types

| Type | Purpose | Example |
|------|---------|---------|
| `auto_populate` | Display user data in tool | Show prior skills in SkillTagger |
| `hydrate` | Pre-fill form fields | Pre-fill SOARED form with prior story |
| `reference_link` | Link to static reference | Link to skills database |
| `forward` | Pass data to next exercise | Skills → Job matching |

### Data Source Types

- `user_skills` - Tagged skills from SkillTagger
- `user_values` - Work and life values
- `soared_stories` - SOARED form responses
- `flow_entries` - Flow Tracker logs
- `competency_scores` - CompetencyAssessment results
- `career_options` - Career paths being explored
- Plus 10+ more source types

### Adding a New Connection

1. Add row to `connections` table with proper `from_exercise`, `to_exercise`
2. Set `connection_type` and `data_object` JSON
3. If new data source, add fetcher to `ConnectionResolver`
4. Set `stem.connection_id` on the target tool/exercise

---

## Patterns & Conventions

### Query Pattern
All queries use the `createDb()` factory pattern:

```typescript
import { createDb } from '@/lib/db';

const db = createDb(env.DB);
const user = await db.getUserById(userId);
```

### Type Safety
- All database types defined in `src/types/database.ts`
- Query return types match database types exactly
- SQLite integers map to TypeScript `number`
- Booleans stored as `0 | 1` integers

### Connection Resolution
The ConnectionResolver handles data flow between exercises:

```typescript
const resolver = new ConnectionResolver(env.DB);
const result = await resolver.resolve({
  userId,
  connectionId: 42,
});
// result.data contains the user's prior data
// result.method indicates how to use it
```

---

## Common Tasks

### Adding a New Table
1. Create migration file: `migrations/XXXX_description.sql`
2. Add types to `src/types/database.ts`
3. Add query methods to `src/lib/db/index.ts`
4. If user data, add to connections resolver if needed

### Adding a New Query
1. Add method to `createDb()` in `src/lib/db/index.ts`
2. Use proper return types from `@/types/database`
3. Use prepared statements with parameter binding

### Adding a Data Source
1. Add type to `DataSourceType` in `src/lib/connections/types.ts`
2. Add fetcher function to `src/lib/connections/data-fetchers.ts`
3. Export from data-fetchers.ts and import in resolver.ts
4. Add case to `fetchDataSource()` in resolver.ts calling your new fetcher
5. **Document what exercises use this source**

### Adding a Connection
1. Insert row in `connections` table
2. Set `from_exercise` (source) and `to_exercise` (target)
3. Configure `connection_type` and `data_object`
4. Link to stem via `stem.connection_id`
5. **Test that data flows correctly**

---

## Testing

### Verify Schema
```bash
# Check migrations apply cleanly
npx wrangler d1 migrations apply dreamtree-db --local
```

### Test Queries
- Use `npm run dev` and test via API routes
- Check for proper null handling
- Verify type coercion (SQLite → TypeScript)

### Test Connections
- Complete an exercise that creates data
- Navigate to a connected exercise
- Verify the prior data appears in the tool
- **This is critical for Magic Moments**

---

## Gotchas

### SQLite Specifics
- No `BOOLEAN` type - use `INTEGER` with 0/1
- `TEXT` for all strings including JSON
- `INTEGER PRIMARY KEY` auto-increments
- Date/time stored as ISO strings

### Null Handling
- Always use `|| null` for optional return values
- Check `result.results` array length, not truthiness
- Empty arrays from `.all()` are valid, not errors

### D1 Limitations
- No transactions in Cloudflare D1
- Prepared statements are required
- Max 100KB result size per query

### SQL Injection Prevention (CRITICAL)
- **All values** must use parameterized `.bind()` — never string interpolation
- **Column names** cannot be parameterized — must be hardcoded or whitelist-validated
- When dynamic column names are needed, validate against explicit whitelist array
- For user-provided identifiers, use strict regex like `/^[a-zA-Z0-9_]+$/`
- Pattern: `db.prepare('SELECT ? FROM table').bind(value)` for values
- Pattern: `if (validColumns.includes(col)) { query = \`SELECT ${col}\` }` for columns

### Connection Gotchas
- Connection IDs are numeric, exercise IDs are strings
- `from_exercise` format: `"1.2.3"` (Part.Module.Exercise)
- Some connections reference modules, not exercises
- **Resolve connections BEFORE rendering tools, not during**

### OpenNext Context
- Use `getCloudflareContext()` from `@opennextjs/cloudflare`
- Access D1 via `env.DB`
- Type augmentation in `src/types/database.ts`

---

## Dependencies

**Depends on:**
- None (foundation layer)

**Depended by:**
- Auth (user/session queries)
- Workbook (content and response queries)
- Tools (data hydration via connections)
- Features (progress and profile queries)

---

## Interface Contracts

### Database Client
```typescript
import { createDb, type Database } from '@/lib/db';
const db: Database = createDb(env.DB);
```

### Connection Resolver
```typescript
import { ConnectionResolver } from '@/lib/connections';
const resolver = new ConnectionResolver(env.DB);
const result = await resolver.resolve<DataType>({ userId, connectionId });
// result.data - the fetched user data
// result.method - how to apply it (auto_populate, hydrate, etc.)
// result.isEmpty - true if no data found
```

### Type Imports
```typescript
import type { User, Stem, Prompt, Tool } from '@/types/database';
```

---

## Spec Reference
- Schema: `/planning/DreamTree_Data_Architecture_v4.md`
- Connection logic: Same file, "Connections" section
- Content structure: `/planning/tables/` CSV files
