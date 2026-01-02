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
