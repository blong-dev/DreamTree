# DreamTree Connections: Implementation Guide

**Purpose:** This document explains how data flows between activities in the DreamTree career development program. Use this alongside `DreamTree_Connections_Map.xlsx` to implement seamless form pre-population and data references throughout the app.

---

## Core Concept: What Are "Connections"?

Connections are instances where a user's input from an earlier activity should automatically appear, be referenced, or be selectable in a later activity. The goal is **zero redundant data entry** — if a user wrote three SOARED stories in Module 1.1, those exact stories should be available (not re-entered) when they're crafting their professional narrative in Module 2.5.

---

## The Five Connection Types

### 1. **Backward Reference**
The most common type. A later activity explicitly pulls data from an earlier one.

```
Example: Activity 1.1.2e asks users to "describe your top ten Transferable Skills (from Exercise 1.1.1)"

Implementation: 
- Fetch the user's ranked skills from Activity 1.1.1e
- Display them as a read-only list OR as the basis for a new input field
- User should NOT re-enter this data
```

### 2. **Forward Reference**
An early activity mentions that the data will be used later. This is informational for the user but critical for implementation planning.

```
Example: Activity 1.1.1c note says "You will use the SOARED framework throughout this program, particularly in Module 2.5"

Implementation:
- When building Module 2.5, know that SOARED stories from 1.1.1c are required inputs
- Design 1.1.1c's data structure with reuse in mind (structured fields, not just free text)
```

### 3. **Internal Reference**
An activity references another activity within the same module.

```
Example: Activity 1.1.1e pulls from Activities 1.1.1a-d (all within Module 1.1)

Implementation:
- Can often be handled with in-page state management
- Still needs persistence — user might leave and return
```

### 4. **Resource Reference**
An activity points to a static resource (tool, worksheet, framework).

```
Example: "Use the Ranking Grid (see Resources)" appears in 8+ activities

Implementation:
- Ranking Grid should be a reusable UI component, not a separate page
- Can be embedded inline or opened as a modal
- User's rankings should be captured and stored per-activity
```

### 5. **Framework Reference**
An activity uses a methodology defined elsewhere (like SOARED).

```
Example: Module 1.4 suggests "Consider telling your stories using the SOARED framework"

Implementation:
- Provide SOARED template as optional scaffolding
- Don't force structure, but make it available
```

---

## Critical Data Objects (Must Be Stored and Retrievable)

These are the primary data entities that flow through the program. **If these aren't properly stored and accessible, the connections break.**

### Tier 1: Foundational (Used 5+ Times)

| Data Object | Created In | Storage Priority | Data Structure |
|-------------|-----------|------------------|----------------|
| SOARED Stories (3) | 1.1.1c | CRITICAL | `{ situation: string, obstacle: string, action: string, result: string, evaluation: string, discovery: string }[]` |
| Top 10 Transferable Skills | 1.1.1e | CRITICAL | `{ skill: string, mastery: 'a'|'b'|'c'|'d'|'e', rank: 1-10 }[]` |
| Top 10 Soft Skills | 1.1.2d | CRITICAL | `{ skill: string, rank: 1-10 }[]` |
| Value Compass Statement | 2.1.3b | CRITICAL | `string` (brief statement) |
| Three Career Options | 2.3.3a | CRITICAL | `{ title: string, description: string, type: 'first'|'second'|'longshot' }[]` |
| Identity Story | 2.5.3a | CRITICAL | `string` (~1 page) |

### Tier 2: Important (Used 2-4 Times)

| Data Object | Created In | Storage Priority | Data Structure |
|-------------|-----------|------------------|----------------|
| MBTI Code | 1.1.2a | HIGH | `string` (4 chars, e.g., "ENFJ") |
| Job/Experience List | 1.1.1a | HIGH | `{ title: string, tasks: string[] }[]` |
| Flow Activities | 1.3.2a-c | HIGH | `{ activity: string, description: string, energy: -2 to 2, focus: 'v'|'w'|'x'|'y'|'z', isFlow: boolean }[]` |
| Work Factor Rankings | 1.3.1a | HIGH | `{ factor: string, rank: 1-5 }[]` (5 items) |
| Work Values Statement | 2.1.2a | HIGH | `string` |
| Life Values Statement | 2.1.2b | HIGH | `string` |
| Professional Headline | 3.1.2h | HIGH | `string` (6-12 words) |
| Professional Summary | 3.1.2e | HIGH | `string` (3-5 sentences) |
| Budget/BATNA | 1.2.4b | HIGH | `{ monthlyExpenses: number, annualExpenses: number, minimumHourly: number }` |

### Tier 3: Supporting (Used 1-2 Times)

