'use client';

import { useState, useCallback } from 'react';
import { BudgetCalculator, BudgetCalculatorData, DEFAULT_EXPENSES } from '@/components/tools';
import { useToolSave } from '@/hooks/useToolSave';
import type { ToolWrapperProps } from './types';

export function BudgetCalculatorWrapper({
  toolId,
  exerciseId,
  onComplete,
}: ToolWrapperProps) { // code_id:368
  const [data, setData] = useState<BudgetCalculatorData>({
    grossMonthlyIncome: 0,
    grossYearlyIncome: 0,
    incomeInputMode: 'yearly',
    filingStatus: 'single',
    stateCode: null,
    expenses: DEFAULT_EXPENSES,
    notes: '',
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
