# DreamTree Component Specification
## Section 9: Tool Components

> Tool architecture, tool pages, and individual tool components: FlowTracker, FailureReframer, BudgetCalculator, IdeaTree, JobProspector.

---

## 9.1 Tool Architecture

### Dual-Context Design

Every tool works in two modes:

| Mode | Context | Data Source | Container |
|------|---------|-------------|-----------|
| **Embedded** | Within conversation | Props from parent | Inline with messages |
| **Standalone** | Dedicated page | Fetches via instance ID | Full page with header |

### Base Tool Props

```typescript
interface BaseToolProps<T> {
  instanceId: string;
  instanceName: string;
  data: T;
  onChange: (data: T) => void;
  mode: 'embedded' | 'standalone';
  source: WorkbookSource | UserCreated;
  disabled?: boolean;
  readOnly?: boolean;
}

type WorkbookSource = {
  type: 'workbook';
  partId: string;
  moduleId: string;
  exerciseId: string;
};

type UserCreated = {
  type: 'user';
};
```

### Tool Instance Data Model

```typescript
type ToolInstance<T = unknown> = {
  id: string;
  toolType: ToolType;
  name: string;
  source: WorkbookSource | UserCreated;
  data: T;
  createdAt: Date;
  updatedAt: Date;
  changeLog: ChangeLogEntry[];
};

type ChangeLogEntry = {
  timestamp: Date;
  field: string;
  previousValue: unknown;
  newValue: unknown;
};

type ToolType = 
  | 'list-builder'
  | 'ranking-grid'
  | 'soared-story'
  | 'idea-tree'
  | 'budget-calculator'
  | 'failure-reframer'
  | 'flow-tracker'
  | 'resume-builder'
  | 'networking-prep'
  | 'job-prospector';
```

### Tool Metadata

```typescript
type ToolMetadata = {
  singularName: string;
  pluralName: string;
  icon: IconComponent;
  getSummary: (data: unknown) => string;
};

const toolMeta: Record<ToolType, ToolMetadata> = {
  'list-builder': {
    singularName: 'List',
    pluralName: 'Lists',
    icon: ListIcon,
    getSummary: (data) => `${data.items.length} items`,
  },
  'ranking-grid': {
    singularName: 'Ranking',
    pluralName: 'Rankings',
    icon: ArrowsUpDownIcon,
    getSummary: (data) => `${data.items.length} items ranked`,
  },
  'soared-story': {
    singularName: 'SOARED Story',
    pluralName: 'SOARED Stories',
    icon: BookOpenIcon,
    getSummary: (data) => data.title || 'Untitled story',
  },
  'idea-tree': {
    singularName: 'Idea Tree',
    pluralName: 'Idea Trees',
    icon: LightbulbIcon,
    getSummary: (data) => `${data.totalIdeas || 0} ideas from "${data.rootIdea}"`,
  },
  'budget-calculator': {
    singularName: 'Budget',
    pluralName: 'Budgets',
    icon: CalculatorIcon,
    getSummary: (data) => `$${data.grossMonthlyIncome}/mo gross`,
  },
  'failure-reframer': {
    singularName: 'Reframe',
    pluralName: 'Reframes',
    icon: RefreshIcon,
    getSummary: (data) => data.situation?.slice(0, 50) + '...' || 'New reframe',
  },
  'flow-tracker': {
    singularName: 'Flow Log',
    pluralName: 'Flow Logs',
    icon: ActivityIcon,
    getSummary: (data) => `${data.entries?.length || 0} entries`,
  },
  'job-prospector': {
    singularName: 'Job Tracker',
    pluralName: 'Job Trackers',
    icon: BriefcaseIcon,
    getSummary: (data) => `${data.prospects?.length || 0} prospects`,
  },
  // ... other tools
};
```

### Instance Rules

| Source | Deletable | Editable | Name Editable |
|--------|-----------|----------|---------------|
| Workbook | ❌ No | ✅ Yes (with change log) | ❌ No |
| User Created | ✅ Yes | ✅ Yes | ✅ Yes |

### Free Tier Limits

- **20 user-created instances** per tool type
- Workbook-linked instances don't count toward limit
- Banner shown when limit reached

---

## 9.2 `ToolPage`

