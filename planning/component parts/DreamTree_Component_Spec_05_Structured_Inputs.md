# DreamTree Component Specification
## Section 5: Structured Input Components

> Complex inputs: list builders, ranking grids, tag selectors, and SOARED forms.

---

## 5.1 `ListBuilder`

Dynamic list for adding, removing, and optionally reordering items.

### Purpose
Captures variable-length lists — jobs held, skills identified, courses taken, challenge stories.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `ListItem[]` | `[]` | Current list items |
| `onChange` | `(items: ListItem[]) => void` | required | List change handler |
| `label` | `string` | required | Accessible label |
| `placeholder` | `string` | `'Add item...'` | Placeholder for new item input |
| `addLabel` | `string` | `'+ Add another'` | Label for add button |
| `maxItems` | `number` | — | Maximum allowed items |
| `minItems` | `number` | `0` | Minimum required items |
| `reorderable` | `boolean` | `false` | Enable drag-to-reorder |
| `itemType` | `'text' \| 'textarea'` | `'text'` | Input type for items |
| `disabled` | `boolean` | `false` | Disable all interactions |
| `id` | `string` | auto-generated | HTML id attribute |

### Types

```typescript
type ListItem = {
  id: string;
  value: string;
};
```

### Visual Structure

```
List every job you've had:

┌─────────────────────────────────────────────────┐
│ Marketing Coordinator, ABC Corp           [×]  │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ Barista, Local Coffee Shop                [×]  │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ Add item...                                     │
└─────────────────────────────────────────────────┘
[ + Add another ]

3 items
```

### States

| State | Item Border | Background |
|-------|-------------|------------|
| Default | `--color-muted` @ 30% | transparent |
| Hover | `--color-muted` @ 50% | transparent |
| Focus within | `--color-primary` + `--focus-ring` | transparent |
| Dragging | `--color-primary` @ 50% | `--color-primary` @ 5% |
| Drop target | dashed `--color-primary` | `--color-primary` @ 8% |

### Rendered Structure

```html
<div class="list-builder" data-disabled={disabled}>
  <label class="list-builder-label" id={`${id}-label`}>{label}</label>
  
  <ul 
    class="list-builder-items" 
    role="list" 
    aria-labelledby={`${id}-label`}
  >
    {items.map((item, index) => (
      <ListBuilderItem
        key={item.id}
        item={item}
        index={index}
        onUpdate={(value) => updateItem(item.id, value)}
        onRemove={() => removeItem(item.id)}
        onMoveUp={reorderable ? () => moveItem(index, index - 1) : undefined}
        onMoveDown={reorderable ? () => moveItem(index, index + 1) : undefined}
        reorderable={reorderable}
        itemType={itemType}
        disabled={disabled}
        canMoveUp={index > 0}
        canMoveDown={index < items.length - 1}
        canRemove={items.length > minItems}
      />
    ))}
  </ul>
  
  {(!maxItems || items.length < maxItems) && (
    <div class="list-builder-add">
      <input
        type="text"
        class="list-builder-add-input"
        placeholder={placeholder}
        value={newItemValue}
        onChange={(e) => setNewItemValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && addItem()}
        disabled={disabled}
      />
    </div>
  )}
  
  {(!maxItems || items.length < maxItems) && (
    <button 
      class="list-builder-add-button"
      onClick={addItem}
      disabled={disabled || !newItemValue.trim()}
    >
      {addLabel}
    </button>
  )}
  
  {maxItems && (
    <span class="list-builder-count">
      {items.length}{maxItems ? ` / ${maxItems}` : ''} items
    </span>
  )}
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Max width | 720px |
| Item padding | `space-3` vertical, `space-4` horizontal |
| Item border | `border-thin`, `radius-sm` |
| Item gap | `space-2` |
| Remove button | Icon-only, 24px, `--color-muted`, hover `--color-error` |
| Add button | Text button, `--color-primary`, `font-medium` |
| Counter | `text-xs`, `--color-muted`, right-aligned |

### Animations

| Action | Animation |
|--------|-----------|
| Add item | Fade in + slide down, `duration-normal` |
| Remove item | Fade out + collapse height, `duration-normal` |
| Reorder | Item follows cursor, others shift with `duration-fast` |

### Keyboard Handling

| Key | Context | Action |
|-----|---------|--------|
| Enter | In add input | Add new item, clear input |
| Delete/Backspace | On item (not editing) | Remove item |
| Arrow Up/Down | On item | Move focus |
| Alt + Arrow Up/Down | On item | Move item (if reorderable) |

### CSS Implementation

```css
.list-builder {
  display: flex;
  flex-direction: column;
  max-width: 720px;
}

