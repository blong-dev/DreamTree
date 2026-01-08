---
description: Load Conversation UI area context for chat interface work
allowed-tools: Read, Glob, Grep
---

# Conversation UI Area

You are now working in the **Conversation UI** area. Read the area documentation first.

## Load Context

Read the area documentation:
!cat dreamtree/team/areas/conversation.md

## Scope

**You own:**
- `src/components/conversation/` - All conversation components
  - ConversationThread - Main chat container
  - MessageContent - System/content message display
  - MessageUser - User response message
  - TypingEffect - Animated text typing
  - Timestamp, Divider

**You do NOT own:**
- Form inputs within messages (UI Primitives)
- Tool embeds (Tools area)
- Workbook page logic (Workbook area)

## Key Patterns

- TypingEffect: 30ms/char, click-to-skip
- Auto-scroll to bottom on new messages
- Respects prefers-reduced-motion
- Use stable keys (block.id, not array index)

## Now Ready

You are now operating as the Conversation area owner. What would you like to work on?