Shell for standalone tool pages listing all instances of a tool type.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `toolType` | `ToolType` | required | Which tool |
| `instances` | `ToolInstance[]` | required | All instances |
| `onCreateNew` | `() => void` | required | Create handler |
| `onSelectInstance` | `(id: string) => void` | required | Selection handler |
| `onSearch` | `(query: string) => void` | — | Search handler |
| `userTier` | `'free' \| 'paid'` | `'free'` | For limits |

### Visual Structure

```
┌─────────────────────────────────────────────────┐
│  ← Back    SOARED Stories                       │
├─────────────────────────────────────────────────┤
│  [Search...]                     [+ New Story]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ The Time I Led a Product Launch         │   │
│  │ Part 2 › Module 3 › Exercise 2      >   │   │
│  │ Edited 2 days ago                       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Resolving a Team Conflict               │   │
│  │ Created by you                      >   │   │
│  │ Edited 1 week ago                       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Customer Escalation Win                 │   │
│  │ Part 2 › Module 3 › Exercise 2      >   │   │
│  │ Edited 3 weeks ago                      │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Rendered Structure

```html
<div class="tool-page">
  <header class="tool-page-header">
    <button class="tool-page-back" onClick={onBack}>
      <ArrowLeftIcon />
      <span>Back</span>
    </button>
    <h1 class="tool-page-title">
      {toolMeta[toolType].pluralName}
    </h1>
  </header>
  
  <div class="tool-page-actions">
    {instances.length > 5 && (
      <TextInput
        placeholder={`Search ${toolMeta[toolType].pluralName.toLowerCase()}...`}
        value={searchQuery}
        onChange={setSearchQuery}
        icon={SearchIcon}
      />
    )}
    
    <Button
      variant="primary"
      icon={PlusIcon}
      onClick={onCreateNew}
      disabled={userTier === 'free' && userCreatedCount >= 20}
    >
      New {toolMeta[toolType].singularName}
    </Button>
  </div>
  
  {userTier === 'free' && userCreatedCount >= 20 && (
    <div class="tool-page-limit-banner">
      <span>You've reached the free tier limit of 20 {toolMeta[toolType].pluralName.toLowerCase()}.</span>
      <Button variant="ghost" size="sm">Upgrade</Button>
    </div>
  )}
  
  <div class="tool-page-list">
    {filteredInstances.length === 0 ? (
      <EmptyState
        icon={toolMeta[toolType].icon}
        title={`No ${toolMeta[toolType].pluralName.toLowerCase()} yet`}
        description={`Create your first ${toolMeta[toolType].singularName.toLowerCase()} to get started.`}
        action={{
          label: `Create ${toolMeta[toolType].singularName}`,
          onClick: onCreateNew,
        }}
      />
    ) : (
      filteredInstances.map(instance => (
        <ToolInstanceCard
          key={instance.id}
          instance={instance}
          toolType={toolType}
          onClick={() => onSelectInstance(instance.id)}
        />
      ))
    )}
  </div>
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Max width | 720px, centered |
| Header | `padding: space-4`, border-bottom |
| Actions | Flex row, `gap: space-3`, `margin: space-4 0` |
| List | Flex column, `gap: space-2` |
| Limit banner | Warning style, `--color-warning` @ 10% bg |

### CSS Implementation

```css
.tool-page {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-4);
}

.tool-page-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-bottom: var(--space-4);
  border-bottom: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 10%, transparent);
}

.tool-page-back {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2);
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.tool-page-back:hover {
  background: color-mix(in srgb, var(--color-muted) 10%, transparent);
  color: var(--color-text);
}

.tool-page-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin: 0;
}

.tool-page-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: var(--space-4) 0;
}

.tool-page-actions .text-input-wrapper {
  flex: 1;
}

.tool-page-limit-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  background: color-mix(in srgb, var(--color-warning) 10%, transparent);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-4);
  font-size: var(--text-sm);
}

.tool-page-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
```

---

## 9.3 `ToolInstanceCard`

Card showing tool instance preview in list.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `instance` | `ToolInstance` | required | Instance data |
| `toolType` | `ToolType` | required | For summary generation |
| `onClick` | `() => void` | required | Click handler |

### Rendered Structure

