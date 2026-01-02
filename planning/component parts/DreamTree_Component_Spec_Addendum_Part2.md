# DreamTree Component Specification
## Section 11: Credits, Assessments & Skills — Part 2

> Skills Browser/Tagger, Daily Dos updates, and new database tables.

---

## 11.8 `SkillsBrowser`

Searchable, filterable skill selector with tag-style picking.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedSkills` | `string[]` | `[]` | Array of selected skill IDs |
| `onChange` | `(skillIds: string[]) => void` | required | Selection change handler |
| `onAddCustom` | `(skill: NewCustomSkill) => void` | — | Handler for adding custom skill |

### Types

```typescript
type Skill = {
  id: string;
  name: string;
  category: 'transferable' | 'self_management' | 'knowledge' | null;
  isCustom: boolean;
};

type NewCustomSkill = {
  name: string;
  category: 'transferable' | 'self_management' | 'knowledge' | null;
};

type SkillCategory = 'transferable' | 'self_management' | 'knowledge' | 'uncategorized';
```

### State

```typescript
const [searchQuery, setSearchQuery] = useState('');
const [activeFilters, setActiveFilters] = useState<SkillCategory[]>([
  'transferable', 'self_management', 'knowledge', 'uncategorized'
]);
const [showAddCustom, setShowAddCustom] = useState(false);
```

### Behavior

1. User searches via text input
2. Results filter by search + active category filters
3. Click skill to add as selected pill
4. Click pill to remove
5. If no match found, show "Add custom skill" option

### Rendered Structure

```html
<div class="skills-browser">
  <div class="skills-browser-search">
    <TextInput
      value={searchQuery}
      onChange={setSearchQuery}
      placeholder="Search skills..."
      icon={SearchIcon}
    />
  </div>
  
  <div class="skills-browser-filters">
    {categories.map(cat => (
      <button
        key={cat.id}
        class="skills-filter"
        data-active={activeFilters.includes(cat.id)}
        onClick={() => toggleFilter(cat.id)}
      >
        {cat.label}
      </button>
    ))}
  </div>
  
  {selectedSkills.length > 0 && (
    <div class="skills-browser-selected">
      <span class="skills-selected-label">Selected:</span>
      <div class="skills-selected-list">
        {selectedSkills.map(skillId => {
          const skill = getSkill(skillId);
          return (
            <button
              key={skillId}
              class="skill-pill"
              data-selected="true"
              onClick={() => removeSkill(skillId)}
            >
              {skill.name}
              <XIcon size={14} />
            </button>
          );
        })}
      </div>
    </div>
  )}
  
  <div class="skills-browser-results">
    {filteredSkills.length === 0 ? (
      <div class="skills-browser-empty">
        <p>No skills found matching "{searchQuery}"</p>
        {onAddCustom && (
          <Button 
            variant="ghost" 
            onClick={() => setShowAddCustom(true)}
          >
            + Add "{searchQuery}" as custom skill
          </Button>
        )}
      </div>
    ) : (
      <div class="skills-list">
        {filteredSkills.map(skill => (
          <button
            key={skill.id}
            class="skill-pill"
            data-selected={selectedSkills.includes(skill.id)}
            onClick={() => toggleSkill(skill.id)}
          >
            {skill.name}
            {skill.isCustom && <Badge variant="muted" size="sm">Custom</Badge>}
          </button>
        ))}
      </div>
    )}
  </div>
  
  {showAddCustom && (
    <AddCustomSkillModal
      initialName={searchQuery}
      onAdd={handleAddCustom}
      onClose={() => setShowAddCustom(false)}
    />
  )}
