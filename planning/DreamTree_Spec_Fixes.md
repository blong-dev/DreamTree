# DreamTree Spec Fixes Tracker

> Generated from spec review on January 2, 2025  
> Status: **19 issues identified, 0 fixed**

---

## Recommended Breakpoints

| Breakpoint | Width | Rationale |
|------------|-------|-----------|
| **Mobile** | < 768px | iPad portrait boundary. Covers phones + small tablets. Nav at bottom. |
| **Tablet** | 768px - 1023px | iPad portrait, small laptops. Bottom nav, more breathing room. |
| **Desktop** | ≥ 1024px | Nav moves to left rail. Content centered at 720px max. |

**Why 768px not 640px:**
- 768px = iPad portrait width (natural phone/tablet boundary)
- 640px catches large phones in "tablet" mode unnecessarily  
- Tailwind `md`, Bootstrap `md` both use 768px
- Nav rail (64px) + content (720px) + margins needs ~848px, so 1024px desktop is right

**Update:** Design System Section 5 (change 640px → 768px)

---

## 🔴 Critical Issues (Block Build)

### 1. TOOL SPECIFICATIONS INCOMPLETE

**Status:** ⬜ Not Started

| Tool | Spec Status | Daily Reminder | Notes |
|------|-------------|----------------|-------|
| Flow Tracker | ✅ Complete | Daily | |
| Failure Reframer | ✅ Complete | Weekly | |
| Budget Calculator | ✅ Complete | Monthly | PII encrypted |
| SOARED Story | ✅ Complete | Monthly | |
| Networking Prep | ✅ Complete | Daily | PII encrypted |
| Job Prospector | ✅ Complete | Daily | |
| List Builder | ✅ Complete | — | |
| Ranking Grid | ✅ Complete | — | |
| Idea Tree | ✅ Complete | — | |
| **Resume Builder** | ❌ MISSING | — | Referenced in Module 3.2 |
| **Skill Sharpening** | ❌ MISSING | Daily? | Exercise 1.5.1b: daily practice |
| **Mindfulness** | ❌ MISSING | Daily? | Exercise 1.5.3a: daily practice |
| **Routine Tracker** | ❌ MISSING | Daily? | Exercise 1.5.4a: "Routine template" |

**Decisions needed:**
- Are Skill Sharpening, Mindfulness, Routine separate tools or unified "Daily Practice" tool?
- Or just reminder prompts without UI?
- Should they appear in Daily Dos?

**Action:** Write specs or document why they're not tools

---

### 2. THE 14 CONNECTIONS - COMPLETE AUDIT REQUIRED

**Status:** ⬜ Not Started

The "magic moments" reference exercises that don't exist or are mislabeled.

| # | Claims to Reference | Actually Exists? | Real Exercise ID |
|---|---------------------|------------------|------------------|
| 1 | "1.5 Joy Sources" | ❌ No | Probably 1.3.2 (Flow) |
| 2 | "1.3 Superpowers" | ❌ No | ? |
| 3 | "1.2 Purpose Verbs" | ❌ No | ? |
| 4 | "1.4 Love" | ✅ Module exists | 1.4.x |
| 5 | "1.1 Childhood dreams" | ❌ No | ? |
| 6 | "2.1 Job interests" | ⚠️ Partial | Need exercise ID |
| 7 | "2.3 SOARED stories" | ⚠️ Wrong | SOARED is 2.5, not 2.3 |
| 8 | "2.2 Strengths" | ⚠️ Partial | Need exercise ID |
| 9 | "1.3 + 2.3" | ⚠️ Partial | Need exercise IDs |
| 10 | "2.5 Decision framework" | ⚠️ Partial | Need exercise ID |
| 11 | "Throughout" | N/A | Meta-reference |
| 12 | "1.5 Joy sources" | ❌ Same as #1 | ? |
| 13 | "2.4 Non-negotiables" | ⚠️ Partial | Need exercise ID |
| 14 | "1.2 + 1.3" | ⚠️ Partial | Need exercise IDs |

**Known tie-through in workbook (line ~2065):**
> "Review... from Exercise 1.3.2: Flow State Mapping"

**Action:** 
1. Extract ALL cross-references from DreamTree.md
2. Map to actual exercise IDs ("1.1.1.v1" format)
3. Rewrite connections table
4. May be MORE than 14

---

### 3. Z-INDEX CONFLICTS

**Status:** ⬜ Not Started

| Layer | Design System | Component Spec | **Use This** |
|-------|---------------|----------------|--------------|
| content | 0 | 0 | 0 |
| raised | — | 10 | 10 |
| header | 60 | 10 | 20 |
| nav | 50 | 30 | 30 |
| input | 70 | 20 | 40 |
| backdrop | — | 40 | 100 |
| overlay | 200 | 50 | 200 |
| modal | 300 | — | 300 |
| tooltip | 400 | 60 | 400 |