.list-builder-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-2);
}

.list-builder-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-builder-add {
  margin-top: var(--space-2);
}

.list-builder-add-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: var(--border-thin) dashed color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  background: transparent;
}

.list-builder-add-input:focus {
  outline: none;
  border-style: solid;
  border-color: var(--color-primary);
}

.list-builder-add-button {
  margin-top: var(--space-2);
  padding: var(--space-2) 0;
  background: none;
  border: none;
  color: var(--color-primary);
  font-weight: var(--font-medium);
  cursor: pointer;
}

.list-builder-add-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.list-builder-count {
  font-size: var(--text-xs);
  color: var(--color-muted);
  text-align: right;
  margin-top: var(--space-2);
}

/* Item animations */
@keyframes list-item-enter {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.list-builder-item-enter {
  animation: list-item-enter var(--duration-normal) ease;
}
```

---

## 5.2 `ListBuilderItem`

Individual item within a ListBuilder.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `item` | `ListItem` | required | Item data |
| `index` | `number` | required | Position in list |
| `onUpdate` | `(value: string) => void` | required | Edit handler |
| `onRemove` | `() => void` | required | Remove handler |
| `onMoveUp` | `() => void` | — | Move up handler |
| `onMoveDown` | `() => void` | — | Move down handler |
| `reorderable` | `boolean` | `false` | Show reorder controls |
| `itemType` | `'text' \| 'textarea'` | `'text'` | Input type when editing |
| `disabled` | `boolean` | `false` | Disable interactions |
| `canMoveUp` | `boolean` | `true` | Enable move up |
| `canMoveDown` | `boolean` | `true` | Enable move down |
| `canRemove` | `boolean` | `true` | Enable remove |

### States

| State | Behavior |
|-------|----------|
| Display | Shows value as text, hover reveals actions |
| Editing | Inline input replaces text, save on blur/enter |
| Dragging | Elevated appearance, follows cursor |

### Rendered Structure

```html
<li 
  class="list-builder-item"
  data-dragging={isDragging}
  draggable={reorderable && !disabled}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
>
  {reorderable && (
    <button 
      class="list-builder-item-handle"
      aria-label="Drag to reorder"
      disabled={disabled}
    >
      <GripVerticalIcon />
    </button>
  )}
  
  <div class="list-builder-item-content">
    {isEditing ? (
      itemType === 'textarea' ? (
        <textarea
          class="list-builder-item-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && saveEdit()}
          autoFocus
        />
      ) : (
        <input
          type="text"
          class="list-builder-item-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
          autoFocus
        />
      )
    ) : (
      <span 
        class="list-builder-item-value"
        onClick={() => !disabled && setIsEditing(true)}
      >
        {item.value}
      </span>
    )}
  </div>
  
  <div class="list-builder-item-actions">
    {reorderable && (
      <>
        <button
          class="list-builder-item-action"
          onClick={onMoveUp}
          disabled={disabled || !canMoveUp}
          aria-label="Move up"
        >
          <ChevronUpIcon />
        </button>
        <button
          class="list-builder-item-action"
          onClick={onMoveDown}
          disabled={disabled || !canMoveDown}
          aria-label="Move down"
        >
          <ChevronDownIcon />
        </button>
      </>
    )}
    {canRemove && (
      <button
        class="list-builder-item-action list-builder-item-remove"
        onClick={onRemove}
        disabled={disabled}
        aria-label="Remove item"
      >
        <XIcon />
      </button>
    )}
  </div>
</li>
```

### Styling

| Property | Value |
|----------|-------|
| Min height | 44px |
| Padding | `space-3` vertical, `space-4` horizontal |
| Border | `border-thin`, `radius-sm` |
| Handle | 20px, `--color-muted`, cursor grab |
| Actions | Hidden by default, visible on hover/focus |
| Remove hover | `--color-error` |

### CSS Implementation

```css
.list-builder-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 44px;
  padding: var(--space-3) var(--space-4);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-sm);
  transition: border-color var(--duration-fast) ease,
              background-color var(--duration-fast) ease;
}

.list-builder-item:hover {
  border-color: color-mix(in srgb, var(--color-muted) 50%, transparent);
}

