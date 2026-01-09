'use client';

import { useState, useCallback } from 'react';
import { BucketingTool, BucketingToolData } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

export function BucketingToolWrapper({
  toolId,
  exerciseId,
  onComplete,
}: ToolWrapperProps) {
  const [data, setData] = useState<BucketingToolData>({
    items: [],
    bucketLabels: ['Most Used', 'Often Used', 'Sometimes', 'Rarely', 'Least Used'],
  });

  const getData = useCallback(() => data, [data]);

  const { isLoading, error, save } = useToolSave({
    toolId,
    exerciseId,
    getData,
    onComplete,
  });

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