| Data Object | Created In | Notes |
|-------------|-----------|-------|
| Top 10 Locations | 1.2.1e | Filters job searches |
| Ideal Workplace Description | 1.2.2b | Company evaluation |
| Ideal People Profile | 1.2.3c | Company culture evaluation |
| Knowledge Inventory | 1.1.3a-d | Resume/LinkedIn content |
| Three Idea Trees | 2.3.1a | Visual brainstorming tool |
| 5-Year Timelines (x3) | 2.4.1a | One per career option |
| Support Scores (x3) | 2.4.2a-c | Comparison metrics |
| Target Competency Level | 2.5.1a | Level 1-5, filters content |
| Professional Allegory | 2.5.3b | Interview prep reference |

---

## Ongoing Practices (Persistent Trackers)

These aren't one-time inputs — they're recurring activities that accumulate data over weeks.

| Practice | Frequency | Data Accumulates | Used By |
|----------|-----------|------------------|---------|
| Flow Tracking | Daily | List grows daily for weeks | 2.3.1a (filters to high-flow items) |
| Skill Sharpening | Daily | Log of practice sessions | Progress tracking |
| Mindfulness | Daily | Log of sessions | 3.3.2 (listening skill development) |
| Reframing Failure | Weekly | Log of failures + reframes | 3.5 daily checklist |
| Routine Tracking | Daily | Schedule adherence | Accountability |

**Implementation Note:** These need date-stamped entries and the ability to query aggregates (e.g., "show all activities with energy ≥ 1 and focus = 'z'").

---

## Module-by-Module Data Dependencies

### Part 1: Roots
```
1.1 ← (none, this is the start)
1.2 ← 1.1 (job list, stories)
1.3 ← 1.1, 1.2 (all significant events, work factors)
1.4 ← 1.1 (SOARED framework optional)
1.5 ← 1.1, 1.3 (top skills, flow activities)
```

### Part 2: Trunk
```
2.1 ← Part 1 entire (summary of all four life areas)
2.2 ← (conceptual, no direct data pulls)
2.3 ← 1.3 (flow activities → idea tree starting words)
2.4 ← 2.3, 2.1 (three career options, values for coherence check)
2.5 ← 2.1, Part 1 (value compass, roots for story)
```

### Part 3: Branches
```
3.1 ← 2.3, Part 1, 2.5 (career options, roots, identity story)
3.2 ← 2.5, 3.1 (identity story, headline, keywords)
3.3 ← 2.2, 1.5, 2.1, 3.2 (mindsets, mindfulness, values, LinkedIn)
3.4 ← 3.3 (networking techniques)
3.5 ← 3.3, 1.3, 1.5, 2.2 (everything for daily action)
```

---

## Implementation Patterns

### Pattern 1: Pre-Population
When an activity explicitly references prior data, pre-fill the form.

```javascript
// Example: Activity 1.1.2e needs Top 10 Transferable Skills from 1.1.1e
const topSkills = await getUserData('activity_1_1_1e_top_skills');
// Display as read-only list that user annotates with soft skills
```

### Pattern 2: Selection from Prior Data
When user needs to choose from their own prior inputs.

```javascript
// Example: Activity 2.3.1a - select starting words from flow activities
const flowActivities = await getUserData('exercise_1_3_2_flow_activities');
const highFlowItems = flowActivities.filter(a => a.energy >= 1 && a.focus >= 'y');
// Present as selectable list, user picks 3 as tree starting words
```

### Pattern 3: Reference Display
Show prior data as context, but don't require interaction.

```javascript
// Example: Activity 2.5.2a shows Value Compass as reminder
const valueCompass = await getUserData('activity_2_1_3b_value_compass');
// Display in sidebar or header: "Your Light: {valueCompass}"
```

### Pattern 4: Aggregation
Combine data from multiple sources.

```javascript
// Example: Activity 1.3.2a needs "all significant events from 1.1 and 1.2"
const skillsEvents = await getUserData('activity_1_1_1a_jobs');
const skillsStories = await getUserData('activity_1_1_1b_stories');
const locationHistory = await getUserData('activity_1_2_1b_places_lived');
const workHistory = await getUserData('activity_1_2_2a_workplace_history');
// Combine into unified list for flow rating
```

### Pattern 5: Cascade Updates
When foundational data changes, downstream data may need refresh flags.

```javascript
// Example: User edits their Top 10 Skills in 1.1.1e
// Flag dependent activities for potential review:
// - 1.1.2e (skills description)
// - 1.5.1a (skill selection)
// - Resume content
// - LinkedIn content
```

---

## Reusable UI Components

Based on the connection patterns, you'll need these components:

### 1. Ranking Grid
Used in: 1.1.1e, 1.1.2d, 1.2.1b, 1.2.1d, 1.3.1a, 3.1.2b (and more)

**Behavior:** Takes a list of 10 items, lets user drag/compare to establish rank order 1-10.

### 2. SOARED Story Editor
Used in: 1.1.1c, referenced in 1.4, 2.5.3a, 2.5.3b, networking

