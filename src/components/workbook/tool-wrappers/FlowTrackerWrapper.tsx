'use client';

import { useState, useCallback } from 'react';
import { FlowTracker, FlowTrackerData } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

export function FlowTrackerWrapper({
  toolId,
  exerciseId,
  onComplete,
}: ToolWrapperProps) { // code_id:373
  const [data, setData] = useState<FlowTrackerData>({ entries: [] });

  const getData = useCallback(() => data, [data]);

  const { isLoading, error, save } = useToolSave({
    toolId,
    exerciseId,
    getData,
    onComplete,
  });

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
