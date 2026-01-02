# DreamTree Component Specification
## Section 1: Component Philosophy

> Foundational principles and component inventory for DreamTree UI components.

**Framework**: Next.js → Cloudflare Pages  
**Companion Document**: DreamTree Design System v1.0

---

## 1.1 Core Principles

| Principle | Implementation |
|-----------|----------------|
| **Composition over complexity** | Small, single-purpose, composable components |
| **Props drive variants** | One component with variant props, not separate components |
| **Accessibility baked in** | ARIA attributes, keyboard handling, focus management by default |
| **Dual-context tools** | Tools work both embedded in conversation and as standalone pages |

---

## 1.2 Navigation Model

| Nav Item | Type | Behavior | URL |
|----------|------|----------|-----|
| **Home** | Page | Dashboard with progress, prefs preview, TOC | `/` or `/dashboard` |
| **Contents** | Overlay | Sidebar slides in, stays on current page | No URL change |
| **Tools** | Page | Each tool has dedicated page, same shell | `/tools/[tool-id]` |
| **Profile** | Page | Deep data view, settings, account controls | `/profile` |

---

## 1.3 Component Inventory

### Shell & Navigation
- `AppShell` — Root layout orchestrating nav, header, content, input
- `NavBar` — Fixed navigation (4 items: home, contents, tools, profile)
- `NavItem` — Individual nav button
- `Header` — Breadcrumb bar, auto-hides after idle
- `Breadcrumb` — Part › Module › Exercise trail
- `InputArea` — Bottom input region for user responses

### Conversation
- `MessageContent` — DreamTree content blocks (left-aligned, no bubble)
- `MessageUser` — User response bubbles (right-aligned)
- `TypingEffect` — Character-by-character text reveal
- `Timestamp` — Date marker between messages
- `Divider` — Visual separator between sections/modules
- `ConversationThread` — Container managing message sequence

### Form Inputs
- `TextInput` — Single-line text input
- `TextArea` — Multi-line expandable text input
- `Slider` — Ordinal scale input (1-5)
- `Checkbox` — Single binary choice
- `CheckboxGroup` — Multiple selection from options
- `RadioGroup` — Single selection from options
- `Select` — Dropdown for longer option lists

### Structured Inputs
- `ListBuilder` — Dynamic list for adding/removing/reordering items
- `ListBuilderItem` — Individual item within ListBuilder
- `RankingGrid` — Pairwise comparison tool
- `RankingPair` — Single option in pairwise comparison
- `TagSelector` — Multi-select from predefined tags
- `SkillTagger` — Specialized tag selector for skills
- `SOAREDForm` — Structured SOARED story capture

### Feedback & Status
- `Button` — Primary interactive element
- `Toast` — Transient notification messages
- `ToastContainer` — Manager for multiple toasts
- `Tooltip` — Contextual information on hover/focus
- `SaveIndicator` — Auto-save confirmation
- `ProgressMarker` — Completion indicator
- `Badge` — Status indicator or count
- `EmptyState` — Placeholder for empty content

### Overlays
- `Backdrop` — Semi-transparent layer behind overlays
- `Modal` — Centered dialog for confirmations
- `TOCPanel` — Sliding sidebar with table of contents
- `TOCPart` — Collapsible part section
- `TOCModule` — Module item within part
- `TOCExercise` — Exercise item within module
- `NavExpanded` — Expanded nav showing tool sub-items

### Onboarding
- `OnboardingFlow` — Multi-step onboarding container
- `WelcomeStep` — Introduction screen
- `NameStep` — Name input
- `VisualsStep` — Color and font selection
- `ColorSwatch` — Individual color option
- `FontPreview` — Individual font option
- `CompleteStep` — Final confirmation
- `OnboardingProgress` — Step indicator

### Tools
- `ToolPage` — Shell for tool pages (list of instances)
- `ToolInstanceCard` — Instance preview card
- `ToolInstanceView` — Full view/edit of instance
- `ListBuilder` — List creation tool
- `RankingGrid` — Ranking tool
- `FlowTracker` — Daily energy/engagement tracking
- `FailureReframer` — Setback reframing tool
- `BudgetCalculator` — Income/expense tracker with tax API
- `IdeaTree` — Word association brainstorming
- `JobProspector` — Job opportunity tracking

### Pages
- `Dashboard` — Home page with daily dos, progress, TOC
- `Profile` — User data, settings, account
- `ToolPage` — Individual tool with instances
- `Workbook` — Main conversation interface

---

## 1.4 Z-Index Scale

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Content | 0 | Main content area |
| Header | 10 | Breadcrumb bar |
| Input | 20 | Input area |
| Nav | 30 | Navigation bar |
| Backdrop | 40 | Overlay backgrounds |
| Modal/Panel | 50 | Overlays |
| Toast | 60 | Notifications |

---

## 1.5 Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 768px | Nav at bottom, single column, touch-optimized |
| Tablet | 768px - 1023px | Nav at bottom, wider content |
| Desktop | ≥ 1024px | Nav rail on left, max-width content |

---

## 1.6 Common Types

```typescript
// Location in workbook
type BreadcrumbLocation = {
  partId: string;
  partTitle: string;
  moduleId?: string;
  moduleTitle?: string;
  exerciseId?: string;
  exerciseTitle?: string;
};

// Tool instance source
type WorkbookSource = {
  type: 'workbook';
  partId: string;
  moduleId: string;
  exerciseId: string;
};

type UserCreated = {
  type: 'user';
};

// Progress tracking
type ProgressStatus = 'locked' | 'available' | 'in-progress' | 'complete';
```

---

## Related Documents

- **Section 2**: Shell & Navigation Components
- **Section 3**: Conversation Components
- **Section 4**: Form Input Components
- **Section 5**: Structured Input Components
- **Section 6**: Feedback & Status Components
- **Section 7**: Overlay Components
- **Section 8**: Onboarding Components
- **Section 9**: Tool Components
- **Section 10**: Page Components
- **Design System**: Visual tokens, colors, typography, spacing


# DreamTree Component Specification
## Section 2: Shell & Navigation

> Root layout, navigation, header, and input area components.

---

## 2.1 `AppShell`

Root layout component orchestrating navigation, header, content area, and input.

### Purpose
Provides consistent structure across all pages. Handles responsive layout shifts between desktop and mobile.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Main content area |
| `currentLocation` | `BreadcrumbLocation` | — | Current position for breadcrumb |
| `showBreadcrumb` | `boolean` | `true` | Show/hide breadcrumb header |
| `showInput` | `boolean` | `true` | Show/hide input area |
| `inputType` | `InputType` | `'text'` | Type of input to display |
| `navCollapsed` | `boolean` | `false` | Collapse nav to icons only |

### Types

```typescript
type BreadcrumbLocation = {
  partId: string;
  partTitle: string;
  moduleId?: string;
  moduleTitle?: string;
  exerciseId?: string;
  exerciseTitle?: string;
};

type InputType = 'text' | 'textarea' | 'structured' | 'none';
```

### Layout Structure

```
Desktop (≥1024px)                    Mobile (<1024px)
┌──────┬─────────────────────┐      ┌─────────────────────┐
│      │ [Breadcrumb Header] │      │ [Breadcrumb Header] │
│      ├─────────────────────┤      ├─────────────────────┤
│ Nav  │                     │      │                     │
│ Rail │   Content Area      │      │   Content Area      │
│ 64px │   (scrollable)      │      │   (scrollable)      │
│      │                     │      │                     │
│      ├─────────────────────┤      ├─────────────────────┤
│      │ [Input Area]        │      │ [Input Area]        │
└──────┴─────────────────────┘      ├─────────────────────┤
                                    │ [Nav Bar - 56px]    │
                                    └─────────────────────┘
```

### Rendered Structure

```html
<div class="app-shell" data-nav-collapsed={navCollapsed}>
  <NavBar position={isMobile ? 'bottom' : 'left'} />
  
  <div class="app-shell-main">
    {showBreadcrumb && currentLocation && (
      <Header>
        <Breadcrumb location={currentLocation} />
      </Header>
    )}
    
    <main class="app-shell-content">
      {children}
    </main>
    
    {showInput && inputType !== 'none' && (
      <InputArea type={inputType} />
    )}
  </div>
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Nav rail width (desktop) | 64px |
| Nav bar height (mobile) | 56px |
| Content max-width | 720px |
| Content padding | `space-4` horizontal, `space-6` vertical |
| Content centering | `margin: 0 auto` |

### Z-Index Layers

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Content | 0 | Main content area |
| Header | 10 | Breadcrumb bar |
| Input | 20 | Input area |
| Nav | 30 | Navigation bar |
| Backdrop | 40 | Overlay backgrounds |
| Modal/Panel | 50 | Overlays |
| Toast | 60 | Notifications |

---

## 2.2 `NavBar`

Fixed navigation component with 4 primary destinations.

### Purpose
Persistent navigation to Home, Contents, Tools, and Profile. Indicates current location and tool unlock status.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'left' \| 'bottom'` | `'left'` | Bar position |
| `activeItem` | `NavItemId` | — | Currently active nav item |
| `toolsUnlocked` | `number` | `0` | Count of unlocked tools (for badge) |
| `onNavigate` | `(id: NavItemId) => void` | required | Navigation handler |
| `onExpandTools` | `() => void` | — | Handler for tools expansion |

### Types

```typescript
type NavItemId = 'home' | 'contents' | 'tools' | 'profile';
```

### Nav Items

| ID | Icon | Label | Behavior |
|----|------|-------|----------|
| `home` | House | Home | Navigate to dashboard |
| `contents` | List/TOC | Contents | Open TOC overlay |
| `tools` | Wrench | Tools | Expand to show tool list |
| `profile` | User | Profile | Navigate to profile |

### Rendered Structure

```html
<nav 
  class="nav-bar" 
  data-position={position}
  aria-label="Main navigation"
>
  <ul class="nav-bar-list" role="list">
    <li>
      <NavItem
        id="home"
        icon={HomeIcon}
        label="Home"
        isActive={activeItem === 'home'}
        onClick={() => onNavigate('home')}
      />
    </li>
    <li>
      <NavItem
        id="contents"
        icon={ListIcon}
        label="Contents"
        isActive={activeItem === 'contents'}
        onClick={() => onNavigate('contents')}
      />
    </li>
    <li>
      <NavItem
        id="tools"
        icon={WrenchIcon}
        label="Tools"
        isActive={activeItem === 'tools'}
        badge={toolsUnlocked > 0 ? toolsUnlocked : undefined}
        onClick={onExpandTools}
        hasExpansion
      />
    </li>
    <li>
      <NavItem
        id="profile"
        icon={UserIcon}
        label="Profile"
        isActive={activeItem === 'profile'}
        onClick={() => onNavigate('profile')}
      />
    </li>
  </ul>
</nav>
```

### Styling

| Property | Desktop (left) | Mobile (bottom) |
|----------|----------------|-----------------|
| Width/Height | 64px wide, 100vh | 100vw, 56px tall |
| Position | Fixed left | Fixed bottom |
| Background | `--color-bg` | `--color-bg` |
| Border | Right: `border-thin` | Top: `border-thin` |
| Item layout | Vertical stack | Horizontal row |
| Item spacing | `space-2` gap | Equal distribution |

### States

| State | Visual Treatment |
|-------|------------------|
| Default | Icon `--color-muted` |
| Hover | Background `--color-primary` @ 8%, icon `--color-text` |
| Active | Background `--color-primary` @ 12%, icon `--color-primary` |
| Focus | `--focus-ring` |

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move between nav items |
| Enter/Space | Activate nav item |
| Arrow Up/Down (vertical) | Move between items |
| Arrow Left/Right (horizontal) | Move between items |

---

## 2.3 `NavItem`

Individual navigation button within NavBar.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `NavItemId` | required | Item identifier |
| `icon` | `IconComponent` | required | Icon to display |
| `label` | `string` | required | Accessible label |
| `isActive` | `boolean` | `false` | Currently active state |
| `badge` | `number \| boolean` | — | Badge indicator |
| `hasExpansion` | `boolean` | `false` | Shows expansion indicator |
| `onClick` | `() => void` | required | Click handler |

### Rendered Structure

```html
<button
  class="nav-item"
  data-active={isActive}
  onClick={onClick}
  aria-current={isActive ? 'page' : undefined}
  aria-label={label}
>
  <span class="nav-item-icon" aria-hidden="true">
    <Icon />
    {badge && (
      <span class="nav-item-badge">
        {typeof badge === 'number' ? badge : ''}
      </span>
    )}
  </span>
  <span class="nav-item-label">{label}</span>
  {hasExpansion && (
    <ChevronIcon class="nav-item-chevron" aria-hidden="true" />
  )}
</button>
```

### Styling

| Property | Value |
|----------|-------|
| Touch target | 48px × 48px minimum |
| Icon size | 24px |
| Label | `text-xs`, hidden on mobile, visible on desktop |
| Badge | 16px circle, `--color-primary` bg, `--color-bg` text, `text-xs` |
| Badge position | Top-right of icon, offset -4px |

---

## 2.4 `Header`

Top bar containing breadcrumb navigation.

### Purpose
Shows current location in workbook hierarchy. Auto-hides after inactivity, reappears on scroll up.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Header content (typically Breadcrumb) |
| `autoHide` | `boolean` | `true` | Enable auto-hide behavior |
| `hideDelay` | `number` | `20000` | Ms before auto-hide (20s) |

### Behavior

| Trigger | Action |
|---------|--------|
| Page load | Visible |
| 20s idle (no scroll) | Fade out (400ms) |
| Scroll up | Fade in (200ms) |
| Scroll down | Stay hidden |
| User interaction with header | Reset idle timer |

### Rendered Structure

```html
<header 
  class="header" 
  data-visible={isVisible}
  role="banner"
>
  <div class="header-content">
    {children}
  </div>
</header>
```

### Styling

| Property | Value |
|----------|-------|
| Height | 48px |
| Position | Fixed top (below nav on desktop) |
| Background | `--color-bg` with `backdrop-filter: blur(8px)` |
| Border | Bottom: `border-thin`, `--color-muted` @ 10% |
| Content max-width | 720px, centered |
| Padding | `space-3` vertical, `space-4` horizontal |
| Z-index | `--z-header` (10) |

### Animation

```css
.header {
  transition: opacity var(--duration-normal) ease,
              transform var(--duration-normal) ease;
}

.header[data-visible="false"] {
  opacity: 0;
  transform: translateY(-100%);
  pointer-events: none;
}
```

---

## 2.5 `Breadcrumb`

Navigation trail showing Part › Module › Exercise hierarchy.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `location` | `BreadcrumbLocation` | required | Current location data |
| `onNavigate` | `(location: Partial<BreadcrumbLocation>) => void` | — | Navigation handler |

### Visual Structure

```
Part 1: Roots › Module 2: Skills › Exercise 3
        ↑              ↑              ↑
    clickable      clickable     current (not clickable)
```

### Rendered Structure

```html
<nav class="breadcrumb" aria-label="Breadcrumb">
  <ol class="breadcrumb-list">
    <li class="breadcrumb-item">
      <button 
        class="breadcrumb-link"
        onClick={() => onNavigate({ partId: location.partId })}
      >
        {location.partTitle}
      </button>
    </li>
    
    {location.moduleTitle && (
      <>
        <li class="breadcrumb-separator" aria-hidden="true">›</li>
        <li class="breadcrumb-item">
          {location.exerciseTitle ? (
            <button 
              class="breadcrumb-link"
              onClick={() => onNavigate({ 
                partId: location.partId,
                moduleId: location.moduleId 
              })}
            >
              {location.moduleTitle}
            </button>
          ) : (
            <span class="breadcrumb-current" aria-current="location">
              {location.moduleTitle}
            </span>
          )}
        </li>
      </>
    )}
    
    {location.exerciseTitle && (
      <>
        <li class="breadcrumb-separator" aria-hidden="true">›</li>
        <li class="breadcrumb-item">
          <span class="breadcrumb-current" aria-current="location">
            {location.exerciseTitle}
          </span>
        </li>
      </>
    )}
  </ol>
</nav>
```

### Styling

| Property | Value |
|----------|-------|
| Font | `text-sm` |
| Link color | `--color-muted` |
| Link hover | `--color-text` |
| Current color | `--color-text`, `font-medium` |
| Separator | `--color-muted` @ 50%, `margin: 0 space-2` |
| Truncation (mobile) | Show current + module if space, ellipsis for part |

### Accessibility

- Uses `<nav>` with `aria-label="Breadcrumb"`
- Ordered list semantics
- Current page marked with `aria-current="location"`
- Parent levels are clickable buttons (open TOC to that location)

---

## 2.6 `InputArea`

Bottom input region for user responses.

### Purpose
Primary interaction point for user input. Adapts to different input types and can collapse to a "return" prompt.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `InputType` | `'text'` | Input type to display |
| `value` | `string` | `''` | Current input value |
| `onChange` | `(value: string) => void` | required | Value change handler |
| `onSubmit` | `(value: string) => void` | required | Submit handler |
| `placeholder` | `string` | `'Type here...'` | Input placeholder |
| `collapsed` | `boolean` | `false` | Show collapsed "return" state |
| `onExpand` | `() => void` | — | Handler for expanding collapsed state |
| `disabled` | `boolean` | `false` | Disable input |

### States

| State | Display |
|-------|---------|
| Active (text) | Full text input + send button, 56px height |
| Active (textarea) | Expandable textarea + send button |
| Active (structured) | Structured input component |
| Collapsed | Single line "↓ Return to current", 40px height |

### Rendered Structure

```html
<div 
  class="input-area" 
  data-type={type}
  data-collapsed={collapsed}
>
  {collapsed ? (
    <button class="input-area-return" onClick={onExpand}>
      <ChevronDownIcon aria-hidden="true" />
      <span>Return to current</span>
    </button>
  ) : (
    <div class="input-area-active">
      {type === 'text' && (
        <TextInput
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
      {type === 'textarea' && (
        <TextArea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
      <Button
        variant="primary"
        icon={SendIcon}
        iconOnly
        onClick={() => onSubmit(value)}
        disabled={disabled || !value.trim()}
        ariaLabel="Send"
      />
    </div>
  )}
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Position | Fixed bottom (above mobile nav) |
| Max-width | 720px, centered |
| Background | `--color-bg` |
| Border | Top: `border-thin`, `--color-muted` @ 10% |
| Padding | `space-3` |
| Active height | 56px minimum |
| Collapsed height | 40px |
| Z-index | `--z-input` (20) |
| Transition | Height + content cross-fade, `duration-slow` |

---

## Related Documents

- **Section 1**: Component Philosophy
- **Section 3**: Conversation Components
- **Design System**: Visual tokens, colors, typography, spacing

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


# DreamTree Component Specification
## Section 4: Form Input Components

> Basic form inputs: text, textarea, slider, checkbox, radio, and select components.

---

## 4.1 `TextInput`

Single-line text input field.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | Input value |
| `onChange` | `(value: string) => void` | required | Change handler |
| `onSubmit` | `() => void` | — | Enter key handler |
| `placeholder` | `string` | `''` | Placeholder text |
| `label` | `string` | — | Visible label |
| `helperText` | `string` | — | Help text below input |
| `error` | `string` | — | Error message |
| `disabled` | `boolean` | `false` | Disable input |
| `autoFocus` | `boolean` | `false` | Focus on mount |
| `maxLength` | `number` | — | Maximum characters |
| `id` | `string` | auto-generated | HTML id attribute |

### States

| State | Border | Background |
|-------|--------|------------|
| Default | `--color-muted` @ 30% | transparent |
| Hover | `--color-muted` @ 50% | transparent |
| Focus | `--color-primary` | transparent + `--focus-ring` |
| Error | `--color-error` | transparent |
| Disabled | `--color-muted` @ 15% | `--color-muted` @ 5% |

### Rendered Structure

```html
<div class="text-input-wrapper" data-error={!!error} data-disabled={disabled}>
  {label && (
    <label class="text-input-label" for={id}>{label}</label>
  )}
  <input
    type="text"
    id={id}
    class="text-input"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
    placeholder={placeholder}
    disabled={disabled}
    autoFocus={autoFocus}
    maxLength={maxLength}
    aria-describedby={helperText || error ? `${id}-helper` : undefined}
    aria-invalid={!!error}
  />
  {(helperText || error) && (
    <span id={`${id}-helper`} class="text-input-helper" data-error={!!error}>
      {error || helperText}
    </span>
  )}
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Height | 44px |
| Padding | `space-3` vertical, `space-4` horizontal |
| Border | `border-thin`, `radius-sm` |
| Font | `text-base` |
| Label | `text-sm`, `font-medium`, `margin-bottom: space-1` |
| Helper text | `text-xs`, `--color-muted`, `margin-top: space-1` |
| Error text | `text-xs`, `--color-error` |

### CSS Implementation

```css
.text-input-wrapper {
  display: flex;
  flex-direction: column;
}

.text-input-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-1);
}

.text-input {
  height: 44px;
  padding: var(--space-3) var(--space-4);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  background: transparent;
  color: var(--color-text);
  transition: border-color var(--duration-fast) ease,
              box-shadow var(--duration-fast) ease;
}

.text-input::placeholder {
  color: var(--color-muted);
  opacity: 0.6;
}

.text-input:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--color-muted) 50%, transparent);
}

.text-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.text-input-wrapper[data-error="true"] .text-input {
  border-color: var(--color-error);
}

.text-input:disabled {
  border-color: color-mix(in srgb, var(--color-muted) 15%, transparent);
  background: color-mix(in srgb, var(--color-muted) 5%, transparent);
  cursor: not-allowed;
}

.text-input-helper {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-top: var(--space-1);
}

.text-input-helper[data-error="true"] {
  color: var(--color-error);
}
```

---

## 4.2 `TextArea`

Multi-line expandable text input.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | Input value |
| `onChange` | `(value: string) => void` | required | Change handler |
| `placeholder` | `string` | `''` | Placeholder text |
| `label` | `string` | — | Visible label |
| `helperText` | `string` | — | Help text below input |
| `error` | `string` | — | Error message |
| `disabled` | `boolean` | `false` | Disable input |
| `autoFocus` | `boolean` | `false` | Focus on mount |
| `minRows` | `number` | `3` | Minimum visible rows |
| `maxRows` | `number` | `10` | Maximum rows before scroll |
| `maxLength` | `number` | — | Maximum characters |
| `showCount` | `boolean` | `false` | Show character count |
| `id` | `string` | auto-generated | HTML id attribute |

### Auto-Expand Behavior

- Starts at `minRows` height
- Grows as content is added
- Stops growing at `maxRows`, then scrolls
- Shrinks when content is removed

### Implementation

```typescript
const TextArea = ({ 
  value, 
  onChange, 
  minRows = 3, 
  maxRows = 10,
  ...props 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to auto to get scrollHeight
    textarea.style.height = 'auto';
    
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const paddingY = parseInt(getComputedStyle(textarea).paddingTop) * 2;
    
    const minHeight = lineHeight * minRows + paddingY;
    const maxHeight = lineHeight * maxRows + paddingY;
    
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    setHeight(newHeight);
  }, [value, minRows, maxRows]);
  
  return (
    <div class="textarea-wrapper" data-error={!!props.error} data-disabled={props.disabled}>
      {props.label && (
        <label class="textarea-label" for={props.id}>{props.label}</label>
      )}
      <textarea
        ref={textareaRef}
        id={props.id}
        class="textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={props.placeholder}
        disabled={props.disabled}
        autoFocus={props.autoFocus}
        maxLength={props.maxLength}
        rows={minRows}
        style={{ height }}
        aria-describedby={`${props.id}-helper`}
        aria-invalid={!!props.error}
      />
      <div class="textarea-footer">
        {(props.helperText || props.error) && (
          <span id={`${props.id}-helper`} class="textarea-helper" data-error={!!props.error}>
            {props.error || props.helperText}
          </span>
        )}
        {props.showCount && props.maxLength && (
          <span class="textarea-count">
            {value.length}/{props.maxLength}
          </span>
        )}
      </div>
    </div>
  );
};
```

### Rendered Structure

```html
<div class="textarea-wrapper" data-error={!!error} data-disabled={disabled}>
  {label && (
    <label class="textarea-label" for={id}>{label}</label>
  )}
  <textarea
    id={id}
    class="textarea"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    disabled={disabled}
    autoFocus={autoFocus}
    maxLength={maxLength}
    rows={minRows}
    style={{ height: calculatedHeight }}
    aria-describedby={`${id}-helper`}
    aria-invalid={!!error}
  />
  <div class="textarea-footer">
    {(helperText || error) && (
      <span id={`${id}-helper`} class="textarea-helper" data-error={!!error}>
        {error || helperText}
      </span>
    )}
    {showCount && maxLength && (
      <span class="textarea-count">
        {value.length}/{maxLength}
      </span>
    )}
  </div>
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Padding | `space-3` |
| Border | `border-thin`, `radius-sm` |
| Font | `text-base` |
| Line height | 1.6 |
| Resize | `none` (handled programmatically) |
| Character count | `text-xs`, `--color-muted`, right-aligned |

### CSS Implementation

```css
.textarea {
  width: 100%;
  padding: var(--space-3);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  font-family: inherit;
  line-height: 1.6;
  background: transparent;
  color: var(--color-text);
  resize: none;
  transition: border-color var(--duration-fast) ease,
              box-shadow var(--duration-fast) ease,
              height var(--duration-fast) ease;
}

.textarea-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-1);
}

.textarea-count {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-left: auto;
}
```

---

## 4.3 `Slider`

Ordinal scale input (1-5).

### Purpose
Captures subjective ratings on a scale. Shows descriptive labels, not numbers. Data stored as integer 1-5.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number \| null` | `null` | Selected value (1-5) |
| `onChange` | `(value: number) => void` | required | Change handler |
| `min` | `number` | `1` | Minimum value |
| `max` | `number` | `5` | Maximum value |
| `minLabel` | `string` | required | Label for minimum end |
| `maxLabel` | `string` | required | Label for maximum end |
| `label` | `string` | — | Accessible label |
| `disabled` | `boolean` | `false` | Disable input |
| `id` | `string` | auto-generated | HTML id attribute |

### Visual Structure

```
Energy Level

(−) Drained  ○───○───●───○───○  Energized (+)
```

### Rendered Structure

```html
<div class="slider-wrapper" data-disabled={disabled}>
  {label && (
    <span class="slider-label" id={`${id}-label`}>{label}</span>
  )}
  <div class="slider-container">
    <span class="slider-min-label">
      <span class="slider-indicator">(−)</span>
      {minLabel}
    </span>
    
    <div 
      class="slider-track"
      role="slider"
      aria-labelledby={`${id}-label`}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={value ? `${value} of ${max}, between ${minLabel} and ${maxLabel}` : 'No selection'}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
    >
      {Array.from({ length: max - min + 1 }, (_, i) => (
        <button
          key={i + min}
          class="slider-point"
          data-selected={value === i + min}
          onClick={() => onChange(i + min)}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
        />
      ))}
    </div>
    
    <span class="slider-max-label">
      {maxLabel}
      <span class="slider-indicator">(+)</span>
    </span>
  </div>
</div>
```

### Keyboard Handling

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  if (disabled) return;
  
  const currentValue = value ?? min;
  
  switch (e.key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      e.preventDefault();
      if (currentValue > min) onChange(currentValue - 1);
      break;
    case 'ArrowRight':
    case 'ArrowUp':
      e.preventDefault();
      if (currentValue < max) onChange(currentValue + 1);
      break;
    case 'Home':
      e.preventDefault();
      onChange(min);
      break;
    case 'End':
      e.preventDefault();
      onChange(max);
      break;
  }
};
```

### Styling

| Property | Value |
|----------|-------|
| Track | 2px height, `--color-muted` @ 30%, connects points |
| Points | 20px diameter, `--color-muted` @ 30% border |
| Selected point | `--color-primary` fill |
| Touch targets | 44px × 44px per point |
| Labels | `text-sm`, `--color-muted` |
| Indicators | `text-xs`, `--color-muted` @ 60% |

### CSS Implementation

```css
.slider-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.slider-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.slider-container {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.slider-min-label,
.slider-max-label {
  font-size: var(--text-sm);
  color: var(--color-muted);
  white-space: nowrap;
}

.slider-indicator {
  font-size: var(--text-xs);
  opacity: 0.6;
}

.slider-track {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: var(--space-3) 0;
}

.slider-track::before {
  content: '';
  position: absolute;
  left: 10px;
  right: 10px;
  height: 2px;
  background: color-mix(in srgb, var(--color-muted) 30%, transparent);
}

.slider-point {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  background: var(--color-bg);
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: transform var(--duration-fast) ease,
              background-color var(--duration-fast) ease,
              border-color var(--duration-fast) ease;
}

/* Increase touch target */
.slider-point::before {
  content: '';
  position: absolute;
  inset: -12px;
}

.slider-point:hover:not(:disabled) {
  transform: scale(1.1);
  border-color: var(--color-primary);
}

.slider-point[data-selected="true"] {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.slider-track:focus {
  outline: none;
}

.slider-track:focus .slider-point[data-selected="true"] {
  box-shadow: var(--focus-ring);
}
```

### Accessibility

- `aria-valuetext` provides context: "3 of 5, between Drained and Energized"
- No numeric labels shown visually — screen readers get full context
- Keyboard navigation with arrow keys
- Focus ring on track, highlights selected point

---

## 4.4 `Checkbox`

Single binary choice input.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | `false` | Checked state |
| `onChange` | `(checked: boolean) => void` | required | Change handler |
| `label` | `string` | required | Checkbox label |
| `description` | `string` | — | Additional description |
| `disabled` | `boolean` | `false` | Disable input |
| `id` | `string` | auto-generated | HTML id attribute |

### States

| State | Visual |
|-------|--------|
| Unchecked | Empty box, `--color-muted` @ 40% border |
| Checked | `--color-primary` bg, white checkmark |
| Focus | `--focus-ring` |
| Disabled | `--color-muted` @ 20%, cursor not-allowed |

### Rendered Structure

```html
<label class="checkbox-wrapper" data-disabled={disabled}>
  <input
    type="checkbox"
    id={id}
    class="checkbox-input"
    checked={checked}
    onChange={(e) => onChange(e.target.checked)}
    disabled={disabled}
  />
  <span class="checkbox-box" aria-hidden="true">
    {checked && <CheckIcon />}
  </span>
  <span class="checkbox-content">
    <span class="checkbox-label">{label}</span>
    {description && (
      <span class="checkbox-description">{description}</span>
    )}
  </span>
</label>
```

### Styling

| Property | Value |
|----------|-------|
| Box size | 20px |
| Box border | `border-thin`, `radius-sm` |
| Checkmark | 2px stroke, white |
| Label | `text-base` |
| Description | `text-sm`, `--color-muted` |
| Gap | `space-2` between box and content |
| Clickable area | Full label row |

### Animation

```css
.checkbox-box {
  transition: background-color var(--duration-fast) ease,
              border-color var(--duration-fast) ease;
}

.checkbox-box svg {
  transform: scale(0);
  transition: transform var(--duration-fast) ease;
}

.checkbox-input:checked + .checkbox-box svg {
  transform: scale(1);
}
```

### CSS Implementation

```css
.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  cursor: pointer;
}

.checkbox-wrapper[data-disabled="true"] {
  cursor: not-allowed;
  opacity: 0.5;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-box {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 40%, transparent);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--duration-fast) ease,
              border-color var(--duration-fast) ease;
}

