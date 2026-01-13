'use client';

import { useState, useEffect, useCallback } from 'react';
import { ListBuilder, ListItem } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

export function ListBuilderWrapper({
  toolId,
  exerciseId,
  activityId,
  connectionId,
  onComplete,
  initialData,
  readOnly = false,
}: ToolWrapperProps) { // code_id:376
  const [items, setItems] = useState<ListItem[]>([]);

  // BUG-380: Load initialData for read-only mode (completed tools in history)
  useEffect(() => {
    if (initialData) {
      try {
        const parsed = JSON.parse(initialData);
        if (Array.isArray(parsed)) {
          const loadedItems = parsed.map((item: string | { id?: string; value?: string }, i: number) => {
            if (typeof item === 'string') {
              return { id: `item-${i}`, value: item };
            }
            return { id: item.id || `item-${i}`, value: item.value || '' };
          });
          setItems(loadedItems);
        }
      } catch (err) {
        console.error('[ListBuilderWrapper] Failed to parse initialData:', err);
      }
    }
  }, [initialData]);

  // Fetch connected data if provided (only for active tools, not read-only)
  useEffect(() => {
    if (!connectionId || readOnly || initialData) return;

    fetch(`/api/data/connection?connectionId=${connectionId}`)
      .then(res => res.json())
      .then(result => {
        if (result.isEmpty || !result.data || !Array.isArray(result.data)) return;
        const connectedItems = result.data.map((item: { id?: string; value?: string; name?: string }, i: number) => ({
          id: item.id || `connected-${i}`,
          value: item.value || item.name || '',
        }));
        setItems(connectedItems);
      })
      .catch(err => console.error('[ListBuilderWrapper] Failed to load connection data:', err));
  }, [connectionId, readOnly, initialData]);

  const getData = useCallback(() => items, [items]);

  const { isLoading, error, save } = useToolSave({
    toolId,
    exerciseId,
    activityId,
    getData,
    onComplete,
  });

  // BUG-380: Read-only mode for completed tools
  if (readOnly) {
    return (
      <div className="tool-completed-view">
        <ListBuilder
          items={items}
          onChange={() => {}} // No-op for read-only
          placeholder=""
          reorderable={false}
        />
      </div>
    );
  }

  return (
    <>
      <ListBuilder
        items={items}
        onChange={setItems}
        placeholder="Add an item..."
        reorderable
      />
      {error && <div className="tool-embed-error"><p>{error}</p></div>}
      <div className="tool-embed-actions">
        <button className="button button-primary" onClick={save} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </>
  );
}
