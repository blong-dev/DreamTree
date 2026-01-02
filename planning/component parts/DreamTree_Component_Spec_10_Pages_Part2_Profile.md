# DreamTree Component Specification
## Section 10: Page Components — Part 2: Profile

> Profile page layout with read-only data display and data management components.

---

## 10.14 Profile

Read-only view of all user data gathered through the workbook.

### URL
`/profile`

### Structure (Top to Bottom)

1. `DataPolicyBanner` — Privacy reassurance
2. `ProfileHeader` — Name + visual prefs
3. `ProfileSection`: Skills Inventory
4. `ProfileSection`: Stories & Content
5. `ProfileSection`: Work Factors
6. `ProfileSection`: Values & Priorities
7. `ProfileSection`: Career Paths
8. `DataControls` — Download, restore, delete

### Rendered Structure

```html
<AppShell showBreadcrumb={false} showInput={false}>
  <div class="profile">
    <DataPolicyBanner />
    
    <ProfileHeader 
      name={user.name}
      backgroundColor={user.backgroundColor}
      fontFamily={user.fontFamily}
    />
    
    <ProfileSection
      title="Skills Inventory"
      editLink={{ 
        label: "Edit in workbook", 
        to: "/workbook/part-1/module-1/exercise-1" 
      }}
      lockedUntil={!hasSkills ? "Module 1.1" : null}
    >
      <h3 class="profile-subsection-title">Transferable Skills</h3>
      <SkillsList skills={user.transferableSkills} />
      
      <h3 class="profile-subsection-title">Self-Management Skills</h3>
      <SkillsList skills={user.selfManagementSkills} />
      
      <h3 class="profile-subsection-title">Knowledges</h3>
      <SkillsList skills={user.knowledges} />
    </ProfileSection>
    
    <ProfileSection
      title="Stories & Content"
      editLink={{ label: "Edit in workbook", to: "/workbook/..." }}
      lockedUntil={!hasStories ? "Module 1.1" : null}
    >
      <StoriesList stories={user.soaredStories} />
    </ProfileSection>
    
    <ProfileSection
      title="Work Factors"
      editLink={{ label: "Edit in workbook", to: "/workbook/..." }}
      lockedUntil={!hasWorkFactors ? "Module 1.2" : null}
    >
      <h3 class="profile-subsection-title">Location Preferences</h3>
      <RankedList items={user.locations} />
      
      <h3 class="profile-subsection-title">Workplace Environment</h3>
      <p>{user.workplaceEnvironment}</p>
      
      <h3 class="profile-subsection-title">People Preferences</h3>
      <p>{user.peoplePreferences}</p>
      
      <h3 class="profile-subsection-title">Compensation</h3>
      <p>BATNA: ${user.batna}</p>
    </ProfileSection>
    
    <ProfileSection
      title="Values & Priorities"
      editLink={{ label: "Edit in workbook", to: "/workbook/..." }}
      lockedUntil={!hasValues ? "Module 2.1" : null}
    >
      <h3 class="profile-subsection-title">Work Values</h3>
      <ValuesDisplay values={user.workValues} />
      
      <h3 class="profile-subsection-title">Life Values</h3>
      <ValuesDisplay values={user.lifeValues} />
      
      <h3 class="profile-subsection-title">Work Factor Priorities</h3>
      <RankedList items={user.workFactorPriorities} />
    </ProfileSection>
    
    <ProfileSection
      title="Career Paths"
      editLink={{ label: "Edit in workbook", to: "/workbook/..." }}
      lockedUntil={!hasCareerPaths ? "Module 2.4" : null}
    >
      {user.careerPaths.map(path => (
        <CareerPathCard key={path.id} path={path} />
      ))}
    </ProfileSection>
    
    <DataControls user={user} />
  </div>
</AppShell>
```

### Styling

```css
.profile {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

.profile-subsection-title {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-muted);
  margin: var(--space-4) 0 var(--space-2) 0;
}

.profile-subsection-title:first-child {
  margin-top: 0;
}
```

---

## 10.15 `DataPolicyBanner`

Privacy reassurance message at top of Profile.

### Rendered Structure

```html
<div class="data-policy-banner">
  <ShieldIcon class="data-policy-icon" aria-hidden="true" />
  <p class="data-policy-text">
    Your data belongs to you. We never sell or share your information. 
    You can download or delete everything at any time.
  </p>
  <a href="/privacy" class="data-policy-link">Privacy Policy →</a>
</div>
```

