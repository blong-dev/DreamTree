'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PromptData } from './types';
import { Slider, Checkbox, CheckboxGroup, RadioGroup, Select } from '../forms';

interface PromptInputProps {
  prompt: PromptData;
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export function PromptInput({ prompt, onSubmit, disabled = false }: PromptInputProps) { // code_id:11
  const [sliderValue, setSliderValue] = useState(
    prompt.inputConfig?.min !== undefined
      ? Math.floor((prompt.inputConfig.min + (prompt.inputConfig.max || 10)) / 2)
      : 5
  );
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [checkboxGroupValue, setCheckboxGroupValue] = useState<string[]>([]);
  const [radioValue, setRadioValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  const handleSubmit = useCallback(() => {
    let value: string;

    switch (prompt.inputType) {
      case 'slider':
        value = sliderValue.toString();
        break;
      case 'checkbox':
        value = checkboxValue ? 'yes' : 'no';
        break;
      case 'checkbox_group':
        value = checkboxGroupValue.join(', ');
        break;
      case 'radio':
        value = radioValue;
        break;
      case 'select':
        value = selectValue;
        break;
      default:
        return;
    }

    if (value) {
      onSubmit(value);
    }
  }, [prompt.inputType, sliderValue, checkboxValue, checkboxGroupValue, radioValue, selectValue, onSubmit]);

  const renderInput = () => { // code_id:365
    const config = prompt.inputConfig || {};

    switch (prompt.inputType) {
      case 'slider':
        return (
          <div className="prompt-input-slider">
            <Slider
              value={sliderValue}
              min={config.min || 1}
              max={config.max || 10}
              minLabel={config.minLabel || 'Low'}
              maxLabel={config.maxLabel || 'High'}
              onChange={setSliderValue}
              disabled={disabled}
              id={`prompt-${prompt.id}`}
            />
          </div>
        );

      case 'checkbox':
        return (
          <div className="prompt-input-checkbox">
            <Checkbox
              id={`prompt-${prompt.id}`}
              label="Yes"
              checked={checkboxValue}
              onChange={setCheckboxValue}
              disabled={disabled}
            />
          </div>
        );

      case 'checkbox_group': {
        // Transform options to include required id field
        const checkboxOptions = (config.options || []).map((opt, idx) => ({
          id: `${prompt.id}-opt-${idx}`,
          value: opt.value,
          label: opt.label,
        }));
        return (
          <CheckboxGroup
            id={`prompt-${prompt.id}`}
            options={checkboxOptions}
            selected={checkboxGroupValue}
            onChange={setCheckboxGroupValue}
            disabled={disabled}
          />
        );
      }

      case 'radio': {
        // Transform options to include required id field
        const radioOptions = (config.options || []).map((opt, idx) => ({
          id: `${prompt.id}-opt-${idx}`,
          value: opt.value,
          label: opt.label,
        }));
        return (
          <RadioGroup
            id={`prompt-${prompt.id}`}
            options={radioOptions}
            value={radioValue}
            onChange={setRadioValue}
            disabled={disabled}
          />
        );
      }

      case 'select': {
        // Transform options to include required id field
        const selectOptions = (config.options || []).map((opt, idx) => ({
          id: `${prompt.id}-opt-${idx}`,
          value: opt.value,
          label: opt.label,
        }));
        return (
          <Select
            id={`prompt-${prompt.id}`}
            options={selectOptions}
            value={selectValue}
            onChange={setSelectValue}
            disabled={disabled}
            placeholder="Select an option..."
          />
        );
      }

      default:
        return null;
    }
  };

  const isValid = useCallback(() => {
    switch (prompt.inputType) {
      case 'slider':
        return true; // Slider always has a value
      case 'checkbox':
        return true; // Can submit either checked or unchecked
      case 'checkbox_group':
        return checkboxGroupValue.length > 0;
      case 'radio':
        return radioValue !== '';
      case 'select':
        return selectValue !== '';
      default:
        return false;
    }
  }, [prompt.inputType, checkboxGroupValue.length, radioValue, selectValue]);

  // Enter key to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { // code_id:366
      if (e.key === 'Enter' && !disabled && isValid()) {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, isValid, handleSubmit]);

  return (
    <div className="prompt-input">
      <div className="prompt-input-content">
        {renderInput()}
      </div>
      <div className="prompt-input-actions">
        <button
          className="button button-primary"
          onClick={handleSubmit}
          disabled={disabled || !isValid()}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