.list-builder-item:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.list-builder-item[data-dragging="true"] {
  border-color: color-mix(in srgb, var(--color-primary) 50%, transparent);
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
  cursor: grabbing;
}

.list-builder-item-handle {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: grab;
}

.list-builder-item-content {
  flex: 1;
  min-width: 0;
}

.list-builder-item-value {
  display: block;
  cursor: text;
}

.list-builder-item-input {
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  font-size: inherit;
  font-family: inherit;
  color: inherit;
}

.list-builder-item-input:focus {
  outline: none;
}

.list-builder-item-actions {
  display: flex;
  gap: var(--space-1);
  opacity: 0;
  transition: opacity var(--duration-fast) ease;
}

.list-builder-item:hover .list-builder-item-actions,
.list-builder-item:focus-within .list-builder-item-actions {
  opacity: 1;
}

.list-builder-item-action {
  width: 24px;
  height: 24px;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: color var(--duration-fast) ease,
              background-color var(--duration-fast) ease;
}

.list-builder-item-action:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-muted) 10%, transparent);
}

.list-builder-item-remove:hover:not(:disabled) {
  color: var(--color-error);
}

.list-builder-item-action:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
```

---

## 5.3 `RankingGrid`

Pairwise comparison tool for ranking items.

### Purpose
Helps users rank items by comparing two at a time. More accurate than direct ranking for subjective preferences. Uses comparison-based sorting algorithm requiring ~n*log(n) comparisons.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `RankingItem[]` | required | Items to rank |
| `comparisons` | `Comparison[]` | `[]` | Completed comparisons |
| `onCompare` | `(winner: string, loser: string) => void` | required | Comparison handler |
| `onComplete` | `(ranked: RankingItem[]) => void` | required | Completion handler |
| `label` | `string` | required | Tool label |
| `description` | `string` | — | Instructions |
| `id` | `string` | auto-generated | HTML id attribute |

### Types

```typescript
type RankingItem = {
  id: string;
  value: string;
};

type Comparison = {
  winner: string;
  loser: string;
  timestamp: Date;
};
```

### Visual Structure

```
Which is more important to you?

┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│    Teaching     │ vs  │   Negotiating   │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
      [Choose]               [Choose]


Progress: ●●●●●●○○○○○○○ 6 of 13 comparisons

─────────────────────────────────────────────

Current ranking (updates as you compare):

1. Problem Solving
2. Teaching
3. Communication
...
```

### Rendered Structure

```html
<div class="ranking-grid">
  <p class="ranking-grid-prompt">{label}</p>
  {description && <p class="ranking-grid-description">{description}</p>}
  
  <div class="ranking-grid-comparison">
    <RankingPair
      item={currentPair[0]}
      onSelect={() => handleSelect(currentPair[0].id, currentPair[1].id)}
      position="left"
    />
    
    <span class="ranking-grid-vs" aria-hidden="true">vs</span>
    
    <RankingPair
      item={currentPair[1]}
      onSelect={() => handleSelect(currentPair[1].id, currentPair[0].id)}
      position="right"
    />
  </div>
  
  <div class="ranking-grid-progress">
    <div class="ranking-grid-progress-bar">
      <div 
        class="ranking-grid-progress-fill"
        style={{ width: `${(comparisons.length / totalComparisons) * 100}%` }}
      />
    </div>
    <span class="ranking-grid-progress-text">
      {comparisons.length} of {totalComparisons} comparisons
    </span>
  </div>
  
  {currentRanking.length > 0 && (
    <div class="ranking-grid-current">
      <h4 class="ranking-grid-current-title">
        Current ranking (updates as you compare):
      </h4>
      <ol class="ranking-grid-current-list">
        {currentRanking.map((item, index) => (
          <li key={item.id}>{item.value}</li>
        ))}
      </ol>
    </div>
  )}
</div>
```

### Keyboard Handling

| Key | Action |
|-----|--------|
| Arrow Left/Right | Focus left/right option |
| Enter/Space | Select focused option |
| 1 | Select left option |
| 2 | Select right option |

### Animations

| Action | Animation |
|--------|-----------|
| New pair | Fade in from edges |
| Selection | Winner pulses, loser fades |
| Ranking update | Items shift smoothly |

### CSS Implementation

```css
.ranking-grid {
  max-width: 720px;
}

.ranking-grid-prompt {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  text-align: center;
  margin-bottom: var(--space-2);
}

.ranking-grid-description {
  font-size: var(--text-sm);
  color: var(--color-muted);
  text-align: center;
  margin-bottom: var(--space-6);
}