.checkbox-input:checked + .checkbox-box {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.checkbox-box svg {
  width: 14px;
  height: 14px;
  stroke: white;
  stroke-width: 2px;
  transform: scale(0);
  transition: transform var(--duration-fast) ease;
}

.checkbox-input:checked + .checkbox-box svg {
  transform: scale(1);
}

.checkbox-input:focus + .checkbox-box {
  box-shadow: var(--focus-ring);
}

.checkbox-content {
  display: flex;
  flex-direction: column;
}

.checkbox-label {
  font-size: var(--text-base);
}

.checkbox-description {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-top: var(--space-1);
}
```

---

## 4.5 `CheckboxGroup`

Multiple selection from options.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `CheckboxOption[]` | required | Available options |
| `selected` | `string[]` | `[]` | Selected option IDs |
| `onChange` | `(selected: string[]) => void` | required | Change handler |
| `label` | `string` | — | Group label |
| `description` | `string` | — | Group description |
| `disabled` | `boolean` | `false` | Disable all options |
| `columns` | `1 \| 2 \| 3` | `1` | Column layout |
| `id` | `string` | auto-generated | HTML id attribute |

### Types

```typescript
type CheckboxOption = {
  id: string;
  label: string;
  description?: string;
};
```

### Rendered Structure

```html
<fieldset class="checkbox-group" data-columns={columns} disabled={disabled}>
  {label && <legend class="checkbox-group-legend">{label}</legend>}
  {description && <p class="checkbox-group-description">{description}</p>}
  
  <div class="checkbox-group-options">
    {options.map(option => (
      <Checkbox
        key={option.id}
        id={`${id}-${option.id}`}
        checked={selected.includes(option.id)}
        onChange={(checked) => {
          if (checked) {
            onChange([...selected, option.id]);
          } else {
            onChange(selected.filter(id => id !== option.id));
          }
        }}
        label={option.label}
        description={option.description}
        disabled={disabled}
      />
    ))}
  </div>
</fieldset>
```

### Styling

| Property | Value |
|----------|-------|
| Legend | `text-sm`, `font-medium` |
| Description | `text-sm`, `--color-muted`, `margin-top: space-1` |
| Options gap | `space-3` vertical |
| Column gap | `space-6` |

### CSS Implementation

```css
.checkbox-group {
  border: none;
  padding: 0;
  margin: 0;
}

.checkbox-group-legend {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-2);
}

.checkbox-group-description {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-top: var(--space-1);
  margin-bottom: var(--space-3);
}

.checkbox-group-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.checkbox-group[data-columns="2"] .checkbox-group-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3) var(--space-6);
}

.checkbox-group[data-columns="3"] .checkbox-group-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3) var(--space-6);
}

@media (max-width: 767px) {
  .checkbox-group[data-columns="2"] .checkbox-group-options,
  .checkbox-group[data-columns="3"] .checkbox-group-options {
    grid-template-columns: 1fr;
  }
}
```

---

## 4.6 `RadioGroup`

Single selection from options.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `RadioOption[]` | required | Available options |
| `value` | `string \| null` | `null` | Selected option ID |
| `onChange` | `(value: string) => void` | required | Change handler |
| `label` | `string` | — | Group label |
| `description` | `string` | — | Group description |
| `disabled` | `boolean` | `false` | Disable all options |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout direction |
| `id` | `string` | auto-generated | HTML id attribute |

### Types

```typescript
type RadioOption = {
  id: string;
  label: string;
  description?: string;
};
```

### Rendered Structure

```html
<fieldset 
  class="radio-group" 
  data-orientation={orientation}
  disabled={disabled}
>
  {label && <legend class="radio-group-legend">{label}</legend>}
  {description && <p class="radio-group-description">{description}</p>}
  
  <div class="radio-group-options" role="radiogroup">
    {options.map(option => (
      <label 
        key={option.id} 
        class="radio-option"
        data-selected={value === option.id}
      >
        <input
          type="radio"
          name={id}
          value={option.id}
          checked={value === option.id}
          onChange={() => onChange(option.id)}
          disabled={disabled}
        />
        <span class="radio-circle" aria-hidden="true">
          {value === option.id && <span class="radio-dot" />}
        </span>
        <span class="radio-content">
          <span class="radio-label">{option.label}</span>
          {option.description && (
            <span class="radio-description">{option.description}</span>
          )}
        </span>
      </label>
    ))}
  </div>
</fieldset>
```

### Styling

| Property | Value |
|----------|-------|
| Circle size | 20px |
| Dot size | 10px |
| Circle border | `border-medium` |
| Selected circle | `--color-primary` border |
| Dot | `--color-primary` fill |

### Animation

```css
.radio-dot {
  transform: scale(0);
  transition: transform var(--duration-fast) ease;
}

.radio-option[data-selected="true"] .radio-dot {
  transform: scale(1);
}
```

### Keyboard Handling

| Key | Action |
|-----|--------|
| Arrow Up/Left | Select previous option |
| Arrow Down/Right | Select next option |

### CSS Implementation

```css
.radio-group {
  border: none;
  padding: 0;
  margin: 0;
}

.radio-group-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.radio-group[data-orientation="horizontal"] .radio-group-options {
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.radio-option {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  cursor: pointer;
}

.radio-option input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radio-circle {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border: var(--border-medium) solid color-mix(in srgb, var(--color-muted) 40%, transparent);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color var(--duration-fast) ease;
}

.radio-option[data-selected="true"] .radio-circle {
  border-color: var(--color-primary);
}

.radio-dot {
  width: 10px;
  height: 10px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transform: scale(0);
  transition: transform var(--duration-fast) ease;
}

.radio-option[data-selected="true"] .radio-dot {
  transform: scale(1);
}

.radio-option input:focus + .radio-circle {
  box-shadow: var(--focus-ring);
}
```

---

## 4.7 `Select`

Dropdown selection for longer option lists.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `SelectOption[]` | required | Available options |
| `value` | `string \| null` | `null` | Selected option ID |
| `onChange` | `(value: string) => void` | required | Change handler |
| `placeholder` | `string` | `'Select...'` | Placeholder text |
| `label` | `string` | — | Visible label |
| `helperText` | `string` | — | Help text |
| `error` | `string` | — | Error message |
| `disabled` | `boolean` | `false` | Disable select |
| `searchable` | `boolean` | `false` | Enable filtering |
| `id` | `string` | auto-generated | HTML id attribute |

### Types

```typescript
type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};
```

### Rendered Structure

```html
<div class="select-wrapper" data-open={isOpen} data-error={!!error}>
  {label && (
    <label class="select-label" id={`${id}-label`}>{label}</label>
  )}
  
  <button
    class="select-trigger"
    onClick={() => setIsOpen(!isOpen)}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    aria-labelledby={`${id}-label`}
    disabled={disabled}
  >
    <span class="select-value">
      {selectedOption ? selectedOption.label : placeholder}
    </span>
    <ChevronDownIcon class="select-icon" aria-hidden="true" />
  </button>
  
  {isOpen && (
    <div class="select-dropdown" role="listbox" aria-labelledby={`${id}-label`}>
      {searchable && (
        <input
          type="text"
          class="select-search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      )}
      <ul class="select-options">
        {filteredOptions.map(option => (
          <li
            key={option.value}
            class="select-option"
            role="option"
            aria-selected={value === option.value}
            data-selected={value === option.value}
            data-disabled={option.disabled}
            onClick={() => !option.disabled && handleSelect(option.value)}
          >
            {option.label}
            {value === option.value && <CheckIcon aria-hidden="true" />}
          </li>
        ))}
      </ul>
    </div>
  )}
  
  {(helperText || error) && (
    <span class="select-helper" data-error={!!error}>
      {error || helperText}
    </span>
  )}
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Trigger height | 44px |
| Trigger padding | `space-3` vertical, `space-4` horizontal |
| Dropdown max-height | 240px |
| Dropdown position | Below trigger (or above if no space) |
| Option padding | `space-2` vertical, `space-3` horizontal |
| Option hover | `--color-muted` @ 10% bg |
| Selected option | `--color-primary` @ 10% bg, checkmark |

### Animation

| Transition | Value |
|------------|-------|
| Open | Fade in + slide down 4px, `duration-fast` |
| Close | Fade out, `duration-fast` |

### Keyboard Handling

| Key | Action |
|-----|--------|
| Enter/Space | Open dropdown / select option |
| Escape | Close dropdown |
| Arrow Up/Down | Navigate options |
| Home | Focus first option |
| End | Focus last option |
| Type characters | Filter/jump to matching (if searchable) |

### CSS Implementation

```css
.select-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
}

.select-trigger {
  height: 44px;
  padding: var(--space-3) var(--space-4);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-sm);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: border-color var(--duration-fast) ease;
}

.select-trigger:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--color-muted) 50%, transparent);
}

.select-wrapper[data-open="true"] .select-trigger {
  border-color: var(--color-primary);
}

.select-value {
  font-size: var(--text-base);
  color: var(--color-text);
}

.select-trigger:not([data-has-value="true"]) .select-value {
  color: var(--color-muted);
  opacity: 0.6;
}

.select-icon {
  width: 20px;
  height: 20px;
  color: var(--color-muted);
  transition: transform var(--duration-fast) ease;
}

.select-wrapper[data-open="true"] .select-icon {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: var(--space-1);
  background: var(--color-bg);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
  border-radius: var(--radius-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  animation: select-open var(--duration-fast) ease;
}

@keyframes select-open {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.select-search {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: none;
  border-bottom: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 10%, transparent);
  font-size: var(--text-sm);
  background: transparent;
}

.select-options {
  max-height: 240px;
  overflow-y: auto;
  list-style: none;
  padding: var(--space-1) 0;
  margin: 0;
}

.select-option {
  padding: var(--space-2) var(--space-3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color var(--duration-fast) ease;
}

.select-option:hover:not([data-disabled="true"]) {
  background: color-mix(in srgb, var(--color-muted) 10%, transparent);
}

.select-option[data-selected="true"] {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.select-option[data-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
}

.select-option svg {
  width: 16px;
  height: 16px;
  color: var(--color-primary);
}
```

---

## Related Documents

- **Section 1**: Component Philosophy
- **Section 3**: Conversation Components
- **Section 5**: Structured Input Components
- **Design System**: Visual tokens, colors, typography, spacing


# DreamTree Component Specification
## Section 5: Structured Input Components

> Complex inputs: list builders, ranking grids, tag selectors, and SOARED forms.

---

## 5.1 `ListBuilder`

Dynamic list for adding, removing, and optionally reordering items.

### Purpose
Captures variable-length lists — jobs held, skills identified, courses taken, challenge stories.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `ListItem[]` | `[]` | Current list items |
| `onChange` | `(items: ListItem[]) => void` | required | List change handler |
| `label` | `string` | required | Accessible label |
| `placeholder` | `string` | `'Add item...'` | Placeholder for new item input |
| `addLabel` | `string` | `'+ Add another'` | Label for add button |
| `maxItems` | `number` | — | Maximum allowed items |
| `minItems` | `number` | `0` | Minimum required items |
| `reorderable` | `boolean` | `false` | Enable drag-to-reorder |
| `itemType` | `'text' \| 'textarea'` | `'text'` | Input type for items |
| `disabled` | `boolean` | `false` | Disable all interactions |
| `id` | `string` | auto-generated | HTML id attribute |

### Types

```typescript
type ListItem = {
  id: string;
  value: string;
};
```

### Visual Structure

```
List every job you've had:

┌─────────────────────────────────────────────────┐
│ Marketing Coordinator, ABC Corp           [×]  │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ Barista, Local Coffee Shop                [×]  │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ Add item...                                     │
└─────────────────────────────────────────────────┘
[ + Add another ]

3 items
```

### States

| State | Item Border | Background |
|-------|-------------|------------|
| Default | `--color-muted` @ 30% | transparent |
| Hover | `--color-muted` @ 50% | transparent |
| Focus within | `--color-primary` + `--focus-ring` | transparent |
| Dragging | `--color-primary` @ 50% | `--color-primary` @ 5% |
| Drop target | dashed `--color-primary` | `--color-primary` @ 8% |

### Rendered Structure

```html
<div class="list-builder" data-disabled={disabled}>
  <label class="list-builder-label" id={`${id}-label`}>{label}</label>
  
  <ul 
    class="list-builder-items" 
    role="list" 
    aria-labelledby={`${id}-label`}
  >
    {items.map((item, index) => (
      <ListBuilderItem
        key={item.id}
        item={item}
        index={index}
        onUpdate={(value) => updateItem(item.id, value)}
        onRemove={() => removeItem(item.id)}
        onMoveUp={reorderable ? () => moveItem(index, index - 1) : undefined}
        onMoveDown={reorderable ? () => moveItem(index, index + 1) : undefined}
        reorderable={reorderable}
        itemType={itemType}
        disabled={disabled}
        canMoveUp={index > 0}
        canMoveDown={index < items.length - 1}
        canRemove={items.length > minItems}
      />
    ))}
  </ul>
  
  {(!maxItems || items.length < maxItems) && (
    <div class="list-builder-add">
      <input
        type="text"
        class="list-builder-add-input"
        placeholder={placeholder}
        value={newItemValue}
        onChange={(e) => setNewItemValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && addItem()}
        disabled={disabled}
      />
    </div>
  )}
  
  {(!maxItems || items.length < maxItems) && (
    <button 
      class="list-builder-add-button"
      onClick={addItem}
      disabled={disabled || !newItemValue.trim()}
    >
      {addLabel}
    </button>
  )}
  
  {maxItems && (
    <span class="list-builder-count">
      {items.length}{maxItems ? ` / ${maxItems}` : ''} items
    </span>
  )}
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Max width | 720px |
| Item padding | `space-3` vertical, `space-4` horizontal |
| Item border | `border-thin`, `radius-sm` |
| Item gap | `space-2` |
| Remove button | Icon-only, 24px, `--color-muted`, hover `--color-error` |
| Add button | Text button, `--color-primary`, `font-medium` |
| Counter | `text-xs`, `--color-muted`, right-aligned |

### Animations

| Action | Animation |
|--------|-----------|
| Add item | Fade in + slide down, `duration-normal` |
| Remove item | Fade out + collapse height, `duration-normal` |
| Reorder | Item follows cursor, others shift with `duration-fast` |

### Keyboard Handling

| Key | Context | Action |
|-----|---------|--------|
| Enter | In add input | Add new item, clear input |
| Delete/Backspace | On item (not editing) | Remove item |
| Arrow Up/Down | On item | Move focus |
| Alt + Arrow Up/Down | On item | Move item (if reorderable) |

### CSS Implementation

```css
.list-builder {
  display: flex;
  flex-direction: column;
  max-width: 720px;
}

.list-builder-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-2);
}

.list-builder-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-builder-add {
  margin-top: var(--space-2);
}

.list-builder-add-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: var(--border-thin) dashed color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  background: transparent;
}

.list-builder-add-input:focus {
  outline: none;
  border-style: solid;
  border-color: var(--color-primary);
}

.list-builder-add-button {
  margin-top: var(--space-2);
  padding: var(--space-2) 0;
  background: none;
  border: none;
  color: var(--color-primary);
  font-weight: var(--font-medium);
  cursor: pointer;
}

.list-builder-add-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.list-builder-count {
  font-size: var(--text-xs);
  color: var(--color-muted);
  text-align: right;
  margin-top: var(--space-2);
}

/* Item animations */
@keyframes list-item-enter {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.list-builder-item-enter {
  animation: list-item-enter var(--duration-normal) ease;
}
```

---

## 5.2 `ListBuilderItem`

Individual item within a ListBuilder.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `item` | `ListItem` | required | Item data |
| `index` | `number` | required | Position in list |
| `onUpdate` | `(value: string) => void` | required | Edit handler |
| `onRemove` | `() => void` | required | Remove handler |
| `onMoveUp` | `() => void` | — | Move up handler |
| `onMoveDown` | `() => void` | — | Move down handler |
| `reorderable` | `boolean` | `false` | Show reorder controls |
| `itemType` | `'text' \| 'textarea'` | `'text'` | Input type when editing |
| `disabled` | `boolean` | `false` | Disable interactions |
| `canMoveUp` | `boolean` | `true` | Enable move up |
| `canMoveDown` | `boolean` | `true` | Enable move down |
| `canRemove` | `boolean` | `true` | Enable remove |

### States

| State | Behavior |
|-------|----------|
| Display | Shows value as text, hover reveals actions |
| Editing | Inline input replaces text, save on blur/enter |
| Dragging | Elevated appearance, follows cursor |

### Rendered Structure

```html
<li 
  class="list-builder-item"
  data-dragging={isDragging}
  draggable={reorderable && !disabled}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
>
  {reorderable && (
    <button 
      class="list-builder-item-handle"
      aria-label="Drag to reorder"
      disabled={disabled}
    >
      <GripVerticalIcon />
    </button>
  )}
  
  <div class="list-builder-item-content">
    {isEditing ? (
      itemType === 'textarea' ? (
        <textarea
          class="list-builder-item-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && saveEdit()}
          autoFocus
        />
      ) : (
        <input
          type="text"
          class="list-builder-item-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
          autoFocus
        />
      )
    ) : (
      <span 
        class="list-builder-item-value"
        onClick={() => !disabled && setIsEditing(true)}
      >
        {item.value}
      </span>
    )}
  </div>
  
  <div class="list-builder-item-actions">
    {reorderable && (
      <>
        <button
          class="list-builder-item-action"
          onClick={onMoveUp}
          disabled={disabled || !canMoveUp}
          aria-label="Move up"
        >
          <ChevronUpIcon />
        </button>
        <button
          class="list-builder-item-action"
          onClick={onMoveDown}
          disabled={disabled || !canMoveDown}
          aria-label="Move down"
        >
          <ChevronDownIcon />
        </button>
      </>
    )}
    {canRemove && (
      <button
        class="list-builder-item-action list-builder-item-remove"
        onClick={onRemove}
        disabled={disabled}
        aria-label="Remove item"
      >
        <XIcon />
      </button>
    )}
  </div>
</li>
```

### Styling

| Property | Value |
|----------|-------|
| Min height | 44px |
| Padding | `space-3` vertical, `space-4` horizontal |
| Border | `border-thin`, `radius-sm` |
| Handle | 20px, `--color-muted`, cursor grab |
| Actions | Hidden by default, visible on hover/focus |
| Remove hover | `--color-error` |

### CSS Implementation

```css
.list-builder-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 44px;
  padding: var(--space-3) var(--space-4);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-sm);
  transition: border-color var(--duration-fast) ease,
              background-color var(--duration-fast) ease;
}

.list-builder-item:hover {
  border-color: color-mix(in srgb, var(--color-muted) 50%, transparent);
}

.list-builder-item:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.list-builder-item[data-dragging="true"] {
  border-color: color-mix(in srgb, var(--color-primary) 50%, transparent);
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
  cursor: grabbing;
}

.list-builder-item-handle {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: grab;
}

.list-builder-item-content {
  flex: 1;
  min-width: 0;
}

.list-builder-item-value {
  display: block;
  cursor: text;
}

.list-builder-item-input {
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  font-size: inherit;
  font-family: inherit;
  color: inherit;
}

.list-builder-item-input:focus {
  outline: none;
}

.list-builder-item-actions {
  display: flex;
  gap: var(--space-1);
  opacity: 0;
  transition: opacity var(--duration-fast) ease;
}

.list-builder-item:hover .list-builder-item-actions,
.list-builder-item:focus-within .list-builder-item-actions {
  opacity: 1;
}

.list-builder-item-action {
  width: 24px;
  height: 24px;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: color var(--duration-fast) ease,
              background-color var(--duration-fast) ease;
}

.list-builder-item-action:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-muted) 10%, transparent);
}

.list-builder-item-remove:hover:not(:disabled) {
  color: var(--color-error);
}

.list-builder-item-action:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
```

---

## 5.3 `RankingGrid`

Pairwise comparison tool for ranking items.

### Purpose
Helps users rank items by comparing two at a time. More accurate than direct ranking for subjective preferences. Uses comparison-based sorting algorithm requiring ~n*log(n) comparisons.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `RankingItem[]` | required | Items to rank |
| `comparisons` | `Comparison[]` | `[]` | Completed comparisons |
| `onCompare` | `(winner: string, loser: string) => void` | required | Comparison handler |
| `onComplete` | `(ranked: RankingItem[]) => void` | required | Completion handler |
| `label` | `string` | required | Tool label |
| `description` | `string` | — | Instructions |
| `id` | `string` | auto-generated | HTML id attribute |

### Types

```typescript
type RankingItem = {
  id: string;
  value: string;
};

type Comparison = {
  winner: string;
  loser: string;
  timestamp: Date;
};
```

### Visual Structure

```
Which is more important to you?

┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│    Teaching     │ vs  │   Negotiating   │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
      [Choose]               [Choose]


Progress: ●●●●●●○○○○○○○ 6 of 13 comparisons

─────────────────────────────────────────────

Current ranking (updates as you compare):

1. Problem Solving
2. Teaching
3. Communication
...
```

### Rendered Structure

```html
<div class="ranking-grid">
  <p class="ranking-grid-prompt">{label}</p>
  {description && <p class="ranking-grid-description">{description}</p>}
  
  <div class="ranking-grid-comparison">
    <RankingPair
      item={currentPair[0]}
      onSelect={() => handleSelect(currentPair[0].id, currentPair[1].id)}
      position="left"
    />
    
    <span class="ranking-grid-vs" aria-hidden="true">vs</span>
    
    <RankingPair
      item={currentPair[1]}
      onSelect={() => handleSelect(currentPair[1].id, currentPair[0].id)}
      position="right"
    />
  </div>
  
  <div class="ranking-grid-progress">
    <div class="ranking-grid-progress-bar">
      <div 
        class="ranking-grid-progress-fill"
        style={{ width: `${(comparisons.length / totalComparisons) * 100}%` }}
      />
    </div>
    <span class="ranking-grid-progress-text">
      {comparisons.length} of {totalComparisons} comparisons
    </span>
  </div>
  
  {currentRanking.length > 0 && (
    <div class="ranking-grid-current">
      <h4 class="ranking-grid-current-title">
        Current ranking (updates as you compare):
      </h4>
      <ol class="ranking-grid-current-list">
        {currentRanking.map((item, index) => (
          <li key={item.id}>{item.value}</li>
        ))}
      </ol>
    </div>
  )}
</div>
```

### Keyboard Handling

| Key | Action |
|-----|--------|
| Arrow Left/Right | Focus left/right option |
| Enter/Space | Select focused option |
| 1 | Select left option |
| 2 | Select right option |

### Animations

| Action | Animation |
|--------|-----------|
| New pair | Fade in from edges |
| Selection | Winner pulses, loser fades |
| Ranking update | Items shift smoothly |

### CSS Implementation

```css
.ranking-grid {
  max-width: 720px;
}

.ranking-grid-prompt {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  text-align: center;
  margin-bottom: var(--space-2);
}

.ranking-grid-description {
  font-size: var(--text-sm);
  color: var(--color-muted);
  text-align: center;
  margin-bottom: var(--space-6);
}

.ranking-grid-comparison {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
}

.ranking-grid-vs {
  font-size: var(--text-sm);
  color: var(--color-muted);
  font-weight: var(--font-medium);
}

.ranking-grid-progress {
  margin-top: var(--space-6);
  text-align: center;
}

.ranking-grid-progress-bar {
  height: 4px;
  background: color-mix(in srgb, var(--color-muted) 20%, transparent);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-2);
}

.ranking-grid-progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width var(--duration-normal) ease;
}

