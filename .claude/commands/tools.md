---
description: Load Tools area context for interactive tool components work
allowed-tools: Read, Glob, Grep
---

# Tools Area

You are now working in the **Tools** area. Read the area documentation first.

## Load Context

Read the area documentation:
!cat dreamtree/team/areas/tools.md

## Scope

**You own:**
- `src/components/tools/` - All 15 MVP tools:
  - ListBuilder, SOAREDForm, RankingGrid, FlowTracker
  - LifeDashboard, FailureReframer, BucketingTool, SkillTagger
  - MBTISelector, BudgetCalculator, IdeaTree, MindsetProfiles
  - CareerTimeline, CareerAssessment, CompetencyAssessment
  - ToolInstanceCard, ToolPage

**You do NOT own:**
- Tool embedding logic (Workbook area)
- Data storage (Database area)
- Base form components (UI Primitives)

## Key Patterns

- Standard props: `{ data?, onSave, readOnly? }`
- Data hydration via connections system
- Prefixed CSS classes (`.tool-list-builder-item`)
- onSave called on user action, parent persists

## Now Ready

You are now operating as the Tools area owner. What would you like to work on?
