# DreamTree Component Specification
## Section 10: Page Components — Part 3: Settings

> Settings page layout with visual preferences, accessibility, notifications, account, and data management.

---

## 10.32 Settings

User preferences, notifications, account, and data management.

### URL
`/settings`

### Structure (Top to Bottom)

1. `SettingsSection`: Visual Preferences
2. `SettingsSection`: Accessibility
3. `SettingsSection`: Notifications
4. `SettingsSection`: Account
5. `SettingsSection`: Data Management

### Behaviors

| Behavior | Detail |
|----------|--------|
| **Visual changes** | Update live immediately |
| **All changes** | Auto-save on interaction |

### Rendered Structure

```html
<AppShell showBreadcrumb={false} showInput={false}>
  <div class="settings">
    <h1 class="settings-title">Settings</h1>
    
    <SettingsSection title="Visual Preferences">
      <VisualPreferencesEditor ... />
    </SettingsSection>
    
    <SettingsSection title="Accessibility">
      <AccessibilitySettings ... />
    </SettingsSection>
    
    <SettingsSection title="Notifications">
      <NotificationSettings ... />
    </SettingsSection>
    
    <SettingsSection title="Account">
      <AccountSettings ... />
    </SettingsSection>
    
    <SettingsSection title="Data Management">
      <DataControls ... />
    </SettingsSection>
  </div>
</AppShell>
```

### Styling

```css
.settings {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

.settings-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-6) 0;
}
```

---

## 10.33 `SettingsSection`

Reusable settings section wrapper.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Section heading |
| `children` | `ReactNode` | required | Section content |

### Rendered Structure

```html
<section class="settings-section">
  <h2 class="settings-section-title">{title}</h2>
  <div class="settings-section-content">
    {children}
  </div>
</section>
```

### Styling

```css
.settings-section {
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 15%, transparent);
}

.settings-section:first-of-type {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.settings-section-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-4) 0;
}

.settings-section-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
```

---

## 10.34 `VisualPreferencesEditor`

Live-updating visual preference controls.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backgroundColor` | `BackgroundColorId` | required | Current background |
| `textColor` | `TextColorId` | required | Current text color |
| `fontFamily` | `FontFamilyId` | required | Current font |
| `onBackgroundChange` | `(id: BackgroundColorId) => void` | required | Background handler |
| `onTextChange` | `(id: TextColorId) => void` | required | Text handler |
| `onFontChange` | `(id: FontFamilyId) => void` | required | Font handler |

### Color Options

```typescript
const backgroundColors = [
  { id: 'ivory', name: 'Ivory', hex: '#FAF8F5' },
  { id: 'creamy-tan', name: 'Creamy Tan', hex: '#E8DCC4' },
  { id: 'brown', name: 'Brown', hex: '#5C4033' },
  { id: 'charcoal', name: 'Charcoal', hex: '#2C3E50' },
  { id: 'black', name: 'Black', hex: '#1A1A1A' },
];

const textColors = backgroundColors; // Same palette
```

### Font Options

```typescript
const fonts = [
  { id: 'inter', name: 'Sans', family: 'Inter, sans-serif' },
  { id: 'lora', name: 'Serif', family: 'Lora, serif' },
  { id: 'courier-prime', name: 'Typewriter', family: '"Courier Prime", monospace' },
  { id: 'shadows-into-light', name: 'Handwritten', family: '"Shadows Into Light", cursive' },
  { id: 'jacquard-24', name: 'Decorative', family: '"Jacquard 24", serif' },
];
```

### Rendered Structure

```html
<div class="visual-preferences">
  <div class="visual-preferences-group">
    <label class="visual-preferences-label">Background Color</label>
    <div class="visual-preferences-swatches">
      {backgroundColors.map(color => (
        <ColorSwatch
          key={color.id}
          color={color}
          isSelected={backgroundColor === color.id}
          onSelect={() => onBackgroundChange(color.id)}
        />
      ))}
    </div>
  </div>
  
  <div class="visual-preferences-group">
    <label class="visual-preferences-label">Text Color</label>
    <div class="visual-preferences-swatches">
      {textColors.map(color => (
        <ColorSwatch
          key={color.id}
          color={color}
          isSelected={textColor === color.id}
          onSelect={() => onTextChange(color.id)}
        />
      ))}
    </div>
  </div>
  
  <div class="visual-preferences-group">
    <label class="visual-preferences-label">Font</label>
    <div class="visual-preferences-fonts">
      {fonts.map(font => (
        <FontPreview
          key={font.id}
          font={font}
          isSelected={fontFamily === font.id}
          onSelect={() => onFontChange(font.id)}
        />
      ))}
    </div>
  </div>