.ranking-grid-progress-text {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.ranking-grid-current {
  margin-top: var(--space-6);
  padding-top: var(--space-6);
  border-top: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
}

.ranking-grid-current-title {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-bottom: var(--space-3);
}

.ranking-grid-current-list {
  padding-left: var(--space-4);
}

.ranking-grid-current-list li {
  padding: var(--space-1) 0;
}

/* Pair entrance animation */
@keyframes pair-enter-left {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pair-enter-right {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

---

## 5.4 `RankingPair`

Single option card in a pairwise comparison.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `item` | `RankingItem` | required | Item to display |
| `onSelect` | `() => void` | required | Selection handler |
| `position` | `'left' \| 'right'` | required | Position in pair |
| `disabled` | `boolean` | `false` | Disable selection |

### States

| State | Border | Background |
|-------|--------|------------|
| Default | `--color-muted` @ 30% | transparent |
| Hover | `--color-primary` @ 50% | `--color-primary` @ 5% |
| Focus | `--color-primary` + `--focus-ring` | `--color-primary` @ 5% |
| Selected | `--color-primary` | `--color-primary` @ 10% |

### Rendered Structure

```html
<button
  class="ranking-pair"
  data-position={position}
  onClick={onSelect}
  disabled={disabled}
>
  <span class="ranking-pair-value">{item.value}</span>
  <span class="ranking-pair-action">Choose</span>
</button>
```

### Styling

| Property | Value |
|----------|-------|
| Width | 200px (desktop), 140px (mobile) |
| Min height | 100px |
| Padding | `space-4` |
| Border | `border-thin`, `radius-md` |
| Value | `text-base`, `font-medium`, centered |
| Action | `text-sm`, `--color-primary`, `margin-top: space-2` |

### CSS Implementation

```css
.ranking-pair {
  width: 200px;
  min-height: 100px;
  padding: var(--space-4);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-md);
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  cursor: pointer;
  transition: border-color var(--duration-fast) ease,
              background-color var(--duration-fast) ease,
              transform var(--duration-fast) ease;
}

.ranking-pair:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--color-primary) 50%, transparent);
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
}

.ranking-pair:focus {
  outline: none;
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
  box-shadow: var(--focus-ring);
}

.ranking-pair:active:not(:disabled) {
  transform: scale(0.98);
}

.ranking-pair-value {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  text-align: center;
}

.ranking-pair-action {
  font-size: var(--text-sm);
  color: var(--color-primary);
}

@media (max-width: 767px) {
  .ranking-pair {
    width: 140px;
    min-height: 80px;
    padding: var(--space-3);
  }
  
  .ranking-pair-value {
    font-size: var(--text-sm);
  }
}
```

---

## 5.5 `TagSelector`

Select multiple tags from predefined options.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Tag[]` | required | Available tags |
| `selected` | `string[]` | `[]` | Selected tag IDs |
| `onChange` | `(selected: string[]) => void` | required | Selection handler |
| `label` | `string` | required | Accessible label |
| `description` | `string` | — | Help text |
| `maxSelections` | `number` | — | Maximum selections |
| `searchable` | `boolean` | `false` | Enable filtering |
| `disabled` | `boolean` | `false` | Disable interactions |
| `id` | `string` | auto-generated | HTML id attribute |

### Types

```typescript
type Tag = {
  id: string;
  label: string;
  category?: string;
};
```

### States

| State | Border | Background | Text |
|-------|--------|------------|------|
| Default | `--color-muted` @ 30% | transparent | `--color-text` |
| Hover | `--color-muted` @ 50% | transparent | `--color-text` |
| Selected | `--color-primary` | `--color-primary` @ 10% | `--color-text` |
| Disabled | `--color-muted` @ 15% | transparent | `--color-muted` |

### Rendered Structure

```html
<div class="tag-selector" data-disabled={disabled}>
  <label class="tag-selector-label" id={`${id}-label`}>{label}</label>
  {description && <p class="tag-selector-description">{description}</p>}
  
  {searchable && (
    <input
      type="text"
      class="tag-selector-search"
      placeholder="Search tags..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  )}
  
  <div 
    class="tag-selector-options"
    role="listbox"
    aria-labelledby={`${id}-label`}
    aria-multiselectable="true"
  >
    {filteredOptions.map(tag => (
      <button
        key={tag.id}
        class="tag-selector-tag"
        role="option"
        aria-selected={selected.includes(tag.id)}
        data-selected={selected.includes(tag.id)}
        onClick={() => toggleTag(tag.id)}
        disabled={disabled || (maxSelections && selected.length >= maxSelections && !selected.includes(tag.id))}
      >
        {tag.label}
        {selected.includes(tag.id) && <CheckIcon aria-hidden="true" />}
      </button>
    ))}
  </div>
  
  {maxSelections && (
    <span class="tag-selector-count">
      {selected.length} of {maxSelections} selected
    </span>
  )}
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Layout | Flexbox, wrap, `gap: space-2` |
| Tag padding | `space-2` vertical, `space-3` horizontal |
| Tag border | `border-thin`, `radius-full` (pill) |
| Checkmark | 14px, `margin-left: space-1` |

### CSS Implementation

```css
.tag-selector {
  display: flex;
  flex-direction: column;
}

.tag-selector-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-2);
}

.tag-selector-description {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-bottom: var(--space-3);
}

.tag-selector-search {
  margin-bottom: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
}

.tag-selector-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tag-selector-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-full);
  background: transparent;
  font-size: var(--text-sm);
  cursor: pointer;
  transition: border-color var(--duration-fast) ease,
              background-color var(--duration-fast) ease;
}

.tag-selector-tag:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--color-muted) 50%, transparent);
}

.tag-selector-tag[data-selected="true"] {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.tag-selector-tag:focus {
  outline: none;
  box-shadow: var(--focus-ring);
}

.tag-selector-tag:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tag-selector-tag svg {
  width: 14px;
  height: 14px;
}

.tag-selector-count {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-top: var(--space-2);
}
```

---

## 5.6 `SkillTagger`

Specialized tag selector for linking skills to SOARED stories.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `skills` | `Skill[]` | required | User's skill inventory |
| `selectedSkillIds` | `string[]` | `[]` | Currently tagged skills |
| `onChange` | `(skillIds: string[]) => void` | required | Selection handler |
| `storyTitle` | `string` | required | Story being tagged |
| `suggestedSkillIds` | `string[]` | `[]` | AI-suggested skills (Phase 4+) |
| `disabled` | `boolean` | `false` | Disable interactions |
| `id` | `string` | auto-generated | HTML id attribute |

### Types

```typescript
type Skill = {
  id: string;
  name: string;
  type: 'transferable' | 'self-management' | 'knowledge';
  mastery: number;
};
```

### Behavior

- Groups skills by type (transferable, self-management, knowledge)
- No maximum limit
- Search/filter available
- AI suggestions highlighted with subtle border glow (Phase 4+)

### Rendered Structure

```html
<div class="skill-tagger" data-disabled={disabled}>
  <label class="skill-tagger-label">
    Tag skills demonstrated in "{storyTitle}"
  </label>
  
  <input
    type="text"
    class="skill-tagger-search"
    placeholder="Search skills..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
  
  {Object.entries(groupedSkills).map(([type, skills]) => (
    <div key={type} class="skill-tagger-group">
      <h4 class="skill-tagger-group-title">{formatSkillType(type)}</h4>
      <div class="skill-tagger-options">
        {skills.map(skill => (
          <button
            key={skill.id}
            class="skill-tagger-skill"
            data-selected={selectedSkillIds.includes(skill.id)}
            data-suggested={suggestedSkillIds.includes(skill.id)}
            onClick={() => toggleSkill(skill.id)}
            disabled={disabled}
          >
            {skill.name}
            {selectedSkillIds.includes(skill.id) && <CheckIcon />}
          </button>
        ))}
      </div>
    </div>
  ))}
</div>
```

### CSS for Suggested Skills

```css
.skill-tagger-skill[data-suggested="true"] {
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-primary) 30%, transparent),
              0 0 8px color-mix(in srgb, var(--color-primary) 20%, transparent);
}
```

---

## 5.7 `SOAREDForm`

Structured form for SOARED story capture.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `SOAREDStory` | `{}` | Current story data |
| `onChange` | `(story: SOAREDStory) => void` | required | Change handler |
| `onComplete` | `() => void` | — | Completion handler |
| `title` | `string` | — | Optional story title |
| `onTitleChange` | `(title: string) => void` | — | Title change handler |
| `disabled` | `boolean` | `false` | Disable inputs |
| `id` | `string` | auto-generated | HTML id attribute |

### Types

```typescript
type SOAREDStory = {
  situation?: string;
  obstacle?: string;
  action?: string;
  result?: string;
  evaluation?: string;
  discovery?: string;
};
```

### Section Definitions

| Letter | Label | Prompt | Min Rows |
|--------|-------|--------|----------|
| S | Situation | Describe the situation you were in. | 2 |
| O | Obstacle | Describe the obstacle or problem you faced. | 2 |
| A | Action | Describe your action: the step-by-step process. | 4 |
| R | Result | Describe the result of your actions. | 2 |
| E | Evaluation | Your self-evaluation and/or how others received it. | 2 |
| D | Discovery | Describe what you discovered from the process. | 2 |

### Visual Structure

```
Story Title (optional)
┌─────────────────────────────────────────────────┐
│ The time I turned around a failing project      │
└─────────────────────────────────────────────────┘

┌─S─┐ Situation
│   │ ┌─────────────────────────────────────────┐
└───┘ │ I was brought in mid-project when...    │
      └─────────────────────────────────────────┘

┌─O─┐ Obstacle
│   │ ┌─────────────────────────────────────────┐
└───┘ │ The team morale was low and...          │
      └─────────────────────────────────────────┘

... etc
```

### Rendered Structure

```html
<div class="soared-form" data-disabled={disabled}>
  {onTitleChange && (
    <div class="soared-form-title">
      <TextInput
        label="Story Title (optional)"
        value={title}
        onChange={onTitleChange}
        placeholder="Give this story a memorable name..."
        disabled={disabled}
      />
    </div>
  )}
  
  {sections.map(section => (
    <div key={section.key} class="soared-form-section">
      <div class="soared-form-section-header">
        <span class="soared-form-letter">{section.letter}</span>
        <span class="soared-form-section-label">{section.label}</span>
      </div>
      <TextArea
        value={value[section.key] || ''}
        onChange={(v) => onChange({ ...value, [section.key]: v })}
        placeholder={section.prompt}
        minRows={section.minRows}
        disabled={disabled}
      />
    </div>
  ))}
  
  {isComplete && onComplete && (
    <Button variant="primary" onClick={onComplete}>
      Save Story
    </Button>
  )}
</div>
```

### Section Configuration

```typescript
const sections = [
  { key: 'situation', letter: 'S', label: 'Situation', prompt: 'Describe the situation you were in.', minRows: 2 },
  { key: 'obstacle', letter: 'O', label: 'Obstacle', prompt: 'Describe the obstacle or problem you faced.', minRows: 2 },
  { key: 'action', letter: 'A', label: 'Action', prompt: 'Describe your action: the step-by-step process.', minRows: 4 },
  { key: 'result', letter: 'R', label: 'Result', prompt: 'Describe the result of your actions.', minRows: 2 },
  { key: 'evaluation', letter: 'E', label: 'Evaluation', prompt: 'Your self-evaluation and/or how others received it.', minRows: 2 },
  { key: 'discovery', letter: 'D', label: 'Discovery', prompt: 'Describe what you discovered from the process.', minRows: 2 },
];

const isComplete = sections.every(s => value[s.key]?.trim());
```

### Styling

| Property | Value |
|----------|-------|
| Section spacing | `space-6` |
| Letter badge | 32px circle, `--color-primary` @ 15% bg, `--color-primary` text, `font-semibold` |
| Section label | `text-base`, `font-medium` |
| Section header gap | `space-2` |

### CSS Implementation

```css
.soared-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.soared-form-title {
  margin-bottom: var(--space-2);
}

.soared-form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.soared-form-section-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.soared-form-letter {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.soared-form-section-label {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
}
```

---

## Related Documents

- **Section 1**: Component Philosophy
- **Section 4**: Form Input Components
- **Section 6**: Feedback & Status Components
- **Design System**: Visual tokens, colors, typography, spacing


# DreamTree Component Specification
## Section 6: Feedback & Status Components

> Buttons, toasts, tooltips, save indicators, progress markers, badges, and empty states.

---

## 6.1 `Button`

Primary interactive element for actions.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Button content |
| `variant` | `ButtonVariant` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `icon` | `IconComponent` | — | Optional icon |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon placement |
| `iconOnly` | `boolean` | `false` | Icon-only button |
| `loading` | `boolean` | `false` | Show loading state |
| `disabled` | `boolean` | `false` | Disable button |
| `fullWidth` | `boolean` | `false` | Expand to container |
| `type` | `'button' \| 'submit'` | `'button'` | HTML button type |
| `onClick` | `() => void` | — | Click handler |
| `ariaLabel` | `string` | — | Accessible label |

### Types

```typescript
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
```

### Variants

| Variant | Use Case | Default | Hover |
|---------|----------|---------|-------|
| `primary` | Main actions | `--color-primary` bg | Darken 10% |
| `secondary` | Secondary actions | Transparent, `--color-primary` border | `--color-primary` @ 8% bg |
| `ghost` | Tertiary actions | Transparent | `--color-muted` @ 10% bg |
| `danger` | Destructive actions | `--color-error` bg | Darken 10% |

### Sizes

| Size | Height | Padding | Font | Icon |
|------|--------|---------|------|------|
| `sm` | 32px | `space-3` horizontal | `text-sm` | 16px |
| `md` | 44px | `space-4` horizontal | `text-base` | 20px |
| `lg` | 52px | `space-5` horizontal | `text-lg` | 24px |

### States

| State | Treatment |
|-------|-----------|
| Default | Per variant |
| Hover | Per variant |
| Focus | + `--focus-ring` |
| Active | Scale 0.98 |
| Loading | Spinner replaces content, pointer-events none |
| Disabled | 50% opacity, cursor not-allowed |

### Rendered Structure

```html
<button
  class="button"
  data-variant={variant}
  data-size={size}
  data-icon-only={iconOnly}
  data-loading={loading}
  data-full-width={fullWidth}
  type={type}
  onClick={onClick}
  disabled={disabled || loading}
  aria-label={ariaLabel || (iconOnly ? children : undefined)}
  aria-busy={loading}
>
  {loading ? (
    <span class="button-spinner" aria-hidden="true">
      <Spinner size={size === 'sm' ? 14 : size === 'lg' ? 22 : 18} />
    </span>
  ) : (
    <>
      {icon && iconPosition === 'left' && (
        <span class="button-icon" aria-hidden="true"><Icon /></span>
      )}
      {!iconOnly && <span class="button-label">{children}</span>}
      {icon && iconPosition === 'right' && (
        <span class="button-icon" aria-hidden="true"><Icon /></span>
      )}
    </>
  )}
</button>
```

---

## 6.2 `Toast`

Transient notification messages.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | required | Toast content |
| `type` | `ToastType` | `'info'` | Toast style |
| `duration` | `number` | `4000` | Display duration (ms) |
| `action` | `ToastAction` | — | Optional action button |
| `onDismiss` | `() => void` | — | Dismiss callback |
| `id` | `string` | auto-generated | Unique identifier |

### Types

```typescript
type ToastType = 'info' | 'success' | 'warning' | 'error';

type ToastAction = {
  label: string;
  onClick: () => void;
};
```

### Type Styling

| Type | Icon | Accent |
|------|------|--------|
| `info` | Info circle | `--color-primary` |
| `success` | Checkmark | `--color-success` |
| `warning` | Warning triangle | `--color-warning` |
| `error` | X circle | `--color-error` |

### Behavior

- Auto-dismisses after duration (default 4s)
- Pause timer on hover
- Maximum 3 toasts visible at once
- Stacks with `space-2` gap

### Rendered Structure

```html
<div
  class="toast"
  data-type={type}
  role="alert"
  aria-live="polite"
  onMouseEnter={pauseTimer}
  onMouseLeave={resumeTimer}
>
  <span class="toast-icon" aria-hidden="true">
    <TypeIcon />
  </span>
  <span class="toast-message">{message}</span>
  {action && (
    <button class="toast-action" onClick={action.onClick}>
      {action.label}
    </button>
  )}
  <button 
    class="toast-dismiss" 
    onClick={onDismiss}
    aria-label="Dismiss"
  >
    <XIcon />
  </button>
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Position | Fixed, bottom-right (desktop), bottom-center (mobile) |
| Width | Auto, max 400px |
| Padding | `space-3` |
| Border-left | 3px, accent color |
| Shadow | `0 4px 12px rgba(0, 0, 0, 0.15)` |
| Z-index | 60 |

---

## 6.3 `ToastContainer`

Manager for multiple toasts.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `toasts` | `Toast[]` | `[]` | Active toasts |
| `onDismiss` | `(id: string) => void` | required | Dismiss handler |
| `position` | `ToastPosition` | `'bottom-right'` | Position |

### Types

```typescript
type ToastPosition = 'bottom-right' | 'bottom-center' | 'top-right' | 'top-center';
```

### Rendered Structure

```html
<div class="toast-container" data-position={position}>
  {toasts.slice(0, 3).map(toast => (
    <Toast
      key={toast.id}
      {...toast}
      onDismiss={() => onDismiss(toast.id)}
    />
  ))}
</div>
```

### CSS Implementation

```css
.toast-container {
  position: fixed;
  z-index: 60;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  pointer-events: none;
}

.toast-container > * {
  pointer-events: auto;
}

.toast-container[data-position="bottom-right"] {
  bottom: var(--space-4);
  right: var(--space-4);
}

.toast-container[data-position="bottom-center"] {
  bottom: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
}

.toast-container[data-position="top-right"] {
  top: var(--space-4);
  right: var(--space-4);
}

.toast-container[data-position="top-center"] {
  top: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
}

@media (max-width: 767px) {
  .toast-container {
    left: var(--space-4);
    right: var(--space-4);
    transform: none;
  }
  
  .toast-container[data-position="bottom-right"],
  .toast-container[data-position="bottom-center"] {
    bottom: calc(56px + var(--space-4)); /* Above mobile nav */
  }
}
```

---

## 6.4 `Tooltip`

Contextual information on hover/focus.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string \| ReactNode` | required | Tooltip content |
| `children` | `ReactNode` | required | Trigger element |
| `position` | `TooltipPosition` | `'top'` | Preferred position |
| `delay` | `number` | `300` | Show delay (ms) |
| `disabled` | `boolean` | `false` | Disable tooltip |
| `id` | `string` | auto-generated | HTML id |

### Types

```typescript
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
```

### Behavior

- Mouse enter starts delay timer
- Focus shows immediately
- Escape key hides
- Scroll hides
- Position flips if no space

### Rendered Structure

```html
<div class="tooltip-wrapper">
  <div
    class="tooltip-trigger"
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
    onFocus={handleFocus}
    onBlur={handleBlur}
    aria-describedby={isVisible ? id : undefined}
  >
    {children}
  </div>
  
  {isVisible && (
    <div
      id={id}
      class="tooltip"
      data-position={actualPosition}
      role="tooltip"
    >
      {content}
    </div>
  )}
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Background | `--color-text` (inverted) |
| Text | `--color-bg`, `text-sm` |
| Padding | `space-2` vertical, `space-3` horizontal |
| Border radius | `radius-sm` |
| Max width | 240px |
| Animation | Fade in, `duration-fast` |

### CSS Implementation

```css
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: absolute;
  z-index: 100;
  padding: var(--space-2) var(--space-3);
  background: var(--color-text);
  color: var(--color-bg);
  font-size: var(--text-sm);
  border-radius: var(--radius-sm);
  max-width: 240px;
  white-space: normal;
  animation: tooltip-fade-in var(--duration-fast) ease;
}

@keyframes tooltip-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.tooltip[data-position="top"] {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: var(--space-2);
}

.tooltip[data-position="bottom"] {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: var(--space-2);
}

.tooltip[data-position="left"] {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: var(--space-2);
}

.tooltip[data-position="right"] {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: var(--space-2);
}
```

---

## 6.5 `SaveIndicator`

Subtle auto-save confirmation.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `SaveStatus` | `'idle'` | Current state |
| `lastSaved` | `Date` | — | Last save time |

### Types

```typescript
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
```

### States

| Status | Display |
|--------|---------|
| `idle` | Nothing shown |
| `saving` | Spinner + "Saving..." |
| `saved` | Checkmark + "Saved" (fades after 2s) |
| `error` | Warning icon + "Save failed" + retry button |

### Rendered Structure

```html
<div class="save-indicator" data-status={status} aria-live="polite">
  {status === 'saving' && (
    <>
      <Spinner size={12} />
      <span>Saving...</span>
    </>
  )}
  
  {status === 'saved' && (
    <>
      <CheckIcon />
      <span>Saved</span>
    </>
  )}
  
  {status === 'error' && (
    <>
      <WarningIcon />
      <span>Save failed</span>
      <button class="save-indicator-retry" onClick={onRetry}>
        Retry
      </button>
    </>
  )}
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Font | `text-xs` |
| Color | `--color-muted` |
| Opacity | 70% |
| Icon size | 12px |
| Gap | `space-1` |

### CSS Implementation

```css
.save-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-muted);
  opacity: 0.7;
}

.save-indicator[data-status="idle"] {
  display: none;
}

.save-indicator[data-status="saved"] {
  animation: save-indicator-fade 2s ease forwards;
}

@keyframes save-indicator-fade {
  0%, 70% { opacity: 0.7; }
  100% { opacity: 0; }
}

.save-indicator[data-status="error"] {
  color: var(--color-error);
}

.save-indicator svg {
  width: 12px;
  height: 12px;
}

.save-indicator-retry {
  margin-left: var(--space-2);
  padding: 0;
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: var(--text-xs);
  text-decoration: underline;
  cursor: pointer;
}
```

---

## 6.6 `ProgressMarker`

Completion indicator for activities/exercises.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `ProgressStatus` | `'incomplete'` | State |
| `size` | `'sm' \| 'md'` | `'md'` | Size |

### Types

```typescript
type ProgressStatus = 'incomplete' | 'in-progress' | 'complete';
```

### States

| Status | Visual |
|--------|--------|
| `incomplete` | Empty circle, `--color-muted` @ 30% border |
| `in-progress` | Circle with center dot, `--color-primary` @ 50% |
| `complete` | Filled circle + checkmark, `--color-primary` |

### Sizes

| Size | Diameter |
|------|----------|
| `sm` | 16px |
| `md` | 20px |

### Rendered Structure

```html
<span 
  class="progress-marker" 
  data-status={status}
  data-size={size}
  role="img"
  aria-label={getAriaLabel(status)}
>
  {status === 'complete' && <CheckIcon />}
  {status === 'in-progress' && <span class="progress-marker-dot" />}
</span>
```

### Animation

```css
/* Checkmark draws in */
@keyframes checkmark-draw {
  from {
    stroke-dashoffset: 20;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.progress-marker[data-status="complete"] svg {
  stroke-dasharray: 20;
  animation: checkmark-draw var(--duration-normal) ease forwards;
}
```

### CSS Implementation

```css
.progress-marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.progress-marker[data-size="sm"] {
  width: 16px;
  height: 16px;
}

.progress-marker[data-size="md"] {
  width: 20px;
  height: 20px;
}

.progress-marker[data-status="incomplete"] {
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
}

.progress-marker[data-status="in-progress"] {
  border: var(--border-thin) solid color-mix(in srgb, var(--color-primary) 50%, transparent);
}

.progress-marker-dot {
  width: 6px;
  height: 6px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
}

.progress-marker[data-status="complete"] {
  background: var(--color-primary);
}

.progress-marker[data-status="complete"] svg {
  width: 12px;
  height: 12px;
  stroke: white;
  stroke-width: 2px;
}
```

---

## 6.7 `Badge`

Small status indicator or count.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Badge content |
| `variant` | `BadgeVariant` | `'default'` | Style |
| `size` | `'sm' \| 'md'` | `'md'` | Size |

### Types

```typescript
type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';
```

### Variants

| Variant | Background | Text |
|---------|------------|------|
| `default` | `--color-muted` @ 15% | `--color-text` |
| `primary` | `--color-primary` @ 15% | `--color-primary` |
| `success` | `--color-success` @ 15% | `--color-success` |
| `warning` | `--color-warning` @ 15% | `--color-warning` |
| `error` | `--color-error` @ 15% | `--color-error` |

### Sizes

| Size | Height | Font |
|------|--------|------|
| `sm` | 18px | `text-xs` |
| `md` | 22px | `text-xs` |

### Rendered Structure

```html
<span 
  class="badge" 
  data-variant={variant}
  data-size={size}
>
  {children}
</span>
```

### CSS Implementation

```css
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  white-space: nowrap;
}

.badge[data-size="sm"] {
  height: 18px;
}

.badge[data-size="md"] {
  height: 22px;
}

.badge[data-variant="default"] {
  background: color-mix(in srgb, var(--color-muted) 15%, transparent);
  color: var(--color-text);
}

.badge[data-variant="primary"] {
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
}

.badge[data-variant="success"] {
  background: color-mix(in srgb, var(--color-success) 15%, transparent);
  color: var(--color-success);
}

.badge[data-variant="warning"] {
  background: color-mix(in srgb, var(--color-warning) 15%, transparent);
  color: var(--color-warning);
}

.badge[data-variant="error"] {
  background: color-mix(in srgb, var(--color-error) 15%, transparent);
  color: var(--color-error);
}
```

---

## 6.8 `EmptyState`

Placeholder for empty content areas.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `IconComponent` | — | Illustrative icon |
| `title` | `string` | required | Heading |
| `description` | `string` | — | Explanatory text |
| `action` | `EmptyStateAction` | — | CTA button |

### Types

```typescript
type EmptyStateAction = {
  label: string;
  onClick: () => void;
};
```

### Rendered Structure

```html
<div class="empty-state">
  {icon && (
    <span class="empty-state-icon" aria-hidden="true">
      <Icon />
    </span>
  )}
  <h3 class="empty-state-title">{title}</h3>
  {description && (
    <p class="empty-state-description">{description}</p>
  )}
  {action && (
    <Button 
      variant="primary" 
      onClick={action.onClick}
      class="empty-state-action"
    >
      {action.label}
    </Button>
  )}
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Layout | Flex column, centered |
| Max width | 320px |
| Text align | Center |
| Icon | 48px, `--color-muted` @ 40% |
| Title | `text-lg`, `font-medium` |
| Description | `text-base`, `--color-muted` |
| Action | `margin-top: space-4` |

### CSS Implementation

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 320px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
}

.empty-state-icon {
  width: 48px;
  height: 48px;
  color: var(--color-muted);
  opacity: 0.4;
  margin-bottom: var(--space-4);
}

.empty-state-icon svg {
  width: 100%;
  height: 100%;
}

.empty-state-title {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  margin: 0;
}

.empty-state-description {
  font-size: var(--text-base);
  color: var(--color-muted);
  margin-top: var(--space-2);
}

.empty-state-action {
  margin-top: var(--space-4);
}
```

---

## 6.9 `Spinner`

Loading indicator.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | `20` | Diameter in pixels |
| `color` | `string` | `'currentColor'` | Spinner color |

### Rendered Structure

```html
<svg 
  class="spinner"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  aria-hidden="true"
>
  <circle
    class="spinner-track"
    cx="12"
    cy="12"
    r="10"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    opacity="0.2"
  />
  <circle
    class="spinner-head"
    cx="12"
    cy="12"
    r="10"
    fill="none"
    stroke={color}
    stroke-width="2"
    stroke-linecap="round"
    stroke-dasharray="32"
    stroke-dashoffset="24"
  />
</svg>
```

### CSS Implementation

```css
.spinner {
  animation: spinner-rotate 1s linear infinite;
}

@keyframes spinner-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner-track {
  opacity: 0.2;
}
```

---

## Related Documents

- **Section 1**: Component Philosophy
- **Section 5**: Structured Input Components
- **Section 7**: Overlay Components
- **Design System**: Visual tokens, colors, typography, spacing

# DreamTree Component Specification
## Section 7: Overlay Components

> Backdrops, modals, table of contents panel, and expanded navigation overlays.

---

## 7.1 `Backdrop`

Semi-transparent layer behind overlays.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | `false` | Show/hide |
| `onClick` | `() => void` | — | Click handler (for dismissing) |
| `opacity` | `number` | `0.5` | Background opacity (0-1) |
| `blur` | `boolean` | `false` | Apply backdrop blur |

### Rendered Structure

```html
{visible && (
  <div 
    class="backdrop"
    data-blur={blur}
    style={{ '--backdrop-opacity': opacity }}
    onClick={onClick}
    aria-hidden="true"
  />
)}
```

### Styling

| Property | Value |
|----------|-------|
| Position | Fixed, inset 0 |
| Background | `--color-text` @ opacity |
| Z-index | 40 |
| Blur | `backdrop-filter: blur(4px)` when enabled |

### Animation

| Action | Animation |
|--------|-----------|
| Enter | Fade in, `duration-normal` |
| Exit | Fade out, `duration-normal` |

### CSS Implementation

```css
.backdrop {
  position: fixed;
  inset: 0;
  background: color-mix(
    in srgb, 
    var(--color-text) calc(var(--backdrop-opacity, 0.5) * 100%), 
    transparent
  );
  z-index: 40;
  animation: backdrop-enter var(--duration-normal) ease;
}

.backdrop[data-blur="true"] {
  backdrop-filter: blur(4px);
}

@keyframes backdrop-enter {
  from { opacity: 0; }
  to { opacity: 1; }
}

.backdrop-exit {
  animation: backdrop-exit var(--duration-normal) ease forwards;
}

@keyframes backdrop-exit {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

---

## 7.2 `Modal`

Centered dialog for confirmations, alerts, and focused input.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Show/hide modal |
| `onClose` | `() => void` | required | Close handler |
| `title` | `string` | — | Modal heading |
| `description` | `string` | — | Supporting text |
| `children` | `ReactNode` | — | Body content |
| `actions` | `ModalAction[]` | — | Footer buttons |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Modal width |
| `closeOnBackdrop` | `boolean` | `true` | Close when clicking backdrop |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key |
| `showCloseButton` | `boolean` | `true` | Show X button in header |
| `id` | `string` | auto-generated | HTML id |

### Types

```typescript
type ModalAction = {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
};
```

### Sizes

| Size | Max Width |
|------|-----------|
| `sm` | 360px |
| `md` | 480px |
| `lg` | 600px |

### Features

- Focus trap within modal
- Focus returns to trigger element on close
- Body scroll lock while open
- Rendered via portal to document.body

### Rendered Structure

```html
{open && createPortal(
  <>
    <Backdrop 
      visible={true} 
      onClick={closeOnBackdrop ? onClose : undefined} 
    />
    <div
      class="modal"
      data-size={size}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? `${id}-title` : undefined}
      aria-describedby={description ? `${id}-description` : undefined}
    >
      {(title || showCloseButton) && (
        <header class="modal-header">
          {title && (
            <h2 id={`${id}-title`} class="modal-title">{title}</h2>
          )}
          {showCloseButton && (
            <button 
              class="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <XIcon />
            </button>
          )}
        </header>
      )}
      
      <div class="modal-body">
        {description && (
          <p id={`${id}-description`} class="modal-description">
            {description}
          </p>
        )}
        {children}
      </div>
      
      {actions && actions.length > 0 && (
        <footer class="modal-footer">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || (index === actions.length - 1 ? 'primary' : 'secondary')}
              onClick={action.onClick}
              disabled={action.disabled}
              loading={action.loading}
            >
              {action.label}
            </Button>
          ))}
        </footer>
      )}
    </div>
  </>,
  document.body
)}
```

### Focus Management

```typescript
const Modal = ({ open, onClose, closeOnEscape, ...props }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (open) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus first focusable element in modal
      const focusable = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (focusable?.[0] as HTMLElement)?.focus();
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus
      previousFocusRef.current?.focus();
      
      // Unlock body scroll
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  
  // Escape key handler
  useEffect(() => {
    if (!open || !closeOnEscape) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, onClose]);
  
  // Focus trap
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    const focusable = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (!focusable?.length) return;
    
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;
    
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  
  // ... render
};
```

### Styling

| Property | Value |
|----------|-------|
| Position | Fixed, centered |
| Background | `--color-bg` |
| Border | `border-thin`, `--color-muted` @ 20% |
| Border radius | `radius-md` |
| Shadow | `0 8px 32px rgba(0, 0, 0, 0.2)` |
| Z-index | 50 |
| Padding | `space-5` (header/body/footer) |

### Animation

| Action | Animation |
|--------|-----------|
| Enter | Fade in + scale from 0.95 + slide up 8px, `duration-normal` |
| Exit | Fade out + scale to 0.95, `duration-fast` |

### CSS Implementation

```css
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--color-bg);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 50;
  width: calc(100% - var(--space-8));
  animation: modal-enter var(--duration-normal) ease;
}

.modal[data-size="sm"] {
  max-width: 360px;
}

.modal[data-size="md"] {
  max-width: 480px;
}

.modal[data-size="lg"] {
  max-width: 600px;
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: translate(-50%, calc(-50% + 8px)) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5);
  padding-bottom: 0;
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--duration-fast) ease;
}

.modal-close:hover {
  background: color-mix(in srgb, var(--color-muted) 10%, transparent);
}

.modal-close svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: var(--space-5);
}

.modal-description {
  color: var(--color-muted);
  margin: 0 0 var(--space-4) 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-5);
  padding-top: 0;
}

/* Mobile adjustments */
@media (max-width: 767px) {
  .modal {
    width: calc(100% - var(--space-6));
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--space-4);
  }
  
  .modal-header {
    padding-bottom: 0;
  }
  
  .modal-footer {
    padding-top: 0;
  }
}
```

---

## 7.3 `TOCPanel`

Sliding sidebar showing table of contents.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Show/hide panel |
| `onClose` | `() => void` | required | Close handler |
| `currentLocation` | `BreadcrumbLocation` | — | Current position |
| `progress` | `WorkbookProgress` | required | Completion data |
| `onNavigate` | `(location: BreadcrumbLocation) => void` | required | Navigation handler |

### Types

```typescript
type BreadcrumbLocation = {
  partId: string;
  partTitle: string;
  moduleId?: string;
  moduleTitle?: string;
  exerciseId?: string;
  exerciseTitle?: string;
};

type WorkbookProgress = {
  parts: PartProgress[];
};

type PartProgress = {
  id: string;
  title: string;
  status: 'locked' | 'available' | 'in-progress' | 'complete';
  percentComplete: number;
  modules: ModuleProgress[];
};

type ModuleProgress = {
  id: string;
  title: string;
  status: 'locked' | 'available' | 'in-progress' | 'complete';
  exercises: ExerciseProgress[];
};

type ExerciseProgress = {
  id: string;
  title: string;
  status: 'locked' | 'available' | 'in-progress' | 'complete';
};
```

### Visual Structure

```
┌─────────────────────────────────┐
│  Contents                   [×] │
├─────────────────────────────────┤
│                                 │
│  ▼ Part 1: Roots         100%   │
│    ├─ ● Module 1: Values        │
│    │   ├─ ● Exercise 1          │
│    │   ├─ ● Exercise 2          │
│    │   └─ ● Exercise 3          │
│    └─ ● Module 2: Skills        │
│        ├─ ◐ Exercise 1 ← current│
│        └─ ○ Exercise 2          │
│                                 │
│  ▶ Part 2: Growth         45%   │
│                                 │
│  🔒 Part 3: Branching      0%   │
│                                 │
└─────────────────────────────────┘
```

### Rendered Structure

```html
{open && createPortal(
  <>
    <Backdrop visible={true} onClick={onClose} />
    <nav
      class="toc-panel"
      role="navigation"
      aria-label="Table of contents"
    >
      <header class="toc-panel-header">
        <h2 class="toc-panel-title">Contents</h2>
        <button 
          class="toc-panel-close"
          onClick={onClose}
          aria-label="Close table of contents"
        >
          <XIcon />
        </button>
      </header>
      
      <div class="toc-panel-content">
        {progress.parts.map(part => (
          <TOCPart
            key={part.id}
            part={part}
            currentLocation={currentLocation}
            onNavigate={onNavigate}
            onClose={onClose}
          />
        ))}
      </div>
    </nav>
  </>,
  document.body
)}
```

### Styling

| Property | Desktop | Mobile |
|----------|---------|--------|
| Position | Fixed left | Fixed bottom |
| Width | 320px | 100% |
| Max height | 100vh | 85vh |
| Background | `--color-bg` |
| Border | Right: `border-thin` | Top: `border-thin` |
| Z-index | 50 |

### Animation

| Platform | Animation |
|----------|-----------|
| Desktop | Slide in from left, `duration-normal` |
| Mobile | Slide up from bottom, `duration-normal` |

### CSS Implementation

```css
.toc-panel {
  position: fixed;
  background: var(--color-bg);
  z-index: 50;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Desktop: slide from left */
@media (min-width: 768px) {
  .toc-panel {
    top: 0;
    left: 0;
    bottom: 0;
    width: 320px;
    border-right: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
    animation: toc-slide-left var(--duration-normal) ease;
  }
  
  @keyframes toc-slide-left {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }
}

/* Mobile: slide from bottom */
@media (max-width: 767px) {
  .toc-panel {
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 85vh;
    border-top: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    animation: toc-slide-up var(--duration-normal) ease;
  }
  
  @keyframes toc-slide-up {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
}

.toc-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 10%, transparent);
  flex-shrink: 0;
}

.toc-panel-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin: 0;
}

.toc-panel-close {
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toc-panel-close:hover {
  background: color-mix(in srgb, var(--color-muted) 10%, transparent);
}

.toc-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
}
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Escape | Close panel |
| Arrow Up/Down | Navigate items |
| Enter | Select item / expand-collapse |
| Tab | Move between interactive elements |

---

## 7.4 `TOCPart`

Collapsible part section within TOC.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `part` | `PartProgress` | required | Part data |
| `currentLocation` | `BreadcrumbLocation` | — | Current position |
| `onNavigate` | `(location: BreadcrumbLocation) => void` | required | Navigation handler |
| `onClose` | `() => void` | required | Close panel after navigation |

### Behavior

- Auto-expands if contains current location or is in-progress
- Locked parts are non-expandable
- Shows progress percentage (or lock icon if locked)
- Chevron rotates 90° when expanded

### Rendered Structure

