# Master Editing Guide for The Dream Tree Workbook
## Webapp Conversion & Citation Implementation

---

## Overview

This guide provides the systematic approach for converting the workbook from a week-based structure to a part/module/exercise structure, while adding proper citations and maintaining content integrity.

---

## Phase 1: Structural Changes

### Terminology Replacements

**Global Find & Replace:**

| OLD | NEW | Context |
|-----|-----|---------|
| Week 1 | Part 1 | Always |
| Week 2 | Part 2 | Always |
| Week 3 | Part 3 | Always |
| Day 1 | Module 1 | Within each part |
| Day 2 | Module 2 | Within each part |
| Day 3 | Module 3 | Within each part |
| Day 4 | Module 4 | Within each part |
| Day 5 | Module 5 | Within each part |
| week one | Part 1 | Always (case variations) |
| this week | this part | Context dependent |
| last week | the previous part | Context dependent |
| next week | the next part | Context dependent |

### Cross-Reference Updates

**Pattern Recognition and Replacement:**

**OLD FORMAT:**
```
"Recall from Week 1, Day 3..."
"See Day 1 of this week..."
"You completed this in Week 2..."
"Refer back to your roots in week one..."
```

**NEW FORMAT:**
```
"Recall from Part 1, Module 3 (Flow State Mapping)..."
"See Module 1 of this part..."
"You completed this in Part 2..."
"Refer back to your roots in Part 1..."
```

**Specific Cross-Reference Patterns:**

1. **Forward References:**
   - OLD: "We will discuss this more in Week 3"
   - NEW: "We will discuss this more in Part 3, Module 3 (Networking)"

2. **Backward References:**
   - OLD: "Remember from Day 1"
   - NEW: "Remember from Module 1 (Skills and Talents)"

3. **Same-Part References:**
   - OLD: "See Day 1 of this week"
   - NEW: "See Module 1 of this part"

4. **General References:**
   - OLD: "throughout this program"
   - NEW: "throughout this program" (no change)

---

## Phase 2: Exercise Numbering System

### Naming Convention

**Format:** `[PART].[MODULE].[EXERCISE].[ACTIVITY]`

**Examples:**
- Part 1, Module 1, Exercise 1 = **1.1.1**
- Part 1, Module 1, Exercise 1, Activity a = **1.1.1a**
- Part 2, Module 3, Exercise 2, Activity d = **2.3.2d**

### Implementation Rules

1. **Major Sections** (like "Transferable Skills") = **Exercise**
   - Format: "Exercise 1.1.1: Transferable Skills Inventory"

2. **Numbered Subsections** (1, 2, 3...) within exercises = **Activity**
   - Format: "Activity 1.1.1a: Professional Talents Audit"

3. **Lettered Subsections** (a, b, c...) = **Sub-activity**
   - Keep as lowercase letters under activities

### Application Examples

**BEFORE:**
```
I    Transferable Skills
1. Record any talent you have used professionally.
a) List every job you have had...
```

**AFTER:**
```
Exercise 1.1.1: Transferable Skills Inventory

Activity 1.1.1a: Professional Talents Audit
1. Record any talent you have used professionally.
   a) List every job you have had...
```

---

## Phase 3: Citation Implementation

### Citation Placement Rules

**Rule 1: Cite at First Mention**
- First time a concept/framework is introduced = footnote required
- Subsequent mentions = use same footnote number

**Rule 2: Citation Density**
- Heavy citation sections: Module introductions, framework explanations
- Light citation sections: Exercises, personal worksheets
- No citation needed: Your original content, instructions, examples

**Rule 3: Superscript Format**
- Superscript number after relevant sentence
- Before punctuation: "concept.¹" not "concept¹."
- Multiple sources: "concept.¹,²"

### Specific Citation Locations

**PART 1 CITATIONS:**

**Module 1.1 (Skills and Talents):**
```
"According to researcher Sydney Fine, skills can be broken down into 
three categories: Knowledges, Self-management, and Transferable Skills.¹"

[Footnote 1: Fine, Sydney A. "Functional Job Analysis Scales: A Desk Aid." 
Milwaukee: Sidney A. Fine Associates, 1989.]
```

