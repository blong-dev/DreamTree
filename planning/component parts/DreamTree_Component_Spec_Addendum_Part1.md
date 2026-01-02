# DreamTree Component Specification
## Section 11: Credits, Assessments & Skills — Part 1

> New components for attribution and personality/competency assessment.

---

## 11.1 `InlineCitation`

Citation marker within content. Uses existing `Tooltip` component.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `number` | `number` | required | Citation number (assigned by first appearance in content) |
| `shortCitation` | `string` | required | Tooltip text, e.g., "Burnett & Evans, *Designing Your Life*" |

### Behavior

| Interaction | Result |
|-------------|--------|
| Hover (desktop) / Tap-hold (mobile) | Shows `Tooltip` with `shortCitation` |
| Click / Tap | Navigates to `/credits#citation-{number}` |

### Rendered Structure

```html
<a 
  href="/credits#citation-{number}"
  class="inline-citation"
  aria-label="Citation {number}: {shortCitation}"
>
  <Tooltip content={shortCitation} position="top">
    <span>[{number}]</span>
  </Tooltip>
</a>
```

### Styling

```css
.inline-citation {
  color: var(--color-primary);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
}

.inline-citation:hover {
  text-decoration: underline;
}
```

---

## 11.2 `CreditsPage`

Bibliography page listing all sources. Flat alphabetical by author surname, Chicago style.

### URL

`/credits`

### Data Source

Pulls from `references` table, ordered by `author_surname ASC`.

### Rendered Structure

```html
<AppShell showInput={false}>
  <div class="credits-page">
    <header class="credits-header">
      <h1>Credits & Sources</h1>
      <p class="credits-author">Primary Author: Braedon Long</p>
    </header>
    
    <section class="credits-bibliography">
      <h2>Bibliography</h2>
      <ol class="bibliography-list">
        {references.map(ref => (
          <li 
            key={ref.id} 
            id={`citation-${ref.citation_number}`}
            class="bibliography-entry"
          >
            <span 
              class="bibliography-citation"
              dangerouslySetInnerHTML={{ __html: ref.full_citation }}
            />
          </li>
        ))}
      </ol>
    </section>
  </div>
</AppShell>
```

### Styling

```css
.credits-page {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

.credits-header {
  margin-bottom: var(--space-8);
}

.credits-header h1 {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  margin-bottom: var(--space-2);
}

.credits-author {
  color: var(--color-muted);
  font-size: var(--text-base);
}

.credits-bibliography h2 {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  margin-bottom: var(--space-4);
}

.bibliography-list {
  list-style: none;
  padding: 0;
}

.bibliography-entry {
  padding: var(--space-3) 0;
  border-bottom: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 15%, transparent);
  scroll-margin-top: var(--space-8);
}

.bibliography-entry:last-child {
  border-bottom: none;
}

.bibliography-citation {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
}

.bibliography-citation em {
  font-style: italic;
}

.bibliography-entry:target {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  margin: 0 calc(-1 * var(--space-3));
  padding-left: var(--space-3);
  padding-right: var(--space-3);
  border-radius: var(--radius-sm);
}
```

---

## 11.3 `MBTISelector`

Typeahead input for selecting personality type. Used in Module 1.1.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| null` | `null` | Selected type code |
| `onChange` | `(code: string) => void` | required | Selection handler |
| `disabled` | `boolean` | `false` | Disable input |

### Data Source

Pulls from `personality_types` table (16 rows).

### Behavior

1. User types in input
2. Dropdown filters to matching codes and names (e.g., "INT" shows INTJ, INTP; "Arch" shows INTJ)
3. User selects from filtered list
4. Selection saves to `user_preferences` or `exercise_responses`

### Rendered Structure

```html
<div class="mbti-selector" data-open={isOpen}>
  <label class="mbti-selector-label" for="mbti-input">
    Your Personality Type
  </label>
  
  <div class="mbti-selector-input-wrapper">
    <input
      id="mbti-input"
      type="text"
      class="mbti-selector-input"
      value={inputValue}
      onChange={handleInputChange}
      onFocus={() => setIsOpen(true)}
      placeholder="Type to search (e.g., INTJ or Architect)"
      aria-expanded={isOpen}
      aria-controls="mbti-listbox"
      aria-autocomplete="list"
      disabled={disabled}
    />
    
    {isOpen && filteredTypes.length > 0 && (
      <ul 
        id="mbti-listbox"
        class="mbti-selector-dropdown"
        role="listbox"
      >
        {filteredTypes.map(type => (
          <li
            key={type.code}
            role="option"
            class="mbti-selector-option"
            data-selected={type.code === value}
            onClick={() => handleSelect(type.code)}
          >
            <span class="mbti-option-code">{type.code}</span>
            <span class="mbti-option-name">{type.name}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
</div>
```

### Styling

```css
.mbti-selector {
  position: relative;
}

.mbti-selector-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-2);
}

.mbti-selector-input-wrapper {
  position: relative;
}

.mbti-selector-input {
  width: 100%;
  padding: var(--space-3);
  font-size: var(--text-base);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text);
}

.mbti-selector-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent);
}