```html
<button
  class="tool-instance-card"
  onClick={onClick}
>
  <div class="tool-instance-card-content">
    <h3 class="tool-instance-card-name">{instance.name}</h3>
    <p class="tool-instance-card-source">
      {instance.source.type === 'workbook' 
        ? `${getPartTitle(instance.source.partId)} › ${getModuleTitle(instance.source.moduleId)}`
        : 'Created by you'
      }
    </p>
    <p class="tool-instance-card-meta">
      <span class="tool-instance-card-summary">
        {toolMeta[toolType].getSummary(instance.data)}
      </span>
      <span class="tool-instance-card-time">
        Edited {formatRelativeTime(instance.updatedAt)}
      </span>
    </p>
  </div>
  <ChevronRightIcon class="tool-instance-card-chevron" />
</button>
```

### Styling

| Property | Value |
|----------|-------|
| Padding | `space-4` |
| Border | `border-thin`, `radius-sm` |
| Hover | `--color-muted` @ 8% bg |
| Name | `text-base`, `font-medium` |
| Source | `text-sm`, `--color-muted` |
| Meta | `text-xs`, `--color-muted` @ 70% |
| Chevron | 20px, `--color-muted` |

### CSS Implementation

```css
.tool-instance-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: none;
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  transition: background-color var(--duration-fast) ease,
              border-color var(--duration-fast) ease;
}

.tool-instance-card:hover {
  background: color-mix(in srgb, var(--color-muted) 8%, transparent);
  border-color: color-mix(in srgb, var(--color-muted) 30%, transparent);
}

.tool-instance-card:focus {
  outline: none;
  box-shadow: var(--focus-ring);
}

.tool-instance-card-content {
  flex: 1;
  min-width: 0;
}

.tool-instance-card-name {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-instance-card-source {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: var(--space-1) 0 0 0;
}

.tool-instance-card-meta {
  display: flex;
  gap: var(--space-3);
  font-size: var(--text-xs);
  color: var(--color-muted);
  opacity: 0.7;
  margin: var(--space-2) 0 0 0;
}

.tool-instance-card-chevron {
  width: 20px;
  height: 20px;
  color: var(--color-muted);
  flex-shrink: 0;
}
```

---

## 9.4 `ToolInstanceView`

Full view/edit wrapper for a single tool instance.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `instance` | `ToolInstance` | required | Instance data |
| `toolType` | `ToolType` | required | Which tool component to render |
| `onUpdate` | `(data: unknown) => void` | required | Data change handler |
| `onRename` | `(name: string) => void` | — | Rename handler (user-created only) |
| `onBack` | `() => void` | required | Back navigation |
| `onViewHistory` | `() => void` | — | View change history |
| `onDelete` | `() => void` | — | Delete handler (user-created only) |

### Rendered Structure

```html
<div class="tool-instance-view">
  <header class="tool-instance-view-header">
    <button class="tool-instance-view-back" onClick={onBack}>
      <ArrowLeftIcon />
    </button>
    
    <div class="tool-instance-view-title">
      {instance.source.type === 'user' && onRename ? (
        <input
          type="text"
          class="tool-instance-view-name-input"
          value={instance.name}
          onChange={(e) => onRename(e.target.value)}
        />
      ) : (
        <h1 class="tool-instance-view-name">{instance.name}</h1>
      )}
      <p class="tool-instance-view-source">
        {instance.source.type === 'workbook'
          ? `${getPartTitle(instance.source.partId)} › ${getModuleTitle(instance.source.moduleId)}`
          : 'Created by you'
        }
      </p>
    </div>
    
    <DropdownMenu
      trigger={<Button variant="ghost" icon={MoreIcon} iconOnly ariaLabel="More options" />}
      align="right"
    >
      {onViewHistory && (
        <DropdownItem icon={HistoryIcon} onClick={onViewHistory}>
          View history
        </DropdownItem>
      )}
      {instance.source.type === 'user' && onDelete && (
        <DropdownItem icon={TrashIcon} variant="danger" onClick={onDelete}>
          Delete
        </DropdownItem>
      )}
    </DropdownMenu>
  </header>
  
  <div class="tool-instance-view-content">
    <ToolComponent
      instanceId={instance.id}
      instanceName={instance.name}
      data={instance.data}
      onChange={onUpdate}
      mode="standalone"
      source={instance.source}
    />
  </div>
  
  <footer class="tool-instance-view-footer">
    <SaveIndicator status={saveStatus} lastSaved={instance.updatedAt} />
  </footer>
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Max width | 720px, centered |
| Header | Sticky top, `--color-bg`, `padding: space-4` |
| Content | `padding: space-4` |
| Footer | Fixed bottom, `padding: space-3` |

---

## 9.5 `FlowTracker`

Daily energy and engagement tracking tool.

### Props

```typescript
interface FlowTrackerProps extends BaseToolProps<FlowTrackerData> {
  date?: Date; // For viewing specific day
}