```
"We will be using an adaptation of Myers-Briggs² as a tool..."

[Footnote 2: Myers-Briggs Type Indicator. Developed by Katharine Cook 
Briggs and Isabel Briggs Myers. Based on Carl Jung's theory of 
psychological types.]
```

**Module 1.3 (Flow):**
```
"Recall from Exercise 1.3.2 that engagement is our measure for flow, 
which is when people are at their best and most productive.³"

[Footnote 3: Csikszentmihalyi, Mihaly. *Flow: The Psychology of Optimal 
Experience.* New York: Harper & Row, 1990. The Flow Tracking Methodology 
used in this program is an adaptation created by Braedon Long.]
```

**Module 1.5 (Health):**
```
"While looking for something more practical, I came upon the 'designer 
mindset' laid out by Bill Burnett in his book *Designing Your Life*.⁴"

[Footnote 4: Burnett, Bill, and Dave Evans. *Designing Your Life: How to 
Build a Well-Lived, Joyful Life.* New York: Alfred A. Knopf, 2016.]
```

**PART 2 CITATIONS:**

**Module 2.5 (Story Weaving):**
```
"According to Stephen Denning's storytelling framework, your story should 
demonstrate relevance, clarity, distinctiveness, and consistency.⁵"

[Footnote 5: Denning, Stephen. *The Leader's Guide to Storytelling: 
Mastering the Art and Discipline of Business Narrative.* San Francisco: 
Jossey-Bass, 2005.]
```

```
"People generally love a hero's tale. The wonder and inspiration 
encapsulated by venturing into the unknown, overcoming a series of trials, 
suffering a significant loss, overcoming odds, and returning to face the 
world born anew are classic and effective.⁶"

[Footnote 6: Campbell, Joseph. *The Hero with a Thousand Faces.* 
Princeton: Princeton University Press, 1949.]
```

**PART 3 CITATIONS:**

**Module 3.3 (Networking):**
```
"The most effective job search strategy is informational interviewing—
networking conversations with professionals in your target field.⁷"

[Footnote 7: Bolles, Richard N. *What Color Is Your Parachute? A Practical 
Manual for Job-Hunters and Career-Changers.* Berkeley: Ten Speed Press.]
```

```
"Of all the great advice out there, I have found that Celeste Headlee 
covers the most critical aspects with her list of ten guidelines to 
conversations and interviews.⁸"

[Footnote 8: Headlee, Celeste. *We Need to Talk: How to Have Conversations 
That Matter.* New York: Harper Wave, 2017.]
```

---

## Phase 4: Section-by-Section Editing Workflow

### For Each Module:

**Step 1: Structure**
- [ ] Replace week/day terminology
- [ ] Add module header with number and name
- [ ] Add module overview/purpose statement

**Step 2: Exercises**
- [ ] Identify major sections → convert to numbered exercises
- [ ] Format as "Exercise X.X.X: [Name]"
- [ ] Add exercise descriptions where helpful

**Step 3: Activities**
- [ ] Identify numbered items (1, 2, 3...) → convert to activities
- [ ] Format as "Activity X.X.Xa: [Descriptive Name]"
- [ ] Keep lettered sub-items as they are

**Step 4: Cross-References**
- [ ] Find all week/day references
- [ ] Update to part/module format
- [ ] Add specific exercise names in parentheses

**Step 5: Citations**
- [ ] Identify borrowed concepts
- [ ] Add superscript footnote numbers
- [ ] Create footnote section at module end

**Step 6: Original Framework Notes**
- [ ] Mark SOARED, Flow Tracking, etc. as original
- [ ] Add brief footnote crediting your authorship

---

## Phase 5: Quality Control Checklist

### Structural Integrity
- [ ] All "week" references updated to "part"
- [ ] All "day" references updated to "module"
- [ ] Exercise numbering is sequential and correct
- [ ] Cross-references point to correct locations
- [ ] No broken references (e.g., "see Day 1" without context)

### Citation Accuracy
- [ ] First mentions have footnotes
- [ ] Footnote numbers are sequential within each module
- [ ] All borrowed concepts are cited
- [ ] Original frameworks are marked as such
- [ ] Bibliography matches all citations

