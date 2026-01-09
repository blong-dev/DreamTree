# Design System

This area owns all visual design tokens, theming, and CSS architecture.

---

## Soul

**User-owned aesthetic. Their space, their rules. We provide the palette; they paint.**

DreamTree's visual design serves two masters: accessibility and ownership. Every user creates a space that feels like theirs — choosing colors and fonts that resonate with how they want to do this work. But we never sacrifice readability for customization.

### Why This Matters

1. **Ownership** — When users choose their visual preferences, the app becomes their space, not ours
2. **Focus** — Clean, calm design reduces cognitive load so users can focus on self-discovery
3. **Trust** — Professional, mature aesthetics signal "coaching" not "gamification"
4. **Accessibility** — Every color pairing meets WCAG AA; every animation respects motion preferences

### The Design Philosophy

| Principle | What It Means | What We Avoid |
|-----------|---------------|---------------|
| **Calm & Focused** | Muted colors, generous whitespace, no visual noise | Bright colors, busy patterns, competing elements |
| **Journalistic Quality** | Like a well-made physical workbook | Like a quiz website or SaaS dashboard |
| **No Shadows** | Flat design with borders for depth | Drop shadows, glows, 3D effects |
| **User Preferences Rule** | Colors/fonts from onboarding apply everywhere | Hard-coded brand colors in content areas |

### What a Soul Violation Looks Like

- **Bright, attention-grabbing colors** — We're not trying to "engage" users
- **Gamification visuals** — No progress bars with percentages, no confetti, no badges
- **Inconsistent theming** — Brand colors appearing where user preferences should apply
- **Inaccessible pairings** — Text that fails contrast requirements
- **Decorative animations** — Motion should serve function, not performance

---

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
| `src/app/globals.css` | 6,000+ lines of CSS |
| `src/lib/theme/index.ts` | Theme utilities (applyTheme, parseThemeSettings) |
| `src/hooks/useApplyTheme.ts` | React hook to apply theme on mount |
| `src/components/onboarding/types.ts` | Color/font type definitions and helpers |
| `/planning/DreamTree_Design_System.md` | Design specifications (read-only reference) |

---

## Principles

### 1. User-Owned Aesthetic
Users choose at onboarding:
- **5 backgrounds**: Ivory, Creamy Tan, Brown, Charcoal, Black
- **5 fonts**: Inter, Lora, Courier Prime, Shadows Into Light, Jacquard 24
- All pairings WCAG AA compliant (invalid combinations disabled)

### 2. Brand Identity
Two accent colors for brand elements only:
- **Sage** (#7D9471) — Primary accent, links, interactive elements
- **Rust** (#A0522D) — Secondary accent, highlights

### 3. No Shadows Rule
Elevation is achieved through:
- Border colors (lighter = elevated, darker = recessed)
- Background color shifts
- Subtle border thickness changes

Never use `box-shadow`.

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
- Minimum 4.5:1 contrast ratio for body text

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
| Variable | Font Family | Weight Availability |
|----------|-------------|---------------------|
| `--font-sans` | Inter | 400, 500, 600, 700 |
| `--font-serif` | Lora | 400, 500, 600, 700 |
| `--font-mono` | Courier Prime | 400, 700 |
| `--font-handwritten` | Shadows Into Light | **400 only** |
| `--font-display` | Jacquard 24 | **400 only** |

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

## Theme System

### Architecture
```
Server (page.tsx)                    Client Component
┌─────────────────┐                  ┌─────────────────────┐
│ getSessionData  │──theme props───> │ useApplyTheme()     │
│ parseThemeSettings │               │ - Sets CSS vars     │
└─────────────────┘                  │ - Sets data-theme   │
                                     └─────────────────────┘
                                              │
                                              ▼
                                     document.documentElement
                                     --color-bg, --color-text, --font-body
```

### Key Functions

**`applyTheme(settings: ThemeSettings)`** — Sets CSS variables on document
```typescript
import { applyTheme } from '@/lib/theme';
applyTheme({ backgroundColor: 'charcoal', textColor: 'ivory', font: 'lora' });
```

**`useApplyTheme(options)`** — React hook for components
```typescript
import { useApplyTheme } from '@/hooks/useApplyTheme';
useApplyTheme({ backgroundColor, textColor, font });
```

**`parseThemeSettings(bg, text, font)`** — Safe parsing with defaults
```typescript
import { parseThemeSettings } from '@/lib/theme';
const theme = parseThemeSettings(settings?.background_color, settings?.text_color, settings?.font);
```

### Where Themes Are Applied
| Page | Component | How |
|------|-----------|-----|
| Dashboard | `DashboardPage.tsx` | `useApplyTheme` with `userPreview` props |
| Workbook | `WorkbookView.tsx` | `useApplyTheme` with `theme` prop |
| Profile | `profile/page.tsx` | `applyTheme()` in useEffect |
| Onboarding | `OnboardingFlow.tsx` | `applyTheme()` in useEffect (live preview) |

---

## Common Tasks

### Adding a Color
1. Add CSS variable to `:root` in globals.css
2. Document in this file
3. Update spec if permanent addition
4. **Verify WCAG compliance with all backgrounds**

### Creating Component Styles
1. Use component-prefixed class name
2. Reference CSS variables for all values
3. Include focus, hover, disabled states
4. Add reduced-motion alternatives
5. **Never use box-shadow**

### Adding Animation
1. Define `@keyframes` in globals.css
2. Apply via class with `animation` property
3. **Add `prefers-reduced-motion` alternative**
4. Consider performance impact
5. Ensure animation serves function, not decoration

---

## Testing

### Visual Testing
- Colors render correctly across browsers
- Spacing is consistent
- Typography scales properly
- **No shadows appear anywhere**

### Accessibility Testing
- Color contrast meets WCAG AA (4.5:1 for text)
- Focus states are visible
- Touch targets minimum 44px
- Reduced motion respected

### Theme Testing
- User-selected backgrounds work
- Text colors pair correctly
- Brand colors (sage/rust) visible on all themes

---

## Gotchas

### No Shadows
- Design constraint: NO box-shadow anywhere
- Use borders for elevation
- Border colors for depth

### User-Owned Aesthetic
- Users choose background/text/font at onboarding
- Stored in `user_settings` table (background_color, text_color, font)
- Applied via `useApplyTheme()` hook in client components
- Hook sets CSS variables: `--color-bg`, `--color-text`, `--font-body`
- Pages with themes: Dashboard, Workbook, Profile, Onboarding

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
