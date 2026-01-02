# DreamTree Database Schema Diagram (v2)

## Visual Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CORE TABLES                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌───────────────────┐
                                    │       users       │
                                    ├───────────────────┤
                                    │ id (PK, UUID)     │
                                    │ is_anonymous      │
                                    │ workbook_complete │
                                    │ created_at        │
                                    │ updated_at        │
                                    └─────────┬─────────┘
                                              │
           ┌──────────────┬───────────────────┼───────────────────┬──────────────┐
           │              │                   │                   │              │
           ▼              ▼                   ▼                   ▼              ▼
   ┌──────────────┐ ┌──────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────────────┐
   │    auth      │ │   emails     │ │   sessions    │ │ user_settings │ │ user_modules │
   ├──────────────┤ ├──────────────┤ ├───────────────┤ ├───────────────┤ ├──────────────┤
   │ id (PK)      │ │ id (PK)      │ │ id (PK,UUID)  │ │ user_id (PK)  │ │ user_id (PK) │
   │ user_id (FK) │ │ user_id (FK) │ │ user_id (FK)  │ │ bg_color      │ │ module_id(PK)│
   │ type         │ │ email        │ │ created_at    │ │ text_color    │ │ first_comp.  │
   │ password_hash│ │ is_active    │ │ last_seen_at  │ │ font          │ │ last_mod.    │
   │ wrapped_key  │ │ added_at     │ └───────────────┘ │ personality_  │ └──────────────┘
   │ created_at   │ └──────────────┘                   │   type (FK)───┼──────┐
   │ updated_at   │                                    │ created_at    │      │
   └──────────────┘                                    │ updated_at    │      │
                                                       └───────────────┘      │
                                                                              │
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   RESPONSE TABLES                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘

        users.id                        users.id                         users.id
            │                               │                                │
            ▼                               ▼                                ▼
 ┌─────────────────────┐        ┌─────────────────────┐        ┌─────────────────────────┐
 │ exercise_responses  │        │   tool_instances    │        │ user_competency_scores  │
 ├─────────────────────┤        ├─────────────────────┤        ├─────────────────────────┤
 │ id (PK, UUID)       │        │ id (PK, UUID)       │        │ id (PK, UUID)           │
 │ user_id (FK)        │        │ user_id (FK)        │        │ user_id (FK)            │
 │ part_id             │        │ tool_type (FK) ─────┼───┐    │ competency_id (FK) ─────┼───┐
 │ module_id           │        │ origin              │   │    │ score (1-5)             │   │
 │ exercise_id         │        │ content_json        │   │    │ assessed_at             │   │
 │ version             │        │ content_hash        │   │    └─────────────────────────┘   │
 │ full_exercise_id    │◄─"1.1.1.v1"                  │   │                                  │
 │ response_json       │        │ created_at          │   │                                  │
 │ responded_at        │        │ updated_at          │   │                                  │
 └──────────┬──────────┘        └─────────────────────┘   │                                  │
            │                                             │                                  │
            │           ┌─────────────────────┐           │                                  │
            │           │   exercise_skills   │           │                                  │
            │           ├─────────────────────┤           │                                  │
            └──────────►│ exercise_instance_id│           │                                  │
  (or tool_instances.id)│ skill_id (FK) ──────┼───────────┼──────────────────────────────┐   │
                        │ created_at          │           │                              │   │
                        └─────────────────────┘           │                              │   │
                                                          │                              │   │
┌─────────────────────────────────────────────────────────────────────────────────────────┐  │
│                                   CONTENT TABLES                                        │  │
└─────────────────────────────────────────────────────────────────────────────────────────┘  │
                                                          │                              │   │
 ┌─────────────────────┐                ┌─────────────────────┐                          │   │
 │  exercise_content   │                │  exercise_sequence  │                          │   │
 ├─────────────────────┤                ├─────────────────────┤                          │   │
 │ id (PK, UUID)       │                │ full_exercise_id(PK)│                          │   │
 │ part_id             │                │ part_id             │                          │   │
 │ module_id           │                │ module_id           │                          │   │
 │ exercise_id         │                │ exercise_id         │                          │   │
 │ version             │                │ version             │                          │   │
 │ full_exercise_id    │◄─── "1.1.1.v1" │ sequence_order      │                          │   │
 │ content_type        │                │ unlocks_tool (FK) ──┼───┐                      │   │
 │ content_text        │                │ is_required         │   │                      │   │
 │ display_order       │                └─────────────────────┘   │                      │   │
 │ is_active           │                                          │                      │   │
 │ variant_group       │                                          │                      │   │
 │ created_at          │                                          │                      │   │
 │ updated_at          │                                          │                      │   │
 └─────────────────────┘                                          │                      │   │
                                                                  │                      │   │