type FlowTrackerData = {
  entries: FlowEntry[];
};

type FlowEntry = {
  id: string;
  date: Date;
  activity: string;
  energyBefore: number;  // 1-5
  energyAfter: number;   // 1-5
  engagement: number;    // 1-5
  notes?: string;
  tags?: string[];
};
```

### Visual Structure

```
Track an activity:

Activity
┌─────────────────────────────────────────────────┐
│ Writing project proposal                        │
└─────────────────────────────────────────────────┘

Energy Before
(−) Drained  ○───○───●───○───○  Energized (+)

Energy After
(−) Drained  ○───○───○───○───●  Energized (+)

Engagement
(−) Bored    ○───○───○───●───○  Absorbed (+)

Notes (optional)
┌─────────────────────────────────────────────────┐
│ Lost track of time, felt great afterward        │
└─────────────────────────────────────────────────┘

                                    [Add Entry]

─────────────────────────────────────────────────

Today's entries:

┌─────────────────────────────────────────────────┐
│ Writing project proposal              ⚡ +2     │
│ 3 → 5 energy • 4 engagement                     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Team standup meeting                  ↓ -1      │
│ 4 → 3 energy • 2 engagement                     │
└─────────────────────────────────────────────────┘
```

### Entry Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `activity` | TextInput | ✅ | What you were doing |
| `energyBefore` | Slider (1-5) | ✅ | Energy level before |
| `energyAfter` | Slider (1-5) | ✅ | Energy level after |
| `engagement` | Slider (1-5) | ✅ | How absorbed you felt |
| `notes` | TextArea | ❌ | Additional observations |

### Energy Delta Icons

| Delta | Icon | Color |
|-------|------|-------|
| +2 or more | ⚡ | `--color-success` |
| +1 | ↑ | `--color-success` @ 70% |
| 0 | → | `--color-muted` |
| -1 | ↓ | `--color-warning` |
| -2 or less | 😐 | `--color-error` |

### Rendered Structure

```html
<div class="flow-tracker">
  <form class="flow-tracker-form" onSubmit={handleAddEntry}>
    <h3 class="flow-tracker-form-title">Track an activity</h3>
    
    <TextInput
      label="Activity"
      value={formData.activity}
      onChange={(v) => setFormData({ ...formData, activity: v })}
      placeholder="What were you doing?"
      required
    />
    
    <Slider
      label="Energy Before"
      value={formData.energyBefore}
      onChange={(v) => setFormData({ ...formData, energyBefore: v })}
      min={1}
      max={5}
      minLabel="Drained"
      maxLabel="Energized"
    />
    
    <Slider
      label="Energy After"
      value={formData.energyAfter}
      onChange={(v) => setFormData({ ...formData, energyAfter: v })}
      min={1}
      max={5}
      minLabel="Drained"
      maxLabel="Energized"
    />
    
    <Slider
      label="Engagement"
      value={formData.engagement}
      onChange={(v) => setFormData({ ...formData, engagement: v })}
      min={1}
      max={5}
      minLabel="Bored"
      maxLabel="Absorbed"
    />
    
    <TextArea
      label="Notes (optional)"
      value={formData.notes}
      onChange={(v) => setFormData({ ...formData, notes: v })}
      placeholder="Any observations..."
      minRows={2}
    />
    
    <Button type="submit" variant="primary" disabled={!isFormValid}>
      Add Entry
    </Button>
  </form>
  
  <Divider />
  
  <div class="flow-tracker-entries">
    <h3 class="flow-tracker-entries-title">Today's entries</h3>
    
    {todayEntries.length === 0 ? (
      <p class="flow-tracker-empty">No entries yet today.</p>
    ) : (
      todayEntries.map(entry => (
        <FlowTrackerEntry key={entry.id} entry={entry} />
      ))
    )}
  </div>
