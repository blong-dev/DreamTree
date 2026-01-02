# DreamTree Component Specification
## Section 10: Page Components — Part 1: Dashboard

> Dashboard page layout and all supporting components.

---

## 10.1 Page Architecture

### Page Types Overview

| Page | URL | Purpose | Shell Config |
|------|-----|---------|--------------|
| **Dashboard** | `/` or `/dashboard` | Home base, daily engagement | No breadcrumb, no input |
| **Workbook** | `/workbook/[part]/[module]/[exercise]` | Main content experience | Breadcrumb + input |
| **Profile** | `/profile` | Read-only user data view | No breadcrumb, no input |
| **Settings** | `/settings` | Preferences and account | No breadcrumb, no input |

### Shared Layout Properties

| Property | Value |
|----------|-------|
| Max content width | 720px |
| Content centering | `margin: 0 auto` |
| Horizontal padding | `space-4` |
| Vertical padding | `space-6` |

---

## 10.2 Dashboard

Home page with daily engagement prompts, progress tracking, profile preview, and table of contents.

### URL
`/` or `/dashboard`

### Structure (Top to Bottom)

1. `DashboardGreeting` — Welcome message
2. `DailyDoList` — Today's focus items
3. `ProgressMetrics` — Completion stats
4. `ProfilePreview` — User snapshot
5. `TOCInline` — Full table of contents

### Rendered Structure

```html
<AppShell showBreadcrumb={false} showInput={false}>
  <div class="dashboard">
    <DashboardGreeting name={user.name} />
    
    <section class="dashboard-section">
      <h2 class="dashboard-section-title">Today's Focus</h2>
      <DailyDoList items={dailyDos} />
    </section>
    
    <section class="dashboard-section">
      <h2 class="dashboard-section-title">Your Progress</h2>
      <ProgressMetrics metrics={progressMetrics} />
    </section>
    
    <section class="dashboard-section">
      <header class="dashboard-section-header">
        <h2 class="dashboard-section-title">You</h2>
        <a href="/profile" class="dashboard-section-link">View Profile →</a>
      </header>
      <ProfilePreview user={user} />
    </section>
    
    <section class="dashboard-section">
      <h2 class="dashboard-section-title">Contents</h2>
      <TOCInline 
        parts={workbookParts} 
        currentLocation={currentLocation}
        onNavigate={handleNavigate}
      />
    </section>
  </div>
</AppShell>
```

### Styling

```css
.dashboard {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

.dashboard-section {
  margin-top: var(--space-8);
}

.dashboard-section:first-child {
  margin-top: 0;
}

.dashboard-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.dashboard-section-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 var(--space-4) 0;
}

.dashboard-section-header .dashboard-section-title {
  margin-bottom: 0;
}

.dashboard-section-link {
  font-size: var(--text-sm);
  color: var(--color-primary);
  text-decoration: none;
}

.dashboard-section-link:hover {
  text-decoration: underline;
}
```

---

## 10.3 `DashboardGreeting`

Welcome message with user's name.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | required | User's display name |

### Rendered Structure

```html
<h1 class="dashboard-greeting">
  Welcome back, {name}
</h1>
```

### Styling

```css
.dashboard-greeting {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-6) 0;
}
```

---

## 10.4 `DailyDoList`

Container for daily engagement prompts.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `DailyDo[]` | required | Daily do items to display |

### Types

```typescript
type DailyDo = {
  id: string;
  type: DailyDoType;
  title: string;
  subtitle: string;
  action: {
    label: string;
    onClick: () => void;
  };
};

type DailyDoType = 
  | 'flow-tracking'
  | 'failure-reframe'
  | 'job-prospecting'
  | 'networking'
  | 'budget-check'
  | 'soared-prompt'
  | 'resume';
```

### Rendered Structure

```html
<div class="daily-do-list">
  {items.length === 0 ? (
    <div class="daily-do-empty">
      <p>Complete your first exercise to unlock daily activities.</p>
    </div>
  ) : (
    items.map(item => (
      <DailyDoCard key={item.id} {...item} />
    ))
  )}
</div>
```

### Styling

```css
.daily-do-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.daily-do-empty {
  padding: var(--space-6);
  text-align: center;
  color: var(--color-muted);
  border: var(--border-thin) dashed color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-md);
}
```

