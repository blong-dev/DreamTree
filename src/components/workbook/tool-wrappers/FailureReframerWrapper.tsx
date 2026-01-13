'use client';

import { useState, useCallback } from 'react';
import { FailureReframer, FailureReframerData } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

export function FailureReframerWrapper({
  toolId,
  exerciseId,
  activityId,
  onComplete,
}: ToolWrapperProps) { // code_id:372
  const [data, setData] = useState<FailureReframerData>({
    situation: '',
    initialFeelings: '',
    whatLearned: '',
    whatWouldChange: '',
    silverLining: '',
    nextStep: '',
    reframedStatement: '',
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
