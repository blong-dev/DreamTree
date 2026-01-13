'use client';

import { useState, useEffect, useCallback } from 'react';
import { BucketingTool, BucketingToolData } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

const DEFAULT_DATA: BucketingToolData = {
  items: [],
  bucketLabels: ['Most Used', 'Often Used', 'Sometimes', 'Rarely', 'Least Used'],
};

export function BucketingToolWrapper({
  toolId,
  exerciseId,
  activityId,
  onComplete,
  initialData,
  readOnly = false,
}: ToolWrapperProps) { // code_id:367
  const [data, setData] = useState<BucketingToolData>(DEFAULT_DATA);

  // BUG-380: Load initialData for read-only mode
  useEffect(() => {
    if (initialData) {
      try {
        const parsed = JSON.parse(initialData);
        setData({ ...DEFAULT_DATA, ...parsed });
      } catch (err) {
        console.error('[BucketingToolWrapper] Failed to parse initialData:', err);
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
        <BucketingTool data={data} onChange={() => {}} />
      </div>
    );
  }

  return (
    <>
      <BucketingTool data={data} onChange={setData} />
      {error && <div className="tool-embed-error"><p>{error}</p></div>}
      <div className="tool-embed-actions">
        <button className="button button-primary" onClick={save} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </>
  );
}
