# DreamTree Component Specification
## Section 8: Onboarding Components

> Multi-step onboarding flow: welcome, name input, visual preferences, and completion.

---

## 8.1 `OnboardingFlow`

Container managing the onboarding sequence.

### Purpose
Guides new users through initial setup: welcome message, name input, and visual preference selection (background color, text color, font). Collects data needed to personalize the experience.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onComplete` | `(data: OnboardingData) => void` | required | Completion handler |
| `initialStep` | `number` | `0` | Starting step (for resuming) |

### Types

```typescript
type OnboardingData = {
  name: string;
  backgroundColor: BackgroundColorId;
  textColor: TextColorId;
  fontFamily: FontFamilyId;
};

type BackgroundColorId = 'ivory' | 'creamy-tan' | 'brown' | 'charcoal' | 'black';
type TextColorId = 'ivory' | 'creamy-tan' | 'brown' | 'charcoal' | 'black';
type FontFamilyId = 'inter' | 'lora' | 'courier-prime' | 'shadows-into-light' | 'jacquard-24';
```

### Steps

| Step | ID | Component | Validation |
|------|----|-----------|------------|
| 0 | `welcome` | `WelcomeStep` | Always valid |
| 1 | `name` | `NameStep` | Name non-empty |
| 2 | `visuals` | `VisualsStep` | All selections made |
| 3 | `complete` | `CompleteStep` | Always valid |

### State Management

```typescript
const OnboardingFlow = ({ onComplete, initialStep = 0 }) => {
  const [step, setStep] = useState(initialStep);
  const [data, setData] = useState<Partial<OnboardingData>>({
    name: '',
    backgroundColor: null,
    textColor: null,
    fontFamily: null,
  });
  
  const canProceed = () => {
    switch (step) {
      case 0: return true; // Welcome
      case 1: return data.name?.trim().length > 0;
      case 2: return data.backgroundColor && data.textColor && data.fontFamily;
      case 3: return true; // Complete
      default: return false;
    }
  };
  
  const handleNext = () => {
    if (step === 3) {
      onComplete(data as OnboardingData);
    } else {
      setStep(step + 1);
    }
  };
  
  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };
  
  // ... render
};
```

### Rendered Structure

```html
<div class="onboarding-flow">
  <div class="onboarding-content">
    {step === 0 && (
      <WelcomeStep onContinue={handleNext} />
    )}
    
    {step === 1 && (
      <NameStep
        value={data.name || ''}
        onChange={(name) => setData({ ...data, name })}
      />
    )}
    
    {step === 2 && (
      <VisualsStep
        backgroundColor={data.backgroundColor}
        textColor={data.textColor}
        fontFamily={data.fontFamily}
        onBackgroundChange={(bg) => setData({ ...data, backgroundColor: bg })}
        onTextChange={(text) => setData({ ...data, textColor: text })}
        onFontChange={(font) => setData({ ...data, fontFamily: font })}
      />
    )}
    
    {step === 3 && (
      <CompleteStep
        name={data.name}
        onComplete={handleNext}
      />
    )}
  </div>
  
  {step > 0 && step < 3 && (
    <div class="onboarding-footer">
      <Button variant="ghost" onClick={handleBack}>
        Back
      </Button>
      <OnboardingProgress totalSteps={4} currentStep={step} />
      <Button 
        variant="primary" 
        onClick={handleNext}
        disabled={!canProceed()}
      >
        {step === 2 ? 'Finish' : 'Continue'}
      </Button>
    </div>
  )}
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Layout | Full viewport, flex column |
| Content | Centered, max-width 480px |
| Padding | `space-6` |
| Background | `--color-bg` (updates live during step 2) |

### CSS Implementation

```css
.onboarding-flow {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  transition: background-color var(--duration-slow) ease;
}

.onboarding-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
}

.onboarding-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-top: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 10%, transparent);
}

@media (max-width: 767px) {
  .onboarding-content {
    padding: var(--space-4);
    justify-content: flex-start;
    padding-top: var(--space-10);
  }
  
  .onboarding-footer {
    padding: var(--space-3) var(--space-4);
  }
}
```

---

## 8.2 `WelcomeStep`

