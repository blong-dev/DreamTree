# Shell & Navigation

This area owns the app's layout structure, navigation components, and overlay system.

---

## Soul

**Navigation should feel like moving through a physical space. Present but not intrusive.**

The shell is the container for the conversation. It should feel like a well-designed room — you notice it when you first enter, then it fades from awareness as you focus on the work. The UI chrome should recede, leaving space for the dialogue between user and DreamTree.

### Why This Matters

1. **Focus** — Less chrome = more attention on self-discovery
2. **Calm** — Navigation doesn't demand attention; it's there when needed
3. **Continuity** — The shell provides consistent orientation across the journey
4. **Accessibility** — Skip links, focus traps, and keyboard navigation work seamlessly

### The Shell Philosophy

| Element | Behavior | Purpose |
|---------|----------|---------|
| **NavBar** | Always visible | Consistent home, navigation accessible |
| **Header** | Auto-hides after 20s idle | Reduces chrome when reading |
| **InputArea** | Fixed at bottom | Chat-like input position |
| **TOC Panel** | On-demand overlay | Browse without leaving context |
| **Breadcrumb** | Shows current location | Orientation in the tree |

### What a Soul Violation Looks Like

- **Persistent distractions** — Progress bars, notifications, badges in the shell
- **Heavy chrome** — Toolbars, sidebars, multiple navigation layers
- **Competing attention** — Animated elements in navigation
- **Disorientation** — No clear sense of where you are in the journey
- **Trapped feeling** — Can't navigate away, can't see the bigger picture

---

## Ownership

**Scope:**
- `src/components/shell/` - Core layout components
  - `AppShell.tsx` - Main layout wrapper
  - `NavBar.tsx` - Top navigation with Acorn brand
  - `NavItem.tsx` - Navigation item
  - `Header.tsx` - Page header with title/subtitle
  - `Breadcrumb.tsx` - Navigation breadcrumbs
  - `InputArea.tsx` - Bottom fixed input area
  - `types.ts` - Shell type definitions
- `src/components/overlays/` - Overlay components
  - `Backdrop.tsx` - Modal backdrop
  - `TOCPanel.tsx` - Table of contents panel
  - `TOCPart.tsx`, `TOCModule.tsx`, `TOCExercise.tsx` - TOC hierarchy
  - `ProgressMarker.tsx` - Exercise progress indicator
- `src/app/layout.tsx` - Root layout

**Does NOT own:**
- Page content (owned by respective page areas)
- Form inputs in InputArea (owned by UI Primitives)
- TOCInline components (owned by Features/Dashboard)

---

## Key Files

| File | Purpose |
|------|---------|
| `src/components/shell/AppShell.tsx` | Main layout with nav, header, content area |
| `src/components/shell/NavBar.tsx` | Brand lockup + navigation links |
| `src/components/shell/InputArea.tsx` | Fixed bottom input container |
| `src/components/overlays/TOCPanel.tsx` | Full table of contents overlay |
| `src/app/layout.tsx` | Root HTML, fonts, providers |

---

## Principles

### 1. Chrome Should Recede
The shell exists to frame the conversation, not compete with it:
- Header auto-hides after 20 seconds of idle
- Returns on scroll-up for easy access
- Minimal visual weight

### 2. Navigation is Orientation
Users should always know:
- Where they are (breadcrumb: Part › Module › Exercise)
- How to get home (NavBar)
- What's next (flow continues naturally)

### 3. Input Position Matters
InputArea fixed at bottom because:
- Chat-like positioning (matches mental model)
- Keyboard on mobile pushes it up naturally
- Always accessible without scrolling

### 4. Overlays Are Contextual
TOC Panel and modals:
- Open from current context
- Close back to same context
- Don't navigate away unexpectedly

---

## Patterns & Conventions

### AppShell Usage
```tsx
<AppShell
  currentLocation={breadcrumbLocation}
  showBreadcrumb={true}
  showInput={inputType !== 'none'}
  inputType={inputType}
  hideContents={true}  // Hide TOC in workbook
  onNavigate={handleNavigate}
>
  {children}
</AppShell>
```

