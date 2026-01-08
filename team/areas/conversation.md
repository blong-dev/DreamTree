# Conversation UI

This area owns the chat-like conversation interface used throughout the workbook.

## Ownership

**Scope:**
- `src/components/conversation/` - All conversation components
  - `ConversationThread.tsx` - Main chat container
  - `MessageContent.tsx` - System/content message display
  - `MessageUser.tsx` - User response message
  - `TypingEffect.tsx` - Animated text typing
  - `Timestamp.tsx` - Message timestamp
  - `Divider.tsx` - Visual separator
  - `types.ts` - Conversation type definitions

**Does NOT own:**
- Form inputs within messages (owned by UI Primitives)
- Tool embeds (owned by Tools)
- Workbook page logic (owned by Workbook)

---

## Key Files

| File | Purpose |
|------|---------|
| `src/components/conversation/ConversationThread.tsx` | Scrollable message container |
| `src/components/conversation/MessageContent.tsx` | Renders content blocks |
| `src/components/conversation/MessageUser.tsx` | User response display |
| `src/components/conversation/TypingEffect.tsx` | Character-by-character animation |
| `src/components/conversation/types.ts` | Message and thread types |

---

## Patterns & Conventions

### Thread Structure
```tsx
<ConversationThread>
  <MessageContent content={block} />
  <MessageContent content={block} onTypingComplete={handleNext} />
  <MessageUser response={userResponse} />
  <Divider />
</ConversationThread>
```

### Message Types
- **Content messages**: System text, instructions, prompts
- **User messages**: Responses, submitted answers
- **Dividers**: Visual separation between sections

### Typing Effect
```tsx
<TypingEffect
  text="Hello, welcome to DreamTree..."
  speed={30}  // ms per character
  onComplete={() => setCanProceed(true)}
/>
```

### Auto-Scroll
- Thread auto-scrolls to bottom on new messages
- Smooth scroll animation
- Respects prefers-reduced-motion

---

## Common Tasks

### Rendering Content Blocks
Content blocks from the database are rendered as messages:
```tsx
{contentBlocks.map(block => (
  <MessageContent key={block.id} content={block} />
))}
```

### Adding Typing Animation
1. Pass `onTypingComplete` callback
2. Disable user input until typing completes
3. Show "skip" button for impatient users

### Styling Messages
- Content messages: Left-aligned, system styling
- User messages: Right-aligned, user styling
- Use CSS classes from globals.css

---

## Testing

### Display Testing
- Messages render in correct order
- Long messages wrap properly
- Scroll works with many messages

### Typing Effect Testing
- Animation plays at correct speed
- `onComplete` fires after animation
- Click-to-skip works
- Reduced motion skips animation

### Accessibility Testing
- Messages have proper ARIA roles
- New messages announced to screen readers
- Focus management after interactions

---

## Gotchas

### Typing Effect Performance
- Long text may cause performance issues
- Consider chunking very long content
- Speed is milliseconds per character (30ms default)

### Scroll Behavior
- New messages trigger scroll
- User scrolling up should pause auto-scroll
- Scroll position preserved on re-render

### Reduced Motion
- Check `prefers-reduced-motion` media query
- Skip animations when enabled
- Still show content immediately

### Message Keys
- Use stable keys (block.id, not array index)
- Keys prevent re-rendering during updates
- Typing effect resets if key changes

### Content Block Types
- `heading` - Title text
- `paragraph` - Body text
- `instruction` - Action prompt
- `quote` - Quoted content

---

## Dependencies

**Depends on:**
- Design System (typography, spacing, colors)
- UI Primitives (icons for actions)

**Depended by:**
- Workbook (primary interface)
- Features (may use for guided experiences)

---

## Interface Contracts

### ConversationThread Props
```typescript
interface ConversationThreadProps {
  children: React.ReactNode;
  className?: string;
}
```

### MessageContent Props
```typescript
interface MessageContentProps {
  content: ContentBlock;
  onTypingComplete?: () => void;
  skipTyping?: boolean;
}
```

### MessageUser Props
```typescript
interface MessageUserProps {
  response: {
    content: string;
    timestamp?: string;
  };
}
```

### TypingEffect Props
```typescript
interface TypingEffectProps {
  text: string;
  speed?: number;  // ms per character, default 30
  onComplete?: () => void;
}
```

---

## Spec Reference
- Conversation UI: `/planning/DreamTree_Component_Spec.md` (Conversation section)
- Typography: `/planning/DreamTree_Design_System.md`
- Typing behavior: `/CLAUDE.md` (Decision Log - typing effect)
