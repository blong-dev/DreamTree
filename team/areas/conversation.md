# Conversation UI

This area owns the chat-like conversation interface used throughout the workbook.

---

## Soul

**The interface recedes; the conversation advances. Every element supports the feeling of thoughtful dialogue.**

The conversation UI is not a feature of DreamTree — it IS DreamTree. The defining metaphor is "texting through a guided workbook." Users should feel like they're having a one-on-one conversation with a thoughtful coach, not filling out a form or completing a questionnaire.

### Why Conversation?

1. **Intimacy** — Chat interfaces feel personal. A form feels like paperwork; a conversation feels like being heard.
2. **Pacing** — One message at a time creates space for reflection. Users process each thought before moving on.
3. **Familiarity** — Everyone knows how to text. There's no learning curve.
4. **Flow** — Responses build on each other. The conversation creates a narrative arc.

### The Emotional Intent

| Element | Technical Implementation | Emotional Purpose |
|---------|--------------------------|-------------------|
| **Typing effect** | 30ms/char with blinking cursor | Creates feeling that DreamTree is "thinking" about you |
| **Left-aligned content** | No bubble, subtle background | DreamTree's words feel like ground truth, not opinions |
| **Right-aligned responses** | Bubble with user styling | Your words are distinct, elevated, valued |
| **Auto-scroll to bottom** | New content appears at bottom | Like any chat app — familiar and natural |
| **Click-to-skip** | Immediately shows full text | Respects impatience without punishing patience |

### What a Soul Violation Looks Like

- **Multiple inputs visible at once** — Forms feel like work; conversations feel like dialogue
- **Prompts appearing twice** — Once in message thread, again in input area
- **No typing effect** — Static text feels like reading a document, not a conversation
- **Content appearing in middle of screen** — New messages should appear at bottom
- **No scroll history** — Users should be able to look back at what was said
- **Jarring transitions** — Each block should flow naturally from the previous

### The Core Rule

**One thing at a time.** Show one block. Let user respond or click Continue. Then show next block. Never reveal multiple prompts, never show the whole exercise at once, never rush the user through.

---

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
| `src/components/conversation/ConversationThread.tsx` | Scrollable message container with auto-scroll |
| `src/components/conversation/MessageContent.tsx` | Renders content blocks with typing effect |
| `src/components/conversation/MessageUser.tsx` | User response display (right-aligned bubble) |
| `src/components/conversation/TypingEffect.tsx` | Character-by-character animation with skip |
| `src/components/conversation/types.ts` | Message and thread types |

---

## Principles

### 1. Messages Flow Like Chat
- DreamTree content: left-aligned, no bubble, appears first
- User responses: right-aligned, subtle bubble, follows content
- New content appears at BOTTOM, history scrolls UP
- Smooth auto-scroll keeps focus on newest content

### 2. Typing Creates Presence
The typing effect (30ms/char) makes DreamTree feel alive:
- Blinking cursor at 530ms intervals
- User can click to skip if impatient
- Respects `prefers-reduced-motion` (shows instantly)
- `onComplete` callback enables next interaction

### 3. One Block at a Time
Content is revealed progressively:
- Show one content block → wait for Continue
- Show one prompt → wait for response
- Show one tool → wait for completion
- Never reveal the whole exercise structure

### 4. History is Accessible
Users can scroll back through their conversation:
- Past responses remain visible
- Users can click past responses to edit them
- Scroll position preserved when looking at history
- "Return to current" button when scrolled up

---

## Patterns & Conventions

### Thread Structure
```tsx
<ConversationThread messages={messages} autoScrollOnNew={true}>
  {/* Messages render inside */}
</ConversationThread>
```

### Message Types
```typescript
type MessageType = 'content' | 'user' | 'divider';

interface Message {
  id: string;
  type: MessageType;
  data: ContentBlock[] | UserResponseContent;
  timestamp: Date;
}
```

### Typing Effect Usage
```tsx
<TypingEffect
  text="What brings you to DreamTree today?"
  speed={30}  // ms per character
  onComplete={() => setCanProceed(true)}
/>
```

Click-to-skip: When user clicks during typing, `onComplete` fires immediately and remaining text appears instantly.

### Auto-Scroll Behavior
- Scrolls to bottom on new message
- Pauses auto-scroll when user scrolls up into history
- Shows "Return to current" indicator when scrolled away
- Smooth animation, respects reduced motion

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
4. Handle reduced motion preference

### Making User Messages Editable
1. Add `onClick` handler to MessageUser
2. Track editing state in parent
3. Re-show input with pre-filled value
4. Update response on re-submit

### Styling Messages
- Content messages: `.message-content` - left-aligned, no bubble
- User messages: `.message-user` - right-aligned, subtle bubble
- All styling via CSS custom properties in globals.css

---

## Testing

### Display Testing
- Messages render in correct order (oldest at top)
- New messages appear at bottom
- Long messages wrap properly
- Scroll works with many messages

### Typing Effect Testing
- Animation plays at ~30ms per character
- `onComplete` fires after animation finishes
- Click anywhere skips animation
- Reduced motion shows text immediately

### Scroll Testing
- Auto-scrolls to bottom on new message
- Manual scroll up pauses auto-scroll
- "Return to current" appears when scrolled
- Scroll position stable during history review

### Accessibility Testing
- Messages have proper ARIA roles (`role="log"`)
- New messages announced to screen readers (`aria-live`)
- Focus management after interactions
- Keyboard navigation works

---

## Gotchas

### Typing Effect Performance
- Long text may cause performance issues
- Consider chunking very long content (>500 chars)
- Speed is milliseconds per character (30ms default = ~33 chars/sec)

### Scroll State Management
- Track whether user has scrolled into history
- Don't auto-scroll when user is reviewing past content
- Re-enable auto-scroll when user returns to bottom

### Reduced Motion
- Check `prefers-reduced-motion` media query
- Skip all animations when enabled
- Show content immediately (no delay)
- Still fire `onComplete` callbacks

### Message Keys
- Use stable keys (block.id, not array index)
- Changing keys causes TypingEffect to restart
- Keys must be unique within thread

### Content Block Types
- `heading` - Title text with larger size
- `paragraph` - Standard body text
- `instruction` - Action prompt (may have emphasis)
- `quote` - Quoted/attributed content
- `emphasis` - Highlighted text
- `activity-header` - Section header for tools

---

## Dependencies

**Depends on:**
- Design System (typography, spacing, colors)
- UI Primitives (icons for actions)

**Depended by:**
- Workbook (primary interface)
- Features (onboarding should use conversation UI too)

---

## Interface Contracts

### ConversationThread Props
```typescript
interface ConversationThreadProps {
  messages: Message[];
  autoScrollOnNew?: boolean;  // default true
  className?: string;
}
```

### MessageContent Props
```typescript
interface MessageContentProps {
  content: ContentBlock[];
  onTypingComplete?: () => void;
  skipTyping?: boolean;
}
```

### MessageUser Props
```typescript
interface MessageUserProps {
  response: UserResponseContent;
  onEdit?: () => void;  // Click to edit past response
  timestamp?: Date;
}
```

### TypingEffect Props
```typescript
interface TypingEffectProps {
  text: string;
  speed?: number;      // ms per character, default 30
  onComplete?: () => void;
  skipAnimation?: boolean;  // from prefers-reduced-motion
}
```

---

## Spec Reference
- Conversation UI: `/planning/DreamTree_Component_Spec.md` (Conversation section)
- Typography: `/planning/DreamTree_Design_System.md`
- Typing behavior: `/CLAUDE.md` (Decision Log - typing effect: 30ms/char, click-to-skip)