```html
<div class="toc-part" data-status={part.status}>
  <button
    class="toc-part-header"
    onClick={() => !isLocked && setExpanded(!expanded)}
    aria-expanded={expanded}
    aria-disabled={isLocked}
    disabled={isLocked}
  >
    {isLocked ? (
      <LockIcon class="toc-part-icon" />
    ) : (
      <ChevronIcon 
        class="toc-part-icon" 
        data-expanded={expanded}
      />
    )}
    <span class="toc-part-title">{part.title}</span>
    {!isLocked && (
      <span class="toc-part-progress">
        {part.percentComplete}%
      </span>
    )}
  </button>
  
  {expanded && !isLocked && (
    <div class="toc-part-modules">
      {part.modules.map(module => (
        <TOCModule
          key={module.id}
          module={module}
          partId={part.id}
          currentLocation={currentLocation}
          onNavigate={onNavigate}
          onClose={onClose}
        />
      ))}
    </div>
  )}
</div>
```

### CSS Implementation

```css
.toc-part {
  margin-bottom: var(--space-2);
}

.toc-part-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  transition: background-color var(--duration-fast) ease;
}

.toc-part-header:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-muted) 8%, transparent);
}

.toc-part-header:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.toc-part-icon {
  width: 16px;
  height: 16px;
  color: var(--color-muted);
  flex-shrink: 0;
  transition: transform var(--duration-fast) ease;
}

.toc-part-icon[data-expanded="true"] {
  transform: rotate(90deg);
}

.toc-part-title {
  flex: 1;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.toc-part-progress {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.toc-part-modules {
  margin-left: var(--space-5);
  margin-top: var(--space-1);
}
```

---

## 7.5 `TOCModule`

Module item within TOC part.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `module` | `ModuleProgress` | required | Module data |
| `partId` | `string` | required | Parent part ID |
| `currentLocation` | `BreadcrumbLocation` | — | Current position |
| `onNavigate` | `(location: BreadcrumbLocation) => void` | required | Navigation handler |
| `onClose` | `() => void` | required | Close panel after navigation |

### Rendered Structure

```html
<div class="toc-module" data-status={module.status}>
  <button
    class="toc-module-header"
    onClick={() => setExpanded(!expanded)}
    aria-expanded={expanded}
  >
    <ProgressMarker status={module.status} size="sm" />
    <span class="toc-module-title">{module.title}</span>
    <ChevronIcon class="toc-module-chevron" data-expanded={expanded} />
  </button>
  
  {expanded && (
    <div class="toc-module-exercises">
      {module.exercises.map(exercise => (
        <TOCExercise
          key={exercise.id}
          exercise={exercise}
          partId={partId}
          moduleId={module.id}
          isCurrent={
            currentLocation?.partId === partId &&
            currentLocation?.moduleId === module.id &&
            currentLocation?.exerciseId === exercise.id
          }
          onNavigate={onNavigate}
          onClose={onClose}
        />
      ))}
    </div>
  )}
</div>
```

### CSS Implementation

```css
.toc-module {
  margin-bottom: var(--space-1);
}

.toc-module-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  transition: background-color var(--duration-fast) ease;
}

.toc-module-header:hover {
  background: color-mix(in srgb, var(--color-muted) 8%, transparent);
}

.toc-module-title {
  flex: 1;
  font-size: var(--text-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toc-module-chevron {
  width: 14px;
  height: 14px;
  color: var(--color-muted);
  transition: transform var(--duration-fast) ease;
}

.toc-module-chevron[data-expanded="true"] {
  transform: rotate(90deg);
}

.toc-module-exercises {
  margin-left: var(--space-5);
  margin-top: var(--space-1);
}
```

---

## 7.6 `TOCExercise`

Individual exercise item within TOC.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `exercise` | `ExerciseProgress` | required | Exercise data |
| `partId` | `string` | required | Parent part ID |
| `moduleId` | `string` | required | Parent module ID |
| `isCurrent` | `boolean` | `false` | Is current location |
| `onNavigate` | `(location: BreadcrumbLocation) => void` | required | Navigation handler |
| `onClose` | `() => void` | required | Close panel after navigation |

### Behavior

- Clicking navigates and closes panel
- Current location is highlighted
- Locked exercises are 50% opacity, non-clickable

### Rendered Structure

```html
<button
  class="toc-exercise"
  data-status={exercise.status}
  data-current={isCurrent}
  onClick={() => {
    if (exercise.status !== 'locked') {
      onNavigate({
        partId,
        partTitle: '', // Filled by parent
        moduleId,
        moduleTitle: '', // Filled by parent
        exerciseId: exercise.id,
        exerciseTitle: exercise.title,
      });
      onClose();
    }
  }}
  disabled={exercise.status === 'locked'}
  aria-current={isCurrent ? 'location' : undefined}
>
  <ProgressMarker status={exercise.status} size="sm" />
  <span class="toc-exercise-title">{exercise.title}</span>
</button>
```

### Styling

| State | Background | Font |
|-------|------------|------|
| Default | transparent | normal |
| Hover | `--color-muted` @ 8% | normal |
| Current | `--color-primary` @ 10% | `font-medium` |
| Locked | transparent, 50% opacity | normal |

### CSS Implementation

```css
.toc-exercise {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  transition: background-color var(--duration-fast) ease;
}

.toc-exercise:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-muted) 8%, transparent);
}

.toc-exercise[data-current="true"] {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.toc-exercise[data-current="true"] .toc-exercise-title {
  font-weight: var(--font-medium);
}

.toc-exercise:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toc-exercise-title {
  font-size: var(--text-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

---

## 7.7 `NavExpanded`

Expanded navigation showing tool sub-items.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tools` | `ToolNavItem[]` | required | Tools with counts |
| `isExpanded` | `boolean` | `false` | Expansion state |
| `onNavigate` | `(toolId: string) => void` | required | Navigation handler |
| `onCollapse` | `() => void` | required | Collapse handler |

### Types

```typescript
type ToolNavItem = {
  id: string;
  name: string;
  icon: IconComponent;
  instanceCount: number;
  isUnlocked: boolean;
};
```

### Visual Structure

```
Desktop (inline expansion)        Mobile (bottom sheet)
┌──────────────────────┐         ┌─────────────────────────┐
│ 🔧 Tools         ▼   │         │  Tools              [×] │
├──────────────────────┤         ├─────────────────────────┤
│   📝 Lists        3  │         │  📝 Lists           3   │
│   📊 Rankings     2  │         │  📊 Rankings        2   │
│   📖 SOARED       5  │         │  📖 SOARED          5   │
│   💡 Ideas        1  │         │  💡 Ideas           1   │
│   💰 Budget       1  │         │  💰 Budget          1   │
│   🔄 Reframes     4  │         │  🔄 Reframes        4   │
└──────────────────────┘         └─────────────────────────┘
```

### Rendered Structure

```html
{/* Desktop: inline expansion */}
{isExpanded && !isMobile && (
  <div class="nav-expanded">
    {tools.filter(t => t.isUnlocked).map(tool => (
      <button
        key={tool.id}
        class="nav-expanded-item"
        onClick={() => {
          onNavigate(tool.id);
          onCollapse();
        }}
      >
        <tool.icon class="nav-expanded-icon" />
        <span class="nav-expanded-name">{tool.name}</span>
        {tool.instanceCount > 0 && (
          <Badge size="sm">{tool.instanceCount}</Badge>
        )}
      </button>
    ))}
  </div>
)}

{/* Mobile: bottom sheet */}
{isExpanded && isMobile && createPortal(
  <>
    <Backdrop visible={true} onClick={onCollapse} />
    <div class="nav-expanded-sheet">
      <header class="nav-expanded-sheet-header">
        <h3>Tools</h3>
        <button onClick={onCollapse} aria-label="Close">
          <XIcon />
        </button>
      </header>
      <div class="nav-expanded-sheet-content">
        {tools.filter(t => t.isUnlocked).map(tool => (
          <button
            key={tool.id}
            class="nav-expanded-item"
            onClick={() => {
              onNavigate(tool.id);
              onCollapse();
            }}
          >
            <tool.icon class="nav-expanded-icon" />
            <span class="nav-expanded-name">{tool.name}</span>
            {tool.instanceCount > 0 && (
              <Badge size="sm">{tool.instanceCount}</Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  </>,
  document.body
)}
```

### CSS Implementation

```css
/* Desktop inline expansion */
.nav-expanded {
  margin-left: var(--space-4);
  padding: var(--space-2) 0;
}

.nav-expanded-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  transition: background-color var(--duration-fast) ease;
}

.nav-expanded-item:hover {
  background: color-mix(in srgb, var(--color-primary) 8%, transparent);
}

.nav-expanded-icon {
  width: 18px;
  height: 18px;
  color: var(--color-muted);
}

.nav-expanded-name {
  flex: 1;
  font-size: var(--text-sm);
}

/* Mobile bottom sheet */
.nav-expanded-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg);
  border-top: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  z-index: 50;
  animation: sheet-slide-up var(--duration-normal) ease;
}

@keyframes sheet-slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.nav-expanded-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 10%, transparent);
}

.nav-expanded-sheet-header h3 {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin: 0;
}

.nav-expanded-sheet-header button {
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-expanded-sheet-content {
  padding: var(--space-2);
  max-height: 50vh;
  overflow-y: auto;
}

.nav-expanded-sheet .nav-expanded-item {
  padding: var(--space-3);
}
```

---

## 7.8 `DropdownMenu`

Generic dropdown menu for contextual actions.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `ReactNode` | required | Trigger element |
| `children` | `ReactNode` | required | Menu items |
| `align` | `'left' \| 'right'` | `'left'` | Horizontal alignment |
| `side` | `'top' \| 'bottom'` | `'bottom'` | Vertical position |

### Types

```typescript
// DropdownItem props
type DropdownItemProps = {
  children: ReactNode;
  onClick: () => void;
  icon?: IconComponent;
  variant?: 'default' | 'danger';
  disabled?: boolean;
};
```

### Rendered Structure

```html
<div class="dropdown-menu">
  <div 
    class="dropdown-trigger"
    onClick={() => setIsOpen(!isOpen)}
  >
    {trigger}
  </div>
  
  {isOpen && (
    <>
      <div class="dropdown-backdrop" onClick={() => setIsOpen(false)} />
      <div 
        class="dropdown-content"
        data-align={align}
        data-side={side}
        role="menu"
      >
        {children}
      </div>
    </>
  )}
</div>

{/* DropdownItem */}
<button
  class="dropdown-item"
  data-variant={variant}
  role="menuitem"
  onClick={() => {
    onClick();
    closeMenu();
  }}
  disabled={disabled}
>
  {icon && <Icon class="dropdown-item-icon" />}
  {children}
</button>
```

### CSS Implementation

```css
.dropdown-menu {
  position: relative;
  display: inline-block;
}

.dropdown-backdrop {
  position: fixed;
  inset: 0;
  z-index: 49;
}

.dropdown-content {
  position: absolute;
  min-width: 160px;
  background: var(--color-bg);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
  border-radius: var(--radius-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 50;
  padding: var(--space-1);
  animation: dropdown-enter var(--duration-fast) ease;
}

@keyframes dropdown-enter {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-content[data-align="left"] {
  left: 0;
}

.dropdown-content[data-align="right"] {
  right: 0;
}

.dropdown-content[data-side="bottom"] {
  top: 100%;
  margin-top: var(--space-1);
}

.dropdown-content[data-side="top"] {
  bottom: 100%;
  margin-bottom: var(--space-1);
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--duration-fast) ease;
}

.dropdown-item:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-muted) 10%, transparent);
}

.dropdown-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown-item[data-variant="danger"] {
  color: var(--color-error);
}

.dropdown-item[data-variant="danger"]:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-error) 10%, transparent);
}

.dropdown-item-icon {
  width: 16px;
  height: 16px;
  color: var(--color-muted);
}

.dropdown-item[data-variant="danger"] .dropdown-item-icon {
  color: var(--color-error);
}
```

---

## Related Documents

- **Section 1**: Component Philosophy
- **Section 6**: Feedback & Status Components
- **Section 8**: Onboarding Components
- **Design System**: Visual tokens, colors, typography, spacing


# DreamTree Component Specification
## Section 8: Onboarding Components

> Multi-step onboarding flow: welcome, name input, visual preferences, and completion.

---

## 8.1 `OnboardingFlow`

Container managing the onboarding sequence.

### Purpose
Guides new users through initial setup: welcome message, name input, and visual preference selection (background color, text color, font). Collects data needed to personalize the experience.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onComplete` | `(data: OnboardingData) => void` | required | Completion handler |
| `initialStep` | `number` | `0` | Starting step (for resuming) |

### Types

```typescript
type OnboardingData = {
  name: string;
  backgroundColor: BackgroundColorId;
  textColor: TextColorId;
  fontFamily: FontFamilyId;
};

type BackgroundColorId = 'ivory' | 'creamy-tan' | 'brown' | 'charcoal' | 'black';
type TextColorId = 'ivory' | 'creamy-tan' | 'brown' | 'charcoal' | 'black';
type FontFamilyId = 'inter' | 'lora' | 'courier-prime' | 'shadows-into-light' | 'jacquard-24';
```

### Steps

| Step | ID | Component | Validation |
|------|----|-----------|------------|
| 0 | `welcome` | `WelcomeStep` | Always valid |
| 1 | `name` | `NameStep` | Name non-empty |
| 2 | `visuals` | `VisualsStep` | All selections made |
| 3 | `complete` | `CompleteStep` | Always valid |

### State Management

```typescript
const OnboardingFlow = ({ onComplete, initialStep = 0 }) => {
  const [step, setStep] = useState(initialStep);
  const [data, setData] = useState<Partial<OnboardingData>>({
    name: '',
    backgroundColor: null,
    textColor: null,
    fontFamily: null,
  });
  
  const canProceed = () => {
    switch (step) {
      case 0: return true; // Welcome
      case 1: return data.name?.trim().length > 0;
      case 2: return data.backgroundColor && data.textColor && data.fontFamily;
      case 3: return true; // Complete
      default: return false;
    }
  };
  
  const handleNext = () => {
    if (step === 3) {
      onComplete(data as OnboardingData);
    } else {
      setStep(step + 1);
    }
  };
  
  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };
  
  // ... render
};
```

### Rendered Structure

```html
<div class="onboarding-flow">
  <div class="onboarding-content">
    {step === 0 && (
      <WelcomeStep onContinue={handleNext} />
    )}
    
    {step === 1 && (
      <NameStep
        value={data.name || ''}
        onChange={(name) => setData({ ...data, name })}
      />
    )}
    
    {step === 2 && (
      <VisualsStep
        backgroundColor={data.backgroundColor}
        textColor={data.textColor}
        fontFamily={data.fontFamily}
        onBackgroundChange={(bg) => setData({ ...data, backgroundColor: bg })}
        onTextChange={(text) => setData({ ...data, textColor: text })}
        onFontChange={(font) => setData({ ...data, fontFamily: font })}
      />
    )}
    
    {step === 3 && (
      <CompleteStep
        name={data.name}
        onComplete={handleNext}
      />
    )}
  </div>
  
  {step > 0 && step < 3 && (
    <div class="onboarding-footer">
      <Button variant="ghost" onClick={handleBack}>
        Back
      </Button>
      <OnboardingProgress totalSteps={4} currentStep={step} />
      <Button 
        variant="primary" 
        onClick={handleNext}
        disabled={!canProceed()}
      >
        {step === 2 ? 'Finish' : 'Continue'}
      </Button>
    </div>
  )}
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Layout | Full viewport, flex column |
| Content | Centered, max-width 480px |
| Padding | `space-6` |
| Background | `--color-bg` (updates live during step 2) |

### CSS Implementation

```css
.onboarding-flow {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  transition: background-color var(--duration-slow) ease;
}

.onboarding-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
}

.onboarding-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-top: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 10%, transparent);
}

@media (max-width: 767px) {
  .onboarding-content {
    padding: var(--space-4);
    justify-content: flex-start;
    padding-top: var(--space-10);
  }
  
  .onboarding-footer {
    padding: var(--space-3) var(--space-4);
  }
}
```

---

## 8.2 `WelcomeStep`

Introduction screen — first thing users see.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onContinue` | `() => void` | required | Continue handler |

### Content

- Logo or app name
- Welcome headline
- Brief description of what DreamTree is
- Single CTA button

### Rendered Structure

```html
<div class="welcome-step">
  <div class="welcome-logo" aria-hidden="true">
    🌳
  </div>
  
  <h1 class="welcome-title">Welcome to DreamTree</h1>
  
  <p class="welcome-description">
    A guided journey to discover your career path. We'll explore your 
    values, skills, and interests together — one conversation at a time.
  </p>
  
  <Button 
    variant="primary" 
    size="lg"
    onClick={onContinue}
  >
    Get Started
  </Button>
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Text align | Center |
| Logo | 64px, `margin-bottom: space-6` |
| Title | `text-3xl`, `font-semibold` |
| Description | `text-lg`, `--color-muted`, max-width 360px |
| Button | `margin-top: space-8` |

### Animation

| Element | Animation |
|---------|-----------|
| Logo | Fade in + scale from 0.8, `duration-slow`, 0ms delay |
| Title | Fade in + slide up 16px, `duration-slow`, 100ms delay |
| Description | Fade in + slide up 16px, `duration-slow`, 200ms delay |
| Button | Fade in + slide up 16px, `duration-slow`, 300ms delay |

### CSS Implementation

```css
.welcome-step {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.welcome-logo {
  font-size: 64px;
  margin-bottom: var(--space-6);
  animation: welcome-logo-enter var(--duration-slow) ease both;
}

@keyframes welcome-logo-enter {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.welcome-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-4) 0;
  animation: welcome-fade-up var(--duration-slow) ease both;
  animation-delay: 100ms;
}

.welcome-description {
  font-size: var(--text-lg);
  color: var(--color-muted);
  max-width: 360px;
  margin: 0;
  line-height: 1.6;
  animation: welcome-fade-up var(--duration-slow) ease both;
  animation-delay: 200ms;
}

.welcome-step .button {
  margin-top: var(--space-8);
  animation: welcome-fade-up var(--duration-slow) ease both;
  animation-delay: 300ms;
}

@keyframes welcome-fade-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 8.3 `NameStep`

Name input during onboarding.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Current name value |
| `onChange` | `(name: string) => void` | required | Change handler |

### Content

- Friendly greeting question
- Single text input
- Helper text explaining why we ask

### Rendered Structure

```html
<div class="name-step">
  <h2 class="name-step-title">What should we call you?</h2>
  
  <p class="name-step-description">
    This is how DreamTree will address you throughout your journey.
  </p>
  
  <TextInput
    value={value}
    onChange={onChange}
    placeholder="Your name"
    autoFocus
    maxLength={50}
  />
  
  <p class="name-step-helper">
    You can always change this later in your profile.
  </p>
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Text align | Center |
| Title | `text-2xl`, `font-semibold` |
| Description | `text-base`, `--color-muted` |
| Input | Full width, `margin-top: space-6` |
| Helper | `text-sm`, `--color-muted` @ 70% |

### CSS Implementation

```css
.name-step {
  text-align: center;
  width: 100%;
  max-width: 320px;
}

.name-step-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-2) 0;
}

.name-step-description {
  font-size: var(--text-base);
  color: var(--color-muted);
  margin: 0 0 var(--space-6) 0;
}

.name-step .text-input-wrapper {
  text-align: left;
}

.name-step .text-input {
  text-align: center;
}

.name-step-helper {
  font-size: var(--text-sm);
  color: var(--color-muted);
  opacity: 0.7;
  margin: var(--space-4) 0 0 0;
}
```

---

## 8.4 `VisualsStep`

Color and font selection.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backgroundColor` | `BackgroundColorId \| null` | `null` | Selected background |
| `textColor` | `TextColorId \| null` | `null` | Selected text color |
| `fontFamily` | `FontFamilyId \| null` | `null` | Selected font |
| `onBackgroundChange` | `(color: BackgroundColorId) => void` | required | Background handler |
| `onTextChange` | `(color: TextColorId) => void` | required | Text handler |
| `onFontChange` | `(font: FontFamilyId) => void` | required | Font handler |

### Color Definitions

| ID | Display Name | Hex | Mode |
|----|--------------|-----|------|
| `ivory` | Ivory | `#FAF8F5` | Light |
| `creamy-tan` | Creamy Tan | `#E8DCC4` | Light |
| `brown` | Brown | `#5C4033` | Dark |
| `charcoal` | Charcoal | `#2C3E50` | Dark |
| `black` | Black | `#1A1A1A` | Dark |

### Valid Text/Background Pairings

| Background | Valid Text Colors |
|------------|-------------------|
| `ivory` | brown, charcoal, black |
| `creamy-tan` | brown, charcoal, black |
| `brown` | ivory, creamy-tan |
| `charcoal` | ivory, creamy-tan |
| `black` | ivory, creamy-tan |

### Font Definitions

| ID | Display Name | Font Family | Style |
|----|--------------|-------------|-------|
| `inter` | Clean Sans | Inter | Modern, clean |
| `lora` | Classic Serif | Lora | Traditional, elegant |
| `courier-prime` | Typewriter | Courier Prime | Monospace, retro |
| `shadows-into-light` | Handwritten | Shadows Into Light | Casual, personal |
| `jacquard-24` | Vintage Display | Jacquard 24 | Decorative, bold |

### Validation Logic

```typescript
const getValidTextColors = (bgColor: BackgroundColorId): TextColorId[] => {
  const lightBackgrounds = ['ivory', 'creamy-tan'];
  const darkBackgrounds = ['brown', 'charcoal', 'black'];
  
  if (lightBackgrounds.includes(bgColor)) {
    return ['brown', 'charcoal', 'black'];
  } else {
    return ['ivory', 'creamy-tan'];
  }
};

const isValidPairing = (bg: BackgroundColorId, text: TextColorId): boolean => {
  return getValidTextColors(bg).includes(text);
};
```

### Rendered Structure

```html
<div class="visuals-step">
  <h2 class="visuals-step-title">Make it yours</h2>
  <p class="visuals-step-description">
    Choose colors and a font that feel right to you. 
    You can change these anytime.
  </p>
  
  {/* Background Color */}
  <div class="visuals-section">
    <h3 class="visuals-section-title">Background</h3>
    <div class="visuals-swatches">
      {backgroundColors.map(color => (
        <ColorSwatch
          key={color.id}
          color={color}
          isSelected={backgroundColor === color.id}
          onSelect={() => {
            onBackgroundChange(color.id);
            // Auto-clear text if pairing becomes invalid
            if (textColor && !isValidPairing(color.id, textColor)) {
              onTextChange(null);
            }
          }}
        />
      ))}
    </div>
  </div>
  
  {/* Text Color */}
  <div class="visuals-section">
    <h3 class="visuals-section-title">Text</h3>
    <div class="visuals-swatches">
      {textColors.map(color => {
        const isValid = backgroundColor ? isValidPairing(backgroundColor, color.id) : true;
        return (
          <ColorSwatch
            key={color.id}
            color={color}
            isSelected={textColor === color.id}
            onSelect={() => onTextChange(color.id)}
            disabled={!isValid}
            disabledReason={!isValid ? 'Not enough contrast with background' : undefined}
          />
        );
      })}
    </div>
  </div>
  
  {/* Font Family */}
  <div class="visuals-section">
    <h3 class="visuals-section-title">Font</h3>
    <div class="visuals-fonts">
      {fonts.map(font => (
        <FontPreview
          key={font.id}
          font={font}
          isSelected={fontFamily === font.id}
          onSelect={() => onFontChange(font.id)}
        />
      ))}
    </div>
  </div>
  
  {/* Live Preview */}
  <div 
    class="visuals-preview"
    style={{
      backgroundColor: backgroundColor ? colors[backgroundColor].hex : undefined,
      color: textColor ? colors[textColor].hex : undefined,
      fontFamily: fontFamily ? fonts[fontFamily].family : undefined,
    }}
  >
    <p class="visuals-preview-text">
      This is how your DreamTree will look.
    </p>
  </div>
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Title | `text-2xl`, `font-semibold`, centered |
| Section title | `text-sm`, `font-medium`, `--color-muted` |
| Swatches layout | Flex row, `gap: space-3`, centered |
| Fonts layout | Flex column, `gap: space-2` |
| Preview | Bordered box, `padding: space-4`, `radius-md` |

### CSS Implementation

```css
.visuals-step {
  width: 100%;
  max-width: 400px;
}

.visuals-step-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  text-align: center;
  margin: 0 0 var(--space-2) 0;
}

.visuals-step-description {
  font-size: var(--text-base);
  color: var(--color-muted);
  text-align: center;
  margin: 0 0 var(--space-8) 0;
}

.visuals-section {
  margin-bottom: var(--space-6);
}

.visuals-section-title {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-muted);
  margin: 0 0 var(--space-3) 0;
}

.visuals-swatches {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
}

.visuals-fonts {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.visuals-preview {
  margin-top: var(--space-6);
  padding: var(--space-4);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
  border-radius: var(--radius-md);
  text-align: center;
  transition: background-color var(--duration-normal) ease,
              color var(--duration-normal) ease;
}

.visuals-preview-text {
  margin: 0;
  font-size: var(--text-base);
}
```

---

## 8.5 `ColorSwatch`

Individual color option.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `ColorOption` | required | Color data |
| `isSelected` | `boolean` | `false` | Selected state |
| `onSelect` | `() => void` | required | Selection handler |
| `disabled` | `boolean` | `false` | Invalid pairing |
| `disabledReason` | `string` | — | Tooltip for disabled state |

### Types

```typescript
type ColorOption = {
  id: string;
  name: string;
  hex: string;
};
```

### Rendered Structure

```html
<Tooltip 
  content={disabled ? disabledReason : color.name}
  disabled={!disabled && !color.name}
>
  <button
    class="color-swatch"
    data-selected={isSelected}
    data-disabled={disabled}
    style={{ '--swatch-color': color.hex }}
    onClick={!disabled ? onSelect : undefined}
    disabled={disabled}
    aria-label={`${color.name}${isSelected ? ' (selected)' : ''}`}
    aria-pressed={isSelected}
  >
    {isSelected && (
      <CheckIcon class="color-swatch-check" aria-hidden="true" />
    )}
  </button>
</Tooltip>
```

### Styling

| Property | Value |
|----------|-------|
| Size | 48px |
| Border radius | `radius-full` (circle) |
| Border | 2px solid, transparent (default), `--color-primary` (selected) |
| Checkmark | White or black depending on color luminance |
| Disabled | 50% opacity, strikethrough line |

### CSS Implementation

```css
.color-swatch {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background-color: var(--swatch-color);
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color var(--duration-fast) ease,
              transform var(--duration-fast) ease;
}

.color-swatch:hover:not(:disabled) {
  transform: scale(1.05);
}

.color-swatch:focus {
  outline: none;
  box-shadow: var(--focus-ring);
}

.color-swatch[data-selected="true"] {
  border-color: var(--color-primary);
}

.color-swatch:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Strikethrough for disabled */
.color-swatch[data-disabled="true"]::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  background: var(--color-muted);
  transform: rotate(-45deg);
}

.color-swatch-check {
  width: 24px;
  height: 24px;
}

/* Light backgrounds get dark check */
.color-swatch[data-light="true"] .color-swatch-check {
  color: #1A1A1A;
}

/* Dark backgrounds get light check */
.color-swatch[data-light="false"] .color-swatch-check {
  color: #FAF8F5;
}
```

### Luminance Detection

```typescript
const isLightColor = (hex: string): boolean => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  // Relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};
```

---

## 8.6 `FontPreview`

Individual font option.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `font` | `FontOption` | required | Font data |
| `isSelected` | `boolean` | `false` | Selected state |
| `onSelect` | `() => void` | required | Selection handler |

### Types

```typescript
type FontOption = {
  id: FontFamilyId;
  name: string;
  family: string;
  sampleText?: string;
};
```

### Rendered Structure

```html
<button
  class="font-preview"
  data-selected={isSelected}
  onClick={onSelect}
  aria-label={`${font.name}${isSelected ? ' (selected)' : ''}`}
  aria-pressed={isSelected}
>
  <span 
    class="font-preview-sample"
    style={{ fontFamily: font.family }}
  >
    {font.sampleText || 'The quick brown fox'}
  </span>
  <span class="font-preview-name">{font.name}</span>
  {isSelected && (
    <CheckIcon class="font-preview-check" aria-hidden="true" />
  )}
</button>
```

### Styling

| Property | Value |
|----------|-------|
| Height | 56px |
| Padding | `space-3` horizontal |
| Border | `border-thin`, `--color-muted` @ 20% |
| Border radius | `radius-sm` |
| Selected | `--color-primary` border, `--color-primary` @ 5% bg |
| Sample text | `text-lg`, actual font |
| Font name | `text-xs`, `--color-muted` |

### CSS Implementation

```css
.font-preview {
  width: 100%;
  height: 56px;
  padding: 0 var(--space-3);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-align: left;
  transition: border-color var(--duration-fast) ease,
              background-color var(--duration-fast) ease;
}

.font-preview:hover {
  border-color: color-mix(in srgb, var(--color-muted) 40%, transparent);
}

.font-preview:focus {
  outline: none;
  box-shadow: var(--focus-ring);
}

.font-preview[data-selected="true"] {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
}

.font-preview-sample {
  flex: 1;
  font-size: var(--text-lg);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.font-preview-name {
  font-size: var(--text-xs);
  color: var(--color-muted);
  white-space: nowrap;
}

.font-preview-check {
  width: 20px;
  height: 20px;
  color: var(--color-primary);
  flex-shrink: 0;
}
```

---

## 8.7 `CompleteStep`

Final onboarding confirmation.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | required | User's name for personalization |
| `onComplete` | `() => void` | required | Completion handler |

### Content

- Personalized welcome message using name
- Brief explanation of what comes next
- Single CTA to start

### Rendered Structure

```html
<div class="complete-step">
  <div class="complete-icon" aria-hidden="true">
    ✨
  </div>
  
  <h2 class="complete-title">You're all set, {name}!</h2>
  
  <p class="complete-description">
    Your DreamTree journey begins now. We'll start by exploring 
    what matters most to you — your values, interests, and the 
    skills you've built along the way.
  </p>
  
  <p class="complete-note">
    Take your time. There are no wrong answers here.
  </p>
  
  <Button 
    variant="primary" 
    size="lg"
    onClick={onComplete}
  >
    Begin My Journey
  </Button>
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Text align | Center |
| Icon | 48px, `margin-bottom: space-4` |
| Title | `text-2xl`, `font-semibold` |
| Description | `text-base`, `--color-muted`, max-width 320px |
| Note | `text-sm`, `--color-muted` @ 70%, italic |
| Button | `margin-top: space-6` |

### Animation

Same staggered fade-up pattern as WelcomeStep.

### CSS Implementation

```css
.complete-step {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.complete-icon {
  font-size: 48px;
  margin-bottom: var(--space-4);
  animation: complete-bounce var(--duration-slow) ease;
}

@keyframes complete-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.complete-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-4) 0;
}

.complete-description {
  font-size: var(--text-base);
  color: var(--color-muted);
  max-width: 320px;
  margin: 0;
  line-height: 1.6;
}

.complete-note {
  font-size: var(--text-sm);
  color: var(--color-muted);
  opacity: 0.7;
  font-style: italic;
  margin: var(--space-4) 0 0 0;
}

.complete-step .button {
  margin-top: var(--space-6);
}
```

---

## 8.8 `OnboardingProgress`

Progress indicator showing current step in flow.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `totalSteps` | `number` | required | Total number of steps |
| `currentStep` | `number` | required | Current step (0-indexed) |

### Visual Structure

```
○ ● ○ ○
```

### Rendered Structure

```html
<div 
  class="onboarding-progress" 
  role="progressbar"
  aria-valuenow={currentStep + 1}
  aria-valuemin={1}
  aria-valuemax={totalSteps}
  aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
>
  {Array.from({ length: totalSteps }, (_, i) => (
    <span
      key={i}
      class="onboarding-progress-dot"
      data-active={i === currentStep}
      data-complete={i < currentStep}
    />
  ))}
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Dot size | 8px |
| Dot gap | `space-2` |
| Inactive | `--color-muted` @ 30% |
| Active | `--color-primary` |
| Complete | `--color-primary` @ 50% |

### CSS Implementation

```css
.onboarding-progress {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.onboarding-progress-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-muted) 30%, transparent);
  transition: background-color var(--duration-fast) ease,
              transform var(--duration-fast) ease;
}