### Layout Structure
```
┌─────────────────────────────────────┐
│ NavBar (z-nav: 30)                  │
├─────────────────────────────────────┤
│ Header / Breadcrumb                 │
├─────────────────────────────────────┤
│                                     │
│ Main Content (scrollable)           │
│                                     │
├─────────────────────────────────────┤
│ InputArea (z-input: 40, fixed)      │
└─────────────────────────────────────┘
```

### Z-Index Layers
- UI Layer: 0-40 (base, raised, header, nav, input)
- Overlay Layer: 100-400 (backdrop, overlay, modal, tooltip)

### Navigation State
- Active route determined by pathname
- NavItem highlights current location
- Breadcrumbs show exercise hierarchy

---

## Common Tasks

### Adding a New Page Route
1. Create page in `src/app/[route]/page.tsx`
2. Add NavItem to NavBar if top-level navigation
3. Update breadcrumb logic if hierarchical
4. **Decide if TOC should be visible on this page**

### Modifying Header
- Title and subtitle via props
- Optional actions slot for buttons
- Consistent styling via CSS classes
- **Remember: auto-hide after 20s idle**

### Creating New Overlay
1. Add component to `src/components/overlays/`
2. Use Backdrop for dimmed background
3. Follow z-index conventions (z-overlay: 200)
4. Handle escape key and click-outside
5. **Trap focus inside overlay**

---

## Testing

### Layout Testing
- Verify NavBar renders brand correctly
- Check InputArea stays fixed on scroll
- Test overlay opens/closes properly

### Responsive Testing
- Mobile: Bottom navigation or collapsed nav
- Desktop: Full navigation
- InputArea maintains position
- **Test with mobile keyboard**

### Accessibility
- Skip link targets main content
- Focus trapped in overlays
- Escape key closes overlays
- Tab order is logical

---

## Gotchas

### Fixed Positioning
- InputArea is `position: fixed; bottom: 0`
- Content needs padding-bottom to avoid overlap
- Mobile keyboards may push InputArea up

### Overlay Z-Index
- Backdrop: z-index 100
- Overlay content: z-index 200
- Nested modals need z-index 300+
- Toast: z-index 400 (above everything)

### NavBar Brand
- Acorn icon + "dreamtree" wordmark
- Sage color (#7D9471) for brand elements
- Font: Jacquard 24 for wordmark

### TOC Panel Data
- Fetches stem data for hierarchy
- Part → Module → Exercise structure
- Progress markers from user_modules

### Hiding Contents in Workbook
- `hideContents={true}` removes TOC link from NavBar
- Users shouldn't browse away during exercises
- They can still use breadcrumb to navigate up

---

## Dependencies

**Depends on:**
- Design System (CSS variables, z-index)
- UI Primitives (icons in NavBar)

**Depended by:**
- All pages (use AppShell)
- Features (TOCInline uses similar structure)
- Workbook (Breadcrumb for exercise location)

---

## Interface Contracts

### AppShell Props
```typescript
interface AppShellProps {
  children: React.ReactNode;
  currentLocation?: BreadcrumbLocation;
  showBreadcrumb?: boolean;
  showInput?: boolean;
  inputType?: InputType;
  inputValue?: string;
  inputPlaceholder?: string;
  onInputChange?: (value: string) => void;
  onInputSubmit?: (value: string) => void;
  hideContents?: boolean;
  activeNavItem?: NavItemId;
  onNavigate?: (id: string) => void;
}
```

### Header Props
```typescript
interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}
```

### TOCPanel Props
```typescript
interface TOCPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentExerciseId?: string;
}
```

---

## Spec Reference
- Layout structure: `/planning/DreamTree_Component_Spec.md` (Shell section)
- Navigation: Same file, Navigation section
- Z-index scale: `/planning/DreamTree_Design_System.md`