┌─────────────────────────────────────────────────────────────────────────────────────────┐  │
│                                  REFERENCE TABLES                                       │  │
└─────────────────────────────────────────────────────────────────────────────────────────┘  │
                                                                  │                      │   │
                                                                  │                      │   │
 ┌─────────────────────┐◄─────────────────────────────────────────┼──────────────────────┘   │
 │ personality_types   │  (user_settings.personality_type)        │                          │
 ├─────────────────────┤                                          │                          │
 │ code (PK)           │                                          │                          │
 │ name                │                                          │                          │
 │ summary             │                                          │                          │
 └─────────────────────┘                                          │                          │
                                                                  │                          │
 ┌─────────────────────┐◄─────────────────────────────────────────┼──────────────────────────┘
 │   competencies      │  (user_competency_scores.competency_id)  │
 ├─────────────────────┤                                          │
 │ id (PK, UUID)       │◄──────────────────────┐                  │
 │ name                │                       │                  │
 │ definition          │                       │                  │
 │ category            │                       │                  │
 │ sort_order          │                       │                  │
 │ relevant_modules    │                       │                  │
 └─────────────────────┘                       │                  │
                                               │                  │
 ┌─────────────────────┐                       │                  │
 │ competency_levels   │                       │                  │
 ├─────────────────────┤                       │                  │
 │ id (PK, UUID)       │                       │                  │
 │ competency_id (FK) ─┼───────────────────────┘                  │
 │ level (1-5)         │                                          │
 │ description         │                                          │
 │ job_context         │                                          │
 └─────────────────────┘                                          │
                                                                  │
 ┌─────────────────────┐◄─────────────────────────────────────────┘
 │      skills         │  (exercise_skills.skill_id)
 ├─────────────────────┤
 │ id (PK, UUID)       │
 │ name                │
 │ category            │
 │ is_custom           │
 │ created_by (FK) ────┼──► users.id (nullable)
 │ review_status       │
 │ created_at          │
 └─────────────────────┘

 ┌─────────────────────┐
 │     tool_types      │◄─────────────────────────────────────────┐
 ├─────────────────────┤  (tool_instances.tool_type)              │
 │ id (PK)             │  (exercise_sequence.unlocks_tool)        │
 │ singular_name       │                                          │
 │ plural_name         │                                          │
 │ icon_name           │                                          │
 │ has_reminder        │                                          │
 │ reminder_frequency  │  ◄── "daily" | "weekly" | "monthly"      │
 │ reminder_prompt     │                                          │
 │ unlocks_at_exercise │                                          │
 │ version             │                                          │
 │ is_active           │                                          │
 │ created_at          │                                          │
 │ updated_at          │                                          │
 └─────────────────────┘                                          │
                                                                  │
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ATTRIBUTION TABLES                                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────┐                            ┌─────────────────────┐
 │     references      │                            │   content_sources   │
 ├─────────────────────┤                            ├─────────────────────┤
 │ id (PK, UUID)       │◄───────────────────────────│ reference_id (FK)   │
 │ citation_number     │  (unique, for [n] links)   │ id (PK, UUID)       │
 │ author_surname      │  (for alpha sort)          │ exercise_id         │◄─── "1.1.1.v1"
 │ full_citation       │                            │ usage_type          │
 │ short_citation      │  (for tooltip)             │ notes               │
 │ category            │                            └─────────────────────┘
 │ metadata (JSON)     │
 │ created_at          │
 └─────────────────────┘
