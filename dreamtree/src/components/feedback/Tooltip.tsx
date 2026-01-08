'use client';

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  ReactNode,
  useId,
} from 'react';
import type { TooltipPosition } from './types';

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  const showTooltip = useCallback(() => {
    if (disabled) return;
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [delay, disabled]);

  const hideTooltip = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
  }, []);

  const handleFocus = useCallback(() => {
    if (disabled) return;
    setIsVisible(true);
  }, [disabled]);

  // Check position and flip if needed
  useEffect(() => {
    if (!isVisible || !wrapperRef.current) return;

    const wrapper = wrapperRef.current;
    const rect = wrapper.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newPosition = position;

    // Check if tooltip would be off-screen
    if (position === 'top' && rect.top < 50) {
      newPosition = 'bottom';
    } else if (position === 'bottom' && rect.bottom > viewportHeight - 50) {
      newPosition = 'top';
    } else if (position === 'left' && rect.left < 50) {
      newPosition = 'right';
    } else if (position === 'right' && rect.right > viewportWidth - 50) {
      newPosition = 'left';
    }

    setActualPosition(newPosition);
  }, [isVisible, position]);

  // Handle escape key and scroll
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hideTooltip();
      }
    };

    const handleScroll = () => {
      hideTooltip();
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isVisible, hideTooltip]);

  return (
    <div className="tooltip-wrapper" ref={wrapperRef}>
      <div
        className="tooltip-trigger"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={handleFocus}
        onBlur={hideTooltip}
        aria-describedby={isVisible ? tooltipId : undefined}
      >
        {children}
      </div>

      {isVisible && (
        <div
          id={tooltipId}
          className="tooltip"
          data-position={actualPosition}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}