Introduction screen — first thing users see.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onContinue` | `() => void` | required | Continue handler |

### Content

- Logo or app name
- Welcome headline
- Brief description of what DreamTree is
- Single CTA button

### Rendered Structure

```html
<div class="welcome-step">
  <div class="welcome-logo" aria-hidden="true">
    🌳
  </div>
  
  <h1 class="welcome-title">Welcome to DreamTree</h1>
  
  <p class="welcome-description">
    A guided journey to discover your career path. We'll explore your 
    values, skills, and interests together — one conversation at a time.
  </p>
  
  <Button 
    variant="primary" 
    size="lg"
    onClick={onContinue}
  >
    Get Started
  </Button>
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Text align | Center |
| Logo | 64px, `margin-bottom: space-6` |
| Title | `text-3xl`, `font-semibold` |
| Description | `text-lg`, `--color-muted`, max-width 360px |
| Button | `margin-top: space-8` |

### Animation

| Element | Animation |
|---------|-----------|
| Logo | Fade in + scale from 0.8, `duration-slow`, 0ms delay |
| Title | Fade in + slide up 16px, `duration-slow`, 100ms delay |
| Description | Fade in + slide up 16px, `duration-slow`, 200ms delay |
| Button | Fade in + slide up 16px, `duration-slow`, 300ms delay |

### CSS Implementation

```css
.welcome-step {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.welcome-logo {
  font-size: 64px;
  margin-bottom: var(--space-6);
  animation: welcome-logo-enter var(--duration-slow) ease both;
}

@keyframes welcome-logo-enter {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.welcome-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-4) 0;
  animation: welcome-fade-up var(--duration-slow) ease both;
  animation-delay: 100ms;
}

.welcome-description {
  font-size: var(--text-lg);
  color: var(--color-muted);
  max-width: 360px;
  margin: 0;
  line-height: 1.6;
  animation: welcome-fade-up var(--duration-slow) ease both;
  animation-delay: 200ms;
}

.welcome-step .button {
  margin-top: var(--space-8);
  animation: welcome-fade-up var(--duration-slow) ease both;
  animation-delay: 300ms;
}

@keyframes welcome-fade-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 8.3 `NameStep`

Name input during onboarding.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Current name value |
| `onChange` | `(name: string) => void` | required | Change handler |

### Content

- Friendly greeting question
- Single text input
- Helper text explaining why we ask

### Rendered Structure

```html
<div class="name-step">
  <h2 class="name-step-title">What should we call you?</h2>
  
  <p class="name-step-description">
    This is how DreamTree will address you throughout your journey.
  </p>
  
  <TextInput
    value={value}
    onChange={onChange}
    placeholder="Your name"
    autoFocus
    maxLength={50}
  />
  
  <p class="name-step-helper">
    You can always change this later in your profile.
  </p>
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Text align | Center |
| Title | `text-2xl`, `font-semibold` |
| Description | `text-base`, `--color-muted` |
| Input | Full width, `margin-top: space-6` |
| Helper | `text-sm`, `--color-muted` @ 70% |

### CSS Implementation

```css
.name-step {
  text-align: center;
  width: 100%;
  max-width: 320px;
}

.name-step-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-2) 0;
}

.name-step-description {
  font-size: var(--text-base);
  color: var(--color-muted);
  margin: 0 0 var(--space-6) 0;
}

.name-step .text-input-wrapper {
  text-align: left;
}

.name-step .text-input {
  text-align: center;
}

.name-step-helper {
  font-size: var(--text-sm);
  color: var(--color-muted);
  opacity: 0.7;
  margin: var(--space-4) 0 0 0;
}
```

---

## 8.4 `VisualsStep`

Color and font selection.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backgroundColor` | `BackgroundColorId \| null` | `null` | Selected background |
| `textColor` | `TextColorId \| null` | `null` | Selected text color |
| `fontFamily` | `FontFamilyId \| null` | `null` | Selected font |
| `onBackgroundChange` | `(color: BackgroundColorId) => void` | required | Background handler |
| `onTextChange` | `(color: TextColorId) => void` | required | Text handler |
| `onFontChange` | `(font: FontFamilyId) => void` | required | Font handler |

### Color Definitions

| ID | Display Name | Hex | Mode |
|----|--------------|-----|------|
| `ivory` | Ivory | `#FAF8F5` | Light |
| `creamy-tan` | Creamy Tan | `#E8DCC4` | Light |
| `brown` | Brown | `#5C4033` | Dark |
| `charcoal` | Charcoal | `#2C3E50` | Dark |
| `black` | Black | `#1A1A1A` | Dark |

### Valid Text/Background Pairings

| Background | Valid Text Colors |
|------------|-------------------|
| `ivory` | brown, charcoal, black |
| `creamy-tan` | brown, charcoal, black |
| `brown` | ivory, creamy-tan |
| `charcoal` | ivory, creamy-tan |
| `black` | ivory, creamy-tan |

### Font Definitions