### Styling

```css
.data-policy-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-6);
}

.data-policy-icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.data-policy-text {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: 0;
}

.data-policy-link {
  font-size: var(--text-sm);
  color: var(--color-primary);
  text-decoration: none;
  white-space: nowrap;
}

.data-policy-link:hover {
  text-decoration: underline;
}
```

---

## 10.16 `ProfileHeader`

Name and visual preferences display.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | required | User's name |
| `backgroundColor` | `BackgroundColorId` | required | Selected background |
| `fontFamily` | `FontFamilyId` | required | Selected font |

### Rendered Structure

```html
<header class="profile-header">
  <h1 class="profile-name">{name}</h1>
  <p class="profile-visual">
    🎨 {getColorName(backgroundColor)} + {getFontName(fontFamily)}
  </p>
  <a href="/settings" class="profile-settings-link">Edit in Settings →</a>
</header>
```

### Styling

```css
.profile-header {
  margin-bottom: var(--space-8);
}

.profile-name {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  margin: 0;
}

.profile-visual {
  font-size: var(--text-base);
  color: var(--color-muted);
  margin: var(--space-2) 0 0 0;
}

.profile-settings-link {
  display: inline-block;
  font-size: var(--text-sm);
  color: var(--color-primary);
  text-decoration: none;
  margin-top: var(--space-2);
}

.profile-settings-link:hover {
  text-decoration: underline;
}
```

---

## 10.17 `ProfileSection`

Reusable section wrapper with optional lock state.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Section heading |
| `editLink` | `{ label: string, to: string }` | — | Workbook edit link |
| `lockedUntil` | `string \| null` | `null` | Module name if locked |
| `children` | `ReactNode` | required | Section content |

### Rendered Structure

```html
<section class="profile-section" data-locked={!!lockedUntil}>
  <header class="profile-section-header">
    <h2 class="profile-section-title">{title}</h2>
    {editLink && !lockedUntil && (
      <a href={editLink.to} class="profile-section-edit">
        {editLink.label} →
      </a>
    )}
  </header>
  
  {lockedUntil ? (
    <div class="profile-section-locked">
      <LockIcon aria-hidden="true" />
      <p>You'll unlock this in <strong>{lockedUntil}</strong></p>
    </div>
  ) : (
    <div class="profile-section-content">
      {children}
    </div>
  )}
</section>
```

### Styling

```css
.profile-section {
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 15%, transparent);
}

.profile-section:first-of-type {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.profile-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.profile-section-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin: 0;
}

.profile-section-edit {
  font-size: var(--text-sm);
  color: var(--color-primary);
  text-decoration: none;
}

.profile-section-edit:hover {
  text-decoration: underline;
}

.profile-section-locked {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6);
  background: color-mix(in srgb, var(--color-muted) 5%, transparent);
  border-radius: var(--radius-md);
  color: var(--color-muted);
}

.profile-section-locked svg {
  width: 24px;
  height: 24px;
  opacity: 0.5;
}

.profile-section-locked p {
  margin: 0;
  font-size: var(--text-sm);
}

.profile-section-content {
  /* Content styling handled by children */
}
```

---

## 10.18 `SkillsList`

Displays ranked skills with mastery dots.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `skills` | `Skill[]` | required | Skills to display |

### Types

```typescript
type Skill = {
  id: string;
  name: string;
  mastery: number; // 1-5
  rank: number;
};
```

### Rendered Structure

```html
<ol class="skills-list">
  {skills.map(skill => (
    <li key={skill.id} class="skills-list-item">
      <span class="skills-list-rank">{skill.rank}.</span>
      <span class="skills-list-name">{skill.name}</span>
      <MasteryDots value={skill.mastery} />
    </li>
  ))}
</ol>
```

### Styling

```css
.skills-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.skills-list-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) 0;
  border-bottom: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 10%, transparent);
}

.skills-list-item:last-child {
  border-bottom: none;
}

.skills-list-rank {
  width: 24px;
  font-size: var(--text-sm);
  color: var(--color-muted);
  text-align: right;
}

.skills-list-name {
  flex: 1;
  font-size: var(--text-base);
}
```

---

## 10.19 `MasteryDots`

Visual mastery rating display (1-5 dots).

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | required | Mastery level 1-5 |
| `max` | `number` | `5` | Maximum dots |

### Rendered Structure

