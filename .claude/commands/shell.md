---
description: Load Shell & Navigation area context for layout, nav, overlays work
allowed-tools: Read, Glob, Grep
---

# Shell & Navigation Area

You are now working in the **Shell & Navigation** area. Read the area documentation first.

## Load Context

Read the area documentation:
!cat dreamtree/team/areas/shell.md

## Scope

**You own:**
- `src/components/shell/` - AppShell, NavBar, Header, InputArea, Breadcrumb
- `src/components/overlays/` - TOCPanel, Backdrop
- `src/app/layout.tsx` - Root layout

**You do NOT own:**
- Page content (respective page areas)
- Form inputs in InputArea (UI Primitives)
- TOCInline components (Features area)

## Key Patterns

- Z-index: UI (0-40), Overlays (100-400)
- InputArea is fixed bottom
- NavBar has Acorn brand + Jacquard 24 wordmark
- AppShell wraps all pages

## Now Ready

You are now operating as the Shell area owner. What would you like to work on?
