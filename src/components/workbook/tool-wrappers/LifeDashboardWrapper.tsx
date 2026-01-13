'use client';

import { useState, useEffect, useCallback } from 'react';
import { LifeDashboard, LifeDashboardData } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

export function LifeDashboardWrapper({
  toolId,
  exerciseId,
  activityId,
  onComplete,
  initialData,
  readOnly = false,
}: ToolWrapperProps) { // code_id:375
  const [data, setData] = useState<LifeDashboardData>({
    work: null,
    play: null,
    love: null,
    health: null,
  });

  // BUG-380: Load initialData for read-only mode
  useEffect(() => {
    if (initialData) {
      try {
        const parsed = JSON.parse(initialData);
        setData({ work: null, play: null, love: null, health: null, ...parsed });
      } catch (err) {
        console.error('[LifeDashboardWrapper] Failed to parse initialData:', err);
      }
    }
  }, [initialData]);

  const getData = useCallback(() => data, [data]);

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
        <LifeDashboard data={data} onChange={() => {}} />
      </div>
    );
  }

  return (
    <>
      <LifeDashboard data={data} onChange={setData} />
      {error && <div className="tool-embed-error"><p>{error}</p></div>}
      <div className="tool-embed-actions">
        <button className="button button-primary" onClick={save} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </>
  );
}
