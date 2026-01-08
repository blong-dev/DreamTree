# Shell & Navigation

This area owns the app's layout structure, navigation components, and overlay system.

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

## Patterns & Conventions

### AppShell Usage
```tsx
<AppShell
  header={<Header title="Dashboard" />}
  nav={<NavBar />}
  inputArea={<InputArea>{/* input content */}</InputArea>}
>
  {children}
</AppShell>
```

### Layout Structure
```
┌─────────────────────────────────────┐
│ NavBar (z-nav: 30)                  │
├─────────────────────────────────────┤
│ Header                              │
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

### Modifying Header
- Title and subtitle via props
- Optional actions slot for buttons
- Consistent styling via CSS classes

### Creating New Overlay
1. Add component to `src/components/overlays/`
2. Use Backdrop for dimmed background
3. Follow z-index conventions (z-overlay: 200)
4. Handle escape key and click-outside

---

## Testing

### Layout Testing
- Verify NavBar renders brand correctly
- Check InputArea stays fixed on scroll
- Test overlay opens/closes properly

### Responsive Testing
- Mobile: Collapsed navigation
- Desktop: Full navigation
- InputArea maintains position

### Accessibility
- Skip link targets main content
- Focus trapped in overlays
- Escape key closes overlays

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

### NavBar Brand
- Acorn icon + "dreamtree" wordmark
- Sage color (#7D9471) for brand elements
- Font: Jacquard 24 for wordmark

### TOC Panel Data
- Fetches stem data for hierarchy
- Part → Module → Exercise structure
- Progress markers from user_modules

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
  header?: React.ReactNode;
  nav?: React.ReactNode;
  inputArea?: React.ReactNode;
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