</div>
```

### FlowTrackerEntry Component

```html
<div class="flow-entry">
  <div class="flow-entry-header">
    <span class="flow-entry-activity">{entry.activity}</span>
    <span class="flow-entry-delta" data-delta={getDeltaType(entry)}>
      {getDeltaIcon(entry)} {entry.energyAfter - entry.energyBefore > 0 ? '+' : ''}{entry.energyAfter - entry.energyBefore}
    </span>
  </div>
  <p class="flow-entry-meta">
    {entry.energyBefore} → {entry.energyAfter} energy • {entry.engagement} engagement
  </p>
  {entry.notes && (
    <p class="flow-entry-notes">{entry.notes}</p>
  )}
</div>
```

---

## 9.6 `FailureReframer`

Tool for reframing setbacks and learning from challenges.

### Props

```typescript
interface FailureReframerProps extends BaseToolProps<FailureReframerData> {}

type FailureReframerData = {
  situation: string;
  initialFeelings: string;
  whatLearned: string;
  whatWouldChange: string;
  silverLining: string;
  nextStep: string;
  reframedStatement: string;
};
```

### Fields

| Field | Label | Prompt |
|-------|-------|--------|
| `situation` | The Situation | Describe what happened. What was the setback or failure? |
| `initialFeelings` | Initial Feelings | How did you feel when it happened? |
| `whatLearned` | What I Learned | What did this experience teach you? |
| `whatWouldChange` | What I'd Do Differently | If you could go back, what would you change? |
| `silverLining` | Silver Lining | Was there anything positive that came from this? |
| `nextStep` | Next Step | What's one thing you can do now as a result? |
| `reframedStatement` | Reframed Statement | Write a new, constructive way to think about this experience. |

### Rendered Structure

```html
<div class="failure-reframer">
  <p class="failure-reframer-intro">
    Setbacks are part of growth. Let's reframe this experience 
    to find the learning and move forward.
  </p>
  
  <div class="failure-reframer-fields">
    <TextArea
      label="The Situation"
      helperText="Describe what happened. What was the setback or failure?"
      value={data.situation}
      onChange={(v) => onChange({ ...data, situation: v })}
      minRows={2}
    />
    
    <TextArea
      label="Initial Feelings"
      helperText="How did you feel when it happened?"
      value={data.initialFeelings}
      onChange={(v) => onChange({ ...data, initialFeelings: v })}
      minRows={2}
    />
    
    <TextArea
      label="What I Learned"
      helperText="What did this experience teach you?"
      value={data.whatLearned}
      onChange={(v) => onChange({ ...data, whatLearned: v })}
      minRows={2}
    />
    
    <TextArea
      label="What I'd Do Differently"
      helperText="If you could go back, what would you change?"
      value={data.whatWouldChange}
      onChange={(v) => onChange({ ...data, whatWouldChange: v })}
      minRows={2}
    />
    
    <TextArea
      label="Silver Lining"
      helperText="Was there anything positive that came from this?"
      value={data.silverLining}
      onChange={(v) => onChange({ ...data, silverLining: v })}
      minRows={2}
    />
    
    <TextArea
      label="Next Step"
      helperText="What's one thing you can do now as a result?"
      value={data.nextStep}
      onChange={(v) => onChange({ ...data, nextStep: v })}
      minRows={2}
    />
    
    <Divider type="section" />
    
    <TextArea
      label="Reframed Statement"
      helperText="Write a new, constructive way to think about this experience."
      value={data.reframedStatement}
      onChange={(v) => onChange({ ...data, reframedStatement: v })}
      minRows={3}
    />
  </div>
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Intro | `text-base`, `--color-muted`, `margin-bottom: space-6` |
| Field gap | `space-5` |
| Final field | Highlighted with left border `--color-primary` |

---

## 9.7 `BudgetCalculator`

Monthly income, taxes, and expense tracking with live tax calculation.

### Props

```typescript
interface BudgetCalculatorProps extends BaseToolProps<BudgetCalculatorData> {}

type BudgetCalculatorData = {
  grossMonthlyIncome: number;
  grossYearlyIncome: number;
  incomeInputMode: 'monthly' | 'yearly';
  filingStatus: FilingStatus;
  stateCode: string | null;
  expenses: ExpenseItem[];
};

type FilingStatus = 'single' | 'married' | 'married_separate' | 'head_of_household';

type ExpenseItem = {
  id: string;
  name: string;
  amount: number;
  isEssential: boolean;
};
```

### API Integration (API Ninjas)