```

---

## Relationship Summary

### Foreign Key Relationships

| Child Table | Column | Parent Table | Column | On Delete |
|-------------|--------|--------------|--------|-----------|
| `auth` | `user_id` | `users` | `id` | CASCADE |
| `emails` | `user_id` | `users` | `id` | CASCADE |
| `sessions` | `user_id` | `users` | `id` | CASCADE |
| `user_settings` | `user_id` | `users` | `id` | CASCADE |
| `user_settings` | `personality_type` | `personality_types` | `code` | — |
| `user_modules` | `user_id` | `users` | `id` | CASCADE |
| `exercise_responses` | `user_id` | `users` | `id` | CASCADE |
| `tool_instances` | `user_id` | `users` | `id` | CASCADE |
| `tool_instances` | `tool_type` | `tool_types` | `id` | — |
| `user_competency_scores` | `user_id` | `users` | `id` | CASCADE |
| `user_competency_scores` | `competency_id` | `competencies` | `id` | — |
| `exercise_skills` | `skill_id` | `skills` | `id` | — |
| `competency_levels` | `competency_id` | `competencies` | `id` | — |
| `skills` | `created_by` | `users` | `id` | SET NULL |
| `exercise_sequence` | `unlocks_tool` | `tool_types` | `id` | — |
| `content_sources` | `reference_id` | `references` | `id` | — |

### Logical Relationships (No FK, Linked by ID Pattern)

| Table | Column | Links To | Pattern |
|-------|--------|----------|---------|
| `exercise_responses` | `full_exercise_id` | `exercise_content` | `"1.1.1.v1"` |
| `exercise_responses` | `full_exercise_id` | `exercise_sequence` | `"1.1.1.v1"` |
| `content_sources` | `exercise_id` | `exercise_content` | `"1.1.1.v1"` |
| `tool_instances` | `origin` | `exercise_sequence` | `"1.1.1.v1"` or `"standalone"` |
| `exercise_skills` | `exercise_instance_id` | `exercise_responses` or `tool_instances` | UUID |

---

## Table Count by Category

| Category | Count | Tables |
|----------|-------|--------|
| **Core** | 6 | users, auth, emails, sessions, user_settings, user_modules |
| **Response** | 4 | exercise_responses, tool_instances, user_competency_scores, exercise_skills |
| **Content** | 2 | exercise_content, exercise_sequence |
| **Reference** | 5 | personality_types, competencies, competency_levels, skills, tool_types |
| **Attribution** | 2 | references, content_sources |
| **Total** | **19** | |

---

## Data Flow

```
                              ┌──────────────────┐
                              │   New Visitor    │
                              └────────┬─────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │  Create: users   │
                              │  Create: sessions│
                              │  Create: settings│
                              └────────┬─────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
                    ▼                                     ▼
         ┌──────────────────┐                  ┌──────────────────┐
         │ Progress through │                  │  Claim Account   │
         │    exercises     │                  │  (email/pass)    │
         └────────┬─────────┘                  └────────┬─────────┘
                  │                                     │
                  ▼                                     ▼
         ┌──────────────────┐                  ┌──────────────────┐
         │ exercise_responses│                 │  Create: auth    │
         │ tool_instances   │                  │  Create: emails  │
         │ user_modules     │                  │  Update: users   │
         │ exercise_skills  │                  │   (is_anonymous) │
         └────────┬─────────┘                  └──────────────────┘
                  │
                  ▼
         ┌──────────────────┐
         │  Assessments     │
         │ (Module 1.1,     │
         │  Module 2.5.1)   │
         └────────┬─────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
 ┌──────────────┐   ┌───────────────────┐
 │user_settings │   │user_competency_   │
 │(personality_ │   │scores             │
 │ type)        │   │                   │
 └──────────────┘   └───────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              CONTENT SERVING FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘

  exercise_sequence                exercise_content               content_sources
  (what order?)                    (what to show?)                (what sources?)
        │                                │                              │
        │   sequence_order = N           │   full_exercise_id           │   exercise_id
        │                                │   content_type               │   reference_id
        ▼                                ▼   display_order              ▼
   ┌─────────┐                      ┌─────────┐                    ┌─────────┐
   │ Query   │ ──────────────────►  │ Render  │ ◄──────────────── │ Cite    │
   │ Next Ex │   full_exercise_id   │ Content │   attribution     │ Sources │
   └─────────┘                      └─────────┘                    └─────────┘
        │                                │                              │
        │   unlocks_tool                 │   user response              │  [n] tooltip
        ▼                                ▼                              ▼
   ┌─────────┐                      ┌─────────┐                    ┌─────────┐
   │ Unlock  │                      │ Store   │                    │references│
   │ Tool    │                      │ Response│                    │(short_  │
   └─────────┘                      └─────────┘                    │citation)│
        │                                │                         └─────────┘
        ▼                                ▼
   tool_types                       exercise_responses
   tool_instances                   user_modules


┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              DAILY DOS FLOW                                             │
└─────────────────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────┐
   │   tool_types    │
   │ (has_reminder,  │
   │  frequency)     │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐         ┌─────────────────┐
   │ Check: unlocked?│◄────────│exercise_sequence│
   │ (EXISTS query   │         │ (unlocks_tool)  │
   │  on responses)  │         └─────────────────┘
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐         ┌─────────────────┐
   │ Check: due?     │◄────────│ tool_instances  │
   │ (NOT EXISTS     │         │ (created_at)    │
   │  within period) │         └─────────────────┘
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │  DailyDoList    │
   │  component      │
   └─────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           COMPETENCY ASSESSMENT FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────┐         ┌─────────────────┐
   │  competencies   │────────►│competency_levels│
   │  (15 rows)      │         │  (75 rows)      │
   └────────┬────────┘         └────────┬────────┘
            │                           │
            │   definition              │   5 descriptions per
            ▼                           ▼
   ┌─────────────────────────────────────────────┐
   │        CompetencyLevelSelector              │
   │  (show definition, pick from 5 unlabeled)  │
   └────────────────────┬────────────────────────┘
                        │
                        │   score (1-5) × 15
                        ▼
   ┌─────────────────────────────────────────────┐
   │         user_competency_scores              │
   │  (user_id, competency_id, score)           │
   └────────────────────┬────────────────────────┘
                        │
                        │   calculate averages
                        ▼
   ┌─────────────────────────────────────────────┐
   │        CompetencyResultsDisplay             │
   │  • Category averages                        │
   │  • Overall level                            │
   │  • Strengths (score ≥ floor(avg + 0.3))    │
   │  • Improvements (score ≤ floor(avg - 0.3)) │
   └─────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              SKILLS TAGGING FLOW                                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────┐
   │     skills      │
   │ (master list +  │
   │  user custom)   │
   └────────┬────────┘
            │
            │   search / filter
            ▼
   ┌─────────────────┐         ┌─────────────────┐
   │  SkillsBrowser  │◄────────│ exercise_       │
   │  (tag picker)   │         │ responses or    │
   └────────┬────────┘         │ tool_instances  │
            │                  └─────────────────┘
            │   selected skill_ids
            ▼
   ┌─────────────────┐
   │ exercise_skills │
   │ (junction table)│
   └─────────────────┘
```

---

## Exercise ID Pattern

All exercise-related tables use a consistent ID pattern:

```
    1    .    1    .    1    .   v1
    │         │         │        │
    │         │         │        └── version (content version)
    │         │         │
    │         │         └── exercise_id (within module)
    │         │
    │         └── module_id (within part)
    │
    └── part_id (1, 2, or 3)


Examples:
  "1.1.1.v1"  = Part 1, Module 1, Exercise 1, Version 1
  "2.3.4.v2"  = Part 2, Module 3, Exercise 4, Version 2
  "3.5.2.v1"  = Part 3, Module 5, Exercise 2, Version 1
```

Tables using this pattern:
- `exercise_content.full_exercise_id`
- `exercise_sequence.full_exercise_id`
- `exercise_responses.full_exercise_id`
- `content_sources.exercise_id`
- `tool_instances.origin` (when not "standalone")

---

## Key Changes from v1

| Area | v1 | v2 |
|------|----|----|
| **Total tables** | 16 | 19 |
| **users** | — | Added `workbook_complete` |
| **user_settings** | — | Added `personality_type` FK |
| **Personality** | `mbti_types` (complex) | `personality_types` (simplified: code, name, summary) |
| **Competencies** | `competency_levels` (5 rows, JSON) | `competencies` (15 rows) + `competency_levels` (75 rows) |
| **Skills** | `skills_reference` | `skills` (+ custom skills support) |
| **Skill tagging** | — | New `exercise_skills` junction table |
| **Competency scores** | — | New `user_competency_scores` table |
| **Attribution** | `bibliography` | `references` (+ citation_number, short_citation) |
| **Tool reminders** | daily, weekly | daily, weekly, monthly |
| **Daily Dos SQL** | No unlock check | Includes unlock check |