.onboarding-progress-dot[data-complete="true"] {
  background: color-mix(in srgb, var(--color-primary) 50%, transparent);
}

.onboarding-progress-dot[data-active="true"] {
  background: var(--color-primary);
  transform: scale(1.25);
}
```

---

## 8.9 Data Persistence

### Saving Progress

Onboarding progress should be saved to prevent data loss if the user closes the browser mid-flow.

```typescript
// Save to localStorage on each step completion
const saveOnboardingProgress = (step: number, data: Partial<OnboardingData>) => {
  localStorage.setItem('dreamtree_onboarding', JSON.stringify({
    step,
    data,
    timestamp: Date.now(),
  }));
};

// Resume on mount
const loadOnboardingProgress = (): { step: number; data: Partial<OnboardingData> } | null => {
  const saved = localStorage.getItem('dreamtree_onboarding');
  if (!saved) return null;
  
  try {
    const parsed = JSON.parse(saved);
    // Expire after 24 hours
    if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('dreamtree_onboarding');
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

// Clear on completion
const clearOnboardingProgress = () => {
  localStorage.removeItem('dreamtree_onboarding');
};
```

### Applying Visual Preferences

Once onboarding completes, preferences are applied globally:

```typescript
const applyVisualPreferences = (prefs: OnboardingData) => {
  const root = document.documentElement;
  
  // Apply colors
  root.style.setProperty('--color-bg', colors[prefs.backgroundColor].hex);
  root.style.setProperty('--color-text', colors[prefs.textColor].hex);
  
  // Derive muted and primary based on mode
  const isDark = ['brown', 'charcoal', 'black'].includes(prefs.backgroundColor);
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  
  // Apply font
  root.style.setProperty('--font-body', fonts[prefs.fontFamily].family);
  
  // Save to user profile (API call)
  saveUserPreferences(prefs);
};
```

---

## Related Documents

- **Section 1**: Component Philosophy
- **Section 7**: Overlay Components
- **Section 9**: Tool Components
- **Design System**: Visual tokens, colors, typography, spacing


# DreamTree Component Specification
## Section 9: Tool Components

> Tool architecture, tool pages, and individual tool components: FlowTracker, FailureReframer, BudgetCalculator, IdeaTree, JobProspector.

---

## 9.1 Tool Architecture

### Dual-Context Design

Every tool works in two modes:

| Mode | Context | Data Source | Container |
|------|---------|-------------|-----------|
| **Embedded** | Within conversation | Props from parent | Inline with messages |
| **Standalone** | Dedicated page | Fetches via instance ID | Full page with header |

### Base Tool Props

```typescript
interface BaseToolProps<T> {
  instanceId: string;
  instanceName: string;
  data: T;
  onChange: (data: T) => void;
  mode: 'embedded' | 'standalone';
  source: WorkbookSource | UserCreated;
  disabled?: boolean;
  readOnly?: boolean;
}

type WorkbookSource = {
  type: 'workbook';
  partId: string;
  moduleId: string;
  exerciseId: string;
};

type UserCreated = {
  type: 'user';
};
```

### Tool Instance Data Model

```typescript
type ToolInstance<T = unknown> = {
  id: string;
  toolType: ToolType;
  name: string;
  source: WorkbookSource | UserCreated;
  data: T;
  createdAt: Date;
  updatedAt: Date;
  changeLog: ChangeLogEntry[];
};

type ChangeLogEntry = {
  timestamp: Date;
  field: string;
  previousValue: unknown;
  newValue: unknown;
};

type ToolType = 
  | 'list-builder'
  | 'ranking-grid'
  | 'soared-story'
  | 'idea-tree'
  | 'budget-calculator'
  | 'failure-reframer'
  | 'flow-tracker'
  | 'resume-builder'
  | 'networking-prep'
  | 'job-prospector';
```

### Tool Metadata

```typescript
type ToolMetadata = {
  singularName: string;
  pluralName: string;
  icon: IconComponent;
  getSummary: (data: unknown) => string;
};

const toolMeta: Record<ToolType, ToolMetadata> = {
  'list-builder': {
    singularName: 'List',
    pluralName: 'Lists',
    icon: ListIcon,
    getSummary: (data) => `${data.items.length} items`,
  },
  'ranking-grid': {
    singularName: 'Ranking',
    pluralName: 'Rankings',
    icon: ArrowsUpDownIcon,
    getSummary: (data) => `${data.items.length} items ranked`,
  },
  'soared-story': {
    singularName: 'SOARED Story',
    pluralName: 'SOARED Stories',
    icon: BookOpenIcon,
    getSummary: (data) => data.title || 'Untitled story',
  },
  'idea-tree': {
    singularName: 'Idea Tree',
    pluralName: 'Idea Trees',
    icon: LightbulbIcon,
    getSummary: (data) => `${data.totalIdeas || 0} ideas from "${data.rootIdea}"`,
  },
  'budget-calculator': {
    singularName: 'Budget',
    pluralName: 'Budgets',
    icon: CalculatorIcon,
    getSummary: (data) => `$${data.grossMonthlyIncome}/mo gross`,
  },
  'failure-reframer': {
    singularName: 'Reframe',
    pluralName: 'Reframes',
    icon: RefreshIcon,
    getSummary: (data) => data.situation?.slice(0, 50) + '...' || 'New reframe',
  },
  'flow-tracker': {
    singularName: 'Flow Log',
    pluralName: 'Flow Logs',
    icon: ActivityIcon,
    getSummary: (data) => `${data.entries?.length || 0} entries`,
  },
  'job-prospector': {
    singularName: 'Job Tracker',
    pluralName: 'Job Trackers',
    icon: BriefcaseIcon,
    getSummary: (data) => `${data.prospects?.length || 0} prospects`,
  },
  // ... other tools
};
```

### Instance Rules

| Source | Deletable | Editable | Name Editable |
|--------|-----------|----------|---------------|
| Workbook | ❌ No | ✅ Yes (with change log) | ❌ No |
| User Created | ✅ Yes | ✅ Yes | ✅ Yes |

### Free Tier Limits

- **20 user-created instances** per tool type
- Workbook-linked instances don't count toward limit
- Banner shown when limit reached

---

## 9.2 `ToolPage`

Shell for standalone tool pages listing all instances of a tool type.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `toolType` | `ToolType` | required | Which tool |
| `instances` | `ToolInstance[]` | required | All instances |
| `onCreateNew` | `() => void` | required | Create handler |
| `onSelectInstance` | `(id: string) => void` | required | Selection handler |
| `onSearch` | `(query: string) => void` | — | Search handler |
| `userTier` | `'free' \| 'paid'` | `'free'` | For limits |

### Visual Structure

```
┌─────────────────────────────────────────────────┐
│  ← Back    SOARED Stories                       │
├─────────────────────────────────────────────────┤
│  [Search...]                     [+ New Story]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ The Time I Led a Product Launch         │   │
│  │ Part 2 › Module 3 › Exercise 2      >   │   │
│  │ Edited 2 days ago                       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Resolving a Team Conflict               │   │
│  │ Created by you                      >   │   │
│  │ Edited 1 week ago                       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Customer Escalation Win                 │   │
│  │ Part 2 › Module 3 › Exercise 2      >   │   │
│  │ Edited 3 weeks ago                      │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Rendered Structure

```html
<div class="tool-page">
  <header class="tool-page-header">
    <button class="tool-page-back" onClick={onBack}>
      <ArrowLeftIcon />
      <span>Back</span>
    </button>
    <h1 class="tool-page-title">
      {toolMeta[toolType].pluralName}
    </h1>
  </header>
  
  <div class="tool-page-actions">
    {instances.length > 5 && (
      <TextInput
        placeholder={`Search ${toolMeta[toolType].pluralName.toLowerCase()}...`}
        value={searchQuery}
        onChange={setSearchQuery}
        icon={SearchIcon}
      />
    )}
    
    <Button
      variant="primary"
      icon={PlusIcon}
      onClick={onCreateNew}
      disabled={userTier === 'free' && userCreatedCount >= 20}
    >
      New {toolMeta[toolType].singularName}
    </Button>
  </div>
  
  {userTier === 'free' && userCreatedCount >= 20 && (
    <div class="tool-page-limit-banner">
      <span>You've reached the free tier limit of 20 {toolMeta[toolType].pluralName.toLowerCase()}.</span>
      <Button variant="ghost" size="sm">Upgrade</Button>
    </div>
  )}
  
  <div class="tool-page-list">
    {filteredInstances.length === 0 ? (
      <EmptyState
        icon={toolMeta[toolType].icon}
        title={`No ${toolMeta[toolType].pluralName.toLowerCase()} yet`}
        description={`Create your first ${toolMeta[toolType].singularName.toLowerCase()} to get started.`}
        action={{
          label: `Create ${toolMeta[toolType].singularName}`,
          onClick: onCreateNew,
        }}
      />
    ) : (
      filteredInstances.map(instance => (
        <ToolInstanceCard
          key={instance.id}
          instance={instance}
          toolType={toolType}
          onClick={() => onSelectInstance(instance.id)}
        />
      ))
    )}
  </div>
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Max width | 720px, centered |
| Header | `padding: space-4`, border-bottom |
| Actions | Flex row, `gap: space-3`, `margin: space-4 0` |
| List | Flex column, `gap: space-2` |
| Limit banner | Warning style, `--color-warning` @ 10% bg |

### CSS Implementation

```css
.tool-page {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-4);
}

.tool-page-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-bottom: var(--space-4);
  border-bottom: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 10%, transparent);
}

.tool-page-back {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2);
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.tool-page-back:hover {
  background: color-mix(in srgb, var(--color-muted) 10%, transparent);
  color: var(--color-text);
}

.tool-page-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin: 0;
}

.tool-page-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: var(--space-4) 0;
}

.tool-page-actions .text-input-wrapper {
  flex: 1;
}

.tool-page-limit-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  background: color-mix(in srgb, var(--color-warning) 10%, transparent);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-4);
  font-size: var(--text-sm);
}

.tool-page-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
```

---

## 9.3 `ToolInstanceCard`

Card showing tool instance preview in list.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `instance` | `ToolInstance` | required | Instance data |
| `toolType` | `ToolType` | required | For summary generation |
| `onClick` | `() => void` | required | Click handler |

### Rendered Structure

```html
<button
  class="tool-instance-card"
  onClick={onClick}
>
  <div class="tool-instance-card-content">
    <h3 class="tool-instance-card-name">{instance.name}</h3>
    <p class="tool-instance-card-source">
      {instance.source.type === 'workbook' 
        ? `${getPartTitle(instance.source.partId)} › ${getModuleTitle(instance.source.moduleId)}`
        : 'Created by you'
      }
    </p>
    <p class="tool-instance-card-meta">
      <span class="tool-instance-card-summary">
        {toolMeta[toolType].getSummary(instance.data)}
      </span>
      <span class="tool-instance-card-time">
        Edited {formatRelativeTime(instance.updatedAt)}
      </span>
    </p>
  </div>
  <ChevronRightIcon class="tool-instance-card-chevron" />
</button>
```

### Styling

| Property | Value |
|----------|-------|
| Padding | `space-4` |
| Border | `border-thin`, `radius-sm` |
| Hover | `--color-muted` @ 8% bg |
| Name | `text-base`, `font-medium` |
| Source | `text-sm`, `--color-muted` |
| Meta | `text-xs`, `--color-muted` @ 70% |
| Chevron | 20px, `--color-muted` |

### CSS Implementation

```css
.tool-instance-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: none;
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  transition: background-color var(--duration-fast) ease,
              border-color var(--duration-fast) ease;
}

.tool-instance-card:hover {
  background: color-mix(in srgb, var(--color-muted) 8%, transparent);
  border-color: color-mix(in srgb, var(--color-muted) 30%, transparent);
}

.tool-instance-card:focus {
  outline: none;
  box-shadow: var(--focus-ring);
}

.tool-instance-card-content {
  flex: 1;
  min-width: 0;
}

.tool-instance-card-name {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-instance-card-source {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: var(--space-1) 0 0 0;
}

.tool-instance-card-meta {
  display: flex;
  gap: var(--space-3);
  font-size: var(--text-xs);
  color: var(--color-muted);
  opacity: 0.7;
  margin: var(--space-2) 0 0 0;
}

.tool-instance-card-chevron {
  width: 20px;
  height: 20px;
  color: var(--color-muted);
  flex-shrink: 0;
}
```

---

## 9.4 `ToolInstanceView`

Full view/edit wrapper for a single tool instance.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `instance` | `ToolInstance` | required | Instance data |
| `toolType` | `ToolType` | required | Which tool component to render |
| `onUpdate` | `(data: unknown) => void` | required | Data change handler |
| `onRename` | `(name: string) => void` | — | Rename handler (user-created only) |
| `onBack` | `() => void` | required | Back navigation |
| `onViewHistory` | `() => void` | — | View change history |
| `onDelete` | `() => void` | — | Delete handler (user-created only) |

### Rendered Structure

```html
<div class="tool-instance-view">
  <header class="tool-instance-view-header">
    <button class="tool-instance-view-back" onClick={onBack}>
      <ArrowLeftIcon />
    </button>
    
    <div class="tool-instance-view-title">
      {instance.source.type === 'user' && onRename ? (
        <input
          type="text"
          class="tool-instance-view-name-input"
          value={instance.name}
          onChange={(e) => onRename(e.target.value)}
        />
      ) : (
        <h1 class="tool-instance-view-name">{instance.name}</h1>
      )}
      <p class="tool-instance-view-source">
        {instance.source.type === 'workbook'
          ? `${getPartTitle(instance.source.partId)} › ${getModuleTitle(instance.source.moduleId)}`
          : 'Created by you'
        }
      </p>
    </div>
    
    <DropdownMenu
      trigger={<Button variant="ghost" icon={MoreIcon} iconOnly ariaLabel="More options" />}
      align="right"
    >
      {onViewHistory && (
        <DropdownItem icon={HistoryIcon} onClick={onViewHistory}>
          View history
        </DropdownItem>
      )}
      {instance.source.type === 'user' && onDelete && (
        <DropdownItem icon={TrashIcon} variant="danger" onClick={onDelete}>
          Delete
        </DropdownItem>
      )}
    </DropdownMenu>
  </header>
  
  <div class="tool-instance-view-content">
    <ToolComponent
      instanceId={instance.id}
      instanceName={instance.name}
      data={instance.data}
      onChange={onUpdate}
      mode="standalone"
      source={instance.source}
    />
  </div>
  
  <footer class="tool-instance-view-footer">
    <SaveIndicator status={saveStatus} lastSaved={instance.updatedAt} />
  </footer>
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Max width | 720px, centered |
| Header | Sticky top, `--color-bg`, `padding: space-4` |
| Content | `padding: space-4` |
| Footer | Fixed bottom, `padding: space-3` |

---

## 9.5 `FlowTracker`

Daily energy and engagement tracking tool.

### Props

```typescript
interface FlowTrackerProps extends BaseToolProps<FlowTrackerData> {
  date?: Date; // For viewing specific day
}

type FlowTrackerData = {
  entries: FlowEntry[];
};

type FlowEntry = {
  id: string;
  date: Date;
  activity: string;
  energyBefore: number;  // 1-5
  energyAfter: number;   // 1-5
  engagement: number;    // 1-5
  notes?: string;
  tags?: string[];
};
```

### Visual Structure

```
Track an activity:

Activity
┌─────────────────────────────────────────────────┐
│ Writing project proposal                        │
└─────────────────────────────────────────────────┘

Energy Before
(−) Drained  ○───○───●───○───○  Energized (+)

Energy After
(−) Drained  ○───○───○───○───●  Energized (+)

Engagement
(−) Bored    ○───○───○───●───○  Absorbed (+)

Notes (optional)
┌─────────────────────────────────────────────────┐
│ Lost track of time, felt great afterward        │
└─────────────────────────────────────────────────┘

                                    [Add Entry]

─────────────────────────────────────────────────

Today's entries:

┌─────────────────────────────────────────────────┐
│ Writing project proposal              ⚡ +2     │
│ 3 → 5 energy • 4 engagement                     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Team standup meeting                  ↓ -1      │
│ 4 → 3 energy • 2 engagement                     │
└─────────────────────────────────────────────────┘
```

### Entry Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `activity` | TextInput | ✅ | What you were doing |
| `energyBefore` | Slider (1-5) | ✅ | Energy level before |
| `energyAfter` | Slider (1-5) | ✅ | Energy level after |
| `engagement` | Slider (1-5) | ✅ | How absorbed you felt |
| `notes` | TextArea | ❌ | Additional observations |

### Energy Delta Icons

| Delta | Icon | Color |
|-------|------|-------|
| +2 or more | ⚡ | `--color-success` |
| +1 | ↑ | `--color-success` @ 70% |
| 0 | → | `--color-muted` |
| -1 | ↓ | `--color-warning` |
| -2 or less | 😐 | `--color-error` |

### Rendered Structure

```html
<div class="flow-tracker">
  <form class="flow-tracker-form" onSubmit={handleAddEntry}>
    <h3 class="flow-tracker-form-title">Track an activity</h3>
    
    <TextInput
      label="Activity"
      value={formData.activity}
      onChange={(v) => setFormData({ ...formData, activity: v })}
      placeholder="What were you doing?"
      required
    />
    
    <Slider
      label="Energy Before"
      value={formData.energyBefore}
      onChange={(v) => setFormData({ ...formData, energyBefore: v })}
      min={1}
      max={5}
      minLabel="Drained"
      maxLabel="Energized"
    />
    
    <Slider
      label="Energy After"
      value={formData.energyAfter}
      onChange={(v) => setFormData({ ...formData, energyAfter: v })}
      min={1}
      max={5}
      minLabel="Drained"
      maxLabel="Energized"
    />
    
    <Slider
      label="Engagement"
      value={formData.engagement}
      onChange={(v) => setFormData({ ...formData, engagement: v })}
      min={1}
      max={5}
      minLabel="Bored"
      maxLabel="Absorbed"
    />
    
    <TextArea
      label="Notes (optional)"
      value={formData.notes}
      onChange={(v) => setFormData({ ...formData, notes: v })}
      placeholder="Any observations..."
      minRows={2}
    />
    
    <Button type="submit" variant="primary" disabled={!isFormValid}>
      Add Entry
    </Button>
  </form>
  
  <Divider />
  
  <div class="flow-tracker-entries">
    <h3 class="flow-tracker-entries-title">Today's entries</h3>
    
    {todayEntries.length === 0 ? (
      <p class="flow-tracker-empty">No entries yet today.</p>
    ) : (
      todayEntries.map(entry => (
        <FlowTrackerEntry key={entry.id} entry={entry} />
      ))
    )}
  </div>
</div>
```

### FlowTrackerEntry Component

```html
<div class="flow-entry">
  <div class="flow-entry-header">
    <span class="flow-entry-activity">{entry.activity}</span>
    <span class="flow-entry-delta" data-delta={getDeltaType(entry)}>
      {getDeltaIcon(entry)} {entry.energyAfter - entry.energyBefore > 0 ? '+' : ''}{entry.energyAfter - entry.energyBefore}
    </span>
  </div>
  <p class="flow-entry-meta">
    {entry.energyBefore} → {entry.energyAfter} energy • {entry.engagement} engagement
  </p>
  {entry.notes && (
    <p class="flow-entry-notes">{entry.notes}</p>
  )}
</div>
```

---

## 9.6 `FailureReframer`

Tool for reframing setbacks and learning from challenges.

### Props

```typescript
interface FailureReframerProps extends BaseToolProps<FailureReframerData> {}

type FailureReframerData = {
  situation: string;
  initialFeelings: string;
  whatLearned: string;
  whatWouldChange: string;
  silverLining: string;
  nextStep: string;
  reframedStatement: string;
};
```

### Fields

| Field | Label | Prompt |
|-------|-------|--------|
| `situation` | The Situation | Describe what happened. What was the setback or failure? |
| `initialFeelings` | Initial Feelings | How did you feel when it happened? |
| `whatLearned` | What I Learned | What did this experience teach you? |
| `whatWouldChange` | What I'd Do Differently | If you could go back, what would you change? |
| `silverLining` | Silver Lining | Was there anything positive that came from this? |
| `nextStep` | Next Step | What's one thing you can do now as a result? |
| `reframedStatement` | Reframed Statement | Write a new, constructive way to think about this experience. |

### Rendered Structure

```html
<div class="failure-reframer">
  <p class="failure-reframer-intro">
    Setbacks are part of growth. Let's reframe this experience 
    to find the learning and move forward.
  </p>
  
  <div class="failure-reframer-fields">
    <TextArea
      label="The Situation"
      helperText="Describe what happened. What was the setback or failure?"
      value={data.situation}
      onChange={(v) => onChange({ ...data, situation: v })}
      minRows={2}
    />
    
    <TextArea
      label="Initial Feelings"
      helperText="How did you feel when it happened?"
      value={data.initialFeelings}
      onChange={(v) => onChange({ ...data, initialFeelings: v })}
      minRows={2}
    />
    
    <TextArea
      label="What I Learned"
      helperText="What did this experience teach you?"
      value={data.whatLearned}
      onChange={(v) => onChange({ ...data, whatLearned: v })}
      minRows={2}
    />
    
    <TextArea
      label="What I'd Do Differently"
      helperText="If you could go back, what would you change?"
      value={data.whatWouldChange}
      onChange={(v) => onChange({ ...data, whatWouldChange: v })}
      minRows={2}
    />
    
    <TextArea
      label="Silver Lining"
      helperText="Was there anything positive that came from this?"
      value={data.silverLining}
      onChange={(v) => onChange({ ...data, silverLining: v })}
      minRows={2}
    />
    
    <TextArea
      label="Next Step"
      helperText="What's one thing you can do now as a result?"
      value={data.nextStep}
      onChange={(v) => onChange({ ...data, nextStep: v })}
      minRows={2}
    />
    
    <Divider type="section" />
    
    <TextArea
      label="Reframed Statement"
      helperText="Write a new, constructive way to think about this experience."
      value={data.reframedStatement}
      onChange={(v) => onChange({ ...data, reframedStatement: v })}
      minRows={3}
    />
  </div>
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Intro | `text-base`, `--color-muted`, `margin-bottom: space-6` |
| Field gap | `space-5` |
| Final field | Highlighted with left border `--color-primary` |

---

## 9.7 `BudgetCalculator`

Monthly income, taxes, and expense tracking with live tax calculation.

### Props

```typescript
interface BudgetCalculatorProps extends BaseToolProps<BudgetCalculatorData> {}

type BudgetCalculatorData = {
  grossMonthlyIncome: number;
  grossYearlyIncome: number;
  incomeInputMode: 'monthly' | 'yearly';
  filingStatus: FilingStatus;
  stateCode: string | null;
  expenses: ExpenseItem[];
};

type FilingStatus = 'single' | 'married' | 'married_separate' | 'head_of_household';

type ExpenseItem = {
  id: string;
  name: string;
  amount: number;
  isEssential: boolean;
};
```

### API Integration (API Ninjas)

```typescript
const API_NINJAS_ENDPOINT = 'https://api.api-ninjas.com/v1/incometaxcalculator';

type TaxBreakdown = {
  federal: number;
  state: number;
  ficaSocialSecurity: number;
  ficaMedicare: number;
  totalTaxes: number;
  takeHome: number;
  effectiveRate: number;
  isLoading: boolean;
  error: string | null;
};

const fetchTaxEstimate = async (
  yearlyIncome: number,
  filingStatus: FilingStatus,
  stateCode: string
): Promise<TaxAPIResponse> => {
  const response = await fetch(
    `${API_NINJAS_ENDPOINT}?country=US&region=${stateCode}&income=${yearlyIncome}&filing_status=${filingStatus}`,
    {
      headers: { 'X-Api-Key': process.env.NEXT_PUBLIC_API_NINJAS_KEY! }
    }
  );
  return response.json();
};
```

### Visual Structure

```
Monthly Budget Calculator

Gross Income
┌─────────────────┐  ┌─────────────────┐
│ $ 5,000         │  │ $ 60,000        │
│ per month       │  │ per year        │
└─────────────────┘  └─────────────────┘
                     (synced)

Filing Status                State
┌─────────────────┐         ┌─────────────────┐
│ Single        ▼ │         │ California    ▼ │
└─────────────────┘         └─────────────────┘

─────────────────────────────────────────────────

Tax Breakdown (Monthly)                    
  Federal Tax                    $  620
  State Tax (CA)                 $  280
  Social Security                $  310
  Medicare                       $   73
                                ────────
  Estimated Take-Home            $3,717
  Effective Rate                  25.7%

─────────────────────────────────────────────────

Monthly Expenses

  Name                 Amount    Essential
┌─────────────────────────────────────────────┐
│ Housing              $ 1,500      ☑         │
├─────────────────────────────────────────────┤
│ Food                 $   400      ☑         │
├─────────────────────────────────────────────┤
│ Utilities            $   150      ☑         │
├─────────────────────────────────────────────┤
│ Transportation       $   200      ☑         │
├─────────────────────────────────────────────┤
│ Insurance            $   100      ☑         │
├─────────────────────────────────────────────┤
│ Entertainment        $   200      ☐         │
└─────────────────────────────────────────────┘
                        [+ Add Expense]

─────────────────────────────────────────────────

Summary
  Estimated Take-Home            $3,717
  Total Expenses               - $2,550
  Essential Only               - $2,350
                                ────────
  Net Savings (Monthly)          $1,167  ✓

─────────────────────────────────────────────────

⚠️ Tax estimates provided by API Ninjas. Estimates 
   are approximate and don't account for deductions 
   or credits. Consult a tax professional for accuracy.
```

### Default Expenses

| Name | Amount | Essential |
|------|--------|-----------|
| Housing | $0 | ✅ |
| Food | $0 | ✅ |
| Utilities | $0 | ✅ |
| Transportation | $0 | ✅ |
| Insurance | $0 | ✅ |

### State Selection

Full list of US states + DC, searchable dropdown.

### Tax Calculation Logic

```typescript
// Debounced API call (500ms)
const debouncedFetchTaxes = useMemo(
  () => debounce(async (income, status, state) => {
    if (!income || !status || !state) return;
    
    setTaxes(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await fetchTaxEstimate(income, status, state);
      setTaxes({
        federal: result.federal_taxes_owed / 12,
        state: result.region_taxes_owed / 12,
        ficaSocialSecurity: result.fica_social_security / 12,
        ficaMedicare: result.fica_medicare / 12,
        totalTaxes: (result.federal_taxes_owed + result.region_taxes_owed + result.fica_total) / 12,
        takeHome: result.income_after_tax / 12,
        effectiveRate: result.total_effective_tax_rate,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setTaxes(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to calculate taxes. Please try again.',
      }));
    }
  }, 500),
  []
);
```

### Summary Calculations

```typescript
const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
const essentialExpenses = data.expenses
  .filter(e => e.isEssential)
  .reduce((sum, e) => sum + e.amount, 0);
const netSavings = taxes.takeHome - totalExpenses;
```

---

## 9.8 `IdeaTree`

Word association brainstorming game — NO tree visible until complete.

### Props

```typescript
interface IdeaTreeProps extends BaseToolProps<IdeaTreeData> {}

type IdeaTreeData = {
  rootIdea: string;
  layer1: [string, string, string];
  layer2A: [string, string, string];
  layer2B: [string, string, string];
  layer2C: [string, string, string];
  layer3A1: [string, string, string];
  layer3A2: [string, string, string];
  layer3A3: [string, string, string];
  layer3B1: [string, string, string];
  layer3B2: [string, string, string];
  layer3B3: [string, string, string];
  layer3C1: [string, string, string];
  layer3C2: [string, string, string];
  layer3C3: [string, string, string];
  isComplete: boolean;
};
```

### Flow

| Step | Prompt Word | User Provides |
|------|-------------|---------------|
| Intro | — | Read instructions |
| Root | "What topic?" | 1 root idea |
| Layer 1 | Root idea | 3 connected ideas |
| Layer 2A | Layer 1[0] | 3 connected ideas |
| Layer 2B | Layer 1[1] | 3 connected ideas |
| Layer 2C | Layer 1[2] | 3 connected ideas |
| Layer 3 (×9) | Each Layer 2 item | 3 connected ideas each |
| Complete | — | View full tree |

**Total: 40 ideas** (1 + 3 + 9 + 27)

### Visual Structure (During Entry)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│            What comes to mind when              │
│               you think of...                   │
│                                                 │
│                  TEACHING                       │
│                                                 │
│   1. ┌─────────────────────────────────────┐   │
│      │ Patience                            │   │
│      └─────────────────────────────────────┘   │
│                                                 │
│   2. ┌─────────────────────────────────────┐   │
│      │ Explaining                          │   │
│      └─────────────────────────────────────┘   │
│                                                 │
│   3. ┌─────────────────────────────────────┐   │
│      │                                     │   │
│      └─────────────────────────────────────┘   │
│                                                 │
│                              [Continue →]       │
│                                                 │
└─────────────────────────────────────────────────┘

Step 2 of 14
```

### Complete View

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                  🌳 Your Idea Tree              │
│                                                 │
│          40 ideas generated from 1 root         │
│                                                 │
│                   [TEACHING]                    │
│                   /    |    \                   │
│           Patience  Explaining  Growth          │
│           /  |  \    /  |  \    /  |  \         │
│         ...  ... ... ... ... ... ... ... ...    │
│                                                 │
│                                                 │
│    [Save Tree]              [Start New Tree]    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### State Machine

```typescript
type IdeaTreeStep = 
  | { type: 'intro' }
  | { type: 'root' }
  | { type: 'layer1' }
  | { type: 'layer2'; branch: 'A' | 'B' | 'C' }
  | { type: 'layer3'; branch: 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'B3' | 'C1' | 'C2' | 'C3' }
  | { type: 'complete' };

const getPromptWord = (step: IdeaTreeStep, data: IdeaTreeData): string => {
  switch (step.type) {
    case 'intro': return '';
    case 'root': return 'What topic are we thinking about?';
    case 'layer1': return data.rootIdea;
    case 'layer2':
      const l1Index = { A: 0, B: 1, C: 2 }[step.branch];
      return data.layer1[l1Index];
    case 'layer3':
      const [branch, idx] = [step.branch[0], parseInt(step.branch[1]) - 1];
      const layer2Key = `layer2${branch}` as keyof IdeaTreeData;
      return (data[layer2Key] as string[])[idx];
    case 'complete': return '';
  }
};
```

### Rendered Structure (Entry Step)

```html
<div class="idea-tree-entry">
  <p class="idea-tree-prompt-label">
    What comes to mind when you think of...
  </p>
  
  <h2 class="idea-tree-prompt-word">{promptWord}</h2>
  
  <div class="idea-tree-inputs">
    {[0, 1, 2].map(i => (
      <div key={i} class="idea-tree-input-row">
        <span class="idea-tree-input-number">{i + 1}.</span>
        <TextInput
          value={currentInputs[i]}
          onChange={(v) => updateInput(i, v)}
          placeholder="Type an idea..."
          autoFocus={i === 0}
        />
      </div>
    ))}
  </div>
  
  <Button
    variant="primary"
    onClick={handleContinue}
    disabled={!allInputsFilled}
  >
    Continue →
  </Button>
  
  <p class="idea-tree-step-indicator">
    Step {currentStepNumber} of 14
  </p>
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Prompt label | `text-base`, `--color-muted`, centered |
| Prompt word | `text-3xl`, `font-semibold`, centered, `margin: space-4 0 space-6` |
| Input number | `text-lg`, `--color-muted`, `width: 24px` |
| Step indicator | `text-sm`, `--color-muted`, centered |

---

## 9.9 `JobProspector`

Job opportunity tracking table.

### Props

```typescript
interface JobProspectorProps extends BaseToolProps<JobProspectorData> {}

type JobProspectorData = {
  prospects: JobProspect[];
};

type JobProspect = {
  id: string;
  field: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  adjectivesAdvantages: string;
  haves: string;      // Skills I have
  lacks: string;      // Skills I lack
  fitRating: number;  // 1-5
};
```

### Table Columns

| Column | Width | Type |
|--------|-------|------|
| Field | 100px | Text input |
| Job Title | 150px | Text input |
| Company | 120px | Text input |
| Job Description | 200px | Textarea (expandable) |
| Adj. & Adv. | 150px | Textarea |
| Haves | 150px | Textarea |
| Lacks | 150px | Textarea |
| Fit (1-5) | 60px | Number input |
| Actions | 40px | Delete button |

### Rendered Structure (Desktop)

```html
<div class="job-prospector">
  <table class="job-prospector-table">
    <thead>
      <tr>
        <th>Field</th>
        <th>Job Title</th>
        <th>Company</th>
        <th>Job Description</th>
        <th>Adj. & Adv.</th>
        <th>Haves</th>
        <th>Lacks</th>
        <th>Fit</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {data.prospects.map(prospect => (
        <tr key={prospect.id}>
          <td>
            <input
              type="text"
              value={prospect.field}
              onChange={(e) => updateProspect(prospect.id, 'field', e.target.value)}
            />
          </td>
          {/* ... other cells */}
          <td>
            <input
              type="number"
              min={1}
              max={5}
              value={prospect.fitRating}
              onChange={(e) => updateProspect(prospect.id, 'fitRating', parseInt(e.target.value))}
            />
          </td>
          <td>
            <button onClick={() => deleteProspect(prospect.id)}>
              <TrashIcon />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  
  <Button variant="secondary" icon={PlusIcon} onClick={addProspect}>
    Add Prospect
  </Button>
</div>
```

### Mobile View (Card Layout)

```html
<div class="job-prospector-cards">
  {data.prospects.map(prospect => (
    <div key={prospect.id} class="job-prospector-card">
      <div class="job-prospector-card-header">
        <input
          class="job-prospector-card-title"
          value={prospect.jobTitle}
          onChange={(e) => updateProspect(prospect.id, 'jobTitle', e.target.value)}
          placeholder="Job Title"
        />
        <button onClick={() => deleteProspect(prospect.id)}>
          <TrashIcon />
        </button>
      </div>
      
      <div class="job-prospector-card-field">
        <label>Company</label>
        <input value={prospect.company} onChange={...} />
      </div>
      
      {/* ... other fields */}
      
      <div class="job-prospector-card-fit">
        <label>Fit Rating</label>
        <div class="job-prospector-card-rating">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              data-active={prospect.fitRating >= n}
              onClick={() => updateProspect(prospect.id, 'fitRating', n)}
            >
              ★
            </button>
          ))}
        </div>
      </div>
    </div>
  ))}
</div>
```

### Responsive Behavior

| Viewport | Layout |
|----------|--------|
| ≥ 1024px | Horizontal scrolling table |
| < 1024px | Stacked card view |

---

## 9.10 Additional Tools (Stubs)

### ResumeBuilder

Pulls from SOARED stories, skills, and job history to help construct resume bullets.

```typescript
type ResumeBuilderData = {
  contactInfo: ContactInfo;
  summary: string;
  experience: ExperienceEntry[];
  skills: string[];
  education: EducationEntry[];
};
```

### NetworkingPrep

Informational interview preparation and contact tracking.

```typescript
type NetworkingPrepData = {
  contacts: NetworkContact[];
  interviewQuestions: string[];
  elevator: string;
};

type NetworkContact = {
  id: string;
  name: string;
  company: string;
  role: string;
  relationship: string;
  status: 'identified' | 'reached-out' | 'scheduled' | 'completed';
  notes: string;
};
```

---

## Related Documents

- **Section 1**: Component Philosophy
- **Section 5**: Structured Input Components (ListBuilder, RankingGrid, etc.)
- **Section 8**: Onboarding Components
- **Section 10**: Page Components
- **Design System**: Visual tokens, colors, typography, spacing


# DreamTree Component Specification
## Section 10: Page Components — Part 1: Dashboard

> Dashboard page layout and all supporting components.

---

## 10.1 Page Architecture

### Page Types Overview

| Page | URL | Purpose | Shell Config |
|------|-----|---------|--------------|
| **Dashboard** | `/` or `/dashboard` | Home base, daily engagement | No breadcrumb, no input |
| **Workbook** | `/workbook/[part]/[module]/[exercise]` | Main content experience | Breadcrumb + input |
| **Profile** | `/profile` | Read-only user data view | No breadcrumb, no input |
| **Settings** | `/settings` | Preferences and account | No breadcrumb, no input |

### Shared Layout Properties

| Property | Value |
|----------|-------|
| Max content width | 720px |
| Content centering | `margin: 0 auto` |
| Horizontal padding | `space-4` |
| Vertical padding | `space-6` |

---

## 10.2 Dashboard

Home page with daily engagement prompts, progress tracking, profile preview, and table of contents.

### URL
`/` or `/dashboard`

### Structure (Top to Bottom)

1. `DashboardGreeting` — Welcome message
2. `DailyDoList` — Today's focus items
3. `ProgressMetrics` — Completion stats
4. `ProfilePreview` — User snapshot
5. `TOCInline` — Full table of contents

### Rendered Structure

```html
<AppShell showBreadcrumb={false} showInput={false}>
  <div class="dashboard">
    <DashboardGreeting name={user.name} />
    
    <section class="dashboard-section">
      <h2 class="dashboard-section-title">Today's Focus</h2>
      <DailyDoList items={dailyDos} />
    </section>
    
    <section class="dashboard-section">
      <h2 class="dashboard-section-title">Your Progress</h2>
      <ProgressMetrics metrics={progressMetrics} />
    </section>
    
    <section class="dashboard-section">
      <header class="dashboard-section-header">
        <h2 class="dashboard-section-title">You</h2>
        <a href="/profile" class="dashboard-section-link">View Profile →</a>
      </header>
      <ProfilePreview user={user} />
    </section>
    
    <section class="dashboard-section">
      <h2 class="dashboard-section-title">Contents</h2>
      <TOCInline 
        parts={workbookParts} 
        currentLocation={currentLocation}
        onNavigate={handleNavigate}
      />
    </section>
  </div>
</AppShell>
```

### Styling

```css
.dashboard {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

.dashboard-section {
  margin-top: var(--space-8);
}

.dashboard-section:first-child {
  margin-top: 0;
}

.dashboard-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.dashboard-section-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 var(--space-4) 0;
}

.dashboard-section-header .dashboard-section-title {
  margin-bottom: 0;
}

.dashboard-section-link {
  font-size: var(--text-sm);
  color: var(--color-primary);
  text-decoration: none;
}

.dashboard-section-link:hover {
  text-decoration: underline;
}
```

---

## 10.3 `DashboardGreeting`

Welcome message with user's name.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | required | User's display name |

### Rendered Structure

```html
<h1 class="dashboard-greeting">
  Welcome back, {name}
</h1>
```

### Styling

```css
.dashboard-greeting {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-6) 0;
}
```

---

## 10.4 `DailyDoList`

Container for daily engagement prompts.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `DailyDo[]` | required | Daily do items to display |

### Types

```typescript
type DailyDo = {
  id: string;
  type: DailyDoType;
  title: string;
  subtitle: string;
  action: {
    label: string;
    onClick: () => void;
  };
};

