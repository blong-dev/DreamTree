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

# DreamTree Data Architecture — Section 12: Database Schema (Revised v2)

## Overview

DreamTree uses Cloudflare D1 (SQLite) as its database. This document defines the complete schema, including tables, relationships, indexes, and data types.

**Revision Note v2:** This version updates reference tables for the new competency assessment system, replaces `bibliography` with `references`, adds skills tagging tables, and updates Daily Dos logic with unlock checks and monthly frequency.

---

## 1. Schema Overview

### Table Categories

| Category | Tables | Purpose |
|----------|--------|---------|
| **Core** | users, auth, emails, sessions, user_settings, user_modules | User identity, auth, preferences, progress |
| **Response** | exercise_responses, tool_instances, user_competency_scores, exercise_skills | User-generated content and assessments |
| **Content** | exercise_content, exercise_sequence | Workbook content and progression |
| **Reference** | personality_types, competencies, competency_levels, skills, tool_types | Static reference data |
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

## 3. Response Tables

### 3.1 exercise_responses

Individual exercise answers. Versioned exercise IDs support content evolution.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `part_id` | TEXT | NOT NULL | Part number, e.g., "1" |
| `module_id` | TEXT | NOT NULL | Module number within part, e.g., "1" |
| `exercise_id` | TEXT | NOT NULL | Exercise number within module, e.g., "1" |
| `version` | INTEGER | NOT NULL | Content version, e.g., 1 |
| `full_exercise_id` | TEXT | NOT NULL | Computed: "1.1.1.v1" |
| `response_json` | TEXT | NOT NULL | JSON string. **May contain encrypted fields.** |
| `responded_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE exercise_responses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    part_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    full_exercise_id TEXT NOT NULL,
    response_json TEXT NOT NULL,
    responded_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_exercise_responses_user_full ON exercise_responses(user_id, full_exercise_id);
CREATE INDEX idx_exercise_responses_user_part_module ON exercise_responses(user_id, part_id, module_id);
```

---

### 3.2 tool_instances

Standalone and classed tool data (SOARED stories, rankings, lists, etc.).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK → users.id | Link to user |
| `tool_type` | TEXT | NOT NULL, FK → tool_types.id | Tool identifier |
| `origin` | TEXT | NOT NULL | Exercise ID (e.g., "1.1.1.v1") or "standalone" |
| `content_json` | TEXT | NOT NULL | JSON string. **May contain encrypted fields.** |
| `content_hash` | TEXT | NOT NULL | SHA-256 hash for dedup on merge |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE tool_instances (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    tool_type TEXT NOT NULL,
    origin TEXT NOT NULL,
    content_json TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tool_type) REFERENCES tool_types(id)
);

CREATE INDEX idx_tool_instances_user_id ON tool_instances(user_id);
CREATE INDEX idx_tool_instances_content_hash ON tool_instances(content_hash);
CREATE INDEX idx_tool_instances_user_type ON tool_instances(user_id, tool_type);
```

---

### 3.3 user_competency_scores

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

### 3.4 exercise_skills

Junction table for tagging skills to exercises/tool instances.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `exercise_instance_id` | TEXT | NOT NULL | FK to exercise_responses.id or tool_instances.id |
| `skill_id` | TEXT | NOT NULL, FK → skills.id | Link to skill |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE exercise_skills (
    id TEXT PRIMARY KEY,
    exercise_instance_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(exercise_instance_id, skill_id),
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);

CREATE INDEX idx_exercise_skills_exercise ON exercise_skills(exercise_instance_id);
CREATE INDEX idx_exercise_skills_skill ON exercise_skills(skill_id);
```

---

## 4. Content Tables

### 4.1 exercise_content

