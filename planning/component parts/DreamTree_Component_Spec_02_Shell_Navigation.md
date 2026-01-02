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