</div>
```

### Styling

```css
.skills-browser {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.skills-browser-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.skills-filter {
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.skills-filter:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.skills-filter[data-active="true"] {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-bg);
}

.skills-browser-selected {
  padding: var(--space-3);
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
  border-radius: var(--radius-md);
}

.skills-selected-label {
  display: block;
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.skills-selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.skills-browser-results {
  max-height: 320px;
  overflow-y: auto;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.skill-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.skill-pill:hover {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.skill-pill[data-selected="true"] {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-bg);
}

.skills-browser-empty {
  text-align: center;
  padding: var(--space-6);
  color: var(--color-muted);
}

.skills-browser-empty p {
  margin-bottom: var(--space-3);
}
```

---

## 11.9 `AddCustomSkillModal`

Modal for adding a custom skill to the skills list. Uses existing `Modal` component.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialName` | `string` | `''` | Pre-filled skill name |
| `onAdd` | `(skill: NewCustomSkill) => void` | required | Add handler |
| `onClose` | `() => void` | required | Close handler |

### Rendered Structure

```html
<Modal title="Add Custom Skill" onClose={onClose}>
  <form onSubmit={handleSubmit} class="add-skill-form">
    <TextInput
      label="Skill Name"
      value={name}
      onChange={setName}
      required
    />
    
    <div class="add-skill-category">
      <label class="add-skill-category-label">Category (optional)</label>
      <RadioGroup
        name="skill-category"
        value={category}
        onChange={setCategory}
        options={[
          { value: 'transferable', label: 'Transferable' },
          { value: 'self_management', label: 'Self-Management' },
          { value: 'knowledge', label: 'Knowledge' },
          { value: null, label: 'Uncategorized' },
        ]}
      />
    </div>
    
    <div class="add-skill-actions">
      <Button variant="ghost" type="button" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" type="submit">
        Add Skill
      </Button>
    </div>
  </form>
</Modal>
```

### Styling

```css
.add-skill-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.add-skill-category-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-2);
}

.add-skill-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-4);
}
```

---

# DreamTree Component Specification
## Section 12: Daily Dos Updates

> Updates to existing Daily Dos logic and data.

---

## 12.1 Updated Tool Types Seed Data

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

## 12.2 Updated Daily Dos SQL Queries

All queries now include unlock check.

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

---

## 12.3 Daily Dos Data Transformation

Transform SQL results to `DailyDo[]` for existing `DailyDoList` component.

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

---

## 12.4 Resume Workbook Card

Hardcoded card shown when workbook is incomplete.

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

---

## 12.5 Complete Daily Dos Logic

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

# DreamTree Component Specification
## Section 13: New Database Tables

> Schema additions for credits, personality types, competencies, and skills.

---

## 13.1 `references`

Bibliography and attribution data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `citation_number` | INTEGER | NOT NULL, UNIQUE | Assigned by first appearance |
| `author_surname` | TEXT | NOT NULL | For alphabetical sort |
| `full_citation` | TEXT | NOT NULL | Chicago-formatted citation |
| `short_citation` | TEXT | NOT NULL | Tooltip display |
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

---

## 13.2 `personality_types`

MBTI type data (16 rows).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `code` | TEXT | PRIMARY KEY | 4-letter code, e.g., "INTJ" |
| `name` | TEXT | NOT NULL | e.g., "The Architect" |
| `summary` | TEXT | NOT NULL | Career-focused description |

```sql
CREATE TABLE personality_types (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    summary TEXT NOT NULL
);
```

---

## 13.3 `competencies`

Competency definitions (15 rows).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `name` | TEXT | NOT NULL | e.g., "Analytical Thinking" |
| `definition` | TEXT | NOT NULL | Full definition paragraph |
| `category` | TEXT | NOT NULL | "delivery", "interpersonal", "strategic" |
| `sort_order` | INTEGER | NOT NULL | Display order within category |
| `relevant_modules` | TEXT | | JSON array of module IDs |

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

---

## 13.4 `competency_levels`

Level descriptions per competency (75 rows: 15 × 5).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `competency_id` | TEXT | NOT NULL, FK | Reference to competencies |
| `level` | INTEGER | NOT NULL | 1-5 |
| `description` | TEXT | NOT NULL | Level-specific description |
| `job_context` | TEXT | | e.g., "Assistants, Secretaries, Operators" |

```sql
CREATE TABLE competency_levels (
    id TEXT PRIMARY KEY,
    competency_id TEXT NOT NULL REFERENCES competencies(id),
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
    description TEXT NOT NULL,
    job_context TEXT,
    UNIQUE(competency_id, level)
);

CREATE INDEX idx_competency_levels_competency ON competency_levels(competency_id);
```

---

## 13.5 `user_competency_scores`

User assessment results.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL, FK | Reference to users |
| `competency_id` | TEXT | NOT NULL, FK | Reference to competencies |
| `score` | INTEGER | NOT NULL | 1-5 selected |
| `assessed_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE user_competency_scores (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    competency_id TEXT NOT NULL REFERENCES competencies(id),
    score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
    assessed_at TEXT NOT NULL,
    UNIQUE(user_id, competency_id)
);

CREATE INDEX idx_user_competency_scores_user ON user_competency_scores(user_id);
```

---

## 13.6 `skills`

Master skills list plus user custom skills.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `name` | TEXT | NOT NULL | Skill name |
| `category` | TEXT | | "transferable", "self_management", "knowledge", or null |
| `is_custom` | INTEGER | NOT NULL, DEFAULT 0 | Boolean: user-added |
| `created_by` | TEXT | FK | User ID (null for master list) |
| `review_status` | TEXT | | "pending", "approved", "rejected" |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('transferable', 'self_management', 'knowledge') OR category IS NULL),
    is_custom INTEGER NOT NULL DEFAULT 0,
    created_by TEXT REFERENCES users(id),
    review_status TEXT CHECK (review_status IN ('pending', 'approved', 'rejected') OR review_status IS NULL),
    created_at TEXT NOT NULL
);

CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_skills_review ON skills(review_status) WHERE is_custom = 1;
```

---

## 13.7 `exercise_skills`

Junction table for tagging skills to exercises.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID |
| `exercise_instance_id` | TEXT | NOT NULL | FK to exercise response or tool instance |
| `skill_id` | TEXT | NOT NULL, FK | Reference to skills |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE exercise_skills (
    id TEXT PRIMARY KEY,
    exercise_instance_id TEXT NOT NULL,
    skill_id TEXT NOT NULL REFERENCES skills(id),
    created_at TEXT NOT NULL,
    UNIQUE(exercise_instance_id, skill_id)
);

CREATE INDEX idx_exercise_skills_exercise ON exercise_skills(exercise_instance_id);
CREATE INDEX idx_exercise_skills_skill ON exercise_skills(skill_id);
```

---

## Related Documents

- **Section 10**: Dashboard Components (DailyDoList, DailyDoCard)
- **Section 11 Part 1**: Credits, MBTI, and Competency components
- **Section 5**: Structured Input Components (existing TagSelector pattern)
- **Section 7**: Overlay Components (Modal)
- **Data Architecture**: Existing table schemas
- **Design System**: Visual tokens, colors, typography, spacing
