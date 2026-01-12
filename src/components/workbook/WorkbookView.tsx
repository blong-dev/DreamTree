'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Debounce delay for auto-save (ms)
const AUTO_SAVE_DELAY = 1500;
import { useRouter, usePathname } from 'next/navigation';
import { AppShell } from '../shell/AppShell';
import { ConversationThread } from '../conversation/ConversationThread';
import { PromptInput } from './PromptInput';
import { ToolEmbed } from './ToolEmbed';
import { WorkbookInputZone } from './WorkbookInputZone';
import { useToast, SaveIndicator } from '../feedback';
import { TextInput, TextArea } from '../forms';
import { SendIcon } from '../icons';
import { TOCPanel } from '../overlays/TOCPanel';
import type { WorkbookProgress, BreadcrumbLocation as TOCLocation } from '../overlays/types';

import { useApplyTheme } from '@/hooks/useApplyTheme';
import { useWorkbookHistory, type HistoryBlock } from '@/hooks/useWorkbookHistory';
import type { SaveStatus } from '../feedback/types';
import type { ExerciseContent, ExerciseBlock, SavedResponse, PromptData, ToolData, ContentData, ThemeSettings } from './types';
import type { Message, ContentBlock, UserResponseContent } from '../conversation/types';
import type { BreadcrumbLocation, InputType } from '../shell/types';

interface WorkbookViewProps {
  exercise: ExerciseContent;
  savedResponses: SavedResponse[];
  theme?: ThemeSettings;
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

export function WorkbookView({ exercise, savedResponses, theme }: WorkbookViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  // Apply user's theme on mount (if provided)
  useApplyTheme({
    backgroundColor: theme?.backgroundColor,
    textColor: theme?.textColor,
    font: theme?.font,
  });

  // Fetch history for past exercises (lazy loaded on scroll up)
  const {
    blocks: historyBlocks,
    isLoading: isLoadingHistory,
    isLoadingMore: isLoadingMoreHistory,
    hasPrevious: hasMoreHistory,
    loadPrevious: loadMoreHistory,
  } = useWorkbookHistory();

  // Convert history blocks to conversation messages
  const historyMessages = useMemo((): Message[] => {
    // Filter out blocks from current exercise (we render those with typing effects)
    const pastBlocks = historyBlocks.filter(b => b.exerciseId !== exercise.exerciseId);

    return pastBlocks.map((block): Message | null => {
      if (block.blockType === 'content') {
        const contentType = block.content.type || 'paragraph';
        let contentBlock: ContentBlock;

        switch (contentType) {
          case 'heading':
            contentBlock = { type: 'heading', level: 2, text: block.content.text || '' };
            break;
          case 'instruction':
          case 'transition':
            contentBlock = { type: 'paragraph', text: block.content.text || '' };
            break;
          case 'note':
            contentBlock = { type: 'emphasis', text: block.content.text || '' };
            break;
          case 'quote':
            contentBlock = { type: 'quote', text: block.content.text || '' };
            break;
          default:
            contentBlock = { type: 'paragraph', text: block.content.text || '' };
        }

        return {
          id: `history-block-${block.id}`,
          type: 'content',
          data: [contentBlock],
          timestamp: new Date(),
        };
      } else if (block.blockType === 'prompt') {
        // Show the prompt question
        const messages: Message[] = [];
        messages.push({
          id: `history-prompt-${block.id}`,
          type: 'content',
          data: [{ type: 'paragraph', text: block.content.promptText || 'Please respond:' }],
          timestamp: new Date(),
        });

        // Show user's response if available
        if (block.userResponse) {
          messages.push({
            id: `history-response-${block.id}`,
            type: 'user',
            data: { type: 'text', value: block.userResponse } as UserResponseContent,
            timestamp: new Date(),
          });
        }

        return messages as unknown as Message; // Will flatten below
      }

      return null;
    }).flat().filter((m): m is Message => m !== null);
  }, [historyBlocks, exercise.exerciseId]);

  // Build maps of saved responses by prompt ID and tool ID
  // Using useState instead of useMemo to allow proper immutable updates
  const [promptResponseMap, setPromptResponseMap] = useState(
    () => new Map(
      savedResponses
        .filter(r => r.prompt_id !== null)
        .map(r => [r.prompt_id as number, r.response_text || ''])
    )
  );

  const [toolResponseMap, setToolResponseMap] = useState(
    () => new Map(
      savedResponses
        .filter(r => r.tool_id !== null)
        .map(r => [r.tool_id as number, r.response_text || ''])
    )
  );

  // IMP-003: Cache content per block.id to avoid recomputing on every render
  const blockContentCache = useRef<Map<number, ContentBlock[]>>(new Map());

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
  const [autoSaveStatus, setAutoSaveStatus] = useState<SaveStatus>('idle');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const savedIndicatorTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedValueRef = useRef<string>('');

  // Edit state - tracks which prompt is being edited (null = not editing)
  const [editingPromptId, setEditingPromptId] = useState<number | null>(null);

  // Scroll tracking for input zone collapse behavior
  const [inputZoneCollapsed, setInputZoneCollapsed] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // TOC panel state
  const [tocOpen, setTocOpen] = useState(false);

  // Track which message IDs have been animated (ink permanence - never re-animate)
  // For returning users, pre-populate with IDs of messages they've already seen
  const animatedMessageIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);

