# DreamTree Data Architecture — Section 12: Database Schema (Revised)

## Overview

DreamTree uses Cloudflare D1 (SQLite) as its database. This document defines the complete schema, including tables, relationships, indexes, and data types.

**Revision Note:** This version adds content tables, reference tables, and attribution tables to support exercise content storage, A/B testing, linear progression, tool unlocks, and proper source attribution.

---

## 1. Schema Overview

### Table Categories

| Category | Tables | Purpose |
|----------|--------|---------|
| **Core** | users, auth, emails, sessions, user_settings, user_modules | User identity, auth, preferences, progress |
| **Response** | exercise_responses, tool_instances | User-generated content |
| **Content** | exercise_content, exercise_sequence | Workbook content and progression |
| **Reference** | mbti_types, competency_levels, skills_reference, tool_types | Static reference data |
| **Attribution** | bibliography, content_sources | Source tracking and credits |

---

## 2. Core Tables

### 2.1 users

Core user record. Created for both anonymous and claimed users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID, generated on first visit |
| `is_anonymous` | INTEGER | NOT NULL, DEFAULT 1 | Boolean (1=anonymous, 0=claimed). Convenience flag; `auth` table is source of truth. |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    is_anonymous INTEGER NOT NULL DEFAULT 1,
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
| `font` | TEXT | NOT NULL, DEFAULT 'system' | One of 5 options |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_settings (
    user_id TEXT PRIMARY KEY,
    background_color TEXT NOT NULL DEFAULT 'cream',
    text_color TEXT NOT NULL DEFAULT 'charcoal',
    font TEXT NOT NULL DEFAULT 'system',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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

### 5.1 mbti_types

16 personality type descriptions. User's type stored in exercise response; this table provides display content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `code` | TEXT | PRIMARY KEY | e.g., "ENFP" |
| `name` | TEXT | NOT NULL | e.g., "The Campaigner" |
| `description` | TEXT | NOT NULL | Full type description |
| `strengths` | TEXT | NOT NULL | JSON array of strengths |
| `weaknesses` | TEXT | NOT NULL | JSON array of weaknesses |
| `career_insights` | TEXT | NOT NULL | Career-relevant observations |
| `version` | INTEGER | NOT NULL, DEFAULT 1 | Content version |
| `is_active` | INTEGER | NOT NULL, DEFAULT 1 | Boolean |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE mbti_types (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    strengths TEXT NOT NULL,
    weaknesses TEXT NOT NULL,
    career_insights TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

---

### 5.2 competency_levels

5-level OECD competency framework. Supports guided level selection and contextual display.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Level 1-5 |
| `title` | TEXT | NOT NULL | e.g., "Level 3: Experienced Professional" |
| `description` | TEXT | NOT NULL | Level overview |
| `delivery_competencies` | TEXT | NOT NULL | JSON: delivery-related competencies |
| `interpersonal_competencies` | TEXT | NOT NULL | JSON: relationship competencies |
| `strategic_competencies` | TEXT | NOT NULL | JSON: planning competencies |
| `version` | INTEGER | NOT NULL, DEFAULT 1 | Content version |
| `is_active` | INTEGER | NOT NULL, DEFAULT 1 | Boolean |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE competency_levels (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    delivery_competencies TEXT NOT NULL,
    interpersonal_competencies TEXT NOT NULL,
    strategic_competencies TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

---

### 5.3 skills_reference

Master skills list. Grows over time. Users tag from this list.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `name` | TEXT | NOT NULL | e.g., "Project Management" |
| `category` | TEXT | NOT NULL | "transferable", "self-management", "knowledge" |
| `subcategory` | TEXT | | e.g., "People", "Data", "Things" (for transferable) |
| `description` | TEXT | | Brief explanation |
| `version` | INTEGER | NOT NULL, DEFAULT 1 | Content version |
| `is_active` | INTEGER | NOT NULL, DEFAULT 1 | Boolean for soft deprecation |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE skills_reference (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    description TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX idx_skills_reference_category ON skills_reference(category, is_active);
CREATE INDEX idx_skills_reference_name ON skills_reference(name);
```

---

### 5.4 tool_types

Tool configuration and metadata. Defines reminder settings and unlock points.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | e.g., "soared-story" |
| `singular_name` | TEXT | NOT NULL | e.g., "SOARED Story" |
| `plural_name` | TEXT | NOT NULL | e.g., "SOARED Stories" |
| `icon_name` | TEXT | NOT NULL | Icon identifier |
| `has_reminder` | INTEGER | NOT NULL, DEFAULT 0 | Boolean: shows in Daily Dos |
| `reminder_frequency` | TEXT | | "daily", "weekly", or null |
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
    reminder_frequency TEXT,
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
| `list-builder` | List | No | — |
| `ranking-grid` | Ranking | No | — |
| `soared-story` | SOARED Story | No | — |
| `idea-tree` | Idea Tree | No | — |
| `budget-calculator` | Budget | No | — |
| `failure-reframer` | Reframe | Yes | weekly |
| `flow-tracker` | Flow Log | Yes | daily |
| `resume-builder` | Resume | No | — |
| `networking-prep` | Networking Prep | No | — |
| `job-prospector` | Job Tracker | No | — |

---

## 6. Attribution Tables

### 6.1 bibliography

All sources and original work. Supports credits page and inline attribution.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `entry_type` | TEXT | NOT NULL | "original" or "source" |
| `citation` | TEXT | NOT NULL | Formatted citation |
| `author` | TEXT | | Author name(s) |
| `title` | TEXT | NOT NULL | Work title |
| `year` | TEXT | | Publication year |
| `source_details` | TEXT | | JSON: publisher, URL, ISBN, etc. |
| `influence_areas` | TEXT | | JSON array: which modules/concepts influenced |
| `notes` | TEXT | | Internal notes |
| `version` | INTEGER | NOT NULL, DEFAULT 1 | Content version |
| `is_active` | INTEGER | NOT NULL, DEFAULT 1 | Boolean |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE bibliography (
    id TEXT PRIMARY KEY,
    entry_type TEXT NOT NULL,
    citation TEXT NOT NULL,
    author TEXT,
    title TEXT NOT NULL,
    year TEXT,
    source_details TEXT,
    influence_areas TEXT,
    notes TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX idx_bibliography_type ON bibliography(entry_type, is_active);
```

---

### 6.2 content_sources

Join table mapping exercises to their sources.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `exercise_id` | TEXT | NOT NULL | Full exercise ID, e.g., "1.1.1.v1" |
| `bib_id` | TEXT | NOT NULL, FK → bibliography.id | Source reference |
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
    bib_id TEXT NOT NULL,
    usage_type TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (bib_id) REFERENCES bibliography(id)
);

CREATE INDEX idx_content_sources_exercise ON content_sources(exercise_id);
CREATE INDEX idx_content_sources_bib ON content_sources(bib_id);
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
| `exercise_content` | `idx_..._full_id` | `full_exercise_id` | Fetch content for exercise |
| `exercise_content` | `idx_..._active` | `is_active, full_exercise_id` | Fetch active content |
| `exercise_content` | `idx_..._variant` | `full_exercise_id, variant_group` | A/B test queries |
| `exercise_sequence` | `idx_..._order` | `sequence_order` | Progression queries |
| `exercise_sequence` | `idx_..._module` | `part_id, module_id` | Module exercise list |
| `skills_reference` | `idx_..._category` | `category, is_active` | Filter by category |
| `skills_reference` | `idx_..._name` | `name` | Search by name |
| `bibliography` | `idx_..._type` | `entry_type, is_active` | Filter original vs source |
| `content_sources` | `idx_..._exercise` | `exercise_id` | Find sources for exercise |
| `content_sources` | `idx_..._bib` | `bib_id` | Find exercises using source |

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

Reference tables (`mbti_types`, `competency_levels`, `skills_reference`, `tool_types`, `bibliography`, `content_sources`, `exercise_content`, `exercise_sequence`) are **not** cascade deleted — they're system data.

---

## 9. JSON Export Structure

Export includes user data only (not reference tables):

```json
{
  "version": "1.0",
  "exported_at": "2024-01-15T10:30:00Z",
  
  "settings": {
    "background_color": "sage",
    "text_color": "charcoal",
    "font": "serif"
  },
  
  "modules": {
    "1.1": {
      "first_completed_at": "2024-01-10T14:20:00Z",
      "last_modified_at": "2024-01-12T09:15:00Z",
      "exercises": {
        "1.1.1.v2": {
          "response_json": { "answer": "..." },
          "responded_at": "2024-01-10T14:22:00Z"
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
      "created_at": "2024-01-11T16:00:00Z",
      "updated_at": "2024-01-11T16:30:00Z"
    }
  ]
}
```

**Notes:**
- No auth data or emails exported
- Encrypted fields exported as-is (user needs password to decrypt after import)
- `content_hash` included for merge dedup

---

## 10. Seed Files

Reference tables require seed data. Located in `/scripts/seed/`:

| File | Table(s) | Source |
|------|----------|--------|
| `seed-mbti.js` | `mbti_types` | 16personalities descriptions |
| `seed-competencies.js` | `competency_levels` | OECD framework |
| `seed-skills.js` | `skills_reference` | Skills list from workbook |
| `seed-tools.js` | `tool_types` | Tool configuration |
| `seed-bibliography.js` | `bibliography` | Credits & sources doc |
| `seed-content.js` | `exercise_content`, `exercise_sequence` | Workbook markdown |
| `seed-sources.js` | `content_sources` | Source mappings |

**Seed order matters:** `bibliography` before `content_sources`, `tool_types` before `exercise_sequence`.

---

## 11. Daily Dos Logic

Derived from `tool_types` and `tool_instances`:

```sql
-- Find tools needing daily reminder
SELECT tt.id, tt.singular_name, tt.reminder_prompt
FROM tool_types tt
WHERE tt.has_reminder = 1 
  AND tt.reminder_frequency = 'daily'
  AND tt.is_active = 1
  AND NOT EXISTS (
    SELECT 1 FROM tool_instances ti
    WHERE ti.user_id = ?
      AND ti.tool_type = tt.id
      AND DATE(ti.created_at) = DATE('now')
  );

-- Find tools needing weekly reminder  
SELECT tt.id, tt.singular_name, tt.reminder_prompt
FROM tool_types tt
WHERE tt.has_reminder = 1 
  AND tt.reminder_frequency = 'weekly'
  AND tt.is_active = 1
  AND NOT EXISTS (
    SELECT 1 FROM tool_instances ti
    WHERE ti.user_id = ?
      AND ti.tool_type = tt.id
      AND ti.created_at >= DATE('now', '-7 days')
  );
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

## 13. Future Considerations

### 13.1 A/B Testing

`exercise_content.variant_group` supports content experiments:
- Assign users to variant groups (add `variant_group` to `user_settings`)
- Query content filtered by user's group
- Track outcomes via response patterns

### 13.2 Content Versioning

When updating content:
- **Minor edit:** Update row, bump `version`, update `updated_at`
- **Major change:** Set `is_active = 0` on old row, create new row with new version

User responses reference specific versions, so historical context preserved.

### 13.3 Skills Suggestions (Future)

`skills_reference` supports future AI-powered suggestions:
- Add `embedding` column for semantic search
- Add `frequency` column tracking usage
- Add `related_skills` JSON for suggestions
