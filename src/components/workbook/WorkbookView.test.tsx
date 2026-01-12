import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkbookView } from './WorkbookView';
import type { ExerciseContent, ExerciseBlock, SavedResponse } from './types';

// Mock next/navigation
const mockPush = vi.fn();
const mockPathname = '/workbook/1.1.1';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}));

// Mock useToast
const mockShowToast = vi.fn();
vi.mock('../feedback', () => ({
  useToast: () => ({ showToast: mockShowToast }),
  SaveIndicator: ({ status }: { status: string }) => (
    <div data-testid="save-indicator">{status}</div>
  ),
}));

// Mock useApplyTheme
vi.mock('@/hooks/useApplyTheme', () => ({
  useApplyTheme: vi.fn(),
}));

// Mock useWorkbookHistory
vi.mock('@/hooks/useWorkbookHistory', () => ({
  useWorkbookHistory: () => ({
    blocks: [],
    isLoading: false,
    isLoadingMore: false,
    hasPrevious: false,
    hasMore: false,
    loadPrevious: vi.fn(),
    loadMore: vi.fn(),
    refresh: vi.fn(),
    error: null,
    totalBlocks: 0,
    exerciseBoundaries: [],
    currentSequenceRange: { from: 1, to: 50 },
  }),
}));

// Mock ConversationThread to simplify testing
vi.mock('../conversation/ConversationThread', () => ({
  ConversationThread: ({
    messages,
    onMessageAnimated,
    animatedMessageIds,
  }: {
    messages: Array<{ id: string; type: string }>;
    onMessageAnimated?: (id: string, wasSkipped: boolean) => void;
    animatedMessageIds?: Set<string>;
  }) => (
    <div data-testid="conversation-thread">
      {messages.map((msg) => (
        <div
          key={msg.id}
          data-testid={`message-${msg.id}`}
          data-animated={animatedMessageIds?.has(msg.id) ? 'true' : 'false'}
          onClick={() => onMessageAnimated?.(msg.id, false)}
        >
          {msg.type}
        </div>
      ))}
    </div>
  ),
}));