</div>
```

### Styling

```css
.visual-preferences {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.visual-preferences-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.visual-preferences-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.visual-preferences-swatches {
  display: flex;
  gap: var(--space-2);
}

.visual-preferences-fonts {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
```

---

## 10.35 `AccessibilitySettings`

Reduced motion toggle and font size slider.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `reducedMotion` | `boolean` | `false` | Reduced motion enabled |
| `fontSize` | `number` | `16` | Font size in px |
| `onReducedMotionChange` | `(enabled: boolean) => void` | required | Toggle handler |
| `onFontSizeChange` | `(size: number) => void` | required | Size handler |

### Rendered Structure

```html
<div class="accessibility-settings">
  <div class="settings-row">
    <div class="settings-row-content">
      <span class="settings-row-label">Reduced Motion</span>
      <span class="settings-row-description">
        Minimize animations throughout the app
      </span>
    </div>
    <Toggle
      checked={reducedMotion}
      onChange={onReducedMotionChange}
      ariaLabel="Reduced motion"
    />
  </div>
  
  <div class="settings-row">
    <div class="settings-row-content">
      <span class="settings-row-label">Font Size</span>
      <span class="settings-row-description">
        {fontSize}px
      </span>
    </div>
    <FontSizeSlider
      value={fontSize}
      min={14}
      max={22}
      onChange={onFontSizeChange}
    />
  </div>
</div>
```

---

## 10.36 `FontSizeSlider`

Slider for adjusting font size.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `16` | Current size in px |
| `min` | `number` | `14` | Minimum size |
| `max` | `number` | `22` | Maximum size |
| `onChange` | `(size: number) => void` | required | Change handler |

### Rendered Structure

```html
<div class="font-size-slider">
  <span class="font-size-slider-label font-size-slider-min">A</span>
  <input
    type="range"
    class="font-size-slider-input"
    min={min}
    max={max}
    value={value}
    onChange={(e) => onChange(parseInt(e.target.value))}
    aria-label="Font size"
  />
  <span class="font-size-slider-label font-size-slider-max">A</span>
</div>
```

### Styling

```css
.font-size-slider {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 200px;
}

.font-size-slider-label {
  font-weight: var(--font-medium);
  color: var(--color-muted);
}

.font-size-slider-min {
  font-size: 12px;
}

.font-size-slider-max {
  font-size: 20px;
}

.font-size-slider-input {
  flex: 1;
  height: 4px;
  appearance: none;
  background: color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-full);
}

.font-size-slider-input::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  cursor: pointer;
}

.font-size-slider-input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  cursor: pointer;
  border: none;
}

.font-size-slider-input:focus {
  outline: none;
}

.font-size-slider-input:focus::-webkit-slider-thumb {
  box-shadow: var(--focus-ring);
}
```

---

## 10.37 `NotificationSettings`

Reminder configuration.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enabled` | `boolean` | `false` | Notifications enabled |
| `days` | `DayOfWeek[]` | `[]` | Selected days |
| `time` | `string` | `'09:00'` | Reminder time |
| `onEnabledChange` | `(enabled: boolean) => void` | required | Toggle handler |
| `onDaysChange` | `(days: DayOfWeek[]) => void` | required | Days handler |
| `onTimeChange` | `(time: string) => void` | required | Time handler |

### Types

```typescript
type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
```

### Rendered Structure

