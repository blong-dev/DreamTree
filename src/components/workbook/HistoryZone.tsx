'use client';

import { useMemo, useCallback, useState } from 'react';
import { useWorkbookHistory } from '@/hooks/useWorkbookHistory';
import { VirtualizedConversation } from './VirtualizedConversation';

interface HistoryZoneProps {
  /** Current exercise ID - blocks from this exercise are filtered out */
  currentExerciseId: string;
  /** Callback when the visible exercise changes (for URL sync) */
  onVisibleExerciseChange?: (exerciseId: string) => void;
  /** Initial page size */
  pageSize?: number;
}

/**
 * HistoryZone renders past exercise blocks in a virtualized list.
 * Filters out the current exercise (shown separately by ConversationThread).
 */
export function HistoryZone({
  currentExerciseId,
  onVisibleExerciseChange,
  pageSize = 50,
}: HistoryZoneProps) {
  const {
    blocks,
    isLoading,
    isLoadingMore,
    hasMore,
    hasPrevious,
    exerciseBoundaries,
    loadMore,
    loadPrevious,
  } = useWorkbookHistory({ pageSize });

  // Track which block IDs have been animated (for ink permanence in history)
  const [animatedBlockIds] = useState<Set<number>>(() => new Set());

  // Filter out blocks from the current exercise
  const historyBlocks = useMemo(() => {
    return blocks.filter((block) => block.exerciseId !== currentExerciseId);
  }, [blocks, currentExerciseId]);

  // Filter exercise boundaries to only include completed exercises
  const historyBoundaries = useMemo(() => {
    return exerciseBoundaries.filter((b) => b.exerciseId !== currentExerciseId);
  }, [exerciseBoundaries, currentExerciseId]);

  // Mark block as animated (no-op in history - all blocks appear instantly)
  const handleBlockAnimated = useCallback((blockId: number) => {
    animatedBlockIds.add(blockId);
  }, [animatedBlockIds]);

  // Don't render anything if no history
  if (!isLoading && historyBlocks.length === 0) {
    return null;
  }

  return (
    <div className="history-zone">
      <VirtualizedConversation
        blocks={historyBlocks}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        hasPrevious={hasPrevious}
        onLoadMore={loadMore}
        onLoadPrevious={loadPrevious}
        onVisibleExerciseChange={onVisibleExerciseChange}
        exerciseBoundaries={historyBoundaries}
        animatedBlockIds={animatedBlockIds}
        onBlockAnimated={handleBlockAnimated}
      />
    </div>
  );
}
