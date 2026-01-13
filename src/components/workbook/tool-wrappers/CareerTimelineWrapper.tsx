'use client';

import { useState, useEffect, useCallback } from 'react';
import { CareerTimeline, CareerTimelineData } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

const DEFAULT_DATA: CareerTimelineData = {
  milestones: [],
  startYear: new Date().getFullYear() - 10,
};

export function CareerTimelineWrapper({
  toolId,
  exerciseId,
  activityId,
  connectionId,
  onComplete,
  initialData,
  readOnly = false,
}: ToolWrapperProps) { // code_id:370
  const [data, setData] = useState<CareerTimelineData>(DEFAULT_DATA);

  // BUG-380: Load initialData for read-only mode
  useEffect(() => {
    if (initialData) {
      try {
        const parsed = JSON.parse(initialData);
        setData({ ...DEFAULT_DATA, ...parsed });
      } catch (err) {
        console.error('[CareerTimelineWrapper] Failed to parse initialData:', err);
      }
    }
  }, [initialData]);

  // BUG-411: Fetch connected data (e.g., career options for context)
  useEffect(() => {
    if (!connectionId || readOnly || initialData) return;

    fetch(`/api/data/connection?connectionId=${connectionId}`)
      .then(res => res.json())
      .then(result => {
        // Career options provide context but don't directly map to milestones
        // Connection data is available for future enhancements
        if (!result.isEmpty && result.data) {
          console.log('[CareerTimelineWrapper] Connection data loaded:', result.data.length, 'career options');
        }
      })
      .catch(err => console.error('[CareerTimelineWrapper] Failed to load connection data:', err));
  }, [connectionId, readOnly, initialData]);

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
        <CareerTimeline data={data} onChange={() => {}} />
      </div>
    );
  }

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