```typescript
const API_NINJAS_ENDPOINT = 'https://api.api-ninjas.com/v1/incometaxcalculator';

type TaxBreakdown = {
  federal: number;
  state: number;
  ficaSocialSecurity: number;
  ficaMedicare: number;
  totalTaxes: number;
  takeHome: number;
  effectiveRate: number;
  isLoading: boolean;
  error: string | null;
};

const fetchTaxEstimate = async (
  yearlyIncome: number,
  filingStatus: FilingStatus,
  stateCode: string
): Promise<TaxAPIResponse> => {
  const response = await fetch(
    `${API_NINJAS_ENDPOINT}?country=US&region=${stateCode}&income=${yearlyIncome}&filing_status=${filingStatus}`,
    {
      headers: { 'X-Api-Key': process.env.NEXT_PUBLIC_API_NINJAS_KEY! }
    }
  );
  return response.json();
};
```

### Visual Structure

```
Monthly Budget Calculator

Gross Income
┌─────────────────┐  ┌─────────────────┐
│ $ 5,000         │  │ $ 60,000        │
│ per month       │  │ per year        │
└─────────────────┘  └─────────────────┘
                     (synced)

Filing Status                State
┌─────────────────┐         ┌─────────────────┐
│ Single        ▼ │         │ California    ▼ │
└─────────────────┘         └─────────────────┘

─────────────────────────────────────────────────

Tax Breakdown (Monthly)                    
  Federal Tax                    $  620
  State Tax (CA)                 $  280
  Social Security                $  310
  Medicare                       $   73
                                ────────
  Estimated Take-Home            $3,717
  Effective Rate                  25.7%

─────────────────────────────────────────────────

Monthly Expenses

  Name                 Amount    Essential
┌─────────────────────────────────────────────┐
│ Housing              $ 1,500      ☑         │
├─────────────────────────────────────────────┤
│ Food                 $   400      ☑         │
├─────────────────────────────────────────────┤
│ Utilities            $   150      ☑         │
├─────────────────────────────────────────────┤
│ Transportation       $   200      ☑         │
├─────────────────────────────────────────────┤
│ Insurance            $   100      ☑         │
├─────────────────────────────────────────────┤
│ Entertainment        $   200      ☐         │
└─────────────────────────────────────────────┘
                        [+ Add Expense]

─────────────────────────────────────────────────

Summary
  Estimated Take-Home            $3,717
  Total Expenses               - $2,550
  Essential Only               - $2,350
                                ────────
  Net Savings (Monthly)          $1,167  ✓

─────────────────────────────────────────────────

⚠️ Tax estimates provided by API Ninjas. Estimates 
   are approximate and don't account for deductions 
   or credits. Consult a tax professional for accuracy.
```

### Default Expenses

| Name | Amount | Essential |
|------|--------|-----------|
| Housing | $0 | ✅ |
| Food | $0 | ✅ |
| Utilities | $0 | ✅ |
| Transportation | $0 | ✅ |
| Insurance | $0 | ✅ |

### State Selection

Full list of US states + DC, searchable dropdown.

### Tax Calculation Logic

```typescript
// Debounced API call (500ms)
const debouncedFetchTaxes = useMemo(
  () => debounce(async (income, status, state) => {
    if (!income || !status || !state) return;
    
    setTaxes(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await fetchTaxEstimate(income, status, state);
      setTaxes({
        federal: result.federal_taxes_owed / 12,
        state: result.region_taxes_owed / 12,
        ficaSocialSecurity: result.fica_social_security / 12,
        ficaMedicare: result.fica_medicare / 12,
        totalTaxes: (result.federal_taxes_owed + result.region_taxes_owed + result.fica_total) / 12,
        takeHome: result.income_after_tax / 12,
        effectiveRate: result.total_effective_tax_rate,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setTaxes(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to calculate taxes. Please try again.',
      }));
    }
  }, 500),
  []
);
```

### Summary Calculations

```typescript
const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
const essentialExpenses = data.expenses
  .filter(e => e.isEssential)
  .reduce((sum, e) => sum + e.amount, 0);
const netSavings = taxes.takeHome - totalExpenses;
```

---

## 9.8 `IdeaTree`

Word association brainstorming game — NO tree visible until complete.

### Props