```html
<div class="notification-settings">
  <div class="settings-row">
    <div class="settings-row-content">
      <span class="settings-row-label">Enable Reminders</span>
      <span class="settings-row-description">
        Get notified to continue your journey
      </span>
    </div>
    <Toggle
      checked={enabled}
      onChange={onEnabledChange}
      ariaLabel="Enable reminders"
    />
  </div>
  
  {enabled && (
    <>
      <div class="notification-days">
        <label class="notification-days-label">Remind me on</label>
        <DaySelector
          selected={days}
          onChange={onDaysChange}
        />
      </div>
      
      <div class="notification-time">
        <label class="notification-time-label">At</label>
        <TimePicker
          value={time}
          onChange={onTimeChange}
        />
      </div>
    </>
  )}
</div>
```

---

## 10.38 `DaySelector`

Multi-select day of week picker.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selected` | `DayOfWeek[]` | `[]` | Selected days |
| `onChange` | `(days: DayOfWeek[]) => void` | required | Change handler |

### Day Configuration

```typescript
const days = [
  { id: 'mon', shortLabel: 'M', fullLabel: 'Monday' },
  { id: 'tue', shortLabel: 'T', fullLabel: 'Tuesday' },
  { id: 'wed', shortLabel: 'W', fullLabel: 'Wednesday' },
  { id: 'thu', shortLabel: 'T', fullLabel: 'Thursday' },
  { id: 'fri', shortLabel: 'F', fullLabel: 'Friday' },
  { id: 'sat', shortLabel: 'S', fullLabel: 'Saturday' },
  { id: 'sun', shortLabel: 'S', fullLabel: 'Sunday' },
];
```

### Rendered Structure

```html
<div class="day-selector">
  <label class="day-selector-all">
    <Checkbox
      checked={selected.length === 7}
      indeterminate={selected.length > 0 && selected.length < 7}
      onChange={handleSelectAll}
    />
    <span>Select all</span>
  </label>
  
  <div class="day-selector-days">
    {days.map(day => (
      <button
        key={day.id}
        class="day-selector-day"
        data-selected={selected.includes(day.id)}
        onClick={() => toggleDay(day.id)}
        aria-label={day.fullLabel}
        aria-pressed={selected.includes(day.id)}
      >
        {day.shortLabel}
      </button>
    ))}
  </div>
</div>
```

### Styling

```css
.day-selector {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.day-selector-all {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  cursor: pointer;
}

.day-selector-days {
  display: flex;
  gap: var(--space-1);
}

.day-selector-day {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: background-color var(--duration-fast) ease,
              border-color var(--duration-fast) ease;
}

.day-selector-day:hover {
  border-color: color-mix(in srgb, var(--color-muted) 40%, transparent);
}

.day-selector-day[data-selected="true"] {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
}

.day-selector-day:focus {
  outline: none;
  box-shadow: var(--focus-ring);
}
```

---

## 10.39 `TimePicker`

Time input with locale-aware format (auto-detects 12hr/24hr).

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `'09:00'` | Time in HH:MM format |
| `onChange` | `(time: string) => void` | required | Change handler |

### Rendered Structure

```html
<input
  type="time"
  class="time-picker"
  value={value}
  onChange={(e) => onChange(e.target.value)}
  aria-label="Reminder time"
/>
```

### Styling

```css
.time-picker {
  padding: var(--space-2) var(--space-3);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  background: transparent;
  color: var(--color-text);
}

.time-picker:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}
```

---

## 10.40 `AccountSettings`

Auth methods, email, logout, and upgrade.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `authMethods` | `AuthMethod[]` | `[]` | Linked auth methods |
| `email` | `string \| null` | `null` | User email if linked |
| `tier` | `'free' \| 'paid'` | `'free'` | Subscription tier |
| `onAddAuthMethod` | `() => void` | required | Add method handler |
| `onRemoveAuthMethod` | `(id: string) => void` | required | Remove handler |
| `onEmailChange` | `(email: string) => void` | — | Email change handler |
| `onLogout` | `() => void` | required | Logout handler |
| `onUpgrade` | `() => void` | — | Upgrade handler |

### Types

```typescript
type AuthMethod = {
  id: string;
  type: 'email' | 'wallet' | 'passkey';
  label: string; // e.g., "user@example.com" or "0x1234...5678"
};
```

### Auth Icons

```typescript
const authIcons: Record<AuthMethod['type'], IconComponent> = {
  'email': MailIcon,
  'wallet': WalletIcon,
  'passkey': KeyIcon,
};
```

### Rendered Structure

```html
<div class="account-settings">
  <div class="account-auth-methods">
    <h3 class="account-subsection-title">Authentication Methods</h3>
    
    {authMethods.map(method => (
      <div key={method.id} class="account-auth-method">
        <span class="account-auth-method-icon">
          <Icon component={authIcons[method.type]} />
        </span>
        <span class="account-auth-method-label">{method.label}</span>
        {authMethods.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveAuthMethod(method.id)}
          >
            Remove
          </Button>
        )}
      </div>
    ))}
    
    <Button
      variant="secondary"
      size="sm"
      onClick={onAddAuthMethod}
    >
      Add Authentication Method
    </Button>
  </div>
  
  {email && onEmailChange && (
    <div class="account-email">
      <h3 class="account-subsection-title">Email Address</h3>
      <TextInput
        value={email}
        onChange={onEmailChange}
        type="email"
      />
    </div>
  )}
  
  <div class="account-actions">
    {tier === 'free' && onUpgrade && (
      <Button variant="primary" onClick={onUpgrade}>
        Upgrade to Paid
      </Button>
    )}
    
    {tier === 'paid' && (
      <Button variant="secondary" onClick={onManageSubscription}>
        Manage Subscription
      </Button>
    )}
    
    <Button variant="ghost" onClick={onLogout}>
      Log Out
    </Button>
  </div>