**Behavior:** Structured form with 6 fields (S/O/A/R/E/D). Save as structured object, not blob.

### 3. Flow Tracker
Used in: 1.3.2a, 1.3.2b, 1.3.2c (ongoing), 3.5 daily checklist

**Behavior:** Activity name, description, energy slider (-2 to +2), focus slider (5 levels), flow checkbox. Date-stamped.

### 4. Mastery Rating
Used in: 1.1.1a, 1.1.1d, 1.1.3d

**Behavior:** 5-level scale (a through e, Novice to Master). Attach to skill/knowledge items.

### 5. Career Option Card
Used in: 2.3.3a, 2.4.1a, 2.4.2a-c, 2.4.3a-c, 3.1.1a

**Behavior:** Displays one of three career options with title, description, timeline, scores. Toggle between options.

### 6. Value Compass Display
Used in: 2.5.2a, 2.5.2b, 3.3.4a (and as ambient reminder)

**Behavior:** Read-only display of user's value compass statement. Consider showing in header/sidebar throughout Parts 2-3.

---

## Testing Connections

For each connection in the spreadsheet, verify:

1. **Data exists:** User completed source activity
2. **Data retrieves:** API returns expected structure
3. **Data displays:** Target activity shows source data correctly
4. **Data is usable:** User can work with (not just view) the data
5. **Edits cascade:** If source changes, target reflects update (or flags for review)

### Critical Path Test
Complete this sequence and verify data flows:

```
1.1.1a-e → Check skills appear in 1.1.2e
1.1.2a → Check MBTI code filters personality resources
1.3.2 → Check high-flow activities appear in 2.3.1a
2.1.3b → Check value compass appears in 2.5.2a context
2.3.3a → Check three options populate 2.4.1a
2.5.3a → Check identity story appears in 3.2.2d
3.1.2h → Check headline populates 3.2.4b
```

---

## Edge Cases

### User Skips an Activity
Some connections are required, others are enrichment. Define fallbacks:
- **Required:** Block progress until source is complete
- **Optional:** Show placeholder ("Complete [Activity X] to see suggestions here")

### User Revises Earlier Data
Decide policy per connection:
- **Auto-update:** Downstream data refreshes automatically
- **Flag for review:** Alert user that dependent content may need revision
- **Snapshot:** Downstream keeps original (for historical integrity)

### Multiple Career Options
Many Part 2 and Part 3 activities create data **per career option**. Data structure must support:
```javascript
{
  careerOption1: { timeline: {...}, scores: {...}, questions: [...] },
  careerOption2: { timeline: {...}, scores: {...}, questions: [...] },
  careerOption3: { timeline: {...}, scores: {...}, questions: [...] }
}
```

---

## Quick Reference: Heaviest Data Flows

If you're prioritizing implementation, focus on these connections first:

| Priority | Connection | Impact |
|----------|------------|--------|
| 1 | 1.1.1c SOARED → 2.5.3a/b Stories | Core narrative engine |
| 2 | 1.3.2 Flow → 2.3.1a Idea Trees | Career direction logic |
| 3 | 2.3.3a Options → All of Part 3 | Primary navigation structure |
| 4 | 2.1.3b Compass → Parts 2-3 ambient | Consistent value alignment |
| 5 | 3.1.2h Headline → 3.2.2d, 3.2.4b | Profile consistency |
| 6 | 1.1.1e Skills → 1.1.2e, Resume, LinkedIn | Professional presentation |
| 7 | Part 1 Roots → 3.1.2b Credibility | Content foundation |

---

## For AI Agents (Claude Code, etc.)

When implementing a specific activity:

1. **Check the spreadsheet** for that activity's row(s)
2. **Identify source activities** — what data needs to be fetched?
3. **Identify target activities** — what data does this activity produce that others will need?
4. **Design data structure** with downstream use in mind
5. **Implement retrieval** before building the form
6. **Test the chain** — complete a user journey through connected activities

When you see instructions like "refer to Exercise X.X.X" or "from Activity X.X.Xa" in the spec, that's a connection. Look it up in the spreadsheet for implementation details.

---

## Appendix: Spreadsheet Column Reference

**Connections Map (Sheet 1):**
- Connection ID: Unique identifier (C001-C061)
- Source Activity: Where the connection instruction appears
- Source Location: Module containing the instruction
- Target Activity: Where the referenced data lives
- Target Location: Module containing the data
- Connection Type: Backward/Forward/Internal/Resource/Framework
- Data Being Referenced: What specific data to pull
- Implementation Notes: Exact text from spec + line number

**Key Data Objects (Sheet 4):**
- Data Object: Name of the data entity
- Created In: Activity where user enters this data
- Reused In: All activities that reference this data
- Data Type: Suggested storage format
- App Implementation Notes: How to handle in UI/UX

---

*Document Version: 1.0*
*Companion to: DreamTree_Connections_Map.xlsx*
*For: DreamTree App Development*
