'use client';

import { useState, useEffect, useCallback } from 'react';
import { ListBuilder, ListItem } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

export function ListBuilderWrapper({
  toolId,
  exerciseId,
  connectionId,
  onComplete,
}: ToolWrapperProps) {
  const [items, setItems] = useState<ListItem[]>([]);

  // Fetch connected data if provided
  useEffect(() => {
    if (!connectionId) return;

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
  }, [connectionId]);

  const getData = useCallback(() => items, [items]);

  const { isLoading, error, save } = useToolSave({
    toolId,
    exerciseId,
    getData,
    onComplete,
  });

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
