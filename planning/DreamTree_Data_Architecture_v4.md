# DreamTree Database Schema Diagram (v4)

## Changelog

### v4 Changes (from v3)
- **Normalized content structure**: Replaced `exercise_content` and `exercise_sequence` with a more flexible normalized model:
  - `stem` - Hierarchical content sequencing (part/module/exercise/activity)
  - `content_blocks` - Static content (headings, instructions, notes)
  - `prompts` - User input prompts with configurable input types
  - `connections` - Cross-references and data flow tracking
  - `data_objects` - Documents key data artifacts
  - `ongoing_practices` - Recurring practices metadata
- **Merged tools**: Combined `tool_types` (from Reference Tables) with `tools` content, now in Content Tables section
- **Updated table count**: 36 → 40 tables

---

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
│                              USER DATA TABLES (Tier 1)                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘

        users.id ────────────────────────────────────────────────────────────────────────────┐
            │                                                                                │
            ├────────────────┬────────────────┬────────────────┬────────────────┐            │
            │                │                │                │                │            │
            ▼                ▼                ▼                ▼                ▼            │
 ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
 │  user_profile   │ │   user_values   │ │   user_skills   │ │  user_stories   │ │user_experiences │
 ├─────────────────┤ ├─────────────────┤ ├─────────────────┤ ├─────────────────┤ ├─────────────────┤
 │ user_id (PK,FK) │ │ user_id (PK,FK) │ │ id (PK, UUID)   │ │ id (PK, UUID)   │ │ id (PK, UUID)   │
 │ headline        │ │ work_values     │ │ user_id (FK)    │ │ user_id (FK)    │ │ user_id (FK)    │
 │ summary         │ │ life_values     │ │ skill_id (FK)───┼─► skills          │ │ title           │
 │ identity_story  │ │ compass_stmt    │ │ category        │ │ experience_id───┼─► (FK below)     │
 │ allegory        │ └─────────────────┘ │ mastery (1-5)   │ │ title           │ │ organization    │
 │ value_prop      │                     │ evidence        │ │ S/O/A/R/E/D     │ │ experience_type │
 │ life_dashboard_*│                     │ rank            │ │ story_type      │ │ start/end_date  │
 └─────────────────┘                     └─────────────────┘ └─────────────────┘ │ description     │
                                                                                 └────────┬────────┘
                                                                                          │
 ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        ┌─────────────────────┘
 │ user_locations  │ │user_career_opts │ │   user_budget   │        │
 ├─────────────────┤ ├─────────────────┤ ├─────────────────┤        ▼
 │ id (PK, UUID)   │ │ id (PK, UUID)   │ │ user_id (PK,FK) │ ┌─────────────────────┐
 │ user_id (FK)    │ │ user_id (FK)    │ │ monthly_expenses│ │user_experience_skills│
 │ name            │ │ title           │ │ annual_needs    │ ├─────────────────────┤
 │ rank            │ │ description     │ │ hourly_batna    │ │ experience_id (FK)  │
 │ traits_liked    │ │ rank (1-3)      │ │ benefits_needed │ │ skill_id (FK) ──────┼─► skills
 │ traits_disliked │ │ coherence_score │ │ notes           │ └─────────────────────┘
 │ notes           │ │ work_needs_score│ └─────────────────┘
 └─────────────────┘ │ life_needs_score│
                     │ unknowns_score  │  ┌─────────────────────────────────────────┐
                     └─────────────────┘  │        user_competency_scores           │
                                          ├─────────────────────────────────────────┤
 ┌─────────────────┐ ┌─────────────────┐  │ id (PK, UUID)                           │
 │ user_companies  │◄┤  user_contacts  │  │ user_id (FK)                            │
 ├─────────────────┤ ├─────────────────┤  │ competency_id (FK) ─► competencies      │
 │ id (PK, UUID)   │ │ id (PK, UUID)   │  │ score (1-5)                             │
 │ user_id (FK)    │ │ user_id (FK)    │  │ assessed_at                             │
 │ name            │ │ company_id (FK) │  └─────────────────────────────────────────┘
 │ status          │ │ name            │
 │ research_notes  │ │ title           │
 │ url             │ │ relationship    │
 └────────┬────────┘ │ linkedin_url    │
          │          └─────────────────┘
          │
          │          ┌─────────────────┐
          └─────────►│    user_jobs    │
                     ├─────────────────┤
                     │ id (PK, UUID)   │
                     │ user_id (FK)    │
                     │ company_id (FK) │
                     │ title           │
                     │ posting_url     │
                     │ app_status      │
                     │ notes           │
                     └─────────────────┘

 ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
 │ user_idea_trees │ │ user_idea_nodes │ │ user_idea_edges │
 ├─────────────────┤ ├─────────────────┤ ├─────────────────┤
 │ id (PK, UUID)   │ │ id (PK, UUID)   │ │ id (PK, UUID)   │
 │ user_id (FK)    │ │ user_id (FK)    │ │ tree_id (FK) ───┼─► user_idea_trees
 │ name            │ │ content (unique)│ │ from_node_id ───┼─► user_idea_nodes
 │ root_node_id ───┼─► user_idea_nodes │ │ to_node_id ─────┼─► user_idea_nodes
 └─────────────────┘ └─────────────────┘ └─────────────────┘

 ┌─────────────────┐
 │ user_flow_logs  │
 ├─────────────────┤
 │ id (PK, UUID)   │
 │ user_id (FK)    │
 │ activity        │
 │ energy (-2/+2)  │
 │ focus (1-5)     │
 │ logged_date     │
 └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              USER DATA TABLES (Tier 2)                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
 │ user_responses  │ │   user_lists    │ │ user_list_items │ │user_checklists  │
 ├─────────────────┤ ├─────────────────┤ ├─────────────────┤ ├─────────────────┤
 │ id (PK, UUID)   │ │ id (PK, UUID)   │ │ id (PK, UUID)   │ │ id (PK, UUID)   │
 │ user_id (FK)    │ │ user_id (FK)    │ │ list_id (FK) ───┼─► user_lists     │
 │ prompt_id (FK)  │ │ name            │ │ content         │ │ user_id (FK)    │
 │ exercise_id     │ │ context         │ │ position        │ │ prompt_id (FK)  │
 │ activity_id     │ └─────────────────┘ └─────────────────┘ │ exercise_id     │
 │ response_text   │                                         │ checked (bool)  │
 └─────────────────┘                                         └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CONTENT TABLES                                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────────────────┐
                                    │        stem         │
                                    ├─────────────────────┤
                                    │ id (PK)             │
                                    │ part                │
                                    │ module              │
                                    │ exercise            │
                                    │ activity            │
                                    │ sequence            │
                                    │ block_type ─────────┼───► "content" | "prompt" | "tool"
                                    │ content_id (FK) ────┼───► content_blocks.id (when block_type='content')
                                    │ connection_id (FK) ─┼───► connections.id (optional)
                                    └─────────────────────┘
                                              │
              ┌───────────────────────────────┼───────────────────────────────┐
              │                               │                               │
              ▼                               ▼                               ▼
 ┌─────────────────────┐         ┌─────────────────────┐         ┌─────────────────────┐
 │   content_blocks    │         │       prompts       │         │        tools        │
 ├─────────────────────┤         ├─────────────────────┤         ├─────────────────────┤
 │ id (PK)             │         │ id (PK)             │         │ id (PK)             │
 │ content_type        │         │ prompt_text         │         │ name                │
 │ content             │         │ input_type          │         │ description         │
 │ version             │         │ input_config        │         │ instructions        │
 │ is_active           │         │ version             │         │ icon_name           │
 └─────────────────────┘         │ is_active           │         │ has_reminder        │
                                 └─────────────────────┘         │ reminder_frequency  │
                                                                 │ reminder_prompt     │
 ┌─────────────────────┐         ┌─────────────────────┐         │ unlocks_at_exercise │
 │     connections     │         │    data_objects     │         │ version             │
 ├─────────────────────┤         ├─────────────────────┤         │ is_active           │
 │ id (PK)             │         │ id (PK)             │         └─────────────────────┘
 │ source_block_id(FK) │         │ name                │
 │ target_block_id(FK) │         │ created_in          │
 │ source_location     │         │ reused_in           │         ┌─────────────────────┐
 │ target_location     │         │ data_type           │         │  ongoing_practices  │
 │ connection_type     │         │ implementation_notes│         ├─────────────────────┤
 │ data_object         │         └─────────────────────┘         │ id (PK)             │
 │ source_tool_id (FK) │                                         │ name                │
 │ transform           │                                         │ established_in      │
 │ implementation_notes│                                         │ used_by             │
 └─────────────────────┘                                         │ frequency           │
                                                                 │ purpose             │
                                                                 └─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                  REFERENCE TABLES                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────┐                           ┌─────────────────────┐
 │ personality_types   │                           │   competencies      │
 ├─────────────────────┤                           ├─────────────────────┤
 │ code (PK)           │◄── user_settings          │ id (PK, UUID)       │◄── user_competency_scores
 │ name                │    .personality_type      │ name                │    .competency_id
 │ summary             │                           │ definition          │
 └─────────────────────┘                           │ category            │
                                                   │ sort_order          │
 ┌─────────────────────┐                           │ relevant_modules    │
 │      skills         │                           └──────────┬──────────┘
 ├─────────────────────┤                                      │
 │ id (PK, UUID)       │◄── user_skills.skill_id              ▼
 │ name                │◄── user_experience_skills  ┌─────────────────────┐
 │ category            │    .skill_id               │ competency_levels   │
 │ is_custom           │                           ├─────────────────────┤
 │ created_by (FK) ────┼──► users.id (nullable)    │ id (PK, UUID)       │
 │ review_status       │                           │ competency_id (FK)  │
 │ created_at          │                           │ level (1-5)         │
 └─────────────────────┘                           │ description         │
                                                   │ job_context         │
                                                   └─────────────────────┘

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
| `user_profile` | `user_id` | `users` | `id` | CASCADE |
| `user_values` | `user_id` | `users` | `id` | CASCADE |
| `user_skills` | `user_id` | `users` | `id` | CASCADE |
| `user_skills` | `skill_id` | `skills` | `id` | — |
| `user_stories` | `user_id` | `users` | `id` | CASCADE |
| `user_stories` | `experience_id` | `user_experiences` | `id` | SET NULL |
| `user_experiences` | `user_id` | `users` | `id` | CASCADE |
| `user_experience_skills` | `experience_id` | `user_experiences` | `id` | CASCADE |
| `user_experience_skills` | `skill_id` | `skills` | `id` | — |
| `user_locations` | `user_id` | `users` | `id` | CASCADE |
| `user_career_options` | `user_id` | `users` | `id` | CASCADE |
| `user_budget` | `user_id` | `users` | `id` | CASCADE |
| `user_flow_logs` | `user_id` | `users` | `id` | CASCADE |
| `user_companies` | `user_id` | `users` | `id` | CASCADE |
| `user_contacts` | `user_id` | `users` | `id` | CASCADE |
| `user_contacts` | `company_id` | `user_companies` | `id` | SET NULL |
| `user_jobs` | `user_id` | `users` | `id` | CASCADE |
| `user_jobs` | `company_id` | `user_companies` | `id` | SET NULL |
| `user_idea_trees` | `user_id` | `users` | `id` | CASCADE |
| `user_idea_trees` | `root_node_id` | `user_idea_nodes` | `id` | SET NULL |
| `user_idea_nodes` | `user_id` | `users` | `id` | CASCADE |
| `user_idea_edges` | `tree_id` | `user_idea_trees` | `id` | CASCADE |
| `user_idea_edges` | `from_node_id` | `user_idea_nodes` | `id` | CASCADE |
| `user_idea_edges` | `to_node_id` | `user_idea_nodes` | `id` | CASCADE |
| `user_responses` | `user_id` | `users` | `id` | CASCADE |
| `user_responses` | `prompt_id` | `prompts` | `id` | — |
| `user_lists` | `user_id` | `users` | `id` | CASCADE |
| `user_list_items` | `list_id` | `user_lists` | `id` | CASCADE |
| `user_checklists` | `user_id` | `users` | `id` | CASCADE |
| `user_checklists` | `prompt_id` | `prompts` | `id` | — |
| `user_competency_scores` | `user_id` | `users` | `id` | CASCADE |
| `user_competency_scores` | `competency_id` | `competencies` | `id` | — |
| `competency_levels` | `competency_id` | `competencies` | `id` | — |
| `skills` | `created_by` | `users` | `id` | SET NULL |
| `stem` | `content_id` | `content_blocks` | `id` | — |
| `stem` | `connection_id` | `connections` | `id` | — |
| `connections` | `source_block_id` | `content_blocks` | `id` | — |
| `connections` | `target_block_id` | `content_blocks` | `id` | — |
| `connections` | `source_tool_id` | `tools` | `id` | — |
| `content_sources` | `reference_id` | `references` | `id` | — |