```html
<div 
  class="mastery-dots" 
  role="img" 
  aria-label={`Mastery: ${value} out of ${max}`}
>
  {Array.from({ length: max }, (_, i) => (
    <span 
      key={i} 
      class="mastery-dot" 
      data-filled={i < value}
    />
  ))}
</div>
```

### Styling

```css
.mastery-dots {
  display: flex;
  gap: 4px;
}

.mastery-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-muted) 30%, transparent);
}

.mastery-dot[data-filled="true"] {
  background: var(--color-primary);
}
```

---

## 10.20 `StoriesList`

List of SOARED stories with titles only.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stories` | `Story[]` | required | Stories to display |

### Types

```typescript
type Story = {
  id: string;
  title: string;
  workbookLocation: BreadcrumbLocation;
};
```

### Rendered Structure

```html
<ul class="stories-list">
  {stories.map(story => (
    <li key={story.id} class="stories-list-item">
      <span class="stories-list-title">{story.title}</span>
      <a 
        href={getWorkbookUrl(story.workbookLocation)} 
        class="stories-list-link"
      >
        View in workbook →
      </a>
    </li>
  ))}
</ul>
```

### Styling

```css
.stories-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.stories-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 10%, transparent);
}

.stories-list-item:last-child {
  border-bottom: none;
}

.stories-list-title {
  font-size: var(--text-base);
}

.stories-list-link {
  font-size: var(--text-sm);
  color: var(--color-primary);
  text-decoration: none;
  white-space: nowrap;
}

.stories-list-link:hover {
  text-decoration: underline;
}
```

---

## 10.21 `RankedList`

Generic ranked list display.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `RankedItem[]` | required | Items to display |

### Types

```typescript
type RankedItem = {
  id: string;
  rank: number;
  label: string;
};
```

### Rendered Structure

```html
<ol class="ranked-list">
  {items.map(item => (
    <li key={item.id} class="ranked-list-item">
      <span class="ranked-list-rank">{item.rank}.</span>
      <span class="ranked-list-label">{item.label}</span>
    </li>
  ))}
</ol>
```

### Styling

```css
.ranked-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ranked-list-item {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  padding: var(--space-2) 0;
}

.ranked-list-rank {
  width: 24px;
  font-size: var(--text-sm);
  color: var(--color-muted);
  text-align: right;
}

.ranked-list-label {
  font-size: var(--text-base);
}
```

---

## 10.22 `ValuesDisplay`

Display for work/life values.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `values` | `string[]` | required | Value statements |

### Rendered Structure

```html
<ul class="values-display">
  {values.map((value, index) => (
    <li key={index} class="values-display-item">
      {value}
    </li>
  ))}
</ul>
```

### Styling

```css
.values-display {
  list-style: disc;
  padding-left: var(--space-5);
  margin: 0;
}

.values-display-item {
  font-size: var(--text-base);
  padding: var(--space-1) 0;
}
```

---

## 10.23 `CareerPathCard`

Display card for a career path option.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `path` | `CareerPath` | required | Career path data |

### Types

```typescript
type CareerPath = {
  id: string;
  title: string;
  timeline: string;
  description: string;
  workbookLocation: BreadcrumbLocation;
};
```

### Rendered Structure

```html
<div class="career-path-card">
  <h3 class="career-path-title">{path.title}</h3>
  <p class="career-path-timeline">{path.timeline}</p>
  <p class="career-path-description">{path.description}</p>
  <a 
    href={getWorkbookUrl(path.workbookLocation)} 
    class="career-path-link"
  >
    View details in workbook →
  </a>
</div>
```

### Styling

```css
.career-path-card {
  padding: var(--space-4);
  background: color-mix(in srgb, var(--color-muted) 5%, transparent);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-3);
}

.career-path-card:last-child {
  margin-bottom: 0;
}

.career-path-title {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  margin: 0;
}

.career-path-timeline {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: var(--space-1) 0 0 0;
}

.career-path-description {
  font-size: var(--text-sm);
  margin: var(--space-2) 0 0 0;
}

.career-path-link {
  display: inline-block;
  font-size: var(--text-sm);
  color: var(--color-primary);
  text-decoration: none;
  margin-top: var(--space-2);
}

.career-path-link:hover {
  text-decoration: underline;
}
```

---

## 10.24 `DataControls`

Download, restore, and delete data controls.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onDownload` | `(format: 'json' \| 'zip') => void` | required | Download handler |
| `onRestore` | `(file: File) => void` | required | Restore handler |
| `onDelete` | `() => void` | required | Delete handler |

