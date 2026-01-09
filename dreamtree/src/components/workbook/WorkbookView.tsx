'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../shell/AppShell';
import { ConversationThread } from '../conversation/ConversationThread';
import { PromptInput } from './PromptInput';
import { ToolEmbed } from './ToolEmbed';
import { useToast } from '../feedback';
import type { ExerciseContent, ExerciseBlock, SavedResponse, PromptData, ToolData, ContentData } from './types';
import type { Message, ContentBlock, UserResponseContent } from '../conversation/types';
import type { BreadcrumbLocation, InputType } from '../shell/types';

interface WorkbookViewProps {
  exercise: ExerciseContent;
  savedResponses: SavedResponse[];
}

// Convert exercise content blocks to conversation messages
function blockToConversationContent(block: ExerciseBlock): ContentBlock[] {
  const content = block.content as ContentData;
  const text = content.text || '';

  switch (content.type) {
    case 'heading':
      return [{ type: 'heading', level: 2, text }];
    case 'instruction':
      return [{ type: 'paragraph', text }];
    case 'note':
      return [{ type: 'emphasis', text }];
    case 'quote':
      return [{ type: 'quote', text }];
    case 'transition':
      return [{ type: 'paragraph', text }];
    case 'celebration':
      return [{ type: 'activity-header', title: text }];
    default:
      return [{ type: 'paragraph', text }];
  }
}

