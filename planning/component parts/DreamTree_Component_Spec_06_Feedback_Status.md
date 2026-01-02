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