  // Initialize on first render for returning users
  if (!isInitializedRef.current && savedResponses.length > 0) {
    isInitializedRef.current = true;
    // Mark all blocks that would be shown at initial displayedBlockIndex as already animated
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
    const initialDisplayIndex = firstUnanswered === -1
      ? exercise.blocks.length
      : exercise.blocks.indexOf(interactiveBlocks[firstUnanswered]) + 1;

    // Add all message IDs that would be built for blocks 0 to initialDisplayIndex-1
    for (let i = 0; i < initialDisplayIndex && i < exercise.blocks.length; i++) {
      const block = exercise.blocks[i];
      if (block.blockType === 'content') {
        animatedMessageIdsRef.current.add(`block-${block.id}`);
      } else if (block.blockType === 'prompt') {
        animatedMessageIdsRef.current.add(`prompt-${block.id}`);
        const promptData = block.content as PromptData;
        if (promptData.id !== undefined && promptResponseMap.has(promptData.id)) {
          animatedMessageIdsRef.current.add(`response-${block.id}`);
        }
      }
    }
  } else if (!isInitializedRef.current) {
    isInitializedRef.current = true;
  }

  // Track if current content block animation is complete (for showing Continue)
  const [currentAnimationComplete, setCurrentAnimationComplete] = useState(false);

  // Track if current prompt question animation is complete (for auto-revealing input)
  // Initialized to true if returning user's current block is an already-animated prompt
  const [promptAnimationComplete, setPromptAnimationComplete] = useState(() => {
    if (savedResponses.length > 0) {
      // Returning user - check if current block is an already-animated prompt
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
      const initialDisplayIndex = firstUnanswered === -1
        ? exercise.blocks.length
        : exercise.blocks.indexOf(interactiveBlocks[firstUnanswered]) + 1;

      const currentBlock = exercise.blocks[initialDisplayIndex - 1];
      // If current block is prompt and would be pre-animated, start with true
      if (currentBlock?.blockType === 'prompt') {
        return true; // Returning user at prompt - show input immediately
      }
    }
    return false;
  });

  // Callback when a message animation completes - add to the permanent set
  // If user clicked to skip (wasSkipped=true), auto-advance content blocks
  const handleMessageAnimated = useCallback((messageId: string, wasSkipped: boolean) => {
    animatedMessageIdsRef.current.add(messageId);
    const currentBlock = exercise.blocks[displayedBlockIndex - 1];

    // Content blocks - either auto-advance (if skipped) or show Continue button
    if (currentBlock?.blockType === 'content' && messageId === `block-${currentBlock.id}`) {
      if (wasSkipped) {
        // User tapped to skip - auto-advance to next block (like pressing Continue)
        setWaitingForContinue(false);
        if (displayedBlockIndex < exercise.blocks.length) {
          setDisplayedBlockIndex(prev => prev + 1);
        }
      } else {
        // Natural animation completion - show Continue button
        setCurrentAnimationComplete(true);
      }
    }

    // Prompt blocks - when question text animation completes, auto-reveal input
    if (currentBlock?.blockType === 'prompt' && messageId === `prompt-${currentBlock.id}`) {
      setPromptAnimationComplete(true);
    }
  }, [exercise.blocks, displayedBlockIndex]);