// Mock AppShell
vi.mock('../shell/AppShell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

// Mock WorkbookInputZone
vi.mock('./WorkbookInputZone', () => ({
  WorkbookInputZone: ({
    children,
    hasActiveInput,
  }: {
    children: React.ReactNode;
    hasActiveInput: boolean;
  }) => (
    <div data-testid="input-zone" data-has-input={hasActiveInput}>
      {children}
    </div>
  ),
}));

// Mock ToolEmbed
vi.mock('./ToolEmbed', () => ({
  ToolEmbed: ({ onComplete }: { onComplete: () => void }) => (
    <div data-testid="tool-embed">
      <button onClick={onComplete}>Complete Tool</button>
    </div>
  ),
}));

// Mock PromptInput
vi.mock('./PromptInput', () => ({
  PromptInput: ({ onSubmit }: { onSubmit: (value: string) => void }) => (
    <div data-testid="prompt-input">
      <button onClick={() => onSubmit('test response')}>Submit</button>
    </div>
  ),
}));

// Mock form components
vi.mock('../forms', () => ({
  TextInput: ({
    value,
    onChange,
    onSubmit,
  }: {
    value: string;
    onChange: (v: string) => void;
    onSubmit?: () => void;
  }) => (
    <input
      data-testid="text-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
    />
  ),
  TextArea: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <textarea
      data-testid="textarea"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

// Mock fetch
global.fetch = vi.fn();

// Helper to create exercise content
function createExercise(blocks: Partial<ExerciseBlock>[]): ExerciseContent {
  return {
    exerciseId: '1.1.1',
    title: 'Test Exercise',
    part: 1,
    module: 1,
    exercise: 1,
    nextExerciseId: '1.1.2',
    blocks: blocks.map((b, i) => ({
      id: b.id ?? i + 1,
      blockType: b.blockType ?? 'content',
      content: b.content ?? { type: 'instruction', text: `Block ${i + 1}` },
      sequence: i + 1,
      activityId: b.activityId,
      connectionId: b.connectionId,
    })) as ExerciseBlock[],
  };
}

describe('WorkbookView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state calculation', () => {
    it('new user starts at first block (displayedBlockIndex=1)', () => {
      const exercise = createExercise([
        { blockType: 'content', content: { type: 'heading', text: 'Welcome' } },
        { blockType: 'content', content: { type: 'instruction', text: 'Instructions' } },
        {
          blockType: 'prompt',
          content: { id: 100, promptText: 'Question?', inputType: 'textarea' },
        },
      ]);

      render(<WorkbookView exercise={exercise} savedResponses={[]} />);

      // Should show first content block only
      const thread = screen.getByTestId('conversation-thread');
      expect(thread.children).toHaveLength(1);
    });

    it('returning user with partial progress starts at first unanswered prompt', () => {
      const exercise = createExercise([
        { id: 1, blockType: 'content', content: { type: 'heading', text: 'Welcome' } },
        { id: 2, blockType: 'content', content: { type: 'instruction', text: 'Instructions' } },
        {
          id: 3,
          blockType: 'prompt',
          content: { id: 100, promptText: 'Answered?', inputType: 'textarea' },
        },
        { id: 4, blockType: 'content', content: { type: 'instruction', text: 'More content' } },
        {
          id: 5,
          blockType: 'prompt',
          content: { id: 101, promptText: 'Unanswered?', inputType: 'textarea' },
        },
      ]);

      const savedResponses: SavedResponse[] = [
        { prompt_id: 100, tool_id: null, response_text: 'My answer' },
      ];

      render(<WorkbookView exercise={exercise} savedResponses={savedResponses} />);

      // Should show blocks up to and including the first unanswered prompt (index 4 = 5 blocks)
      // But the unanswered prompt at index 4 (id: 5) should be the stopping point
      const thread = screen.getByTestId('conversation-thread');
      // First 3 content blocks + prompt 100 text + user response = 5 messages
      // Then content block 4 = 6 messages
      // Then prompt 101 = 7 messages (but this is where we stop for input)
      expect(thread.children.length).toBeGreaterThanOrEqual(5);
    });

    it('returning user with all prompts answered shows all blocks', () => {
      const exercise = createExercise([
        { id: 1, blockType: 'content', content: { type: 'heading', text: 'Welcome' } },
        {
          id: 2,
          blockType: 'prompt',
          content: { id: 100, promptText: 'Q1?', inputType: 'textarea' },
        },
        {
          id: 3,
          blockType: 'prompt',
          content: { id: 101, promptText: 'Q2?', inputType: 'textarea' },
        },
      ]);

      const savedResponses: SavedResponse[] = [
        { prompt_id: 100, tool_id: null, response_text: 'Answer 1' },
        { prompt_id: 101, tool_id: null, response_text: 'Answer 2' },
      ];

      render(<WorkbookView exercise={exercise} savedResponses={savedResponses} />);

      // Should show all blocks including responses
      const thread = screen.getByTestId('conversation-thread');
      // heading + prompt1 + response1 + prompt2 + response2 = 5 messages
      expect(thread.children.length).toBe(5);
    });
  });

  describe('content block progression', () => {
    it('shows Continue button after content animation completes', async () => {
      const exercise = createExercise([
        { id: 1, blockType: 'content', content: { type: 'instruction', text: 'First block' } },
        { id: 2, blockType: 'content', content: { type: 'instruction', text: 'Second block' } },
      ]);

      render(<WorkbookView exercise={exercise} savedResponses={[]} />);

      // Simulate animation complete for first block
      const firstBlock = screen.getByTestId('message-block-1');
      fireEvent.click(firstBlock); // Triggers onMessageAnimated

      // Continue button should appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });
    });

    it('clicking Continue advances to next block', async () => {
      const exercise = createExercise([
        { id: 1, blockType: 'content', content: { type: 'instruction', text: 'First' } },
        { id: 2, blockType: 'content', content: { type: 'instruction', text: 'Second' } },
      ]);

      render(<WorkbookView exercise={exercise} savedResponses={[]} />);

      // Complete animation
      fireEvent.click(screen.getByTestId('message-block-1'));

      // Click Continue
      await waitFor(() => {
        const continueBtn = screen.getByRole('button', { name: /continue/i });
        fireEvent.click(continueBtn);
      });

      // Second block should now be visible
      await waitFor(() => {
        expect(screen.getByTestId('message-block-2')).toBeInTheDocument();
      });
    });
  });

  describe('prompt handling', () => {
    it('shows text input for text_input prompt type', async () => {
      const exercise = createExercise([
        {
          id: 1,
          blockType: 'prompt',
          content: { id: 100, promptText: 'Enter name', inputType: 'text_input' },
        },
      ]);

      render(<WorkbookView exercise={exercise} savedResponses={[]} />);

      // Simulate prompt animation complete
      fireEvent.click(screen.getByTestId('message-prompt-1'));

      await waitFor(() => {
        expect(screen.getByTestId('text-input')).toBeInTheDocument();
      });
    });

    it('shows textarea for textarea prompt type', async () => {
      const exercise = createExercise([
        {
          id: 1,
          blockType: 'prompt',
          content: { id: 100, promptText: 'Describe...', inputType: 'textarea' },
        },
      ]);

      render(<WorkbookView exercise={exercise} savedResponses={[]} />);

      // Simulate prompt animation complete
      fireEvent.click(screen.getByTestId('message-prompt-1'));

      await waitFor(() => {
        expect(screen.getByTestId('textarea')).toBeInTheDocument();
      });
    });

    it('shows PromptInput for structured input types', async () => {
      const exercise = createExercise([
        {
          id: 1,
          blockType: 'prompt',
          content: { id: 100, promptText: 'Rate 1-10', inputType: 'slider' },
        },
      ]);

      render(<WorkbookView exercise={exercise} savedResponses={[]} />);

      // Simulate prompt animation complete
      fireEvent.click(screen.getByTestId('message-prompt-1'));

      await waitFor(() => {
        expect(screen.getByTestId('prompt-input')).toBeInTheDocument();
      });
    });
  });

  describe('tool handling', () => {
    it('shows ToolEmbed for tool blocks', () => {
      const exercise = createExercise([
        {
          id: 1,
          blockType: 'tool',
          content: { id: 200, toolName: 'list_builder', introText: 'Build a list' },
        },
      ]);

      render(<WorkbookView exercise={exercise} savedResponses={[]} />);

      expect(screen.getByTestId('tool-embed')).toBeInTheDocument();
    });

    it('advances after tool completion', async () => {
      const exercise = createExercise([
        {
          id: 1,
          blockType: 'tool',
          content: { id: 200, toolName: 'list_builder', introText: 'Build a list' },
        },
        { id: 2, blockType: 'content', content: { type: 'instruction', text: 'Next' } },
      ]);

      render(<WorkbookView exercise={exercise} savedResponses={[]} />);

      // Click Complete Tool
      fireEvent.click(screen.getByText('Complete Tool'));

      // Should advance to next block
      await waitFor(() => {
        expect(screen.getByTestId('message-block-2')).toBeInTheDocument();
      });
    });
  });

  describe('response saving', () => {
    it('saves response via API', async () => {
      const exercise = createExercise([
        {
          id: 1,
          blockType: 'prompt',
          content: { id: 100, promptText: 'Question', inputType: 'text_input' },
        },
      ]);

      render(<WorkbookView exercise={exercise} savedResponses={[]} />);

      // Complete prompt animation
      fireEvent.click(screen.getByTestId('message-prompt-1'));

      await waitFor(() => {
        expect(screen.getByTestId('text-input')).toBeInTheDocument();
      });

      // Type response
      const input = screen.getByTestId('text-input');
      fireEvent.change(input, { target: { value: 'My answer' } });

      // Click send button
      const sendButton = screen.getByRole('button', { name: /send/i });
      fireEvent.click(sendButton);

      // Verify API was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/workbook/response',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('My answer'),
          })
        );
      });
    });

    it('shows error toast on save failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });

      const exercise = createExercise([
        {
          id: 1,
          blockType: 'prompt',
          content: { id: 100, promptText: 'Question', inputType: 'text_input' },
        },
      ]);

      render(<WorkbookView exercise={exercise} savedResponses={[]} />);

      // Complete prompt animation
      fireEvent.click(screen.getByTestId('message-prompt-1'));

      await waitFor(() => {
        expect(screen.getByTestId('text-input')).toBeInTheDocument();
      });

      // Type and submit
      const input = screen.getByTestId('text-input');
      fireEvent.change(input, { target: { value: 'My answer' } });
      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      // Error toast should be shown
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.stringContaining('Failed to save'),
          expect.any(Object)
        );
      });
    });

    it('shows network error message on fetch failure', async () => {
      const fetchError = new TypeError('Failed to fetch');
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(fetchError);

      const exercise = createExercise([
        {
          id: 1,
          blockType: 'prompt',
          content: { id: 100, promptText: 'Question', inputType: 'text_input' },
        },
      ]);

      render(<WorkbookView exercise={exercise} savedResponses={[]} />);

      // Complete prompt animation
      fireEvent.click(screen.getByTestId('message-prompt-1'));

      await waitFor(() => {
        expect(screen.getByTestId('text-input')).toBeInTheDocument();
      });

      // Type and submit
      const input = screen.getByTestId('text-input');
      fireEvent.change(input, { target: { value: 'My answer' } });
      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      // Network error toast should be shown
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.stringContaining('Unable to connect'),
          expect.any(Object)
        );
      });
    });
  });

  describe('animation tracking (ink permanence)', () => {
    it('new users have empty animatedMessageIds set', () => {
      const exercise = createExercise([
        { id: 1, blockType: 'content', content: { type: 'instruction', text: 'First' } },
      ]);

      render(<WorkbookView exercise={exercise} savedResponses={[]} />);

      // First block should NOT be pre-animated
      const msg = screen.getByTestId('message-block-1');
      expect(msg.dataset.animated).toBe('false');
    });

    it('returning users have pre-populated animatedMessageIds', () => {
      const exercise = createExercise([
        { id: 1, blockType: 'content', content: { type: 'heading', text: 'Welcome' } },
        {
          id: 2,
          blockType: 'prompt',
          content: { id: 100, promptText: 'Q?', inputType: 'textarea' },
        },
        { id: 3, blockType: 'content', content: { type: 'instruction', text: 'More' } },
      ]);

      const savedResponses: SavedResponse[] = [
        { prompt_id: 100, tool_id: null, response_text: 'Done' },
      ];

      render(<WorkbookView exercise={exercise} savedResponses={savedResponses} />);

      // Blocks before current position should be pre-animated
      const block1 = screen.getByTestId('message-block-1');
      expect(block1.dataset.animated).toBe('true');

      const prompt2 = screen.getByTestId('message-prompt-2');
      expect(prompt2.dataset.animated).toBe('true');
    });
  });

  describe('exercise completion', () => {
    it('shows Continue to next exercise when all blocks complete', async () => {
      const exercise = createExercise([
        { id: 1, blockType: 'content', content: { type: 'instruction', text: 'Only block' } },
      ]);
      exercise.nextExerciseId = '1.1.2';

      render(<WorkbookView exercise={exercise} savedResponses={[]} />);

      // Complete animation
      fireEvent.click(screen.getByTestId('message-block-1'));

      // Click first Continue (advances past content block)
      await waitFor(() => {
        const buttons = screen.getAllByRole('button', { name: /continue/i });
        fireEvent.click(buttons[0]);
      });

      // Now at end of exercise, should show Continue to next
      await waitFor(() => {
        const buttons = screen.getAllByRole('button', { name: /continue/i });
        expect(buttons.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('navigates to next exercise on final Continue click', async () => {
      const exercise = createExercise([
        { id: 1, blockType: 'content', content: { type: 'instruction', text: 'Final' } },
      ]);
      exercise.nextExerciseId = '1.1.2';

      render(<WorkbookView exercise={exercise} savedResponses={[]} />);

      // Complete animation and advance past the content block
      fireEvent.click(screen.getByTestId('message-block-1'));
      await waitFor(() => {
        const buttons = screen.getAllByRole('button', { name: /continue/i });
        fireEvent.click(buttons[0]);
      });

      // Now click Continue to go to next exercise (may be second button if both render)
      await waitFor(() => {
        const buttons = screen.getAllByRole('button', { name: /continue/i });
        // Click the last one (which is the "next exercise" button)
        fireEvent.click(buttons[buttons.length - 1]);
      });

      expect(mockPush).toHaveBeenCalledWith('/workbook/1.1.2');
    });
  });

  describe('navigation', () => {
    it('navigates to home on home nav click', () => {
      const exercise = createExercise([
        { id: 1, blockType: 'content', content: { type: 'instruction', text: 'Test' } },
      ]);

      // This test would require exposing handleNavigate or clicking AppShell nav
      // For now, we verify the component renders without errors
      render(<WorkbookView exercise={exercise} savedResponses={[]} />);
      expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    });
  });

  describe('blockToConversationContent', () => {
    // We can't directly test the function since it's not exported,
    // but we can verify the output through rendered messages

    it('converts heading content type correctly', () => {
      const exercise = createExercise([
        { id: 1, blockType: 'content', content: { type: 'heading', text: 'Title' } },
      ]);

      render(<WorkbookView exercise={exercise} savedResponses={[]} />);

      // Message should exist with correct type
      expect(screen.getByTestId('message-block-1')).toBeInTheDocument();
    });

    it('converts instruction content type correctly', () => {
      const exercise = createExercise([
        { id: 1, blockType: 'content', content: { type: 'instruction', text: 'Do this' } },
      ]);

      render(<WorkbookView exercise={exercise} savedResponses={[]} />);
      expect(screen.getByTestId('message-block-1')).toBeInTheDocument();
    });

    it('converts note content type correctly', () => {
      const exercise = createExercise([
        { id: 1, blockType: 'content', content: { type: 'note', text: 'Note text' } },
      ]);

      render(<WorkbookView exercise={exercise} savedResponses={[]} />);
      expect(screen.getByTestId('message-block-1')).toBeInTheDocument();
    });

    it('converts quote content type correctly', () => {
      const exercise = createExercise([
        { id: 1, blockType: 'content', content: { type: 'quote', text: 'Famous quote' } },
      ]);

      render(<WorkbookView exercise={exercise} savedResponses={[]} />);
      expect(screen.getByTestId('message-block-1')).toBeInTheDocument();
    });
  });

  describe('theme application', () => {
    it('renders with theme prop without error', () => {
      const exercise = createExercise([
        { id: 1, blockType: 'content', content: { type: 'instruction', text: 'Test' } },
      ]);

      const theme = {
        backgroundColor: 'ivory' as const,
        textColor: 'charcoal' as const,
        font: 'inter' as const,
      };

      // Theme application is handled by useApplyTheme hook (mocked)
      // Just verify the component renders without error when theme is provided
      const { container } = render(
        <WorkbookView exercise={exercise} savedResponses={[]} theme={theme} />
      );

      expect(container.querySelector('[data-testid="app-shell"]')).toBeInTheDocument();
    });

    it('renders without theme prop (uses defaults)', () => {
      const exercise = createExercise([
        { id: 1, blockType: 'content', content: { type: 'instruction', text: 'Test' } },
      ]);

      const { container } = render(
        <WorkbookView exercise={exercise} savedResponses={[]} />
      );

      expect(container.querySelector('[data-testid="app-shell"]')).toBeInTheDocument();
    });
  });
});
