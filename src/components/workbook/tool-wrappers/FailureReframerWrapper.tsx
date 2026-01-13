'use client';

import { useState, useEffect, useCallback } from 'react';
import { FailureReframer, FailureReframerData } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

const DEFAULT_DATA: FailureReframerData = {
  situation: '',
  initialFeelings: '',
  whatLearned: '',
  whatWouldChange: '',
  silverLining: '',
  nextStep: '',
  reframedStatement: '',
};

export function FailureReframerWrapper({
  toolId,
  exerciseId,
  activityId,
  onComplete,
  initialData,
  readOnly = false,
}: ToolWrapperProps) { // code_id:372
  const [data, setData] = useState<FailureReframerData>(DEFAULT_DATA);

  // BUG-380: Load initialData for read-only mode
  useEffect(() => {
    if (initialData) {
      try {
        const parsed = JSON.parse(initialData);
        setData({ ...DEFAULT_DATA, ...parsed });
      } catch (err) {
        console.error('[FailureReframerWrapper] Failed to parse initialData:', err);
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
        <FailureReframer data={data} onChange={() => {}} />
      </div>
    );
  }

  return (
    <>
      <FailureReframer data={data} onChange={setData} />
      {error && <div className="tool-embed-error"><p>{error}</p></div>}
      <div className="tool-embed-actions">
        <button className="button button-primary" onClick={save} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </>
  );
}
