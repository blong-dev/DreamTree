'use client';

import { useState, useCallback } from 'react';
import { MBTISelector } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

const MBTI_TYPES = [
  { code: 'INTJ', name: 'The Architect' },
  { code: 'INTP', name: 'The Logician' },
  { code: 'ENTJ', name: 'The Commander' },
  { code: 'ENTP', name: 'The Debater' },
  { code: 'INFJ', name: 'The Advocate' },
  { code: 'INFP', name: 'The Mediator' },
  { code: 'ENFJ', name: 'The Protagonist' },
  { code: 'ENFP', name: 'The Campaigner' },
  { code: 'ISTJ', name: 'The Logistician' },
  { code: 'ISFJ', name: 'The Defender' },
  { code: 'ESTJ', name: 'The Executive' },
  { code: 'ESFJ', name: 'The Consul' },
  { code: 'ISTP', name: 'The Virtuoso' },
  { code: 'ISFP', name: 'The Adventurer' },
  { code: 'ESTP', name: 'The Entrepreneur' },
  { code: 'ESFP', name: 'The Entertainer' },
];

export function MBTISelectorWrapper({
  toolId,
  exerciseId,
  onComplete,
}: ToolWrapperProps) {
  const [value, setValue] = useState<string | null>(null);

  const getData = useCallback(() => ({ selectedCode: value }), [value]);

  const { isLoading, error, save } = useToolSave({
    toolId,
    exerciseId,
    getData,
    onComplete,
  });

  return (
    <>
      <MBTISelector
        value={value}
        onChange={setValue}
        types={MBTI_TYPES}
        label="Select your MBTI type"
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
