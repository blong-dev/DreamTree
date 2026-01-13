'use client';

import { useState, useEffect, useCallback } from 'react';
import { FlowTracker, FlowTrackerData } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

export function FlowTrackerWrapper({
  toolId,
  exerciseId,
  activityId,
  onComplete,
  initialData,
  readOnly = false,
}: ToolWrapperProps) { // code_id:373
  const [data, setData] = useState<FlowTrackerData>({ entries: [] });

  // BUG-380: Load initialData for read-only mode
  useEffect(() => {
    if (initialData) {
      try {
        const parsed = JSON.parse(initialData);
        setData(parsed.entries ? parsed : { entries: [] });
      } catch (err) {
        console.error('[FlowTrackerWrapper] Failed to parse initialData:', err);
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
        <FlowTracker data={data} onChange={() => {}} />
      </div>
    );
  }

  return (
    <>
      <FlowTracker data={data} onChange={setData} />
      {error && <div className="tool-embed-error"><p>{error}</p></div>}
      <div className="tool-embed-actions">
        <button className="button button-primary" onClick={save} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </>
  );
}