.ranking-grid-comparison {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
}

.ranking-grid-vs {
  font-size: var(--text-sm);
  color: var(--color-muted);
  font-weight: var(--font-medium);
}

.ranking-grid-progress {
  margin-top: var(--space-6);
  text-align: center;
}

.ranking-grid-progress-bar {
  height: 4px;
  background: color-mix(in srgb, var(--color-muted) 20%, transparent);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-2);
}

.ranking-grid-progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width var(--duration-normal) ease;
}

.ranking-grid-progress-text {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.ranking-grid-current {
  margin-top: var(--space-6);
  padding-top: var(--space-6);
  border-top: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 20%, transparent);
}

.ranking-grid-current-title {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-bottom: var(--space-3);
}

.ranking-grid-current-list {
  padding-left: var(--space-4);
}

.ranking-grid-current-list li {
  padding: var(--space-1) 0;
}

/* Pair entrance animation */
@keyframes pair-enter-left {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pair-enter-right {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

---

## 5.4 `RankingPair`

Single option card in a pairwise comparison.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `item` | `RankingItem` | required | Item to display |
| `onSelect` | `() => void` | required | Selection handler |
| `position` | `'left' \| 'right'` | required | Position in pair |
| `disabled` | `boolean` | `false` | Disable selection |

### States

| State | Border | Background |
|-------|--------|------------|
| Default | `--color-muted` @ 30% | transparent |
| Hover | `--color-primary` @ 50% | `--color-primary` @ 5% |
| Focus | `--color-primary` + `--focus-ring` | `--color-primary` @ 5% |
| Selected | `--color-primary` | `--color-primary` @ 10% |

### Rendered Structure

```html
<button
  class="ranking-pair"
  data-position={position}
  onClick={onSelect}
  disabled={disabled}
>
  <span class="ranking-pair-value">{item.value}</span>
  <span class="ranking-pair-action">Choose</span>
</button>
```

### Styling

| Property | Value |
|----------|-------|
| Width | 200px (desktop), 140px (mobile) |
| Min height | 100px |
| Padding | `space-4` |
| Border | `border-thin`, `radius-md` |
| Value | `text-base`, `font-medium`, centered |
| Action | `text-sm`, `--color-primary`, `margin-top: space-2` |

### CSS Implementation

```css
.ranking-pair {
  width: 200px;
  min-height: 100px;
  padding: var(--space-4);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-md);
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  cursor: pointer;
  transition: border-color var(--duration-fast) ease,
              background-color var(--duration-fast) ease,
              transform var(--duration-fast) ease;
}

.ranking-pair:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--color-primary) 50%, transparent);
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
}

.ranking-pair:focus {
  outline: none;
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
  box-shadow: var(--focus-ring);
}

.ranking-pair:active:not(:disabled) {
  transform: scale(0.98);
}

.ranking-pair-value {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  text-align: center;
}

.ranking-pair-action {
  font-size: var(--text-sm);
  color: var(--color-primary);
}

@media (max-width: 767px) {
  .ranking-pair {
    width: 140px;
    min-height: 80px;
    padding: var(--space-3);
  }
  
  .ranking-pair-value {
    font-size: var(--text-sm);
  }
}
```

---

## 5.5 `TagSelector`

Select multiple tags from predefined options.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Tag[]` | required | Available tags |
| `selected` | `string[]` | `[]` | Selected tag IDs |
| `onChange` | `(selected: string[]) => void` | required | Selection handler |
| `label` | `string` | required | Accessible label |
| `description` | `string` | — | Help text |
| `maxSelections` | `number` | — | Maximum selections |
| `searchable` | `boolean` | `false` | Enable filtering |
| `disabled` | `boolean` | `false` | Disable interactions |
| `id` | `string` | auto-generated | HTML id attribute |

### Types

```typescript
type Tag = {
  id: string;
  label: string;
  category?: string;
};
```

### States

| State | Border | Background | Text |
|-------|--------|------------|------|
| Default | `--color-muted` @ 30% | transparent | `--color-text` |
| Hover | `--color-muted` @ 50% | transparent | `--color-text` |
| Selected | `--color-primary` | `--color-primary` @ 10% | `--color-text` |
| Disabled | `--color-muted` @ 15% | transparent | `--color-muted` |

### Rendered Structure

```html
<div class="tag-selector" data-disabled={disabled}>
  <label class="tag-selector-label" id={`${id}-label`}>{label}</label>
  {description && <p class="tag-selector-description">{description}</p>}
  
  {searchable && (
    <input
      type="text"
      class="tag-selector-search"
      placeholder="Search tags..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  )}
  
  <div 
    class="tag-selector-options"
    role="listbox"
    aria-labelledby={`${id}-label`}
    aria-multiselectable="true"
  >
    {filteredOptions.map(tag => (
      <button
        key={tag.id}
        class="tag-selector-tag"
        role="option"
        aria-selected={selected.includes(tag.id)}
        data-selected={selected.includes(tag.id)}
        onClick={() => toggleTag(tag.id)}
        disabled={disabled || (maxSelections && selected.length >= maxSelections && !selected.includes(tag.id))}
      >
        {tag.label}
        {selected.includes(tag.id) && <CheckIcon aria-hidden="true" />}
      </button>
    ))}
  </div>
  
  {maxSelections && (
    <span class="tag-selector-count">
      {selected.length} of {maxSelections} selected
    </span>
  )}
</div>
```

### Styling

| Property | Value |
|----------|-------|
| Layout | Flexbox, wrap, `gap: space-2` |
| Tag padding | `space-2` vertical, `space-3` horizontal |
| Tag border | `border-thin`, `radius-full` (pill) |
| Checkmark | 14px, `margin-left: space-1` |

### CSS Implementation

```css
.tag-selector {
  display: flex;
  flex-direction: column;
}

.tag-selector-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-2);
}

.tag-selector-description {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-bottom: var(--space-3);
}

.tag-selector-search {
  margin-bottom: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
}

.tag-selector-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tag-selector-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border: var(--border-thin) solid color-mix(in srgb, var(--color-muted) 30%, transparent);
  border-radius: var(--radius-full);
  background: transparent;
  font-size: var(--text-sm);
  cursor: pointer;
  transition: border-color var(--duration-fast) ease,
              background-color var(--duration-fast) ease;
}

.tag-selector-tag:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--color-muted) 50%, transparent);
}

