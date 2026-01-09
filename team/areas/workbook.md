# Workbook

This area owns the exercise delivery system - the core content experience of DreamTree.

---

## Soul

**Linear but not rigid. The conversation flows like a skilled coach — structured but responsive.**

The workbook is where DreamTree's soul lives. Every other area supports this one. The workbook isn't just "the content delivery system" — it's the embodiment of the "texting through a guided workbook" metaphor.

### The Core Experience

Imagine sitting with a thoughtful career coach. They ask you a question. You think. You respond. They acknowledge what you said, connect it to what you told them last week, and ask a follow-up question that makes you think deeper.

That's what the workbook should feel like.

### The Four Pillars in Action

| Pillar | How Workbook Embodies It |
|--------|--------------------------|
| **Conversational Intimacy** | Content appears one block at a time with typing effect. Messages feel like dialogue, not instructions. |
| **User Autonomy** | Users can scroll back, edit past answers, and click to skip. No forced pace. |
| **Data Sovereignty** | Every response saves to the user's data. Visible in Profile. Exportable. |
| **Magic Moments** | Connections surface past answers in new contexts. "Remember when you said..." |

### The Flow Principle

**One thing at a time. Always.**

```
Show content block → User clicks Continue → Show next block
Show prompt → User responds → Acknowledge → Continue
Show tool → User interacts → Save → Continue
```

Never reveal the whole exercise structure. Never show multiple prompts at once. Never make users feel like they're filling out a form.

The conversation unfolds. Block by block. Response by response.

### Why Linear Progression?

Users must complete exercise N-1 to access exercise N. This isn't limitation — it's design:

1. **Intentional sequencing** — Each exercise builds on insights from the previous
2. **No skipping self-reflection** — Rushing to "the resume part" undermines the whole journey
3. **Accumulating wisdom** — Connections require prior data to exist
4. **Reduced anxiety** — Users don't see the mountain; they just take the next step

### The Three-Part Tree

| Part | Theme | Emotional Arc |
|------|-------|---------------|
| **1: Roots** | Who you are | "I understand myself better than I did" |
| **2: Trunk** | What you bring | "I can tell my story with confidence" |
| **3: Branches** | Where you're going | "I have a plan and the tools to execute it" |

### What a Soul Violation Looks Like

- **All content visible at once** — Exercise feels like a form, not a conversation
- **No typing effect** — Text appears instantly like reading a document
- **Multiple prompts visible** — User sees all questions before answering any
- **Can't edit past answers** — Feels rigid and punishing
- **Progress percentages** — "You're 34% through Part 1!" — gamification creep
- **Skipping allowed** — User can jump to Part 3 without self-discovery
- **No acknowledgment** — User responds but DreamTree doesn't reflect anything back
- **Disconnected exercises** — No connections surface prior insights

### The Magic Moments

When a tool in exercise 2.3 pre-populates with skills you tagged in exercise 1.4, that's a Magic Moment. When exercise 3.1 references "the values you said mattered most," that's a Magic Moment.

These moments are why the connections system exists. They transform the workbook from a series of exercises into a coherent journey.

**Every exercise should ask**: "What prior data could make this more meaningful?"

---

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
1. User must be authenticated (middleware checks session)
2. User navigates to /workbook/[exerciseId]
3. Page fetches exercise from API (server component)
4. WorkbookView renders content blocks
5. ToolEmbed fetches reference data (skills, competencies) if needed
6. User responds to prompts
7. Response saved via API
8. Progress updated
9. User advances to next exercise
```

### Auth Requirements
- Workbook pages are protected by middleware
- Unauthenticated users redirected to `/login`
- New users go: `/signup` → `/onboarding` → `/workbook`

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
