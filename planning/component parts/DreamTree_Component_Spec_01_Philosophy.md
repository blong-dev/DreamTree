# DreamTree Component Specification
## Section 1: Component Philosophy

> Foundational principles and component inventory for DreamTree UI components.

**Framework**: Next.js → Cloudflare Pages  
**Companion Document**: DreamTree Design System v1.0

---

## 1.1 Core Principles

| Principle | Implementation |
|-----------|----------------|
| **Composition over complexity** | Small, single-purpose, composable components |
| **Props drive variants** | One component with variant props, not separate components |
| **Accessibility baked in** | ARIA attributes, keyboard handling, focus management by default |
| **Dual-context tools** | Tools work both embedded in conversation and as standalone pages |

---

## 1.2 Navigation Model

| Nav Item | Type | Behavior | URL |
|----------|------|----------|-----|
| **Home** | Page | Dashboard with progress, prefs preview, TOC | `/` or `/dashboard` |
| **Contents** | Overlay | Sidebar slides in, stays on current page | No URL change |
| **Tools** | Page | Each tool has dedicated page, same shell | `/tools/[tool-id]` |
| **Profile** | Page | Deep data view, settings, account controls | `/profile` |

---

## 1.3 Component Inventory

### Shell & Navigation
- `AppShell` — Root layout orchestrating nav, header, content, input
- `NavBar` — Fixed navigation (4 items: home, contents, tools, profile)
- `NavItem` — Individual nav button
- `Header` — Breadcrumb bar, auto-hides after idle
- `Breadcrumb` — Part › Module › Exercise trail
- `InputArea` — Bottom input region for user responses

### Conversation
- `MessageContent` — DreamTree content blocks (left-aligned, no bubble)
- `MessageUser` — User response bubbles (right-aligned)
- `TypingEffect` — Character-by-character text reveal
- `Timestamp` — Date marker between messages
- `Divider` — Visual separator between sections/modules
- `ConversationThread` — Container managing message sequence

### Form Inputs
- `TextInput` — Single-line text input
- `TextArea` — Multi-line expandable text input
- `Slider` — Ordinal scale input (1-5)
- `Checkbox` — Single binary choice
- `CheckboxGroup` — Multiple selection from options
- `RadioGroup` — Single selection from options
- `Select` — Dropdown for longer option lists

### Structured Inputs
- `ListBuilder` — Dynamic list for adding/removing/reordering items
- `ListBuilderItem` — Individual item within ListBuilder
- `RankingGrid` — Pairwise comparison tool
- `RankingPair` — Single option in pairwise comparison
- `TagSelector` — Multi-select from predefined tags
- `SkillTagger` — Specialized tag selector for skills
- `SOAREDForm` — Structured SOARED story capture

### Feedback & Status
- `Button` — Primary interactive element
- `Toast` — Transient notification messages
- `ToastContainer` — Manager for multiple toasts
- `Tooltip` — Contextual information on hover/focus
- `SaveIndicator` — Auto-save confirmation
- `ProgressMarker` — Completion indicator
- `Badge` — Status indicator or count
- `EmptyState` — Placeholder for empty content

### Overlays
- `Backdrop` — Semi-transparent layer behind overlays
- `Modal` — Centered dialog for confirmations
- `TOCPanel` — Sliding sidebar with table of contents
- `TOCPart` — Collapsible part section
- `TOCModule` — Module item within part
- `TOCExercise` — Exercise item within module
- `NavExpanded` — Expanded nav showing tool sub-items

### Onboarding
- `OnboardingFlow` — Multi-step onboarding container
- `WelcomeStep` — Introduction screen
- `NameStep` — Name input
- `VisualsStep` — Color and font selection
- `ColorSwatch` — Individual color option
- `FontPreview` — Individual font option
- `CompleteStep` — Final confirmation
- `OnboardingProgress` — Step indicator

### Tools
- `ToolPage` — Shell for tool pages (list of instances)
- `ToolInstanceCard` — Instance preview card
- `ToolInstanceView` — Full view/edit of instance
- `ListBuilder` — List creation tool
- `RankingGrid` — Ranking tool
- `FlowTracker` — Daily energy/engagement tracking
- `FailureReframer` — Setback reframing tool
- `BudgetCalculator` — Income/expense tracker with tax API
- `IdeaTree` — Word association brainstorming
- `JobProspector` — Job opportunity tracking

### Pages
- `Dashboard` — Home page with daily dos, progress, TOC
- `Profile` — User data, settings, account
- `ToolPage` — Individual tool with instances
- `Workbook` — Main conversation interface

---

## 1.4 Z-Index Scale

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Content | 0 | Main content area |
| Header | 10 | Breadcrumb bar |
| Input | 20 | Input area |
| Nav | 30 | Navigation bar |
| Backdrop | 40 | Overlay backgrounds |
| Modal/Panel | 50 | Overlays |
| Toast | 60 | Notifications |

---

## 1.5 Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 768px | Nav at bottom, single column, touch-optimized |
| Tablet | 768px - 1023px | Nav at bottom, wider content |
| Desktop | ≥ 1024px | Nav rail on left, max-width content |

---

## 1.6 Common Types

```typescript
// Location in workbook
type BreadcrumbLocation = {
  partId: string;
  partTitle: string;
  moduleId?: string;
  moduleTitle?: string;
  exerciseId?: string;
  exerciseTitle?: string;
};

// Tool instance source
type WorkbookSource = {
  type: 'workbook';
  partId: string;
  moduleId: string;
  exerciseId: string;
};

type UserCreated = {
  type: 'user';
};

// Progress tracking
type ProgressStatus = 'locked' | 'available' | 'in-progress' | 'complete';
```

---

## Related Documents

- **Section 2**: Shell & Navigation Components
- **Section 3**: Conversation Components
- **Section 4**: Form Input Components
- **Section 5**: Structured Input Components
- **Section 6**: Feedback & Status Components
- **Section 7**: Overlay Components
- **Section 8**: Onboarding Components
- **Section 9**: Tool Components
- **Section 10**: Page Components
- **Design System**: Visual tokens, colors, typography, spacing
