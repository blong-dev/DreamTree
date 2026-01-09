'use client';

import { useState, useCallback } from 'react';
import { MindsetProfiles, MindsetProfilesData } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

export function MindsetProfilesWrapper({
  toolId,
  exerciseId,
  onComplete,
}: ToolWrapperProps) {
  const [data, setData] = useState<MindsetProfilesData>({
    selectedCharacters: {
      'curiosity': '',
      'bias-to-action': '',
      'reframing': '',
      'awareness': '',
      'radical-collaboration': '',
    },
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
      <MindsetProfiles data={data} onChange={setData} />
      {error && <div className="tool-embed-error"><p>{error}</p></div>}
      <div className="tool-embed-actions">
        <button className="button button-primary" onClick={save} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </>
  );
}