  // When displayedBlockIndex changes, immediately mark all PREVIOUS blocks as animated
  // This ensures ink permanence even if user advances before animation completes
  const prevDisplayedBlockIndexRef = useRef(displayedBlockIndex);
  useEffect(() => {
    if (displayedBlockIndex > prevDisplayedBlockIndexRef.current) {
      // Reset animation states for new block
      setCurrentAnimationComplete(false);
      setPromptAnimationComplete(false);

      // Check if the NEW current block is a prompt that's already animated
      const newCurrentBlock = exercise.blocks[displayedBlockIndex - 1];
      if (newCurrentBlock?.blockType === 'prompt') {
        const promptMsgId = `prompt-${newCurrentBlock.id}`;
        if (animatedMessageIdsRef.current.has(promptMsgId)) {
          // Already animated (returning user scrolled back) - show input immediately
          setPromptAnimationComplete(true);
        }
      }

      // Mark all blocks BEFORE the new one as animated (they should be "inked")
      for (let i = 0; i < displayedBlockIndex - 1 && i < exercise.blocks.length; i++) {
        const block = exercise.blocks[i];
        if (block.blockType === 'content') {
          animatedMessageIdsRef.current.add(`block-${block.id}`);
        } else if (block.blockType === 'prompt') {
          animatedMessageIdsRef.current.add(`prompt-${block.id}`);
          // Also mark the response message if it exists
          const promptData = block.content as PromptData;
          if (promptData.id !== undefined && promptResponseMap.has(promptData.id)) {
            animatedMessageIdsRef.current.add(`response-${block.id}`);
          }
        }
      }
    }
    prevDisplayedBlockIndexRef.current = displayedBlockIndex;
  }, [displayedBlockIndex, exercise.blocks, promptResponseMap]);