type DailyDoType = 
  | 'flow-tracking'
  | 'failure-reframe'
  | 'job-prospecting'
  | 'networking'
  | 'budget-check'
  | 'soared-prompt'
  | 'resume';
```

### Rendered Structure

```html
<div class="daily-do-list">
  {items.length === 0 ? (
    <div class="daily-do-empty">
      <p>Complete your first exercise to unlock daily activities.</p>
    </div>
  ) : (
    items.map(item => (
      <DailyDoCard key={item.id} {...item} />
    ))
  )}
</div>
```

### Styling

```css
.daily-do-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.daily-do-empty {
  padding: var(--space-6);
  text-align: center;
  color: var(--color-muted);
  border: var(--border-thin) dashed color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-md);
}
```

---

## 10.5 `DailyDoCard`

Individual daily engagement prompt.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `DailyDoType` | required | Type for icon selection |
| `title` | `string` | required | Card title |
| `subtitle` | `string` | required | Description text |
| `action` | `{ label: string, onClick: () => void }` | required | Action button config |

### Icon Mapping

```typescript
const dailyDoIcons: Record<DailyDoType, IconComponent> = {
  'flow-tracking': ActivityIcon,
  'failure-reframe': RefreshIcon,
  'job-prospecting': SearchIcon,
  'networking': UsersIcon,
  'budget-check': CalculatorIcon,
  'soared-prompt': BookOpenIcon,
  'resume': PlayIcon,
};
```

### Rendered Structure

```html
<div class="daily-do-card">
  <span class="daily-do-icon" aria-hidden="true">
    <Icon />
  </span>
  <div class="daily-do-content">
    <h3 class="daily-do-title">{title}</h3>
    <p class="daily-do-subtitle">{subtitle}</p>
  </div>
  <Button 
    variant="ghost" 
    size="sm"
    onClick={action.onClick}
  >
    {action.label} →
  </Button>
</div>
```

### Styling

```css
.daily-do-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: transparent;
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
  border-left: 3px solid var(--color-primary);
  border-radius: var(--radius-md);
  transition: background-color var(--duration-fast) ease,
              box-shadow var(--duration-fast) ease;
}

.daily-do-card:hover {
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
}

.daily-do-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  border-radius: var(--radius-sm);
  color: var(--color-primary);
  flex-shrink: 0;
}

.daily-do-icon svg {
  width: 20px;
  height: 20px;
}

.daily-do-content {
  flex: 1;
  min-width: 0;
}

.daily-do-title {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  margin: 0;
}

.daily-do-subtitle {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: var(--space-1) 0 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 767px) {
  .daily-do-card {
    flex-wrap: wrap;
  }
  
  .daily-do-content {
    flex: 1 1 calc(100% - 52px);
  }
  
  .daily-do-card .button {
    margin-left: 52px;
    margin-top: var(--space-2);
  }
}
```

---

## 10.6 `ProgressMetrics`

Row of progress statistic boxes.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `metrics` | `ProgressMetricData[]` | required | Metrics to display |

### Types

```typescript
type ProgressMetricData = {
  value: string | number;
  label: string;
};
```

### Default Metrics

```typescript
// Adaptive based on user progress
const getDefaultMetrics = (user: User): ProgressMetricData[] => {
  const hasSkills = user.skills.length > 0;
  
  return [
    { value: `${user.completionPercent}%`, label: 'Complete' },
    { value: user.streakDays, label: 'Day Streak' },
    hasSkills 
      ? { value: user.skills.length, label: 'Skills' }
      : { value: user.exercisesCompleted, label: 'Exercises' },
  ];
};
```

### Rendered Structure

```html
<div class="progress-metrics">
  {metrics.map((metric, index) => (
    <ProgressMetric key={index} {...metric} />
  ))}
</div>
```

### Styling

```css
.progress-metrics {
  display: flex;
  gap: var(--space-3);
}

@media (max-width: 767px) {
  .progress-metrics {
    gap: var(--space-2);
  }
}
```

---

## 10.7 `ProgressMetric`

Single progress statistic box.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| number` | required | Metric value |
| `label` | `string` | required | Metric label |

### Rendered Structure

```html
<div class="progress-metric">
  <span class="progress-metric-value">{value}</span>
  <span class="progress-metric-label">{label}</span>
</div>
```

### Styling

```css
.progress-metric {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-4);
  background: color-mix(in srgb, var(--color-muted) 5%, transparent);
  border-radius: var(--radius-md);
}

.progress-metric-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: 1;
}

.progress-metric-label {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-top: var(--space-1);
}

@media (max-width: 767px) {
  .progress-metric {
    padding: var(--space-3);
  }
  
  .progress-metric-value {
    font-size: var(--text-2xl);
  }
  
  .progress-metric-label {
    font-size: var(--text-xs);
  }
}
```

---

## 10.8 `ProfilePreview`

Compact user profile card for dashboard.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `user` | `UserPreview` | required | User data |
| `onClick` | `() => void` | — | Click handler (navigate to profile) |

### Types

```typescript
type UserPreview = {
  name: string;
  topSkills: {
    transferable: string | null;
    selfManagement: string | null;
    knowledge: string | null;
  };
  backgroundColor: BackgroundColorId;
  fontFamily: FontFamilyId;
};
```

### Rendered Structure

```html
<button class="profile-preview" onClick={onClick}>
  <p class="profile-preview-name">{user.name}</p>
  
  {hasAnySkills && (
    <p class="profile-preview-skills">
      {[
        user.topSkills.transferable,
        user.topSkills.selfManagement,
        user.topSkills.knowledge,
      ].filter(Boolean).join(' · ')}
    </p>
  )}
  
  <p class="profile-preview-visual">
    🎨 {getColorName(user.backgroundColor)} + {getFontName(user.fontFamily)}
  </p>
</button>
```

### Helper Functions

```typescript
const colorNames: Record<BackgroundColorId, string> = {
  'ivory': 'Ivory',
  'creamy-tan': 'Creamy Tan',
  'brown': 'Brown',
  'charcoal': 'Charcoal',
  'black': 'Black',
};

const fontNames: Record<FontFamilyId, string> = {
  'inter': 'Sans',
  'lora': 'Serif',
  'courier-prime': 'Typewriter',
  'shadows-into-light': 'Handwritten',
  'jacquard-24': 'Decorative',
};

const getColorName = (id: BackgroundColorId) => colorNames[id];
const getFontName = (id: FontFamilyId) => fontNames[id];
```

### Styling

```css
.profile-preview {
  width: 100%;
  padding: var(--space-4);
  background: color-mix(in srgb, var(--color-muted) 5%, transparent);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 10%, transparent);
  border-radius: var(--radius-md);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--duration-fast) ease,
              border-color var(--duration-fast) ease;
}

.profile-preview:hover {
  background: color-mix(in srgb, var(--color-muted) 10%, transparent);
  border-color: color-mix(in srgb, var(--color-muted) 20%, transparent);
}

.profile-preview:focus {
  outline: none;
  box-shadow: var(--focus-ring);
}

.profile-preview-name {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  margin: 0;
}

.profile-preview-skills {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: var(--space-1) 0 0 0;
}

.profile-preview-visual {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: var(--space-2) 0 0 0;
}
```

---

## 10.9 `TOCInline`

Full table of contents for dashboard with expandable modules.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `parts` | `TOCPart[]` | required | Workbook parts data |
| `currentLocation` | `BreadcrumbLocation` | — | User's current position |
| `expandedPartId` | `string` | — | Auto-expand this part |
| `onNavigate` | `(location: BreadcrumbLocation) => void` | required | Navigation handler |

### Types

```typescript
type TOCPart = {
  id: string;
  title: string;
  progress: number; // 0-100
  status: 'locked' | 'available' | 'in-progress' | 'complete';
  modules: TOCModule[];
};

type TOCModule = {
  id: string;
  title: string;
  status: 'locked' | 'available' | 'in-progress' | 'complete';
  exercises: TOCExercise[];
};

type TOCExercise = {
  id: string;
  title: string;
  status: 'locked' | 'available' | 'in-progress' | 'complete';
};
```

### Rendered Structure

```html
<div class="toc-inline">
  {parts.map(part => (
    <TOCInlinePart
      key={part.id}
      part={part}
      isExpanded={expandedParts.includes(part.id)}
      onToggle={() => togglePart(part.id)}
      currentLocation={currentLocation}
      onNavigate={onNavigate}
    />
  ))}
</div>
```

### Styling

```css
.toc-inline {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
```

---

## 10.10 `TOCInlinePart`

Part row in inline TOC with progress bar.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `part` | `TOCPart` | required | Part data |
| `isExpanded` | `boolean` | `false` | Show modules |
| `onToggle` | `() => void` | required | Expand/collapse handler |
| `currentLocation` | `BreadcrumbLocation` | — | Current position |
| `onNavigate` | `(location: BreadcrumbLocation) => void` | required | Navigation handler |

### Rendered Structure

```html
<div class="toc-part" data-status={part.status}>
  <button 
    class="toc-part-header"
    onClick={onToggle}
    disabled={part.status === 'locked'}
    aria-expanded={isExpanded}
  >
    <div class="toc-part-info">
      <span class="toc-part-title">{part.title}</span>
      {part.status === 'locked' && (
        <span class="toc-part-lock" aria-label="Locked">🔒</span>
      )}
    </div>
    <div class="toc-part-progress">
      <span class="toc-part-percent">{part.progress}%</span>
      <div class="toc-part-bar">
        <div 
          class="toc-part-bar-fill" 
          style={{ width: `${part.progress}%` }}
        />
      </div>
    </div>
    <ChevronIcon 
      class="toc-part-chevron" 
      data-expanded={isExpanded}
      aria-hidden="true"
    />
  </button>
  
  {isExpanded && part.status !== 'locked' && (
    <div class="toc-part-modules">
      {part.modules.map(module => (
        <TOCInlineModule
          key={module.id}
          module={module}
          partId={part.id}
          currentLocation={currentLocation}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  )}
</div>
```

### Styling

```css
.toc-part {
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 15%, transparent);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.toc-part[data-status="locked"] {
  opacity: 0.6;
}

.toc-part-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color var(--duration-fast) ease;
}

.toc-part-header:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-muted) 5%, transparent);
}

.toc-part-header:disabled {
  cursor: not-allowed;
}

.toc-part-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.toc-part-title {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
}

.toc-part-lock {
  font-size: var(--text-sm);
}

.toc-part-progress {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.toc-part-percent {
  font-size: var(--text-sm);
  color: var(--color-muted);
  min-width: 36px;
  text-align: right;
}

.toc-part-bar {
  width: 60px;
  height: 6px;
  background: color-mix(in srgb, var(--color-muted) 20%, transparent);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.toc-part-bar-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width var(--duration-normal) ease;
}

.toc-part-chevron {
  width: 20px;
  height: 20px;
  color: var(--color-muted);
  transition: transform var(--duration-fast) ease;
}

.toc-part-chevron[data-expanded="true"] {
  transform: rotate(180deg);
}

.toc-part-modules {
  border-top: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 10%, transparent);
  padding: var(--space-2);
}
```

---

## 10.11 `TOCInlineModule`

Module row in inline TOC, expandable to show exercises.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `module` | `TOCModule` | required | Module data |
| `partId` | `string` | required | Parent part ID |
| `currentLocation` | `BreadcrumbLocation` | — | Current position |
| `onNavigate` | `(location: BreadcrumbLocation) => void` | required | Navigation handler |

### Rendered Structure

```html
<div class="toc-module" data-status={module.status}>
  <button 
    class="toc-module-header"
    onClick={() => setIsExpanded(!isExpanded)}
    disabled={module.status === 'locked'}
    aria-expanded={isExpanded}
  >
    <ProgressMarker status={getProgressStatus(module.status)} size="sm" />
    <span class="toc-module-title">{module.title}</span>
    {module.status === 'locked' && (
      <span class="toc-module-lock" aria-label="Locked">🔒</span>
    )}
    <ChevronIcon 
      class="toc-module-chevron" 
      data-expanded={isExpanded}
      aria-hidden="true"
    />
  </button>
  
  {isExpanded && module.status !== 'locked' && (
    <div class="toc-module-exercises">
      {module.exercises.map(exercise => (
        <TOCInlineExercise
          key={exercise.id}
          exercise={exercise}
          partId={partId}
          moduleId={module.id}
          isCurrent={isCurrentExercise(exercise.id)}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  )}
</div>
```

### Styling

```css
.toc-module {
  border-radius: var(--radius-sm);
}

.toc-module[data-status="locked"] {
  opacity: 0.5;
}

.toc-module-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  border-radius: var(--radius-sm);
  transition: background-color var(--duration-fast) ease;
}

.toc-module-header:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-muted) 8%, transparent);
}

.toc-module-header:disabled {
  cursor: not-allowed;
}

.toc-module-title {
  flex: 1;
  font-size: var(--text-sm);
}

.toc-module-lock {
  font-size: var(--text-xs);
}

.toc-module-chevron {
  width: 16px;
  height: 16px;
  color: var(--color-muted);
  transition: transform var(--duration-fast) ease;
}

.toc-module-chevron[data-expanded="true"] {
  transform: rotate(180deg);
}

.toc-module-exercises {
  margin-left: var(--space-6);
  padding: var(--space-1) 0;
}
```

---

## 10.12 `TOCInlineExercise`

Exercise row in inline TOC.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `exercise` | `TOCExercise` | required | Exercise data |
| `partId` | `string` | required | Parent part ID |
| `moduleId` | `string` | required | Parent module ID |
| `isCurrent` | `boolean` | `false` | Is current location |
| `onNavigate` | `(location: BreadcrumbLocation) => void` | required | Navigation handler |

### Rendered Structure

```html
<button 
  class="toc-exercise"
  data-status={exercise.status}
  data-current={isCurrent}
  onClick={() => onNavigate({ 
    partId, 
    moduleId, 
    exerciseId: exercise.id 
  })}
  disabled={exercise.status === 'locked'}
>
  <ProgressMarker status={getProgressStatus(exercise.status)} size="sm" />
  <span class="toc-exercise-title">{exercise.title}</span>
  {exercise.status === 'locked' && (
    <span class="toc-exercise-lock" aria-label="Locked">🔒</span>
  )}
</button>
```

### Styling

```css
.toc-exercise {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  border-radius: var(--radius-sm);
  transition: background-color var(--duration-fast) ease;
}

.toc-exercise:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-muted) 8%, transparent);
}

.toc-exercise:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.toc-exercise[data-current="true"] {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.toc-exercise-title {
  flex: 1;
  font-size: var(--text-sm);
}

.toc-exercise-lock {
  font-size: var(--text-xs);
}
```

---

## 10.13 Workbook

Main conversation interface for workbook content.

### URL
`/workbook/[part]/[module]/[exercise]`

Single dynamic page — URL updates as user progresses.

### Behaviors

| Behavior | Detail |
|----------|--------|
| **Initial `/workbook`** | Redirects to current position (or beginning if new) |
| **Locked URL access** | Redirect to current position + Toast "Sorry, we go in order here" |
| **Breadcrumb clicks** | Navigate to Dashboard, auto-expand that section in TOCInline |
| **Module transitions** | Happen inline, URL updates, no page reload |
| **Tool embedding** | Tools render inline when exercises call for them |
| **Scroll** | Auto-scroll to current, "Return to current" when scrolled into history |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `partId` | `string` | required | URL param |
| `moduleId` | `string` | required | URL param |
| `exerciseId` | `string` | required | URL param |

### State

```typescript
type WorkbookState = {
  currentLocation: BreadcrumbLocation;
  messages: Message[];
  scrollState: 'at-current' | 'in-history';
  inputType: InputType;
  inputValue: string;
};
```

### Rendered Structure

```html
<AppShell
  showBreadcrumb={true}
  currentLocation={currentLocation}
  showInput={true}
  inputType={inputType}
>
  <ConversationThread
    messages={messages}
    onScrollStateChange={setScrollState}
    autoScrollOnNew={scrollState === 'at-current'}
  />
</AppShell>
```

### Locked URL Handling

```typescript
const Workbook = ({ partId, moduleId, exerciseId }) => {
  const { currentLocation, isUnlocked } = useWorkbookProgress();
  const { showToast } = useToast();
  const router = useRouter();
  
  useEffect(() => {
    const requestedLocation = { partId, moduleId, exerciseId };
    
    if (!isUnlocked(requestedLocation)) {
      showToast({
        type: 'info',
        message: 'Sorry, we go in order here',
        duration: 3000,
      });
      router.replace(getWorkbookUrl(currentLocation));
    }
  }, [partId, moduleId, exerciseId]);
  
  // ... rest of component
};
```

### Breadcrumb Navigation Handler

```typescript
const handleBreadcrumbNavigate = (location: Partial<BreadcrumbLocation>) => {
  // Navigate to dashboard with part/module expanded in TOC
  router.push({
    pathname: '/dashboard',
    query: {
      expandPart: location.partId,
      expandModule: location.moduleId,
    },
  });
};
```

---

## Related Documents

- **Section 10 Part 2**: Profile Page Components
- **Section 10 Part 3**: Settings Page Components
- **Section 2**: Shell & Navigation Components
- **Section 3**: Conversation Components
- **Design System**: Visual tokens, colors, typography, spacing


# DreamTree Component Specification
## Section 10: Page Components — Part 2: Profile

> Profile page layout with read-only data display and data management components.

---

## 10.14 Profile

Read-only view of all user data gathered through the workbook.

### URL
`/profile`

### Structure (Top to Bottom)

1. `DataPolicyBanner` — Privacy reassurance
2. `ProfileHeader` — Name + visual prefs
3. `ProfileSection`: Skills Inventory
4. `ProfileSection`: Stories & Content
5. `ProfileSection`: Work Factors
6. `ProfileSection`: Values & Priorities
7. `ProfileSection`: Career Paths
8. `DataControls` — Download, restore, delete

### Rendered Structure

```html
<AppShell showBreadcrumb={false} showInput={false}>
  <div class="profile">
    <DataPolicyBanner />
    
    <ProfileHeader 
      name={user.name}
      backgroundColor={user.backgroundColor}
      fontFamily={user.fontFamily}
    />
    
    <ProfileSection
      title="Skills Inventory"
      editLink={{ 
        label: "Edit in workbook", 
        to: "/workbook/part-1/module-1/exercise-1" 
      }}
      lockedUntil={!hasSkills ? "Module 1.1" : null}
    >
      <h3 class="profile-subsection-title">Transferable Skills</h3>
      <SkillsList skills={user.transferableSkills} />
      
      <h3 class="profile-subsection-title">Self-Management Skills</h3>
      <SkillsList skills={user.selfManagementSkills} />
      
      <h3 class="profile-subsection-title">Knowledges</h3>
      <SkillsList skills={user.knowledges} />
    </ProfileSection>
    
    <ProfileSection
      title="Stories & Content"
      editLink={{ label: "Edit in workbook", to: "/workbook/..." }}
      lockedUntil={!hasStories ? "Module 1.1" : null}
    >
      <StoriesList stories={user.soaredStories} />
    </ProfileSection>
    
    <ProfileSection
      title="Work Factors"
      editLink={{ label: "Edit in workbook", to: "/workbook/..." }}
      lockedUntil={!hasWorkFactors ? "Module 1.2" : null}
    >
      <h3 class="profile-subsection-title">Location Preferences</h3>
      <RankedList items={user.locations} />
      
      <h3 class="profile-subsection-title">Workplace Environment</h3>
      <p>{user.workplaceEnvironment}</p>
      
      <h3 class="profile-subsection-title">People Preferences</h3>
      <p>{user.peoplePreferences}</p>
      
      <h3 class="profile-subsection-title">Compensation</h3>
      <p>BATNA: ${user.batna}</p>
    </ProfileSection>
    
    <ProfileSection
      title="Values & Priorities"
      editLink={{ label: "Edit in workbook", to: "/workbook/..." }}
      lockedUntil={!hasValues ? "Module 2.1" : null}
    >
      <h3 class="profile-subsection-title">Work Values</h3>
      <ValuesDisplay values={user.workValues} />
      
      <h3 class="profile-subsection-title">Life Values</h3>
      <ValuesDisplay values={user.lifeValues} />
      
      <h3 class="profile-subsection-title">Work Factor Priorities</h3>
      <RankedList items={user.workFactorPriorities} />
    </ProfileSection>
    
    <ProfileSection
      title="Career Paths"
      editLink={{ label: "Edit in workbook", to: "/workbook/..." }}
      lockedUntil={!hasCareerPaths ? "Module 2.4" : null}
    >
      {user.careerPaths.map(path => (
        <CareerPathCard key={path.id} path={path} />
      ))}
    </ProfileSection>
    
    <DataControls user={user} />
  </div>
</AppShell>
```

### Styling

```css
.profile {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

.profile-subsection-title {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-muted);
  margin: var(--space-4) 0 var(--space-2) 0;
}

.profile-subsection-title:first-child {
  margin-top: 0;
}
```

---

## 10.15 `DataPolicyBanner`

Privacy reassurance message at top of Profile.

### Rendered Structure

```html
<div class="data-policy-banner">
  <ShieldIcon class="data-policy-icon" aria-hidden="true" />
  <p class="data-policy-text">
    Your data belongs to you. We never sell or share your information. 
    You can download or delete everything at any time.
  </p>
  <a href="/privacy" class="data-policy-link">Privacy Policy →</a>
</div>
```

### Styling

```css
.data-policy-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-6);
}

.data-policy-icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.data-policy-text {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: 0;
}

.data-policy-link {
  font-size: var(--text-sm);
  color: var(--color-primary);
  text-decoration: none;
  white-space: nowrap;
}

.data-policy-link:hover {
  text-decoration: underline;
}
```

---

## 10.16 `ProfileHeader`

Name and visual preferences display.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | required | User's name |
| `backgroundColor` | `BackgroundColorId` | required | Selected background |
| `fontFamily` | `FontFamilyId` | required | Selected font |

### Rendered Structure

