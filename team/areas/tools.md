# Tools

This area owns the 15 interactive tool components used throughout the workbook.

## Ownership

**Scope:**
- `src/components/tools/` - All tool components
  - `ListBuilder.tsx` - Create ordered/unordered lists
  - `SOAREDForm.tsx` - SOARED story prompt form
  - `RankingGrid.tsx` - Rank items in matrix
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
  - `CareerAssessment.tsx` - Career skills assessment
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
| `src/components/tools/ListBuilder.tsx` | Generic list creation |
| `src/components/tools/SOAREDForm.tsx` | Situation-Obstacle-Action-Result-Evaluation-Discovery |
| `src/components/tools/RankingGrid.tsx` | Drag-and-drop ranking |
| `src/components/tools/SkillTagger.tsx` | Skill selection with mastery |
| `src/components/tools/ToolInstanceCard.tsx` | Wrapper for tool instances |

---

## Patterns & Conventions

### Tool Component Structure
```tsx
interface ToolProps {
  data?: HydratedData;      // Pre-populated data from connections
  onSave: (data: ToolData) => void;
  readOnly?: boolean;
}

export function MyTool({ data, onSave, readOnly }: ToolProps) {
  const [localState, setLocalState] = useState(data || defaultState);

  const handleSave = () => {
    onSave(localState);
  };

  return (/* UI */);
}
```

### Data Hydration
Tools receive pre-populated data via the connections system:
```tsx
// In workbook:
const connectionData = await resolver.resolve({ userId, connectionId });
<SOAREDForm data={connectionData.data} onSave={handleSave} />
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

### Save Flow
1. User interacts with tool
2. Tool calls `onSave(data)` on user action
3. Parent (Workbook) persists to database
4. SaveIndicator shows status

---

## Common Tasks

### Adding a New Tool
1. Create component in `src/components/tools/`
2. Follow the standard props pattern (data, onSave, readOnly)
3. Add types to `types.ts`
4. Add CSS classes to globals.css
5. Export from index.ts
6. Register in Workbook tool renderer

### Implementing Data Hydration
1. Check if `data` prop is provided
2. Initialize local state from `data` or defaults
3. Handle partial data gracefully

### Adding Tool Validation
1. Validate locally before calling `onSave`
2. Show inline error messages
3. Prevent save until valid

---

## Testing

### Component Testing
- Renders correctly with/without data
- User interactions update state
- `onSave` called with correct data structure

### Data Hydration Testing
- Pre-populated data displays correctly
- Partial data fills what's available
- Empty data uses sensible defaults

### Accessibility Testing
- Keyboard navigation works
- Screen reader announces changes
- Focus management for lists/grids

---

## Gotchas

### ListBuilder Ordering
- Uses array index for ordering
- Drag-and-drop updates array position
- Empty items should be filtered on save

### RankingGrid Matrix
- Items ranked across multiple dimensions
- Cells may be exclusive (one item per cell)
- Or non-exclusive (multiple per cell)

### SOAREDForm Fields
- Six required fields: Situation, Obstacle, Action, Result, Evaluation, Discovery
- Each field has min/max character limits
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
  onSave: (data: T) => void;
  readOnly?: boolean;
  connectionId?: number;
}
```

### Tool Data Types
```typescript
// ListBuilder
interface ListData {
  items: string[];
  ordered: boolean;
}

// SOAREDForm
interface SOAREDData {
  situation: string;
  obstacle: string;
  action: string;
  result: string;
  evaluation: string;
  discovery: string;
}

// RankingGrid
interface RankingData {
  items: Array<{ id: string; content: string; position: [number, number] }>;
}
```

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