### Logical Relationships (No FK, Linked by ID Pattern)

| Table | Column | Links To | Pattern |
|-------|--------|----------|---------|
| `stem` | `content_id` | `prompts` | when block_type='prompt' |
| `stem` | `content_id` | `tools` | when block_type='tool' |
| `user_responses` | `exercise_id` | `stem` | part.module.exercise pattern |
| `user_checklists` | `exercise_id` | `stem` | part.module.exercise pattern |

---

## Table Count by Category

| Category | Count | Tables |
|----------|-------|--------|
| **Core** | 6 | users, auth, emails, sessions, user_settings, user_modules |
| **User Data (Tier 1)** | 16 | user_profile, user_values, user_skills, user_stories, user_experiences, user_experience_skills, user_locations, user_career_options, user_budget, user_flow_logs, user_companies, user_contacts, user_jobs, user_idea_trees, user_idea_nodes, user_idea_edges |
| **User Data (Tier 2)** | 4 | user_responses, user_lists, user_list_items, user_checklists |
| **User Data (Assessments)** | 1 | user_competency_scores |
| **Content** | 6 | stem, content_blocks, prompts, tools, connections, data_objects |
| **Content (Metadata)** | 1 | ongoing_practices |
| **Reference** | 4 | personality_types, competencies, competency_levels, skills |
| **Attribution** | 2 | references, content_sources |
| **Total** | **40** | |

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
         │ User Data Tables │                  │  Create: auth    │
         │ (Tier 1 & 2)     │                  │  Create: emails  │
         │ user_modules     │                  │  Update: users   │
         │                  │                  │   (is_anonymous) │
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

  stem                           content_blocks / prompts        content_sources
  (what order?)                    (what to show?)                (what sources?)
        │                                │                              │
        │   sequence = N                 │   block_type                 │   exercise_id
        │   part.module.exercise         │   content_id                 │   reference_id
        ▼                                ▼                              ▼
   ┌─────────┐                      ┌─────────┐                    ┌─────────┐
   │ Query   │ ──────────────────►  │ Render  │ ◄──────────────── │ Cite    │
   │ Next    │   content_id         │ Content │   attribution     │ Sources │
   └─────────┘                      └─────────┘                    └─────────┘
        │                                │                              │
        │   block_type='tool'            │   user response              │  [n] tooltip
        ▼                                ▼                              ▼
   ┌─────────┐                      ┌─────────┐                    ┌─────────┐
   │ Unlock  │                      │ Store   │                    │references│
   │ Tool    │                      │ Response│ ──► user_skills    │(short_  │
   └─────────┘                      └─────────┘     user_stories   │citation)│
        │                                │          user_responses └─────────┘
        ▼                                ▼          etc.
   tools                            user_modules


┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              DAILY DOS FLOW                                             │
└─────────────────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────┐
   │      tools      │
   │ (has_reminder,  │
   │  frequency)     │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐         ┌─────────────────┐
   │ Check: unlocked?│◄────────│      stem       │
   │ (EXISTS query   │         │ (block_type=    │
   │  on user_modules│         │  'tool')        │
   └────────┬────────┘         └─────────────────┘
            │
            ▼
   ┌─────────────────┐         ┌─────────────────┐
   │ Check: due?     │◄────────│ user_flow_logs  │
   │ (NOT EXISTS     │         │ user_stories    │
   │  within period) │         │ etc. (last use) │
   └────────┬────────┘         └─────────────────┘
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
   │  SkillsBrowser  │◄────────│ user_skills     │
   │  (tag picker)   │         │ user_experiences│
   └────────┬────────┘         └─────────────────┘
            │   
            │   selected skill_ids
            ▼
   ┌─────────────────┐
   │  user_skills    │  (for standalone skills)
   │  user_experience│  
   │  _skills        │  (for experience-linked skills)
   └─────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              WALLET EXPORT FLOW                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────┐
   │                     NORMALIZED USER DATA                        │
   │                                                                 │
   │  user_profile    user_skills    user_stories    user_values    │
   │  user_experiences    user_locations    user_career_options     │
   │  user_flow_logs    user_companies    user_contacts    ...      │
   │                                                                 │
   └─────────────────────────────────┬───────────────────────────────┘
                                     │
                                     │  Scheduled (daily) or on-demand
                                     ▼
                            ┌─────────────────┐
                            │  Export Job     │
                            │  (aggregate,    │
                            │   structure,    │
                            │   sign)         │
                            └────────┬────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │  user_wallet    │
                            │  (blob, signed, │
                            │   portable)     │
                            └─────────────────┘
                                     │
                                     │  User-owned, exportable
                                     ▼
                            ┌─────────────────┐
                            │  Future: DID/VC │
                            │  compatible     │
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

Tables using location patterns:
- `stem.part`, `stem.module`, `stem.exercise`, `stem.activity` (hierarchical location)
- `stem.sequence` (global ordering)
- `user_responses.exercise_id` (part.module.exercise pattern, e.g., "1.1.1")
- `user_checklists.exercise_id` (part.module.exercise pattern)
- `content_sources.exercise_id`

---

## Key Changes from v3

| Area | v3 | v4 |
|------|----|----|
| **Total tables** | 36 | 40 |
| **Content model** | `exercise_content`, `exercise_sequence` | `stem`, `content_blocks`, `prompts`, `connections` |
| **Tools** | `tool_types` (Reference) | `tools` (Content, merged schema) |
| **Data documentation** | — | New `data_objects`, `ongoing_practices` tables |
| **Content sequencing** | `full_exercise_id` + `sequence_order` | `sequence` column + part/module/exercise/activity hierarchy |
| **Cross-references** | Implicit | Explicit `connections` table |

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


# DreamTree Data Architecture — Section 11: User/Auth Model & Encryption

## Overview

This document captures decisions made for DreamTree's user authentication system and encryption approach. These decisions scope the MVP to email/password authentication, with passkey and wallet auth noted for future consideration.

---

## 1. User States & Transitions

### 1.1 User Lifecycle States

| State | Description |
|-------|-------------|
| **Anonymous** | New visitor with cookie-based ID. Data stored in D1 tied to cookie. |
| **Claimed** | User has created an account (email/password). Anonymous ID migrated to account. |
| **Returning (same device)** | Cookie still valid. Seamless continuation. |
| **Returning (new device)** | Logs in. System loads account data from server. |
| **Returning (no server data)** | Logs in but server has no data. Prompted for JSON restore or fresh start. |

### 1.2 State Transitions

```
[New Visitor]
      │
      ▼
[Anonymous] ──── cookie-based ID, data in D1
      │
      │ claims account (email/password)
      ▼
[Claimed] ──── auth linked, data migrated
      │
      ├── same device return ──► seamless (cookie valid)
      │
      └── new device return ──► login ──► load account data
                                    │
                                    └── no data found ──► JSON restore or fresh start
```

---

## 2. Merge Logic

### 2.1 Core Principle

**Any merge scenario becomes a replace choice at the module level. Newer `last_modified_at` timestamp wins.**

This applies consistently to:
- JSON restore
- Anonymous session claiming an existing account
- Any future multi-device sync scenarios

### 2.2 Merge Rules

**Module-level data (exercise responses, classed tool instances):**
- Compare `last_modified_at` timestamps per module
- Newer version wins, older is discarded
- No per-exercise granularity for merge decisions

**Standalone tool instances (user-created, not tied to modules):**
- Additive merge — both datasets combine
- Hash-based deduplication prevents exact duplicates
- If hashes match, skip the duplicate; otherwise keep both

### 2.3 User Messaging

When merge is triggered:

> "Your work will be combined based on when each section was last updated. Whichever version is newer wins—whether that's from this session or your saved account."

No per-module confirmation UI. Simple rule, clearly communicated.

---

## 3. Timestamps

### 3.1 Collected Timestamps

| Level | Field | Purpose |
|-------|-------|---------|
| **Exercise** | `responded_at` | When user answered/last edited. Analytics, insights. |
| **Module** | `first_completed_at` | When module was first finished. Never changes. Analytics. |
| **Module** | `last_modified_at` | Updates on any exercise edit. **Drives merge logic.** |
| **Standalone Tool Instance** | `created_at` | When user created the instance. |

### 3.2 Completion Definition

A module is "completed" when all required exercises have responses. There is no explicit "done" button — the conversation flow is seamless and continuous with autosave after each exercise.

- `first_completed_at` is set when the final required exercise receives its first response
- `last_modified_at` updates whenever any exercise in that module is edited (including post-completion edits)

---

## 4. Authentication (MVP)

### 4.1 Scope

**MVP: Email/password only.**

Passkey and wallet authentication are deferred to post-MVP. The challenge of deriving encryption keys from non-password auth methods requires further design work.

### 4.2 Email Storage

Per earlier spec decisions:
- Store all emails ever associated with an account
- Only one email is "active" at any time
- Email changes don't affect encryption

### 4.3 Password Storage

- Password hashed using bcrypt (or Argon2)
- Never stored in plaintext
- Password is input to key derivation, not stored for that purpose

---

## 5. Encryption Model

### 5.1 Architecture Overview

```
[Password] 
     │
     ▼ (PBKDF2 or Argon2)
[Wrapping Key] ◄── derived from password, never stored
     │
     ▼ (encrypt/decrypt)
[Wrapped Data Key] ◄── stored in user record
     │
     ▼ (unwrap)
[Data Key] ◄── random, generated at account creation, encrypts PII
     │
     ▼
[Encrypted PII Fields]
```

### 5.2 Key Management

**Account creation:**
1. Generate random data key
2. Derive wrapping key from password (PBKDF2/Argon2)
3. Encrypt (wrap) the data key with the wrapping key
4. Store wrapped data key in user record
5. Data key used to encrypt PII fields

**Login:**
1. User enters password
2. Derive wrapping key from password
3. Decrypt (unwrap) the data key
4. Hold data key in session for PII operations

**Password change:**
1. Derive old wrapping key from old password
2. Unwrap data key
3. Derive new wrapping key from new password
4. Re-wrap data key with new wrapping key
5. Store new wrapped data key
6. PII remains encrypted with same data key — no re-encryption needed

**Email change:**
- No encryption implications
- Update email record only

### 5.3 Password Recovery

Password recovery (via email reset link) has **limited scope**:

1. User requests reset, receives email link
2. User sets new password
3. New wrapping key derived from new password
4. **Old wrapped data key cannot be decrypted** (old wrapping key unknown)
5. PII fields become permanently unrecoverable
6. All non-PII data (module progress, tool instances, etc.) remains intact

**User messaging:**

> "Your encrypted personal data (financial info, contact details, and private reflections) cannot be recovered without your original password. All other progress has been preserved."

This is an intentional tradeoff: true privacy means even DreamTree cannot access encrypted data.

---

## 6. What Gets Encrypted

### 6.1 PII Fields (User-Key Encrypted)

These fields are encrypted with the user's data key:

| Location | Content |
|----------|---------|
| **Module 1.4 "Love"** | Deeply personal reflections |
| **Budget Calculator** | Income, expenses, financial numbers |
| **Networking Prep Tool** | Names, contact info, relationship notes about real people |
| **Settings/Profile** | Address, geographic data |

### 6.2 Encryption Approach

**Encrypted fields in place** — PII fields are encrypted within their logical tables, not extracted to a separate blob.

Benefits:
- Table structure remains clean and logical
- Queries stay simple
- Only decrypt fields when needed
- Rarely-accessed PII doesn't add overhead to common operations

### 6.3 Encrypted Field Format

Each encrypted field stores a JSON envelope:

```json
{
  "v": 1,
  "iv": "base64-encoded-initialization-vector",
  "ciphertext": "base64-encoded-encrypted-content"
}
```

| Field | Purpose |
|-------|---------|
| `v` | Version number. Allows encryption algorithm rotation without blind migration. |
| `iv` | Initialization vector for this specific encryption. Required for decryption. |
| `ciphertext` | The actual encrypted content. |

Column type: TEXT (JSON string)

---

## 7. Future Considerations

### 7.1 Passkey & Wallet Auth (Post-MVP)

The core challenge: passkeys and wallets are **authentication** mechanisms but don't naturally provide **encryption** material.

Options explored:
- **Separate encryption password** — all users set one regardless of auth method
- **Signed challenge derivation** — works for wallets (deterministic signatures), not passkeys
- **Device-bound key with escrow** — passkeys can't encrypt, only sign
- **Accept different security guarantees** — transparency about tradeoffs

Decision deferred. May require "encryption password" approach for consistency, or accept that passkey/wallet users get server-managed encryption with clear disclosure.

### 7.2 Roadmap Note

> **Auth Flexibility (Post-MVP):** Revisit passkey and wallet authentication once core product is stable. Requires solving encryption key derivation for non-password auth methods. Consider user research on privacy expectations for different auth types.

---

## 8. Summary

| Aspect | Decision |
|--------|----------|
| **MVP Auth** | Email/password only |
| **Anonymous → Claimed** | Cookie ID links to account, data migrates |
| **Merge Logic** | Module-level, newer `last_modified_at` wins |
| **Standalone Tools** | Additive merge with hash dedup |
| **Encryption Keys** | Random data key, wrapped with password-derived key |
| **Password Change** | Re-wrap data key, no PII re-encryption |
| **Password Recovery** | Account recoverable, PII lost |
| **PII Scope** | Love content, budget, networking PII, geo data |
| **Encrypted Field Format** | JSON envelope with version, IV, ciphertext |
| **Field Location** | Encrypted in place within logical tables |

# DreamTree Data Architecture — Section 12: Database Schema (Revised v3)

## Overview

DreamTree uses Cloudflare D1 (SQLite) as its database. This document defines the complete schema, including tables, relationships, indexes, and data types.

**Revision Note v4:** This version normalizes the content structure, replacing `exercise_content` and `exercise_sequence` with a more flexible model (`stem`, `content_blocks`, `prompts`, `connections`). Tools are merged into Content tables. Adds `data_objects` and `ongoing_practices` for content documentation.

---

## 1. Schema Overview

### Table Categories

| Category | Tables | Purpose |
|----------|--------|---------|
| **Core** | users, auth, emails, sessions, user_settings, user_modules | User identity, auth, preferences, progress |
| **User Data (Tier 1)** | user_profile, user_values, user_skills, user_stories, user_experiences, user_experience_skills, user_locations, user_career_options, user_budget, user_flow_logs, user_companies, user_contacts, user_jobs, user_idea_trees, user_idea_nodes, user_idea_edges | Structured user input data |
| **User Data (Tier 2)** | user_responses, user_lists, user_list_items, user_checklists | Generic/catch-all user input |
| **User Data (Assessments)** | user_competency_scores | Self-assessments |
| **Content** | stem, content_blocks, prompts, tools, connections, data_objects, ongoing_practices | Workbook content, sequencing, and documentation |
| **Reference** | personality_types, competencies, competency_levels, skills | Static reference data |
| **Attribution** | references, content_sources | Source tracking and credits |

---

## 2. Core Tables

### 2.1 users

Core user record. Created for both anonymous and claimed users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID, generated on first visit |
| `is_anonymous` | INTEGER | NOT NULL, DEFAULT 1 | Boolean (1=anonymous, 0=claimed). Convenience flag; `auth` table is source of truth. |
| `workbook_complete` | INTEGER | NOT NULL, DEFAULT 0 | Boolean: user has completed all exercises |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    is_anonymous INTEGER NOT NULL DEFAULT 1,
    workbook_complete INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

---

### 2.2 auth

Authentication credentials. Only exists for claimed users. Source of truth for claimed status.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `type` | TEXT | NOT NULL | Auth method: `"password"` (MVP). Future: `"passkey"`, `"wallet"` |
| `password_hash` | TEXT | | bcrypt/Argon2 hash. Nullable for future non-password auth. |
| `wrapped_data_key` | TEXT | | Encrypted data key for PII decryption. See Section 11. |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE auth (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    password_hash TEXT,
    wrapped_data_key TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_auth_user_id ON auth(user_id);
```

---

### 2.3 emails

Email addresses associated with a user. Multiple allowed, only one active.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `email` | TEXT | NOT NULL, UNIQUE | Email address (lowercase, trimmed) |
| `is_active` | INTEGER | NOT NULL, DEFAULT 1 | Boolean. Only one active per user. |
| `added_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE emails (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    is_active INTEGER NOT NULL DEFAULT 1,
    added_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_emails_user_id ON emails(user_id);
```

---

### 2.4 sessions

Browser sessions. Links cookie ID to user. Supports multiple sessions per user (multiple devices).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID, stored in cookie |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `last_seen_at` | TEXT | NOT NULL | ISO 8601 timestamp, updated on activity |

```sql
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
```

---

### 2.5 user_settings

Visual preferences. One row per user, created with defaults on user creation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | TEXT | PRIMARY KEY, FK → users.id | Link to user |
| `background_color` | TEXT | NOT NULL, DEFAULT 'cream' | One of 5 options |
| `text_color` | TEXT | NOT NULL, DEFAULT 'charcoal' | One of 5 options |
| `font` | TEXT | NOT NULL, DEFAULT 'Sans' | One of 5 options |
| `personality_type` | TEXT | | FK → personality_types.code, user's MBTI type |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_settings (
    user_id TEXT PRIMARY KEY,
    background_color TEXT NOT NULL DEFAULT 'cream',
    text_color TEXT NOT NULL DEFAULT 'charcoal',
    font TEXT NOT NULL DEFAULT 'system',
    personality_type TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (personality_type) REFERENCES personality_types(code)
);
```

---

### 2.6 user_modules

Module-level progress tracking. Row created when user completes a module.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | TEXT | PK (composite), FK → users.id | Link to user |
| `module_id` | TEXT | PK (composite) | Module identifier, e.g., "1.1", "2.3" |
| `first_completed_at` | TEXT | NOT NULL | ISO 8601. Set once, never changes. |
| `last_modified_at` | TEXT | NOT NULL | ISO 8601. Updated on any edit. **Drives merge logic.** |

```sql
CREATE TABLE user_modules (
    user_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    first_completed_at TEXT NOT NULL,
    last_modified_at TEXT NOT NULL,
    PRIMARY KEY (user_id, module_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 3. User Data Tables

User data is stored in normalized tables optimized for querying and cross-referencing. The app reads and writes to these tables directly. A separate wallet export job periodically snapshots this data into a portable format.

### Architecture Philosophy

**Tier 1 Tables:** Dedicated tables for structured, frequently-referenced data (skills, stories, experiences, etc.)

**Tier 2 Tables:** Generic tables for simple or catch-all data (text responses, lists, checklists)

---

### 3.1 user_profile

Key outputs from the workbook. Single row per user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | TEXT | PRIMARY KEY, FK → users.id | Link to user |
| `headline` | TEXT | | Professional headline (6-12 words) |
| `summary` | TEXT | | Professional summary (3-5 sentences) |
| `identity_story` | TEXT | | ~1 page identity narrative |
| `allegory` | TEXT | | ~1 page professional allegory |
| `value_proposition` | TEXT | | 10-word value statement |
| `life_dashboard_work` | INTEGER | CHECK 1-10 | Work satisfaction rating |
| `life_dashboard_play` | INTEGER | CHECK 1-10 | Play satisfaction rating |
| `life_dashboard_love` | INTEGER | CHECK 1-10 | Love satisfaction rating |
| `life_dashboard_health` | INTEGER | CHECK 1-10 | Health satisfaction rating |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_profile (
    user_id TEXT PRIMARY KEY,
    headline TEXT,
    summary TEXT,
    identity_story TEXT,
    allegory TEXT,
    value_proposition TEXT,
    life_dashboard_work INTEGER CHECK (life_dashboard_work BETWEEN 1 AND 10),
    life_dashboard_play INTEGER CHECK (life_dashboard_play BETWEEN 1 AND 10),
    life_dashboard_love INTEGER CHECK (life_dashboard_love BETWEEN 1 AND 10),
    life_dashboard_health INTEGER CHECK (life_dashboard_health BETWEEN 1 AND 10),
    life_dashboard_notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### 3.2 user_values

Values statements, referenced in career decisions and company selection.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | TEXT | PRIMARY KEY, FK → users.id | Link to user |
| `work_values` | TEXT | | Work values statement |
| `life_values` | TEXT | | Life values statement |
| `compass_statement` | TEXT | | Value compass (overlap of work/life) |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_values (
    user_id TEXT PRIMARY KEY,
    work_values TEXT,
    life_values TEXT,
    compass_statement TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### 3.3 user_skills

Skills with category, mastery rating, evidence, and optional ranking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `skill_id` | TEXT | NOT NULL, FK → skills.id | Link to master skill |
| `category` | TEXT | CHECK | 'transferable', 'self_management', 'knowledge' |
| `mastery` | INTEGER | CHECK 1-5 | Self-assessed mastery level |
| `evidence` | TEXT | | Specific example demonstrating skill |
| `rank` | INTEGER | | Position in top-10 list (nullable) |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_skills (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    category TEXT CHECK (category IN ('transferable', 'self_management', 'knowledge')),
    mastery INTEGER CHECK (mastery BETWEEN 1 AND 5),
    evidence TEXT,
    rank INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);

CREATE INDEX idx_user_skills_user ON user_skills(user_id);
CREATE INDEX idx_user_skills_category ON user_skills(user_id, category);
CREATE INDEX idx_user_skills_rank ON user_skills(user_id, rank) WHERE rank IS NOT NULL;
```

---

### 3.4 user_stories

SOARED stories with optional link to experience.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `experience_id` | TEXT | FK → user_experiences.id | Optional link to source experience |
| `title` | TEXT | | Story title/label |
| `situation` | TEXT | | S — describe the situation |
| `obstacle` | TEXT | | O — describe the obstacle |
| `action` | TEXT | | A — describe your actions |
| `result` | TEXT | | R — describe the result |
| `evaluation` | TEXT | | E — self-evaluation |
| `discovery` | TEXT | | D — what you discovered |
| `story_type` | TEXT | CHECK | 'challenge', 'reframe', 'other' |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_stories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    experience_id TEXT,
    title TEXT,
    situation TEXT,
    obstacle TEXT,
    action TEXT,
    result TEXT,
    evaluation TEXT,
    discovery TEXT,
    story_type TEXT CHECK (story_type IN ('challenge', 'reframe', 'other')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (experience_id) REFERENCES user_experiences(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_stories_user ON user_stories(user_id);
CREATE INDEX idx_user_stories_type ON user_stories(user_id, story_type);
```

---

### 3.5 user_failure_reframes

Structured failure reframes — distinct from SOARED stories.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `situation` | TEXT | | What happened |
| `initial_feelings` | TEXT | | How you felt initially |
| `what_learned` | TEXT | | What you learned |
| `what_would_change` | TEXT | | What you'd do differently |
| `silver_lining` | TEXT | | Positive outcome or insight |
| `next_step` | TEXT | | Concrete next action |
| `reframed_statement` | TEXT | | The positive reframe |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_failure_reframes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    situation TEXT,
    initial_feelings TEXT,
    what_learned TEXT,
    what_would_change TEXT,
    silver_lining TEXT,
    next_step TEXT,
    reframed_statement TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_failure_reframes_user ON user_failure_reframes(user_id);
```

---

### 3.6 user_experiences

Jobs, education, projects — the source for resume autofill.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `title` | TEXT | NOT NULL | Position/degree/project title |
| `organization` | TEXT | | Company/school/client name |
| `experience_type` | TEXT | CHECK | 'job', 'education', 'project', 'other' |
| `start_date` | TEXT | | ISO 8601 date |
| `end_date` | TEXT | | ISO 8601 date (null = current) |
| `description` | TEXT | | Details, accomplishments |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_experiences (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    organization TEXT,
    experience_type TEXT CHECK (experience_type IN ('job', 'education', 'project', 'other')),
    start_date TEXT,
    end_date TEXT,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_experiences_user ON user_experiences(user_id);
CREATE INDEX idx_user_experiences_type ON user_experiences(user_id, experience_type);
```

---

### 3.6 user_experience_skills

Junction table linking experiences to skills used.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `experience_id` | TEXT | NOT NULL, FK → user_experiences.id | Link to experience |
| `skill_id` | TEXT | NOT NULL, FK → skills.id | Link to skill |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_experience_skills (
    id TEXT PRIMARY KEY,
    experience_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(experience_id, skill_id),
    FOREIGN KEY (experience_id) REFERENCES user_experiences(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);

CREATE INDEX idx_user_experience_skills_experience ON user_experience_skills(experience_id);
CREATE INDEX idx_user_experience_skills_skill ON user_experience_skills(skill_id);
```

---

### 3.7 user_locations

Ranked location preferences with traits.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `name` | TEXT | NOT NULL | Location name |
| `rank` | INTEGER | | Position in preference order |
| `traits_liked` | TEXT | | What appeals about this location |
| `traits_disliked` | TEXT | | Concerns about this location |
| `notes` | TEXT | | Additional notes |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_locations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    rank INTEGER,
    traits_liked TEXT,
    traits_disliked TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_locations_user ON user_locations(user_id);
CREATE INDEX idx_user_locations_rank ON user_locations(user_id, rank) WHERE rank IS NOT NULL;
```

---

### 3.8 user_career_options

The three career paths with assessment scores.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `title` | TEXT | NOT NULL | Career option title |
| `description` | TEXT | | Details about this path |
| `rank` | INTEGER | CHECK 1-3 | Preference order |
| `coherence_score` | INTEGER | | Alignment with values |
| `work_needs_score` | INTEGER | | Meets work requirements |
| `life_needs_score` | INTEGER | | Meets life requirements |
| `unknowns_score` | INTEGER | | Uncertainty/risk level |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_career_options (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    rank INTEGER CHECK (rank BETWEEN 1 AND 3),
    coherence_score INTEGER,
    work_needs_score INTEGER,
    life_needs_score INTEGER,
    unknowns_score INTEGER,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_career_options_user ON user_career_options(user_id);
```

---

### 3.9 user_milestones

Career timeline milestones for 5-year planning.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `year` | INTEGER | NOT NULL | Target year |
| `quarter` | INTEGER | CHECK 1-4 | Target quarter |
| `title` | TEXT | NOT NULL | Milestone title |
| `category` | TEXT | CHECK | 'work', 'education', 'personal', 'skill' |
| `description` | TEXT | | Additional details |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_milestones (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    year INTEGER NOT NULL,
    quarter INTEGER CHECK (quarter BETWEEN 1 AND 4),
    title TEXT NOT NULL,
    category TEXT CHECK (category IN ('work', 'education', 'personal', 'skill')),
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_milestones_user ON user_milestones(user_id);
CREATE INDEX idx_user_milestones_year ON user_milestones(user_id, year);
```

---

### 3.10 user_budget

Budget and BATNA calculations. **Contains PII — encrypted at rest.**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | TEXT | PRIMARY KEY, FK → users.id | Link to user |
| `monthly_expenses` | INTEGER | | Total monthly expenses |
| `annual_needs` | INTEGER | | Calculated annual requirement |
| `hourly_batna` | INTEGER | | Minimum acceptable hourly rate |
| `benefits_needed` | TEXT | | Required benefits list |
| `notes` | TEXT | | Additional financial notes |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_budget (
    user_id TEXT PRIMARY KEY,
    monthly_expenses INTEGER,
    annual_needs INTEGER,
    hourly_batna INTEGER,
    benefits_needed TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### 3.10 user_flow_logs

Daily energy and focus tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `activity` | TEXT | NOT NULL | Activity description |
| `energy` | INTEGER | CHECK -2 to +2 | Energy impact |
| `focus` | INTEGER | CHECK 1-5 | Focus/engagement level |
| `logged_date` | TEXT | NOT NULL | Date of activity |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_flow_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    activity TEXT NOT NULL,
    energy INTEGER CHECK (energy BETWEEN -2 AND 2),
    focus INTEGER CHECK (focus BETWEEN 1 AND 5),
    logged_date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_flow_logs_user ON user_flow_logs(user_id);
CREATE INDEX idx_user_flow_logs_date ON user_flow_logs(user_id, logged_date);
```

---

### 3.11 user_companies

Target companies for job search.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `name` | TEXT | NOT NULL | Company name |
| `status` | TEXT | | Research/outreach status |
| `research_notes` | TEXT | | Notes from company research |
| `url` | TEXT | | Company website |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_companies (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT,
    research_notes TEXT,
    url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_companies_user ON user_companies(user_id);
CREATE INDEX idx_user_companies_status ON user_companies(user_id, status);
```

---

### 3.12 user_contacts

Networking contacts at target companies. **Contains PII — encrypted at rest.**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `company_id` | TEXT | FK → user_companies.id | Link to company (nullable) |
| `name` | TEXT | NOT NULL | Contact name |
| `title` | TEXT | | Contact's job title |
| `relationship_status` | TEXT | | cold, warm, connected, etc. |
| `notes` | TEXT | | Conversation notes |
| `linkedin_url` | TEXT | | LinkedIn profile URL |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_contacts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    company_id TEXT,
    name TEXT NOT NULL,
    title TEXT,
    relationship_status TEXT,
    notes TEXT,
    linkedin_url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES user_companies(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_contacts_user ON user_contacts(user_id);
CREATE INDEX idx_user_contacts_company ON user_contacts(company_id);
```

---

### 3.13 user_jobs

Job opportunities and applications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `company_id` | TEXT | FK → user_companies.id | Link to company (nullable) |
| `title` | TEXT | NOT NULL | Job title |
| `posting_url` | TEXT | | Link to job posting |
| `application_status` | TEXT | | saved, applied, interviewing, etc. |
| `notes` | TEXT | | Application notes |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_jobs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    company_id TEXT,
    title TEXT NOT NULL,
    posting_url TEXT,
    application_status TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES user_companies(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_jobs_user ON user_jobs(user_id);
CREATE INDEX idx_user_jobs_company ON user_jobs(company_id);
CREATE INDEX idx_user_jobs_status ON user_jobs(user_id, application_status);
```

---

### 3.14 user_idea_trees

Container for brainstorming sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `name` | TEXT | | Tree name/label |
| `root_node_id` | TEXT | FK → user_idea_nodes.id | Starting node |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_idea_trees (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT,
    root_node_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (root_node_id) REFERENCES user_idea_nodes(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_idea_trees_user ON user_idea_trees(user_id);
```

---

### 3.15 user_idea_nodes

Unique concepts per user, shared across trees. Enables graph analysis.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `content` | TEXT | NOT NULL | The word/concept |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_idea_nodes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(user_id, content),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_idea_nodes_user ON user_idea_nodes(user_id);
```

---

### 3.16 user_idea_edges

Graph connections between nodes within a tree.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `tree_id` | TEXT | NOT NULL, FK → user_idea_trees.id | Link to tree |
| `from_node_id` | TEXT | NOT NULL, FK → user_idea_nodes.id | Source node |
| `to_node_id` | TEXT | NOT NULL, FK → user_idea_nodes.id | Target node |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_idea_edges (
    id TEXT PRIMARY KEY,
    tree_id TEXT NOT NULL,
    from_node_id TEXT NOT NULL,
    to_node_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(tree_id, from_node_id, to_node_id),
    FOREIGN KEY (tree_id) REFERENCES user_idea_trees(id) ON DELETE CASCADE,
    FOREIGN KEY (from_node_id) REFERENCES user_idea_nodes(id) ON DELETE CASCADE,
    FOREIGN KEY (to_node_id) REFERENCES user_idea_nodes(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_idea_edges_tree ON user_idea_edges(tree_id);
CREATE INDEX idx_user_idea_edges_from ON user_idea_edges(from_node_id);
CREATE INDEX idx_user_idea_edges_to ON user_idea_edges(to_node_id);
```

---

### 3.17 user_competency_scores

User's self-assessed competency levels from Module 2.5.1.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `competency_id` | TEXT | NOT NULL, FK → competencies.id | Link to competency |
| `score` | INTEGER | NOT NULL | 1-5 selected level |
| `assessed_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_competency_scores (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    competency_id TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
    assessed_at TEXT NOT NULL,
    UNIQUE(user_id, competency_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (competency_id) REFERENCES competencies(id)
);

CREATE INDEX idx_user_competency_scores_user ON user_competency_scores(user_id);
```

**Calculation Logic:**

```typescript
// Category averages
const deliveryAvg = average(scores.filter(s => getCategory(s.competencyId) === 'delivery'));
const interpersonalAvg = average(scores.filter(s => getCategory(s.competencyId) === 'interpersonal'));
const strategicAvg = average(scores.filter(s => getCategory(s.competencyId) === 'strategic'));
const overallAvg = average(scores);

// Strength/Improvement thresholds (floor after margin)
const strengthThreshold = Math.floor(overallAvg + 0.3);
const improvementThreshold = Math.floor(overallAvg - 0.3);

// Classification
const strengths = scores.filter(s => s.score >= strengthThreshold);
const improvements = scores.filter(s => s.score <= improvementThreshold);
```

---

### 3.18 user_responses (Tier 2)

Catch-all for text prompt responses without dedicated structure.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `prompt_id` | TEXT | NOT NULL, FK → prompts.id | Link to prompt |
| `exercise_id` | TEXT | | Exercise location (e.g., "1.1.1") |
| `activity_id` | TEXT | | Activity within exercise |
| `response_text` | TEXT | | User's answer |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_responses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    prompt_id TEXT NOT NULL,
    exercise_id TEXT,
    activity_id TEXT,
    response_text TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id)
);

CREATE INDEX idx_user_responses_user ON user_responses(user_id);
CREATE INDEX idx_user_responses_prompt ON user_responses(user_id, prompt_id);
CREATE INDEX idx_user_responses_exercise ON user_responses(user_id, exercise_id);
```

---

### 3.19 user_lists (Tier 2)

Named list containers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `name` | TEXT | NOT NULL | List name |
| `context` | TEXT | | Exercise ID or freeform label |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_lists (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    context TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_lists_user ON user_lists(user_id);
```

---

### 3.20 user_list_items (Tier 2)

Ordered items within a list.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `list_id` | TEXT | NOT NULL, FK → user_lists.id | Link to list |
| `content` | TEXT | NOT NULL | Item text |
| `position` | INTEGER | NOT NULL | Order in list |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_list_items (
    id TEXT PRIMARY KEY,
    list_id TEXT NOT NULL,
    content TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (list_id) REFERENCES user_lists(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_list_items_list ON user_list_items(list_id);
```

---

### 3.21 user_checklists (Tier 2)

Boolean task completion flags.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `prompt_id` | TEXT | NOT NULL, FK → prompts.id | Link to prompt |
| `exercise_id` | TEXT | | Exercise location |
| `checked` | INTEGER | NOT NULL, DEFAULT 0 | Boolean flag |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_checklists (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    prompt_id TEXT NOT NULL,
    exercise_id TEXT,
    checked INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id)
);

CREATE INDEX idx_user_checklists_user ON user_checklists(user_id);
CREATE INDEX idx_user_checklists_exercise ON user_checklists(user_id, exercise_id);
```

---

## 4. Content Tables

### 4.1 stem

The stem table is the backbone of the content structure. It defines the hierarchical location (part/module/exercise/activity) and sequence of every content block, prompt, or tool reference in the workbook.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Unique identifier |
| `part` | INTEGER | NOT NULL | Part number (1-3) |
| `module` | INTEGER | NOT NULL | Module number within part (0 = part intro) |
| `exercise` | INTEGER | NOT NULL | Exercise number within module (0 = module intro) |
| `activity` | INTEGER | NOT NULL | Activity number within exercise (0 = exercise intro) |
| `sequence` | INTEGER | NOT NULL, UNIQUE | Global display order across all content |
| `block_type` | TEXT | NOT NULL | "content", "prompt", or "tool" |
| `content_id` | INTEGER | | FK → content_blocks.id, prompts.id, or tools.id based on block_type |
| `connection_id` | INTEGER | | FK → connections.id (optional, for cross-references) |

```sql
CREATE TABLE stem (
    id INTEGER PRIMARY KEY,
    part INTEGER NOT NULL,
    module INTEGER NOT NULL,
    exercise INTEGER NOT NULL,
    activity INTEGER NOT NULL,
    sequence INTEGER NOT NULL UNIQUE,
    block_type TEXT NOT NULL CHECK (block_type IN ('content', 'prompt', 'tool')),
    content_id INTEGER,
    connection_id INTEGER,
    FOREIGN KEY (connection_id) REFERENCES connections(id)
);

CREATE INDEX idx_stem_sequence ON stem(sequence);
CREATE INDEX idx_stem_location ON stem(part, module, exercise, activity);
CREATE INDEX idx_stem_block_type ON stem(block_type, content_id);
```

**Location Pattern:**
- `part.module.exercise.activity` = hierarchical position
- `part=1, module=0` = Part 1 introduction
- `part=1, module=1, exercise=0` = Module 1.1 introduction
- `part=1, module=1, exercise=1, activity=1` = Activity 1.1.1a

---

### 4.2 content_blocks

Static content blocks (headings, instructions, notes, etc.) referenced by stem.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Unique identifier |
| `content_type` | TEXT | NOT NULL | Type of content block |
| `content` | TEXT | NOT NULL | The actual content (may include markdown) |
| `version` | INTEGER | NOT NULL, DEFAULT 1 | Content version for updates |
| `is_active` | INTEGER | NOT NULL, DEFAULT 1 | Boolean for deprecation |

**Content Types:**
| Type | Description |
|------|-------------|
| `heading` | Section headers |
| `instruction` | Explanatory text, context |
| `note` | Callout or aside |
| `quote` | Attributed quotation |
| `transition` | Module/part transition text |
| `celebration` | Milestone acknowledgment |

```sql
CREATE TABLE content_blocks (
    id INTEGER PRIMARY KEY,
    content_type TEXT NOT NULL CHECK (content_type IN ('heading', 'instruction', 'note', 'quote', 'transition', 'celebration')),
    content TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_content_blocks_type ON content_blocks(content_type);
CREATE INDEX idx_content_blocks_active ON content_blocks(is_active);
```

---

### 4.3 prompts

User input prompts referenced by stem when block_type='prompt'.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Unique identifier |
| `prompt_text` | TEXT | NOT NULL | The question or instruction |
| `input_type` | TEXT | NOT NULL | Input component type |
| `input_config` | TEXT | | JSON configuration for the input |
| `version` | INTEGER | NOT NULL, DEFAULT 1 | Content version |
| `is_active` | INTEGER | NOT NULL, DEFAULT 1 | Boolean for deprecation |

**Input Types:**
| Type | Description |
|------|-------------|
| `textarea` | Free-form text response |
| `slider` | Numeric scale input |
| `checkbox` | Boolean confirmation |
| `select` | Dropdown selection |

```sql
CREATE TABLE prompts (
    id INTEGER PRIMARY KEY,
    prompt_text TEXT NOT NULL,
    input_type TEXT NOT NULL CHECK (input_type IN ('textarea', 'slider', 'checkbox', 'select')),
    input_config TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_prompts_type ON prompts(input_type);
CREATE INDEX idx_prompts_active ON prompts(is_active);
```

---

### 4.4 tools

Tool definitions and configuration. Referenced by stem when block_type='tool'.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Unique identifier |
| `name` | TEXT | NOT NULL | Tool identifier (e.g., "list_builder") |
| `description` | TEXT | | Brief description of the tool |
| `instructions` | TEXT | | User-facing instructions |
| `icon_name` | TEXT | | Icon identifier for UI |
| `has_reminder` | INTEGER | NOT NULL, DEFAULT 0 | Boolean: shows in Daily Dos |
| `reminder_frequency` | TEXT | | "daily", "weekly", "monthly", or null |
| `reminder_prompt` | TEXT | | e.g., "Track your flow today" |
| `unlocks_at_exercise` | TEXT | | First exercise location that unlocks this tool |
| `version` | INTEGER | NOT NULL, DEFAULT 1 | Config version |
| `is_active` | INTEGER | NOT NULL, DEFAULT 1 | Boolean |

```sql
CREATE TABLE tools (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    icon_name TEXT,
    has_reminder INTEGER NOT NULL DEFAULT 0,
    reminder_frequency TEXT CHECK (reminder_frequency IN ('daily', 'weekly', 'monthly') OR reminder_frequency IS NULL),
    reminder_prompt TEXT,
    unlocks_at_exercise TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_tools_name ON tools(name);
CREATE INDEX idx_tools_reminder ON tools(has_reminder, reminder_frequency);
```

**Tools (seed data):**

| ID | Name | Description | Has Reminder | Frequency |
|----|------|-------------|--------------|-----------|
| 100000 | list_builder | Dynamic list builder | No | — |
| 100001 | soared_form | SOARED story framework | No | — |
| 100002 | skill_tagger | Tag skills from stories | No | — |
| 100003 | ranking_grid | Drag-and-drop ranking | No | — |
| 100004 | mbti_selector | Personality type selector | No | — |
| 100005 | budget_calculator | Budget and BATNA calculator | No | — |
| 100006 | flow_tracker | Daily energy/focus tracker | Yes | daily |
| 100007 | life_dashboard | Life areas rating | No | — |
| 100009 | failure_reframer | Reframe failures | Yes | weekly |
| 100010 | idea_tree | Visual brainstorming | No | — |

---

### 4.5 connections

Cross-references between content blocks, tracking data flow and dependencies.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Unique identifier |
| `source_block_id` | INTEGER | FK → content_blocks.id | Origin content block |
| `target_block_id` | INTEGER | FK → content_blocks.id | Target content block (nullable) |
| `source_location` | TEXT | | Human-readable source location |
| `target_location` | TEXT | | Human-readable target location |
| `connection_type` | TEXT | NOT NULL | "forward", "backward", "internal", "resource", "framework" |
| `data_object` | TEXT | | Description of data being referenced |
| `source_tool_id` | INTEGER | FK → tools.id | Tool that produces the data (nullable) |
| `transform` | TEXT | | Any transformation applied to the data |
| `implementation_notes` | TEXT | | Developer notes |

**Connection Types:**
| Type | Description |
|------|-------------|
| `forward` | Content created here is used later |
| `backward` | References content created earlier |
| `internal` | References within same exercise |
| `resource` | Points to external resource |
| `framework` | References a reusable framework |

```sql
CREATE TABLE connections (
    id INTEGER PRIMARY KEY,
    source_block_id INTEGER,
    target_block_id INTEGER,
    source_location TEXT,
    target_location TEXT,
    connection_type TEXT NOT NULL CHECK (connection_type IN ('forward', 'backward', 'internal', 'resource', 'framework')),
    data_object TEXT,
    source_tool_id INTEGER,
    transform TEXT,
    implementation_notes TEXT,
    FOREIGN KEY (source_block_id) REFERENCES content_blocks(id),
    FOREIGN KEY (target_block_id) REFERENCES content_blocks(id),
    FOREIGN KEY (source_tool_id) REFERENCES tools(id)
);

CREATE INDEX idx_connections_source ON connections(source_block_id);
CREATE INDEX idx_connections_target ON connections(target_block_id);
CREATE INDEX idx_connections_type ON connections(connection_type);
```

---

### 4.6 data_objects

Documents the key data artifacts created and reused throughout the workbook.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Unique identifier |
| `name` | TEXT | NOT NULL | Descriptive name |
| `created_in` | TEXT | NOT NULL | Exercise/activity where created |
| `reused_in` | TEXT | | Comma-separated list of reuse locations |
| `data_type` | TEXT | NOT NULL | Data structure type |
| `implementation_notes` | TEXT | | Developer notes |

```sql
CREATE TABLE data_objects (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    created_in TEXT NOT NULL,
    reused_in TEXT,
    data_type TEXT NOT NULL,
    implementation_notes TEXT
);

CREATE INDEX idx_data_objects_name ON data_objects(name);
```

---

### 4.7 ongoing_practices

Tracks recurring practices established during the workbook.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Unique identifier |
| `name` | TEXT | NOT NULL | Practice name |
| `established_in` | TEXT | NOT NULL | Exercise where introduced |
| `used_by` | TEXT | | Where the practice is referenced |
| `frequency` | TEXT | NOT NULL | "daily", "weekly", etc. |
| `purpose` | TEXT | | Description of the practice purpose |

```sql
CREATE TABLE ongoing_practices (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    established_in TEXT NOT NULL,
    used_by TEXT,
    frequency TEXT NOT NULL,
    purpose TEXT
);
```

---

## 5. Reference Tables

### 5.1 personality_types

16 MBTI personality type descriptions. Simplified from previous `mbti_types` table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `code` | TEXT | PRIMARY KEY | e.g., "ENFP" |
| `name` | TEXT | NOT NULL | e.g., "The Campaigner" |
| `summary` | TEXT | NOT NULL | Career-focused description |

```sql
CREATE TABLE personality_types (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    summary TEXT NOT NULL
);
```

---

### 5.2 competencies

15 OECD competency definitions across three categories.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `name` | TEXT | NOT NULL | e.g., "Analytical Thinking" |
| `definition` | TEXT | NOT NULL | Full definition paragraph |
| `category` | TEXT | NOT NULL | "delivery", "interpersonal", "strategic" |
| `sort_order` | INTEGER | NOT NULL | Display order within category |
| `relevant_modules` | TEXT | | JSON array of module IDs where this surfaces |

```sql
CREATE TABLE competencies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    definition TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('delivery', 'interpersonal', 'strategic')),
    sort_order INTEGER NOT NULL,
    relevant_modules TEXT
);

CREATE INDEX idx_competencies_category ON competencies(category, sort_order);
```

**Competencies by Category:**

| Category | Competencies |
|----------|--------------|
| **Delivery** (6) | Analytical Thinking, Achievement Focus, Drafting Skills, Flexible Thinking, Managing Resources, Teamwork and Team Leadership |
| **Interpersonal** (5) | Client Focus, Diplomatic Sensitivity, Influencing, Negotiating, Organizational Knowledge |
| **Strategic** (4) | Developing Talent, Organizational Alignment, Strategic Networking, Strategic Thinking |

---

### 5.3 competency_levels

Level descriptions per competency (75 rows: 15 competencies × 5 levels).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `competency_id` | TEXT | NOT NULL, FK → competencies.id | Link to competency |
| `level` | INTEGER | NOT NULL | 1-5 |
| `description` | TEXT | NOT NULL | Level-specific description |
| `job_context` | TEXT | | e.g., "Typically associated with Assistants, Secretaries, Operators" |

```sql
CREATE TABLE competency_levels (
    id TEXT PRIMARY KEY,
    competency_id TEXT NOT NULL,
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
    description TEXT NOT NULL,
    job_context TEXT,
    UNIQUE(competency_id, level),
    FOREIGN KEY (competency_id) REFERENCES competencies(id)
);

CREATE INDEX idx_competency_levels_competency ON competency_levels(competency_id);
```

---

### 5.4 skills

Master skills list plus user custom skills. Replaces `skills_reference`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `name` | TEXT | NOT NULL | Skill name |
| `category` | TEXT | | "transferable", "self_management", "knowledge", or null |
| `is_custom` | INTEGER | NOT NULL, DEFAULT 0 | Boolean: user-added |
| `created_by` | TEXT | FK → users.id | User ID for custom skills (null for master list) |
| `review_status` | TEXT | | "pending", "approved", "rejected" for custom skills |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('transferable', 'self_management', 'knowledge') OR category IS NULL),
    is_custom INTEGER NOT NULL DEFAULT 0,
    created_by TEXT,
    review_status TEXT CHECK (review_status IN ('pending', 'approved', 'rejected') OR review_status IS NULL),
    created_at TEXT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_skills_review ON skills(review_status) WHERE is_custom = 1;
```

---

## 6. Attribution Tables

### 6.1 references

Bibliography and attribution data. Replaces `bibliography` table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `citation_number` | INTEGER | NOT NULL, UNIQUE | Assigned by first appearance in content |
| `author_surname` | TEXT | NOT NULL | For alphabetical sort on credits page |
| `full_citation` | TEXT | NOT NULL | Chicago-formatted citation |
| `short_citation` | TEXT | NOT NULL | Tooltip display, e.g., "Burnett & Evans, *Designing Your Life*" |
| `category` | TEXT | | e.g., "Career Development & Life Design" |
| `metadata` | TEXT | | JSON: influence, key_concepts, application, referenced_in, notes |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE references (
    id TEXT PRIMARY KEY,
    citation_number INTEGER NOT NULL UNIQUE,
    author_surname TEXT NOT NULL,
    full_citation TEXT NOT NULL,
    short_citation TEXT NOT NULL,
    category TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX idx_references_citation_number ON references(citation_number);
CREATE INDEX idx_references_author_surname ON references(author_surname);
```

**Categories:**
- Career Development & Life Design
- Personality & Career Fit
- Psychology, Performance & Mindset
- Communication & Storytelling
- Networking & Social Theory
- Skills Assessment & Classification
- Organizational Frameworks
- Online Resources

---

### 6.2 content_sources

Join table mapping exercises to their sources.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `exercise_id` | TEXT | NOT NULL | Full exercise ID, e.g., "1.1.1.v1" |
| `reference_id` | TEXT | NOT NULL, FK → references.id | Source reference |
| `usage_type` | TEXT | NOT NULL | How source is used |
| `notes` | TEXT | | Specific usage notes |

**Usage Types:**
| Type | Meaning | Display Treatment |
|------|---------|-------------------|
| `direct_quote` | Verbatim text | Quotation marks, full citation |
| `framework` | Using their structured model | "Adapted from [Source]" |
| `concept` | Building on their idea | "Based on work by [Source]" |
| `adaptation` | Modified version of their work | "Adapted from [Source]" |
| `inspiration` | Loosely influenced by | Credits page only |

```sql
CREATE TABLE content_sources (
    id TEXT PRIMARY KEY,
    exercise_id TEXT NOT NULL,
    reference_id TEXT NOT NULL,
    usage_type TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (reference_id) REFERENCES references(id)
);

CREATE INDEX idx_content_sources_exercise ON content_sources(exercise_id);
CREATE INDEX idx_content_sources_reference ON content_sources(reference_id);
```

---

## 7. Index Summary

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| `auth` | `idx_auth_user_id` | `user_id` | Find auth for user |
| `emails` | `idx_emails_user_id` | `user_id` | Find emails for user |
| `emails` | (unique) | `email` | Login lookup |
| `sessions` | `idx_sessions_user_id` | `user_id` | Find sessions for user |
| `user_skills` | `idx_..._user` | `user_id` | Fetch all skills for user |
| `user_skills` | `idx_..._category` | `user_id, category` | Filter skills by category |
| `user_skills` | `idx_..._rank` | `user_id, rank` (partial) | Top-10 skills |
| `user_stories` | `idx_..._user` | `user_id` | Fetch stories for user |
| `user_stories` | `idx_..._type` | `user_id, story_type` | Filter by story type |
| `user_experiences` | `idx_..._user` | `user_id` | Fetch experiences for user |
| `user_experiences` | `idx_..._type` | `user_id, experience_type` | Filter by type |
| `user_experience_skills` | `idx_..._experience` | `experience_id` | Skills for experience |
| `user_experience_skills` | `idx_..._skill` | `skill_id` | Experiences using skill |
| `user_locations` | `idx_..._user` | `user_id` | Fetch locations for user |
| `user_locations` | `idx_..._rank` | `user_id, rank` (partial) | Ranked locations |
| `user_career_options` | `idx_..._user` | `user_id` | Fetch career options |
| `user_flow_logs` | `idx_..._user` | `user_id` | Fetch flow logs |
| `user_flow_logs` | `idx_..._date` | `user_id, logged_date` | Query by date |
| `user_companies` | `idx_..._user` | `user_id` | Fetch companies |
| `user_companies` | `idx_..._status` | `user_id, status` | Filter by status |
| `user_contacts` | `idx_..._user` | `user_id` | Fetch contacts |
| `user_contacts` | `idx_..._company` | `company_id` | Contacts at company |
| `user_jobs` | `idx_..._user` | `user_id` | Fetch job applications |
| `user_jobs` | `idx_..._company` | `company_id` | Jobs at company |
| `user_jobs` | `idx_..._status` | `user_id, application_status` | Filter by status |
| `user_idea_trees` | `idx_..._user` | `user_id` | Fetch idea trees |
| `user_idea_nodes` | `idx_..._user` | `user_id` | Fetch nodes for user |
| `user_idea_edges` | `idx_..._tree` | `tree_id` | Edges in tree |
| `user_idea_edges` | `idx_..._from` | `from_node_id` | Outgoing edges |
| `user_idea_edges` | `idx_..._to` | `to_node_id` | Incoming edges |
| `user_responses` | `idx_..._user` | `user_id` | Fetch responses |
| `user_responses` | `idx_..._prompt` | `user_id, prompt_id` | Response for prompt |
| `user_responses` | `idx_..._exercise` | `user_id, exercise_id` | Responses in exercise |
| `user_lists` | `idx_..._user` | `user_id` | Fetch lists |
| `user_list_items` | `idx_..._list` | `list_id` | Items in list |
| `user_checklists` | `idx_..._user` | `user_id` | Fetch checklists |
| `user_checklists` | `idx_..._exercise` | `user_id, exercise_id` | Checklists in exercise |
| `user_competency_scores` | `idx_..._user` | `user_id` | Fetch scores for user |
| `stem` | `idx_..._sequence` | `sequence` | Progression queries |
| `stem` | `idx_..._location` | `part, module, exercise, activity` | Location lookups |
| `stem` | `idx_..._block_type` | `block_type, content_id` | Content type queries |
| `content_blocks` | `idx_..._type` | `content_type` | Filter by type |
| `content_blocks` | `idx_..._active` | `is_active` | Active content only |
| `prompts` | `idx_..._type` | `input_type` | Filter by input type |
| `prompts` | `idx_..._active` | `is_active` | Active prompts only |
| `tools` | `idx_..._name` | `name` | Lookup by name |
| `tools` | `idx_..._reminder` | `has_reminder, reminder_frequency` | Daily Dos queries |
| `connections` | `idx_..._source` | `source_block_id` | Outgoing connections |
| `connections` | `idx_..._target` | `target_block_id` | Incoming connections |
| `connections` | `idx_..._type` | `connection_type` | Filter by type |
| `competencies` | `idx_..._category` | `category, sort_order` | Filter by category |
| `competency_levels` | `idx_..._competency` | `competency_id` | Fetch levels for competency |
| `skills` | `idx_..._category` | `category` | Filter by category |
| `skills` | `idx_..._name` | `name` | Search by name |
| `skills` | `idx_..._review` | `review_status` (partial) | Find pending custom skills |
| `references` | `idx_..._citation_number` | `citation_number` | Lookup by number |
| `references` | `idx_..._author_surname` | `author_surname` | Alphabetical sort |
| `content_sources` | `idx_..._exercise` | `exercise_id` | Find sources for exercise |
| `content_sources` | `idx_..._reference` | `reference_id` | Find exercises using source |

---

## 8. Cascade Deletes

All user-facing foreign keys use `ON DELETE CASCADE`. When a user is deleted:

**Core:**
- `auth` row deleted
- `emails` rows deleted
- `sessions` rows deleted
- `user_settings` row deleted
- `user_modules` rows deleted

**User Data (Tier 1):**
- `user_profile` row deleted
- `user_values` row deleted
- `user_skills` rows deleted
- `user_stories` rows deleted
- `user_experiences` rows deleted → cascades to `user_experience_skills`
- `user_locations` rows deleted
- `user_career_options` rows deleted
- `user_budget` row deleted
- `user_flow_logs` rows deleted
- `user_companies` rows deleted → `user_contacts.company_id` and `user_jobs.company_id` set to NULL
- `user_contacts` rows deleted
- `user_jobs` rows deleted
- `user_idea_trees` rows deleted → cascades to `user_idea_edges`
- `user_idea_nodes` rows deleted → cascades to `user_idea_edges`

**User Data (Tier 2):**
- `user_responses` rows deleted
- `user_lists` rows deleted → cascades to `user_list_items`
- `user_checklists` rows deleted

**Assessments:**
- `user_competency_scores` rows deleted

Reference tables (`personality_types`, `competencies`, `competency_levels`, `skills`, `references`, `content_sources`) are **not** cascade deleted — they're system data.

Content tables (`stem`, `content_blocks`, `prompts`, `tools`, `connections`, `data_objects`, `ongoing_practices`) are **not** cascade deleted — they're system content.

Custom skills (`skills.created_by`) use `ON DELETE SET NULL` — skill remains but loses creator reference.

---

## 9. JSON Export Structure

Export includes user data only (not reference tables):

```json
{
  "version": "1.1",
  "exported_at": "2024-01-15T10:30:00Z",
  
  "settings": {
    "background_color": "sage",
    "text_color": "charcoal",
    "font": "serif",
    "personality_type": "INTJ"
  },
  
  "competency_scores": [
    {
      "competency_id": "analytical-thinking",
      "score": 4,
      "assessed_at": "2024-01-12T14:00:00Z"
    }
  ],
  
  "modules": {
    "1.1": {
      "first_completed_at": "2024-01-10T14:20:00Z",
      "last_modified_at": "2024-01-12T09:15:00Z",
      "exercises": {
        "1.1.1.v2": {
          "response_json": { "answer": "..." },
          "responded_at": "2024-01-10T14:22:00Z",
          "skills": ["skill-uuid-1", "skill-uuid-2"]
        }
      }
    }
  },
  
  "tool_instances": [
    {
      "id": "uuid-here",
      "tool_type": "soared-story",
      "origin": "2.3.1.v1",
      "content_json": { "situation": "...", "outcome": "..." },
      "content_hash": "sha256...",
      "skills": ["skill-uuid-3"],
      "created_at": "2024-01-11T16:00:00Z",
      "updated_at": "2024-01-11T16:30:00Z"
    }
  ],
  
  "custom_skills": [
    {
      "id": "custom-skill-uuid",
      "name": "Beekeeping",
      "category": "knowledge"
    }
  ]
}
```

**Notes:**
- No auth data or emails exported
- Encrypted fields exported as-is (user needs password to decrypt after import)
- `content_hash` included for merge dedup
- Skills referenced by ID; custom skills exported separately

---

## 10. Seed Files

Reference and content tables require seed data. Located in `/scripts/seed/`:

| File | Table(s) | Source |
|------|----------|--------|
| `seed-personality-types.js` | `personality_types` | 16 type summaries |
| `seed-competencies.js` | `competencies`, `competency_levels` | OECD framework |
| `seed-skills.js` | `skills` | Master skills list from workbook |
| `seed-references.js` | `references` | Credits & sources doc |
| `seed-content-blocks.js` | `content_blocks` | Static content from workbook |
| `seed-prompts.js` | `prompts` | User input prompts |
| `seed-tools.js` | `tools` | Tool configuration |
| `seed-stem.js` | `stem` | Content sequencing and hierarchy |
| `seed-connections.js` | `connections` | Cross-references between content |
| `seed-data-objects.js` | `data_objects` | Data artifact documentation |
| `seed-ongoing-practices.js` | `ongoing_practices` | Recurring practices |
| `seed-sources.js` | `content_sources` | Source mappings |

**Seed order matters:** 
1. `personality_types` (no dependencies)
2. `competencies` then `competency_levels`
3. `skills` (no dependencies)
4. `references` (no dependencies)
5. `content_blocks` (no dependencies)
6. `prompts` (no dependencies)
7. `tools` (no dependencies)
8. `connections` (depends on `content_blocks`, `tools`)
9. `stem` (depends on `content_blocks`, `prompts`, `tools`, `connections`)
10. `data_objects`, `ongoing_practices` (no dependencies, documentation only)
11. `content_sources` (depends on `references`)

---

## 11. Daily Dos Logic

Derived from `tools` table and user data tables. All queries include unlock check.

### Daily Reminders (e.g., Flow Tracker)

```sql
SELECT t.id, t.name, t.reminder_prompt
FROM tools t
WHERE t.has_reminder = 1 
  AND t.reminder_frequency = 'daily'
  AND t.is_active = 1
  AND EXISTS (
    -- Tool is unlocked: user has completed an exercise that introduces this tool
    SELECT 1 FROM user_modules um
    JOIN stem s ON s.part = um.module_id / 10 AND s.module = um.module_id % 10
    WHERE um.user_id = ?
      AND s.block_type = 'tool'
      AND s.content_id = t.id
  )
  AND NOT EXISTS (
    -- No entry today (example for flow_tracker)
    SELECT 1 FROM user_flow_logs ufl
    WHERE ufl.user_id = ?
      AND DATE(ufl.logged_date) = DATE('now')
  );
```

### Weekly Reminders

```sql
SELECT t.id, t.name, t.reminder_prompt
FROM tools t
WHERE t.has_reminder = 1 
  AND t.reminder_frequency = 'weekly'
  AND t.is_active = 1
  AND EXISTS (
    SELECT 1 FROM user_modules um
    JOIN stem s ON s.part = um.module_id / 10 AND s.module = um.module_id % 10
    WHERE um.user_id = ?
      AND s.block_type = 'tool'
      AND s.content_id = t.id
  )
  AND NOT EXISTS (
    -- No entry in last 7 days (tool-specific table lookup)
    SELECT 1 FROM user_stories us
    WHERE us.user_id = ?
      AND us.created_at >= DATE('now', '-7 days')
  );
```

### Monthly Reminders

```sql
SELECT t.id, t.name, t.reminder_prompt
FROM tools t
WHERE t.has_reminder = 1 
  AND t.reminder_frequency = 'monthly'
  AND t.is_active = 1
  AND EXISTS (
    SELECT 1 FROM user_modules um
    JOIN stem s ON s.part = um.module_id / 10 AND s.module = um.module_id % 10
    WHERE um.user_id = ?
      AND s.block_type = 'tool'
      AND s.content_id = t.id
  )
  AND NOT EXISTS (
    -- No entry in last 30 days (tool-specific table lookup)
    SELECT 1 FROM user_career_options uco
    WHERE uco.user_id = ?
      AND uco.updated_at >= DATE('now', '-30 days')
  );
```

**Note:** Since user data is now in dedicated tables, the "last use" check needs to query the appropriate table for each tool type. The queries above are examples — actual implementation should map `tool` to its corresponding user data table.

### Data Transformation

```typescript
function transformToolReminders(tools: ToolRow[]): DailyDo[] {
  return tools.map(t => ({
    id: t.id,
    type: t.name as DailyDoType,
    title: t.name,
    subtitle: t.reminder_prompt,
    action: {
      label: `${t.name} →`,
      onClick: () => navigate(`/tools/${t.id}`),
    },
  }));
}
```

### Resume Workbook Card

```typescript
function getResumeWorkbookCard(nextExercise: Exercise): DailyDo {
  return {
    id: 'resume-workbook',
    type: 'resume',
    title: 'Resume Workbook',
    subtitle: nextExercise.title,
    action: {
      label: 'Continue →',
      onClick: () => navigate(nextExercise.path),
    },
  };
}
```

### Complete Daily Dos Logic

```typescript
function getDailyDos(user: User): DailyDo[] {
  const items: DailyDo[] = [];
  
  // Resume workbook card (if incomplete)
  if (!user.workbookComplete) {
    const nextExercise = getNextExercise(user.id);
    items.push(getResumeWorkbookCard(nextExercise));
  }
  
  // Tool reminders (unlocked + due)
  const dailyReminders = queryDailyReminders(user.id);
  const weeklyReminders = queryWeeklyReminders(user.id);
  const monthlyReminders = queryMonthlyReminders(user.id);
  
  items.push(...transformToolReminders([
    ...dailyReminders,
    ...weeklyReminders,
    ...monthlyReminders,
  ]));
  
  return items;
}
```

---

## 12. Progression Logic

User access to exercises is strictly linear based on `stem.sequence`:

```sql
-- Get user's current position (highest completed sequence number)
SELECT MAX(s.sequence) as current_position
FROM user_responses ur
JOIN stem s ON s.part || '.' || s.module || '.' || s.exercise = ur.exercise_id
WHERE ur.user_id = ?;

-- Get next available content block
SELECT s.*, 
       CASE s.block_type
         WHEN 'content' THEN (SELECT content FROM content_blocks WHERE id = s.content_id)
         WHEN 'prompt' THEN (SELECT prompt_text FROM prompts WHERE id = s.content_id)
         WHEN 'tool' THEN (SELECT name FROM tools WHERE id = s.content_id)
       END as content
FROM stem s
WHERE s.sequence = (
  SELECT COALESCE(MAX(s2.sequence), 0) + 1
  FROM user_responses ur
  JOIN stem s2 ON s2.part || '.' || s2.module || '.' || s2.exercise = ur.exercise_id
  WHERE ur.user_id = ?
);

-- Check if tool is unlocked for user
SELECT EXISTS (
  SELECT 1 
  FROM user_responses ur
  JOIN stem s ON s.part || '.' || s.module || '.' || s.exercise = ur.exercise_id
  WHERE ur.user_id = ?
    AND s.block_type = 'tool'
    AND s.content_id = ?
    AND s.sequence <= (
      SELECT MAX(s2.sequence) 
      FROM user_responses ur2
      JOIN stem s2 ON s2.part || '.' || s2.module || '.' || s2.exercise = ur2.exercise_id
      WHERE ur2.user_id = ?
    )
) as is_unlocked;
```

---

## 13. Competency Re-assessment Logic

Users are prompted to re-assess competencies annually:

```sql
-- Check if re-assessment is due
SELECT 
  MIN(assessed_at) as oldest_assessment,
  CASE 
    WHEN MIN(assessed_at) < DATE('now', '-1 year') THEN 1 
    ELSE 0 
  END as reassessment_due
FROM user_competency_scores
WHERE user_id = ?;
```

---

## 14. Future Considerations

### 14.1 A/B Testing

Content variants can be supported by adding a `variant_group` column to `content_blocks`:
- Assign users to variant groups (add `variant_group` to `user_settings`)
- Query content filtered by user's group
- Track outcomes via response patterns

### 14.2 Content Versioning

When updating content:
- **Minor edit:** Update row, bump `version`, update `updated_at`
- **Major change:** Set `is_active = 0` on old row, create new row with new version

User responses stored in normalized tables with exercise_id (without version), so they remain accessible even after content updates.

### 14.3 Skills Suggestions (Future)

`skills` table supports future AI-powered suggestions:
- Add `embedding` column for semantic search
- Add `frequency` column tracking usage
- Add `related_skills` JSON for suggestions

### 14.4 Competency-Based Skill Suggestions (Future)

Link personality types and competency scores to skill recommendations:
- Map MBTI types to skill affinities
- Suggest skills based on competency strengths/improvements

### 14.5 User Wallet Export (Future)

Periodic export of normalized user data to a portable, user-owned blob:

```sql
CREATE TABLE user_wallet (
    user_id TEXT PRIMARY KEY,
    wallet_json TEXT NOT NULL,        -- Complete user data snapshot
    schema_version TEXT NOT NULL,     -- For forward compatibility
    signature TEXT,                   -- DreamTree attestation (future)
    exported_at TEXT NOT NULL,        -- Last export timestamp
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Export flow:**
1. Scheduled job (daily) or on-demand trigger
2. Query all user data tables for user
3. Structure into portable JSON format
4. Optionally sign with DreamTree key (for verified credentials)
5. Store in `user_wallet`
6. User can export/download at any time

**Future: DID/VC compatibility**
- `wallet_json` could contain Verifiable Credentials
- Signed credentials are attestations: "DreamTree verifies this user completed X"
- Compatible with decentralized identity wallets

### 14.6 Idea Graph Analysis (Future)

Aggregate analysis of user idea trees to discover patterns:

```sql
-- Central concept graph (system-level, not user-specific)
CREATE TABLE concept_nodes (
    id TEXT PRIMARY KEY,
    canonical_name TEXT NOT NULL UNIQUE,
    entity_type TEXT,                 -- 'skill', 'location', 'field', 'value', etc.
    entity_id TEXT,                   -- FK to relevant table if applicable
    created_at TEXT NOT NULL
);

-- Aggregate edges with weight (how many users made this connection)
CREATE TABLE concept_edges (
    id TEXT PRIMARY KEY,
    from_node_id TEXT NOT NULL,
    to_node_id TEXT NOT NULL,
    weight INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    FOREIGN KEY (from_node_id) REFERENCES concept_nodes(id),
    FOREIGN KEY (to_node_id) REFERENCES concept_nodes(id)
);

-- Link user freeform nodes to canonical concepts
CREATE TABLE user_node_concepts (
    user_node_id TEXT NOT NULL,
    concept_node_id TEXT NOT NULL,
    confidence REAL,                  -- Match confidence score
    matched_at TEXT NOT NULL,
    PRIMARY KEY (user_node_id, concept_node_id),
    FOREIGN KEY (user_node_id) REFERENCES user_idea_nodes(id) ON DELETE CASCADE,
    FOREIGN KEY (concept_node_id) REFERENCES concept_nodes(id)
);
```

**Use cases:**
- "What concepts cluster with 'data analysis' across all users?"
- "How do INTJ users branch differently than ENFP users?"
- "What unexpected connections appear frequently?"
- Discovery of skill adjacencies for career path suggestions
