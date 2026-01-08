'use client';

import { useRef, useState, useEffect } from 'react';
import { Message, ContentBlock, UserResponseContent, DividerData, ScrollState } from './types';
import { MessageContent } from './MessageContent';
import { MessageUser } from './MessageUser';
import { Timestamp } from './Timestamp';
import { Divider } from './Divider';

interface ConversationThreadProps {
  messages: Message[];
  onScrollStateChange?: (state: ScrollState) => void;
  autoScrollOnNew?: boolean;
}

function MessageRenderer({ message }: { message: Message }) {
  switch (message.type) {
    case 'content':
      return <MessageContent content={message.data as ContentBlock[]} />;
    case 'user':
      return (
        <MessageUser
          content={message.data as UserResponseContent}
          timestamp={message.timestamp}
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
}

export function ConversationThread({
  messages,
  onScrollStateChange,
  autoScrollOnNew = true,
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

  // Auto-scroll on new message
  useEffect(() => {
    if (autoScrollOnNew && scrollState === 'at-current' && threadRef.current) {
      threadRef.current.scrollTo({
        top: threadRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages.length, autoScrollOnNew, scrollState]);

  return (
    <div
      className="conversation-thread"
      role="log"
      aria-live="polite"
      aria-label="Conversation"
      ref={threadRef}
      onScroll={handleScroll}
    >
      {messages.map((message) => (
        <MessageRenderer key={message.id} message={message} />
      ))}
    </div>
  );
}