---

## 10.5 `DailyDoCard`

Individual daily engagement prompt.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `DailyDoType` | required | Type for icon selection |
| `title` | `string` | required | Card title |
| `subtitle` | `string` | required | Description text |
| `action` | `{ label: string, onClick: () => void }` | required | Action button config |

### Icon Mapping

```typescript
const dailyDoIcons: Record<DailyDoType, IconComponent> = {
  'flow-tracking': ActivityIcon,
  'failure-reframe': RefreshIcon,
  'job-prospecting': SearchIcon,
  'networking': UsersIcon,
  'budget-check': CalculatorIcon,
  'soared-prompt': BookOpenIcon,
  'resume': PlayIcon,
};
```

### Rendered Structure

```html
<div class="daily-do-card">
  <span class="daily-do-icon" aria-hidden="true">
    <Icon />
  </span>
  <div class="daily-do-content">
    <h3 class="daily-do-title">{title}</h3>
    <p class="daily-do-subtitle">{subtitle}</p>
  </div>
  <Button 
    variant="ghost" 
    size="sm"
    onClick={action.onClick}
  >
    {action.label} →
  </Button>
</div>
```

### Styling

```css
.daily-do-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: transparent;
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
  border-left: 3px solid var(--color-primary);
  border-radius: var(--radius-md);
  transition: background-color var(--duration-fast) ease,
              box-shadow var(--duration-fast) ease;
}

.daily-do-card:hover {
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
}

.daily-do-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  border-radius: var(--radius-sm);
  color: var(--color-primary);
  flex-shrink: 0;
}

.daily-do-icon svg {
  width: 20px;
  height: 20px;
}

.daily-do-content {
  flex: 1;
  min-width: 0;
}

.daily-do-title {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  margin: 0;
}

.daily-do-subtitle {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: var(--space-1) 0 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 767px) {
  .daily-do-card {
    flex-wrap: wrap;
  }
  
  .daily-do-content {
    flex: 1 1 calc(100% - 52px);
  }
  
  .daily-do-card .button {
    margin-left: 52px;
    margin-top: var(--space-2);
  }
}
```

---

## 10.6 `ProgressMetrics`

Row of progress statistic boxes.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `metrics` | `ProgressMetricData[]` | required | Metrics to display |

### Types

```typescript
type ProgressMetricData = {
  value: string | number;
  label: string;
};
```

### Default Metrics

```typescript
// Adaptive based on user progress
const getDefaultMetrics = (user: User): ProgressMetricData[] => {
  const hasSkills = user.skills.length > 0;
  
  return [
    { value: `${user.completionPercent}%`, label: 'Complete' },
    { value: user.streakDays, label: 'Day Streak' },
    hasSkills 
      ? { value: user.skills.length, label: 'Skills' }
      : { value: user.exercisesCompleted, label: 'Exercises' },
  ];
};
```

### Rendered Structure

```html
<div class="progress-metrics">
  {metrics.map((metric, index) => (
    <ProgressMetric key={index} {...metric} />
  ))}
</div>
```

### Styling

```css
.progress-metrics {
  display: flex;
  gap: var(--space-3);
}

@media (max-width: 767px) {
  .progress-metrics {
    gap: var(--space-2);
  }
}
```

---

## 10.7 `ProgressMetric`

Single progress statistic box.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| number` | required | Metric value |
| `label` | `string` | required | Metric label |

### Rendered Structure

```html
<div class="progress-metric">
  <span class="progress-metric-value">{value}</span>
  <span class="progress-metric-label">{label}</span>
</div>
```

### Styling

```css
.progress-metric {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-4);
  background: color-mix(in srgb, var(--color-muted) 5%, transparent);
  border-radius: var(--radius-md);
}

.progress-metric-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: 1;
}

.progress-metric-label {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-top: var(--space-1);
}