| ID | Display Name | Font Family | Style |
|----|--------------|-------------|-------|
| `inter` | Clean Sans | Inter | Modern, clean |
| `lora` | Classic Serif | Lora | Traditional, elegant |
| `courier-prime` | Typewriter | Courier Prime | Monospace, retro |
| `shadows-into-light` | Handwritten | Shadows Into Light | Casual, personal |
| `jacquard-24` | Vintage Display | Jacquard 24 | Decorative, bold |

### Validation Logic

```typescript
const getValidTextColors = (bgColor: BackgroundColorId): TextColorId[] => {
  const lightBackgrounds = ['ivory', 'creamy-tan'];
  const darkBackgrounds = ['brown', 'charcoal', 'black'];
  
  if (lightBackgrounds.includes(bgColor)) {
    return ['brown', 'charcoal', 'black'];
  } else {
    return ['ivory', 'creamy-tan'];
  }
};

const isValidPairing = (bg: BackgroundColorId, text: TextColorId): boolean => {
  return getValidTextColors(bg).includes(text);
};
```

### Rendered Structure

```html
<div class="visuals-step">
  <h2 class="visuals-step-title">Make it yours</h2>
  <p class="visuals-step-description">
    Choose colors and a font that feel right to you. 
    You can change these anytime.
  </p>
  
  {/* Background Color */}
  <div class="visuals-section">
    <h3 class="visuals-section-title">Background</h3>
    <div class="visuals-swatches">
      {backgroundColors.map(color => (
        <ColorSwatch
          key={color.id}
          color={color}
          isSelected={backgroundColor === color.id}
          onSelect={() => {
            onBackgroundChange(color.id);
            // Auto-clear text if pairing becomes invalid
            if (textColor && !isValidPairing(color.id, textColor)) {
              onTextChange(null);
            }
          }}
        />
      ))}
    </div>
  </div>
  
  {/* Text Color */}
  <div class="visuals-section">
    <h3 class="visuals-section-title">Text</h3>
    <div class="visuals-swatches">
      {textColors.map(color => {
        const isValid = backgroundColor ? isValidPairing(backgroundColor, color.id) : true;
        return (
          <ColorSwatch
            key={color.id}
            color={color}
            isSelected={textColor === color.id}
            onSelect={() => onTextChange(color.id)}
            disabled={!isValid}
            disabledReason={!isValid ? 'Not enough contrast with background' : undefined}
          />
        );
      })}
    </div>
  </div>
  
  {/* Font Family */}
  <div class="visuals-section">
    <h3 class="visuals-section-title">Font</h3>
    <div class="visuals-fonts">
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
  
  {/* Live Preview */}
  <div 
    class="visuals-preview"
    style={{
      backgroundColor: backgroundColor ? colors[backgroundColor].hex : undefined,
      color: textColor ? colors[textColor].hex : undefined,
      fontFamily: fontFamily ? fonts[fontFamily].family : undefined,
    }}
  >
    <p class="visuals-preview-text">
      This is how your DreamTree will look.
    </p>
  </div>
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Title | `text-2xl`, `font-semibold`, centered |
| Section title | `text-sm`, `font-medium`, `--color-muted` |
| Swatches layout | Flex row, `gap: space-3`, centered |
| Fonts layout | Flex column, `gap: space-2` |
| Preview | Bordered box, `padding: space-4`, `radius-md` |

### CSS Implementation

```css
.visuals-step {
  width: 100%;
  max-width: 400px;
}

.visuals-step-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  text-align: center;
  margin: 0 0 var(--space-2) 0;
}

.visuals-step-description {
  font-size: var(--text-base);
  color: var(--color-muted);
  text-align: center;
  margin: 0 0 var(--space-8) 0;
}

.visuals-section {
  margin-bottom: var(--space-6);
}

.visuals-section-title {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-muted);
  margin: 0 0 var(--space-3) 0;
}

.visuals-swatches {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
}

