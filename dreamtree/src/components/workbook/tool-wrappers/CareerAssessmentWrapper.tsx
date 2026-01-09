'use client';

import { useState, useCallback } from 'react';
import { CareerAssessment, CareerAssessmentData } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

export function CareerAssessmentWrapper({
  toolId,
  exerciseId,
  onComplete,
}: ToolWrapperProps) {
  const [data, setData] = useState<CareerAssessmentData>({ options: [] });

  const getData = useCallback(() => data, [data]);

  const { isLoading, error, save } = useToolSave({
    toolId,
    exerciseId,
    getData,
    onComplete,
  });

  return (
    <>
      <CareerAssessment data={data} onChange={setData} />
      {error && <div className="tool-embed-error"><p>{error}</p></div>}
      <div className="tool-embed-actions">
        <button className="button button-primary" onClick={save} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </>
  );
}
