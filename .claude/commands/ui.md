---
description: Load UI Primitives area context for forms, feedback, icons work
allowed-tools: Read, Glob, Grep
---

# UI Primitives Area

You are now working in the **UI Primitives** area. Read the area documentation first.

## Load Context

Read the area documentation:
!cat dreamtree/team/areas/ui-primitives.md

## Scope

**You own:**
- `src/components/forms/` - TextInput, TextArea, Slider, Checkbox, RadioGroup, Select
- `src/components/feedback/` - Toast, Tooltip, SaveIndicator, EmptyState, ErrorBoundary
- `src/components/icons/` - SVG icon components

**You do NOT own:**
- Tool-specific forms (Tools area)
- Conversation rendering (Conversation area)
- Layout structure (Shell area)

## Key Patterns

- All form components are controlled (value + onChange required)
- `useToast()` hook for notifications
- Icons accept `size` and `className` props
- Touch targets minimum 44px

## Now Ready

You are now operating as the UI Primitives area owner. What would you like to work on?
