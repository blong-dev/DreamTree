/**
 * Form Builder Component
 * Dynamically renders forms based on schema for exercises
 */

'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

// ============================================
// TYPES
// ============================================

export interface FormSchema {
  fields: FormField[];
}

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'multiselect' | 'ranking' | 'scale';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  options?: string[]; // For multiselect and ranking
  helperText?: string;
  defaultValue?: unknown;
}

export interface FormData {
  [key: string]: unknown;
}

interface FormBuilderProps {
  schema: FormSchema;
  initialData?: FormData;
  onSave: (data: FormData) => void;
  onAutoSave?: (data: FormData) => void; // Auto-save to IndexedDB
  autoSaveDelay?: number; // ms
}

// ============================================
// FORM BUILDER COMPONENT
// ============================================

export function FormBuilder({
  schema,
  initialData = {},
  onSave,
  onAutoSave,
  autoSaveDelay = 2000,
}: FormBuilderProps) {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Debounced auto-save
  const debouncedFormData = useDebounce(formData, autoSaveDelay);

  useEffect(() => {
    if (onAutoSave && Object.keys(debouncedFormData).length > 0) {
      onAutoSave(debouncedFormData);
      setLastSaved(new Date());
    }
  }, [debouncedFormData, onAutoSave]);

  // Update field value
  const updateField = (fieldId: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    schema.fields.forEach((field) => {
      const value = formData[field.id];

      // Required validation
      if (field.required && !value) {
        newErrors[field.id] = `${field.label} is required`;
        return;
      }

      // Skip other validations if field is empty and not required
      if (!value && !field.required) return;

      // Type-specific validation
      if (field.validation) {
        const { min, max, minLength, maxLength, pattern } = field.validation;

        // Number validations
        if (field.type === 'number' && typeof value === 'number') {
          if (min !== undefined && value < min) {
            newErrors[field.id] = `Must be at least ${min}`;
          }
          if (max !== undefined && value > max) {
            newErrors[field.id] = `Must be at most ${max}`;
          }
        }

        // String validations
        if (typeof value === 'string') {
          if (minLength !== undefined && value.length < minLength) {
            newErrors[field.id] = `Must be at least ${minLength} characters`;
          }
          if (maxLength !== undefined && value.length > maxLength) {
            newErrors[field.id] = `Must be at most ${maxLength} characters`;
          }
          if (pattern && !new RegExp(pattern).test(value)) {
            newErrors[field.id] = `Invalid format`;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {schema.fields.map((field) => (
        <FormFieldRenderer
          key={field.id}
          field={field}
          value={formData[field.id]}
          error={errors[field.id]}
          onChange={(value) => updateField(field.id, value)}
        />
      ))}

      {/* Save Button */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        <div className="text-sm text-gray-500">
          {lastSaved && (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Progress'}
        </button>
      </div>
    </form>
  );
}

// ============================================
// FIELD RENDERER
// ============================================

interface FormFieldRendererProps {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
}

function FormFieldRenderer({
  field,
  value,
  error,
  onChange,
}: FormFieldRendererProps) {
  return (
    <div>
      <label
        htmlFor={field.id}
        className="mb-2 block text-sm font-medium text-gray-900"
      >
        {field.label}
        {field.required && <span className="ml-1 text-red-600">*</span>}
      </label>

      {/* Render appropriate field type */}
      {field.type === 'text' && (
        <TextField
          id={field.id}
          value={(value as string) || ''}
          placeholder={field.placeholder}
          onChange={onChange}
        />
      )}

      {field.type === 'textarea' && (
        <TextAreaField
          id={field.id}
          value={(value as string) || ''}
          placeholder={field.placeholder}
          onChange={onChange}
        />
      )}

      {field.type === 'number' && (
        <NumberField
          id={field.id}
          value={(value as number) || 0}
          onChange={onChange}
          min={field.validation?.min}
          max={field.validation?.max}
        />
      )}

      {field.type === 'email' && (
        <EmailField
          id={field.id}
          value={(value as string) || ''}
          placeholder={field.placeholder}
          onChange={onChange}
        />
      )}

      {field.type === 'multiselect' && field.options && (
        <MultiSelectField
          id={field.id}
          options={field.options}
          value={(value as string[]) || []}
          onChange={onChange}
        />
      )}

      {field.type === 'ranking' && field.options && (
        <RankingField
          id={field.id}
          options={field.options}
          value={(value as string[]) || []}
          onChange={onChange}
        />
      )}

      {field.type === 'scale' && (
        <ScaleField
          id={field.id}
          value={(value as number) || 0}
          onChange={onChange}
          min={field.validation?.min || 0}
          max={field.validation?.max || 10}
        />
      )}

      {/* Helper text */}
      {field.helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{field.helperText}</p>
      )}

      {/* Error message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

// ============================================
// FIELD COMPONENTS
// ============================================

function TextField({
  id,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="text"
      id={id}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

function TextAreaField({
  id,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <textarea
      id={id}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      rows={6}
      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

function NumberField({
  id,
  value,
  onChange,
  min,
  max,
}: {
  id: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      id={id}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      min={min}
      max={max}
      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

function EmailField({
  id,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="email"
      id={id}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

function MultiSelectField({
  id,
  options,
  value,
  onChange,
}: {
  id: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label
          key={option}
          className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={value.includes(option)}
            onChange={() => toggleOption(option)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-900">{option}</span>
        </label>
      ))}
    </div>
  );
}

function RankingField({
  id,
  options,
  value,
  onChange,
}: {
  id: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  // Initialize ranking if empty
  useEffect(() => {
    if (value.length === 0) {
      onChange([...options]);
    }
  }, [options, value.length]);

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newRanking = [...value];
    const [movedItem] = newRanking.splice(fromIndex, 1);
    newRanking.splice(toIndex, 0, movedItem);
    onChange(newRanking);
  };

  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div
          key={item}
          className="flex items-center space-x-3 rounded-lg border border-gray-200 bg-white p-3"
        >
          <div className="flex flex-col space-y-1">
            <button
              type="button"
              onClick={() => moveItem(index, Math.max(0, index - 1))}
              disabled={index === 0}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => moveItem(index, Math.min(value.length - 1, index + 1))}
              disabled={index === value.length - 1}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              ▼
            </button>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
            {index + 1}
          </div>
          <span className="flex-1 text-sm text-gray-900">{item}</span>
        </div>
      ))}
    </div>
  );
}

function ScaleField({
  id,
  value,
  onChange,
  min,
  max,
}: {
  id: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="space-y-2">
      <input
        type="range"
        id={id}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        min={min}
        max={max}
        className="w-full"
      />
      <div className="flex justify-between text-sm text-gray-600">
        <span>{min}</span>
        <span className="font-semibold text-blue-600">{value}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
