'use client';

import { useState, useId, KeyboardEvent } from 'react';
import { ListItem } from './types';

interface ListBuilderProps {
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
  label: string;
  placeholder?: string;
  addLabel?: string;
  maxItems?: number;
  minItems?: number;
  reorderable?: boolean;
  itemType?: 'text' | 'textarea';
  disabled?: boolean;
  id?: string;
}

export function ListBuilder({
  items,
  onChange,
  label,
  placeholder = 'Add item...',
  addLabel = '+ Add another',
  maxItems,
  minItems = 0,
  reorderable = false,
  itemType = 'text',
  disabled = false,
  id,
}: ListBuilderProps) {
  const generatedId = useId();
  const listId = id || generatedId;
  const [newItemValue, setNewItemValue] = useState('');

  const generateId = () => `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const addItem = () => {
    if (!newItemValue.trim() || disabled) return;
    if (maxItems && items.length >= maxItems) return;

    const newItem: ListItem = {
      id: generateId(),
      value: newItemValue.trim(),
    };

    onChange([...items, newItem]);
    setNewItemValue('');
  };

  const updateItem = (itemId: string, value: string) => {
    onChange(items.map((item) => (item.id === itemId ? { ...item, value } : item)));
  };

  const removeItem = (itemId: string) => {
    if (items.length <= minItems) return;
    onChange(items.filter((item) => item.id !== itemId));
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;

    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    onChange(newItems);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  const canAddMore = !maxItems || items.length < maxItems;

  return (
    <div className="list-builder" data-disabled={disabled}>
      <label className="list-builder-label" id={`${listId}-label`}>
        {label}
      </label>

      <ul
        className="list-builder-items"
        role="list"
        aria-labelledby={`${listId}-label`}
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

      {canAddMore && (
        <div className="list-builder-add">
          <input
            type="text"
            className="list-builder-add-input"
            placeholder={placeholder}
            value={newItemValue}
            onChange={(e) => setNewItemValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
        </div>
      )}

      {canAddMore && (
        <button
          type="button"
          className="list-builder-add-button"
          onClick={addItem}
          disabled={disabled || !newItemValue.trim()}
        >
          {addLabel}
        </button>
      )}

      <span className="list-builder-count">
        {items.length}
        {maxItems ? ` / ${maxItems}` : ''} items
      </span>
    </div>
  );
}

// ListBuilderItem component
interface ListBuilderItemProps {
  item: ListItem;
  index: number;
  onUpdate: (value: string) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  reorderable: boolean;
  itemType: 'text' | 'textarea';
  disabled: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canRemove: boolean;
}

function ListBuilderItem({
  item,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  reorderable,
  itemType,
  disabled,
  canMoveUp,
  canMoveDown,
  canRemove,
}: ListBuilderItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.value);
  const [isDragging, setIsDragging] = useState(false);

  const saveEdit = () => {
    if (editValue.trim()) {
      onUpdate(editValue.trim());
    } else {
      setEditValue(item.value);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (itemType === 'text' || !e.shiftKey)) {
      e.preventDefault();
      saveEdit();
    }
    if (e.key === 'Escape') {
      setEditValue(item.value);
      setIsEditing(false);
    }
  };

  const handleDragStart = () => {
    if (reorderable && !disabled) {
      setIsDragging(true);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <li
      className="list-builder-item"
      data-dragging={isDragging}
      draggable={reorderable && !disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {reorderable && (
        <button
          type="button"
          className="list-builder-item-handle"
          aria-label="Drag to reorder"
          disabled={disabled}
        >
          <GripVerticalIcon />
        </button>
      )}

      <div className="list-builder-item-content">
        {isEditing ? (
          itemType === 'textarea' ? (
            <textarea
              className="list-builder-item-input"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          ) : (
            <input
              type="text"
              className="list-builder-item-input"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          )
        ) : (
          <span
            className="list-builder-item-value"
            onClick={() => !disabled && setIsEditing(true)}
          >
            {item.value}
          </span>
        )}
      </div>

      <div className="list-builder-item-actions">
        {reorderable && (
          <>
            <button
              type="button"
              className="list-builder-item-action"
              onClick={onMoveUp}
              disabled={disabled || !canMoveUp}
              aria-label="Move up"
            >
              <ChevronUpIcon />
            </button>
            <button
              type="button"
              className="list-builder-item-action"
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
            type="button"
            className="list-builder-item-action list-builder-item-remove"
            onClick={onRemove}
            disabled={disabled}
            aria-label="Remove item"
          >
            <XIcon />
          </button>
        )}
      </div>
    </li>
  );
}

// Icon components
function GripVerticalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="6" r="1" />
      <circle cx="15" cy="6" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="9" cy="18" r="1" />
      <circle cx="15" cy="18" r="1" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
