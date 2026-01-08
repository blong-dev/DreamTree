'use client';

import { useState, useId } from 'react';
import { ContentBlock } from './types';
import { TypingEffect } from './TypingEffect';

interface MessageContentProps {
  content: ContentBlock[];
  animate?: boolean;
  onAnimationComplete?: () => void;
  id?: string;
}

function ContentBlockRenderer({
  block,
  animate,
  onComplete,
}: {
  block: ContentBlock;
  animate: boolean;
  onComplete?: () => void;
}) {
  const [isSkipped, setIsSkipped] = useState(false);

  const handleClick = () => {
    if (animate && !isSkipped) {
      setIsSkipped(true);
      onComplete?.();
    }
  };

  const renderText = (text: string) => {
    if (animate && !isSkipped) {
      return (
        <TypingEffect
          text={text}
          speed={30}
          onComplete={onComplete}
          skipToEnd={isSkipped}
        />
      );
    }
    return text;
  };

  switch (block.type) {
    case 'paragraph':
      return <p onClick={handleClick}>{renderText(block.text)}</p>;

    case 'heading':
      const HeadingTag = `h${block.level}` as 'h2' | 'h3' | 'h4';
      return (
        <HeadingTag onClick={handleClick}>{renderText(block.text)}</HeadingTag>
      );

    case 'list':
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag onClick={handleClick}>
          {block.items.map((item, i) => (
            <li key={i}>{animate && !isSkipped ? renderText(item) : item}</li>
          ))}
        </ListTag>
      );

    case 'activity-header':
      return (
        <div className="activity-header" onClick={handleClick}>
          <p className="activity-header-title">{renderText(block.title)}</p>
          {block.description && (
            <p className="activity-header-description">
              {animate && !isSkipped
                ? renderText(block.description)
                : block.description}
            </p>
          )}
        </div>
      );

    case 'quote':
      return (
        <blockquote onClick={handleClick}>
          <p>{renderText(block.text)}</p>
          {block.attribution && <cite>— {block.attribution}</cite>}
        </blockquote>
      );

    case 'emphasis':
      return (
        <p className="emphasis" onClick={handleClick}>
          {renderText(block.text)}
        </p>
      );

    case 'resource-link':
      return (
        <a
          href={block.url}
          className="resource-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="resource-link-title">{block.title}</span>
          {block.description && (
            <span className="resource-link-description">{block.description}</span>
          )}
        </a>
      );

    default:
      return null;
  }
}

export function MessageContent({
  content,
  animate = true,
  onAnimationComplete,
  id,
}: MessageContentProps) {
  const generatedId = useId();
  const messageId = id || generatedId;
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);

  const handleBlockComplete = () => {
    if (currentBlockIndex < content.length - 1) {
      setTimeout(() => {
        setCurrentBlockIndex((prev) => prev + 1);
      }, 200); // 200ms pause between blocks
    } else {
      onAnimationComplete?.();
    }
  };

  // Get plain text for screen readers
  const getPlainText = (block: ContentBlock): string => {
    switch (block.type) {
      case 'paragraph':
      case 'heading':
      case 'emphasis':
      case 'quote':
        return block.text;
      case 'list':
        return block.items.join('. ');
      case 'activity-header':
        return `${block.title}. ${block.description || ''}`;
      case 'resource-link':
        return `${block.title}. ${block.description || ''}`;
      default:
        return '';
    }
  };

  return (
    <>
      <div
        className="message-content"
        id={messageId}
        role="article"
        aria-label="dreamtree message"
      >
        {content.slice(0, animate ? currentBlockIndex + 1 : content.length).map((block, index) => (
          <ContentBlockRenderer
            key={index}
            block={block}
            animate={animate && index === currentBlockIndex}
            onComplete={handleBlockComplete}
          />
        ))}
      </div>

      {/* Screen reader accessible version */}
      <div className="sr-only" aria-live="polite">
        {content.map((block) => getPlainText(block)).join(' ')}
      </div>
    </>
  );
}
