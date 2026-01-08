'use client';

import { useId } from 'react';
import { UserResponseContent, SOAREDStory } from './types';

interface MessageUserProps {
  content: UserResponseContent;
  timestamp?: Date;
  id?: string;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function UserContentRenderer({ content }: { content: UserResponseContent }) {
  switch (content.type) {
    case 'text':
      return <p>{content.value}</p>;

    case 'list':
      return (
        <ul>
          {content.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );

    case 'ranked-list':
      return (
        <ol>
          {content.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );

    case 'slider':
      return (
        <p>
          {content.value} — between {content.minLabel} and {content.maxLabel}
        </p>
      );

    case 'tags':
      return <p>{content.selected.join(', ')}</p>;

    case 'soared-story':
      return <SOAREDRenderer story={content.story} />;

    default:
      return null;
  }
}

function SOAREDRenderer({ story }: { story: SOAREDStory }) {
  const sections = [
    { label: 'Situation', value: story.situation },
    { label: 'Obstacle', value: story.obstacle },
    { label: 'Action', value: story.action },
    { label: 'Result', value: story.result },
    { label: 'Evaluation', value: story.evaluation },
    { label: 'Discovery', value: story.discovery },
  ];

  return (
    <div className="soared-story">
      {sections.map(({ label, value }) => (
        <div key={label} className="soared-section">
          <strong>{label}:</strong> {value}
        </div>
      ))}
    </div>
  );
}

export function MessageUser({ content, timestamp, id }: MessageUserProps) {
  const generatedId = useId();
  const messageId = id || generatedId;

  return (
    <div
      className="message-user"
      id={messageId}
      role="article"
      aria-label="Your response"
    >
      <div className="message-user-bubble">
        <UserContentRenderer content={content} />
      </div>
      {timestamp && (
        <time className="message-user-time" dateTime={timestamp.toISOString()}>
          {formatTime(timestamp)}
        </time>
      )}
    </div>
  );
}
