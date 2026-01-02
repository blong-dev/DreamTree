# DreamTree Database Schema Diagram

## Visual Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CORE TABLES                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────────────┐
                                    │     users       │
                                    ├─────────────────┤
                                    │ id (PK, UUID)   │
                                    │ is_anonymous    │
                                    │ created_at      │
                                    │ updated_at      │
                                    └────────┬────────┘
                                             │
           ┌──────────────┬──────────────────┼──────────────────┬──────────────┐
           │              │                  │                  │              │
           ▼              ▼                  ▼                  ▼              ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │    auth      │ │   emails     │ │  sessions    │ │user_settings │ │ user_modules │
   ├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
   │ id (PK)      │ │ id (PK)      │ │ id (PK,UUID) │ │ user_id (PK) │ │ user_id (PK) │
   │ user_id (FK) │ │ user_id (FK) │ │ user_id (FK) │ │ bg_color     │ │ module_id(PK)│
   │ type         │ │ email        │ │ created_at   │ │ text_color   │ │ first_comp.  │
   │ password_hash│ │ is_active    │ │ last_seen_at │ │ font         │ │ last_mod.    │
   │ wrapped_key  │ │ added_at     │ └──────────────┘ │ created_at   │ └──────────────┘
   │ created_at   │ └──────────────┘                  │ updated_at   │
   │ updated_at   │                                   └──────────────┘
   └──────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   RESPONSE TABLES                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘

          users.id                                           users.id
              │                                                   │
              ▼                                                   ▼
   ┌─────────────────────┐                            ┌─────────────────────┐
   │ exercise_responses  │                            │   tool_instances    │
   ├─────────────────────┤                            ├─────────────────────┤
   │ id (PK, UUID)       │                            │ id (PK, UUID)       │
   │ user_id (FK)        │                            │ user_id (FK)        │
   │ part_id             │                            │ tool_type (FK) ─────┼──────┐
   │ module_id           │                            │ origin              │      │
   │ exercise_id         │                            │ content_json        │      │
   │ version             │                            │ content_hash        │      │
   │ full_exercise_id    │◄─── "1.1.1.v1"             │ created_at          │      │
   │ response_json       │                            │ updated_at          │      │
   │ responded_at        │                            └─────────────────────┘      │
   └─────────────────────┘                                                         │
                                                                                   │
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CONTENT TABLES                                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────┐                            ┌─────────────────────┐
   │  exercise_content   │                            │  exercise_sequence  │
   ├─────────────────────┤                            ├─────────────────────┤
   │ id (PK, UUID)       │                            │ full_exercise_id(PK)│
   │ part_id             │                            │ part_id             │
   │ module_id           │                            │ module_id           │
   │ exercise_id         │                            │ exercise_id         │
   │ version             │                            │ version             │
   │ full_exercise_id    │◄─── "1.1.1.v1"             │ sequence_order      │
   │ content_type        │                            │ unlocks_tool (FK) ──┼──────┐
   │ content_text        │                            │ is_required         │      │
   │ display_order       │                            └─────────────────────┘      │
   │ is_active           │                                                         │
   │ variant_group       │                                                         │
   │ created_at          │                                                         │
   │ updated_at          │                                                         │
   └─────────────────────┘                                                         │
                                                                                   │
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                  REFERENCE TABLES                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                                                                   │
   ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐   │
   │    mbti_types       │    │  competency_levels  │    │   skills_reference  │   │
   ├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤   │
   │ code (PK)           │    │ id (PK, 1-5)        │    │ id (PK, UUID)       │   │
   │ name                │    │ title               │    │ name                │   │
   │ description         │    │ description         │    │ category            │   │
   │ strengths (JSON)    │    │ delivery_comp(JSON) │    │ subcategory         │   │
   │ weaknesses (JSON)   │    │ interpers_comp(JSON)│    │ description         │   │
   │ career_insights     │    │ strategic_comp(JSON)│    │ version             │   │
   │ version             │    │ version             │    │ is_active           │   │
   │ is_active           │    │ is_active           │    │ created_at          │   │
   │ created_at          │    │ created_at          │    │ updated_at          │   │
   │ updated_at          │    │ updated_at          │    └─────────────────────┘   │
   └─────────────────────┘    └─────────────────────┘                              │
                                                                                   │
                              ┌─────────────────────┐                              │
                              │     tool_types      │◄─────────────────────────────┘
                              ├─────────────────────┤    (tool_instances.tool_type)
                              │ id (PK)             │    (exercise_sequence.unlocks_tool)
                              │ singular_name       │
                              │ plural_name         │
                              │ icon_name           │
                              │ has_reminder        │
                              │ reminder_frequency  │
                              │ reminder_prompt     │
                              │ unlocks_at_exercise │
                              │ version             │
                              │ is_active           │
                              │ created_at          │
                              │ updated_at          │
                              └─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ATTRIBUTION TABLES                                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────┐                            ┌─────────────────────┐
   │    bibliography     │                            │   content_sources   │
   ├─────────────────────┤                            ├─────────────────────┤
   │ id (PK, UUID)       │◄───────────────────────────│ bib_id (FK)         │
   │ entry_type          │                            │ id (PK, UUID)       │
   │ citation            │                            │ exercise_id         │◄─── "1.1.1.v1"
   │ author              │                            │ usage_type          │
   │ title               │                            │ notes               │
   │ year                │                            └─────────────────────┘
   │ source_details(JSON)│
   │ influence_areas(JSON│
   │ notes               │
   │ version             │
   │ is_active           │
   │ created_at          │
   │ updated_at          │
   └─────────────────────┘
```

---

## Relationship Summary

### Foreign Key Relationships

| Child Table | Column | Parent Table | Column |
|-------------|--------|--------------|--------|
| `auth` | `user_id` | `users` | `id` |
| `emails` | `user_id` | `users` | `id` |
| `sessions` | `user_id` | `users` | `id` |
| `user_settings` | `user_id` | `users` | `id` |
| `user_modules` | `user_id` | `users` | `id` |
| `exercise_responses` | `user_id` | `users` | `id` |
| `tool_instances` | `user_id` | `users` | `id` |
| `tool_instances` | `tool_type` | `tool_types` | `id` |
| `exercise_sequence` | `unlocks_tool` | `tool_types` | `id` |
| `content_sources` | `bib_id` | `bibliography` | `id` |

### Logical Relationships (No FK, Linked by ID Pattern)

| Table | Column | Links To | Pattern |
|-------|--------|----------|---------|
| `exercise_responses` | `full_exercise_id` | `exercise_content` | `"1.1.1.v1"` |
| `exercise_responses` | `full_exercise_id` | `exercise_sequence` | `"1.1.1.v1"` |
| `content_sources` | `exercise_id` | `exercise_content` | `"1.1.1.v1"` |
| `tool_instances` | `origin` | `exercise_sequence` | `"1.1.1.v1"` or `"standalone"` |

---

## Table Count by Category

| Category | Count | Tables |
|----------|-------|--------|
| **Core** | 6 | users, auth, emails, sessions, user_settings, user_modules |
| **Response** | 2 | exercise_responses, tool_instances |
| **Content** | 2 | exercise_content, exercise_sequence |
| **Reference** | 4 | mbti_types, competency_levels, skills_reference, tool_types |
| **Attribution** | 2 | bibliography, content_sources |
| **Total** | **16** | |

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
         └──────────────────┘                  │   (is_anonymous) │
                                               └──────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              CONTENT SERVING FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘

  exercise_sequence                exercise_content               content_sources
  (what order?)                    (what to show?)                (what sources?)
        │                                │                              │
        │   sequence_order = N           │   full_exercise_id           │   exercise_id
        │                                │   content_type               │   bib_id
        ▼                                ▼   display_order              ▼
   ┌─────────┐                      ┌─────────┐                    ┌─────────┐
   │ Query   │ ──────────────────►  │ Render  │ ◄──────────────── │ Cite    │
   │ Next Ex │   full_exercise_id   │ Content │   attribution     │ Sources │
   └─────────┘                      └─────────┘                    └─────────┘
        │                                │
        │   unlocks_tool                 │   user response
        ▼                                ▼
   ┌─────────┐                      ┌─────────┐
   │ Unlock  │                      │ Store   │
   │ Tool    │                      │ Response│
   └─────────┘                      └─────────┘
        │                                │
        ▼                                ▼
   tool_types                       exercise_responses
   tool_instances                   user_modules
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