### Rendered Structure

```html
<div class="data-controls">
  <h2 class="data-controls-title">Data Management</h2>
  
  <DownloadDataCard onDownload={onDownload} />
  <RestoreDataCard onRestore={onRestore} />
  <DeleteDataCard onDelete={onDelete} />
</div>
```

### Styling

```css
.data-controls {
  margin-top: var(--space-10);
  padding-top: var(--space-6);
  border-top: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 15%, transparent);
}

.data-controls-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-4) 0;
}
```

---

## 10.25 `DownloadDataCard`

Download data with format selection.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onDownload` | `(format: 'json' \| 'zip') => void` | required | Download handler |

### Rendered Structure

```html
<div class="data-card">
  <div class="data-card-content">
    <h3 class="data-card-title">Download Your Data</h3>
    <p class="data-card-description">
      Download as JSON to back up and restore later, or as a ZIP with 
      readable documents.
    </p>
  </div>
  <div class="data-card-actions">
    <Button 
      variant="secondary" 
      size="sm"
      onClick={() => onDownload('json')}
    >
      Download JSON
    </Button>
    <Button 
      variant="secondary" 
      size="sm"
      onClick={() => onDownload('zip')}
    >
      Download ZIP
    </Button>
  </div>
</div>
```

---

## 10.26 `RestoreDataCard`

Restore data from JSON backup.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onRestore` | `(file: File) => void` | required | Restore handler |

### State

```typescript
type RestoreState = 'idle' | 'preview' | 'confirming';
```

### Rendered Structure

```html
<div class="data-card">
  <div class="data-card-content">
    <h3 class="data-card-title">Restore from Backup</h3>
    <p class="data-card-description">
      Upload a JSON backup to restore your data. This will fully replace 
      your current data.
    </p>
  </div>
  <div class="data-card-actions">
    <Button 
      variant="secondary" 
      size="sm"
      onClick={openFileDialog}
    >
      Upload JSON
    </Button>
  </div>
  <input 
    type="file" 
    accept=".json"
    ref={fileInputRef}
    onChange={handleFileSelect}
    hidden
  />
</div>
```

---

## 10.27 `RestoreModal`

Preview and confirm data restore.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Show/hide modal |
| `onClose` | `() => void` | required | Close handler |
| `preview` | `RestorePreview` | required | Data preview |
| `onConfirm` | `() => void` | required | Confirm handler |

### Types

```typescript
type RestorePreview = {
  name: string;
  completionPercent: number;
  skillsCount: number;
  storiesCount: number;
  exportDate: Date;
};
```

### Rendered Structure

```html
<Modal
  open={open}
  onClose={onClose}
  title="Restore Your Data"
  size="md"
>
  <div class="restore-preview">
    <p class="restore-preview-intro">
      This backup contains:
    </p>
    <ul class="restore-preview-list">
      <li><strong>Name:</strong> {preview.name}</li>
      <li><strong>Progress:</strong> {preview.completionPercent}% complete</li>
      <li><strong>Skills:</strong> {preview.skillsCount} identified</li>
      <li><strong>Stories:</strong> {preview.storiesCount} captured</li>
      <li><strong>Exported:</strong> {formatDate(preview.exportDate)}</li>
    </ul>
    <p class="restore-warning">
      ⚠️ This will fully replace your current data. You can edit any 
      answers in the workbook after upload.
    </p>
  </div>
  
  <div class="modal-actions">
    <Button variant="secondary" onClick={onClose}>
      Cancel
    </Button>
    <Button variant="primary" onClick={onConfirm}>
      Restore
    </Button>
  </div>
</Modal>
```

---

## 10.28 `DeleteDataCard`

Delete all data with warning.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onDelete` | `() => void` | required | Delete handler (opens modal) |

### Rendered Structure

```html
<div class="data-card data-card-danger">
  <div class="data-card-content">
    <h3 class="data-card-title">Delete All Data</h3>
    <p class="data-card-description">
      Permanently delete all your data. This cannot be undone.
    </p>
  </div>
  <div class="data-card-actions">
    <Button 
      variant="danger" 
      size="sm"
      onClick={onDelete}
    >
      Delete All Data
    </Button>
  </div>
</div>
```

### Data Card Styling

```css
.data-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  background: color-mix(in srgb, var(--color-muted) 5%, transparent);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-3);
}