### Formatting Consistency
- [ ] Headers follow hierarchy (Part > Module > Exercise > Activity)
- [ ] Numbering is consistent (1.1.1, 1.1.2, etc.)
- [ ] Footnote formatting is uniform
- [ ] Emphasis (bold, italic) is consistent

### Content Preservation
- [ ] No content has been accidentally deleted
- [ ] All worksheets/tools are still referenced
- [ ] Instructions remain clear
- [ ] Examples are intact

---

## Phase 6: Special Handling Cases

### Case 1: SOARED Framework
Every mention of SOARED should include a note on first use:

```
"Choose the three most impactful stories and describe these events using 
the SOARED framework: Situation, Obstacle, Action, Results, Evaluation, 
Discovery."

[Note: SOARED Framework is an original tool created by Braedon Long for 
this program.]
```

### Case 2: Flow Tracking
First mention should credit both Csikszentmihalyi and your adaptation:

```
"The Flow Tracking Methodology³ is an adaptation of Mihaly 
Csikszentmihalyi's flow theory, created by Braedon Long."
```

### Case 3: Headlee's 10 Principles
Each principle needs individual citation:

```
**1. Don't Multitask⁸**
[full explanation]

**2. Don't Pontificate⁸**
[full explanation]
```

Or use abbreviated format:
```
Celeste Headlee's conversation principles⁸ include:
1. Don't Multitask
2. Don't Pontificate
[etc.]
```

### Case 4: Multiple Influences
When multiple sources inform one concept:

```
"The most fulfilling lives align work values with life values.⁴,⁵"

[Footnote 4: Burnett & Evans, *Designing Your Life*]
[Footnote 5: Caligiuri, *Get a Life, Not a Job*]
```

---

## Phase 7: Webapp-Specific Considerations

### Interactive Elements
- Consider making footnotes expandable/hoverable
- Link cross-references to actual modules
- Add progress tracking for exercises
- Include estimated time per activity

### Navigation Structure
```
Part 1: Roots
├── Module 1.1: Work Factors 1
│   ├── Exercise 1.1.1: Transferable Skills
│   │   ├── Activity 1.1.1a: Professional Talents Audit
│   │   ├── Activity 1.1.1b: Challenge Stories
│   │   └── Activity 1.1.1c: SOARED Stories
│   ├── Exercise 1.1.2: Self-Management Skills
│   └── Exercise 1.1.3: Knowledge Audit
├── Module 1.2: Work Factors 2
└── [etc.]
```

### Bibliography Page
- Create separate "Credits & Sources" page
- Make citations clickable to jump to bibliography
- Include purchase links for referenced books
- Add "Further Reading" section

---

## Complete Footnote Number Assignment

### Part 1: Roots

**Module 1.1:**
1. Fine (skills categorization)
2. Myers-Briggs Type Indicator
3. 16Personalities.com
4. Tieger & Barron-Tieger

**Module 1.2:**
5. Caligiuri (life-work integration)
6. Burnett & Evans (first mention in this module if not earlier)

**Module 1.3:**
7. Csikszentmihalyi (Flow)

**Module 1.4:**
8. Burnett & Evans (four life categories)
9. Seligman (flourishing)

**Module 1.5:**
10. Burnett & Evans (designer mindsets) [or use existing number]
11. Duckworth (grit)
12. Grover (relentless)

### Part 2: Trunk

**Module 2.1:**
13. Burnett & Evans (values alignment) [or use existing]
14. Caligiuri [or use existing]

**Module 2.2:**
15. Burnett & Evans (reframing, mindsets) [or use existing]

**Module 2.3:**
16. Blake (pivot)

**Module 2.4:**
17. Blake [use same as above]