```typescript
interface IdeaTreeProps extends BaseToolProps<IdeaTreeData> {}

type IdeaTreeData = {
  rootIdea: string;
  layer1: [string, string, string];
  layer2A: [string, string, string];
  layer2B: [string, string, string];
  layer2C: [string, string, string];
  layer3A1: [string, string, string];
  layer3A2: [string, string, string];
  layer3A3: [string, string, string];
  layer3B1: [string, string, string];
  layer3B2: [string, string, string];
  layer3B3: [string, string, string];
  layer3C1: [string, string, string];
  layer3C2: [string, string, string];
  layer3C3: [string, string, string];
  isComplete: boolean;
};
```

### Flow

| Step | Prompt Word | User Provides |
|------|-------------|---------------|
| Intro | — | Read instructions |
| Root | "What topic?" | 1 root idea |
| Layer 1 | Root idea | 3 connected ideas |
| Layer 2A | Layer 1[0] | 3 connected ideas |
| Layer 2B | Layer 1[1] | 3 connected ideas |
| Layer 2C | Layer 1[2] | 3 connected ideas |
| Layer 3 (×9) | Each Layer 2 item | 3 connected ideas each |
| Complete | — | View full tree |

**Total: 40 ideas** (1 + 3 + 9 + 27)

### Visual Structure (During Entry)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│            What comes to mind when              │
│               you think of...                   │
│                                                 │
│                  TEACHING                       │
│                                                 │
│   1. ┌─────────────────────────────────────┐   │
│      │ Patience                            │   │
│      └─────────────────────────────────────┘   │
│                                                 │
│   2. ┌─────────────────────────────────────┐   │
│      │ Explaining                          │   │
│      └─────────────────────────────────────┘   │
│                                                 │
│   3. ┌─────────────────────────────────────┐   │
│      │                                     │   │
│      └─────────────────────────────────────┘   │
│                                                 │
│                              [Continue →]       │
│                                                 │
└─────────────────────────────────────────────────┘

Step 2 of 14
```

### Complete View

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                  🌳 Your Idea Tree              │
│                                                 │
│          40 ideas generated from 1 root         │
│                                                 │
│                   [TEACHING]                    │
│                   /    |    \                   │
│           Patience  Explaining  Growth          │
│           /  |  \    /  |  \    /  |  \         │
│         ...  ... ... ... ... ... ... ... ...    │
│                                                 │
│                                                 │
│    [Save Tree]              [Start New Tree]    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### State Machine

```typescript
type IdeaTreeStep = 
  | { type: 'intro' }
  | { type: 'root' }
  | { type: 'layer1' }
  | { type: 'layer2'; branch: 'A' | 'B' | 'C' }
  | { type: 'layer3'; branch: 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'B3' | 'C1' | 'C2' | 'C3' }
  | { type: 'complete' };

const getPromptWord = (step: IdeaTreeStep, data: IdeaTreeData): string => {
  switch (step.type) {
    case 'intro': return '';
    case 'root': return 'What topic are we thinking about?';
    case 'layer1': return data.rootIdea;
    case 'layer2':
      const l1Index = { A: 0, B: 1, C: 2 }[step.branch];
      return data.layer1[l1Index];
    case 'layer3':
      const [branch, idx] = [step.branch[0], parseInt(step.branch[1]) - 1];
      const layer2Key = `layer2${branch}` as keyof IdeaTreeData;
      return (data[layer2Key] as string[])[idx];
    case 'complete': return '';
  }
};
```

### Rendered Structure (Entry Step)

```html
<div class="idea-tree-entry">
  <p class="idea-tree-prompt-label">
    What comes to mind when you think of...
  </p>
  
  <h2 class="idea-tree-prompt-word">{promptWord}</h2>
  
  <div class="idea-tree-inputs">
    {[0, 1, 2].map(i => (
      <div key={i} class="idea-tree-input-row">
        <span class="idea-tree-input-number">{i + 1}.</span>
        <TextInput
          value={currentInputs[i]}
          onChange={(v) => updateInput(i, v)}
          placeholder="Type an idea..."
          autoFocus={i === 0}
        />
      </div>
    ))}
  </div>
  
  <Button
    variant="primary"
    onClick={handleContinue}
    disabled={!allInputsFilled}
  >
    Continue →
  </Button>
  
  <p class="idea-tree-step-indicator">
    Step {currentStepNumber} of 14
  </p>
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Prompt label | `text-base`, `--color-muted`, centered |
| Prompt word | `text-3xl`, `font-semibold`, centered, `margin: space-4 0 space-6` |
| Input number | `text-lg`, `--color-muted`, `width: 24px` |
| Step indicator | `text-sm`, `--color-muted`, centered |

