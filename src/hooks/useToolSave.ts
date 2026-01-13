'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface ToolSaveResponse {
  id: string;
  updated: boolean;
  newProgress: number;
  nextBlock: unknown | null;
  hasMore: boolean;
}

interface UseToolSaveOptions {
  toolId: number;
  exerciseId: string;
  activityId: number; // BUG-379: Required to differentiate same tool in different activities
  getData: () => unknown;
  onComplete: (data: ToolSaveResponse) => void;
}

interface UseToolSaveResult {
  isLoading: boolean;
  error: string | null;
  save: () => Promise<void>;
}

/**
 * Shared hook for tool save/auto-save logic
 * IMP-002: Extracted from ToolEmbed to reduce state duplication
 */
export function useToolSave({
  toolId,
  exerciseId,
  activityId,
  getData,
  onComplete,
}: UseToolSaveOptions): UseToolSaveResult { // code_id:108
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for auto-save
  const isInitialMount = useRef(true);
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const getDataRef = useRef(getData);

  // Keep ref updated
  getDataRef.current = getData;

  // Stringify for change detection
  const currentDataJson = JSON.stringify(getData());

  // Manual save (Continue button)
  const save = useCallback(async () => {
    // Clear pending auto-save (IMP-041)
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
      autoSaveTimeout.current = null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/workbook/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId,
          exerciseId,
          activityId: activityId.toString(), // BUG-379: Include activity to differentiate
          responseText: JSON.stringify(getDataRef.current()),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save tool data');
      }

      const data: ToolSaveResponse = await response.json();
      onComplete(data);
    } catch (err) {
      console.error('Error saving tool:', err);
      // IMP-025: Differentiate error types
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Unable to connect. Check your internet connection.');
      } else {
        setError('Failed to save. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [toolId, exerciseId, activityId, onComplete]);

  // Auto-save effect (IMP-008)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }

    autoSaveTimeout.current = setTimeout(async () => {
      try {
        await fetch('/api/workbook/response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolId,
            exerciseId,
            activityId: activityId.toString(), // BUG-379: Include activity to differentiate
            responseText: JSON.stringify(getDataRef.current()),
          }),
        });
      } catch {
        // Silent failure
      }
    }, 1500);

    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, [currentDataJson, toolId, exerciseId, activityId]);

  return { isLoading, error, save };
}