</div>
```

### Styling

```css
.account-settings {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.account-subsection-title {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-muted);
  margin: 0 0 var(--space-3) 0;
}

.account-auth-methods {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.account-auth-method {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: color-mix(in srgb, var(--color-muted) 5%, transparent);
  border-radius: var(--radius-sm);
}

.account-auth-method-icon {
  width: 20px;
  height: 20px;
  color: var(--color-muted);
}

.account-auth-method-label {
  flex: 1;
  font-size: var(--text-sm);
}

.account-actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}
```

---

## 10.41 `Toggle`

Boolean toggle switch.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | `false` | Toggle state |
| `onChange` | `(checked: boolean) => void` | required | Change handler |
| `disabled` | `boolean` | `false` | Disable toggle |
| `ariaLabel` | `string` | required | Accessible label |

### Rendered Structure

```html
<button
  type="button"
  role="switch"
  class="toggle"
  data-checked={checked}
  aria-checked={checked}
  aria-label={ariaLabel}
  onClick={() => onChange(!checked)}
  disabled={disabled}
>
  <span class="toggle-thumb" />
</button>
```

### Styling

```css
.toggle {
  width: 44px;
  height: 24px;
  padding: 2px;
  background: color-mix(in srgb, var(--color-muted) 30%, transparent);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background-color var(--duration-fast) ease;
}

.toggle[data-checked="true"] {
  background: var(--color-primary);
}

.toggle:focus {
  outline: none;
  box-shadow: var(--focus-ring);
}

.toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-thumb {
  display: block;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: var(--radius-full);
  transition: transform var(--duration-fast) ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle[data-checked="true"] .toggle-thumb {
  transform: translateX(20px);
}
```

---

## 10.42 Settings Row Helper

Common styling for settings rows used throughout Settings page.

### Styling

```css
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-bottom: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 10%, transparent);
}

.settings-row:last-child {
  border-bottom: none;
}

.settings-row-content {
  flex: 1;
}

.settings-row-label {
  display: block;
  font-size: var(--text-base);
  font-weight: var(--font-medium);
}

.settings-row-description {
  display: block;
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-top: var(--space-1);
}
```

---

## Related Documents

- **Section 10 Part 1**: Dashboard Components
- **Section 10 Part 2**: Profile Page Components
- **Section 8**: Onboarding Components (ColorSwatch, FontPreview)
- **Section 4**: Form Inputs (TextInput, Checkbox)
- **Design System**: Visual tokens, colors, typography, spacing
