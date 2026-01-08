# Design System

This area owns all visual design tokens, theming, and CSS architecture.

## Ownership

**Scope:**
- `src/app/globals.css` - All CSS variables and component styles
  - CSS custom properties (colors, spacing, typography)
  - Component class definitions
  - Responsive utilities
  - Accessibility styles
  - Animation definitions

**Does NOT own:**
- Component logic (owned by respective component areas)
- Layout structure (owned by Shell)
- Specification documents (owned by Manager)

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/globals.css` | 5,967 lines of CSS |
| `/planning/DreamTree_Design_System.md` | Design specifications (read-only reference) |

---

## Patterns & Conventions

### CSS Custom Properties
All design values are CSS variables:

```css
/* Colors */
--color-ivory: #FAF8F5;
--color-sage: #7D9471;
--color-rust: #A0522D;

/* Spacing (4px base) */
--space-1: 4px;
--space-4: 16px;
--space-8: 32px;

/* Z-Index */
--z-base: 0;
--z-raised: 10;
--z-header: 20;
```

### Component Classes
Components use prefixed class names:
```css
.shell-app { /* AppShell */ }
.nav-bar { /* NavBar */ }
.message-content { /* MessageContent */ }
.tool-list-builder { /* ListBuilder tool */ }
```

### No Tailwind Utilities in Components
- All styling via CSS custom properties
- Components use semantic class names
- Utility classes only in globals.css

---

## Design Tokens

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Ivory | `#FAF8F5` | Light background |
| Creamy Tan | `#E8DCC4` | Warm background |
| Brown | `#5C4033` | Dark background/text |
| Charcoal | `#2C3E50` | Dark background/text |
| **Sage** | `#7D9471` | **Primary accent (brand)** |
| **Rust** | `#A0522D` | **Secondary accent (brand)** |
| Black | `#1A1A1A` | Darkest background |

### Color Pairing Rules (WCAG AA)
- Light backgrounds (Ivory, Creamy Tan) → Dark text only
- Dark backgrounds (Brown, Charcoal, Black) → Light text only

### Spacing Scale
Based on 4px unit:
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-12`: 48px
- `--space-16`: 64px

### Z-Index Scale
| Layer | Value | Usage |
|-------|-------|-------|
| z-base | 0 | Default content |
| z-raised | 10 | Elevated cards |
| z-header | 20 | Page header |
| z-nav | 30 | Navigation |
| z-input | 40 | Fixed input area |
| z-backdrop | 100 | Modal backdrop |
| z-overlay | 200 | Overlay content |
| z-modal | 300 | Modal dialogs |
| z-tooltip | 400 | Tooltips, toasts |

### Typography
| Variable | Font Family |
|----------|-------------|
| `--font-sans` | Inter |
| `--font-serif` | Lora |
| `--font-mono` | Courier Prime |
| `--font-handwritten` | Shadows Into Light |
| `--font-display` | Jacquard 24 |

Note: Shadows Into Light and Jacquard 24 only have weight 400.

---

## Common Tasks

### Adding a Color
1. Add CSS variable to `:root` in globals.css
2. Document in this file
3. Update spec if permanent addition

### Creating Component Styles
1. Use component-prefixed class name
2. Reference CSS variables for all values
3. Include focus, hover, disabled states
4. Add reduced-motion alternatives

### Adding Animation
1. Define `@keyframes` in globals.css
2. Apply via class with `animation` property
3. Add `prefers-reduced-motion` alternative
4. Consider performance impact

---

## Testing

### Visual Testing
- Colors render correctly across browsers
- Spacing is consistent
- Typography scales properly

### Accessibility Testing
- Color contrast meets WCAG AA (4.5:1 for text)
- Focus states are visible
- Touch targets minimum 44px
- Reduced motion respected

### Theme Testing
- User-selected backgrounds work
- Text colors pair correctly
- Brand colors visible on all themes

---

## Gotchas

### No Shadows
- Design constraint: NO box-shadow
- Use borders for elevation
- Border colors for depth

### User-Owned Aesthetic
- Users choose background/text/font at onboarding
- Stored in user_settings
- Applied via CSS class on body

### Reduced Motion
- All animations must check `prefers-reduced-motion`
- Typing effect skips when enabled
- Transitions can remain (they're brief)

### Font Weight Limitations
- Shadows Into Light: only 400
- Jacquard 24: only 400
- Don't use bold/light with these fonts

### CSS Specificity
- Keep specificity low
- Use single class selectors when possible
- Avoid `!important`

### Global vs Component Styles
- Global: resets, variables, utilities
- Component: prefixed classes only
- No style leakage between components

---

## Dependencies

**Depends on:**
- None (foundation layer)

**Depended by:**
- All UI areas consume CSS variables
- All components reference globals.css classes

---

## Interface Contracts

### CSS Variable Naming
```css
/* Colors: --color-[name] */
--color-ivory: #FAF8F5;

/* Spacing: --space-[multiplier] */
--space-4: 16px;

/* Z-Index: --z-[layer] */
--z-modal: 300;

/* Fonts: --font-[type] */
--font-sans: 'Inter', sans-serif;
```

### Component Class Naming
```css
/* Pattern: .[area]-[component][-element][-modifier] */
.shell-nav-bar { }
.message-content { }
.tool-list-builder-item { }
.form-input--error { }
```

### Utility Classes
```css
/* Screen reader only */
.sr-only { }

/* Focus styles */
.focus-ring { }

/* Reduced motion */
.motion-safe { }
.motion-reduce { }
```

---

## Spec Reference
- Full design system: `/planning/DreamTree_Design_System.md` (36 KB)
- Component styling: `/planning/DreamTree_Component_Spec.md`
- Accessibility: `/planning/DreamTree_Design_System.md` (Accessibility section)