.tag-selector-tag[data-selected="true"] {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.tag-selector-tag:focus {
  outline: none;
  box-shadow: var(--focus-ring);
}

.tag-selector-tag:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tag-selector-tag svg {
  width: 14px;
  height: 14px;
}

.tag-selector-count {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-top: var(--space-2);
}
```

---

## 5.6 `SkillTagger`

Specialized tag selector for linking skills to SOARED stories.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `skills` | `Skill[]` | required | User's skill inventory |
| `selectedSkillIds` | `string[]` | `[]` | Currently tagged skills |
| `onChange` | `(skillIds: string[]) => void` | required | Selection handler |
| `storyTitle` | `string` | required | Story being tagged |
| `suggestedSkillIds` | `string[]` | `[]` | AI-suggested skills (Phase 4+) |
| `disabled` | `boolean` | `false` | Disable interactions |
| `id` | `string` | auto-generated | HTML id attribute |

### Types

```typescript
type Skill = {
  id: string;
  name: string;
  type: 'transferable' | 'self-management' | 'knowledge';
  mastery: number;
};
```

### Behavior

- Groups skills by type (transferable, self-management, knowledge)
- No maximum limit
- Search/filter available
- AI suggestions highlighted with subtle border glow (Phase 4+)

### Rendered Structure

```html
<div class="skill-tagger" data-disabled={disabled}>
  <label class="skill-tagger-label">
    Tag skills demonstrated in "{storyTitle}"
  </label>
  
  <input
    type="text"
    class="skill-tagger-search"
    placeholder="Search skills..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
  
  {Object.entries(groupedSkills).map(([type, skills]) => (
    <div key={type} class="skill-tagger-group">
      <h4 class="skill-tagger-group-title">{formatSkillType(type)}</h4>
      <div class="skill-tagger-options">
        {skills.map(skill => (
          <button
            key={skill.id}
            class="skill-tagger-skill"
            data-selected={selectedSkillIds.includes(skill.id)}
            data-suggested={suggestedSkillIds.includes(skill.id)}
            onClick={() => toggleSkill(skill.id)}
            disabled={disabled}
          >
            {skill.name}
            {selectedSkillIds.includes(skill.id) && <CheckIcon />}
          </button>
        ))}
      </div>
    </div>
  ))}
</div>
```

### CSS for Suggested Skills

```css
.skill-tagger-skill[data-suggested="true"] {
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-primary) 30%, transparent),
              0 0 8px color-mix(in srgb, var(--color-primary) 20%, transparent);
}
```

---

## 5.7 `SOAREDForm`

Structured form for SOARED story capture.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `SOAREDStory` | `{}` | Current story data |
| `onChange` | `(story: SOAREDStory) => void` | required | Change handler |
| `onComplete` | `() => void` | — | Completion handler |
| `title` | `string` | — | Optional story title |
| `onTitleChange` | `(title: string) => void` | — | Title change handler |
| `disabled` | `boolean` | `false` | Disable inputs |
| `id` | `string` | auto-generated | HTML id attribute |

### Types

```typescript
type SOAREDStory = {
  situation?: string;
  obstacle?: string;
  action?: string;
  result?: string;
  evaluation?: string;
  discovery?: string;
};
```

### Section Definitions

| Letter | Label | Prompt | Min Rows |
|--------|-------|--------|----------|
| S | Situation | Describe the situation you were in. | 2 |
| O | Obstacle | Describe the obstacle or problem you faced. | 2 |
| A | Action | Describe your action: the step-by-step process. | 4 |
| R | Result | Describe the result of your actions. | 2 |
| E | Evaluation | Your self-evaluation and/or how others received it. | 2 |
| D | Discovery | Describe what you discovered from the process. | 2 |

### Visual Structure

```
Story Title (optional)
┌─────────────────────────────────────────────────┐
│ The time I turned around a failing project      │
└─────────────────────────────────────────────────┘

