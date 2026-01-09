/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptInput } from './PromptInput';
import type { PromptData } from './types';

// Mock form components
vi.mock('../forms', () => ({
  Slider: ({ value, onChange, min, max, minLabel, maxLabel, disabled, id }: any) => (
    <div data-testid="slider">
      <input
        type="range"
        id={id}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        aria-label={`${minLabel} to ${maxLabel}`}
      />
      <span data-testid="slider-value">{value}</span>
    </div>
  ),
  Checkbox: ({ checked, onChange, disabled, label, id }: any) => (
    <label>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      {label}
    </label>
  ),
  CheckboxGroup: ({ options, selected, onChange, disabled }: any) => (
    <div data-testid="checkbox-group">
      {options.map((opt: any) => (
        <label key={opt.id}>
          <input
            type="checkbox"
            checked={selected.includes(opt.value)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...selected, opt.value]);
              } else {
                onChange(selected.filter((v: string) => v !== opt.value));
              }
            }}
            disabled={disabled}
          />
          {opt.label}
        </label>
      ))}
    </div>
  ),
  RadioGroup: ({ options, value, onChange, disabled }: any) => (
    <div data-testid="radio-group">
      {options.map((opt: any) => (
        <label key={opt.id}>
          <input
            type="radio"
            name="radio-group"
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            disabled={disabled}
          />
          {opt.label}
        </label>
      ))}
    </div>
  ),
  Select: ({ options, value, onChange, disabled, placeholder }: any) => (
    <select
      data-testid="select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {options.map((opt: any) => (
        <option key={opt.id} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

describe('PromptInput', () => {
  describe('slider input', () => {
    const sliderPrompt: PromptData = {
      id: 'test-slider',
      text: 'Rate your energy',
      inputType: 'slider',
      inputConfig: { min: 1, max: 10, minLabel: 'Low', maxLabel: 'High' },
    };

    it('renders slider component', () => {
      render(<PromptInput prompt={sliderPrompt} onSubmit={() => {}} />);
      expect(screen.getByTestId('slider')).toBeInTheDocument();
    });

    it('initializes with middle value', () => {
      render(<PromptInput prompt={sliderPrompt} onSubmit={() => {}} />);
      expect(screen.getByTestId('slider-value')).toHaveTextContent('5');
    });

    it('submits slider value as string', () => {
      const onSubmit = vi.fn();
      render(<PromptInput prompt={sliderPrompt} onSubmit={onSubmit} />);

      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
      expect(onSubmit).toHaveBeenCalledWith('5');
    });

    it('slider is always valid (button enabled)', () => {
      render(<PromptInput prompt={sliderPrompt} onSubmit={() => {}} />);
      expect(screen.getByRole('button', { name: 'Continue' })).not.toBeDisabled();
    });
  });

  describe('checkbox input', () => {
    const checkboxPrompt: PromptData = {
      id: 'test-checkbox',
      text: 'Do you agree?',
      inputType: 'checkbox',
    };

    it('renders checkbox component', () => {
      render(<PromptInput prompt={checkboxPrompt} onSubmit={() => {}} />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('submits "no" when unchecked', () => {
      const onSubmit = vi.fn();
      render(<PromptInput prompt={checkboxPrompt} onSubmit={onSubmit} />);

      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
      expect(onSubmit).toHaveBeenCalledWith('no');
    });

    it('submits "yes" when checked', () => {
      const onSubmit = vi.fn();
      render(<PromptInput prompt={checkboxPrompt} onSubmit={onSubmit} />);

      fireEvent.click(screen.getByRole('checkbox'));
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
      expect(onSubmit).toHaveBeenCalledWith('yes');
    });

    it('checkbox is always valid (button enabled)', () => {
      render(<PromptInput prompt={checkboxPrompt} onSubmit={() => {}} />);
      expect(screen.getByRole('button', { name: 'Continue' })).not.toBeDisabled();
    });
  });

  describe('checkbox_group input', () => {
    const checkboxGroupPrompt: PromptData = {
      id: 'test-checkbox-group',
      text: 'Select your interests',
      inputType: 'checkbox_group',
      inputConfig: {
        options: [
          { value: 'coding', label: 'Coding' },
          { value: 'design', label: 'Design' },
          { value: 'writing', label: 'Writing' },
        ],
      },
    };

    it('renders checkbox group', () => {
      render(<PromptInput prompt={checkboxGroupPrompt} onSubmit={() => {}} />);
      expect(screen.getByTestId('checkbox-group')).toBeInTheDocument();
    });

    it('button disabled when nothing selected', () => {
      render(<PromptInput prompt={checkboxGroupPrompt} onSubmit={() => {}} />);
      expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    });

    it('button enabled when at least one selected', () => {
      render(<PromptInput prompt={checkboxGroupPrompt} onSubmit={() => {}} />);

      fireEvent.click(screen.getByLabelText('Coding'));
      expect(screen.getByRole('button', { name: 'Continue' })).not.toBeDisabled();
    });

    it('submits comma-separated values', () => {
      const onSubmit = vi.fn();
      render(<PromptInput prompt={checkboxGroupPrompt} onSubmit={onSubmit} />);

      fireEvent.click(screen.getByLabelText('Coding'));
      fireEvent.click(screen.getByLabelText('Design'));
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

      expect(onSubmit).toHaveBeenCalledWith('coding, design');
    });
  });

  describe('radio input', () => {
    const radioPrompt: PromptData = {
      id: 'test-radio',
      text: 'Choose your preference',
      inputType: 'radio',
      inputConfig: {
        options: [
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ],
      },
    };

    it('renders radio group', () => {
      render(<PromptInput prompt={radioPrompt} onSubmit={() => {}} />);
      expect(screen.getByTestId('radio-group')).toBeInTheDocument();
    });

    it('button disabled when nothing selected', () => {
      render(<PromptInput prompt={radioPrompt} onSubmit={() => {}} />);
      expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    });

    it('button enabled when option selected', () => {
      render(<PromptInput prompt={radioPrompt} onSubmit={() => {}} />);

      fireEvent.click(screen.getByLabelText('Option A'));
      expect(screen.getByRole('button', { name: 'Continue' })).not.toBeDisabled();
    });

    it('submits selected value', () => {
      const onSubmit = vi.fn();
      render(<PromptInput prompt={radioPrompt} onSubmit={onSubmit} />);

      fireEvent.click(screen.getByLabelText('Option B'));
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

      expect(onSubmit).toHaveBeenCalledWith('b');
    });
  });

  describe('select input', () => {
    const selectPrompt: PromptData = {
      id: 'test-select',
      text: 'Choose a category',
      inputType: 'select',
      inputConfig: {
        options: [
          { value: 'tech', label: 'Technology' },
          { value: 'health', label: 'Healthcare' },
        ],
      },
    };

    it('renders select component', () => {
      render(<PromptInput prompt={selectPrompt} onSubmit={() => {}} />);
      expect(screen.getByTestId('select')).toBeInTheDocument();
    });

    it('button disabled when nothing selected', () => {
      render(<PromptInput prompt={selectPrompt} onSubmit={() => {}} />);
      expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    });

    it('button enabled when option selected', () => {
      render(<PromptInput prompt={selectPrompt} onSubmit={() => {}} />);

      fireEvent.change(screen.getByTestId('select'), { target: { value: 'tech' } });
      expect(screen.getByRole('button', { name: 'Continue' })).not.toBeDisabled();
    });

    it('submits selected value', () => {
      const onSubmit = vi.fn();
      render(<PromptInput prompt={selectPrompt} onSubmit={onSubmit} />);

      fireEvent.change(screen.getByTestId('select'), { target: { value: 'health' } });
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

      expect(onSubmit).toHaveBeenCalledWith('health');
    });
  });

  describe('disabled state', () => {
    const prompt: PromptData = {
      id: 'test',
      text: 'Test',
      inputType: 'slider',
      inputConfig: { min: 1, max: 10 },
    };

    it('disables button when disabled prop is true', () => {
      render(<PromptInput prompt={prompt} onSubmit={() => {}} disabled={true} />);
      expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    });

    it('disables input when disabled prop is true', () => {
      render(<PromptInput prompt={prompt} onSubmit={() => {}} disabled={true} />);
      expect(screen.getByRole('slider')).toBeDisabled();
    });
  });

  describe('unknown input type', () => {
    it('renders nothing for unknown type', () => {
      const prompt: PromptData = {
        id: 'test',
        text: 'Test',
        inputType: 'unknown' as any,
      };

      const { container } = render(<PromptInput prompt={prompt} onSubmit={() => {}} />);
      expect(container.querySelector('.prompt-input-content')?.children.length).toBe(0);
    });

    it('button disabled for unknown type', () => {
      const prompt: PromptData = {
        id: 'test',
        text: 'Test',
        inputType: 'unknown' as any,
      };

      render(<PromptInput prompt={prompt} onSubmit={() => {}} />);
      expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    });
  });
});
