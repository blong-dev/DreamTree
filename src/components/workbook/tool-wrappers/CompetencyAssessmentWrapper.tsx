'use client';

import { useState, useEffect, useCallback } from 'react';
import { CompetencyAssessment, CompetencyAssessmentData, Competency } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

export function CompetencyAssessmentWrapper({
  toolId,
  exerciseId,
  onComplete,
}: ToolWrapperProps) { // code_id:371
  const [data, setData] = useState<CompetencyAssessmentData>({ scores: [] });
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Fetch competencies
  useEffect(() => {
    if (competencies.length > 0) return;

    setDataLoading(true);
    setDataError(null);
    fetch('/api/data/competencies')
      .then(res => res.json())
      .then(result => {
        if (result.competencies) setCompetencies(result.competencies);
      })
      .catch(err => {
        console.error('[CompetencyAssessmentWrapper] Failed to load competencies:', err);
        setDataError('Failed to load competencies. Tap to retry.');
      })
      .finally(() => setDataLoading(false));
  }, [competencies.length]);

  const getData = useCallback(() => data, [data]);

  const { isLoading, error, save } = useToolSave({
    toolId,
    exerciseId,
    getData,
    onComplete,
  });

  const handleRetry = useCallback(() => {
    setDataError(null);
    setCompetencies([]);
  }, []);

  if (dataError) {
    return (
      <div className="tool-embed-error-state">
        <p>{dataError}</p>
        <button className="button button-secondary" onClick={handleRetry}>Retry</button>
      </div>
    );
  }

  if (dataLoading) {
    return <div className="tool-embed-loading">Loading competencies...</div>;
  }

  return (
    <>
      <CompetencyAssessment
        data={data}
        onChange={setData}
        competencies={competencies}
      />
      {error && <div className="tool-embed-error"><p>{error}</p></div>}
      <div className="tool-embed-actions">
        <button className="button button-primary" onClick={save} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </>
  );
}
