# Tools

This area owns the 15 interactive tool components used throughout the workbook.

---

## Soul

**Tools are thinking aids, not data collection. Each one helps users see what they couldn't see alone.**

The tools in DreamTree aren't forms to fill out — they're instruments for self-discovery. A good tool takes something abstract (your skills, your values, your stories) and makes it visible and manipulable. When users finish with a tool, they should feel like they learned something about themselves, not like they completed paperwork.

### Why Each Tool Exists

| Tool | Purpose | The Insight It Creates |
|------|---------|------------------------|
| **ListBuilder** | Brainstorm freely, then organize | "I have more ideas than I thought" |
| **SOAREDForm** | Structure your stories | "My experiences follow meaningful patterns" |
| **SkillTagger** | Map skills to experiences | "I've been building these skills all along" |
| **RankingGrid** | Compare preferences | "I can articulate what I actually value" |
| **FlowTracker** | Log energy patterns | "I notice what energizes vs. drains me" |
| **LifeDashboard** | Balance life domains | "I see where I'm investing my energy" |
| **FailureReframer** | Transform setbacks | "My failures taught me things" |
| **BucketingTool** | Categorize and sort | "I can organize my thoughts" |
| **MBTISelector** | Capture personality type | "My type helps explain my preferences" |
| **BudgetCalculator** | Plan finances | "I know what I need financially" |
| **IdeaTree** | Branch ideas outward | "My thoughts connect in unexpected ways" |
| **MindsetProfiles** | Assess mindsets | "I can identify my thinking patterns" |
| **CareerTimeline** | Map career arc | "I see my journey as a coherent story" |
| **CareerAssessment** | Evaluate options | "I can compare opportunities systematically" |
| **CompetencyAssessment** | Self-rate competencies | "I understand my professional strengths" |

### What a Soul Violation Looks Like

- **Tool feels like paperwork** — Just filling in boxes without reflection
- **No visible output** — Data captured but user doesn't see the pattern
- **Rushed interaction** — No time to think, just click through
- **Disconnected from journey** — Tool data never resurfaces meaningfully
- **Overwhelming options** — Too many fields, too much complexity

### The Tool Experience

1. **Enter** — Tool appears with clear purpose (instructions explain why)
2. **Interact** — User manipulates their own data (not filling a form)
3. **See** — Patterns become visible as they work
4. **Save** — Silent auto-save + explicit Continue when ready
5. **Connect** — Data flows to future exercises (Magic Moments)

---

## Ownership

**Scope:**
- `src/components/tools/` - All tool components
  - `ListBuilder.tsx` - Create ordered/unordered lists
  - `SOAREDForm.tsx` - SOARED story prompt form
  - `RankingGrid.tsx` - Pairwise comparison ranking
  - `FlowTracker.tsx` - Log flow state activities
  - `LifeDashboard.tsx` - Work/Play/Love/Health tracker
  - `FailureReframer.tsx` - Reframe failures positively
  - `BucketingTool.tsx` - Sort items into categories
  - `SkillTagger.tsx` - Tag skills with mastery levels
  - `MBTISelector.tsx` - MBTI personality selector
  - `BudgetCalculator.tsx` - Budget planning tool
  - `IdeaTree.tsx` - Tree structure for ideas
  - `MindsetProfiles.tsx` - Mindset assessment
  - `CareerTimeline.tsx` - Career progression planner
  - `CareerAssessment.tsx` - Career options evaluator
  - `CompetencyAssessment.tsx` - OECD competency evaluator
  - `ToolInstanceCard.tsx` - Tool container card
  - `ToolPage.tsx` - Tool detail page layout
  - `types.ts` - Tool type definitions

**Also owns:**
- `src/app/tools/` - Tool pages
  - `page.tsx` - Tools index showing all tool categories
  - `[toolType]/page.tsx` - Individual tool type page with instances

**Does NOT own:**
- Tool embedding logic (owned by Workbook)
- Data storage (owned by Database)
- Base form components (owned by UI Primitives)

---

## Key Files

