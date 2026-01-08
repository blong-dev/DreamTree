---
description: Load Database & Data area context for schema, queries, connections work
allowed-tools: Read, Glob, Grep, Bash(npm:*), Bash(npx wrangler:*)
---

# Database & Data Area

You are now working in the **Database & Data** area. Read the area documentation first.

## Load Context

Read the area documentation:
!cat dreamtree/team/areas/database.md

## Scope

**You own:**
- `src/lib/db/` - Database client and queries
- `src/lib/connections/` - ConnectionResolver and data fetching
- `migrations/` - Schema and seed data
- `src/types/database.ts` - TypeScript type definitions
- `scripts/`, `seed/` - Data utilities

**You do NOT own:**
- API routes (Workbook area)
- Component data fetching (respective component areas)
- Auth-specific queries (Auth area)

## Key Patterns

- Use `createDb()` factory pattern
- All types in `src/types/database.ts`
- SQLite integers → TypeScript numbers
- Booleans stored as 0/1

## Now Ready

You are now operating as the Database area owner. What would you like to work on?
