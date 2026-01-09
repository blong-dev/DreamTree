import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HistoryZone } from './HistoryZone';

// Mock the hook
vi.mock('@/hooks/useWorkbookHistory', () => ({
  useWorkbookHistory: vi.fn(),
}));

// Mock VirtualizedConversation to avoid complex dependencies
vi.mock('./VirtualizedConversation', () => ({
  VirtualizedConversation: vi.fn(({ blocks, exerciseBoundaries }) => (
    <div data-testid="virtualized-conversation">
      <div data-testid="block-count">{blocks.length}</div>
      <div data-testid="boundary-count">{exerciseBoundaries.length}</div>
    </div>
  )),
}));

import { useWorkbookHistory } from '@/hooks/useWorkbookHistory';

const mockUseWorkbookHistory = useWorkbookHistory as ReturnType<typeof vi.fn>;

describe('HistoryZone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when loading', () => {
    it('renders VirtualizedConversation during load', () => {
      mockUseWorkbookHistory.mockReturnValue({
        blocks: [],
        isLoading: true,
        isLoadingMore: false,
        hasMore: false,
        hasPrevious: false,
        exerciseBoundaries: [],
        loadMore: vi.fn(),
        loadPrevious: vi.fn(),
      });

      render(<HistoryZone currentExerciseId="1.1.1" />);

      // VirtualizedConversation handles loading state
      expect(screen.getByTestId('virtualized-conversation')).toBeInTheDocument();
    });
  });

  describe('when no history exists', () => {
    it('returns null when not loading and no blocks', () => {
      mockUseWorkbookHistory.mockReturnValue({
        blocks: [],
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        hasPrevious: false,
        exerciseBoundaries: [],
        loadMore: vi.fn(),
        loadPrevious: vi.fn(),
      });

      const { container } = render(<HistoryZone currentExerciseId="1.1.1" />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('block filtering', () => {
    it('filters out blocks from current exercise', () => {
      mockUseWorkbookHistory.mockReturnValue({
        blocks: [
          { id: 1, exerciseId: '1.1.1', content: 'Current' },
          { id: 2, exerciseId: '1.1.2', content: 'History 1' },
          { id: 3, exerciseId: '1.1.3', content: 'History 2' },
        ],
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        hasPrevious: false,
        exerciseBoundaries: [],
        loadMore: vi.fn(),
        loadPrevious: vi.fn(),
      });

      render(<HistoryZone currentExerciseId="1.1.1" />);

      // Should pass 2 blocks (excluding current exercise)
      expect(screen.getByTestId('block-count')).toHaveTextContent('2');
    });

    it('includes all blocks when none match current exercise', () => {
      mockUseWorkbookHistory.mockReturnValue({
        blocks: [
          { id: 1, exerciseId: '1.1.1', content: 'History 1' },
          { id: 2, exerciseId: '1.1.2', content: 'History 2' },
        ],
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        hasPrevious: false,
        exerciseBoundaries: [],
        loadMore: vi.fn(),
        loadPrevious: vi.fn(),
      });

      render(<HistoryZone currentExerciseId="1.2.1" />);

      // Should pass all 2 blocks
      expect(screen.getByTestId('block-count')).toHaveTextContent('2');
    });

    it('returns null when all blocks are from current exercise', () => {
      mockUseWorkbookHistory.mockReturnValue({
        blocks: [
          { id: 1, exerciseId: '1.1.1', content: 'Current 1' },
          { id: 2, exerciseId: '1.1.1', content: 'Current 2' },
        ],
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        hasPrevious: false,
        exerciseBoundaries: [],
        loadMore: vi.fn(),
        loadPrevious: vi.fn(),
      });

      const { container } = render(<HistoryZone currentExerciseId="1.1.1" />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('exercise boundary filtering', () => {
    it('filters out boundaries from current exercise', () => {
      mockUseWorkbookHistory.mockReturnValue({
        blocks: [
          { id: 1, exerciseId: '1.1.2', content: 'History' },
        ],
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        hasPrevious: false,
        exerciseBoundaries: [
          { exerciseId: '1.1.1', title: 'Current' },
          { exerciseId: '1.1.2', title: 'Previous' },
          { exerciseId: '1.1.3', title: 'Older' },
        ],
        loadMore: vi.fn(),
        loadPrevious: vi.fn(),
      });

      render(<HistoryZone currentExerciseId="1.1.1" />);

      // Should pass 2 boundaries (excluding current)
      expect(screen.getByTestId('boundary-count')).toHaveTextContent('2');
    });
  });

  describe('props forwarding', () => {
    it('passes pageSize to hook', () => {
      mockUseWorkbookHistory.mockReturnValue({
        blocks: [{ id: 1, exerciseId: '1.1.2', content: 'Test' }],
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        hasPrevious: false,
        exerciseBoundaries: [],
        loadMore: vi.fn(),
        loadPrevious: vi.fn(),
      });

      render(<HistoryZone currentExerciseId="1.1.1" pageSize={100} />);

      expect(mockUseWorkbookHistory).toHaveBeenCalledWith({ pageSize: 100 });
    });

    it('uses default pageSize of 50', () => {
      mockUseWorkbookHistory.mockReturnValue({
        blocks: [{ id: 1, exerciseId: '1.1.2', content: 'Test' }],
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        hasPrevious: false,
        exerciseBoundaries: [],
        loadMore: vi.fn(),
        loadPrevious: vi.fn(),
      });

      render(<HistoryZone currentExerciseId="1.1.1" />);

      expect(mockUseWorkbookHistory).toHaveBeenCalledWith({ pageSize: 50 });
    });
  });

  describe('container element', () => {
    it('renders with history-zone class', () => {
      mockUseWorkbookHistory.mockReturnValue({
        blocks: [{ id: 1, exerciseId: '1.1.2', content: 'Test' }],
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        hasPrevious: false,
        exerciseBoundaries: [],
        loadMore: vi.fn(),
        loadPrevious: vi.fn(),
      });

      const { container } = render(<HistoryZone currentExerciseId="1.1.1" />);

      expect(container.querySelector('.history-zone')).toBeInTheDocument();
    });
  });
});
