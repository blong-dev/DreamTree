'use client';

import { useState, useCallback } from 'react';
import { CareerTimeline, CareerTimelineData } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

export function CareerTimelineWrapper({
  toolId,
  exerciseId,
  activityId,
  onComplete,
}: ToolWrapperProps) { // code_id:370
  const [data, setData] = useState<CareerTimelineData>({
    milestones: [],
    startYear: new Date().getFullYear() - 10,
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
      <CareerTimeline data={data} onChange={setData} />
      {error && <div className="tool-embed-error"><p>{error}</p></div>}
      <div className="tool-embed-actions">
        <button className="button button-primary" onClick={save} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </>
  );
}
