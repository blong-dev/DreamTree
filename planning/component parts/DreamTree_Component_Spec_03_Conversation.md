# DreamTree Component Specification
## Section 3: Conversation Components

> Message display, typing effects, timestamps, and thread management components.

---

## 3.1 `MessageContent`

DreamTree content blocks displayed in the conversation.

### Purpose
Renders workbook content — paragraphs, headings, lists, activities. Left-aligned, no bubble, supports typing animation.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `ContentBlock[]` | required | Content blocks to render |
| `animate` | `boolean` | `true` | Enable typing animation |
| `onAnimationComplete` | `() => void` | — | Callback when animation finishes |
| `id` | `string` | auto-generated | Message identifier |

### Types

```typescript
type ContentBlock = 
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3 | 4; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'activity-header'; title: string; description?: string }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'emphasis'; text: string }
  | { type: 'resource-link'; title: string; url: string; description?: string };
```

### Rendered Structure

```html
<div 
  class="message-content" 
  id={id}
  role="article"
  aria-label="DreamTree message"
>
  {content.map((block, index) => (
    <ContentBlockRenderer
      key={index}
      block={block}
      animate={animate}
      animationDelay={calculateDelay(index)}
    />
  ))}
</div>

<!-- Screen reader accessible version (immediate) -->
<div class="sr-only" aria-live="polite">
  {content.map(block => getPlainText(block)).join(' ')}
</div>
```

### Content Block Rendering

| Block Type | Element | Styling |
|------------|---------|---------|
| `paragraph` | `<p>` | `text-base`, `margin-top: space-4` |
| `heading` | `<h2/3/4>` | Level-appropriate size, `font-semibold` |
| `list` | `<ul>` or `<ol>` | `margin-top: space-3`, `padding-left: space-4` |
| `activity-header` | `<div>` | Border-left accent, `--color-primary`, `padding-left: space-3` |
| `quote` | `<blockquote>` | Italic, `--color-muted`, left border |
| `emphasis` | `<p>` | `font-medium`, slightly larger |
| `resource-link` | `<a>` | Card-style, icon + title + description |

### Typing Animation

| Property | Value |
|----------|-------|
| Speed | ~30ms per character |
| Cursor | Blinking pipe, 530ms interval |
| Between blocks | 200ms pause |
| Skip behavior | Click skips current block, shows full text |
| Reduced motion | Instant display, no animation |

### Styling

| Property | Value |
|----------|-------|
| Alignment | Left |
| Max-width | 65ch |
| Paragraph spacing | `space-4` between blocks |
| First block | No top margin |

### Accessibility

- Full text immediately available to screen readers via `aria-live="polite"`
- Animation is purely visual enhancement
- Respects `prefers-reduced-motion`

---

## 3.2 `MessageUser`

User response bubbles in the conversation.

### Purpose
Displays user's responses — text, lists, rankings, slider values. Right-aligned with subtle bubble.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `UserResponseContent` | required | Response content |
| `timestamp` | `Date` | — | Response timestamp |
| `id` | `string` | auto-generated | Message identifier |

### Types

```typescript
type UserResponseContent =
  | { type: 'text'; value: string }
  | { type: 'list'; items: string[] }
  | { type: 'ranked-list'; items: string[] }
  | { type: 'slider'; value: number; minLabel: string; maxLabel: string }
  | { type: 'tags'; selected: string[] }
  | { type: 'soared-story'; story: SOAREDStory };
```

### Rendered Structure

```html
<div 
  class="message-user" 
  id={id}
  role="article"
  aria-label="Your response"
>
  <div class="message-user-bubble">
    <UserContentRenderer content={content} />
  </div>
  {timestamp && (
    <time class="message-user-time" datetime={timestamp.toISOString()}>
      {formatTime(timestamp)}
    </time>
  )}
</div>
```

### Content Rendering

| Content Type | Display |
|--------------|---------|
| `text` | Plain text paragraph |
| `list` | Bulleted list |
| `ranked-list` | Numbered list (1., 2., 3.) |
| `slider` | Value with context: "3 — between [min] and [max]" |
| `tags` | Comma-separated tag names |
| `soared-story` | Formatted SOARED sections |

### Styling

| Property | Value |
|----------|-------|
| Alignment | Right |
| Max-width | 65ch |
| Bubble background | `--color-primary` @ 15% (light), @ 20% (dark) |
| Bubble padding | `space-3` vertical, `space-4` horizontal |
| Bubble radius | `radius-md` |
| Timestamp | `text-xs`, `--color-muted`, `margin-top: space-1` |