**Update:** Design System Section 5

---

### 4. COLOR/FONT NAMING MISMATCH

**Status:** ⬜ Not Started

**Background colors (3 different lists!):**

| Design System | DB Default | Project Summary |
|---------------|------------|-----------------|
| Ivory | cream | Cream |
| Creamy Tan | — | — |
| Brown | — | — |
| Bluish Charcoal | charcoal | Charcoal |
| Black | — | — |
| — | — | Sage |
| — | — | Lavender |
| — | — | Sky |

**Decision needed:** Which 5 colors are you shipping?

**Font options (also mismatched):**

| Design System | DB Default | Project Summary |
|---------------|------------|-----------------|
| Clean Sans | — | Sans |
| Classic Serif | — | Serif |
| Typewriter | — | Mono |
| Handwritten | — | Handwritten |
| Vintage Display | — | — |
| — | system | System |

**Recommended canonical names:**
- Backgrounds: `ivory, cream, sage, lavender, charcoal`
- Fonts: `system, sans, serif, mono, handwritten`

**Update:** Design System, Data Architecture, Project Summary

---

## 🟡 Medium Issues (Fix Before Launch)

### 5. MOBILE BREAKPOINT INCONSISTENCY

**Status:** ⬜ Not Started

Design System: 640px | Component Spec: 768px

**Fix:** Use 768px everywhere

---

### 6. DAILYDOTYPE NAMING MISMATCH

**Status:** ⬜ Not Started

| DailyDoType (Component Spec) | Should be (tool_types.id) |
|------------------------------|---------------------------|
| 'flow-tracking' | 'flow-tracker' |
| 'failure-reframe' | 'failure-reframer' |
| 'job-prospecting' | 'job-prospector' |
| 'networking' | 'networking-prep' |
| 'budget-check' | 'budget-calculator' |
| 'soared-prompt' | 'soared-story' |
| 'resume' | 'resume-workbook'? |

**Fix:** Align with tool_types.id

---

### 7. EXERCISE_SKILLS ORPHAN RISK

**Status:** ⬜ Not Started

Polymorphic FK to `exercise_responses.id` OR `tool_instances.id` — no constraint.

**Risk:** Orphaned rows on delete.

**Options:**
1. Accept orphans, background cleanup
2. Application-level cascade delete ← **Recommended**
3. Separate junction tables

---

### 8. MASTERY SCALE: LETTERS VS NUMBERS

**Status:** ⬜ Not Started

Workbook shows: `Novice (a, b, c, d, e) Master`

**Recommended:** Store INTEGER 1-5, display letters in UI

---

### 9. TOOL DIRECTIONS NEED REWORK

**Status:** ⬜ Not Started

Each tool spec needs:
- User-facing instructions
- Purpose statement
- Example usage
- Edge cases (empty state, max items)

**Action:** Review/enhance Component Spec Section 9

---

## Fix Priority Order

### Phase 1: Before Any Coding
1. ⬜ #4: Finalize color/font naming (blocks DB schema)
2. ⬜ #3: Fix z-index values (blocks CSS)
3. ⬜ #5: Fix breakpoints (blocks CSS)

### Phase 2: Before Tool Development
4. ⬜ #1: Decide on missing tools
5. ⬜ #9: Rework tool directions
6. ⬜ #6: Align DailyDoType with tool_types

### Phase 3: Before Content Loading
7. ⬜ #2: Complete connections audit (**MAJOR**)
8. ⬜ #8: Decide mastery scale storage

### Phase 4: Before Launch
9. ⬜ #7: Handle exercise_skills orphans

---

See **DreamTree_Spec_Fixes_Part2.md** for low-priority issues and changelog.


# DreamTree Spec Fixes Tracker — Part 2

> Continued from DreamTree_Spec_Fixes.md

---

## 🟢 Low Priority Issues (Nice to Fix)

### 10. TOOL_TYPES DUAL UNLOCK TRACKING

**Status:** ⬜ Not Started

Both track unlock relationships:
- `tool_types.unlocks_at_exercise`
- `exercise_sequence.unlocks_tool`

**Recommendation:** Document `exercise_sequence.unlocks_tool` as source of truth; other is denormalized convenience.

---

### 11. CONTENT_SOURCES NO FK VALIDATION

**Status:** ⬜ Not Started

`content_sources.exercise_id` is TEXT matching "1.1.1.v1" pattern — no FK constraint.

**Risk:** Typos won't be caught by database.

**Mitigation:** Validate in seed script.

---

### 12. PERSONALITY_TYPE SEED ORDER

**Status:** ⬜ Not Started

`user_settings.personality_type` FK → `personality_types.code`

**Ensure:** Seed `personality_types` BEFORE any user completes Module 1.1.2.

---

### 13. COMPETENCY COUNT VERIFICATION

**Status:** ⬜ Not Started

