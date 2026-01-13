'use client';

import { useState, useEffect, useCallback } from 'react';
import { BudgetCalculator, BudgetCalculatorData, DEFAULT_EXPENSES } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

const DEFAULT_DATA: BudgetCalculatorData = {
  grossMonthlyIncome: 0,
  grossYearlyIncome: 0,
  incomeInputMode: 'yearly',
  filingStatus: 'single',
  stateCode: null,
  expenses: DEFAULT_EXPENSES,
  notes: '',
};

export function BudgetCalculatorWrapper({
  toolId,
  exerciseId,
  activityId,
  connectionId,
  onComplete,
  initialData,
  readOnly = false,
}: ToolWrapperProps) { // code_id:368
  const [data, setData] = useState<BudgetCalculatorData>(DEFAULT_DATA);

  // BUG-380: Load initialData for read-only mode
  useEffect(() => {
    if (initialData) {
      try {
        const parsed = JSON.parse(initialData);
        setData({ ...DEFAULT_DATA, ...parsed });
      } catch (err) {
        console.error('[BudgetCalculatorWrapper] Failed to parse initialData:', err);
      }
    }
  }, [initialData]);

  // BUG-411: Fetch connected data (e.g., experiences for income context)
  useEffect(() => {
    if (!connectionId || readOnly || initialData) return;

    fetch(`/api/data/connection?connectionId=${connectionId}`)
      .then(res => res.json())
      .then(result => {
        // Experience data provides context but doesn't directly map to budget fields
        // Connection data is available for future enhancements
        if (!result.isEmpty && result.data) {
          console.log('[BudgetCalculatorWrapper] Connection data loaded:', result.data.length, 'experiences');
        }
      })
      .catch(err => console.error('[BudgetCalculatorWrapper] Failed to load connection data:', err));
  }, [connectionId, readOnly, initialData]);

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
        <BudgetCalculator data={data} onChange={() => {}} />
      </div>
    );
  }

  return (
    <>
      <BudgetCalculator data={data} onChange={setData} />
      {error && <div className="tool-embed-error"><p>{error}</p></div>}
      <div className="tool-embed-actions">
        <button className="button button-primary" onClick={save} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </>
  );
}
