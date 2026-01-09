'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface HistoryBlock {
  id: number;
  sequence: number;
  blockType: 'content' | 'prompt' | 'tool';
  activityId: number;
  connectionId: number | null;
  exerciseId: string;
  content: {
    id?: number;
    type?: string;
    text?: string;
    promptText?: string;
    inputType?: string;
    inputConfig?: object;
    name?: string;
    description?: string;
    instructions?: string;
  };
  userResponse?: string;
}

export interface ExerciseBoundary {
  exerciseId: string;
  startSequence: number;
  title: string;
}

interface HistoryResponse {
  blocks: HistoryBlock[];
  pagination: {
    fromSequence: number;
    toSequence: number;
    hasMore: boolean;
    hasPrevious: boolean;
    totalBlocks: number;
  };
  exerciseBoundaries: ExerciseBoundary[];
}

interface UseWorkbookHistoryOptions {
  initialExerciseId?: string;
  pageSize?: number;
}

interface UseWorkbookHistoryReturn {
  blocks: HistoryBlock[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  hasPrevious: boolean;
  totalBlocks: number;
  exerciseBoundaries: ExerciseBoundary[];
  loadMore: () => Promise<void>;
  loadPrevious: () => Promise<void>;
  refresh: () => Promise<void>;
  currentSequenceRange: { from: number; to: number };
}

/**
 * Hook for fetching and managing paginated workbook history.
 * Supports bidirectional loading for infinite scroll.
 */
export function useWorkbookHistory(
  options: UseWorkbookHistoryOptions = {}
): UseWorkbookHistoryReturn {
  const { pageSize = 50 } = options;

  const [blocks, setBlocks] = useState<HistoryBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalBlocks, setTotalBlocks] = useState(0);
  const [exerciseBoundaries, setExerciseBoundaries] = useState<ExerciseBoundary[]>([]);

  // Track loaded sequence range
  const loadedRange = useRef({ from: 1, to: pageSize });

  const fetchHistory = useCallback(
    async (fromSequence: number, toSequence: number): Promise<HistoryResponse | null> => {
      try {
        const params = new URLSearchParams({
          fromSequence: String(fromSequence),
          toSequence: String(toSequence),
        });

        const response = await fetch(`/api/workbook/history?${params}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }

        return await response.json();
      } catch (err) {
        console.error('Error fetching history:', err);
        return null;
      }
    },
    []
  );

  // Initial load - start from sequence 1
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const data = await fetchHistory(1, pageSize);

    if (data) {
      setBlocks(data.blocks);
      setHasMore(data.pagination.hasMore);
      setHasPrevious(data.pagination.hasPrevious);
      setTotalBlocks(data.pagination.totalBlocks);
      setExerciseBoundaries(data.exerciseBoundaries);
      loadedRange.current = {
        from: data.pagination.fromSequence,
        to: data.pagination.toSequence,
      };
    } else {
      setError('Failed to load workbook history');
    }

    setIsLoading(false);
  }, [fetchHistory, pageSize]);

  // Load more (forward/down)
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    const fromSequence = loadedRange.current.to + 1;
    const toSequence = fromSequence + pageSize - 1;

    const data = await fetchHistory(fromSequence, toSequence);

    if (data && data.blocks.length > 0) {
      setBlocks((prev) => [...prev, ...data.blocks]);
      setHasMore(data.pagination.hasMore);
      setExerciseBoundaries((prev) => {
        // Merge boundaries, avoiding duplicates
        const existing = new Set(prev.map((b) => b.exerciseId));
        const newBoundaries = data.exerciseBoundaries.filter(
          (b) => !existing.has(b.exerciseId)
        );
        return [...prev, ...newBoundaries];
      });
      loadedRange.current.to = data.pagination.toSequence;
    }

    setIsLoadingMore(false);
  }, [fetchHistory, hasMore, isLoadingMore, pageSize]);

  // Load previous (backward/up)
  const loadPrevious = useCallback(async () => {
    if (isLoadingMore || !hasPrevious) return;

    setIsLoadingMore(true);

    const toSequence = loadedRange.current.from - 1;
    const fromSequence = Math.max(1, toSequence - pageSize + 1);

    const data = await fetchHistory(fromSequence, toSequence);

    if (data && data.blocks.length > 0) {
      setBlocks((prev) => [...data.blocks, ...prev]);
      setHasPrevious(data.pagination.hasPrevious);
      setExerciseBoundaries((prev) => {
        // Merge boundaries at the beginning
        const existing = new Set(prev.map((b) => b.exerciseId));
        const newBoundaries = data.exerciseBoundaries.filter(
          (b) => !existing.has(b.exerciseId)
        );
        return [...newBoundaries, ...prev];
      });
      loadedRange.current.from = data.pagination.fromSequence;
    }

    setIsLoadingMore(false);
  }, [fetchHistory, hasPrevious, isLoadingMore, pageSize]);

  // Initial load on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    blocks,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    hasPrevious,
    totalBlocks,
    exerciseBoundaries,
    loadMore,
    loadPrevious,
    refresh,
    currentSequenceRange: loadedRange.current,
  };
}