All workbook content stored as database rows. Supports versioning and A/B testing.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `part_id` | TEXT | NOT NULL | Part number, e.g., "1" |
| `module_id` | TEXT | NOT NULL | Module number within part, e.g., "1" |
| `exercise_id` | TEXT | NOT NULL | Exercise number within module, e.g., "1" |
| `version` | INTEGER | NOT NULL | Content version |
| `full_exercise_id` | TEXT | NOT NULL | Computed: "1.1.1.v1" |
| `content_type` | TEXT | NOT NULL | Type of content block |
| `content_text` | TEXT | NOT NULL | The actual content |
| `display_order` | INTEGER | NOT NULL | Sequence within exercise |
| `is_active` | INTEGER | NOT NULL, DEFAULT 1 | Boolean for deprecation |
| `variant_group` | TEXT | | For A/B testing: "control", "variant_a", etc. |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

**Content Types:**
| Type | Description |
|------|-------------|
| `instruction` | Explanatory text, context |
| `prompt` | Question or call to action |
| `reflection` | Thought-provoking aside |
| `transition` | Module/part transition text |
| `celebration` | Milestone acknowledgment |

```sql
CREATE TABLE exercise_content (
    id TEXT PRIMARY KEY,
    part_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    full_exercise_id TEXT NOT NULL,
    content_type TEXT NOT NULL,
    content_text TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    variant_group TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX idx_exercise_content_full_id ON exercise_content(full_exercise_id);
CREATE INDEX idx_exercise_content_active ON exercise_content(is_active, full_exercise_id);
CREATE INDEX idx_exercise_content_variant ON exercise_content(full_exercise_id, variant_group);
```

---

### 4.2 exercise_sequence

Defines exercise order, tool unlocks, and completion requirements.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `full_exercise_id` | TEXT | PRIMARY KEY | e.g., "1.1.1.v1" |
| `part_id` | TEXT | NOT NULL | Part number |
| `module_id` | TEXT | NOT NULL | Module number within part |
| `exercise_id` | TEXT | NOT NULL | Exercise number within module |
| `version` | INTEGER | NOT NULL | Content version |
| `sequence_order` | INTEGER | NOT NULL, UNIQUE | Global order across all exercises |
| `unlocks_tool` | TEXT | FK → tool_types.id | Tool unlocked on completion (nullable) |
| `is_required` | INTEGER | NOT NULL, DEFAULT 1 | Boolean: required for module completion |

```sql
CREATE TABLE exercise_sequence (
    full_exercise_id TEXT PRIMARY KEY,
    part_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    sequence_order INTEGER NOT NULL UNIQUE,
    unlocks_tool TEXT,
    is_required INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (unlocks_tool) REFERENCES tool_types(id)
);

CREATE INDEX idx_exercise_sequence_order ON exercise_sequence(sequence_order);
CREATE INDEX idx_exercise_sequence_module ON exercise_sequence(part_id, module_id);
```

**Progression Logic:**
- User can only access exercise with `sequence_order = N` if they have a response for `sequence_order = N-1`
- When `unlocks_tool` is set, completing the exercise unlocks that tool
- Module completion = all exercises with `is_required = 1` in that module have responses

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

### 5.5 tool_types

