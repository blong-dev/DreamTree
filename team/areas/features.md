# Features

This area owns feature-specific components: dashboard, onboarding, and profile.

## Ownership

**Scope:**
- `src/components/dashboard/` - Dashboard widgets
  - `DashboardGreeting.tsx` - Welcome message
  - `DailyDoList.tsx` - Daily action items
  - `DailyDoCard.tsx` - Individual action card
  - `ProgressMetrics.tsx` - Progress visualization
  - `ProgressMetric.tsx` - Single metric display
  - `ProfilePreview.tsx` - Quick user info card
  - `TOCInline.tsx` - Inline table of contents
  - `TOCInlinePart.tsx`, `TOCInlineModule.tsx`, `TOCInlineExercise.tsx` - TOC hierarchy
  - `types.ts` - Dashboard type definitions
- `src/components/onboarding/` - Onboarding flow
  - `OnboardingFlow.tsx` - Main onboarding controller
  - `WelcomeStep.tsx` - Welcome screen
  - `NameStep.tsx` - User name input
  - `VisualsStep.tsx` - Color/font selection
  - `CompleteStep.tsx` - Onboarding complete
  - `OnboardingProgress.tsx` - Progress indicator
  - `types.ts` - Onboarding type definitions
- `src/components/profile/` - Profile display
  - `DataPolicyBanner.tsx` - Data privacy notice
  - `ProfileHeader.tsx` - Profile title/info
  - `ProfileSection.tsx` - Content section
  - `SkillsList.tsx` - Skills display
  - `RankedList.tsx` - Ranked items display
  - `DataControls.tsx` - Data management options

**Does NOT own:**
- Dashboard page layout (owned by Shell)
- Profile data queries (owned by Database)
- Form components (owned by UI Primitives)

---

## Key Files

| File | Purpose |
|------|---------|
| `src/components/dashboard/DashboardGreeting.tsx` | Personalized welcome |
| `src/components/dashboard/ProgressMetrics.tsx` | 4-quadrant progress view |
| `src/components/dashboard/TOCInline.tsx` | Quick workbook navigation |
| `src/components/onboarding/OnboardingFlow.tsx` | Step controller |
| `src/components/onboarding/VisualsStep.tsx` | Theme customization |
| `src/components/profile/ProfileSection.tsx` | Collapsible data section |

---

## Patterns & Conventions

### Dashboard Layout
```tsx
<DashboardGreeting userName={name} />
<ProgressMetrics metrics={progressData} />
<DailyDoList items={dailyActions} />
<TOCInline currentExercise={exerciseId} />
```

### Onboarding Flow
```tsx
<OnboardingFlow
  onComplete={handleComplete}
  initialStep={0}
>
  <WelcomeStep />
  <NameStep />
  <VisualsStep />
  <CompleteStep />
</OnboardingFlow>
```

### Profile Sections
```tsx
<ProfileHeader name={name} headline={headline} />
<ProfileSection title="Skills">
  <SkillsList skills={skills} />
</ProfileSection>
<DataControls onExport={handleExport} onDelete={handleDelete} />
```

---

## Common Tasks

### Adding Dashboard Widget
1. Create component in `src/components/dashboard/`
2. Define props for data and callbacks
3. Add to dashboard page composition
4. Style with CSS classes in globals.css

### Modifying Onboarding Steps
1. Edit step component in `src/components/onboarding/`
2. Update OnboardingFlow if step order changes
3. Ensure data persists across steps
4. Test complete flow

### Adding Profile Section
1. Create section content component
2. Wrap in ProfileSection for consistent layout
3. Handle empty state if no data

---

## Testing

### Dashboard Testing
- Greeting shows correct name/time of day
- Progress metrics display accurate data
- Daily actions link to correct exercises
- TOCInline highlights current position

### Onboarding Testing
- Steps progress in order
- Back button works
- Data persists across steps
- Complete saves all settings

### Profile Testing
- All sections render with data
- Empty states show appropriately
- Data controls work (export, delete)

---

## Gotchas

### Dashboard Greeting Time
- Time-based greeting (Morning/Afternoon/Evening)
- Based on user's local time
- Falls back to generic if unknown

### Progress Metrics
- Four quadrants: Clarity, Strategy, Readiness, Confidence
- Values calculated from completed exercises
- Empty state when no progress

### TOCInline vs TOCPanel
- TOCInline: Simplified, embedded in dashboard
- TOCPanel: Full overlay with all details
- Share styling but different data needs

### Onboarding State
- State managed in OnboardingFlow
- Steps receive data via props
- Final step triggers save to database

### Visual Preferences
- Colors: ivory, brown, charcoal, black backgrounds
- Fonts: inter, lora, courier-prime, shadows-into-light, jacquard-24
- Stored in user_settings table

### Profile Data Privacy
- DataPolicyBanner explains data handling
- User owns all data
- Export as JSON available
- Delete removes all user data

---

## Dependencies

**Depends on:**
- UI Primitives (form components, feedback)
- Design System (styling, colors)
- Database (progress and profile queries)
- Auth (user session for personalization)

**Depended by:**
- Pages (dashboard, profile pages consume these)
- Shell (may trigger onboarding)

---

## Interface Contracts

### Dashboard Types
```typescript
interface ProgressMetric {
  label: string;
  value: number;  // 0-100
  color: string;
}

interface DailyDoItem {
  id: string;
  title: string;
  exerciseId: string;
  completed: boolean;
}
```

### Onboarding Types
```typescript
interface OnboardingData {
  name: string;
  backgroundColor: string;
  textColor: string;
  font: string;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  initialStep?: number;
  children: React.ReactNode;
}
```

### Profile Types
```typescript
interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}
```

---

## Spec Reference
- Dashboard: `/planning/DreamTree_Component_Spec.md` (Dashboard section)
- Onboarding: Same file, Onboarding section
- Profile: Same file, Profile section
- Color/font options: `/planning/DreamTree_Design_System.md`