.visuals-fonts {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.visuals-preview {
  margin-top: var(--space-6);
  padding: var(--space-4);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
  border-radius: var(--radius-md);
  text-align: center;
  transition: background-color var(--duration-normal) ease,
              color var(--duration-normal) ease;
}

.visuals-preview-text {
  margin: 0;
  font-size: var(--text-base);
}
```

---

## 8.5 `ColorSwatch`

Individual color option.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `ColorOption` | required | Color data |
| `isSelected` | `boolean` | `false` | Selected state |
| `onSelect` | `() => void` | required | Selection handler |
| `disabled` | `boolean` | `false` | Invalid pairing |
| `disabledReason` | `string` | — | Tooltip for disabled state |

### Types

```typescript
type ColorOption = {
  id: string;
  name: string;
  hex: string;
};
```

### Rendered Structure

```html
<Tooltip 
  content={disabled ? disabledReason : color.name}
  disabled={!disabled && !color.name}
>
  <button
    class="color-swatch"
    data-selected={isSelected}
    data-disabled={disabled}
    style={{ '--swatch-color': color.hex }}
    onClick={!disabled ? onSelect : undefined}
    disabled={disabled}
    aria-label={`${color.name}${isSelected ? ' (selected)' : ''}`}
    aria-pressed={isSelected}
  >
    {isSelected && (
      <CheckIcon class="color-swatch-check" aria-hidden="true" />
    )}
  </button>
</Tooltip>
```

### Styling

| Property | Value |
|----------|-------|
| Size | 48px |
| Border radius | `radius-full` (circle) |
| Border | 2px solid, transparent (default), `--color-primary` (selected) |
| Checkmark | White or black depending on color luminance |
| Disabled | 50% opacity, strikethrough line |

### CSS Implementation

```css
.color-swatch {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background-color: var(--swatch-color);
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color var(--duration-fast) ease,
              transform var(--duration-fast) ease;
}

.color-swatch:hover:not(:disabled) {
  transform: scale(1.05);
}

.color-swatch:focus {
  outline: none;
  box-shadow: var(--focus-ring);
}

.color-swatch[data-selected="true"] {
  border-color: var(--color-primary);
}

.color-swatch:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Strikethrough for disabled */
.color-swatch[data-disabled="true"]::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  background: var(--color-muted);
  transform: rotate(-45deg);
}

.color-swatch-check {
  width: 24px;
  height: 24px;
}

/* Light backgrounds get dark check */
.color-swatch[data-light="true"] .color-swatch-check {
  color: #1A1A1A;
}

/* Dark backgrounds get light check */
.color-swatch[data-light="false"] .color-swatch-check {
  color: #FAF8F5;
}
```

### Luminance Detection

```typescript
const isLightColor = (hex: string): boolean => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  // Relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};
```

---

## 8.6 `FontPreview`

Individual font option.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `font` | `FontOption` | required | Font data |
| `isSelected` | `boolean` | `false` | Selected state |
| `onSelect` | `() => void` | required | Selection handler |

### Types

```typescript
type FontOption = {
  id: FontFamilyId;
  name: string;
  family: string;
  sampleText?: string;
};
```

### Rendered Structure

```html
<button
  class="font-preview"
  data-selected={isSelected}
  onClick={onSelect}
  aria-label={`${font.name}${isSelected ? ' (selected)' : ''}`}
  aria-pressed={isSelected}
>
  <span 
    class="font-preview-sample"
    style={{ fontFamily: font.family }}
  >
    {font.sampleText || 'The quick brown fox'}
  </span>
  <span class="font-preview-name">{font.name}</span>
  {isSelected && (
    <CheckIcon class="font-preview-check" aria-hidden="true" />
  )}
</button>
```

### Styling

| Property | Value |
|----------|-------|
| Height | 56px |
| Padding | `space-3` horizontal |
| Border | `border-thin`, `--color-muted` @ 20% |
| Border radius | `radius-sm` |
| Selected | `--color-primary` border, `--color-primary` @ 5% bg |
| Sample text | `text-lg`, actual font |
| Font name | `text-xs`, `--color-muted` |

### CSS Implementation

```css
.font-preview {
  width: 100%;
  height: 56px;
  padding: 0 var(--space-3);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-align: left;
  transition: border-color var(--duration-fast) ease,
              background-color var(--duration-fast) ease;
}

.font-preview:hover {
  border-color: color-mix(in srgb, var(--color-muted) 40%, transparent);
}

.font-preview:focus {
  outline: none;
  box-shadow: var(--focus-ring);
}

.font-preview[data-selected="true"] {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
}