  // Build messages array from current exercise blocks and responses - with stable IDs
  // IMP-003: Use cached content per block to reduce object allocations
  const currentExerciseMessages = useMemo(() => {
    const result: Message[] = [];
    const cache = blockContentCache.current;

    for (let i = 0; i < displayedBlockIndex && i < exercise.blocks.length; i++) {
      const block = exercise.blocks[i];

      if (block.blockType === 'content') {
        // Use cached content or compute and cache it
        let content = cache.get(block.id);
        if (!content) {
          content = blockToConversationContent(block);
          cache.set(block.id, content);
        }
        result.push({
          id: `block-${block.id}`,
          type: 'content',
          data: content,
          timestamp: new Date(),
        });
      } else if (block.blockType === 'prompt') {
        // Show the prompt text as content (cache prompt text content too)
        const promptData = block.content as PromptData;
        const promptCacheKey = block.id + 10000000; // Offset to avoid collision with content blocks
        let promptContent = cache.get(promptCacheKey);
        if (!promptContent) {
          promptContent = [{ type: 'paragraph' as const, text: promptData.promptText || 'Please respond:' }];
          cache.set(promptCacheKey, promptContent);
        }
        result.push({
          id: `prompt-${block.id}`,
          type: 'content',
          data: promptContent,
          timestamp: new Date(),
        });

        // Check if user has responded to this prompt
        const promptId = promptData.id;
        if (promptId !== undefined) {
          const savedResponse = promptResponseMap.get(promptId);
          if (savedResponse) {
            result.push({
              id: `response-${block.id}`,
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

    return result;
  }, [displayedBlockIndex, exercise.blocks, promptResponseMap, toolResponseMap]);

  // Combine history messages (past exercises) + current exercise messages
  const messages = useMemo(() => {
    return [...historyMessages, ...currentExerciseMessages];
  }, [historyMessages, currentExerciseMessages]);

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

  // Scroll tracking for input zone collapse
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const viewportHeight = window.innerHeight;
      // Collapse input zone after scrolling more than one viewport height
      setInputZoneCollapsed(scrollTop > viewportHeight);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Expand input zone (called from collapsed state)
  const handleExpandInputZone = useCallback(() => {
    setInputZoneCollapsed(false);
    // Scroll to bottom to show the input in context
    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, []);

  // Global Enter key handler for continue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Enter when waiting for continue, animation is done, and no input is focused
      if (e.key === 'Enter' && waitingForContinue && currentAnimationComplete) {
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
  }, [waitingForContinue, currentAnimationComplete, handleContinue]);

  // Silent auto-save (doesn't advance to next block)
  const autoSave = useCallback(async (responseText: string) => {
    if (!activePrompt || !responseText.trim()) return;
    if (responseText === lastSavedValueRef.current) return; // No changes

    const promptData = activePrompt.content as PromptData;
    const isEditing = editingPromptId !== null;

    setAutoSaveStatus('saving');
    try {
      const response = await fetch('/api/workbook/response', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: promptData.id,
          exerciseId: exercise.exerciseId,
          activityId: activePrompt.activityId?.toString(),
          responseText,
        }),
      });

      if (response.ok) {
        lastSavedValueRef.current = responseText;
        // Update local state immutably
        if (promptData.id !== undefined) {
          setPromptResponseMap(prev => new Map(prev).set(promptData.id!, responseText));
        }
        setAutoSaveStatus('saved');
        // Clear the "saved" indicator after 2 seconds
        if (savedIndicatorTimerRef.current) {
          clearTimeout(savedIndicatorTimerRef.current);
        }
        savedIndicatorTimerRef.current = setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 2000);
      } else {
        setAutoSaveStatus('error');
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
    }
  }, [activePrompt, editingPromptId, exercise.exerciseId, promptResponseMap]);

  // Debounced auto-save effect for text inputs
  useEffect(() => {
    // Only auto-save for text input types
    if (inputType !== 'text' && inputType !== 'textarea') return;
    if (!inputValue.trim()) return;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer
    autoSaveTimerRef.current = setTimeout(() => {
      autoSave(inputValue);
    }, AUTO_SAVE_DELAY);

    // Cleanup
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [inputValue, inputType, autoSave]);

  // Save a response (handles both new and edited responses)
  const handleSaveResponse = useCallback(async (responseText: string) => {
    if (!activePrompt || isSaving) return;

    // Clear any pending auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    const promptData = activePrompt.content as PromptData;
    const isEditing = editingPromptId !== null;

    // Skip save if content unchanged and already saved
    if (responseText === lastSavedValueRef.current && !isEditing) {
      // Just advance without re-saving
      setInputValue('');
      setActivePrompt(null);
      setEditingPromptId(null);
      setInputType('none');
      lastSavedValueRef.current = '';
      setTimeout(() => {
        setDisplayedBlockIndex(prev => prev + 1);
      }, 300);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/workbook/response', {
        method: isEditing ? 'PUT' : 'POST',
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

      // Update local state immutably
      if (promptData.id !== undefined) {
        setPromptResponseMap(prev => new Map(prev).set(promptData.id!, responseText));
      }

      // Clear input and editing state
      setInputValue('');
      setActivePrompt(null);
      setEditingPromptId(null);
      setInputType('none');
      lastSavedValueRef.current = '';

      // Only advance to next block if this was a new response (not an edit)
      if (!isEditing) {
        setTimeout(() => {
          setDisplayedBlockIndex(prev => prev + 1);
        }, 300);
      }

    } catch (error) {
      console.error('Error saving response:', error);
      // IMP-025: Differentiate error types
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        showToast('Unable to connect. Check your internet connection.', { type: 'error' });
      } else {
        showToast('Failed to save your response. Please try again.', { type: 'error' });
      }
    } finally {
      setIsSaving(false);
    }
  }, [activePrompt, exercise.exerciseId, isSaving, showToast, promptResponseMap, editingPromptId]);

  // Handle tool completion
  const handleToolComplete = useCallback(() => {
    // Update local state immutably to mark tool as completed
    if (activeTool) {
      const toolData = activeTool.content as ToolData;
      if (toolData.id !== undefined) {
        setToolResponseMap(prev => new Map(prev).set(toolData.id!, '[saved]'));
      }
    }
    setActiveTool(null);
    setTimeout(() => {
      setDisplayedBlockIndex(prev => prev + 1);
    }, 300);
  }, [activeTool, toolResponseMap]);

  // Handle editing a past response
  const handleEditMessage = useCallback((messageId: string) => {
    // Message IDs for user responses follow format: "response-{blockId}"
    if (!messageId.startsWith('response-')) return;

    const blockId = messageId.replace('response-', '');
    const block = exercise.blocks.find(b => String(b.id) === blockId);

    if (!block || block.blockType !== 'prompt') return;

    const promptData = block.content as PromptData;
    const promptId = promptData.id;
    if (promptId === undefined) return;

    const currentValue = promptResponseMap.get(promptId) || '';

    // Set up editing state
    setEditingPromptId(promptId);
    setInputValue(currentValue);
    setActivePrompt(block);

    // Set input type based on prompt type
    switch (promptData.inputType) {
      case 'text_input':
        setInputType('text');
        break;
      case 'textarea':
        setInputType('textarea');
        break;
      default:
        setInputType('none'); // Structured inputs handled by PromptInput
    }
  }, [exercise.blocks, promptResponseMap]);

  // Handle navigation
  const handleNavigate = (id: string) => {
    if (id === 'home') {
      router.push('/');
    } else if (id === 'contents') {
      setTocOpen(true);
    } else if (id === 'tools') {
      router.push('/tools');
    } else if (id === 'profile') {
      router.push('/profile');
    }
  };

  // Handle TOC navigation
  const handleTocNavigate = (location: TOCLocation) => {
    if (location.exerciseId) {
      router.push(`/workbook/${location.exerciseId}`);
      setTocOpen(false);
    }
  };

  // Build minimal TOC progress for current exercise
  const tocProgress: WorkbookProgress = useMemo(() => ({
    parts: [
      {
        id: exercise.part.toString(),
        title: `Part ${exercise.part}: ${exercise.part === 1 ? 'Roots' : exercise.part === 2 ? 'Trunk' : 'Branches'}`,
        status: 'in-progress',
        percentComplete: 0,
        modules: [
          {
            id: `${exercise.part}.${exercise.module}`,
            title: `Module ${exercise.module}`,
            status: 'in-progress',
            exercises: [
              {
                id: exercise.exerciseId,
                title: exercise.title,
                status: 'in-progress',
              },
            ],
          },
        ],
      },
    ],
  }), [exercise]);

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

  // Determine what's active for input zone
  const hasTextInput = (inputType === 'text' || inputType === 'textarea') && promptAnimationComplete;
  const hasStructuredInput = !!(activePrompt && inputType === 'none' && promptAnimationComplete);
  const hasToolInput = !!activeTool;
  const hasContinue = !!(
    (waitingForContinue && currentAnimationComplete) ||
    (isExerciseComplete && exercise.nextExerciseId)
  );
  const hasActiveInput = hasTextInput || hasStructuredInput || hasToolInput || hasContinue;

  // Get collapsed label based on current input type
  const getCollapsedLabel = () => {
    if (hasTextInput) return 'Tap to respond';
    if (hasStructuredInput) return 'Tap to respond';
    if (hasToolInput) return 'Tap to use tool';
    if (hasContinue) return 'Tap to continue';
    return 'Tap to continue';
  };

  // Handle click-anywhere-to-continue (works on both mobile and desktop)
  const handleContentAreaClick = useCallback(
    (e: React.MouseEvent) => {
      // Only when waiting for continue and animation is complete
      if (!waitingForContinue || !currentAnimationComplete) return;

      // Don't trigger if clicking on interactive elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('a')
      ) {
        return;
      }

      handleContinue();
    },
    [waitingForContinue, currentAnimationComplete, handleContinue]
  );

  return (
    <AppShell
      currentLocation={breadcrumbLocation}
      showBreadcrumb={true}
      showInput={false}
      activeNavItem="home"
      hideContents={true}
      onNavigate={handleNavigate}
    >
      <div
        className="workbook-view"
        ref={scrollContainerRef}
        onClick={handleContentAreaClick}
        data-tap-to-continue={waitingForContinue && currentAnimationComplete ? 'true' : 'false'}
      >
        {/* Single conversation thread: history + current exercise */}
        {/* Note: Exercise title comes from content blocks (type='heading'), not a separate divider */}
        <ConversationThread
          messages={messages}
          autoScrollOnNew={true}
          onEditMessage={handleEditMessage}
          animatedMessageIds={animatedMessageIdsRef.current}
          onMessageAnimated={handleMessageAnimated}
          onLoadMore={loadMoreHistory}
          hasMoreHistory={hasMoreHistory}
          isLoadingHistory={isLoadingMoreHistory}
          scrollTrigger={displayedBlockIndex}
        />
      </div>

      {/* Unified input zone - fixed at bottom */}
      <WorkbookInputZone
        collapsed={inputZoneCollapsed}
        onExpand={handleExpandInputZone}
        hasActiveInput={hasActiveInput}
        collapsedLabel={getCollapsedLabel()}
      >
        {/* Auto-save indicator for text inputs */}
        {hasTextInput && autoSaveStatus !== 'idle' && (
          <div className="workbook-autosave">
            <SaveIndicator status={autoSaveStatus} />
          </div>
        )}

        {/* Text input */}
        {hasTextInput && (
          <div className="workbook-input-zone-text">
            {inputType === 'textarea' ? (
              <TextArea
                value={inputValue}
                onChange={setInputValue}
                placeholder={
                  activePrompt
                    ? (activePrompt.content as PromptData).inputConfig?.placeholder || 'Type your response...'
                    : 'Type here...'
                }
                minRows={3}
              />
            ) : (
              <TextInput
                value={inputValue}
                onChange={setInputValue}
                onSubmit={() => handleSaveResponse(inputValue)}
                placeholder={
                  activePrompt
                    ? (activePrompt.content as PromptData).inputConfig?.placeholder || 'Type your response...'
                    : 'Type here...'
                }
              />
            )}
            <button
              className="button button-primary"
              onClick={() => handleSaveResponse(inputValue)}
              disabled={isSaving || !inputValue.trim()}
              aria-label="Send"
            >
              <SendIcon />
            </button>
          </div>
        )}

        {/* Structured prompt input (non-text types) */}
        {hasStructuredInput && (
          <PromptInput
            prompt={activePrompt!.content as PromptData}
            onSubmit={handleSaveResponse}
            disabled={isSaving}
          />
        )}

        {/* Tool embed */}
        {hasToolInput && (
          <ToolEmbed
            tool={activeTool!.content as ToolData}
            exerciseId={exercise.exerciseId}
            connectionId={activeTool!.connectionId}
            onComplete={handleToolComplete}
          />
        )}

        {/* Continue button for content blocks */}
        {waitingForContinue && currentAnimationComplete && (
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
      </WorkbookInputZone>

      {/* Table of Contents panel */}
      <TOCPanel
        open={tocOpen}
        onClose={() => setTocOpen(false)}
        currentLocation={{
          partId: breadcrumbLocation.partId,
          partTitle: breadcrumbLocation.partTitle,
          moduleId: breadcrumbLocation.moduleId,
          moduleTitle: breadcrumbLocation.moduleTitle,
          exerciseId: breadcrumbLocation.exerciseId,
          exerciseTitle: breadcrumbLocation.exerciseTitle,
        }}
        progress={tocProgress}
        onNavigate={handleTocNavigate}
      />
    </AppShell>
  );
}