```html
<header class="profile-header">
  <h1 class="profile-name">{name}</h1>
  <p class="profile-visual">
    🎨 {getColorName(backgroundColor)} + {getFontName(fontFamily)}
  </p>
  <a href="/settings" class="profile-settings-link">Edit in Settings →</a>
</header>
```

### Styling

```css
.profile-header {
  margin-bottom: var(--space-8);
}

.profile-name {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  margin: 0;
}

.profile-visual {
  font-size: var(--text-base);
  color: var(--color-muted);
  margin: var(--space-2) 0 0 0;
}

.profile-settings-link {
  display: inline-block;
  font-size: var(--text-sm);
  color: var(--color-primary);
  text-decoration: none;
  margin-top: var(--space-2);
}

.profile-settings-link:hover {
  text-decoration: underline;
}
```

---

## 10.17 `ProfileSection`

Reusable section wrapper with optional lock state.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Section heading |
| `editLink` | `{ label: string, to: string }` | — | Workbook edit link |
| `lockedUntil` | `string \| null` | `null` | Module name if locked |
| `children` | `ReactNode` | required | Section content |

### Rendered Structure

```html
<section class="profile-section" data-locked={!!lockedUntil}>
  <header class="profile-section-header">
    <h2 class="profile-section-title">{title}</h2>
    {editLink && !lockedUntil && (
      <a href={editLink.to} class="profile-section-edit">
        {editLink.label} →
      </a>
    )}
  </header>
  
  {lockedUntil ? (
    <div class="profile-section-locked">
      <LockIcon aria-hidden="true" />
      <p>You'll unlock this in <strong>{lockedUntil}</strong></p>
    </div>
  ) : (
    <div class="profile-section-content">
      {children}
    </div>
  )}
</section>
```

### Styling

```css
.profile-section {
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 15%, transparent);
}

.profile-section:first-of-type {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.profile-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.profile-section-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin: 0;
}

.profile-section-edit {
  font-size: var(--text-sm);
  color: var(--color-primary);
  text-decoration: none;
}

.profile-section-edit:hover {
  text-decoration: underline;
}

.profile-section-locked {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6);
  background: color-mix(in srgb, var(--color-muted) 5%, transparent);
  border-radius: var(--radius-md);
  color: var(--color-muted);
}

.profile-section-locked svg {
  width: 24px;
  height: 24px;
  opacity: 0.5;
}

.profile-section-locked p {
  margin: 0;
  font-size: var(--text-sm);
}

.profile-section-content {
  /* Content styling handled by children */
}
```

---

## 10.18 `SkillsList`

Displays ranked skills with mastery dots.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `skills` | `Skill[]` | required | Skills to display |

### Types

```typescript
type Skill = {
  id: string;
  name: string;
  mastery: number; // 1-5
  rank: number;
};
```

### Rendered Structure

```html
<ol class="skills-list">
  {skills.map(skill => (
    <li key={skill.id} class="skills-list-item">
      <span class="skills-list-rank">{skill.rank}.</span>
      <span class="skills-list-name">{skill.name}</span>
      <MasteryDots value={skill.mastery} />
    </li>
  ))}
</ol>
```

### Styling

```css
.skills-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.skills-list-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) 0;
  border-bottom: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 10%, transparent);
}

.skills-list-item:last-child {
  border-bottom: none;
}

.skills-list-rank {
  width: 24px;
  font-size: var(--text-sm);
  color: var(--color-muted);
  text-align: right;
}

.skills-list-name {
  flex: 1;
  font-size: var(--text-base);
}
```

---

## 10.19 `MasteryDots`

Visual mastery rating display (1-5 dots).

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | required | Mastery level 1-5 |
| `max` | `number` | `5` | Maximum dots |

### Rendered Structure

```html
<div 
  class="mastery-dots" 
  role="img" 
  aria-label={`Mastery: ${value} out of ${max}`}
>
  {Array.from({ length: max }, (_, i) => (
    <span 
      key={i} 
      class="mastery-dot" 
      data-filled={i < value}
    />
  ))}
</div>
```

### Styling

```css
.mastery-dots {
  display: flex;
  gap: 4px;
}

.mastery-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-muted) 30%, transparent);
}

.mastery-dot[data-filled="true"] {
  background: var(--color-primary);
}
```

---

## 10.20 `StoriesList`

List of SOARED stories with titles only.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stories` | `Story[]` | required | Stories to display |

### Types

```typescript
type Story = {
  id: string;
  title: string;
  workbookLocation: BreadcrumbLocation;
};
```

### Rendered Structure

```html
<ul class="stories-list">
  {stories.map(story => (
    <li key={story.id} class="stories-list-item">
      <span class="stories-list-title">{story.title}</span>
      <a 
        href={getWorkbookUrl(story.workbookLocation)} 
        class="stories-list-link"
      >
        View in workbook →
      </a>
    </li>
  ))}
</ul>
```

### Styling

```css
.stories-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.stories-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 10%, transparent);
}

.stories-list-item:last-child {
  border-bottom: none;
}

.stories-list-title {
  font-size: var(--text-base);
}

.stories-list-link {
  font-size: var(--text-sm);
  color: var(--color-primary);
  text-decoration: none;
  white-space: nowrap;
}

.stories-list-link:hover {
  text-decoration: underline;
}
```

---

## 10.21 `RankedList`

Generic ranked list display.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `RankedItem[]` | required | Items to display |

### Types

```typescript
type RankedItem = {
  id: string;
  rank: number;
  label: string;
};
```

### Rendered Structure

```html
<ol class="ranked-list">
  {items.map(item => (
    <li key={item.id} class="ranked-list-item">
      <span class="ranked-list-rank">{item.rank}.</span>
      <span class="ranked-list-label">{item.label}</span>
    </li>
  ))}
</ol>
```

### Styling

```css
.ranked-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ranked-list-item {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  padding: var(--space-2) 0;
}

.ranked-list-rank {
  width: 24px;
  font-size: var(--text-sm);
  color: var(--color-muted);
  text-align: right;
}

.ranked-list-label {
  font-size: var(--text-base);
}
```

---

## 10.22 `ValuesDisplay`

Display for work/life values.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `values` | `string[]` | required | Value statements |

### Rendered Structure

```html
<ul class="values-display">
  {values.map((value, index) => (
    <li key={index} class="values-display-item">
      {value}
    </li>
  ))}
</ul>
```

### Styling

```css
.values-display {
  list-style: disc;
  padding-left: var(--space-5);
  margin: 0;
}

.values-display-item {
  font-size: var(--text-base);
  padding: var(--space-1) 0;
}
```

---

## 10.23 `CareerPathCard`

Display card for a career path option.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `path` | `CareerPath` | required | Career path data |

### Types

```typescript
type CareerPath = {
  id: string;
  title: string;
  timeline: string;
  description: string;
  workbookLocation: BreadcrumbLocation;
};
```

### Rendered Structure

```html
<div class="career-path-card">
  <h3 class="career-path-title">{path.title}</h3>
  <p class="career-path-timeline">{path.timeline}</p>
  <p class="career-path-description">{path.description}</p>
  <a 
    href={getWorkbookUrl(path.workbookLocation)} 
    class="career-path-link"
  >
    View details in workbook →
  </a>
</div>
```

### Styling

```css
.career-path-card {
  padding: var(--space-4);
  background: color-mix(in srgb, var(--color-muted) 5%, transparent);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-3);
}

.career-path-card:last-child {
  margin-bottom: 0;
}

.career-path-title {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  margin: 0;
}

.career-path-timeline {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: var(--space-1) 0 0 0;
}

.career-path-description {
  font-size: var(--text-sm);
  margin: var(--space-2) 0 0 0;
}

.career-path-link {
  display: inline-block;
  font-size: var(--text-sm);
  color: var(--color-primary);
  text-decoration: none;
  margin-top: var(--space-2);
}

.career-path-link:hover {
  text-decoration: underline;
}
```

---

## 10.24 `DataControls`

Download, restore, and delete data controls.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onDownload` | `(format: 'json' \| 'zip') => void` | required | Download handler |
| `onRestore` | `(file: File) => void` | required | Restore handler |
| `onDelete` | `() => void` | required | Delete handler |

### Rendered Structure

```html
<div class="data-controls">
  <h2 class="data-controls-title">Data Management</h2>
  
  <DownloadDataCard onDownload={onDownload} />
  <RestoreDataCard onRestore={onRestore} />
  <DeleteDataCard onDelete={onDelete} />
</div>
```

### Styling

```css
.data-controls {
  margin-top: var(--space-10);
  padding-top: var(--space-6);
  border-top: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 15%, transparent);
}

.data-controls-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-4) 0;
}
```

---

## 10.25 `DownloadDataCard`

Download data with format selection.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onDownload` | `(format: 'json' \| 'zip') => void` | required | Download handler |

### Rendered Structure

```html
<div class="data-card">
  <div class="data-card-content">
    <h3 class="data-card-title">Download Your Data</h3>
    <p class="data-card-description">
      Download as JSON to back up and restore later, or as a ZIP with 
      readable documents.
    </p>
  </div>
  <div class="data-card-actions">
    <Button 
      variant="secondary" 
      size="sm"
      onClick={() => onDownload('json')}
    >
      Download JSON
    </Button>
    <Button 
      variant="secondary" 
      size="sm"
      onClick={() => onDownload('zip')}
    >
      Download ZIP
    </Button>
  </div>
</div>
```

---

## 10.26 `RestoreDataCard`

Restore data from JSON backup.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onRestore` | `(file: File) => void` | required | Restore handler |

### State

```typescript
type RestoreState = 'idle' | 'preview' | 'confirming';
```

### Rendered Structure

```html
<div class="data-card">
  <div class="data-card-content">
    <h3 class="data-card-title">Restore from Backup</h3>
    <p class="data-card-description">
      Upload a JSON backup to restore your data. This will fully replace 
      your current data.
    </p>
  </div>
  <div class="data-card-actions">
    <Button 
      variant="secondary" 
      size="sm"
      onClick={openFileDialog}
    >
      Upload JSON
    </Button>
  </div>
  <input 
    type="file" 
    accept=".json"
    ref={fileInputRef}
    onChange={handleFileSelect}
    hidden
  />
</div>
```

---

## 10.27 `RestoreModal`

Preview and confirm data restore.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Show/hide modal |
| `onClose` | `() => void` | required | Close handler |
| `preview` | `RestorePreview` | required | Data preview |
| `onConfirm` | `() => void` | required | Confirm handler |

### Types

```typescript
type RestorePreview = {
  name: string;
  completionPercent: number;
  skillsCount: number;
  storiesCount: number;
  exportDate: Date;
};
```

### Rendered Structure

```html
<Modal
  open={open}
  onClose={onClose}
  title="Restore Your Data"
  size="md"
>
  <div class="restore-preview">
    <p class="restore-preview-intro">
      This backup contains:
    </p>
    <ul class="restore-preview-list">
      <li><strong>Name:</strong> {preview.name}</li>
      <li><strong>Progress:</strong> {preview.completionPercent}% complete</li>
      <li><strong>Skills:</strong> {preview.skillsCount} identified</li>
      <li><strong>Stories:</strong> {preview.storiesCount} captured</li>
      <li><strong>Exported:</strong> {formatDate(preview.exportDate)}</li>
    </ul>
    <p class="restore-warning">
      ⚠️ This will fully replace your current data. You can edit any 
      answers in the workbook after upload.
    </p>
  </div>
  
  <div class="modal-actions">
    <Button variant="secondary" onClick={onClose}>
      Cancel
    </Button>
    <Button variant="primary" onClick={onConfirm}>
      Restore
    </Button>
  </div>
</Modal>
```

---

## 10.28 `DeleteDataCard`

Delete all data with warning.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onDelete` | `() => void` | required | Delete handler (opens modal) |

### Rendered Structure

```html
<div class="data-card data-card-danger">
  <div class="data-card-content">
    <h3 class="data-card-title">Delete All Data</h3>
    <p class="data-card-description">
      Permanently delete all your data. This cannot be undone.
    </p>
  </div>
  <div class="data-card-actions">
    <Button 
      variant="danger" 
      size="sm"
      onClick={onDelete}
    >
      Delete All Data
    </Button>
  </div>
</div>
```

### Data Card Styling

```css
.data-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  background: color-mix(in srgb, var(--color-muted) 5%, transparent);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-3);
}

.data-card:last-child {
  margin-bottom: 0;
}

.data-card-danger {
  background: color-mix(in srgb, var(--color-error) 5%, transparent);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-error) 20%, transparent);
}

.data-card-content {
  flex: 1;
}

.data-card-title {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  margin: 0;
}

.data-card-description {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: var(--space-1) 0 0 0;
}

.data-card-actions {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .data-card {
    flex-direction: column;
    align-items: stretch;
  }
  
  .data-card-actions {
    margin-top: var(--space-3);
  }
}
```

---

## 10.29 `DeleteDataModal` (Step 1)

First step of delete flow — explains consequences.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Show/hide modal |
| `onClose` | `() => void` | required | Close handler |
| `onContinue` | `() => void` | required | Proceed to step 2 |

### Rendered Structure

```html
<Modal
  open={open}
  onClose={onClose}
  title="Delete All Your Data"
  size="md"
>
  <div class="delete-warning">
    <p>You are about to delete:</p>
    <ul>
      <li>All your workbook progress</li>
      <li>All identified skills and stories</li>
      <li>All preferences and settings</li>
      <li>All tool instances you've created</li>
    </ul>
    <p class="delete-warning-emphasis">
      All context will be lost. This cannot be undone.
    </p>
  </div>
  
  <div class="modal-actions">
    <Button variant="secondary" onClick={onClose}>
      Cancel
    </Button>
    <Button variant="danger" onClick={onContinue}>
      Continue
    </Button>
  </div>
</Modal>
```

### Styling

```css
.delete-warning ul {
  margin: var(--space-3) 0;
  padding-left: var(--space-5);
}

.delete-warning li {
  padding: var(--space-1) 0;
}

.delete-warning-emphasis {
  font-weight: var(--font-medium);
  color: var(--color-error);
}
```

---

## 10.30 `DeleteConfirmModal` (Step 2)

Second step of delete flow — type to confirm.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Show/hide modal |
| `onClose` | `() => void` | required | Close handler |
| `onConfirm` | `() => void` | required | Final delete handler |

### State

```typescript
const [confirmText, setConfirmText] = useState('');
const isValid = confirmText === 'I UNDERSTAND WHAT DELETE MEANS';
```

### Rendered Structure

```html
<Modal
  open={open}
  onClose={onClose}
  title="This is Permanent"
  size="md"
>
  <div class="delete-confirm">
    <p>This action cannot be undone. Your data will be permanently deleted.</p>
    <p>Type <strong>I UNDERSTAND WHAT DELETE MEANS</strong> to confirm:</p>
    <TextInput
      value={confirmText}
      onChange={setConfirmText}
      placeholder="Type the confirmation phrase"
      autoFocus
    />
  </div>
  
  <div class="modal-actions">
    <Button variant="secondary" onClick={onClose}>
      Cancel
    </Button>
    <Button 
      variant="danger" 
      onClick={onConfirm}
      disabled={!isValid}
    >
      Delete Everything
    </Button>
  </div>
</Modal>
```

---

## 10.31 `RestorePrompt`

Prompt for returning users with no data on file.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onRestore` | `() => void` | required | Open restore flow |
| `onStartFresh` | `() => void` | required | Begin new journey |

### Rendered Structure

```html
<div class="restore-prompt">
  <h2 class="restore-prompt-title">Welcome Back!</h2>
  <p class="restore-prompt-description">
    It looks like you've used DreamTree before. Do you have a JSON 
    backup to restore your progress?
  </p>
  <div class="restore-prompt-actions">
    <Button variant="primary" onClick={onRestore}>
      Restore from Backup
    </Button>
    <Button variant="secondary" onClick={onStartFresh}>
      Start Fresh
    </Button>
  </div>
</div>
```

### Styling

```css
.restore-prompt {
  max-width: 400px;
  margin: 0 auto;
  padding: var(--space-8);
  text-align: center;
}

.restore-prompt-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-4) 0;
}

.restore-prompt-description {
  font-size: var(--text-base);
  color: var(--color-muted);
  margin: 0 0 var(--space-6) 0;
}

.restore-prompt-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
```

---

## Related Documents

- **Section 10 Part 1**: Dashboard Components
- **Section 10 Part 3**: Settings Page Components
- **Section 7**: Overlay Components (Modal)
- **Design System**: Visual tokens, colors, typography, spacing


# DreamTree Component Specification
## Section 10: Page Components — Part 3: Settings

> Settings page layout with visual preferences, accessibility, notifications, account, and data management.

---

## 10.32 Settings

User preferences, notifications, account, and data management.

### URL
`/settings`

### Structure (Top to Bottom)

1. `SettingsSection`: Visual Preferences
2. `SettingsSection`: Accessibility
3. `SettingsSection`: Notifications
4. `SettingsSection`: Account
5. `SettingsSection`: Data Management

### Behaviors

| Behavior | Detail |
|----------|--------|
| **Visual changes** | Update live immediately |
| **All changes** | Auto-save on interaction |

### Rendered Structure

```html
<AppShell showBreadcrumb={false} showInput={false}>
  <div class="settings">
    <h1 class="settings-title">Settings</h1>
    
    <SettingsSection title="Visual Preferences">
      <VisualPreferencesEditor ... />
    </SettingsSection>
    
    <SettingsSection title="Accessibility">
      <AccessibilitySettings ... />
    </SettingsSection>
    
    <SettingsSection title="Notifications">
      <NotificationSettings ... />
    </SettingsSection>
    
    <SettingsSection title="Account">
      <AccountSettings ... />
    </SettingsSection>
    
    <SettingsSection title="Data Management">
      <DataControls ... />
    </SettingsSection>
  </div>
</AppShell>
```

### Styling

```css
.settings {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

.settings-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-6) 0;
}
```

---

## 10.33 `SettingsSection`

Reusable settings section wrapper.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Section heading |
| `children` | `ReactNode` | required | Section content |

### Rendered Structure

```html
<section class="settings-section">
  <h2 class="settings-section-title">{title}</h2>
  <div class="settings-section-content">
    {children}
  </div>
</section>
```

### Styling

```css
.settings-section {
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 15%, transparent);
}

.settings-section:first-of-type {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.settings-section-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-4) 0;
}

.settings-section-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
```

---

## 10.34 `VisualPreferencesEditor`

Live-updating visual preference controls.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backgroundColor` | `BackgroundColorId` | required | Current background |
| `textColor` | `TextColorId` | required | Current text color |
| `fontFamily` | `FontFamilyId` | required | Current font |
| `onBackgroundChange` | `(id: BackgroundColorId) => void` | required | Background handler |
| `onTextChange` | `(id: TextColorId) => void` | required | Text handler |
| `onFontChange` | `(id: FontFamilyId) => void` | required | Font handler |

### Color Options

```typescript
const backgroundColors = [
  { id: 'ivory', name: 'Ivory', hex: '#FAF8F5' },
  { id: 'creamy-tan', name: 'Creamy Tan', hex: '#E8DCC4' },
  { id: 'brown', name: 'Brown', hex: '#5C4033' },
  { id: 'charcoal', name: 'Charcoal', hex: '#2C3E50' },
  { id: 'black', name: 'Black', hex: '#1A1A1A' },
];

const textColors = backgroundColors; // Same palette
```

### Font Options

```typescript
const fonts = [
  { id: 'inter', name: 'Sans', family: 'Inter, sans-serif' },
  { id: 'lora', name: 'Serif', family: 'Lora, serif' },
  { id: 'courier-prime', name: 'Typewriter', family: '"Courier Prime", monospace' },
  { id: 'shadows-into-light', name: 'Handwritten', family: '"Shadows Into Light", cursive' },
  { id: 'jacquard-24', name: 'Decorative', family: '"Jacquard 24", serif' },
];
```

### Rendered Structure

```html
<div class="visual-preferences">
  <div class="visual-preferences-group">
    <label class="visual-preferences-label">Background Color</label>
    <div class="visual-preferences-swatches">
      {backgroundColors.map(color => (
        <ColorSwatch
          key={color.id}
          color={color}
          isSelected={backgroundColor === color.id}
          onSelect={() => onBackgroundChange(color.id)}
        />
      ))}
    </div>
  </div>
  
  <div class="visual-preferences-group">
    <label class="visual-preferences-label">Text Color</label>
    <div class="visual-preferences-swatches">
      {textColors.map(color => (
        <ColorSwatch
          key={color.id}
          color={color}
          isSelected={textColor === color.id}
          onSelect={() => onTextChange(color.id)}
        />
      ))}
    </div>
  </div>
  
  <div class="visual-preferences-group">
    <label class="visual-preferences-label">Font</label>
    <div class="visual-preferences-fonts">
      {fonts.map(font => (
        <FontPreview
          key={font.id}
          font={font}
          isSelected={fontFamily === font.id}
          onSelect={() => onFontChange(font.id)}
        />
      ))}
    </div>
  </div>
</div>
```

### Styling

```css
.visual-preferences {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.visual-preferences-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.visual-preferences-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.visual-preferences-swatches {
  display: flex;
  gap: var(--space-2);
}

.visual-preferences-fonts {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
```

---

## 10.35 `AccessibilitySettings`

Reduced motion toggle and font size slider.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `reducedMotion` | `boolean` | `false` | Reduced motion enabled |
| `fontSize` | `number` | `16` | Font size in px |
| `onReducedMotionChange` | `(enabled: boolean) => void` | required | Toggle handler |
| `onFontSizeChange` | `(size: number) => void` | required | Size handler |

### Rendered Structure

```html
<div class="accessibility-settings">
  <div class="settings-row">
    <div class="settings-row-content">
      <span class="settings-row-label">Reduced Motion</span>
      <span class="settings-row-description">
        Minimize animations throughout the app
      </span>
    </div>
    <Toggle
      checked={reducedMotion}
      onChange={onReducedMotionChange}
      ariaLabel="Reduced motion"
    />
  </div>
  
  <div class="settings-row">
    <div class="settings-row-content">
      <span class="settings-row-label">Font Size</span>
      <span class="settings-row-description">
        {fontSize}px
      </span>
    </div>
    <FontSizeSlider
      value={fontSize}
      min={14}
      max={22}
      onChange={onFontSizeChange}
    />
  </div>
</div>
```

---

## 10.36 `FontSizeSlider`

Slider for adjusting font size.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `16` | Current size in px |
| `min` | `number` | `14` | Minimum size |
| `max` | `number` | `22` | Maximum size |
| `onChange` | `(size: number) => void` | required | Change handler |

### Rendered Structure

```html
<div class="font-size-slider">
  <span class="font-size-slider-label font-size-slider-min">A</span>
  <input
    type="range"
    class="font-size-slider-input"
    min={min}
    max={max}
    value={value}
    onChange={(e) => onChange(parseInt(e.target.value))}
    aria-label="Font size"
  />
  <span class="font-size-slider-label font-size-slider-max">A</span>
</div>
```

### Styling

```css
.font-size-slider {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 200px;
}

.font-size-slider-label {
  font-weight: var(--font-medium);
  color: var(--color-muted);
}

.font-size-slider-min {
  font-size: 12px;
}

.font-size-slider-max {
  font-size: 20px;
}

.font-size-slider-input {
  flex: 1;
  height: 4px;
  appearance: none;
  background: color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-full);
}

.font-size-slider-input::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  cursor: pointer;
}

.font-size-slider-input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  cursor: pointer;
  border: none;
}

.font-size-slider-input:focus {
  outline: none;
}

.font-size-slider-input:focus::-webkit-slider-thumb {
  box-shadow: var(--focus-ring);
}
```

---

## 10.37 `NotificationSettings`

Reminder configuration.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enabled` | `boolean` | `false` | Notifications enabled |
| `days` | `DayOfWeek[]` | `[]` | Selected days |
| `time` | `string` | `'09:00'` | Reminder time |
| `onEnabledChange` | `(enabled: boolean) => void` | required | Toggle handler |
| `onDaysChange` | `(days: DayOfWeek[]) => void` | required | Days handler |
| `onTimeChange` | `(time: string) => void` | required | Time handler |

### Types

```typescript
type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
```

### Rendered Structure

```html
<div class="notification-settings">
  <div class="settings-row">
    <div class="settings-row-content">
      <span class="settings-row-label">Enable Reminders</span>
      <span class="settings-row-description">
        Get notified to continue your journey
      </span>
    </div>
    <Toggle
      checked={enabled}
      onChange={onEnabledChange}
      ariaLabel="Enable reminders"
    />
  </div>
  
  {enabled && (
    <>
      <div class="notification-days">
        <label class="notification-days-label">Remind me on</label>
        <DaySelector
          selected={days}
          onChange={onDaysChange}
        />
      </div>
      
      <div class="notification-time">
        <label class="notification-time-label">At</label>
        <TimePicker
          value={time}
          onChange={onTimeChange}
        />
      </div>
    </>
  )}
</div>
```

---

## 10.38 `DaySelector`

Multi-select day of week picker.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selected` | `DayOfWeek[]` | `[]` | Selected days |
| `onChange` | `(days: DayOfWeek[]) => void` | required | Change handler |

### Day Configuration

```typescript
const days = [
  { id: 'mon', shortLabel: 'M', fullLabel: 'Monday' },
  { id: 'tue', shortLabel: 'T', fullLabel: 'Tuesday' },
  { id: 'wed', shortLabel: 'W', fullLabel: 'Wednesday' },
  { id: 'thu', shortLabel: 'T', fullLabel: 'Thursday' },
  { id: 'fri', shortLabel: 'F', fullLabel: 'Friday' },
  { id: 'sat', shortLabel: 'S', fullLabel: 'Saturday' },
  { id: 'sun', shortLabel: 'S', fullLabel: 'Sunday' },
];
```

### Rendered Structure

```html
<div class="day-selector">
  <label class="day-selector-all">
    <Checkbox
      checked={selected.length === 7}
      indeterminate={selected.length > 0 && selected.length < 7}
      onChange={handleSelectAll}
    />
    <span>Select all</span>
  </label>
  
  <div class="day-selector-days">
    {days.map(day => (
      <button
        key={day.id}
        class="day-selector-day"
        data-selected={selected.includes(day.id)}
        onClick={() => toggleDay(day.id)}
        aria-label={day.fullLabel}
        aria-pressed={selected.includes(day.id)}
      >
        {day.shortLabel}
      </button>
    ))}
  </div>
</div>
```

### Styling

```css
.day-selector {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.day-selector-all {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  cursor: pointer;
}

.day-selector-days {
  display: flex;
  gap: var(--space-1);
}

.day-selector-day {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: background-color var(--duration-fast) ease,
              border-color var(--duration-fast) ease;
}

.day-selector-day:hover {
  border-color: color-mix(in srgb, var(--color-muted) 40%, transparent);
}

.day-selector-day[data-selected="true"] {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
}

.day-selector-day:focus {
  outline: none;
  box-shadow: var(--focus-ring);
}
```

---

## 10.39 `TimePicker`

Time input with locale-aware format (auto-detects 12hr/24hr).

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `'09:00'` | Time in HH:MM format |
| `onChange` | `(time: string) => void` | required | Change handler |

### Rendered Structure

```html
<input
  type="time"
  class="time-picker"
  value={value}
  onChange={(e) => onChange(e.target.value)}
  aria-label="Reminder time"
/>
```

### Styling

```css
.time-picker {
  padding: var(--space-2) var(--space-3);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  background: transparent;
  color: var(--color-text);
}

.time-picker:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}
```

---

## 10.40 `AccountSettings`

Auth methods, email, logout, and upgrade.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `authMethods` | `AuthMethod[]` | `[]` | Linked auth methods |
| `email` | `string \| null` | `null` | User email if linked |
| `tier` | `'free' \| 'paid'` | `'free'` | Subscription tier |
| `onAddAuthMethod` | `() => void` | required | Add method handler |
| `onRemoveAuthMethod` | `(id: string) => void` | required | Remove handler |
| `onEmailChange` | `(email: string) => void` | — | Email change handler |
| `onLogout` | `() => void` | required | Logout handler |
| `onUpgrade` | `() => void` | — | Upgrade handler |

### Types

```typescript
type AuthMethod = {
  id: string;
  type: 'email' | 'wallet' | 'passkey';
  label: string; // e.g., "user@example.com" or "0x1234...5678"
};
```

### Auth Icons

```typescript
const authIcons: Record<AuthMethod['type'], IconComponent> = {
  'email': MailIcon,
  'wallet': WalletIcon,
  'passkey': KeyIcon,
};
```

### Rendered Structure

```html
<div class="account-settings">
  <div class="account-auth-methods">
    <h3 class="account-subsection-title">Authentication Methods</h3>
    
    {authMethods.map(method => (
      <div key={method.id} class="account-auth-method">
        <span class="account-auth-method-icon">
          <Icon component={authIcons[method.type]} />
        </span>
        <span class="account-auth-method-label">{method.label}</span>
        {authMethods.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveAuthMethod(method.id)}
          >
            Remove
          </Button>
        )}
      </div>
    ))}
    
    <Button
      variant="secondary"
      size="sm"
      onClick={onAddAuthMethod}
    >
      Add Authentication Method
    </Button>
  </div>
  
  {email && onEmailChange && (
    <div class="account-email">
      <h3 class="account-subsection-title">Email Address</h3>
      <TextInput
        value={email}
        onChange={onEmailChange}
        type="email"
      />
    </div>
  )}
  
  <div class="account-actions">
    {tier === 'free' && onUpgrade && (
      <Button variant="primary" onClick={onUpgrade}>
        Upgrade to Paid
      </Button>
    )}
    
    {tier === 'paid' && (
      <Button variant="secondary" onClick={onManageSubscription}>
        Manage Subscription
      </Button>
    )}
    
    <Button variant="ghost" onClick={onLogout}>
      Log Out
    </Button>
  </div>
</div>
```

### Styling

```css
.account-settings {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.account-subsection-title {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-muted);
  margin: 0 0 var(--space-3) 0;
}

.account-auth-methods {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.account-auth-method {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: color-mix(in srgb, var(--color-muted) 5%, transparent);
  border-radius: var(--radius-sm);
}

.account-auth-method-icon {
  width: 20px;
  height: 20px;
  color: var(--color-muted);
}

.account-auth-method-label {
  flex: 1;
  font-size: var(--text-sm);
}

.account-actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}
```

---

## 10.41 `Toggle`

Boolean toggle switch.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | `false` | Toggle state |
| `onChange` | `(checked: boolean) => void` | required | Change handler |
| `disabled` | `boolean` | `false` | Disable toggle |
| `ariaLabel` | `string` | required | Accessible label |

### Rendered Structure

```html
<button
  type="button"
  role="switch"
  class="toggle"
  data-checked={checked}
  aria-checked={checked}
  aria-label={ariaLabel}
  onClick={() => onChange(!checked)}
  disabled={disabled}
>
  <span class="toggle-thumb" />
</button>
```

### Styling

```css
.toggle {
  width: 44px;
  height: 24px;
  padding: 2px;
  background: color-mix(in srgb, var(--color-muted) 30%, transparent);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background-color var(--duration-fast) ease;
}