.font-preview-sample {
  flex: 1;
  font-size: var(--text-lg);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.font-preview-name {
  font-size: var(--text-xs);
  color: var(--color-muted);
  white-space: nowrap;
}

.font-preview-check {
  width: 20px;
  height: 20px;
  color: var(--color-primary);
  flex-shrink: 0;
}
```

---

## 8.7 `CompleteStep`

Final onboarding confirmation.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | required | User's name for personalization |
| `onComplete` | `() => void` | required | Completion handler |

### Content

- Personalized welcome message using name
- Brief explanation of what comes next
- Single CTA to start

### Rendered Structure

```html
<div class="complete-step">
  <div class="complete-icon" aria-hidden="true">
    ✨
  </div>
  
  <h2 class="complete-title">You're all set, {name}!</h2>
  
  <p class="complete-description">
    Your DreamTree journey begins now. We'll start by exploring 
    what matters most to you — your values, interests, and the 
    skills you've built along the way.
  </p>
  
  <p class="complete-note">
    Take your time. There are no wrong answers here.
  </p>
  
  <Button 
    variant="primary" 
    size="lg"
    onClick={onComplete}
  >
    Begin My Journey
  </Button>
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Text align | Center |
| Icon | 48px, `margin-bottom: space-4` |
| Title | `text-2xl`, `font-semibold` |
| Description | `text-base`, `--color-muted`, max-width 320px |
| Note | `text-sm`, `--color-muted` @ 70%, italic |
| Button | `margin-top: space-6` |

### Animation

Same staggered fade-up pattern as WelcomeStep.

### CSS Implementation

```css
.complete-step {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.complete-icon {
  font-size: 48px;
  margin-bottom: var(--space-4);
  animation: complete-bounce var(--duration-slow) ease;
}

@keyframes complete-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.complete-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-4) 0;
}

.complete-description {
  font-size: var(--text-base);
  color: var(--color-muted);
  max-width: 320px;
  margin: 0;
  line-height: 1.6;
}

.complete-note {
  font-size: var(--text-sm);
  color: var(--color-muted);
  opacity: 0.7;
  font-style: italic;
  margin: var(--space-4) 0 0 0;
}

.complete-step .button {
  margin-top: var(--space-6);
}
```

---

## 8.8 `OnboardingProgress`

Progress indicator showing current step in flow.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `totalSteps` | `number` | required | Total number of steps |
| `currentStep` | `number` | required | Current step (0-indexed) |

### Visual Structure

```
○ ● ○ ○
```

### Rendered Structure

```html
<div 
  class="onboarding-progress" 
  role="progressbar"
  aria-valuenow={currentStep + 1}
  aria-valuemin={1}
  aria-valuemax={totalSteps}
  aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
>
  {Array.from({ length: totalSteps }, (_, i) => (
    <span
      key={i}
      class="onboarding-progress-dot"
      data-active={i === currentStep}
      data-complete={i < currentStep}
    />
  ))}
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Dot size | 8px |
| Dot gap | `space-2` |
| Inactive | `--color-muted` @ 30% |
| Active | `--color-primary` |
| Complete | `--color-primary` @ 50% |

### CSS Implementation

```css
.onboarding-progress {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.onboarding-progress-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-muted) 30%, transparent);
  transition: background-color var(--duration-fast) ease,
              transform var(--duration-fast) ease;
}

.onboarding-progress-dot[data-complete="true"] {
  background: color-mix(in srgb, var(--color-primary) 50%, transparent);
}

.onboarding-progress-dot[data-active="true"] {
  background: var(--color-primary);
  transform: scale(1.25);
}
```

---

## 8.9 Data Persistence

### Saving Progress

Onboarding progress should be saved to prevent data loss if the user closes the browser mid-flow.

```typescript
// Save to localStorage on each step completion
const saveOnboardingProgress = (step: number, data: Partial<OnboardingData>) => {
  localStorage.setItem('dreamtree_onboarding', JSON.stringify({
    step,
    data,
    timestamp: Date.now(),
  }));
};

// Resume on mount
const loadOnboardingProgress = (): { step: number; data: Partial<OnboardingData> } | null => {
  const saved = localStorage.getItem('dreamtree_onboarding');
  if (!saved) return null;
  
  try {
    const parsed = JSON.parse(saved);
    // Expire after 24 hours
    if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('dreamtree_onboarding');
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

// Clear on completion
const clearOnboardingProgress = () => {
  localStorage.removeItem('dreamtree_onboarding');
};
```

### Applying Visual Preferences

Once onboarding completes, preferences are applied globally:

```typescript
const applyVisualPreferences = (prefs: OnboardingData) => {
  const root = document.documentElement;
  
  // Apply colors
  root.style.setProperty('--color-bg', colors[prefs.backgroundColor].hex);
  root.style.setProperty('--color-text', colors[prefs.textColor].hex);
  
  // Derive muted and primary based on mode
  const isDark = ['brown', 'charcoal', 'black'].includes(prefs.backgroundColor);
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  
  // Apply font
  root.style.setProperty('--font-body', fonts[prefs.fontFamily].family);
  
  // Save to user profile (API call)
  saveUserPreferences(prefs);
};
```

---

## Related Documents

- **Section 1**: Component Philosophy
- **Section 7**: Overlay Components
- **Section 9**: Tool Components
- **Design System**: Visual tokens, colors, typography, spacing