---

## 9.9 `JobProspector`

Job opportunity tracking table.

### Props

```typescript
interface JobProspectorProps extends BaseToolProps<JobProspectorData> {}

type JobProspectorData = {
  prospects: JobProspect[];
};

type JobProspect = {
  id: string;
  field: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  adjectivesAdvantages: string;
  haves: string;      // Skills I have
  lacks: string;      // Skills I lack
  fitRating: number;  // 1-5
};
```

### Table Columns

| Column | Width | Type |
|--------|-------|------|
| Field | 100px | Text input |
| Job Title | 150px | Text input |
| Company | 120px | Text input |
| Job Description | 200px | Textarea (expandable) |
| Adj. & Adv. | 150px | Textarea |
| Haves | 150px | Textarea |
| Lacks | 150px | Textarea |
| Fit (1-5) | 60px | Number input |
| Actions | 40px | Delete button |

### Rendered Structure (Desktop)

```html
<div class="job-prospector">
  <table class="job-prospector-table">
    <thead>
      <tr>
        <th>Field</th>
        <th>Job Title</th>
        <th>Company</th>
        <th>Job Description</th>
        <th>Adj. & Adv.</th>
        <th>Haves</th>
        <th>Lacks</th>
        <th>Fit</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {data.prospects.map(prospect => (
        <tr key={prospect.id}>
          <td>
            <input
              type="text"
              value={prospect.field}
              onChange={(e) => updateProspect(prospect.id, 'field', e.target.value)}
            />
          </td>
          {/* ... other cells */}
          <td>
            <input
              type="number"
              min={1}
              max={5}
              value={prospect.fitRating}
              onChange={(e) => updateProspect(prospect.id, 'fitRating', parseInt(e.target.value))}
            />
          </td>
          <td>
            <button onClick={() => deleteProspect(prospect.id)}>
              <TrashIcon />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  
  <Button variant="secondary" icon={PlusIcon} onClick={addProspect}>
    Add Prospect
  </Button>
</div>
```

### Mobile View (Card Layout)

```html
<div class="job-prospector-cards">
  {data.prospects.map(prospect => (
    <div key={prospect.id} class="job-prospector-card">
      <div class="job-prospector-card-header">
        <input
          class="job-prospector-card-title"
          value={prospect.jobTitle}
          onChange={(e) => updateProspect(prospect.id, 'jobTitle', e.target.value)}
          placeholder="Job Title"
        />
        <button onClick={() => deleteProspect(prospect.id)}>
          <TrashIcon />
        </button>
      </div>
      
      <div class="job-prospector-card-field">
        <label>Company</label>
        <input value={prospect.company} onChange={...} />
      </div>
      
      {/* ... other fields */}
      
      <div class="job-prospector-card-fit">
        <label>Fit Rating</label>
        <div class="job-prospector-card-rating">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              data-active={prospect.fitRating >= n}
              onClick={() => updateProspect(prospect.id, 'fitRating', n)}
            >
              ★
            </button>
          ))}
        </div>
      </div>
    </div>
  ))}
</div>
```

### Responsive Behavior

| Viewport | Layout |
|----------|--------|
| ≥ 1024px | Horizontal scrolling table |
| < 1024px | Stacked card view |

---

## 9.10 Additional Tools (Stubs)

### ResumeBuilder

Pulls from SOARED stories, skills, and job history to help construct resume bullets.

```typescript
type ResumeBuilderData = {
  contactInfo: ContactInfo;
  summary: string;
  experience: ExperienceEntry[];
  skills: string[];
  education: EducationEntry[];
};
```

### NetworkingPrep

Informational interview preparation and contact tracking.

```typescript
type NetworkingPrepData = {
  contacts: NetworkContact[];
  interviewQuestions: string[];
  elevator: string;
};

type NetworkContact = {
  id: string;
  name: string;
  company: string;
  role: string;
  relationship: string;
  status: 'identified' | 'reached-out' | 'scheduled' | 'completed';
  notes: string;
};
```

---

## Related Documents

- **Section 1**: Component Philosophy
- **Section 5**: Structured Input Components (ListBuilder, RankingGrid, etc.)
- **Section 8**: Onboarding Components
- **Section 10**: Page Components
- **Design System**: Visual tokens, colors, typography, spacing
