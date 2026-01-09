'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { HistoryBlock, ExerciseBoundary } from '@/hooks/useWorkbookHistory';
import { MessageContent } from '../conversation/MessageContent';
import { MessageUser } from '../conversation/MessageUser';

interface VirtualizedConversationProps {
  blocks: HistoryBlock[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  hasPrevious: boolean;
  onLoadMore: () => void;
  onLoadPrevious: () => void;
  onVisibleExerciseChange?: (exerciseId: string) => void;
  exerciseBoundaries: ExerciseBoundary[];
  /** Set of block IDs that have already animated (should not re-animate) */
  animatedBlockIds?: Set<number>;
  /** Callback when a block animation completes */
  onBlockAnimated?: (blockId: number) => void;
}

// Estimate height for blocks (will be measured dynamically)
const ESTIMATED_BLOCK_HEIGHT = 80;
const LOAD_MORE_THRESHOLD = 5; // Load more when within N items of edge

/**
 * Virtualized conversation component for displaying paginated workbook history.
 * Uses @tanstack/react-virtual for efficient rendering of large lists.
 */
export function VirtualizedConversation({
  blocks,
  isLoading,
  isLoadingMore,
  hasMore,
  hasPrevious,
  onLoadMore,
  onLoadPrevious,
  onVisibleExerciseChange,
  exerciseBoundaries,
  animatedBlockIds,
  onBlockAnimated,
}: VirtualizedConversationProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const lastVisibleExerciseRef = useRef<string | null>(null);

  // Set up virtualizer
  const virtualizer = useVirtualizer({
    count: blocks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_BLOCK_HEIGHT,
    overscan: 10, // Render 10 extra items for smoother scrolling
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Handle scroll to detect when we need to load more
  const handleScroll = useCallback(() => {
    if (!parentRef.current || isLoadingMore) return;

    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;

    // Load more when near bottom
    if (hasMore) {
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const lastVisibleIndex = virtualItems[virtualItems.length - 1]?.index ?? 0;
      if (
        distanceFromBottom < 200 ||
        lastVisibleIndex >= blocks.length - LOAD_MORE_THRESHOLD
      ) {
        onLoadMore();
      }
    }

    // Load previous when near top
    if (hasPrevious) {
      const firstVisibleIndex = virtualItems[0]?.index ?? 0;
      if (scrollTop < 200 || firstVisibleIndex <= LOAD_MORE_THRESHOLD) {
        onLoadPrevious();
      }
    }

    // Track visible exercise for URL sync
    if (onVisibleExerciseChange && virtualItems.length > 0) {
      // Find the exercise at the middle of the viewport
      const middleIndex = Math.floor(virtualItems.length / 2);
      const middleItem = virtualItems[middleIndex];
      if (middleItem) {
        const block = blocks[middleItem.index];
        if (block && block.exerciseId !== lastVisibleExerciseRef.current) {
          lastVisibleExerciseRef.current = block.exerciseId;
          onVisibleExerciseChange(block.exerciseId);
        }
      }
    }
  }, [
    blocks,
    hasMore,
    hasPrevious,
    isLoadingMore,
    onLoadMore,
    onLoadPrevious,
    onVisibleExerciseChange,
    virtualItems,
  ]);

  // Attach scroll listener
  useEffect(() => {
    const element = parentRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Render a single block
  const renderBlock = (block: HistoryBlock) => {
    const shouldAnimate =
      block.blockType === 'content' &&
      (!animatedBlockIds || !animatedBlockIds.has(block.id));

    // Find exercise boundary for this block
    const boundary = exerciseBoundaries.find(
      (b) => b.exerciseId === block.exerciseId
    );
    const isExerciseStart = boundary && boundary.startSequence === block.sequence;

    return (
      <div key={block.id} className="virtualized-block">
        {/* Exercise boundary marker */}
        {isExerciseStart && (
          <div className="exercise-boundary" data-exercise-id={block.exerciseId}>
            <span className="exercise-boundary-label">{boundary?.title}</span>
          </div>
        )}

        {/* Content block */}
        {block.blockType === 'content' && block.content.text && (
          <MessageContent
            content={[
              {
                // Map database content types to valid ContentBlock types
                // 'instruction', 'note', 'transition', 'celebration' → 'paragraph'
                type: block.content.type === 'heading' ? 'heading' :
                      block.content.type === 'quote' ? 'quote' : 'paragraph',
                text: block.content.text,
                ...(block.content.type === 'heading' ? { level: 2 as const } : {}),
              } as { type: 'paragraph'; text: string } | { type: 'heading'; level: 2 | 3 | 4; text: string } | { type: 'quote'; text: string },
            ]}
            animate={shouldAnimate}
            onAnimationComplete={
              shouldAnimate && onBlockAnimated
                ? (_wasSkipped: boolean) => onBlockAnimated(block.id)
                : undefined
            }
            id={`history-${block.id}`}
          />
        )}

        {/* Prompt block with user response */}
        {block.blockType === 'prompt' && (
          <div className="prompt-with-response">
            <MessageContent
              content={[
                {
                  type: 'paragraph',
                  text: block.content.promptText || '',
                },
              ]}
              animate={false}
              id={`prompt-${block.id}`}
            />
            {block.userResponse && (
              <MessageUser
                content={{ type: 'text', value: block.userResponse }}
                timestamp={new Date()}
              />
            )}
          </div>
        )}

        {/* Tool block with user response */}
        {block.blockType === 'tool' && (
          <div className="tool-with-response">
            <div className="tool-header">
              <span className="tool-name">{block.content.name}</span>
            </div>
            {block.userResponse && (
              <div className="tool-response-summary">
                <span className="tool-response-label">Completed</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="virtualized-conversation-loading">
        <div className="loading-spinner" />
        <span>Loading history...</span>
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className="virtualized-conversation-empty">
        <span>No history yet. Start your journey!</span>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="virtualized-conversation"
      style={{ height: '100%', overflow: 'auto' }}
    >
      {/* Loading indicator at top */}
      {isLoadingMore && hasPrevious && (
        <div className="loading-more-top">
          <div className="loading-spinner-small" />
        </div>
      )}

      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const block = blocks[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderBlock(block)}
            </div>
          );
        })}
      </div>

      {/* Loading indicator at bottom */}
      {isLoadingMore && hasMore && (
        <div className="loading-more-bottom">
          <div className="loading-spinner-small" />
        </div>
      )}
    </div>
  );
}
