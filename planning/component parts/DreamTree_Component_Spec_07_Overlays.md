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
