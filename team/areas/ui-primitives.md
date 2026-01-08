# UI Primitives

This area owns the foundational UI building blocks: form controls, feedback mechanisms, and icons.

## Ownership

**Scope:**
- `src/components/forms/` - Form input components
  - `TextInput.tsx` - Single-line text field
  - `TextArea.tsx` - Multi-line text field
  - `Slider.tsx` - Numeric range input
  - `Checkbox.tsx` - Single checkbox
  - `CheckboxGroup.tsx` - Multiple checkboxes
  - `RadioGroup.tsx` - Radio button group
  - `Select.tsx` - Dropdown select
- `src/components/feedback/` - User feedback components
  - `Toast.tsx` - Notification popup
  - `ToastContainer.tsx` - Toast manager
  - `ToastContext.tsx` - Toast state context
  - `Tooltip.tsx` - Hover tooltip
  - `SaveIndicator.tsx` - Save status feedback
  - `EmptyState.tsx` - Empty state placeholder
  - `ErrorBoundary.tsx` - React error boundary
- `src/components/icons/` - SVG icon components

**Does NOT own:**
- Tool-specific forms (owned by Tools)
- Conversation message rendering (owned by Conversation)
- Layout structure (owned by Shell)

---

## Key Files

| File | Purpose |
|------|---------|
| `src/components/forms/TextInput.tsx` | Standard text input with label/error |
| `src/components/forms/Slider.tsx` | Range slider with min/max/step |
| `src/components/feedback/Toast.tsx` | Dismissable notification |
| `src/components/feedback/ToastContext.tsx` | `useToast()` hook provider |
| `src/components/feedback/ErrorBoundary.tsx` | Catch and display React errors |
| `src/components/icons/index.ts` | Icon component exports |

---

## Patterns & Conventions

### Form Components
All form components follow this pattern:
```tsx
<TextInput
  label="Field Label"
  name="fieldName"
  value={value}
  onChange={handleChange}
  error={errorMessage}
  required
/>
```

### Controlled Inputs
- All form components are controlled
- Value and onChange are required
- No internal state for form values

### Toast Usage
```tsx
import { useToast } from '@/components/feedback';

const { showToast } = useToast();
showToast('Saved successfully', 'success');
showToast('Something went wrong', 'error');
```

### Icon Components
```tsx
import { AcornIcon, InfoIcon, LoaderIcon } from '@/components/icons';

<AcornIcon size={24} />
<InfoIcon className="info-icon" />
```

---

## Common Tasks

### Adding a Form Component
1. Create component in `src/components/forms/`
2. Follow controlled component pattern
3. Include label, error, and disabled states
4. Add CSS classes to globals.css if needed
5. Export from index.ts

### Adding an Icon
1. Create component in `src/components/icons/`
2. Accept `size`, `className`, and standard SVG props
3. Use `currentColor` for fill/stroke
4. Export from index.ts

### Adding Feedback Component
1. Create in `src/components/feedback/`
2. Follow existing patterns (Toast, Tooltip)
3. Use appropriate z-index (z-tooltip: 400)
4. Handle accessibility (role, aria-live)

---

## Testing

### Form Testing
- Verify controlled value updates
- Test error state display
- Check disabled state styling
- Verify label association (htmlFor)

### Accessibility Testing
- All inputs have associated labels
- Error messages linked with aria-describedby
- Focus states visible (focus-visible)
- Touch targets minimum 44px

### Toast Testing
- Multiple toasts stack correctly
- Auto-dismiss after timeout
- Manual dismiss works
- Screen reader announces

---

## Gotchas

### Slider Component
- HTML range input needs custom styling
- Track and thumb styled separately
- Value display updates on change

### Checkbox vs CheckboxGroup
- Checkbox: single boolean value
- CheckboxGroup: array of selected values
- Different onChange signatures

### Toast Z-Index
- Toasts render in ToastContainer
- Z-index: 400 (z-tooltip level)
- Must be above all content including modals

### ErrorBoundary Placement
- Wrap at page or feature level
- Not around individual components
- Provides fallback UI on crash

### Icon Sizing
- Default size varies by icon
- Pass explicit `size` prop for consistency
- Some icons only have one weight (400)

---

## Dependencies

**Depends on:**
- Design System (CSS variables, colors, spacing)

**Depended by:**
- Conversation (form components in prompts)
- Tools (form components in tool interfaces)
- Features (forms in onboarding, profile)
- Workbook (PromptInput uses form components)
- Shell (icons in NavBar)

---

## Interface Contracts

### Form Component Props
```typescript
interface FormControlProps {
  label: string;
  name: string;
  value: string | number | boolean | string[];
  onChange: (value: ValueType) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}
```

### Toast Hook
```typescript
import { useToast } from '@/components/feedback';

const { showToast, hideToast } = useToast();
showToast(message: string, type: 'success' | 'error' | 'info');
```

### Icon Props
```typescript
interface IconProps {
  size?: number;
  className?: string;
  // ...SVG attributes
}
```

---

## Spec Reference
- Form components: `/planning/DreamTree_Component_Spec.md` (Forms section)
- Feedback patterns: Same file, Feedback section
- Icon list: Same file, Icons section
- Touch targets: `/planning/DreamTree_Design_System.md` (Accessibility)
