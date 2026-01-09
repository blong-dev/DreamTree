'use client';

import { useState, useEffect, useCallback } from 'react';
import { SkillTagger, Skill } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

export function SkillTaggerWrapper({
  toolId,
  exerciseId,
  connectionId,
  onComplete,
}: ToolWrapperProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Fetch skills
  useEffect(() => {
    if (skills.length > 0) return;

    setDataLoading(true);
    setDataError(null);
    fetch('/api/data/skills')
      .then(res => res.json())
      .then(data => {
        if (data.skills) setSkills(data.skills);
      })
      .catch(err => {
        console.error('[SkillTaggerWrapper] Failed to load skills:', err);
        setDataError('Failed to load skills. Tap to retry.');
      })
      .finally(() => setDataLoading(false));
  }, [skills.length]);

  // Fetch connected data if provided
  useEffect(() => {
    if (!connectionId) return;

    fetch(`/api/data/connection?connectionId=${connectionId}`)
      .then(res => res.json())
      .then(result => {
        if (result.isEmpty || !result.data || !Array.isArray(result.data)) return;
        const skillIds = result.data
          .map((s: { skillId?: string; id?: string }) => s.skillId || s.id || '')
          .filter(Boolean);
        setSelectedSkillIds(skillIds);
      })
      .catch(err => console.error('[SkillTaggerWrapper] Failed to load connection data:', err));
  }, [connectionId]);

  const getData = useCallback(() => ({ selectedSkillIds }), [selectedSkillIds]);

  const { isLoading, error, save } = useToolSave({
    toolId,
    exerciseId,
    getData,
    onComplete,
  });

  const handleRetry = useCallback(() => {
    setDataError(null);
    setSkills([]);
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
    return <div className="tool-embed-loading">Loading skills...</div>;
  }

  return (
    <>
      <SkillTagger
        skills={skills}
        selectedSkillIds={selectedSkillIds}
        onChange={setSelectedSkillIds}
        storyTitle="Tag skills for this story"
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
