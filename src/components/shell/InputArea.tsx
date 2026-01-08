'use client';

import { useState, KeyboardEvent } from 'react';
import { InputType } from './types';
import { ChevronDownIcon, SendIcon } from '../icons';

interface InputAreaProps {
  type?: InputType;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  collapsed?: boolean;
  onExpand?: () => void;
  disabled?: boolean;
}

export function InputArea({
  type = 'text',
  value = '',
  onChange,
  onSubmit,
  placeholder = 'Type here...',
  collapsed = false,
  onExpand,
  disabled = false,
}: InputAreaProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleSubmit = () => {
    if (localValue.trim() && !disabled) {
      onSubmit?.(localValue);
      setLocalValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && type === 'text') {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (type === 'none') {
    return null;
  }

  return (
    <div
      className="input-area"
      data-type={type}
      data-collapsed={collapsed}
    >
      <div className="input-area-inner">
        {collapsed ? (
          <button className="input-area-return" onClick={onExpand}>
            <ChevronDownIcon aria-hidden="true" />
            <span>Return to current</span>
          </button>
        ) : (
          <div className="input-area-active">
            {type === 'text' && (
              <input
                type="text"
                className="text-input"
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
              />
            )}
            {type === 'textarea' && (
              <textarea
                className="textarea"
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                rows={3}
              />
            )}
            <button
              className="button button-primary button-icon"
              onClick={handleSubmit}
              disabled={disabled || !localValue.trim()}
              aria-label="Send"
            >
              <SendIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