┌─S─┐ Situation
│   │ ┌─────────────────────────────────────────┐
└───┘ │ I was brought in mid-project when...    │
      └─────────────────────────────────────────┘

┌─O─┐ Obstacle
│   │ ┌─────────────────────────────────────────┐
└───┘ │ The team morale was low and...          │
      └─────────────────────────────────────────┘

... etc
```

### Rendered Structure

```html
<div class="soared-form" data-disabled={disabled}>
  {onTitleChange && (
    <div class="soared-form-title">
      <TextInput
        label="Story Title (optional)"
        value={title}
        onChange={onTitleChange}
        placeholder="Give this story a memorable name..."
        disabled={disabled}
      />
    </div>
  )}
  
  {sections.map(section => (
    <div key={section.key} class="soared-form-section">
      <div class="soared-form-section-header">
        <span class="soared-form-letter">{section.letter}</span>
        <span class="soared-form-section-label">{section.label}</span>
      </div>
      <TextArea
        value={value[section.key] || ''}
        onChange={(v) => onChange({ ...value, [section.key]: v })}
        placeholder={section.prompt}
        minRows={section.minRows}
        disabled={disabled}
      />
    </div>
  ))}
  
  {isComplete && onComplete && (
    <Button variant="primary" onClick={onComplete}>
      Save Story
    </Button>
  )}
</div>
```

### Section Configuration

```typescript
const sections = [
  { key: 'situation', letter: 'S', label: 'Situation', prompt: 'Describe the situation you were in.', minRows: 2 },
  { key: 'obstacle', letter: 'O', label: 'Obstacle', prompt: 'Describe the obstacle or problem you faced.', minRows: 2 },
  { key: 'action', letter: 'A', label: 'Action', prompt: 'Describe your action: the step-by-step process.', minRows: 4 },
  { key: 'result', letter: 'R', label: 'Result', prompt: 'Describe the result of your actions.', minRows: 2 },
  { key: 'evaluation', letter: 'E', label: 'Evaluation', prompt: 'Your self-evaluation and/or how others received it.', minRows: 2 },
  { key: 'discovery', letter: 'D', label: 'Discovery', prompt: 'Describe what you discovered from the process.', minRows: 2 },
];

const isComplete = sections.every(s => value[s.key]?.trim());
```

### Styling

| Property | Value |
|----------|-------|
| Section spacing | `space-6` |
| Letter badge | 32px circle, `--color-primary` @ 15% bg, `--color-primary` text, `font-semibold` |
| Section label | `text-base`, `font-medium` |
| Section header gap | `space-2` |

### CSS Implementation

```css
.soared-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.soared-form-title {
  margin-bottom: var(--space-2);
}

.soared-form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.soared-form-section-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.soared-form-letter {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.soared-form-section-label {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
}
```

---

## Related Documents

- **Section 1**: Component Philosophy
- **Section 4**: Form Input Components
- **Section 6**: Feedback & Status Components
- **Design System**: Visual tokens, colors, typography, spacing