@media (max-width: 767px) {
  .progress-metric {
    padding: var(--space-3);
  }
  
  .progress-metric-value {
    font-size: var(--text-2xl);
  }
  
  .progress-metric-label {
    font-size: var(--text-xs);
  }
}
```

---

## 10.8 `ProfilePreview`

Compact user profile card for dashboard.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `user` | `UserPreview` | required | User data |
| `onClick` | `() => void` | — | Click handler (navigate to profile) |

### Types

```typescript
type UserPreview = {
  name: string;
  topSkills: {
    transferable: string | null;
    selfManagement: string | null;
    knowledge: string | null;
  };
  backgroundColor: BackgroundColorId;
  fontFamily: FontFamilyId;
};
```

### Rendered Structure

```html
<button class="profile-preview" onClick={onClick}>
  <p class="profile-preview-name">{user.name}</p>
  
  {hasAnySkills && (
    <p class="profile-preview-skills">
      {[
        user.topSkills.transferable,
        user.topSkills.selfManagement,
        user.topSkills.knowledge,
      ].filter(Boolean).join(' · ')}
    </p>
  )}
  
  <p class="profile-preview-visual">
    🎨 {getColorName(user.backgroundColor)} + {getFontName(user.fontFamily)}
  </p>
</button>
```

### Helper Functions

```typescript
const colorNames: Record<BackgroundColorId, string> = {
  'ivory': 'Ivory',
  'creamy-tan': 'Creamy Tan',
  'brown': 'Brown',
  'charcoal': 'Charcoal',
  'black': 'Black',
};

const fontNames: Record<FontFamilyId, string> = {
  'inter': 'Sans',
  'lora': 'Serif',
  'courier-prime': 'Typewriter',
  'shadows-into-light': 'Handwritten',
  'jacquard-24': 'Decorative',
};

const getColorName = (id: BackgroundColorId) => colorNames[id];
const getFontName = (id: FontFamilyId) => fontNames[id];
```

### Styling

```css
.profile-preview {
  width: 100%;
  padding: var(--space-4);
  background: color-mix(in srgb, var(--color-muted) 5%, transparent);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 10%, transparent);
  border-radius: var(--radius-md);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--duration-fast) ease,
              border-color var(--duration-fast) ease;
}

.profile-preview:hover {
  background: color-mix(in srgb, var(--color-muted) 10%, transparent);
  border-color: color-mix(in srgb, var(--color-muted) 20%, transparent);
}

.profile-preview:focus {
  outline: none;
  box-shadow: var(--focus-ring);
}

.profile-preview-name {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  margin: 0;
}

.profile-preview-skills {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: var(--space-1) 0 0 0;
}

.profile-preview-visual {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: var(--space-2) 0 0 0;
}
```

---

## 10.9 `TOCInline`

Full table of contents for dashboard with expandable modules.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `parts` | `TOCPart[]` | required | Workbook parts data |
| `currentLocation` | `BreadcrumbLocation` | — | User's current position |
| `expandedPartId` | `string` | — | Auto-expand this part |
| `onNavigate` | `(location: BreadcrumbLocation) => void` | required | Navigation handler |

### Types

```typescript
type TOCPart = {
  id: string;
  title: string;
  progress: number; // 0-100
  status: 'locked' | 'available' | 'in-progress' | 'complete';
  modules: TOCModule[];
};

type TOCModule = {
  id: string;
  title: string;
  status: 'locked' | 'available' | 'in-progress' | 'complete';
  exercises: TOCExercise[];
};

type TOCExercise = {
  id: string;
  title: string;
  status: 'locked' | 'available' | 'in-progress' | 'complete';
};
```

### Rendered Structure

```html
<div class="toc-inline">
  {parts.map(part => (
    <TOCInlinePart
      key={part.id}
      part={part}
      isExpanded={expandedParts.includes(part.id)}
      onToggle={() => togglePart(part.id)}
      currentLocation={currentLocation}
      onNavigate={onNavigate}
    />
  ))}
