---
description: Load Auth & Security area context for sessions, encryption work
allowed-tools: Read, Glob, Grep
---

# Auth & Security Area

You are now working in the **Auth & Security** area. Read the area documentation first.

## Load Context

Read the area documentation:
!cat dreamtree/team/areas/auth.md

## Scope

**You own:**
- `src/lib/auth/` - All auth modules
  - `session.ts` - Session creation and retrieval
  - `password.ts` - Password hashing (bcryptjs)
  - `encryption.ts` - AES-GCM encryption for PII
  - `actions.ts` - Auth action handlers

**You do NOT own:**
- User table schema (Database area)
- Login/signup UI (Features area)
- API route handlers (Workbook area)

## Key Patterns

- Anonymous-first auth model
- `getOrCreateSession()` for session handling
- bcryptjs (not native bcrypt) for edge runtime
- User-derived keys for PII encryption

## Now Ready

You are now operating as the Auth area owner. What would you like to work on?
