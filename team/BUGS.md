# DreamTree Bug Tracker

**Single source of truth for multi-instance coordination.**

For workflow details, see `MANAGER.md` → "Multi-Instance Coordination"

---

## Status Flow

```
open → in-progress → review → done
                 ↓
              (trivial bugs can skip review)
```

| Status | Meaning |
|--------|---------|
| `open` | Not started |
| `in-progress` | Worker assigned and actively working |
| `review` | Work complete, awaiting QA verification |
| `done` | Verified and closed |

**Pazz (QA)** verifies all `review` bugs against acceptance criteria before moving to `done`.

---

## Bug Template

```markdown
### BUG-XXX: [Short description]
**Status**: `open`
**Priority**: `low` | `medium` | `high`
**Area**: [area name]
**Trivial**: `yes` (skip review) | `no` (default, requires QA)

**Description**:
[What's broken]

**Expected Behavior**:
[What should happen]

**Acceptance Criteria**:
- [ ] [Testable requirement 1]
- [ ] [Testable requirement 2]
- [ ] Build passes

**Files Likely Involved**:
- `path/to/file.tsx`
```

---

## Currently Editing

**Check before editing any file. Add yours when you start, remove when done.**

*No files currently locked.*

<!-- Format: - `path/to/file.tsx` (instance-id, what you're doing) -->

---

## Open Bugs

*No open bugs.*

---

## In Progress

<!-- Bugs currently being worked on -->

---

## Review (Awaiting QA)

<!-- Bugs completed by workers, awaiting Pazz verification -->

*No bugs awaiting review.*

---

## Recently Completed

### BUG-007: Roots overview is one endless header
**Status**: `done`
**Priority**: `medium`
**Area**: database
**Type**: `data-fix`

**Description**: The Roots overview (exercise 1.0.0) content_block 100001 contained the entire Table of Contents AND Overview text in one giant "heading" block, rendering as a wall of text.

**Resolution**:
1. Fixed content_block 100000 to be clean single-line heading "Part 1: Roots"
2. Replaced content_block 100001:
   - Changed content_type from 'heading' to 'instruction'
   - Removed the Table of Contents (users navigate via app UI)
   - Kept the meaningful Overview introduction paragraphs
3. Note: Splitting into multiple stem rows was not practical due to globally-unique sequence constraint

**Files Changed**:
- `migrations/0008_fix_roots_overview.sql` - New migration

---

### BUG-003: Profile page appearance links to 404
**Status**: `done`
**Priority**: `medium`
**Area**: features

**Description**: Profile page linked to `/settings` (404) instead of providing inline appearance editing.

**Resolution**:
1. Removed broken Link from ProfileHeader, replaced with button callback
2. Added inline VisualsStep component to profile page when editing
3. Added PATCH handler to `/api/profile` to save settings changes
4. Added state management for edit mode and saving

**Files Changed**:
- `src/components/profile/ProfileHeader.tsx` - Replaced Link with onEditAppearance callback
- `src/app/profile/page.tsx` - Added VisualsStep, edit state, save handler
- `src/app/api/profile/route.ts` - Added PATCH handler for settings
- `src/app/globals.css` - Added profile-appearance-actions styles

---

### BUG-005: Content blocks re-rendering (ink permanence violated)
**Status**: `done`
**Priority**: `high`
**Area**: workbook

**Description**: Content blocks were re-animating when they should be permanent. Violated "ink permanence" - once text appears, it should never re-animate.

**Resolution**:
1. Added `animatedMessageIds` Set tracking to WorkbookView (persists across re-renders)
2. Updated ConversationThread to accept animation tracking props
3. Messages only animate if their ID is NOT in the `animatedMessageIds` set
4. When animation completes, message ID is added to the set
5. For returning users, pre-populate the set with IDs of already-seen messages

**Root Cause**: MessageContent always animated by default (`animate={true}`), and there was no persistent tracking of which messages had already been animated. The old `animatedUpToRef` approach didn't work because it was index-based and had a side effect inside useMemo.

**Files Changed**:
- `src/components/conversation/ConversationThread.tsx` - Added `animatedMessageIds` and `onMessageAnimated` props
- `src/components/workbook/WorkbookView.tsx` - Added animation tracking with proper initialization for returning users

---

### BUG-004: Account deletion not working
**Status**: `done`
**Priority**: `high`
**Area**: auth

**Description**: Account deletion button only logged user out but didn't delete data.

**Resolution**:
1. Added DELETE handler to `/api/profile/route.ts` that deletes user from `users` table
2. All related tables have `ON DELETE CASCADE`, so deletion cascades to all user data
3. Updated `profile/page.tsx` to call DELETE endpoint before redirecting

**Files Changed**:
- `src/app/api/profile/route.ts` - Added DELETE handler
- `src/app/profile/page.tsx` - Updated handleDeleteData to call DELETE

---

### BUG-006: TOC visible in workbook
**Status**: `done`
**Priority**: `medium`
**Area**: shell

**Description**: TOC/Contents link was showing in the workbook view. It should be hidden during exercises.

**Resolution**: Code analysis shows the fix was already implemented:
- `WorkbookView.tsx:425` passes `hideContents={true}` to AppShell
- `AppShell.tsx:63` passes `hideContents` to NavBar
- `NavBar.tsx:47-57` conditionally hides Contents link when `hideContents` is true

**Verification**: If still visible, hard refresh browser (Ctrl+Shift+R) or check deployment status.

**Files Changed**: None - already fixed

---

### BUG-001: Toast has decorative shadow
**Status**: `done`
**Priority**: `low`
**Area**: design-system

**Description**: Toast component had `box-shadow` which violates "no shadows" design constraint.

**Resolution**: Removed box-shadow from `.toast` in globals.css. Border already provides sufficient visual distinction.

**Files Changed**:
- `src/app/globals.css` (line ~5946)

---

### BUG-002: Cannot edit past answers
**Status**: `done`
**Priority**: `medium`
**Area**: workbook

**Description**: Users could not click on their past responses to edit them, violating User Autonomy pillar.

**Resolution**: Added edit functionality - clicking a past response pre-fills input, PUT handler updates DB.

**Files Changed**:
- `src/components/conversation/MessageUser.tsx` - Added onEdit prop
- `src/components/conversation/ConversationThread.tsx` - Added onEditMessage callback
- `src/components/workbook/WorkbookView.tsx` - Added edit state and handler
- `src/app/api/workbook/response/route.ts` - Added PUT handler
- `src/app/globals.css` - Added .message-user--editable styles

---

## Notes

### Areas Reference
| Area | Owner Doc | Key Files |
|------|-----------|-----------|
| workbook | `team/areas/workbook.md` | `src/components/workbook/`, `src/app/workbook/` |
| conversation | `team/areas/conversation.md` | `src/components/conversation/` |
| tools | `team/areas/tools.md` | `src/components/tools/` |
| shell | `team/areas/shell.md` | `src/components/shell/` |
| auth | `team/areas/auth.md` | `src/lib/auth/` |
| database | `team/areas/database.md` | `src/lib/db/`, `migrations/` |
| features | `team/areas/features.md` | `src/components/dashboard/`, `onboarding/`, `profile/` |
| design-system | `team/areas/design-system.md` | `src/app/globals.css` |
| ui-primitives | `team/areas/ui-primitives.md` | `src/components/forms/`, `feedback/`, `icons/` |