</div>
```

### Styling

```css
.toc-inline {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
```

---

## 10.10 `TOCInlinePart`

Part row in inline TOC with progress bar.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `part` | `TOCPart` | required | Part data |
| `isExpanded` | `boolean` | `false` | Show modules |
| `onToggle` | `() => void` | required | Expand/collapse handler |
| `currentLocation` | `BreadcrumbLocation` | — | Current position |
| `onNavigate` | `(location: BreadcrumbLocation) => void` | required | Navigation handler |

### Rendered Structure

```html
<div class="toc-part" data-status={part.status}>
  <button 
    class="toc-part-header"
    onClick={onToggle}
    disabled={part.status === 'locked'}
    aria-expanded={isExpanded}
  >
    <div class="toc-part-info">
      <span class="toc-part-title">{part.title}</span>
      {part.status === 'locked' && (
        <span class="toc-part-lock" aria-label="Locked">🔒</span>
      )}
    </div>
    <div class="toc-part-progress">
      <span class="toc-part-percent">{part.progress}%</span>
      <div class="toc-part-bar">
        <div 
          class="toc-part-bar-fill" 
          style={{ width: `${part.progress}%` }}
        />
      </div>
    </div>
    <ChevronIcon 
      class="toc-part-chevron" 
      data-expanded={isExpanded}
      aria-hidden="true"
    />
  </button>
  
  {isExpanded && part.status !== 'locked' && (
    <div class="toc-part-modules">
      {part.modules.map(module => (
        <TOCInlineModule
          key={module.id}
          module={module}
          partId={part.id}
          currentLocation={currentLocation}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  )}
</div>
```

### Styling

```css
.toc-part {
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 15%, transparent);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.toc-part[data-status="locked"] {
  opacity: 0.6;
}

.toc-part-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color var(--duration-fast) ease;
}

.toc-part-header:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-muted) 5%, transparent);
}

.toc-part-header:disabled {
  cursor: not-allowed;
}

.toc-part-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.toc-part-title {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
}

.toc-part-lock {
  font-size: var(--text-sm);
}

.toc-part-progress {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.toc-part-percent {
  font-size: var(--text-sm);
  color: var(--color-muted);
  min-width: 36px;
  text-align: right;
}

.toc-part-bar {
  width: 60px;
  height: 6px;
  background: color-mix(in srgb, var(--color-muted) 20%, transparent);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.toc-part-bar-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width var(--duration-normal) ease;
}

.toc-part-chevron {
  width: 20px;
  height: 20px;
  color: var(--color-muted);
  transition: transform var(--duration-fast) ease;
}

.toc-part-chevron[data-expanded="true"] {
  transform: rotate(180deg);
}

.toc-part-modules {
  border-top: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 10%, transparent);
  padding: var(--space-2);
}
```

---

## 10.11 `TOCInlineModule`

Module row in inline TOC, expandable to show exercises.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `module` | `TOCModule` | required | Module data |
| `partId` | `string` | required | Parent part ID |
| `currentLocation` | `BreadcrumbLocation` | — | Current position |
| `onNavigate` | `(location: BreadcrumbLocation) => void` | required | Navigation handler |

### Rendered Structure

```html
<div class="toc-module" data-status={module.status}>
  <button 
    class="toc-module-header"
    onClick={() => setIsExpanded(!isExpanded)}
    disabled={module.status === 'locked'}
    aria-expanded={isExpanded}
  >
    <ProgressMarker status={getProgressStatus(module.status)} size="sm" />
    <span class="toc-module-title">{module.title}</span>
    {module.status === 'locked' && (
      <span class="toc-module-lock" aria-label="Locked">🔒</span>
    )}
    <ChevronIcon 
      class="toc-module-chevron" 
      data-expanded={isExpanded}
      aria-hidden="true"
    />
  </button>
  
  {isExpanded && module.status !== 'locked' && (
    <div class="toc-module-exercises">
      {module.exercises.map(exercise => (
        <TOCInlineExercise
          key={exercise.id}
          exercise={exercise}
          partId={partId}
          moduleId={module.id}
          isCurrent={isCurrentExercise(exercise.id)}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  )}
</div>
```

### Styling

```css
.toc-module {
  border-radius: var(--radius-sm);
}

.toc-module[data-status="locked"] {
  opacity: 0.5;
}

.toc-module-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  border-radius: var(--radius-sm);
  transition: background-color var(--duration-fast) ease;
}

.toc-module-header:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-muted) 8%, transparent);
}

.toc-module-header:disabled {
  cursor: not-allowed;
}

.toc-module-title {
  flex: 1;
  font-size: var(--text-sm);
}

.toc-module-lock {
  font-size: var(--text-xs);
}

.toc-module-chevron {
  width: 16px;
  height: 16px;
  color: var(--color-muted);
  transition: transform var(--duration-fast) ease;
}

.toc-module-chevron[data-expanded="true"] {
  transform: rotate(180deg);
}

