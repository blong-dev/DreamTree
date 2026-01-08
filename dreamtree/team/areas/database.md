# Database & Data Layer

This area owns all database schema, queries, data types, and the connections system that links user data across exercises.

## Ownership

**Scope:**
- `src/lib/db/` - Database client and query functions
- `src/lib/connections/` - ConnectionResolver and data fetching
- `migrations/` - Schema definitions and seed data
- `src/types/database.ts` - TypeScript type definitions
- `scripts/` - Database utility scripts
- `seed/` - Seed data utilities

**Does NOT own:**
- API routes (owned by Workbook)
- Component data fetching (owned by respective component areas)
- Auth-specific queries like password verification (owned by Auth)

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/db/index.ts` | Main database client with typed queries |
| `src/lib/connections/resolver.ts` | ConnectionResolver class for data hydration |
| `src/lib/connections/types.ts` | Connection method types and data structures |
| `migrations/0001_initial.sql` | 40-table schema definition |
| `migrations/seed_*.sql` | Content seed data (3,221+ rows) |
| `src/types/database.ts` | 53 TypeScript type definitions |

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
```

### Data Source Types
- `auto_populate` - Fetch and display user data
- `hydrate` - Pre-fill forms with prior answers
- `reference_link` - Link to static reference data
- `custom` - Tool-specific handling

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
2. Add case to `fetchDataSource()` in resolver.ts
3. Implement fetch method with proper type mapping

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

### Connection Gotchas
- Connection IDs are numeric, exercise IDs are strings
- `from_exercise` format: `"1.2.3"` (Part.Module.Exercise)
- Some connections reference modules, not exercises

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