| File | Purpose |
|------|---------|
| `src/components/tools/types.ts` | Shared tool interfaces |
| `src/components/tools/ListBuilder.tsx` | Drag-and-drop list creation |
| `src/components/tools/SOAREDForm.tsx` | Structured story form |
| `src/components/tools/RankingGrid.tsx` | Pairwise comparison |
| `src/components/tools/SkillTagger.tsx` | Skill selection with mastery |
| `src/components/tools/ToolEmbed.tsx` | (in Workbook) Tool renderer in exercises |

---

## Principles

### 1. Dual-Context Design
Every tool works in two modes:
- **Embedded** — Inline in conversation, props from parent exercise
- **Standalone** — Full page with instance list, create/edit/delete

The same component, different contexts.

### 2. Data Hydration
Tools receive prior user data via connections:
```tsx
// Connection provides pre-populated data
<SkillTagger
  skills={skills}  // Reference data
  selectedSkillIds={connectionData}  // User's prior selections
/>
```

### 3. Auto-Save
Tools silently save as users work:
- Debounced save (1.5s after last change)
- No visible "saved" indicator
- Continue button for explicit progression

### 4. Progressive Unlock
Tools appear when users reach relevant exercises:
- FlowTracker unlocks early (daily usage)
- Networking tools unlock in Part 3
- Some tools reappear multiple times with different data

---

## The 15 Tools (Detailed)

### ListBuilder
**Purpose**: Brainstorm items, then organize them
- Drag-and-drop reordering
- Inline editing
- Add/remove items
- **Connection use**: Lists feed into RankingGrid, BucketingTool

### SOAREDForm
**Purpose**: Structure professional stories using SOARED framework
- Situation, Obstacle, Action, Result, Evaluation, Discovery
- Each field has guidance text
- **Connection use**: Stories become resume content, skill evidence

### SkillTagger
**Purpose**: Tag skills from a searchable database
- 200+ skills in categories (Technical, Interpersonal, Self-Management)
- Custom skills allowed
- Mastery levels (1-5)
- **Connection use**: Skills feed career matching, resume building

### RankingGrid
**Purpose**: Compare items pairwise to determine true preferences
- More accurate than direct ranking
- Shows final order after comparisons
- **Connection use**: Ranked values inform decision-making

### FlowTracker
**Purpose**: Log daily energy and engagement
- Energy scale (-2 to +2)
- Focus/Captivation (1-5)
- Pattern analysis over time
- **Connection use**: Flow patterns inform career fit

### LifeDashboard
**Purpose**: Gauge balance across life domains
- Work, Play, Love, Health
- Each rated 1-10
- Visual gauge display
- **Connection use**: Balance informs priorities

### FailureReframer
**Purpose**: Transform setbacks into learning
- Guided reflection prompts
- Reframe negative to growth mindset
- **Connection use**: Reframed stories support resilience

### BucketingTool
**Purpose**: Sort items into categories
- Configurable bucket labels
- Drag items between buckets
- **Connection use**: Categorized items feed filtering

### MBTISelector
**Purpose**: Capture personality type
- 16 types with career-focused descriptions
- Typeahead search by code or name
- **Connection use**: Type informs work environment fit

### BudgetCalculator
**Purpose**: Plan financial needs
- Income input (yearly or monthly)
- Tax estimation by state
- Expense categories
- **Connection use**: Salary requirements for job filtering (encrypted)

### IdeaTree
**Purpose**: Branch ideas in tree structure
- Central topic + branches
- Expand infinitely
- Collapse/expand navigation
- **Connection use**: Career ideas branch into paths

### MindsetProfiles
**Purpose**: Assess design thinking mindsets
- 5 mindsets from Stanford d.school
- Character selection for each
- **Connection use**: Mindset awareness for job search

### CareerTimeline
**Purpose**: Map career arc visually
- Past milestones
- Future projections
- Gap analysis
- **Connection use**: Timeline informs networking narrative

### CareerAssessment
**Purpose**: Evaluate career options systematically
- Multiple options side-by-side
- Scoring on criteria
- Weighted comparison
- **Connection use**: Assessment feeds decision-making

### CompetencyAssessment
**Purpose**: Self-rate on 15 OECD competencies
- Clear level descriptors
- Category averages
- Strength/improvement identification
- **Connection use**: Competencies inform development planning