.toc-module-exercises {
  margin-left: var(--space-6);
  padding: var(--space-1) 0;
}
```

---

## 10.12 `TOCInlineExercise`

Exercise row in inline TOC.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `exercise` | `TOCExercise` | required | Exercise data |
| `partId` | `string` | required | Parent part ID |
| `moduleId` | `string` | required | Parent module ID |
| `isCurrent` | `boolean` | `false` | Is current location |
| `onNavigate` | `(location: BreadcrumbLocation) => void` | required | Navigation handler |

### Rendered Structure

```html
<button 
  class="toc-exercise"
  data-status={exercise.status}
  data-current={isCurrent}
  onClick={() => onNavigate({ 
    partId, 
    moduleId, 
    exerciseId: exercise.id 
  })}
  disabled={exercise.status === 'locked'}
>
  <ProgressMarker status={getProgressStatus(exercise.status)} size="sm" />
  <span class="toc-exercise-title">{exercise.title}</span>
  {exercise.status === 'locked' && (
    <span class="toc-exercise-lock" aria-label="Locked">🔒</span>
  )}
</button>
```

### Styling

```css
.toc-exercise {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  border-radius: var(--radius-sm);
  transition: background-color var(--duration-fast) ease;
}

.toc-exercise:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-muted) 8%, transparent);
}

.toc-exercise:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.toc-exercise[data-current="true"] {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.toc-exercise-title {
  flex: 1;
  font-size: var(--text-sm);
}

.toc-exercise-lock {
  font-size: var(--text-xs);
}
```

---

## 10.13 Workbook

Main conversation interface for workbook content.

### URL
`/workbook/[part]/[module]/[exercise]`

Single dynamic page — URL updates as user progresses.

### Behaviors

| Behavior | Detail |
|----------|--------|
| **Initial `/workbook`** | Redirects to current position (or beginning if new) |
| **Locked URL access** | Redirect to current position + Toast "Sorry, we go in order here" |
| **Breadcrumb clicks** | Navigate to Dashboard, auto-expand that section in TOCInline |
| **Module transitions** | Happen inline, URL updates, no page reload |
| **Tool embedding** | Tools render inline when exercises call for them |
| **Scroll** | Auto-scroll to current, "Return to current" when scrolled into history |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `partId` | `string` | required | URL param |
| `moduleId` | `string` | required | URL param |
| `exerciseId` | `string` | required | URL param |

### State

```typescript
type WorkbookState = {
  currentLocation: BreadcrumbLocation;
  messages: Message[];
  scrollState: 'at-current' | 'in-history';
  inputType: InputType;
  inputValue: string;
};
```

### Rendered Structure

```html
<AppShell
  showBreadcrumb={true}
  currentLocation={currentLocation}
  showInput={true}
  inputType={inputType}
>
  <ConversationThread
    messages={messages}
    onScrollStateChange={setScrollState}
    autoScrollOnNew={scrollState === 'at-current'}
  />
</AppShell>
```

### Locked URL Handling

```typescript
const Workbook = ({ partId, moduleId, exerciseId }) => {
  const { currentLocation, isUnlocked } = useWorkbookProgress();
  const { showToast } = useToast();
  const router = useRouter();
  
  useEffect(() => {
    const requestedLocation = { partId, moduleId, exerciseId };
    
    if (!isUnlocked(requestedLocation)) {
      showToast({
        type: 'info',
        message: 'Sorry, we go in order here',
        duration: 3000,
      });
      router.replace(getWorkbookUrl(currentLocation));
    }
  }, [partId, moduleId, exerciseId]);
  
  // ... rest of component
};
```

### Breadcrumb Navigation Handler

```typescript
const handleBreadcrumbNavigate = (location: Partial<BreadcrumbLocation>) => {
  // Navigate to dashboard with part/module expanded in TOC
  router.push({
    pathname: '/dashboard',
    query: {
      expandPart: location.partId,
      expandModule: location.moduleId,
    },
  });
};
```

---

## Related Documents

- **Section 10 Part 2**: Profile Page Components
- **Section 10 Part 3**: Settings Page Components
- **Section 2**: Shell & Navigation Components
- **Section 3**: Conversation Components
- **Design System**: Visual tokens, colors, typography, spacing
