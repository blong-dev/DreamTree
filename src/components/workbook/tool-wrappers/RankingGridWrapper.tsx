'use client';

import { useState, useEffect, useCallback } from 'react';
import { RankingGrid, RankingItem, Comparison } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

export function RankingGridWrapper({
  toolId,
  exerciseId,
  activityId,
  connectionId,
  onComplete,
  initialData,
  readOnly = false,
}: ToolWrapperProps) { // code_id:379
  const [items, setItems] = useState<RankingItem[]>([]);
  const [comparisons, setComparisons] = useState<Comparison[]>([]);

  // BUG-380: Load initialData for read-only mode
  useEffect(() => {
    if (initialData) {
      try {
        const parsed = JSON.parse(initialData);
        if (parsed.items) setItems(parsed.items);
        if (parsed.comparisons) setComparisons(parsed.comparisons);
      } catch (err) {
        console.error('[RankingGridWrapper] Failed to parse initialData:', err);
      }
    }
  }, [initialData]);

  // Fetch connected data if provided (only for active tools)
  useEffect(() => {
    if (!connectionId || readOnly || initialData) return;

    fetch(`/api/data/connection?connectionId=${connectionId}`)
      .then(res => res.json())
      .then(result => {
        if (result.isEmpty || !result.data || !Array.isArray(result.data)) return;
        const connectedItems = result.data.map((item: { id?: string; value?: string; name?: string; rank?: number }, i: number) => ({
          id: item.id || `connected-${i}`,
          value: item.value || item.name || '',
          rank: item.rank,
        }));
        setItems(connectedItems);
      })
      .catch(err => console.error('[RankingGridWrapper] Failed to load connection data:', err));
  }, [connectionId, readOnly, initialData]);

  const handleCompare = useCallback((winnerId: string, loserId: string) => {
    setComparisons(prev => [...prev, { winnerId, loserId }]);
  }, []);

  const handleComplete = useCallback((ranked: RankingItem[]) => {
    setItems(ranked);
  }, []);

  const getData = useCallback(() => ({ items, comparisons }), [items, comparisons]);

  const { isLoading, error, save } = useToolSave({
    toolId,
    exerciseId,
    activityId,
    getData,
    onComplete,
  });

  if (readOnly) {
    return (
      <div className="tool-completed-view">
        <RankingGrid
          items={items}
          comparisons={comparisons}
          onCompare={() => {}}
          onComplete={() => {}}
          label="Ranked items"
        />
      </div>
    );
  }

  return (
    <>
      <RankingGrid
        items={items}
        comparisons={comparisons}
        onCompare={handleCompare}
        onComplete={handleComplete}
        label="Rank these items"
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