---

## Patterns & Conventions

### Tool Component Structure
```tsx
interface ToolProps {
  data?: ToolData;              // Pre-populated from connections
  onChange: (data: ToolData) => void;  // For auto-save
  disabled?: boolean;
}

export function MyTool({ data, onChange, disabled }: ToolProps) {
  const [localState, setLocalState] = useState(data || defaultState);

  // Auto-save on change
  useEffect(() => {
    onChange(localState);
  }, [localState, onChange]);

  return (/* UI */);
}
```

### Data Hydration
Tools receive pre-populated data via the connections system:
```tsx
// In workbook:
const connectionData = await resolver.resolve({ userId, connectionId });
<SOAREDForm data={connectionData.data} onChange={handleChange} />
```

### Reference Data Loading
Some tools need reference data (skills list, competencies):
```tsx
// ToolEmbed fetches on mount:
useEffect(() => {
  if (toolName === 'skill_tagger') {
    fetch('/api/data/skills')
      .then(res => res.json())
      .then(data => setSkills(data.skills));
  }
}, [toolName]);
```

**Data API endpoints:**
- `/api/data/skills` - All skills from skills table
- `/api/data/competencies` - All competencies from competencies table
- `/api/data/connection?connectionId=N` - User data via ConnectionResolver

---

## Common Tasks

### Adding a New Tool
1. Create component in `src/components/tools/`
2. Follow the standard props pattern (data, onChange, disabled)
3. Add types to `types.ts`
4. Add CSS classes to globals.css
5. Export from index.ts
6. Add to ToolEmbed switch statement
7. **Document the tool's PURPOSE in this file**

### Implementing Data Hydration
1. Check if `data` prop is provided
2. Initialize local state from `data` or defaults
3. Handle partial data gracefully
4. **Test with real connection data**

### Adding Tool Validation
1. Validate locally before allowing Continue
2. Show inline error messages (not toasts)
3. Prevent save until valid
4. **Don't over-validate — let users explore**

---

## Testing

### Component Testing
- Renders correctly with/without data
- User interactions update state
- `onChange` called with correct data structure

### Data Hydration Testing
- Pre-populated data displays correctly
- Partial data fills what's available
- Empty data uses sensible defaults

### Accessibility Testing
- Keyboard navigation works
- Screen reader announces changes
- Focus management for lists/grids
- Drag-and-drop has keyboard alternative

---

## Gotchas

### ListBuilder Ordering
- Uses array index for ordering
- Drag-and-drop updates array position
- Empty items should be filtered on save

### RankingGrid Algorithm
- Pairwise comparison, not direct ranking
- Items compared until order determined
- Shows final order after all comparisons

### SOAREDForm Fields
- Six required fields
- Action field should be longest (4+ rows)
- Linked to `user_stories` table

### SkillTagger Search
- Typeahead search against skills table
- Custom skills can be added
- Mastery level: 1-5 scale

### FlowTracker Data
- Energy: -2 to +2 scale
- Focus/Captivation: 1-5 scale
- High flow: energy >= 1 AND focus >= 4

### Tool CSS Isolation
- Each tool has prefixed CSS classes
- Example: `.list-builder-item`, `.ranking-grid-cell`
- Avoid global styles that leak

---

## Dependencies

**Depends on:**
- UI Primitives (form components, icons)
- Design System (styling)
- Database (data hydration types)

**Depended by:**
- Workbook (embeds tools in exercises)
- Features (tool gallery on Tools page)

---

## Interface Contracts

### Standard Tool Props
```typescript
interface BaseToolProps<T> {
  data?: T;
  onChange: (data: T) => void;
  disabled?: boolean;
}
```

### Tool Data Types
See `src/components/tools/types.ts` for full definitions.

### ToolInstanceCard Props
```typescript
interface ToolInstanceCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}
```

---

## Spec Reference
- Tool specifications: `/planning/DreamTree_Component_Spec.md` (Tools section)
- Tool data structures: `/planning/DreamTree_Data_Architecture_v4.md` (Tools table)
- Connection hydration: Same file, Connections section