export function WorkbookView({ exercise, savedResponses }: WorkbookViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const threadRef = useRef<HTMLDivElement>(null);

  // Build maps of saved responses by prompt ID and tool ID (memoized to prevent stale closures)
  const promptResponseMap = useMemo(
    () => new Map(
      savedResponses
        .filter(r => r.prompt_id !== null)
        .map(r => [r.prompt_id as number, r.response_text || ''])
    ),
    [savedResponses]
  );

  const toolResponseMap = useMemo(
    () => new Map(
      savedResponses
        .filter(r => r.tool_id !== null)
        .map(r => [r.tool_id as number, r.response_text || ''])
    ),
    [savedResponses]
  );

  // Track which block we're currently displaying (for one-at-a-time progression)
  const [displayedBlockIndex, setDisplayedBlockIndex] = useState(() => {
    // Check if user has ANY saved responses (returning user)
    const hasAnyResponses = savedResponses.length > 0;

    if (!hasAnyResponses) {
      // New user - start with first block only, they'll click through
      return 1;
    }

    // Returning user - find the first unanswered prompt or tool
    const interactiveBlocks = exercise.blocks.filter(b => b.blockType === 'prompt' || b.blockType === 'tool');
    const firstUnanswered = interactiveBlocks.findIndex(b => {
      if (b.blockType === 'prompt') {
        const promptData = b.content as PromptData;
        const promptId = promptData.id;
        if (promptId === undefined) return true;
        return !promptResponseMap.has(promptId);
      } else if (b.blockType === 'tool') {
        const toolData = b.content as ToolData;
        const toolId = toolData.id;
        if (toolId === undefined) return true;
        return !toolResponseMap.has(toolId);
      }
      return false;
    });

    if (firstUnanswered === -1) {
      // All prompts/tools answered, show everything
      return exercise.blocks.length;
    }

    // Show all blocks up to and including the first unanswered prompt/tool
    const firstUnansweredBlock = interactiveBlocks[firstUnanswered];
    return exercise.blocks.indexOf(firstUnansweredBlock) + 1;
  });

  // Current active prompt (if any)
  const [activePrompt, setActivePrompt] = useState<ExerciseBlock | null>(null);
  const [activeTool, setActiveTool] = useState<ExerciseBlock | null>(null);

  // Input state
  const [inputValue, setInputValue] = useState('');
  const [inputType, setInputType] = useState<InputType>('none');
  const [isSaving, setIsSaving] = useState(false);

  // Build messages array from blocks and responses
  const messages: Message[] = [];
  let messageId = 0;

  for (let i = 0; i < displayedBlockIndex && i < exercise.blocks.length; i++) {
    const block = exercise.blocks[i];

    if (block.blockType === 'content') {
      messages.push({
        id: `msg-${messageId++}`,
        type: 'content',
        data: blockToConversationContent(block),
        timestamp: new Date(),
      });
    } else if (block.blockType === 'prompt') {
      // Show the prompt text as content
      const promptData = block.content as PromptData;
      messages.push({
        id: `msg-${messageId++}`,
        type: 'content',
        data: [{ type: 'paragraph', text: promptData.promptText || 'Please respond:' }],
        timestamp: new Date(),
      });

      // Check if user has responded to this prompt
      const promptId = promptData.id;
      if (promptId !== undefined) {
        const savedResponse = promptResponseMap.get(promptId);
        if (savedResponse) {
          messages.push({
            id: `msg-${messageId++}`,
            type: 'user',
            data: { type: 'text', value: savedResponse } as UserResponseContent,
            timestamp: new Date(),
          });
        }
      }
    } else if (block.blockType === 'tool') {
      // Tools are rendered inline by ToolEmbed - don't duplicate in messages
      // Just track that we've passed this block for history purposes
      const toolData = block.content as ToolData;
      const toolId = toolData.id;

      // Only show a minimal marker if the tool has been completed (for history)
      if (toolId !== undefined && toolResponseMap.has(toolId)) {
        // Tool was completed - the response is stored, but we don't show a message
        // The tool component will re-render with saved data if user scrolls back
      }
    }
  }

  // Track if we're waiting for user to click Continue on a content block
  const [waitingForContinue, setWaitingForContinue] = useState(false);

  // Determine what input to show
  useEffect(() => {
    // Find the current active block
    const currentBlock = exercise.blocks[displayedBlockIndex - 1];

    if (!currentBlock) {
      setInputType('none');
      setActivePrompt(null);
      setActiveTool(null);
      setWaitingForContinue(false);
      return;
    }

    if (currentBlock.blockType === 'prompt') {
      const promptData = currentBlock.content as PromptData;
      const promptId = promptData.id;
      const hasResponse = promptId !== undefined && promptResponseMap.has(promptId);

      if (!hasResponse) {
        setActivePrompt(currentBlock);
        setActiveTool(null);
        setWaitingForContinue(false);

        // Set input type based on prompt type
        switch (promptData.inputType) {
          case 'text_input':
            setInputType('text');
            break;
          case 'textarea':
            setInputType('textarea');
            break;
          default:
            setInputType('none'); // Structured inputs are handled by PromptInput
        }
        return;
      }
      // Prompt already answered - advance to show next block
      if (displayedBlockIndex < exercise.blocks.length) {
        setDisplayedBlockIndex(prev => prev + 1);
      }
    } else if (currentBlock.blockType === 'tool') {
      const toolData = currentBlock.content as ToolData;
      const toolId = toolData.id;
      const hasToolResponse = toolId !== undefined && toolResponseMap.has(toolId);

      if (!hasToolResponse) {
        setActiveTool(currentBlock);
        setActivePrompt(null);
        setInputType('none');
        setWaitingForContinue(false);
        return;
      }
      // Tool already completed - advance to show next block
      if (displayedBlockIndex < exercise.blocks.length) {
        setDisplayedBlockIndex(prev => prev + 1);
      }
    } else if (currentBlock.blockType === 'content') {
      // Content block - wait for user to click Continue
      setActivePrompt(null);
      setActiveTool(null);
      setInputType('none');
      setWaitingForContinue(true);
      return;
    }

    // We've reached the end of the exercise
    if (displayedBlockIndex >= exercise.blocks.length) {
      setInputType('none');
      setActivePrompt(null);
      setActiveTool(null);
      setWaitingForContinue(false);
    }
  }, [displayedBlockIndex, exercise.blocks, promptResponseMap, toolResponseMap]);

  // Handle Continue button click for content blocks
  const handleContinue = useCallback(() => {
    setWaitingForContinue(false);
    if (displayedBlockIndex < exercise.blocks.length) {
      setDisplayedBlockIndex(prev => prev + 1);
    }
  }, [displayedBlockIndex, exercise.blocks.length]);

  // Global Enter key handler for continue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Enter when waiting for continue and no input is focused
      if (e.key === 'Enter' && waitingForContinue) {
        const activeElement = document.activeElement;
        const isInputFocused = activeElement?.tagName === 'INPUT' ||
          activeElement?.tagName === 'TEXTAREA' ||
          activeElement?.tagName === 'SELECT';

        if (!isInputFocused) {
          e.preventDefault();
          handleContinue();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [waitingForContinue, handleContinue]);

  // Save a response
  const handleSaveResponse = useCallback(async (responseText: string) => {
    if (!activePrompt || isSaving) return;

    const promptData = activePrompt.content as PromptData;

    setIsSaving(true);
    try {
      const response = await fetch('/api/workbook/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: promptData.id,
          exerciseId: exercise.exerciseId,
          activityId: activePrompt.activityId?.toString(),
          responseText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save response');
      }

      // Update local state
      if (promptData.id !== undefined) {
        promptResponseMap.set(promptData.id, responseText);
      }

      // Clear input and advance
      setInputValue('');
      setActivePrompt(null);

      // Advance to next block after a short delay
      setTimeout(() => {
        setDisplayedBlockIndex(prev => prev + 1);
      }, 300);

    } catch (error) {
      console.error('Error saving response:', error);
      showToast('Failed to save your response. Please try again.', { type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }, [activePrompt, exercise.exerciseId, isSaving, showToast, promptResponseMap]);

  // Handle tool completion
  const handleToolComplete = useCallback(() => {
    // Update local state to mark tool as completed
    if (activeTool) {
      const toolData = activeTool.content as ToolData;
      if (toolData.id !== undefined) {
        toolResponseMap.set(toolData.id, '[saved]');
      }
    }
    setActiveTool(null);
    setTimeout(() => {
      setDisplayedBlockIndex(prev => prev + 1);
    }, 300);
  }, [activeTool, toolResponseMap]);

  // Handle navigation
  const handleNavigate = (id: string) => {
    if (id === 'home') {
      router.push('/');
    } else if (id === 'contents') {
      // TODO: Open TOC panel
    } else if (id === 'tools') {
      router.push('/tools');
    } else if (id === 'profile') {
      router.push('/profile');
    }
  };

  // Build breadcrumb location
  const breadcrumbLocation: BreadcrumbLocation = {
    partId: exercise.part.toString(),
    partTitle: `Part ${exercise.part}`,
    moduleId: `${exercise.part}.${exercise.module}`,
    moduleTitle: `Module ${exercise.module}`,
    exerciseId: exercise.exerciseId,
    exerciseTitle: exercise.title,
  };

  // Check if exercise is complete
  const isExerciseComplete = displayedBlockIndex >= exercise.blocks.length &&
    !activePrompt && !activeTool;

  return (
    <AppShell
      currentLocation={breadcrumbLocation}
      showBreadcrumb={true}
      showInput={inputType !== 'none' && !activeTool}
      inputType={inputType}
      inputValue={inputValue}
      inputPlaceholder={
        activePrompt
          ? (activePrompt.content as PromptData).inputConfig?.placeholder || 'Type your response...'
          : 'Type here...'
      }
      onInputChange={setInputValue}
      onInputSubmit={handleSaveResponse}
      activeNavItem="home"
      hideContents={true}
      onNavigate={handleNavigate}
    >
      <div className="workbook-view" ref={threadRef}>
        <ConversationThread
          messages={messages}
          autoScrollOnNew={true}
        />

        {/* Structured prompt input (non-text types) */}
        {activePrompt && inputType === 'none' && (
          <PromptInput
            prompt={activePrompt.content as PromptData}
            onSubmit={handleSaveResponse}
            disabled={isSaving}
          />
        )}

        {/* Tool embed */}
        {activeTool && (
          <ToolEmbed
            tool={activeTool.content as ToolData}
            exerciseId={exercise.exerciseId}
            connectionId={activeTool.connectionId}
            onComplete={handleToolComplete}
          />
        )}

        {/* Continue button for content blocks */}
        {waitingForContinue && (
          <div className="workbook-continue">
            <button
              className="button button-primary"
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>
        )}

        {/* Continue to next exercise when complete */}
        {isExerciseComplete && exercise.nextExerciseId && (
          <div className="workbook-continue">
            <button
              className="button button-primary"
              onClick={() => router.push(`/workbook/${exercise.nextExerciseId}`)}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
