# Workbook

This area owns the exercise delivery system - the core content experience of DreamTree.

## Ownership

**Scope:**
- `src/app/workbook/` - Workbook pages
  - `page.tsx` - Workbook root (redirects to current exercise)
  - `[exerciseId]/page.tsx` - Individual exercise view
- `src/components/workbook/` - Workbook components
  - `WorkbookView.tsx` - Main workbook interface
  - `PromptInput.tsx` - Prompt input component
  - `ToolEmbed.tsx` - Tool embedding container
  - `types.ts` - Workbook type definitions
- `src/app/api/workbook/` - Workbook API routes
  - `[exerciseId]/route.ts` - Fetch exercise content
  - `response/route.ts` - Save user response
  - `progress/route.ts` - Fetch progress

**Does NOT own:**
- Database queries (owned by Database)
- Auth session handling (owned by Auth)
- Conversation components (owned by Conversation)
- Tool components (owned by Tools)

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/workbook/[exerciseId]/page.tsx` | Exercise page with data fetching |
| `src/components/workbook/WorkbookView.tsx` | Main content renderer |
| `src/components/workbook/PromptInput.tsx` | Input type handler |
| `src/components/workbook/ToolEmbed.tsx` | Tool integration |
| `src/app/api/workbook/[exerciseId]/route.ts` | Content API |
| `src/app/api/workbook/response/route.ts` | Response persistence |

---

## Patterns & Conventions

### Exercise ID Format
- Format: `Part.Module.Exercise.Version` (e.g., `1.2.3.v1`)
- Parts: 1-6
- Modules: 1-N (varies by part)
- Exercises: 1-N (varies by module)
- Version: `v1`, `v2`, etc.

### Content Flow
```
1. User navigates to /workbook/[exerciseId]
2. Page fetches exercise from API
3. WorkbookView renders content blocks
4. User responds to prompts
5. Response saved via API
6. Progress updated
7. User advances to next exercise
```

### Content Types
```typescript
type ContentType =
  | 'heading'      // Title text
  | 'paragraph'    // Body text
  | 'instruction'  // Action prompt
  | 'quote'        // Quoted content
  | 'prompt'       // User input request
  | 'tool';        // Interactive tool
```

### Prompt Types
```typescript
type PromptType =
  | 'text'         // TextInput
  | 'textarea'     // TextArea
  | 'slider'       // Slider
  | 'checkbox'     // Single checkbox
  | 'checkbox_group'  // Multiple checkboxes
  | 'radio'        // RadioGroup
  | 'select';      // Select dropdown
```

---

## Common Tasks

### Adding New Prompt Type
1. Add type to PromptType union
2. Add case to PromptInput switch
3. Use appropriate UI Primitive component
4. Handle value transformation if needed

### Modifying Exercise Flow
1. Check stem table for exercise sequence
2. Verify content_blocks, prompts, tools exist
3. Update API if data structure changes
4. Test typing effect and progression

### Adding API Endpoint
1. Create route in `src/app/api/workbook/`
2. Get session via `getOrCreateSession()`
3. Use typed database client
4. Return JSON response

---

## Testing

### Content Rendering
- All content types render correctly
- Typing effect plays for new content
- Skip typing on click works
- Long content scrolls properly

### Prompt Handling
- Each prompt type submits correctly
- Validation errors display inline
- Required prompts prevent progression
- Optional prompts can be skipped

### Response Persistence
- Responses save to database
- Save indicator shows status
- Errors display toast notification
- Saved responses restore on revisit

### Progression
- Next exercise unlocks on completion
- Linear progression through stem
- Cannot skip ahead (unless admin)

---

## Gotchas

### Exercise ID Parsing
- URL: `/workbook/1.2.3` (no version)
- Database lookup may need version handling
- Some IDs include `.v1` suffix

### Content Block Ordering
- Order determined by `sequence` field
- Gaps in sequence are intentional
- Don't assume contiguous numbers

### Prompt vs Tool
- Prompts are simple inputs (text, slider, etc.)
- Tools are complex interactive components
- Both save to user_responses, different columns

### Connection Resolution
- Tools may need hydrated data
- Resolve connections before rendering tool
- Empty connection data is valid (new user)

### Progress Tracking
- Progress stored in user_modules table
- Not every exercise creates a module entry
- Max sequence determines current position

### Typing Effect State
- Track which blocks have animated
- Don't re-animate on state change
- Skip on revisit (user has seen)

---

## Dependencies

**Depends on:**
- Database (content queries, response storage)
- Auth (session management)
- Conversation (message rendering)
- Tools (tool components)
- UI Primitives (form components)
- Shell (layout, breadcrumbs)

**Depended by:**
- None (top-level integrator)

---

## Interface Contracts

### Exercise API Response
```typescript
interface ExerciseResponse {
  exercise: {
    id: string;
    title: string;
    part: number;
    module: number;
    exercise: number;
  };
  contentBlocks: ContentBlock[];
  prompts: Prompt[];
  tools: Tool[];
  connections: Connection[];
}
```

### WorkbookView Props
```typescript
interface WorkbookViewProps {
  exercise: ExerciseData;
  contentBlocks: ContentBlock[];
  prompts: Prompt[];
  tools: Tool[];
  onPromptSubmit: (promptId: number, value: unknown) => void;
  onToolSave: (toolId: number, data: unknown) => void;
}
```

### Response API
```typescript
// POST /api/workbook/response
interface SaveResponseRequest {
  exerciseId: string;
  promptId?: number;
  toolId?: number;
  value: unknown;
}

interface SaveResponseResult {
  success: boolean;
  responseId?: string;
  error?: string;
}
```

---

## Spec Reference
- Content structure: `/planning/DreamTree_Data_Architecture_v4.md` (Stem, Content Blocks)
- Workbook UI: `/planning/DreamTree_Component_Spec.md` (Workbook section)
- Exercise flow: `/planning/DreamTree_Build_Plan.md` (Phase 6)
