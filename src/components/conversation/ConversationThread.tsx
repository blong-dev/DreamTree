'use client';

import { useRef, useState, useEffect, memo } from 'react';
import { Message, ContentBlock, UserResponseContent, DividerData, ScrollState } from './types';
import { MessageContent } from './MessageContent';
import { MessageUser } from './MessageUser';
import { Timestamp } from './Timestamp';
import { Divider } from './Divider';

interface ConversationThreadProps {
  messages: Message[];
  onScrollStateChange?: (state: ScrollState) => void;
  autoScrollOnNew?: boolean;
  onEditMessage?: (messageId: string) => void;
  /** Set of message IDs that have already been animated (should not re-animate) */
  animatedMessageIds?: Set<string>;
  /** Callback when a message animation completes. wasSkipped is true if user clicked to skip. */
  onMessageAnimated?: (messageId: string, wasSkipped: boolean) => void;
  /** Trigger value that forces scroll to bottom when changed (e.g., displayedBlockIndex) */
  scrollTrigger?: number;
}

// IMP-006: Memoize MessageRenderer to prevent re-renders when messages array changes
const MessageRenderer = memo(function MessageRenderer({
  message,
  onEdit,
  animate,
  onAnimationComplete,
}: {
  message: Message;
  onEdit?: () => void;
  animate?: boolean;
  onAnimationComplete?: (wasSkipped: boolean) => void;
}) {
  switch (message.type) {
    case 'content':
      return (
        <MessageContent
          content={message.data as ContentBlock[]}
          animate={animate}
          onAnimationComplete={onAnimationComplete}
          id={message.id}
        />
      );
    case 'user':
      return (
        <MessageUser
          content={message.data as UserResponseContent}
          timestamp={message.timestamp}
          onEdit={onEdit}
        />
      );
    case 'timestamp':
      return <Timestamp date={message.data as Date} />;
    case 'divider':
      const dividerData = message.data as DividerData;
      return <Divider type={dividerData.type} label={dividerData.label} />;
    default:
      return null;
  }
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if key props change
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.type === nextProps.message.type &&
    prevProps.animate === nextProps.animate &&
    // For user messages, check if onEdit callback exists (not the reference)
    !!prevProps.onEdit === !!nextProps.onEdit
  );
});

export function ConversationThread({
  messages,
  onScrollStateChange,
  autoScrollOnNew = true,
  onEditMessage,
  animatedMessageIds,
  onMessageAnimated,
  scrollTrigger,
}: ConversationThreadProps) {
  const threadRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<ScrollState>('at-current');

  const handleScroll = () => {
    if (!threadRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = threadRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    const newState: ScrollState =
      distanceFromBottom < 100 ? 'at-current' : 'in-history';

    if (newState !== scrollState) {
      setScrollState(newState);
      onScrollStateChange?.(newState);
    }
  };

  // Auto-scroll on new message or when scrollTrigger changes
  useEffect(() => {
    if (autoScrollOnNew && scrollState === 'at-current' && threadRef.current) {
      threadRef.current.scrollTo({
        top: threadRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages.length, autoScrollOnNew, scrollState, scrollTrigger]);

  return (
    <div
      className="conversation-thread"
      role="log"
      aria-live="polite"
      aria-label="Conversation"
      ref={threadRef}
      onScroll={handleScroll}
      data-testid="conversation-thread"
    >
      {messages.map((message) => {
        // Only animate content messages that haven't been animated yet
        const shouldAnimate = message.type === 'content' &&
          (!animatedMessageIds || !animatedMessageIds.has(message.id));

        return (
          <MessageRenderer
            key={message.id}
            message={message}
            animate={shouldAnimate}
            onAnimationComplete={
              shouldAnimate && onMessageAnimated
                ? (wasSkipped: boolean) => onMessageAnimated(message.id, wasSkipped)
                : undefined
            }
            onEdit={
              message.type === 'user' && onEditMessage
                ? () => onEditMessage(message.id)
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