Tool configuration and metadata. Defines reminder settings and unlock points.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | e.g., "soared-story" |
| `singular_name` | TEXT | NOT NULL | e.g., "SOARED Story" |
| `plural_name` | TEXT | NOT NULL | e.g., "SOARED Stories" |
| `icon_name` | TEXT | NOT NULL | Icon identifier |
| `has_reminder` | INTEGER | NOT NULL, DEFAULT 0 | Boolean: shows in Daily Dos |
| `reminder_frequency` | TEXT | | "daily", "weekly", "monthly", or null |
| `reminder_prompt` | TEXT | | e.g., "Track your flow today" |
| `unlocks_at_exercise` | TEXT | | First exercise that unlocks this tool |
| `version` | INTEGER | NOT NULL, DEFAULT 1 | Config version |
| `is_active` | INTEGER | NOT NULL, DEFAULT 1 | Boolean |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE tool_types (
    id TEXT PRIMARY KEY,
    singular_name TEXT NOT NULL,
    plural_name TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    has_reminder INTEGER NOT NULL DEFAULT 0,
    reminder_frequency TEXT CHECK (reminder_frequency IN ('daily', 'weekly', 'monthly') OR reminder_frequency IS NULL),
    reminder_prompt TEXT,
    unlocks_at_exercise TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

**Tool Types (seed data):**

| ID | Name | Has Reminder | Frequency |
|----|------|--------------|-----------|
| `flow-tracker` | Flow Log | Yes | daily |
| `failure-reframer` | Reframe | Yes | weekly |
| `budget-calculator` | Budget | Yes | monthly |
| `soared-story` | SOARED Story | Yes | monthly |
| `networking-prep` | Networking Prep | Yes | daily |
| `job-prospector` | Job Tracker | Yes | daily |
| `list-builder` | List | No | — |
| `ranking-grid` | Ranking | No | — |
| `idea-tree` | Idea Tree | No | — |
| `resume-builder` | Resume | No | — |

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
| `exercise_responses` | `idx_..._user_full` | `user_id, full_exercise_id` | Fetch specific response |
| `exercise_responses` | `idx_..._user_part_module` | `user_id, part_id, module_id` | Fetch module responses |
| `tool_instances` | `idx_..._user_id` | `user_id` | Fetch all tools for user |
| `tool_instances` | `idx_..._content_hash` | `content_hash` | Dedup on merge |
| `tool_instances` | `idx_..._user_type` | `user_id, tool_type` | Fetch tools by type |
| `user_competency_scores` | `idx_..._user` | `user_id` | Fetch scores for user |
| `exercise_skills` | `idx_..._exercise` | `exercise_instance_id` | Find skills for exercise |
| `exercise_skills` | `idx_..._skill` | `skill_id` | Find exercises using skill |
| `exercise_content` | `idx_..._full_id` | `full_exercise_id` | Fetch content for exercise |
| `exercise_content` | `idx_..._active` | `is_active, full_exercise_id` | Fetch active content |
| `exercise_content` | `idx_..._variant` | `full_exercise_id, variant_group` | A/B test queries |
| `exercise_sequence` | `idx_..._order` | `sequence_order` | Progression queries |
| `exercise_sequence` | `idx_..._module` | `part_id, module_id` | Module exercise list |
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

- `auth` row deleted
- `emails` rows deleted
- `sessions` rows deleted
- `user_settings` row deleted
- `user_modules` rows deleted
- `exercise_responses` rows deleted
- `tool_instances` rows deleted
- `user_competency_scores` rows deleted
- `exercise_skills` rows deleted (for their exercises)

Reference tables (`personality_types`, `competencies`, `competency_levels`, `skills`, `tool_types`, `references`, `content_sources`, `exercise_content`, `exercise_sequence`) are **not** cascade deleted — they're system data.

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

Reference tables require seed data. Located in `/scripts/seed/`:

| File | Table(s) | Source |
|------|----------|--------|
| `seed-personality-types.js` | `personality_types` | 16 type summaries |
| `seed-competencies.js` | `competencies`, `competency_levels` | OECD framework |
| `seed-skills.js` | `skills` | Master skills list from workbook |
| `seed-tools.js` | `tool_types` | Tool configuration |
| `seed-references.js` | `references` | Credits & sources doc |
| `seed-content.js` | `exercise_content`, `exercise_sequence` | Workbook markdown |
| `seed-sources.js` | `content_sources` | Source mappings |

**Seed order matters:** 
1. `personality_types` (no dependencies)
2. `competencies` then `competency_levels`
3. `skills` (no dependencies)
4. `tool_types` (no dependencies)
5. `references` (no dependencies)
6. `exercise_content`, `exercise_sequence` (depends on `tool_types`)
7. `content_sources` (depends on `references`)

---

## 11. Daily Dos Logic

Derived from `tool_types` and `tool_instances`. All queries include unlock check.

### Daily Reminders

```sql
SELECT tt.id, tt.singular_name, tt.reminder_prompt
FROM tool_types tt
WHERE tt.has_reminder = 1 
  AND tt.reminder_frequency = 'daily'
  AND tt.is_active = 1
  AND EXISTS (
    SELECT 1 FROM exercise_responses er
    JOIN exercise_sequence es ON er.full_exercise_id = es.full_exercise_id
    WHERE er.user_id = ?
      AND es.unlocks_tool = tt.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM tool_instances ti
    WHERE ti.user_id = ?
      AND ti.tool_type = tt.id
      AND DATE(ti.created_at) = DATE('now')
  );
```

### Weekly Reminders

```sql
SELECT tt.id, tt.singular_name, tt.reminder_prompt
FROM tool_types tt
WHERE tt.has_reminder = 1 
  AND tt.reminder_frequency = 'weekly'
  AND tt.is_active = 1
  AND EXISTS (
    SELECT 1 FROM exercise_responses er
    JOIN exercise_sequence es ON er.full_exercise_id = es.full_exercise_id
    WHERE er.user_id = ?
      AND es.unlocks_tool = tt.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM tool_instances ti
    WHERE ti.user_id = ?
      AND ti.tool_type = tt.id
      AND ti.created_at >= DATE('now', '-7 days')
  );
```

### Monthly Reminders

```sql
SELECT tt.id, tt.singular_name, tt.reminder_prompt
FROM tool_types tt
WHERE tt.has_reminder = 1 
  AND tt.reminder_frequency = 'monthly'
  AND tt.is_active = 1
  AND EXISTS (
    SELECT 1 FROM exercise_responses er
    JOIN exercise_sequence es ON er.full_exercise_id = es.full_exercise_id
    WHERE er.user_id = ?
      AND es.unlocks_tool = tt.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM tool_instances ti
    WHERE ti.user_id = ?
      AND ti.tool_type = tt.id
      AND ti.created_at >= DATE('now', '-30 days')
  );
```

### Data Transformation

```typescript
function transformToolReminders(toolTypes: ToolTypeRow[]): DailyDo[] {
  return toolTypes.map(tt => ({
    id: tt.id,
    type: tt.id as DailyDoType,
    title: tt.singular_name,
    subtitle: tt.reminder_prompt,
    action: {
      label: `${tt.singular_name} →`,
      onClick: () => navigate(`/tools/${tt.id}`),
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

User access to exercises is strictly linear:

```sql
-- Get user's current position
SELECT MAX(es.sequence_order) as current_position
FROM exercise_responses er
JOIN exercise_sequence es ON er.full_exercise_id = es.full_exercise_id
WHERE er.user_id = ?;

-- Get next available exercise
SELECT es.*
FROM exercise_sequence es
WHERE es.sequence_order = (
  SELECT COALESCE(MAX(es2.sequence_order), 0) + 1
  FROM exercise_responses er
  JOIN exercise_sequence es2 ON er.full_exercise_id = es2.full_exercise_id
  WHERE er.user_id = ?
);

-- Check if tool is unlocked for user
SELECT EXISTS (
  SELECT 1 
  FROM exercise_responses er
  JOIN exercise_sequence es ON er.full_exercise_id = es.full_exercise_id
  WHERE er.user_id = ?
    AND es.unlocks_tool = ?
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

`exercise_content.variant_group` supports content experiments:
- Assign users to variant groups (add `variant_group` to `user_settings`)
- Query content filtered by user's group
- Track outcomes via response patterns

### 14.2 Content Versioning

When updating content:
- **Minor edit:** Update row, bump `version`, update `updated_at`
- **Major change:** Set `is_active = 0` on old row, create new row with new version

User responses reference specific versions, so historical context preserved.

### 14.3 Skills Suggestions (Future)

`skills` table supports future AI-powered suggestions:
- Add `embedding` column for semantic search
- Add `frequency` column tracking usage
- Add `related_skills` JSON for suggestions

### 14.4 Competency-Based Skill Suggestions (Future)

Link personality types and competency scores to skill recommendations:
- Map MBTI types to skill affinities
- Suggest skills based on competency strengths/improvements
