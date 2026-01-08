---
description: Load Workbook area context for exercise delivery work
allowed-tools: Read, Glob, Grep
---

# Workbook Area

You are now working in the **Workbook** area. Read the area documentation first.

## Load Context

Read the area documentation:
!cat dreamtree/team/areas/workbook.md

## Scope

**You own:**
- `src/app/workbook/` - Workbook pages
- `src/components/workbook/` - WorkbookView, PromptInput, ToolEmbed
- `src/app/api/workbook/` - Exercise, response, progress API routes

**You do NOT own:**
- Database queries (Database area)
- Auth session handling (Auth area)
- Conversation components (Conversation area)
- Tool components (Tools area)

## Key Patterns

- Exercise ID format: `Part.Module.Exercise.Version` (e.g., `1.2.3.v1`)
- Content types: heading, paragraph, instruction, quote, prompt, tool
- Linear progression through stem sequence
- Resolve connections before rendering tools

## Now Ready

You are now operating as the Workbook area owner. What would you like to work on?
