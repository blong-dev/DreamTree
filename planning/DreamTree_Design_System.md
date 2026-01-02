# DreamTree Design System v1.0

> A comprehensive visual design system for DreamTree — a conversational career development webapp that feels like texting through a guided workbook.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Semantic Colors](#3-semantic-colors)
4. [Typography System](#4-typography-system)
5. [Spacing & Layout](#5-spacing--layout)
6. [Borders, Radii & Focus States](#6-borders-radii--focus-states)
7. [Animation & Transitions](#7-animation--transitions)
8. [Accessibility Requirements](#8-accessibility-requirements)

---

## 1. Design Philosophy

### Core Principles

| Principle | What it means | What it doesn't mean |
|-----------|---------------|----------------------|
| **Calm & Focused** | The app feels like a quiet, supportive space. Interactions are unhurried. Visual noise is eliminated. | Not sterile or cold. Not a productivity tool demanding attention. |
| **Conversational Warmth** | Every element supports the feeling of thoughtful dialogue. The interface recedes; the conversation advances. | Not chatbot-y or artificial. Not cluttered with UI chrome. |
| **User-Owned Aesthetic** | The user's preference choices at onboarding define their entire experience. Their space, their rules. | Not one-size-fits-all. Not "dark mode as afterthought." |
| **Accessible by Default** | All constrained pairings meet WCAG 2.1 AA. Focus states are visible. Touch targets are generous. | Not accessibility theater. Not "we'll fix it later." |

### Visual Heritage

DreamTree draws from three traditions:

- **Quality journals**: The tactile satisfaction of filling in a well-made workbook
- **Modern messaging**: Familiar conversational patterns, effortless scrolling, content that flows
- **Professional coaching**: Trustworthy, mature, never gimmicky or gamified

---

## 2. Color System

### Base Palette

| Name | Hex | RGB | Role |
|------|-----|-----|------|
| Ivory | `#FAF8F5` | 250, 248, 245 | Lightest background — warm white with slight cream undertone |
| Creamy Tan | `#E8DCC4` | 232, 220, 196 | Warm neutral background — parchment/paper feel |
| Brown | `#5C4033` | 92, 64, 51 | Earth tone — works as bg (dark) or text (on light) |
| Bluish Charcoal | `#2C3E50` | 44, 62, 80 | Professional dark — slight blue undertone adds sophistication |
| Black | `#1A1A1A` | 26, 26, 26 | Deepest background — soft black, not harsh #000 |

### Constrained Pairings (Accessibility-First)

Only these background + text combinations are available to users. All meet WCAG AA (4.5:1 minimum for body text).

| Background | Available Text Colors | Contrast Ratios |
|------------|----------------------|-----------------|
| **Ivory** `#FAF8F5` | Brown, Charcoal, Black | 7.3:1, 11.2:1, 14.8:1 |
| **Creamy Tan** `#E8DCC4` | Brown, Charcoal, Black | 5.1:1, 7.8:1, 10.3:1 |
| **Brown** `#5C4033` | Ivory, Creamy Tan | 7.3:1, 5.1:1 |
| **Charcoal** `#2C3E50` | Ivory, Creamy Tan | 11.2:1, 7.8:1 |
| **Black** `#1A1A1A` | Ivory, Creamy Tan | 14.8:1, 10.3:1 |

*Note: The UI only shows valid text options after background selection. Invalid pairings are shown at 40% opacity with `cursor: not-allowed` and a tooltip explaining why.*

### Default Pairing (Pre-Onboarding)

- **Background**: Ivory `#FAF8F5`
- **Text**: Charcoal `#2C3E50`
- **Rationale**: Maximum warmth + maximum readability. The "safest" aesthetic that works for everyone before they choose.

---

## 3. Semantic Colors

We define two semantic color sets: one optimized for light backgrounds (Ivory, Creamy Tan), one for dark backgrounds (Brown, Charcoal, Black). The app automatically applies the correct set based on the user's background choice.

### Light Mode Semantic Colors

*For use on Ivory and Creamy Tan backgrounds*

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary Action** | Deep Teal | `#1B7B6D` | Primary buttons, key interactive elements |
| **Success** | Forest Green | `#2D6A4F` | Completion states, positive feedback, checkmarks |
| **Warning** | Amber | `#B5651D` | Caution states, "are you sure" moments |
| **Error** | Brick Red | `#9B2C2C` | Validation errors, destructive actions |
| **Link** | Deep Teal | `#1B7B6D` | Inline text links (same as primary for cohesion) |
| **Muted** | Warm Gray | `#6B6B6B` | Secondary text, timestamps, helper text |

### Dark Mode Semantic Colors

*For use on Brown, Charcoal, and Black backgrounds*

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary Action** | Soft Teal | `#4ECDC4` | Primary buttons, key interactive elements |
| **Success** | Mint Green | `#6BCB77` | Completion states, positive feedback, checkmarks |
| **Warning** | Warm Gold | `#F4A261` | Caution states, "are you sure" moments |
| **Error** | Coral Red | `#E57373` | Validation errors, destructive actions |
| **Link** | Soft Teal | `#4ECDC4` | Inline text links |
| **Muted** | Cool Gray | `#A0A0A0` | Secondary text, timestamps, helper text |

### Why Two Sets?

The same green that reads as "success" on ivory looks muddy and low-contrast on charcoal. By defining pairs, we ensure:

- Semantic meaning stays consistent (green = success, red = error)
- Contrast ratios stay accessible across all themes
- The emotional tone adapts (deeper, richer on light; softer, glowing on dark)

### Implementation

```css
.theme-light {
  --color-primary: #1B7B6D;
  --color-success: #2D6A4F;
  --color-warning: #B5651D;
  --color-error: #9B2C2C;
  --color-muted: #6B6B6B;
}

.theme-dark {
  --color-primary: #4ECDC4;
  --color-success: #6BCB77;
  --color-warning: #F4A261;
  --color-error: #E57373;
  --color-muted: #A0A0A0;
}
```

### Message Display Pattern

| Element | Treatment |
|---------|-----------|
| DreamTree content | Left-aligned, no bubble, plain text on background |
| User responses | Right-aligned, subtle bubble (primary action @ 15% opacity on light themes, @ 20% on dark) |

This creates clear visual separation: DreamTree content feels like the "ground" — the workbook itself. User responses feel like annotations, notes in the margin, *their* contributions layered on top.

---

## 4. Typography System

### Font Families

Users choose one font family at onboarding. That family is used for *everything* — headings, body, UI elements. This keeps their space feeling cohesive and truly theirs.

| Option | Family | Weights Loaded | Character |
|--------|--------|----------------|-----------|
| **Clean Sans** | Inter | 400, 500, 700 | Modern, neutral, highly legible. The "default" feeling — professional without personality. |
| **Classic Serif** | Lora | 400, 500, 700 | Warm, literary, authoritative. Feels like a quality book. Slightly slower reading pace (contemplative). |
| **Typewriter** | Courier Prime | 400, 700 | Raw, authentic, workbook-like. Feels like typing on paper. Monospace creates visual rhythm. |
| **Handwritten** | Shadows Into Light | 400 | Personal, informal, journal-like. Feels like someone's actual handwriting. Intimate and approachable. |
| **Vintage Display** | Jacquard 24 | 400 | Retro dot-matrix/LCD aesthetic. Distinctive and nostalgic. A bold statement choice. |

### Single-Weight Font Handling

Shadows Into Light and Jacquard 24 only ship weight 400. For these fonts:

- `font-normal`, `font-medium`, and `font-semibold` all resolve to 400
- Hierarchy is communicated purely through size, not weight
- This is a feature, not a bug — it reinforces their handmade/display character

### Font-Specific Adjustments

| Font | Base Size | Letter Spacing | Notes |
|------|-----------|----------------|-------|
| Inter | 16px | None | No adjustments needed |
| Lora | 16px | +0.01em at `text-xs`, `text-sm` | Open up small sizes |
| Courier Prime | 17px | -0.02em at `text-lg`+ | Compensate for monospace density |
| Shadows Into Light | 18px | None | Larger base for handwriting legibility |
| Jacquard 24 | 17px | +0.03em | Dot-matrix needs breathing room |

### Type Scale

Modular scale with 1.25 ratio (major third). Base sizes vary by font family (see above), scale ratios remain consistent.

| Token | Scale | Line Height | Usage |
|-------|-------|-------------|-------|
| `text-xs` | base × 0.75 | 1.5 | Timestamps, fine print, metadata |
| `text-sm` | base × 0.875 | 1.5 | Helper text, secondary labels |
| `text-base` | base × 1 | 1.6 | Body text, message content, inputs |
| `text-lg` | base × 1.25 | 1.5 | Activity titles, emphasis |
| `text-xl` | base × 1.563 | 1.4 | Exercise headers |
| `text-2xl` | base × 1.938 | 1.3 | Module titles |
| `text-3xl` | base × 2.438 | 1.2 | Part titles, major section headers |

### Font Weights

| Token | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text, most content |
| `font-medium` | 500 | Emphasis, labels, nav items (falls back to 400 for single-weight fonts) |
| `font-semibold` | 700 | Headings, buttons, strong emphasis (falls back to 400 for single-weight fonts) |

### Line Length (Measure)

| Context | Max Width | Rationale |
|---------|-----------|-----------|
| Content messages | 65ch | Optimal reading length, no bubble |
| User response bubbles | 65ch | Matches content width, bubble provides differentiation |
| Full-width content | 75ch | Slightly wider for lists, tables, structured inputs |
| Mobile | 100% - 32px | Edge-to-edge with comfortable margins |

---

## 5. Spacing & Layout

### Spacing Scale

Base-4 scale. Every spacing value is a multiple of 4px.

| Token | Value (px) | Value (rem) | Usage |
|-------|------------|-------------|-------|
| `space-1` | 4 | 0.25 | Tight gaps: icon-to-label, inline elements |
| `space-2` | 8 | 0.5 | Related elements: input padding (small), tag gaps |
| `space-3` | 12 | 0.75 | Compact grouping: list item padding, small cards |
| `space-4` | 16 | 1 | Standard gap: paragraph spacing, input padding |
| `space-5` | 20 | 1.25 | Comfortable breathing room between related groups |
| `space-6` | 24 | 1.5 | Section spacing within a message or card |
| `space-8` | 32 | 2 | Between messages in conversation thread |
| `space-10` | 40 | 2.5 | Major section breaks, module transitions |
| `space-12` | 48 | 3 | Part transitions, large visual breaks |
| `space-16` | 64 | 4 | Page-level padding, hero spacing |

### App Shell Layout

**Desktop/Wide (1024px+)**

```
┌──────┬──────────────────────────────────────────────────────────┐
│      │                                                          │
│  🏠  │  ┌─────────────────────────────────────────────────────┐ │
│      │  │  Part 1: Roots › Module 1.1 › Exercise 1.1.1        │ │
│  📑  │  └─────────────────────────────────────────────────────┘ │
│      │                                                          │
│  🧰  │    [DreamTree content - left, no bubble]                 │
│      │                                                          │
│  👤  │                          ↕ space-8                       │
│      │                                                          │
│ 64px │                    [User response - right, bubble]       │
│      │                                                          │
│      │                          ↕ space-8                       │
│      │                                                          │
│      │    [DreamTree content - left, no bubble]                 │
│      │                                                          │
│      │  ─────────────────────────────────────────────────────── │
│      │  │ Type here...                              │ [Send]  │ │
│      │  ─────────────────────────────────────────────────────── │
└──────┴──────────────────────────────────────────────────────────┘
        │← ────────────── max-width: 720px ────────────── →│
```

**Mobile (<1024px)**

```
┌─────────────────────────────────────────────────────────────────┐
│  Part 1: Roots › Module 1.1 › Exercise 1.1.1                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [DreamTree content - left, no bubble]                          │
│                                                                 │
│                        ↕ space-6                                │
│                                                                 │
│                    [User response - right, bubble]              │
│                                                                 │
│                        ↕ space-6                                │
│                                                                 │
│  [DreamTree content - left, no bubble]                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  │ Type here...                                    │  [Send]    │
├─────────────────────────────────────────────────────────────────┤
│     🏠          📑          🧰          👤                      │
│    Home        TOC        Tools      Profile                    │
│                          56px                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Navigation Bar

| Property | Desktop | Mobile |
|----------|---------|--------|
| Position | Fixed left | Fixed bottom |
| Width/Height | 64px wide | 56px tall |
| Icons | Stacked vertically, centered | Row, evenly distributed |
| Icon size | 24px | 24px |
| Touch target | 48px × 48px | 48px × 48px |
| Background | Same as app background | Same as app background |
| Border | Right: 1px `--color-muted` @ 20% | Top: 1px `--color-muted` @ 20% |

**Nav Items**

| Icon | Label | Action |
|------|-------|--------|
| 🏠 | Home | Return to dashboard/home |
| 📑 | TOC | Open table of contents overlay |
| 🧰 | Tools | Open tools panel (shows unlocked tools) |
| 👤 | Profile | Open profile/settings |

*Icons are placeholder — actual icons specified in Component Spec. Simple line icons, 24px, 1.5px stroke.*

### Header Bar (Breadcrumb)

| Property | Value |
|----------|-------|
| Position | Fixed top, scrolls away on scroll-down, reappears on scroll-up |
| Auto-hide | Fades out after 20 seconds of no scroll activity (opacity 1 → 0, 400ms ease) |
| Reappear trigger | Any scroll-up movement, or tap top edge of screen |
| Height | 48px |
| Content | Breadcrumb: Part › Module › Exercise (each segment tappable) |
| Background | App background color with subtle blur backdrop |
| Border | Bottom: 1px `--color-muted` @ 20% |
| Max-width | 720px centered (aligns with content) |

**Header States**

| State | Behavior |
|-------|----------|
| Visible | Full opacity, breadcrumb legible |
| Hiding | Fade out over 400ms after 20s idle |
| Hidden | `opacity: 0`, `pointer-events: none` |
| Reappearing | Fade in over 200ms on scroll-up |

### Input Area Behavior

| State | Appearance |
|-------|------------|
| **Active (at current exercise)** | Full input area: text field + send button, full padding |
| **Collapsed (scrolled up in history)** | Single line, muted: "↓ Return to current" link, minimal height (40px) |
| **Expanding** | Tapping collapsed bar scrolls to current exercise and expands input (200ms ease) |

```
Collapsed state:
┌─────────────────────────────────────────────────────────────────┐
│                      ↓ Return to current                        │
└─────────────────────────────────────────────────────────────────┘

Active state:
┌─────────────────────────────────────────────────────────────────┐
│  │ Type here...                                    │  [Send]    │
└─────────────────────────────────────────────────────────────────┘
```

### Content Area Dimensions

| Property | Value |
|----------|-------|
| Max width | 720px |
| Horizontal padding | `space-4` (16px) on mobile, auto margins on desktop |
| Top padding | `space-16` (64px) — clears header with breathing room |
| Bottom padding | `space-16` (64px) — clears input area with breathing room |

### Responsive Breakpoints

| Name | Min Width | Layout Change |
|------|-----------|---------------|
| `mobile` | 0px | Nav at bottom, header top, tighter message gaps |
| `tablet` | 640px | Same as mobile, slightly more generous margins |
| `desktop` | 1024px | Nav moves to left rail, header centered over content |
| `wide` | 1280px | No change — extra space becomes margins |

### Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `z-base` | 0 | Default content |
| `z-raised` | 10 | User response bubbles |
| `z-nav` | 50 | Navigation bar (left rail or bottom) |
| `z-header` | 60 | Header breadcrumb bar |
| `z-input` | 70 | Input area (above header when both visible) |
| `z-overlay` | 200 | TOC overlay, tools panel |
| `z-modal` | 300 | Confirmation dialogs, onboarding |
| `z-tooltip` | 400 | Tooltips, popovers |

---

## 6. Borders, Radii & Focus States

### Border Radius Scale

Restrained radius scale. Soft but not bubbly — "quality paper" not "friendly app."

| Token | Value | Usage |
|-------|-------|-------|
| `radius-none` | 0px | Sharp edges: progress bars, dividers |
| `radius-sm` | 4px | Subtle rounding: inputs, buttons, tags, tooltips |
| `radius-md` | 8px | Standard rounding: user response bubbles, cards, panels |
| `radius-lg` | 12px | Prominent rounding: modals, overlay panels |
| `radius-xl` | 16px | Large containers: onboarding card, empty states |
| `radius-full` | 9999px | Pills: nav icon hover, status indicators, avatar |

### Component Radius Assignments

| Component | Radius |
|-----------|--------|
| User response bubble | `radius-md` (8px) |
| Text inputs | `radius-sm` (4px) |
| Buttons (standard) | `radius-sm` (4px) |
| Buttons (icon-only) | `radius-full` |
| Cards, structured inputs | `radius-md` (8px) |
| Modal dialogs | `radius-lg` (12px) |
| Tooltips | `radius-sm` (4px) |
| Nav icon hover state | `radius-full` |
| Onboarding swatches | `radius-sm` (4px) |

### Border Widths

| Token | Value | Usage |
|-------|-------|-------|
| `border-thin` | 1px | Dividers, input borders, separators |
| `border-medium` | 2px | Focus indicator, selected states |

### Border Colors

| State | Light Themes | Dark Themes |
|-------|--------------|-------------|
| Default | `--color-muted` @ 30% | `--color-muted` @ 25% |
| Hover | `--color-muted` @ 50% | `--color-muted` @ 40% |
| Focus | `--color-primary` @ 100% | `--color-primary` @ 100% |
| Selected | `--color-primary` @ 100% | `--color-primary` @ 100% |
| Error | `--color-error` @ 100% | `--color-error` @ 100% |
| Disabled | `--color-muted` @ 15% | `--color-muted` @ 12% |

### Focus States

Every interactive element has a visible focus state for keyboard navigation.

**Focus Ring**

```css
--focus-ring: 0 0 0 3px var(--color-primary-alpha-20);
```

| Element | Focus Treatment |
|---------|-----------------|
| Text inputs | Border → `--color-primary`, add `--focus-ring` |
| Buttons | Add `--focus-ring` |
| Nav icons | Background circle: `--color-primary` @ 15% |
| Inline links | Underline thickens to 2px |
| Cards/bubbles (if focusable) | Outline: 2px `--color-primary`, offset 2px |

```css
.focus-ring:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
  border-color: var(--color-primary);
}
```

### Dividers

Rare — we prefer whitespace. Used only for module transitions and major section breaks.

| Property | Value |
|----------|-------|
| Height | 1px |
| Color | `--color-muted` @ 20% |
| Margin | `space-10` (40px) above and below |
| Width | 100% of content area |

### Selection States

For multi-select and ranking interfaces:

| State | Treatment |
|-------|-----------|
| Unselected | Border: `--color-muted` @ 30% |
| Hover | Border: `--color-muted` @ 50% |
| Selected | Border: 2px `--color-primary`, background: `--color-primary` @ 8% |

### Disabled States

| Property | Value |
|----------|-------|
| Opacity | 50% |
| Cursor | `not-allowed` |
| Pointer events | none |

Onboarding color swatches (invalid pairings):

- 40% opacity
- Hover triggers tooltip explaining why
- `cursor: not-allowed`

### Overlays & Modals

Differentiation via background dim and border only (no shadows):

| Element | Treatment |
|---------|-----------|
| Backdrop | `#000000` @ 40% (light themes), @ 50% (dark themes) |
| Modal container | App background color, `border-thin` `--color-muted` @ 30%, `radius-lg` |
| TOC/Tools panel | Slides in from edge, same treatment as modal |

---

## 7. Animation & Transitions

### Philosophy

Animation in DreamTree serves function, not decoration. Every motion should feel like a natural consequence of user action — not a performance. The app should feel calm, responsive, and unhurried.

**Guiding Principles**

| Principle | What it means |
|-----------|---------------|
| **Purposeful** | Animation clarifies what happened. Never animate just because we can. |
| **Quick but not rushed** | Fast enough to not slow users down, slow enough to be perceived. Most transitions: 150-250ms. |
| **Consistent easing** | One easing curve for almost everything. Predictability feels stable. |
| **Reduced motion respected** | All animation disabled when `prefers-reduced-motion: reduce` is set. |

### Duration Scale

| Token | Value | Usage |
|-------|-------|-------|
| `duration-instant` | 0ms | Immediate state changes (color on click) |
| `duration-fast` | 100ms | Micro-interactions: button press, checkbox toggle |
| `duration-normal` | 200ms | Standard transitions: hover states, focus rings, input changes |
| `duration-slow` | 300ms | Larger movements: panels opening, overlays appearing |
| `duration-slower` | 400ms | Significant transitions: modal entrance, header fade |
| `duration-slowest` | 600ms | Rare, dramatic moments: onboarding screen transitions |

### Easing

| Token | Value | Usage |
|-------|-------|-------|
| `ease-default` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Almost everything. Smooth, slightly accelerates in, decelerates out. |
| `ease-out` | `cubic-bezier(0, 0, 0.25, 1)` | Elements entering: panels sliding in, messages appearing. |
| `ease-in` | `cubic-bezier(0.25, 0, 1, 1)` | Elements exiting: panels closing, fading out. |
| `ease-linear` | `linear` | Rare. Progress bars, continuous animations. |

### Common Transitions

**Interactive Elements**

| Element | Property | Duration | Easing |
|---------|----------|----------|--------|
| Button hover | background-color, border-color | `duration-fast` | `ease-default` |
| Button press | transform (scale 0.98) | `duration-instant` | `ease-default` |
| Input focus | border-color, box-shadow | `duration-normal` | `ease-default` |
| Link hover | color, text-decoration-color | `duration-fast` | `ease-default` |
| Nav icon hover | background-color | `duration-normal` | `ease-default` |

**Conversation Flow**

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| DreamTree content (typing) | Characters appear sequentially | ~30ms per character | linear reveal |
| Typing cursor | Blinking pipe `\|` at end of current text | 530ms on, 530ms off | step |
| After typing completes | Cursor disappears, next block begins after pause | `duration-slow` | — |
| User response (after submit) | Fade in + slide up 8px | `duration-normal` | `ease-out` |
| Timestamp appearance | Fade in | `duration-slow` | `ease-out` |

```css
@keyframes message-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes blink-cursor {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

**User control**: If user clicks/taps during typing, remaining content in that block appears instantly. Respects impatience without punishing patience.

**Header Behavior**

| Transition | Duration | Easing | Trigger |
|------------|----------|--------|---------|
| Fade out (idle) | `duration-slower` (400ms) | `ease-in` | 20 seconds no scroll |
| Fade in (scroll up) | `duration-normal` (200ms) | `ease-out` | Any upward scroll |

**Input Area**

| State Change | Animation | Duration | Easing |
|--------------|-----------|----------|--------|
| Collapse (scroll up) | Height shrinks, content fades | `duration-slow` | `ease-default` |
| Expand (return to current) | Height grows, content fades in | `duration-slow` | `ease-out` |

**Overlays & Panels**

| Element | Enter | Exit | Duration |
|---------|-------|------|----------|
| Backdrop | Fade in from 0% | Fade out to 0% | `duration-slow` |
| Modal | Fade in + scale from 0.95 | Fade out + scale to 0.95 | `duration-slow` |
| TOC panel (mobile) | Slide up from bottom | Slide down | `duration-slow` |
| TOC panel (desktop) | Slide in from left | Slide out left | `duration-slow` |
| Tools panel | Same as TOC | Same as TOC | `duration-slow` |
| Tooltip | Fade in | Fade out | `duration-fast` |

```css
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Structured Input Animations

| Interaction | Animation | Duration |
|-------------|-----------|----------|
| Add list item | New row fades in + slides down | `duration-normal` |
| Remove list item | Row fades out + collapses height | `duration-normal` |
| Reorder list item (drag) | Item follows cursor, others shift smoothly | `duration-fast` for shifts |
| Slider thumb drag | Immediate (no transition on drag) | — |
| Slider value change (tap) | Thumb slides to new position | `duration-fast` |

### Progress & Completion

| Moment | Animation |
|--------|-----------|
| Exercise completion | Subtle checkmark fade-in next to activity title |
| Module completion | Brief pause, then next module content begins entering |
| Tool unlock notification | Slides in from right edge, holds 4 seconds, slides out |

```css
@keyframes toast-enter {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes toast-exit {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}
```

### Reduced Motion

When `prefers-reduced-motion: reduce` is set:

| Normal Behavior | Reduced Behavior |
|-----------------|------------------|
| Slide + fade | Instant appear (opacity only, no transform) |
| Scale transitions | No scale, opacity only |
| Sliding panels | Instant appear/disappear |
| Toast slide | Instant appear, instant disappear |
| Typing effect | Full text appears immediately |
| Duration values | All become `duration-instant` or `duration-fast` max |

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### What We Don't Animate

| Element | Why not |
|---------|---------|
| Background color preference change | Instant swap feels more intentional |
| Font family change | Instant swap — animating type is jarring |
| Scroll position | Native scroll only, no smooth-scroll hijacking |

---

## 8. Accessibility Requirements

### Standards Target

WCAG 2.1 Level AA compliance as baseline. We aim higher where practical.

### Color & Contrast

| Requirement | Target | How We Meet It |
|-------------|--------|----------------|
| Body text contrast | 4.5:1 minimum | Constrained pairings enforce this |
| Large text contrast | 3:1 minimum | All pairings exceed this |
| UI component contrast | 3:1 against background | Borders, icons tested per pairing |
| Focus indicator contrast | 3:1 against adjacent colors | `--color-primary` meets this on all backgrounds |
| Non-text contrast | 3:1 minimum | Icon stroke matches text color |

**Color Not Sole Indicator**

| Context | Redundant Indicator |
|---------|---------------------|
| Error state | Red border + error icon + error message text |
| Success state | Green color + checkmark icon + confirmation text |
| Selected state | Border change + background tint + checkmark |
| Links | Color + underline (visible by default) |
| Required fields | Asterisk + "(required)" text for screen readers |

### Typography & Readability

| Requirement | Implementation |
|-------------|----------------|
| Minimum body text size | 16px (scaled per font family) |
| Line height | 1.5–1.6 for body text |
| Line length | Max 65-75 characters |
| Paragraph spacing | Minimum `space-4` (16px) |
| Text resizing | Functional at 200% browser zoom |
| Font scaling | Respects OS/browser font size preferences |

### Keyboard Navigation

| Requirement | Implementation |
|-------------|----------------|
| All interactive elements focusable | Tab order follows visual/logical order |
| Visible focus indicator | `--focus-ring` on all focusable elements |
| Skip link | "Skip to content" link (hidden until focused) |
| No keyboard traps | Modals trap focus while open, release on close. Escape closes overlays. |
| Arrow key navigation | Within tools (ranking grid, sliders), arrows move between options |

**Focus Order**

```
[Skip Link] → [Nav: Home] → [Nav: TOC] → [Nav: Tools] → [Nav: Profile] 
→ [Header breadcrumb links] → [Main content: interactive elements in order] 
→ [Input area]
```

When overlay opens:

```
[Overlay close button] → [Overlay content] → [trap: cycle within overlay]
```

### Screen Reader Support

| Element | Implementation |
|---------|----------------|
| Page structure | Semantic HTML: `<header>`, `<nav>`, `<main>`, `<footer>` |
| Headings | Proper hierarchy: h1 (Part), h2 (Module), h3 (Exercise), h4 (Activity) |
| Landmarks | `role="navigation"`, `role="main"`, `aria-label` on nav regions |
| Live regions | New messages announced via `aria-live="polite"` |
| Typing effect | Full text available to screen readers immediately (typing is visual only) |
| Form labels | All inputs have associated `<label>` or `aria-label` |
| Error messages | Linked to inputs via `aria-describedby` |
| Progress | Current location announced: "Part 1, Module 1, Exercise 1.1.1" |
| Icons | Decorative: `aria-hidden="true"`. Functional: `aria-label` describing action |

**Message Structure for Screen Readers**

```html
<!-- DreamTree content -->
<article aria-label="DreamTree" class="message-content">
  <p>Skills are the most basic unit of performance...</p>
</article>

<!-- User response -->
<article aria-label="Your response" class="message-user">
  <ul>
    <li>Marketing Coordinator, ABC Corp</li>
    <li>Barista, Local Coffee Shop</li>
  </ul>
</article>
```

### Touch & Motor Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Touch target size | Minimum 44×44px for all interactive elements |
| Touch target spacing | Minimum 8px between adjacent targets |
| Drag alternatives | All drag-to-reorder has button alternative (move up/move down) |
| Timeout adjustments | No critical timeouts; header fade is cosmetic |
| Single-pointer operation | All functionality without complex gestures |

### Cognitive Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Consistent navigation | Nav position, order, behavior identical across all screens |
| Predictable behavior | Same actions produce same results |
| Error prevention | Confirmation for destructive actions; clear undo where possible |
| Clear language | Plain language in UI copy; jargon explained on first use |
| Progress visibility | Clear where user is (breadcrumb), what's complete (checkmarks) |
| Auto-save | No data loss from navigation; "Saved" indicator provides confidence |
| Chunked content | Exercises broken into activities; never overwhelming walls of text |

### Reduced Motion (Recap)

| Setting | Behavior |
|---------|----------|
| `prefers-reduced-motion: reduce` | All animations instant or disabled; typing effect shows complete text immediately |

### Testing Checklist

| Test | Tool/Method |
|------|-------------|
| Color contrast | axe DevTools, Colour Contrast Analyzer |
| Keyboard navigation | Manual testing, no mouse |
| Screen reader | VoiceOver (macOS/iOS), NVDA (Windows), TalkBack (Android) |
| Zoom/reflow | Browser zoom to 200%, verify no horizontal scroll |
| Reduced motion | OS setting enabled, verify animations respect preference |
| Touch targets | Mobile device testing, browser device emulation |

---

## Appendix: CSS Custom Properties Reference

```css
:root {
  /* Base Colors */
  --color-ivory: #FAF8F5;
  --color-cream: #E8DCC4;
  --color-brown: #5C4033;
  --color-charcoal: #2C3E50;
  --color-black: #1A1A1A;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  
  /* Border Radius */
  --radius-none: 0;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  
  /* Borders */
  --border-thin: 1px;
  --border-medium: 2px;
  
  /* Durations */
  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 400ms;
  --duration-slowest: 600ms;
  
  /* Easing */
  --ease-default: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-out: cubic-bezier(0, 0, 0.25, 1);
  --ease-in: cubic-bezier(0.25, 0, 1, 1);
  
  /* Z-Index */
  --z-base: 0;
  --z-raised: 10;
  --z-nav: 50;
  --z-header: 60;
  --z-input: 70;
  --z-overlay: 200;
  --z-modal: 300;
  --z-tooltip: 400;
  
  /* Focus Ring */
  --focus-ring: 0 0 0 3px var(--color-primary-alpha-20);
}

/* Light Theme */
.theme-light {
  --color-bg: var(--color-ivory);
  --color-text: var(--color-charcoal);
  --color-primary: #1B7B6D;
  --color-primary-alpha-20: rgba(27, 123, 109, 0.2);
  --color-success: #2D6A4F;
  --color-warning: #B5651D;
  --color-error: #9B2C2C;
  --color-muted: #6B6B6B;
  --backdrop-opacity: 0.4;
}

/* Dark Theme */
.theme-dark {
  --color-bg: var(--color-charcoal);
  --color-text: var(--color-ivory);
  --color-primary: #4ECDC4;
  --color-primary-alpha-20: rgba(78, 205, 196, 0.2);
  --color-success: #6BCB77;
  --color-warning: #F4A261;
  --color-error: #E57373;
  --color-muted: #A0A0A0;
  --backdrop-opacity: 0.5;
}
```

---

*Document Version: 1.0*  
*Last Updated: January 2025*  
*Status: Ready for Component Specification phase*