Spec says 15 competencies (6 + 5 + 4).

**Action:** Verify against actual OECD framework when extracting seed data.

---

### 14. CONNECTIONS CONFIG STRUCTURE UNDEFINED

**Status:** ⬜ Not Started

Project Summary says connections are "queries, not tables — defined in code at `/src/config/connections/`" but no schema specified.

**Action:** Design when building Phase 7.

---

### 15. HEADER AUTO-HIDE TIMING

**Status:** ✅ No Issue

Design System and Component Spec match (20s delay, 400ms out, 200ms in).

---

## Additional Issues from Review

### 16. FIVE MINDSETS DAILY REMINDER

**Status:** ⬜ Not Started

Workbook Module 1.5:
> "Finally, remember the five mindsets every day: Curiosity, Bias to action, Reframing, Awareness, Radical collaboration"

**Question:** Should this be a Daily Do item?

**Options:**
1. Add as non-tool Daily Do (reminder/affirmation)
2. Incorporate into dashboard greeting
3. Leave as workbook content only

---

### 17. FLOW STATE MAPPING TIE-THROUGH

**Status:** ⬜ Not Started

Workbook line ~2065:
> "Review the topics or situations which both energize and captivate you (from Exercise 1.3.2: Flow State Mapping)"

**Action:** Add to connections audit (Issue #2)

---

### 18. ROUTINE TRACKING TOOL

**Status:** ⬜ Not Started

Module 1.5.4:
> "Use the 'Routine' template (see Resources)"

No Routine Tracker in 10 tools list.

**Question:** Separate tool, part of Flow Tracker, or static template reference?

---

### 19. PART 1 ONGOING PRACTICES SUMMARY

**Status:** ⬜ Not Started

Workbook (line ~1587) lists ongoing practices:

| Practice | Source | Daily Time | Has Tool? |
|----------|--------|------------|-----------|
| Flow Tracking | 1.3.2c | 5 min | ✅ Flow Tracker |
| Skill Sharpening | 1.5.1b | 15+ min | ❌ Missing |
| Mindfulness | 1.5.3a | 5-20 min | ❌ Missing |
| Routine Tracking | 1.5.4a | 5 min | ❌ Missing |

**These should all map to tools or Daily Dos.**

---

## Connections Audit Worksheet

Use this to track the full connections audit (Issue #2):

| Connection # | From Exercise | To Exercise/Tool | Trigger | Surface Text | Status |
|--------------|---------------|------------------|---------|--------------|--------|
| 1 | | | | | ⬜ |
| 2 | | | | | ⬜ |
| 3 | | | | | ⬜ |
| 4 | | | | | ⬜ |
| 5 | | | | | ⬜ |
| 6 | | | | | ⬜ |
| 7 | | | | | ⬜ |
| 8 | | | | | ⬜ |
| 9 | | | | | ⬜ |
| 10 | | | | | ⬜ |
| 11 | | | | | ⬜ |
| 12 | | | | | ⬜ |
| 13 | | | | | ⬜ |
| 14 | | | | | ⬜ |
| + | | | | | ⬜ |

**Instructions:**
1. Search DreamTree.md for "from Exercise", "from Module", "Review your", "Remember when"
2. Fill in actual exercise IDs
3. Note what data needs to surface
4. Add any connections beyond 14

---

## Changelog

| Date | Change |
|------|--------|
| 2025-01-02 | Initial creation with 19 issues |

---

## Quick Reference: Exercise ID Format

```
"1.1.1.v1" = Part.Module.Exercise.Version

Part 1: Roots (Modules 1.1 - 1.5)
Part 2: Trunk (Modules 2.1 - 2.5)  
Part 3: Branches (Modules 3.1 - 3.5)
```

## Quick Reference: Module Contents

| Module | Title | Key Exercises |
|--------|-------|---------------|
| 1.1 | Work Factors 1 | Skills, Talents, MBTI |
| 1.2 | Work Factors 2 | Environment, People, Compensation/BATNA |
| 1.3 | Priorities & Flow | Flow State Mapping |
| 1.4 | Love | Family, Community, World, Self (PII) |
| 1.5 | Health | Skill Sharpening, Grit, Mindfulness, Routine |
| 2.1 | Finding the Light | Life Assessment, Values |
| 2.2 | Reality | Creator's Mentality, Reframing Failure |
| 2.3 | Landmarking | Idea Trees, Job Possibilities |
| 2.4 | Launching Pad | 5-Year Plans |
| 2.5 | Story Weaving | Competency Assessment, SOARED, Identity Story |
| 3.1 | Intentional Impressions | Job Posting Analysis, Resume Drafts |
| 3.2 | Constructing the Projection | Google, LinkedIn, Resume |
| 3.3 | Networking | Hidden Job Market, Conversations |
| 3.4 | Research | Company Investigation |
| 3.5 | Action | Active Networking |