.mbti-selector-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: var(--space-1);
  background: var(--color-bg);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  max-height: 240px;
  overflow-y: auto;
  z-index: 50;
  list-style: none;
  padding: var(--space-1);
}

.mbti-selector-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.mbti-selector-option:hover {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.mbti-selector-option[data-selected="true"] {
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
}

.mbti-option-code {
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  min-width: 48px;
}

.mbti-option-name {
  color: var(--color-muted);
  font-size: var(--text-sm);
}
```

---

## 11.4 `MBTIResultDisplay`

Displays user's personality type with summary. Used in Module 1.1 and Profile.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | required | 4-letter type code |
| `name` | `string` | required | Type name, e.g., "The Architect" |
| `summary` | `string` | required | Career-focused description |

### Rendered Structure

```html
<div class="mbti-result">
  <div class="mbti-result-header">
    <span class="mbti-result-code">{code}</span>
    <span class="mbti-result-name">{name}</span>
  </div>
  <p class="mbti-result-summary">{summary}</p>
</div>
```

### Styling

```css
.mbti-result {
  padding: var(--space-4);
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
  border-left: 3px solid var(--color-primary);
  border-radius: var(--radius-md);
}

.mbti-result-header {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.mbti-result-code {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
}

.mbti-result-name {
  font-size: var(--text-lg);
  color: var(--color-muted);
}

.mbti-result-summary {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
}
```

---

## 11.5 `CompetencyLevelSelector`

Guided assessment for determining user's competency level. Used in Module 2.5.1.

### Overview

User completes 15 competency assessments (one per competency). For each, they select from 5 unlabeled level descriptions. Results calculate category and overall averages.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `competencies` | `Competency[]` | required | All 15 competencies with levels |
| `onComplete` | `(scores: CompetencyScore[]) => void` | required | Completion handler |

### Types

```typescript
type Competency = {
  id: string;
  name: string;
  definition: string;
  category: 'delivery' | 'interpersonal' | 'strategic';
  levels: CompetencyLevel[];
};

type CompetencyLevel = {
  level: number; // 1-5
  description: string;
};

type CompetencyScore = {
  competencyId: string;
  score: number; // 1-5
};

type CompetencyResults = {
  scores: CompetencyScore[];
  deliveryAvg: number;
  interpersonalAvg: number;
  strategicAvg: number;
  overallAvg: number;
  strengths: string[];      // competency IDs
  improvements: string[];   // competency IDs
};
```

### Calculation Logic

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
const strengths = scores.filter(s => s.score >= strengthThreshold).map(s => s.competencyId);
const improvements = scores.filter(s => s.score <= improvementThreshold).map(s => s.competencyId);
```

### Flow

1. Show competency name + definition
2. Present 5 level descriptions (unlabeled, in order 1→5)
3. User selects best fit
4. Advance to next competency
5. After all 15, show results

### Rendered Structure (Single Competency Step)

```html
<div class="competency-step">
  <header class="competency-step-header">
    <Badge variant="muted">{category}</Badge>
    <span class="competency-step-progress">
      {currentIndex + 1} of {total}
    </span>
  </header>
  
  <h2 class="competency-step-name">{competency.name}</h2>
  <p class="competency-step-definition">{competency.definition}</p>
  
  <fieldset class="competency-options">
    <legend class="sr-only">Select the description that best fits you</legend>
    
    {competency.levels.map((level, index) => (
      <label 
        key={level.level}
        class="competency-option"
        data-selected={selectedLevel === level.level}
      >
        <input
          type="radio"
          name="competency-level"
          value={level.level}
          checked={selectedLevel === level.level}
          onChange={() => setSelectedLevel(level.level)}
          class="sr-only"
        />
        <span class="competency-option-description">
          {level.description}
        </span>
      </label>
    ))}
  </fieldset>
  
  <div class="competency-step-actions">
    {currentIndex > 0 && (
      <Button variant="ghost" onClick={handleBack}>
        ← Back
      </Button>
    )}
    <Button 
      variant="primary" 
      onClick={handleNext}
      disabled={selectedLevel === null}
    >
      {currentIndex === total - 1 ? 'See Results' : 'Next →'}
    </Button>
  </div>
</div>
```

### Styling

```css
.competency-step {
  max-width: 640px;
  margin: 0 auto;
}

.competency-step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.competency-step-progress {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.competency-step-name {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  margin-bottom: var(--space-2);
}

.competency-step-definition {
  font-size: var(--text-base);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-6);
}

.competency-options {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.competency-option {
  display: block;
  padding: var(--space-4);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--duration-fast) ease,
              background-color var(--duration-fast) ease;
}

.competency-option:hover {
  border-color: color-mix(in srgb, var(--color-primary) 50%, transparent);
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
}

.competency-option[data-selected="true"] {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.competency-option-description {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
}

.competency-step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-6);
}
```

---

## 11.6 `CompetencyResultsDisplay`

Shows competency assessment results with averages, level description, and strength/improvement flags.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `results` | `CompetencyResults` | required | Calculated results |
| `competencies` | `Competency[]` | required | Full competency data |
| `levelDescriptions` | `LevelDescription[]` | required | Job context per level |

### Types

```typescript
type LevelDescription = {
  level: number;
  jobContext: string; // e.g., "Typically associated with Assistants, Secretaries, Operators"
};
```

### Rendered Structure

```html
<div class="competency-results">
  <header class="competency-results-header">
    <h2>Your Competency Profile</h2>
    <div class="competency-results-overall">
      <span class="competency-results-level">Level {Math.round(results.overallAvg)}</span>
      <p class="competency-results-context">
        {getLevelDescription(Math.round(results.overallAvg)).jobContext}
      </p>
    </div>
  </header>
  
  <div class="competency-results-averages">
    <div class="competency-avg">
      <span class="competency-avg-label">Delivery-related</span>
      <span class="competency-avg-value">{results.deliveryAvg.toFixed(1)}</span>
    </div>
    <div class="competency-avg">
      <span class="competency-avg-label">Interpersonal</span>
      <span class="competency-avg-value">{results.interpersonalAvg.toFixed(1)}</span>
    </div>
    <div class="competency-avg">
      <span class="competency-avg-label">Strategic</span>
      <span class="competency-avg-value">{results.strategicAvg.toFixed(1)}</span>
    </div>
  </div>
  
  {['delivery', 'interpersonal', 'strategic'].map(category => (
    <section key={category} class="competency-category">
      <h3 class="competency-category-title">{categoryLabels[category]}</h3>
      
      {getCompetenciesByCategory(category).map(comp => {
        const score = getScore(comp.id);
        const status = getStatus(comp.id); // 'strength' | 'improvement' | 'neutral'
        
        return (
          <div 
            key={comp.id} 
            class="competency-item"
            data-status={status}
          >
            <div class="competency-item-header">
              <span class="competency-item-name">{comp.name}</span>
              <span class="competency-item-score">Level {score}</span>
            </div>
            <p class="competency-item-description">
              {getLevelDescriptionForCompetency(comp.id, score)}
            </p>
          </div>
        );
      })}
    </section>
  ))}
</div>
```

### Styling

```css
.competency-results {
  max-width: 720px;
  margin: 0 auto;
}

.competency-results-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.competency-results-header h2 {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  margin-bottom: var(--space-4);
}

.competency-results-level {
  display: block;
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
}

.competency-results-context {
  font-size: var(--text-base);
  color: var(--color-muted);
  margin-top: var(--space-2);
}

.competency-results-averages {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.competency-avg {
  text-align: center;
  padding: var(--space-4);
  background: color-mix(in srgb, var(--color-muted) 5%, transparent);
  border-radius: var(--radius-md);
}

.competency-avg-label {
  display: block;
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-bottom: var(--space-1);
}

.competency-avg-value {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
}

.competency-category {
  margin-bottom: var(--space-8);
}

.competency-category-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-2);
  border-bottom: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
}

.competency-item {
  padding: var(--space-4);
  margin-bottom: var(--space-3);
  border-radius: var(--radius-md);
  border-left: 3px solid transparent;
  background: color-mix(in srgb, var(--color-muted) 3%, transparent);
}

.competency-item[data-status="strength"] {
  border-left-color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 5%, transparent);
}

.competency-item[data-status="improvement"] {
  border-left-color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 5%, transparent);
}

.competency-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.competency-item-name {
  font-weight: var(--font-medium);
}

.competency-item-score {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.competency-item-description {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-muted);
}
```

---

## 11.7 `CompetencyCard`

Contextual display of single competency or subset. Used in later modules.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `competency` | `Competency` | required | Competency data |
| `score` | `number` | required | User's score (1-5) |
| `levelDescription` | `string` | required | Description for user's level |
| `status` | `'strength' \| 'improvement' \| 'neutral'` | `'neutral'` | Classification |

### Rendered Structure

```html
<div class="competency-card" data-status={status}>
  <div class="competency-card-header">
    <span class="competency-card-name">{competency.name}</span>
    <Badge variant="muted">{competency.category}</Badge>
  </div>
  <p class="competency-card-description">{levelDescription}</p>
</div>
```

### Styling

```css
.competency-card {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border-left: 3px solid transparent;
  background: color-mix(in srgb, var(--color-muted) 3%, transparent);
}

.competency-card[data-status="strength"] {
  border-left-color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 5%, transparent);
}

.competency-card[data-status="improvement"] {
  border-left-color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 5%, transparent);
}

.competency-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.competency-card-name {
  font-weight: var(--font-medium);
}

.competency-card-description {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-muted);
}
```

---

## Related Documents

- **Section 6**: Feedback & Status Components (Badge, Tooltip)
- **Section 4**: Form Input Components (TextInput, RadioGroup)
- **Design System**: Visual tokens, colors, typography, spacing