.data-card:last-child {
  margin-bottom: 0;
}

.data-card-danger {
  background: color-mix(in srgb, var(--color-error) 5%, transparent);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-error) 20%, transparent);
}

.data-card-content {
  flex: 1;
}

.data-card-title {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  margin: 0;
}

.data-card-description {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: var(--space-1) 0 0 0;
}

.data-card-actions {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .data-card {
    flex-direction: column;
    align-items: stretch;
  }
  
  .data-card-actions {
    margin-top: var(--space-3);
  }
}
```

---

## 10.29 `DeleteDataModal` (Step 1)

First step of delete flow — explains consequences.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Show/hide modal |
| `onClose` | `() => void` | required | Close handler |
| `onContinue` | `() => void` | required | Proceed to step 2 |

### Rendered Structure

```html
<Modal
  open={open}
  onClose={onClose}
  title="Delete All Your Data"
  size="md"
>
  <div class="delete-warning">
    <p>You are about to delete:</p>
    <ul>
      <li>All your workbook progress</li>
      <li>All identified skills and stories</li>
      <li>All preferences and settings</li>
      <li>All tool instances you've created</li>
    </ul>
    <p class="delete-warning-emphasis">
      All context will be lost. This cannot be undone.
    </p>
  </div>
  
  <div class="modal-actions">
    <Button variant="secondary" onClick={onClose}>
      Cancel
    </Button>
    <Button variant="danger" onClick={onContinue}>
      Continue
    </Button>
  </div>
</Modal>
```

### Styling

```css
.delete-warning ul {
  margin: var(--space-3) 0;
  padding-left: var(--space-5);
}

.delete-warning li {
  padding: var(--space-1) 0;
}

.delete-warning-emphasis {
  font-weight: var(--font-medium);
  color: var(--color-error);
}
```

---

## 10.30 `DeleteConfirmModal` (Step 2)

Second step of delete flow — type to confirm.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Show/hide modal |
| `onClose` | `() => void` | required | Close handler |
| `onConfirm` | `() => void` | required | Final delete handler |

### State

```typescript
const [confirmText, setConfirmText] = useState('');
const isValid = confirmText === 'I UNDERSTAND WHAT DELETE MEANS';
```

### Rendered Structure

```html
<Modal
  open={open}
  onClose={onClose}
  title="This is Permanent"
  size="md"
>
  <div class="delete-confirm">
    <p>This action cannot be undone. Your data will be permanently deleted.</p>
    <p>Type <strong>I UNDERSTAND WHAT DELETE MEANS</strong> to confirm:</p>
    <TextInput
      value={confirmText}
      onChange={setConfirmText}
      placeholder="Type the confirmation phrase"
      autoFocus
    />
  </div>
  
  <div class="modal-actions">
    <Button variant="secondary" onClick={onClose}>
      Cancel
    </Button>
    <Button 
      variant="danger" 
      onClick={onConfirm}
      disabled={!isValid}
    >
      Delete Everything
    </Button>
  </div>
</Modal>
```

---

## 10.31 `RestorePrompt`

Prompt for returning users with no data on file.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onRestore` | `() => void` | required | Open restore flow |
| `onStartFresh` | `() => void` | required | Begin new journey |

### Rendered Structure

```html
<div class="restore-prompt">
  <h2 class="restore-prompt-title">Welcome Back!</h2>
  <p class="restore-prompt-description">
    It looks like you've used DreamTree before. Do you have a JSON 
    backup to restore your progress?
  </p>
  <div class="restore-prompt-actions">
    <Button variant="primary" onClick={onRestore}>
      Restore from Backup
    </Button>
    <Button variant="secondary" onClick={onStartFresh}>
      Start Fresh
    </Button>
  </div>
</div>
```

### Styling

```css
.restore-prompt {
  max-width: 400px;
  margin: 0 auto;
  padding: var(--space-8);
  text-align: center;
}

.restore-prompt-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-4) 0;
}

.restore-prompt-description {
  font-size: var(--text-base);
  color: var(--color-muted);
  margin: 0 0 var(--space-6) 0;
}

.restore-prompt-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
```

---

## Related Documents

- **Section 10 Part 1**: Dashboard Components
- **Section 10 Part 3**: Settings Page Components
- **Section 7**: Overlay Components (Modal)
- **Design System**: Visual tokens, colors, typography, spacing
