'use client';

/**
 * WorkbookView - Single Page Architecture
 *
 * Renders the entire workbook as one scrollable page.
 * Blocks 1..N+1 are fetched on load (completed + current).
 * When user responds, next block is fetched and appended.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

const AUTO_SAVE_DELAY = 1500;

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
import type { SaveStatus } from '../feedback/types';
import type { BlockWithResponse, PromptData, ToolData, ThemeSettings } from './types';
import type { Message, ContentBlock, UserResponseContent } from '../conversation/types';
import type { BreadcrumbLocation, InputType } from '../shell/types';

interface WorkbookViewProps {
  initialBlocks: BlockWithResponse[];
  initialProgress: number;
  theme?: ThemeSettings;
}

// Convert block content to conversation content
function blockToConversationContent(block: BlockWithResponse): ContentBlock[] { // code_id:3
  const text = block.content.text || '';
  const type = block.content.type || 'paragraph';

  switch (type) {
    case 'heading':
      return [{ type: 'heading', level: 2, text }];
    case 'instruction':
    case 'transition':
      return [{ type: 'paragraph', text }];
    case 'note':
      return [{ type: 'emphasis', text }];
    case 'quote':
      return [{ type: 'quote', text }];
    case 'celebration':
      return [{ type: 'activity-header', title: text }];
    default:
      return [{ type: 'paragraph', text }];
  }
}

export function WorkbookView({ initialBlocks, initialProgress, theme }: WorkbookViewProps) { // code_id:2
  const { showToast } = useToast();

  // Apply user's theme on mount
  useApplyTheme({
    backgroundColor: theme?.backgroundColor,
    textColor: theme?.textColor,
    font: theme?.font,
  });

  // Core state: blocks array and progress
  const [blocks, setBlocks] = useState<BlockWithResponse[]>(initialBlocks);
  const [, setProgress] = useState(initialProgress);
  const [hasMore, setHasMore] = useState(initialBlocks.length > 0);

  // Track which block we're displaying (one-at-a-time progression)
  const [displayedBlockIndex, setDisplayedBlockIndex] = useState(() => {
    // Find first unanswered prompt/tool, or show all if all answered
    const firstUnanswered = initialBlocks.findIndex(
      (b) => (b.blockType === 'prompt' || b.blockType === 'tool') && !b.response
    );
    if (firstUnanswered === -1) {
      return initialBlocks.length;
    }
    return firstUnanswered + 1;
  });

  // UI state
  const [inputValue, setInputValue] = useState('');
  const [inputType, setInputType] = useState<InputType>('none');
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<SaveStatus>('idle');
  const [waitingForContinue, setWaitingForContinue] = useState(false);
  const [currentAnimationComplete, setCurrentAnimationComplete] = useState(false);
  const [promptAnimationComplete, setPromptAnimationComplete] = useState(false);
  const [inputZoneCollapsed, setInputZoneCollapsed] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);

  // Edit state
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const savedIndicatorTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedValueRef = useRef<string>('');
  const blockContentCache = useRef<Map<number, ContentBlock[]>>(new Map());
  const animatedMessageIdsRef = useRef<Set<string>>(new Set());

  // Initialize animated message IDs for returning users
  const isInitializedRef = useRef(false);
  if (!isInitializedRef.current && initialProgress > 0) {
    isInitializedRef.current = true;
    // Mark all blocks up to displayed index as already animated
    for (let i = 0; i < displayedBlockIndex && i < initialBlocks.length; i++) {
      const block = initialBlocks[i];
      animatedMessageIdsRef.current.add(`block-${block.id}`);
      if (block.blockType === 'prompt') {
        animatedMessageIdsRef.current.add(`prompt-${block.id}`);
        if (block.response) {
          animatedMessageIdsRef.current.add(`response-${block.id}`);
        }
      }
    }
  } else if (!isInitializedRef.current) {
    isInitializedRef.current = true;
  }

  // Current active block for input
  const currentBlock = blocks[displayedBlockIndex - 1];
  const isPromptBlock = currentBlock?.blockType === 'prompt';
  const isToolBlock = currentBlock?.blockType === 'tool';
  const hasResponse = !!currentBlock?.response;

  // Build messages array from blocks
  const messages = useMemo(() => {
    const result: Message[] = [];
    const cache = blockContentCache.current;

    for (let i = 0; i < displayedBlockIndex && i < blocks.length; i++) {
      const block = blocks[i];

      if (block.blockType === 'content') {
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
        // Show prompt question
        const promptCacheKey = block.id + 10000000;
        let promptContent = cache.get(promptCacheKey);
        if (!promptContent) {
          promptContent = [
            { type: 'paragraph' as const, text: block.content.promptText || 'Please respond:' },
          ];
          cache.set(promptCacheKey, promptContent);
        }
        result.push({
          id: `prompt-${block.id}`,
          type: 'content',
          data: promptContent,
          timestamp: new Date(),
        });

        // Show user's response if available
        if (block.response) {
          result.push({
            id: `response-${block.id}`,
            type: 'user',
            data: { type: 'text', value: block.response } as UserResponseContent,
            timestamp: new Date(),
          });
        }
      }
      // Tools are rendered inline via ToolEmbed, not in messages
    }

    return result;
  }, [blocks, displayedBlockIndex]);

  // Determine input type based on current block
  useEffect(() => {
    if (!currentBlock) {
      setInputType('none');
      setWaitingForContinue(false);
      return;
    }

    if (currentBlock.blockType === 'content') {
      setInputType('none');
      setWaitingForContinue(true);
    } else if (currentBlock.blockType === 'prompt' && !currentBlock.response) {
      setWaitingForContinue(false);
      const inputTypeStr = currentBlock.content.inputType;
      if (inputTypeStr === 'text_input') {
        setInputType('text');
      } else if (inputTypeStr === 'textarea') {
        setInputType('textarea');
      } else {
        setInputType('none'); // Structured inputs handled by PromptInput
      }
    } else if (currentBlock.blockType === 'tool' && !currentBlock.response) {
      setInputType('none');
      setWaitingForContinue(false);
    } else {
      // Block already answered, advance
      if (displayedBlockIndex < blocks.length) {
        setDisplayedBlockIndex((prev) => prev + 1);
      }
    }
  }, [currentBlock, displayedBlockIndex, blocks.length]);

  // Handle animation completion
  const handleMessageAnimated = useCallback(
    (messageId: string, wasSkipped: boolean) => {
      animatedMessageIdsRef.current.add(messageId);

      if (currentBlock?.blockType === 'content' && messageId === `block-${currentBlock.id}`) {
        if (wasSkipped) {
          setWaitingForContinue(false);
          if (displayedBlockIndex < blocks.length) {
            setDisplayedBlockIndex((prev) => prev + 1);
          }
        } else {
          setCurrentAnimationComplete(true);
        }
      }

      if (currentBlock?.blockType === 'prompt' && messageId === `prompt-${currentBlock.id}`) {
        setPromptAnimationComplete(true);
      }
    },
    [currentBlock, displayedBlockIndex, blocks.length]
  );

  // Reset animation states when block changes
  useEffect(() => {
    setCurrentAnimationComplete(false);
    setPromptAnimationComplete(false);

    // Check if new block is already animated (returning user)
    if (currentBlock?.blockType === 'prompt') {
      const promptMsgId = `prompt-${currentBlock.id}`;
      if (animatedMessageIdsRef.current.has(promptMsgId)) {
        setPromptAnimationComplete(true);
      }
    }
  }, [displayedBlockIndex, currentBlock]);

  // Handle continue button
  const handleContinue = useCallback(() => {
    setWaitingForContinue(false);
    if (displayedBlockIndex < blocks.length) {
      setDisplayedBlockIndex((prev) => prev + 1);
    }
  }, [displayedBlockIndex, blocks.length]);

  // Auto-save for text inputs
  const autoSave = useCallback(
    async (responseText: string) => {
      if (!currentBlock || !responseText.trim()) return;
      if (responseText === lastSavedValueRef.current) return;
      if (currentBlock.blockType !== 'prompt') return;

      setAutoSaveStatus('saving');
      try {
        const response = await fetch('/api/workbook/response', {
          method: editingBlockId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promptId: currentBlock.content.id,
            exerciseId: currentBlock.exerciseId,
            activityId: currentBlock.activityId?.toString(),
            responseText,
          }),
        });

        if (response.ok) {
          lastSavedValueRef.current = responseText;
          // Update block in state
          setBlocks((prev) =>
            prev.map((b) => (b.id === currentBlock.id ? { ...b, response: responseText } : b))
          );
          setAutoSaveStatus('saved');
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
    },
    [currentBlock, editingBlockId]
  );

  // Debounced auto-save effect
  useEffect(() => {
    if (inputType !== 'text' && inputType !== 'textarea') return;
    if (!inputValue.trim()) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      autoSave(inputValue);
    }, AUTO_SAVE_DELAY);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [inputValue, inputType, autoSave]);

  // Save response and get next block
  const handleSaveResponse = useCallback(
    async (responseText: string) => {
      if (!currentBlock || isSaving) return;
      if (currentBlock.blockType !== 'prompt') return;

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }

      // Skip if unchanged and already saved
      if (responseText === lastSavedValueRef.current && !editingBlockId) {
        setInputValue('');
        setEditingBlockId(null);
        setInputType('none');
        lastSavedValueRef.current = '';
        setTimeout(() => {
          setDisplayedBlockIndex((prev) => prev + 1);
        }, 300);
        return;
      }

      setIsSaving(true);
      try {
        const response = await fetch('/api/workbook/response', {
          method: editingBlockId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promptId: currentBlock.content.id,
            exerciseId: currentBlock.exerciseId,
            activityId: currentBlock.activityId?.toString(),
            responseText,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save response');
        }

        const data = await response.json();

        // Update current block with response
        setBlocks((prev) =>
          prev.map((b) => (b.id === currentBlock.id ? { ...b, response: responseText } : b))
        );

        // Append next block if available
        if (data.nextBlock) {
          setBlocks((prev) => [...prev, data.nextBlock]);
        }

        // Update progress
        if (data.newProgress !== undefined) {
          setProgress(data.newProgress);
        }
        if (data.hasMore !== undefined) {
          setHasMore(data.hasMore);
        }

        // Clear input state
        setInputValue('');
        setEditingBlockId(null);
        setInputType('none');
        lastSavedValueRef.current = '';

        // Advance to next block (unless editing)
        if (!editingBlockId) {
          setTimeout(() => {
            setDisplayedBlockIndex((prev) => prev + 1);
          }, 300);
        }
      } catch (error) {
        console.error('Error saving response:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
          showToast('Unable to connect. Check your internet connection.', { type: 'error' });
        } else {
          showToast('Failed to save your response. Please try again.', { type: 'error' });
        }
      } finally {
        setIsSaving(false);
      }
    },
    [currentBlock, isSaving, editingBlockId, showToast]
  );

  // Handle tool completion - receives data from useToolSave
  const handleToolComplete = useCallback(
    (data: { id: string; updated: boolean; newProgress: number; nextBlock: unknown | null; hasMore: boolean }) => {
      if (!currentBlock || currentBlock.blockType !== 'tool') return;

      // Mark tool as completed
      setBlocks((prev) =>
        prev.map((b) => (b.id === currentBlock.id ? { ...b, response: '[tool-completed]' } : b))
      );

      // Append next block if available
      if (data.nextBlock) {
        setBlocks((prev) => [...prev, data.nextBlock as BlockWithResponse]);
      }

      setProgress(data.newProgress);
      setHasMore(data.hasMore);

      setTimeout(() => {
        setDisplayedBlockIndex((prev) => prev + 1);
      }, 300);
    },
    [currentBlock]
  );

  // Handle editing a past response
  const handleEditMessage = useCallback(
    (messageId: string) => {
      if (!messageId.startsWith('response-')) return;

      const blockId = parseInt(messageId.replace('response-', ''), 10);
      const block = blocks.find((b) => b.id === blockId);

      if (!block || block.blockType !== 'prompt') return;

      setEditingBlockId(blockId);
      setInputValue(block.response || '');

      const inputTypeStr = block.content.inputType;
      if (inputTypeStr === 'text_input') {
        setInputType('text');
      } else if (inputTypeStr === 'textarea') {
        setInputType('textarea');
      } else {
        setInputType('none');
      }
    },
    [blocks]
  );

  // Scroll tracking for input zone collapse
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => { // code_id:386
      const scrollTop = container.scrollTop;
      const viewportHeight = window.innerHeight;
      setInputZoneCollapsed(scrollTop > viewportHeight);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleExpandInputZone = useCallback(() => {
    setInputZoneCollapsed(false);
    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, []);

  // Global Enter key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { // code_id:387
      if (e.key === 'Enter' && waitingForContinue && currentAnimationComplete) {
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement?.tagName === 'INPUT' ||
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

  // Click-to-continue handler
  const handleContentAreaClick = useCallback(
    (e: React.MouseEvent) => {
      if (!waitingForContinue || !currentAnimationComplete) return;

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

  // Build breadcrumb from current block's exercise
  const currentExerciseId = currentBlock?.exerciseId || blocks[0]?.exerciseId || '1.1.1';
  const [partStr, moduleStr] = currentExerciseId.split('.');
  const part = parseInt(partStr, 10) || 1;
  const moduleNum = parseInt(moduleStr, 10) || 1;

  const breadcrumbLocation: BreadcrumbLocation = {
    partId: partStr,
    partTitle: `Part ${part}`,
    moduleId: `${part}.${moduleNum}`,
    moduleTitle: `Module ${moduleNum}`,
    exerciseId: currentExerciseId,
    exerciseTitle: `Exercise ${currentExerciseId}`,
  };

  // TOC progress (minimal)
  const tocProgress: WorkbookProgress = useMemo(
    () => ({
      parts: [
        {
          id: partStr,
          title: `Part ${part}: ${part === 1 ? 'Roots' : part === 2 ? 'Trunk' : 'Branches'}`,
          status: 'in-progress',
          percentComplete: 0,
          modules: [
            {
              id: `${part}.${moduleNum}`,
              title: `Module ${moduleNum}`,
              status: 'in-progress',
              exercises: [
                {
                  id: currentExerciseId,
                  title: `Exercise ${currentExerciseId}`,
                  status: 'in-progress',
                },
              ],
            },
          ],
        },
      ],
    }),
    [partStr, part, moduleNum, currentExerciseId]
  );

  // Handle navigation
  const handleNavigate = (id: string) => { // code_id:388
    if (id === 'contents') {
      setTocOpen(true);
    }
    // Other navigation handled by Next.js Link in AppShell
  };

  const handleTocNavigate = (location: TOCLocation) => { // code_id:389
    if (location.exerciseId) {
      // Update URL hash for navigation within single page
      window.location.hash = location.exerciseId;
      setTocOpen(false);
    }
  };

  // Determine what's active for input zone
  const isWorkbookComplete = displayedBlockIndex >= blocks.length && !hasMore;
  const hasTextInput =
    (inputType === 'text' || inputType === 'textarea') && promptAnimationComplete && !hasResponse;
  const hasStructuredInput =
    isPromptBlock &&
    inputType === 'none' &&
    promptAnimationComplete &&
    !hasResponse &&
    currentBlock.content.inputType !== 'text_input' &&
    currentBlock.content.inputType !== 'textarea';
  const hasToolInput = isToolBlock && !hasResponse;
  const hasContinue = waitingForContinue && currentAnimationComplete;
  const hasActiveInput = hasTextInput || hasStructuredInput || hasToolInput || hasContinue;

  const getCollapsedLabel = () => { // code_id:390
    if (hasTextInput) return 'Tap to respond';
    if (hasStructuredInput) return 'Tap to respond';
    if (hasToolInput) return 'Tap to use tool';
    if (hasContinue) return 'Tap to continue';
    return 'Tap to continue';
  };

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
        data-tap-to-continue={hasContinue ? 'true' : 'false'}
      >
        <ConversationThread
          messages={messages}
          autoScrollOnNew={true}
          onEditMessage={handleEditMessage}
          animatedMessageIds={animatedMessageIdsRef.current}
          onMessageAnimated={handleMessageAnimated}
          scrollTrigger={displayedBlockIndex}
        />
      </div>

      <WorkbookInputZone
        collapsed={inputZoneCollapsed}
        onExpand={handleExpandInputZone}
        hasActiveInput={hasActiveInput}
        collapsedLabel={getCollapsedLabel()}
      >
        {hasTextInput && autoSaveStatus !== 'idle' && (
          <div className="workbook-autosave">
            <SaveIndicator status={autoSaveStatus} />
          </div>
        )}

        {hasTextInput && (
          <div className="workbook-input-zone-text">
            {inputType === 'textarea' ? (
              <TextArea
                value={inputValue}
                onChange={setInputValue}
                placeholder={currentBlock?.content.inputConfig?.placeholder || 'Type your response...'}
                minRows={3}
              />
            ) : (
              <TextInput
                value={inputValue}
                onChange={setInputValue}
                onSubmit={() => handleSaveResponse(inputValue)}
                placeholder={currentBlock?.content.inputConfig?.placeholder || 'Type your response...'}
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

        {hasStructuredInput && currentBlock && (
          <PromptInput
            prompt={currentBlock.content as PromptData}
            onSubmit={handleSaveResponse}
            disabled={isSaving}
          />
        )}

        {hasToolInput && currentBlock && (
          <ToolEmbed
            tool={currentBlock.content as ToolData}
            exerciseId={currentBlock.exerciseId}
            connectionId={currentBlock.connectionId}
            onComplete={handleToolComplete}
          />
        )}

        {hasContinue && (
          <div className="workbook-continue">
            <button className="button button-primary" onClick={handleContinue}>
              Continue
            </button>
          </div>
        )}

        {isWorkbookComplete && (
          <div className="workbook-complete">
            <p>You have completed all available content.</p>
          </div>
        )}
      </WorkbookInputZone>

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
