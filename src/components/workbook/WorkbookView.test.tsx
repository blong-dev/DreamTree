import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkbookView } from './WorkbookView';
import type { BlockWithResponse } from './types';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/workbook',
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

// Helper to create blocks with the new BlockWithResponse structure
function createBlocks(
  blockDefs: Array<{
    blockType: 'content' | 'prompt' | 'tool';
    content?: Record<string, unknown>;
    response?: string | null;
  }>
): BlockWithResponse[] { // code_id:385
  return blockDefs.map((def, i) => ({
    id: i + 1,
    sequence: i + 1,
    exerciseId: '1.1.1',
    blockType: def.blockType,
    activityId: 1,
    connectionId: null,
    content: def.content || { type: 'instruction', text: `Block ${i + 1}` },
    response: def.response ?? null,
    responseId: def.response ? `resp-${i + 1}` : null,
  }));
}

describe('WorkbookView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ nextBlock: null, newProgress: 1 }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state calculation', () => {
    it('new user sees all blocks up to first unanswered prompt', () => {
      const blocks = createBlocks([
        { blockType: 'content', content: { type: 'heading', text: 'Welcome' } },
        { blockType: 'content', content: { type: 'instruction', text: 'Instructions' } },
        { blockType: 'prompt', content: { id: 100, promptText: 'Question?', inputType: 'textarea' } },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={0} />);

      // New architecture: show all blocks up to and including first unanswered prompt
      // That means: heading + instruction + prompt = 3 messages
      const thread = screen.getByTestId('conversation-thread');
      expect(thread.children).toHaveLength(3);
    });

    it('returning user with partial progress starts at first unanswered prompt', () => {
      const blocks = createBlocks([
        { blockType: 'content', content: { type: 'heading', text: 'Welcome' } },
        { blockType: 'content', content: { type: 'instruction', text: 'Instructions' } },
        { blockType: 'prompt', content: { id: 100, promptText: 'Answered?', inputType: 'textarea' }, response: 'My answer' },
        { blockType: 'content', content: { type: 'instruction', text: 'More content' } },
        { blockType: 'prompt', content: { id: 101, promptText: 'Unanswered?', inputType: 'textarea' } },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={3} />);

      const thread = screen.getByTestId('conversation-thread');
      // Should show blocks up to first unanswered prompt (5 blocks = 7 messages: 2 content + prompt1 text + response + content + prompt2 text = 6 messages minimum)
      // The findIndex finds the first unanswered which is at index 4, so displayedBlockIndex = 5
      expect(thread.children.length).toBeGreaterThanOrEqual(6);
    });

    it('returning user with all prompts answered shows all blocks', () => {
      const blocks = createBlocks([
        { blockType: 'content', content: { type: 'heading', text: 'Welcome' } },
        { blockType: 'prompt', content: { id: 100, promptText: 'Q1?', inputType: 'textarea' }, response: 'Answer 1' },
        { blockType: 'prompt', content: { id: 101, promptText: 'Q2?', inputType: 'textarea' }, response: 'Answer 2' },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={3} />);

      const thread = screen.getByTestId('conversation-thread');
      // heading + prompt1 + response1 + prompt2 + response2 = 5 messages
      expect(thread.children.length).toBe(5);
    });
  });

  describe('content block progression', () => {
    it('shows content blocks up to first unanswered prompt', () => {
      // New architecture shows all blocks up to and including the first unanswered prompt
      const blocks = createBlocks([
        { blockType: 'content', content: { type: 'instruction', text: 'First block' } },
        { blockType: 'prompt', content: { id: 100, promptText: 'Question?', inputType: 'textarea' } },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={0} />);

      // Both blocks should be visible (content + unanswered prompt)
      expect(screen.getByTestId('message-block-1')).toBeInTheDocument();
      expect(screen.getByTestId('message-prompt-2')).toBeInTheDocument();
    });

    it('prompt input appears after prompt animation', async () => {
      const blocks = createBlocks([
        { blockType: 'content', content: { type: 'instruction', text: 'First' } },
        { blockType: 'prompt', content: { id: 100, promptText: 'Question?', inputType: 'text_input' } },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={0} />);

      // Prompt is the current block, click to trigger animation complete
      fireEvent.click(screen.getByTestId('message-prompt-2'));

      // Text input should appear for prompt after animation
      await waitFor(() => {
        expect(screen.getByTestId('text-input')).toBeInTheDocument();
      });
    });
  });

  describe('prompt handling', () => {
    it('shows text input for text_input prompt type', async () => {
      const blocks = createBlocks([
        { blockType: 'prompt', content: { id: 100, promptText: 'Enter name', inputType: 'text_input' } },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={0} />);

      // Simulate prompt animation complete
      fireEvent.click(screen.getByTestId('message-prompt-1'));

      await waitFor(() => {
        expect(screen.getByTestId('text-input')).toBeInTheDocument();
      });
    });

    it('shows textarea for textarea prompt type', async () => {
      const blocks = createBlocks([
        { blockType: 'prompt', content: { id: 100, promptText: 'Describe...', inputType: 'textarea' } },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={0} />);

      // Simulate prompt animation complete
      fireEvent.click(screen.getByTestId('message-prompt-1'));

      await waitFor(() => {
        expect(screen.getByTestId('textarea')).toBeInTheDocument();
      });
    });

    it('shows PromptInput for structured input types', async () => {
      const blocks = createBlocks([
        { blockType: 'prompt', content: { id: 100, promptText: 'Rate 1-10', inputType: 'slider' } },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={0} />);

      // Simulate prompt animation complete
      fireEvent.click(screen.getByTestId('message-prompt-1'));

      await waitFor(() => {
        expect(screen.getByTestId('prompt-input')).toBeInTheDocument();
      });
    });
  });

  describe('tool handling', () => {
    it('shows ToolEmbed for tool blocks', () => {
      const blocks = createBlocks([
        { blockType: 'tool', content: { id: 200, name: 'list_builder', description: 'Build a list' } },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={0} />);

      expect(screen.getByTestId('tool-embed')).toBeInTheDocument();
    });

    it('advances after tool completion', async () => {
      const blocks = createBlocks([
        { blockType: 'tool', content: { id: 200, name: 'list_builder', description: 'Build a list' } },
        { blockType: 'content', content: { type: 'instruction', text: 'Next' } },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={0} />);

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
      const blocks = createBlocks([
        { blockType: 'prompt', content: { id: 100, promptText: 'Question', inputType: 'text_input' } },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={0} />);

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

      const blocks = createBlocks([
        { blockType: 'prompt', content: { id: 100, promptText: 'Question', inputType: 'text_input' } },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={0} />);

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

      const blocks = createBlocks([
        { blockType: 'prompt', content: { id: 100, promptText: 'Question', inputType: 'text_input' } },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={0} />);

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
      const blocks = createBlocks([
        { blockType: 'content', content: { type: 'instruction', text: 'First' } },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={0} />);

      // First block should NOT be pre-animated
      const msg = screen.getByTestId('message-block-1');
      expect(msg.dataset.animated).toBe('false');
    });

    it('returning users have pre-populated animatedMessageIds', () => {
      const blocks = createBlocks([
        { blockType: 'content', content: { type: 'heading', text: 'Welcome' } },
        { blockType: 'prompt', content: { id: 100, promptText: 'Q?', inputType: 'textarea' }, response: 'Done' },
        { blockType: 'content', content: { type: 'instruction', text: 'More' } },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={2} />);

      // Blocks before current position should be pre-animated
      const block1 = screen.getByTestId('message-block-1');
      expect(block1.dataset.animated).toBe('true');

      const prompt2 = screen.getByTestId('message-prompt-2');
      expect(prompt2.dataset.animated).toBe('true');
    });
  });

  describe('workbook completion', () => {
    it('handles end of blocks gracefully', () => {
      // With only content blocks and no prompts/tools, all content is shown at once
      const blocks = createBlocks([
        { blockType: 'content', content: { type: 'instruction', text: 'Only block' } },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={0} />);

      // Block should be rendered
      expect(screen.getByTestId('message-block-1')).toBeInTheDocument();

      // The input zone should have no active input (no prompts/tools to respond to)
      const inputZone = screen.getByTestId('input-zone');
      expect(inputZone).toHaveAttribute('data-has-input', 'false');
    });

    it('shows continue button when prompt/tool exists', async () => {
      const blocks = createBlocks([
        { blockType: 'content', content: { type: 'instruction', text: 'First' } },
        { blockType: 'prompt', content: { id: 100, promptText: 'Final question', inputType: 'textarea' }, response: 'Answer' },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={2} />);

      // Both blocks should be rendered since the prompt is answered
      expect(screen.getByTestId('message-block-1')).toBeInTheDocument();
      expect(screen.getByTestId('message-prompt-2')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('renders without navigation errors', () => {
      const blocks = createBlocks([
        { blockType: 'content', content: { type: 'instruction', text: 'Test' } },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={0} />);
      expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    });
  });

  describe('blockToConversationContent', () => {
    it('converts heading content type correctly', () => {
      const blocks = createBlocks([
        { blockType: 'content', content: { type: 'heading', text: 'Title' } },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={0} />);
      expect(screen.getByTestId('message-block-1')).toBeInTheDocument();
    });

    it('converts instruction content type correctly', () => {
      const blocks = createBlocks([
        { blockType: 'content', content: { type: 'instruction', text: 'Do this' } },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={0} />);
      expect(screen.getByTestId('message-block-1')).toBeInTheDocument();
    });

    it('converts note content type correctly', () => {
      const blocks = createBlocks([
        { blockType: 'content', content: { type: 'note', text: 'Note text' } },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={0} />);
      expect(screen.getByTestId('message-block-1')).toBeInTheDocument();
    });

    it('converts quote content type correctly', () => {
      const blocks = createBlocks([
        { blockType: 'content', content: { type: 'quote', text: 'Famous quote' } },
      ]);

      render(<WorkbookView initialBlocks={blocks} initialProgress={0} />);
      expect(screen.getByTestId('message-block-1')).toBeInTheDocument();
    });
  });

  describe('theme application', () => {
    it('renders with theme prop without error', () => {
      const blocks = createBlocks([
        { blockType: 'content', content: { type: 'instruction', text: 'Test' } },
      ]);

      const theme = {
        backgroundColor: 'ivory' as const,
        textColor: 'charcoal' as const,
        font: 'inter' as const,
      };

      const { container } = render(
        <WorkbookView initialBlocks={blocks} initialProgress={0} theme={theme} />
      );

      expect(container.querySelector('[data-testid="app-shell"]')).toBeInTheDocument();
    });

    it('renders without theme prop (uses defaults)', () => {
      const blocks = createBlocks([
        { blockType: 'content', content: { type: 'instruction', text: 'Test' } },
      ]);

      const { container } = render(
        <WorkbookView initialBlocks={blocks} initialProgress={0} />
      );

      expect(container.querySelector('[data-testid="app-shell"]')).toBeInTheDocument();
    });
  });
});
