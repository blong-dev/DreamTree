'use client';

import { useState, useCallback } from 'react';
import { LifeDashboard, LifeDashboardData } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

export function LifeDashboardWrapper({
  toolId,
  exerciseId,
  activityId,
  onComplete,
}: ToolWrapperProps) { // code_id:375
  const [data, setData] = useState<LifeDashboardData>({
    work: null,
    play: null,
    love: null,
    health: null,
  });

  const getData = useCallback(() => data, [data]);

  const { isLoading, error, save } = useToolSave({
    toolId,
    exerciseId,
    activityId,
    getData,
    onComplete,
  });

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