.toggle[data-checked="true"] {
  background: var(--color-primary);
}

.toggle:focus {
  outline: none;
  box-shadow: var(--focus-ring);
}

.toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-thumb {
  display: block;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: var(--radius-full);
  transition: transform var(--duration-fast) ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle[data-checked="true"] .toggle-thumb {
  transform: translateX(20px);
}
```

---

## 10.42 Settings Row Helper

Common styling for settings rows used throughout Settings page.

### Styling

```css
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-bottom: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 10%, transparent);
}

.settings-row:last-child {
  border-bottom: none;
}

.settings-row-content {
  flex: 1;
}

.settings-row-label {
  display: block;
  font-size: var(--text-base);
  font-weight: var(--font-medium);
}

.settings-row-description {
  display: block;
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-top: var(--space-1);
}
```

---

## Related Documents

- **Section 10 Part 1**: Dashboard Components
- **Section 10 Part 2**: Profile Page Components
- **Section 8**: Onboarding Components (ColorSwatch, FontPreview)
- **Section 4**: Form Inputs (TextInput, Checkbox)
- **Design System**: Visual tokens, colors, typography, spacing


# DreamTree Component Specification
## Section 11: Credits, Assessments & Skills — Part 1

> New components for attribution and personality/competency assessment.

---

## 11.1 `InlineCitation`

Citation marker within content. Uses existing `Tooltip` component.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `number` | `number` | required | Citation number (assigned by first appearance in content) |
| `shortCitation` | `string` | required | Tooltip text, e.g., "Burnett & Evans, *Designing Your Life*" |

### Behavior

| Interaction | Result |
|-------------|--------|
| Hover (desktop) / Tap-hold (mobile) | Shows `Tooltip` with `shortCitation` |
| Click / Tap | Navigates to `/credits#citation-{number}` |

### Rendered Structure

```html
<a 
  href="/credits#citation-{number}"
  class="inline-citation"
  aria-label="Citation {number}: {shortCitation}"
>
  <Tooltip content={shortCitation} position="top">
    <span>[{number}]</span>
  </Tooltip>
</a>
```

### Styling

```css
.inline-citation {
  color: var(--color-primary);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
}

.inline-citation:hover {
  text-decoration: underline;
}
```

---

## 11.2 `CreditsPage`

Bibliography page listing all sources. Flat alphabetical by author surname, Chicago style.

### URL

`/credits`

### Data Source

Pulls from `references` table, ordered by `author_surname ASC`.

### Rendered Structure

```html
<AppShell showInput={false}>
  <div class="credits-page">
    <header class="credits-header">
      <h1>Credits & Sources</h1>
      <p class="credits-author">Primary Author: Braedon Long</p>
    </header>
    
    <section class="credits-bibliography">
      <h2>Bibliography</h2>
      <ol class="bibliography-list">
        {references.map(ref => (
          <li 
            key={ref.id} 
            id={`citation-${ref.citation_number}`}
            class="bibliography-entry"
          >
            <span 
              class="bibliography-citation"
              dangerouslySetInnerHTML={{ __html: ref.full_citation }}
            />
          </li>
        ))}
      </ol>
    </section>
  </div>
</AppShell>
```

### Styling

```css
.credits-page {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

.credits-header {
  margin-bottom: var(--space-8);
}

.credits-header h1 {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  margin-bottom: var(--space-2);
}

.credits-author {
  color: var(--color-muted);
  font-size: var(--text-base);
}

.credits-bibliography h2 {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  margin-bottom: var(--space-4);
}

.bibliography-list {
  list-style: none;
  padding: 0;
}

.bibliography-entry {
  padding: var(--space-3) 0;
  border-bottom: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 15%, transparent);
  scroll-margin-top: var(--space-8);
}

.bibliography-entry:last-child {
  border-bottom: none;
}

.bibliography-citation {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
}

.bibliography-citation em {
  font-style: italic;
}

.bibliography-entry:target {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  margin: 0 calc(-1 * var(--space-3));
  padding-left: var(--space-3);
  padding-right: var(--space-3);
  border-radius: var(--radius-sm);
}
```

---

## 11.3 `MBTISelector`

Typeahead input for selecting personality type. Used in Module 1.1.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| null` | `null` | Selected type code |
| `onChange` | `(code: string) => void` | required | Selection handler |
| `disabled` | `boolean` | `false` | Disable input |

### Data Source

Pulls from `personality_types` table (16 rows).

### Behavior

1. User types in input
2. Dropdown filters to matching codes and names (e.g., "INT" shows INTJ, INTP; "Arch" shows INTJ)
3. User selects from filtered list
4. Selection saves to `user_preferences` or `exercise_responses`

### Rendered Structure

```html
<div class="mbti-selector" data-open={isOpen}>
  <label class="mbti-selector-label" for="mbti-input">
    Your Personality Type
  </label>
  
  <div class="mbti-selector-input-wrapper">
    <input
      id="mbti-input"
      type="text"
      class="mbti-selector-input"
      value={inputValue}
      onChange={handleInputChange}
      onFocus={() => setIsOpen(true)}
      placeholder="Type to search (e.g., INTJ or Architect)"
      aria-expanded={isOpen}
      aria-controls="mbti-listbox"
      aria-autocomplete="list"
      disabled={disabled}
    />
    
    {isOpen && filteredTypes.length > 0 && (
      <ul 
        id="mbti-listbox"
        class="mbti-selector-dropdown"
        role="listbox"
      >
        {filteredTypes.map(type => (
          <li
            key={type.code}
            role="option"
            class="mbti-selector-option"
            data-selected={type.code === value}
            onClick={() => handleSelect(type.code)}
          >
            <span class="mbti-option-code">{type.code}</span>
            <span class="mbti-option-name">{type.name}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
</div>
```

### Styling

```css
.mbti-selector {
  position: relative;
}

.mbti-selector-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-2);
}

.mbti-selector-input-wrapper {
  position: relative;
}

.mbti-selector-input {
  width: 100%;
  padding: var(--space-3);
  font-size: var(--text-base);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text);
}

.mbti-selector-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent);
}

.mbti-selector-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: var(--space-1);
  background: var(--color-bg);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  max-height: 240px;
  overflow-y: auto;
  z-index: 50;
  list-style: none;
  padding: var(--space-1);
}

.mbti-selector-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.mbti-selector-option:hover {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.mbti-selector-option[data-selected="true"] {
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
}

.mbti-option-code {
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  min-width: 48px;
}

.mbti-option-name {
  color: var(--color-muted);
  font-size: var(--text-sm);
}
```

---

## 11.4 `MBTIResultDisplay`

Displays user's personality type with summary. Used in Module 1.1 and Profile.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | required | 4-letter type code |
| `name` | `string` | required | Type name, e.g., "The Architect" |
| `summary` | `string` | required | Career-focused description |

### Rendered Structure

```html
<div class="mbti-result">
  <div class="mbti-result-header">
    <span class="mbti-result-code">{code}</span>
    <span class="mbti-result-name">{name}</span>
  </div>
  <p class="mbti-result-summary">{summary}</p>
</div>
```

### Styling

```css
.mbti-result {
  padding: var(--space-4);
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
  border-left: 3px solid var(--color-primary);
  border-radius: var(--radius-md);
}

.mbti-result-header {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.mbti-result-code {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
}

.mbti-result-name {
  font-size: var(--text-lg);
  color: var(--color-muted);
}

.mbti-result-summary {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
}
```

---

## 11.5 `CompetencyLevelSelector`

Guided assessment for determining user's competency level. Used in Module 2.5.1.

### Overview

User completes 15 competency assessments (one per competency). For each, they select from 5 unlabeled level descriptions. Results calculate category and overall averages.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `competencies` | `Competency[]` | required | All 15 competencies with levels |
| `onComplete` | `(scores: CompetencyScore[]) => void` | required | Completion handler |

### Types

```typescript
type Competency = {
  id: string;
  name: string;
  definition: string;
  category: 'delivery' | 'interpersonal' | 'strategic';
  levels: CompetencyLevel[];
};

type CompetencyLevel = {
  level: number; // 1-5
  description: string;
};

type CompetencyScore = {
  competencyId: string;
  score: number; // 1-5
};

type CompetencyResults = {
  scores: CompetencyScore[];
  deliveryAvg: number;
  interpersonalAvg: number;
  strategicAvg: number;
  overallAvg: number;
  strengths: string[];      // competency IDs
  improvements: string[];   // competency IDs
};
```

### Calculation Logic

```typescript
// Category averages
const deliveryAvg = average(scores.filter(s => getCategory(s.competencyId) === 'delivery'));
const interpersonalAvg = average(scores.filter(s => getCategory(s.competencyId) === 'interpersonal'));
const strategicAvg = average(scores.filter(s => getCategory(s.competencyId) === 'strategic'));
const overallAvg = average(scores);

// Strength/Improvement thresholds (floor after margin)
const strengthThreshold = Math.floor(overallAvg + 0.3);
const improvementThreshold = Math.floor(overallAvg - 0.3);

// Classification
const strengths = scores.filter(s => s.score >= strengthThreshold).map(s => s.competencyId);
const improvements = scores.filter(s => s.score <= improvementThreshold).map(s => s.competencyId);
```

### Flow

1. Show competency name + definition
2. Present 5 level descriptions (unlabeled, in order 1→5)
3. User selects best fit
4. Advance to next competency
5. After all 15, show results

### Rendered Structure (Single Competency Step)

```html
<div class="competency-step">
  <header class="competency-step-header">
    <Badge variant="muted">{category}</Badge>
    <span class="competency-step-progress">
      {currentIndex + 1} of {total}
    </span>
  </header>
  
  <h2 class="competency-step-name">{competency.name}</h2>
  <p class="competency-step-definition">{competency.definition}</p>
  
  <fieldset class="competency-options">
    <legend class="sr-only">Select the description that best fits you</legend>
    
    {competency.levels.map((level, index) => (
      <label 
        key={level.level}
        class="competency-option"
        data-selected={selectedLevel === level.level}
      >
        <input
          type="radio"
          name="competency-level"
          value={level.level}
          checked={selectedLevel === level.level}
          onChange={() => setSelectedLevel(level.level)}
          class="sr-only"
        />
        <span class="competency-option-description">
          {level.description}
        </span>
      </label>
    ))}
  </fieldset>
  
  <div class="competency-step-actions">
    {currentIndex > 0 && (
      <Button variant="ghost" onClick={handleBack}>
        ← Back
      </Button>
    )}
    <Button 
      variant="primary" 
      onClick={handleNext}
      disabled={selectedLevel === null}
    >
      {currentIndex === total - 1 ? 'See Results' : 'Next →'}
    </Button>
  </div>
</div>
```

### Styling

```css
.competency-step {
  max-width: 640px;
  margin: 0 auto;
}

.competency-step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.competency-step-progress {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.competency-step-name {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  margin-bottom: var(--space-2);
}

.competency-step-definition {
  font-size: var(--text-base);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-6);
}

.competency-options {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.competency-option {
  display: block;
  padding: var(--space-4);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--duration-fast) ease,
              background-color var(--duration-fast) ease;
}

.competency-option:hover {
  border-color: color-mix(in srgb, var(--color-primary) 50%, transparent);
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
}

.competency-option[data-selected="true"] {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.competency-option-description {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
}

.competency-step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-6);
}
```

---

## 11.6 `CompetencyResultsDisplay`

Shows competency assessment results with averages, level description, and strength/improvement flags.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `results` | `CompetencyResults` | required | Calculated results |
| `competencies` | `Competency[]` | required | Full competency data |
| `levelDescriptions` | `LevelDescription[]` | required | Job context per level |

### Types

```typescript
type LevelDescription = {
  level: number;
  jobContext: string; // e.g., "Typically associated with Assistants, Secretaries, Operators"
};
```

### Rendered Structure

```html
<div class="competency-results">
  <header class="competency-results-header">
    <h2>Your Competency Profile</h2>
    <div class="competency-results-overall">
      <span class="competency-results-level">Level {Math.round(results.overallAvg)}</span>
      <p class="competency-results-context">
        {getLevelDescription(Math.round(results.overallAvg)).jobContext}
      </p>
    </div>
  </header>
  
  <div class="competency-results-averages">
    <div class="competency-avg">
      <span class="competency-avg-label">Delivery-related</span>
      <span class="competency-avg-value">{results.deliveryAvg.toFixed(1)}</span>
    </div>
    <div class="competency-avg">
      <span class="competency-avg-label">Interpersonal</span>
      <span class="competency-avg-value">{results.interpersonalAvg.toFixed(1)}</span>
    </div>
    <div class="competency-avg">
      <span class="competency-avg-label">Strategic</span>
      <span class="competency-avg-value">{results.strategicAvg.toFixed(1)}</span>
    </div>
  </div>
  
  {['delivery', 'interpersonal', 'strategic'].map(category => (
    <section key={category} class="competency-category">
      <h3 class="competency-category-title">{categoryLabels[category]}</h3>
      
      {getCompetenciesByCategory(category).map(comp => {
        const score = getScore(comp.id);
        const status = getStatus(comp.id); // 'strength' | 'improvement' | 'neutral'
        
        return (
          <div 
            key={comp.id} 
            class="competency-item"
            data-status={status}
          >
            <div class="competency-item-header">
              <span class="competency-item-name">{comp.name}</span>
              <span class="competency-item-score">Level {score}</span>
            </div>
            <p class="competency-item-description">
              {getLevelDescriptionForCompetency(comp.id, score)}
            </p>
          </div>
        );
      })}
    </section>
  ))}
</div>
```

### Styling

```css
.competency-results {
  max-width: 720px;
  margin: 0 auto;
}

.competency-results-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.competency-results-header h2 {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  margin-bottom: var(--space-4);
}

.competency-results-level {
  display: block;
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
}

.competency-results-context {
  font-size: var(--text-base);
  color: var(--color-muted);
  margin-top: var(--space-2);
}

.competency-results-averages {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.competency-avg {
  text-align: center;
  padding: var(--space-4);
  background: color-mix(in srgb, var(--color-muted) 5%, transparent);
  border-radius: var(--radius-md);
}

.competency-avg-label {
  display: block;
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-bottom: var(--space-1);
}

.competency-avg-value {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
}

.competency-category {
  margin-bottom: var(--space-8);
}

.competency-category-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-2);
  border-bottom: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
}

.competency-item {
  padding: var(--space-4);
  margin-bottom: var(--space-3);
  border-radius: var(--radius-md);
  border-left: 3px solid transparent;
  background: color-mix(in srgb, var(--color-muted) 3%, transparent);
}

.competency-item[data-status="strength"] {
  border-left-color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 5%, transparent);
}

.competency-item[data-status="improvement"] {
  border-left-color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 5%, transparent);
}

.competency-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.competency-item-name {
  font-weight: var(--font-medium);
}

.competency-item-score {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.competency-item-description {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-muted);
}
```

---

## 11.7 `CompetencyCard`

Contextual display of single competency or subset. Used in later modules.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `competency` | `Competency` | required | Competency data |
| `score` | `number` | required | User's score (1-5) |
| `levelDescription` | `string` | required | Description for user's level |
| `status` | `'strength' \| 'improvement' \| 'neutral'` | `'neutral'` | Classification |

### Rendered Structure

```html
<div class="competency-card" data-status={status}>
  <div class="competency-card-header">
    <span class="competency-card-name">{competency.name}</span>
    <Badge variant="muted">{competency.category}</Badge>
  </div>
  <p class="competency-card-description">{levelDescription}</p>
</div>
```

### Styling

```css
.competency-card {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border-left: 3px solid transparent;
  background: color-mix(in srgb, var(--color-muted) 3%, transparent);
}

.competency-card[data-status="strength"] {
  border-left-color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 5%, transparent);
}

.competency-card[data-status="improvement"] {
  border-left-color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 5%, transparent);
}

.competency-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.competency-card-name {
  font-weight: var(--font-medium);
}

.competency-card-description {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-muted);
}
```

---

## Related Documents

- **Section 6**: Feedback & Status Components (Badge, Tooltip)
- **Section 4**: Form Input Components (TextInput, RadioGroup)
- **Design System**: Visual tokens, colors, typography, spacing


# DreamTree Component Specification
## Section 11: Credits, Assessments & Skills — Part 2

> Skills Browser/Tagger, Daily Dos updates, and new database tables.

---

## 11.8 `SkillsBrowser`

Searchable, filterable skill selector with tag-style picking.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedSkills` | `string[]` | `[]` | Array of selected skill IDs |
| `onChange` | `(skillIds: string[]) => void` | required | Selection change handler |
| `onAddCustom` | `(skill: NewCustomSkill) => void` | — | Handler for adding custom skill |

### Types

```typescript
type Skill = {
  id: string;
  name: string;
  category: 'transferable' | 'self_management' | 'knowledge' | null;
  isCustom: boolean;
};

type NewCustomSkill = {
  name: string;
  category: 'transferable' | 'self_management' | 'knowledge' | null;
};

type SkillCategory = 'transferable' | 'self_management' | 'knowledge' | 'uncategorized';
```

### State

```typescript
const [searchQuery, setSearchQuery] = useState('');
const [activeFilters, setActiveFilters] = useState<SkillCategory[]>([
  'transferable', 'self_management', 'knowledge', 'uncategorized'
]);
const [showAddCustom, setShowAddCustom] = useState(false);
```

### Behavior

1. User searches via text input
2. Results filter by search + active category filters
3. Click skill to add as selected pill
4. Click pill to remove
5. If no match found, show "Add custom skill" option

### Rendered Structure

```html
<div class="skills-browser">
  <div class="skills-browser-search">
    <TextInput
      value={searchQuery}
      onChange={setSearchQuery}
      placeholder="Search skills..."
      icon={SearchIcon}
    />
  </div>
  
  <div class="skills-browser-filters">
    {categories.map(cat => (
      <button
        key={cat.id}
        class="skills-filter"
        data-active={activeFilters.includes(cat.id)}
        onClick={() => toggleFilter(cat.id)}
      >
        {cat.label}
      </button>
    ))}
  </div>
  
  {selectedSkills.length > 0 && (
    <div class="skills-browser-selected">
      <span class="skills-selected-label">Selected:</span>
      <div class="skills-selected-list">
        {selectedSkills.map(skillId => {
          const skill = getSkill(skillId);
          return (
            <button
              key={skillId}
              class="skill-pill"
              data-selected="true"
              onClick={() => removeSkill(skillId)}
            >
              {skill.name}
              <XIcon size={14} />
            </button>
          );
        })}
      </div>
    </div>
  )}
  
  <div class="skills-browser-results">
    {filteredSkills.length === 0 ? (
      <div class="skills-browser-empty">
        <p>No skills found matching "{searchQuery}"</p>
        {onAddCustom && (
          <Button 
            variant="ghost" 
            onClick={() => setShowAddCustom(true)}
          >
            + Add "{searchQuery}" as custom skill
          </Button>
        )}
      </div>
    ) : (
      <div class="skills-list">
        {filteredSkills.map(skill => (
          <button
            key={skill.id}
            class="skill-pill"
            data-selected={selectedSkills.includes(skill.id)}
            onClick={() => toggleSkill(skill.id)}
          >
            {skill.name}
            {skill.isCustom && <Badge variant="muted" size="sm">Custom</Badge>}
          </button>
        ))}
      </div>
    )}
  </div>
  
  {showAddCustom && (
    <AddCustomSkillModal
      initialName={searchQuery}
      onAdd={handleAddCustom}
      onClose={() => setShowAddCustom(false)}
    />
  )}
</div>
```

### Styling

```css
.skills-browser {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.skills-browser-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.skills-filter {
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.skills-filter:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.skills-filter[data-active="true"] {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-bg);
}

.skills-browser-selected {
  padding: var(--space-3);
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
  border-radius: var(--radius-md);
}

.skills-selected-label {
  display: block;
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.skills-selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.skills-browser-results {
  max-height: 320px;
  overflow-y: auto;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.skill-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.skill-pill:hover {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.skill-pill[data-selected="true"] {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-bg);
}

.skills-browser-empty {
  text-align: center;
  padding: var(--space-6);
  color: var(--color-muted);
}

.skills-browser-empty p {
  margin-bottom: var(--space-3);
}
```

---

## 11.9 `AddCustomSkillModal`

Modal for adding a custom skill to the skills list. Uses existing `Modal` component.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialName` | `string` | `''` | Pre-filled skill name |
| `onAdd` | `(skill: NewCustomSkill) => void` | required | Add handler |
| `onClose` | `() => void` | required | Close handler |

### Rendered Structure

```html
<Modal title="Add Custom Skill" onClose={onClose}>
  <form onSubmit={handleSubmit} class="add-skill-form">
    <TextInput
      label="Skill Name"
      value={name}
      onChange={setName}
      required
    />
    
    <div class="add-skill-category">
      <label class="add-skill-category-label">Category (optional)</label>
      <RadioGroup
        name="skill-category"
        value={category}
        onChange={setCategory}
        options={[
          { value: 'transferable', label: 'Transferable' },
          { value: 'self_management', label: 'Self-Management' },
          { value: 'knowledge', label: 'Knowledge' },
          { value: null, label: 'Uncategorized' },
        ]}
      />
    </div>
    
    <div class="add-skill-actions">
      <Button variant="ghost" type="button" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" type="submit">
        Add Skill
      </Button>
    </div>
  </form>
</Modal>
```

### Styling

```css
.add-skill-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.add-skill-category-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-2);
}

.add-skill-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-4);
}
```

---

# DreamTree Component Specification
## Section 12: Daily Dos Updates

> Updates to existing Daily Dos logic and data.

---

## 12.1 Updated Tool Types Seed Data

| ID | Name | Has Reminder | Frequency |
|----|------|--------------|-----------|
| `flow-tracker` | Flow Log | Yes | daily |
| `failure-reframer` | Reframe | Yes | weekly |
| `budget-calculator` | Budget | Yes | monthly |
| `soared-story` | SOARED Story | Yes | monthly |
| `networking-prep` | Networking Prep | Yes | daily |
| `job-prospector` | Job Tracker | Yes | daily |
| `list-builder` | List | No | — |
| `ranking-grid` | Ranking | No | — |
| `idea-tree` | Idea Tree | No | — |
| `resume-builder` | Resume | No | — |

---

## 12.2 Updated Daily Dos SQL Queries

All queries now include unlock check.

### Daily Reminders

```sql
SELECT tt.id, tt.singular_name, tt.reminder_prompt
FROM tool_types tt
WHERE tt.has_reminder = 1 
  AND tt.reminder_frequency = 'daily'
  AND tt.is_active = 1
  AND EXISTS (
    SELECT 1 FROM exercise_responses er
    JOIN exercise_sequence es ON er.full_exercise_id = es.full_exercise_id
    WHERE er.user_id = ?
      AND es.unlocks_tool = tt.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM tool_instances ti
    WHERE ti.user_id = ?
      AND ti.tool_type = tt.id
      AND DATE(ti.created_at) = DATE('now')
  );
```

### Weekly Reminders

```sql
SELECT tt.id, tt.singular_name, tt.reminder_prompt
FROM tool_types tt
WHERE tt.has_reminder = 1 
  AND tt.reminder_frequency = 'weekly'
  AND tt.is_active = 1
  AND EXISTS (
    SELECT 1 FROM exercise_responses er
    JOIN exercise_sequence es ON er.full_exercise_id = es.full_exercise_id
    WHERE er.user_id = ?
      AND es.unlocks_tool = tt.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM tool_instances ti
    WHERE ti.user_id = ?
      AND ti.tool_type = tt.id
      AND ti.created_at >= DATE('now', '-7 days')
  );
```

### Monthly Reminders

```sql
SELECT tt.id, tt.singular_name, tt.reminder_prompt
FROM tool_types tt
WHERE tt.has_reminder = 1 
  AND tt.reminder_frequency = 'monthly'
  AND tt.is_active = 1
  AND EXISTS (
    SELECT 1 FROM exercise_responses er
    JOIN exercise_sequence es ON er.full_exercise_id = es.full_exercise_id
    WHERE er.user_id = ?
      AND es.unlocks_tool = tt.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM tool_instances ti
    WHERE ti.user_id = ?
      AND ti.tool_type = tt.id
      AND ti.created_at >= DATE('now', '-30 days')
  );
```

---

## 12.3 Daily Dos Data Transformation

Transform SQL results to `DailyDo[]` for existing `DailyDoList` component.

```typescript
function transformToolReminders(toolTypes: ToolTypeRow[]): DailyDo[] {
  return toolTypes.map(tt => ({
    id: tt.id,
    type: tt.id as DailyDoType,
    title: tt.singular_name,
    subtitle: tt.reminder_prompt,
    action: {
      label: `${tt.singular_name} →`,
      onClick: () => navigate(`/tools/${tt.id}`),
    },
  }));
}
```

---

## 12.4 Resume Workbook Card

Hardcoded card shown when workbook is incomplete.

```typescript
function getResumeWorkbookCard(nextExercise: Exercise): DailyDo {
  return {
    id: 'resume-workbook',
    type: 'resume',
    title: 'Resume Workbook',
    subtitle: nextExercise.title,
    action: {
      label: 'Continue →',
      onClick: () => navigate(nextExercise.path),
    },
  };
}
```

---

## 12.5 Complete Daily Dos Logic

```typescript
function getDailyDos(user: User): DailyDo[] {
  const items: DailyDo[] = [];
  
  // Resume workbook card (if incomplete)
  if (!user.workbookComplete) {
    const nextExercise = getNextExercise(user.id);
    items.push(getResumeWorkbookCard(nextExercise));
  }
  
  // Tool reminders (unlocked + due)
  const dailyReminders = queryDailyReminders(user.id);
  const weeklyReminders = queryWeeklyReminders(user.id);
  const monthlyReminders = queryMonthlyReminders(user.id);
  
  items.push(...transformToolReminders([
    ...dailyReminders,
    ...weeklyReminders,
    ...monthlyReminders,
  ]));
  
  return items;
}
```

---

# DreamTree Component Specification
## Section 13: New Database Tables

> Schema additions for credits, personality types, competencies, and skills.

---

## 13.1 `references`

Bibliography and attribution data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `citation_number` | INTEGER | NOT NULL, UNIQUE | Assigned by first appearance |
| `author_surname` | TEXT | NOT NULL | For alphabetical sort |
| `full_citation` | TEXT | NOT NULL | Chicago-formatted citation |
| `short_citation` | TEXT | NOT NULL | Tooltip display |
| `category` | TEXT | | e.g., "Career Development & Life Design" |
| `metadata` | TEXT | | JSON: influence, key_concepts, application, referenced_in, notes |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE references (
    id TEXT PRIMARY KEY,
    citation_number INTEGER NOT NULL UNIQUE,
    author_surname TEXT NOT NULL,
    full_citation TEXT NOT NULL,
    short_citation TEXT NOT NULL,
    category TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX idx_references_citation_number ON references(citation_number);
CREATE INDEX idx_references_author_surname ON references(author_surname);
```

---

## 13.2 `personality_types`

MBTI type data (16 rows).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `code` | TEXT | PRIMARY KEY | 4-letter code, e.g., "INTJ" |
| `name` | TEXT | NOT NULL | e.g., "The Architect" |
| `summary` | TEXT | NOT NULL | Career-focused description |

```sql
CREATE TABLE personality_types (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    summary TEXT NOT NULL
);
```

---

## 13.3 `competencies`

Competency definitions (15 rows).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `name` | TEXT | NOT NULL | e.g., "Analytical Thinking" |
| `definition` | TEXT | NOT NULL | Full definition paragraph |
| `category` | TEXT | NOT NULL | "delivery", "interpersonal", "strategic" |
| `sort_order` | INTEGER | NOT NULL | Display order within category |
| `relevant_modules` | TEXT | | JSON array of module IDs |

```sql
CREATE TABLE competencies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    definition TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('delivery', 'interpersonal', 'strategic')),
    sort_order INTEGER NOT NULL,
    relevant_modules TEXT
);

CREATE INDEX idx_competencies_category ON competencies(category, sort_order);
```

---

## 13.4 `competency_levels`

Level descriptions per competency (75 rows: 15 × 5).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `competency_id` | TEXT | NOT NULL, FK | Reference to competencies |
| `level` | INTEGER | NOT NULL | 1-5 |
| `description` | TEXT | NOT NULL | Level-specific description |
| `job_context` | TEXT | | e.g., "Assistants, Secretaries, Operators" |

```sql
CREATE TABLE competency_levels (
    id TEXT PRIMARY KEY,
    competency_id TEXT NOT NULL REFERENCES competencies(id),
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
    description TEXT NOT NULL,
    job_context TEXT,
    UNIQUE(competency_id, level)
);

CREATE INDEX idx_competency_levels_competency ON competency_levels(competency_id);
```

---

## 13.5 `user_competency_scores`

User assessment results.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK | Reference to users |
| `competency_id` | TEXT | NOT NULL, FK | Reference to competencies |
| `score` | INTEGER | NOT NULL | 1-5 selected |
| `assessed_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_competency_scores (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    competency_id TEXT NOT NULL REFERENCES competencies(id),
    score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
    assessed_at TEXT NOT NULL,
    UNIQUE(user_id, competency_id)
);

CREATE INDEX idx_user_competency_scores_user ON user_competency_scores(user_id);
```

---

## 13.6 `skills`

Master skills list plus user custom skills.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `name` | TEXT | NOT NULL | Skill name |
| `category` | TEXT | | "transferable", "self_management", "knowledge", or null |
| `is_custom` | INTEGER | NOT NULL, DEFAULT 0 | Boolean: user-added |
| `created_by` | TEXT | FK | User ID (null for master list) |
| `review_status` | TEXT | | "pending", "approved", "rejected" |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('transferable', 'self_management', 'knowledge') OR category IS NULL),
    is_custom INTEGER NOT NULL DEFAULT 0,
    created_by TEXT REFERENCES users(id),
    review_status TEXT CHECK (review_status IN ('pending', 'approved', 'rejected') OR review_status IS NULL),
    created_at TEXT NOT NULL
);

CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_skills_review ON skills(review_status) WHERE is_custom = 1;
```

---

## 13.7 `exercise_skills`

Junction table for tagging skills to exercises.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `exercise_instance_id` | TEXT | NOT NULL | FK to exercise response or tool instance |
| `skill_id` | TEXT | NOT NULL, FK | Reference to skills |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE exercise_skills (
    id TEXT PRIMARY KEY,
    exercise_instance_id TEXT NOT NULL,
    skill_id TEXT NOT NULL REFERENCES skills(id),
    created_at TEXT NOT NULL,
    UNIQUE(exercise_instance_id, skill_id)
);

CREATE INDEX idx_exercise_skills_exercise ON exercise_skills(exercise_instance_id);
CREATE INDEX idx_exercise_skills_skill ON exercise_skills(skill_id);
```

---

## Related Documents

- **Section 10**: Dashboard Components (DailyDoList, DailyDoCard)
- **Section 11 Part 1**: Credits, MBTI, and Competency components
- **Section 5**: Structured Input Components (existing TagSelector pattern)
- **Section 7**: Overlay Components (Modal)
- **Data Architecture**: Existing table schemas
- **Design System**: Visual tokens, colors, typography, spacing