### Animation

| Property | Value |
|----------|-------|
| Entry | Fade in + slide up 8px |
| Duration | `duration-normal` |
| Easing | `ease-out` |

---

## 3.3 `TypingEffect`

Character-by-character text reveal animation.

### Purpose
Creates the illusion of DreamTree "typing" its responses, making the conversation feel more natural and less like reading static text.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | required | Text to reveal |
| `speed` | `number` | `30` | Ms per character |
| `onComplete` | `() => void` | — | Completion callback |
| `paused` | `boolean` | `false` | Pause animation |
| `skipToEnd` | `boolean` | `false` | Immediately show full text |

### Behavior

- Characters appear one at a time at specified speed
- Blinking cursor follows last character
- Cursor blinks at 530ms intervals (on/off)
- Click anywhere skips to end of current block
- `prefers-reduced-motion` shows full text immediately

### Rendered Structure

```html
<span class="typing-effect">
  <span class="typing-effect-text">{displayedText}</span>
  {!isComplete && (
    <span class="typing-effect-cursor" aria-hidden="true">|</span>
  )}
</span>
```

### Implementation

```typescript
const TypingEffect = ({ text, speed = 30, onComplete, paused, skipToEnd }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    if (skipToEnd) {
      setDisplayedText(text);
      setIsComplete(true);
      onComplete?.();
      return;
    }
    
    if (paused) return;
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed, paused, skipToEnd, onComplete]);
  
  return (
    <span class="typing-effect">
      <span class="typing-effect-text">{displayedText}</span>
      {!isComplete && (
        <span class="typing-effect-cursor" aria-hidden="true">|</span>
      )}
    </span>
  );
};
```

### Cursor Animation

```css
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.typing-effect-cursor {
  animation: blink 1060ms step-end infinite;
}

@media (prefers-reduced-motion: reduce) {
  .typing-effect-cursor {
    animation: none;
  }
}
```

---

## 3.4 `Timestamp`

Date marker between messages.

### Purpose
Shows session date, displayed once per day of conversation. Helps users understand temporal context.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `date` | `Date` | required | Date to display |

### Format Logic

| Condition | Format | Example |
|-----------|--------|---------|
| Today | "Today" | Today |
| Yesterday | "Yesterday" | Yesterday |
| Within 7 days | Day name | Wednesday |
| This year | Month Day | January 15 |
| Other | Month Day, Year | January 15, 2024 |

### Implementation

```typescript
const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = date.toDateString() === 
    new Date(now.getTime() - dayMs).toDateString();
  const isWithinWeek = diff < 7 * dayMs;
  const isThisYear = date.getFullYear() === now.getFullYear();
  
  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  if (isWithinWeek) return date.toLocaleDateString('en-US', { weekday: 'long' });
  if (isThisYear) return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};
```

### Rendered Structure

```html
<div class="timestamp" role="separator">
  <time datetime={date.toISOString()}>
    {formatTimestamp(date)}
  </time>
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Alignment | Center |
| Font | `text-xs`, `--color-muted` |
| Margin | `space-6` vertical |
| Animation | Fade in, `duration-slow` |

---

## 3.5 `Divider`

Visual separator between sections or modules.

### Purpose
Creates clear visual breaks between different parts of the workbook content.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'section' \| 'module'` | `'section'` | Divider type |
| `label` | `string` | — | Optional label text |

### Types

| Type | Visual |
|------|--------|
| `section` | 1px line, `--color-muted` @ 20%, no label |
| `module` | 1px line, `--color-muted` @ 30%, optional centered label |

### Rendered Structure

```html
<div class="divider" data-type={type} role="separator">
  {label && <span class="divider-label">{label}</span>}
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Margin | `space-10` vertical |
| Line | 1px height, full width |
| Label | `text-xs`, `--color-muted`, `padding: 0 space-3`, centered |
| Label background | `--color-bg` (to break line) |

### Animation

| Property | Value |
|----------|-------|
| Entry | Fade in + horizontal expand from center |
| Duration | `duration-slow` |

### CSS Implementation

```css
.divider {
  position: relative;
  margin: var(--space-10) 0;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: var(--color-muted);
  opacity: 0.2;
}

.divider[data-type="module"]::before {
  opacity: 0.3;
}

.divider-label {
  position: relative;
  display: inline-block;
  left: 50%;
  transform: translateX(-50%);
  padding: 0 var(--space-3);
  background: var(--color-bg);
  font-size: var(--text-xs);
  color: var(--color-muted);
}

