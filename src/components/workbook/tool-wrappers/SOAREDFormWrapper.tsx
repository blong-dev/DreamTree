'use client';

import { useState, useEffect, useCallback } from 'react';
import { SOAREDForm, SOAREDStoryData } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

const DEFAULT_SOARED_DATA: SOAREDStoryData = {
  title: '',
  situation: '',
  obstacle: '',
  action: '',
  result: '',
  evaluation: '',
  discovery: '',
  storyType: 'challenge',
};

export function SOAREDFormWrapper({
  toolId,
  exerciseId,
  activityId,
  onComplete,
  initialData,
  readOnly = false,
}: ToolWrapperProps) { // code_id:381
  const [data, setData] = useState<SOAREDStoryData>(DEFAULT_SOARED_DATA);

  // BUG-380: Load initialData for read-only mode
  useEffect(() => {
    if (initialData) {
      try {
        const parsed = JSON.parse(initialData);
        setData({ ...DEFAULT_SOARED_DATA, ...parsed });
      } catch (err) {
        console.error('[SOAREDFormWrapper] Failed to parse initialData:', err);
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
        <SOAREDForm data={data} onChange={() => {}} />
      </div>
    );
  }

  return (
    <>
      <SOAREDForm data={data} onChange={setData} />
      {error && <div className="tool-embed-error"><p>{error}</p></div>}
      <div className="tool-embed-actions">
        <button className="button button-primary" onClick={save} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </>
  );
}