**Module 2.5:**
18. OECD (competency framework)
19. Denning (storytelling)
20. Campbell (hero's journey)
21. Slim (body of work)

### Part 3: Branches

**Module 3.1:**
22. Bolles (job search)

**Module 3.2:**
23. Bolles [use same]

**Module 3.3:**
24. Bolles (informational interviewing) [use same]
25. Burnett & Evans (mindsets) [use existing]
26. Headlee (conversation)
27. Granovetter (weak ties)
28. Campbell (authentic story) [use existing]
29. Banayan (third door)
30. Gladwell (tipping point)

**Note:** Reuse footnote numbers when citing the same source multiple times.

---

## Timeline & Workflow

### Recommended Editing Sequence:

**Day 1:**
- Review this guide completely
- Set up document structure
- Create footnote master list

**Day 2-3:**
- Edit Part 1 (Roots)
- All 5 modules with citations
- Quality control Part 1

**Day 4-5:**
- Edit Part 2 (Trunk)
- All 5 modules with citations
- Quality control Part 2

**Day 6-7:**
- Edit Part 3 (Branches)
- All 5 modules with citations
- Quality control Part 3

**Day 8:**
- Final review
- Verify all cross-references
- Compile complete bibliography
- Create Credits & Sources page

---

## Output Files Structure

```
/outputs/
├── PART_1_ROOTS_EDITED.md
├── PART_2_TRUNK_EDITED.md
├── PART_3_BRANCHES_EDITED.md
├── INTRO_AND_CONTENTS_EDITED.md
├── COMPLETE_BIBLIOGRAPHY.md
├── CREDITS_AND_SOURCES.md
└── EDITING_LOG.md (track all changes)
```

---

## Sample Before/After

### BEFORE:
```
Roots
Understanding Your Foundation

Day 1 – Work Factors 1
Skills and Talents
Skills are the most basic unit of performance. Most people think their 
skills are limited to specific work situations. The goal of this exercise 
is for you to take full stock of all of your skills, take note of the 
ones you enjoy the most, and to present them professionally. 

According to researcher Sydney Fine, skills can be broken down into three 
categories: Knowledges, Self-management, and Transferable Skills.

I    Transferable Skills
1. Record any talent you have used professionally.
a) List every job you have had...
```

### AFTER:
```
# Part 1: Roots
## Understanding Your Foundation

---

## Module 1.1: Work Factors 1

### Overview
This module focuses on identifying and cataloging your skills, talents, 
and knowledge. You will create a comprehensive inventory of your 
capabilities across three categories: transferable skills, self-management 
skills, and knowledges.

**Estimated Time:** 2-3 hours  
**Outputs:** Top 10 transferable skills, Top 10 soft skills, knowledge 
inventory with mastery ratings

---

### Skills and Talents

Skills are the most basic unit of performance. Most people think their 
skills are limited to specific work situations. The goal of this exercise 
is for you to take full stock of all of your skills, take note of the 
ones you enjoy the most, and to present them professionally.

According to researcher Sydney Fine, skills can be broken down into three 
categories: Knowledges, Self-management, and Transferable Skills.¹

**Knowledges** are the topics you know, generally nouns.  
*Example: Spanish, chemical engineering, graphic design*

**Self-management skills** describe the way you do your work, generally 
adjectives/adverbs.  
*Example: Relentless, innovative, meticulous*

**Transferable skills** are the things you can do, generally verbs.  
*Example: Teach, paint, repair, negotiate*

---

#### Exercise 1.1.1: Transferable Skills Inventory

**Purpose:** Identify and rank your transferable skills through 
professional reflection and story analysis.

**Activity 1.1.1a: Professional Talents Audit**

1. Record any talent you have used professionally.
   
   a) List every job you have had, every significant project you have 
      completed, and every important course you have taken.
   
   [workspace provided]

---

### Footnotes

1. Fine, Sydney A. "Functional Job Analysis Scales: A Desk Aid." 
   Milwaukee: Sidney A. Fine Associates, 1989.
```

---

## Special Instructions for AI/Human Editor

1. **Preserve Voice:** Maintain Braedon's conversational, encouraging tone
2. **Keep Examples:** Don't remove the helpful examples throughout
3. **Maintain Worksheets:** All blank spaces for user input must remain
4. **Cross-Check:** Verify every cross-reference actually exists
5. **Citation Context:** Make sure citations flow naturally in sentences

---

**Guide Version:** 1.0  
**Created:** [Date]  
**For:** Complete workbook editing and webapp conversion