/* Entry animation */
@keyframes divider-expand {
  from {
    transform: scaleX(0);
    opacity: 0;
  }
  to {
    transform: scaleX(1);
    opacity: 1;
  }
}

.divider::before {
  animation: divider-expand var(--duration-slow) ease-out;
}
```

---

## 3.6 `ConversationThread`

Container managing the message sequence.

### Purpose
Renders messages in order, manages scroll position, handles scroll state detection for "return to current" functionality.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `messages` | `Message[]` | required | Messages to display |
| `onScrollStateChange` | `(state: ScrollState) => void` | — | Scroll position callback |
| `autoScrollOnNew` | `boolean` | `true` | Auto-scroll when new message arrives |

### Types

```typescript
type Message = {
  id: string;
  type: 'content' | 'user' | 'timestamp' | 'divider';
  data: ContentBlock[] | UserResponseContent | Date | DividerData;
  timestamp: Date;
};

type ScrollState = 'at-current' | 'in-history';

type DividerData = {
  type: 'section' | 'module';
  label?: string;
};
```

### Scroll Behavior

| State | Condition | Behavior |
|-------|-----------|----------|
| `at-current` | Within 100px of bottom | Auto-scroll on new message |
| `in-history` | Scrolled up >100px | Don't auto-scroll, show "return" prompt |

### Rendered Structure

```html
<div 
  class="conversation-thread"
  role="log"
  aria-live="polite"
  aria-label="Conversation"
  ref={threadRef}
  onScroll={handleScroll}
>
  {messages.map(message => (
    <MessageRenderer key={message.id} message={message} />
  ))}
</div>
```

### MessageRenderer Component

```typescript
const MessageRenderer = ({ message }: { message: Message }) => {
  switch (message.type) {
    case 'content':
      return <MessageContent content={message.data as ContentBlock[]} />;
    case 'user':
      return (
        <MessageUser 
          content={message.data as UserResponseContent} 
          timestamp={message.timestamp}
        />
      );
    case 'timestamp':
      return <Timestamp date={message.data as Date} />;
    case 'divider':
      const dividerData = message.data as DividerData;
      return <Divider type={dividerData.type} label={dividerData.label} />;
    default:
      return null;
  }
};
```

### Scroll Management

```typescript
const ConversationThread = ({ messages, onScrollStateChange, autoScrollOnNew }) => {
  const threadRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<ScrollState>('at-current');
  
  const handleScroll = () => {
    if (!threadRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = threadRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    const newState = distanceFromBottom < 100 ? 'at-current' : 'in-history';
    
    if (newState !== scrollState) {
      setScrollState(newState);
      onScrollStateChange?.(newState);
    }
  };
  
  // Auto-scroll on new message
  useEffect(() => {
    if (autoScrollOnNew && scrollState === 'at-current' && threadRef.current) {
      threadRef.current.scrollTo({
        top: threadRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages.length, autoScrollOnNew, scrollState]);
  
  return (
    <div 
      class="conversation-thread"
      role="log"
      aria-live="polite"
      aria-label="Conversation"
      ref={threadRef}
      onScroll={handleScroll}
    >
      {messages.map(message => (
        <MessageRenderer key={message.id} message={message} />
      ))}
    </div>
  );
};
```

### Styling

| Property | Value |
|----------|-------|
| Overflow | `overflow-y: auto` |
| Padding | `space-4` horizontal, `space-6` vertical |
| Message gap | `space-8` (desktop), `space-6` (mobile) |
| Scroll behavior | `scroll-behavior: smooth` |

### CSS Implementation

```css
.conversation-thread {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6) var(--space-4);
  scroll-behavior: smooth;
}

.conversation-thread > * + * {
  margin-top: var(--space-8);
}

@media (max-width: 767px) {
  .conversation-thread > * + * {
    margin-top: var(--space-6);
  }
}

/* Custom scrollbar (optional) */
.conversation-thread::-webkit-scrollbar {
  width: 6px;
}

.conversation-thread::-webkit-scrollbar-track {
  background: transparent;
}

.conversation-thread::-webkit-scrollbar-thumb {
  background: var(--color-muted);
  opacity: 0.3;
  border-radius: var(--radius-full);
}
```

### Accessibility

- `role="log"` indicates content updates over time
- `aria-live="polite"` for screen reader announcements
- Messages are articles within the log
- Keyboard navigation supported for scrolling

---

## Related Documents

- **Section 1**: Component Philosophy
- **Section 2**: Shell & Navigation Components
- **Section 4**: Form Input Components
- **Design System**: Visual tokens, colors, typography, spacing
