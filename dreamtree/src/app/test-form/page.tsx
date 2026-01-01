/**
 * FormBuilder Test Page
 * Demonstrates all form field types
 */

'use client';

import { useState } from 'react';
import { FormBuilder, type FormSchema, type FormData } from '@/components/FormBuilder';

export default function TestFormPage() {
  const [savedData, setSavedData] = useState<FormData | null>(null);

  // Example form schema demonstrating all field types
  const exampleSchema: FormSchema = {
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true,
        validation: {
          minLength: 2,
          maxLength: 100,
        },
        helperText: 'This will be used in your profile',
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'you@example.com',
        required: true,
        helperText: 'We\'ll never share your email',
      },
      {
        id: 'story',
        type: 'textarea',
        label: 'Your Career Story',
        placeholder: 'Tell us about your career journey...',
        required: true,
        validation: {
          minLength: 50,
          maxLength: 1000,
        },
        helperText: 'Minimum 50 characters. Be honest and reflective.',
      },
      {
        id: 'experience',
        type: 'number',
        label: 'Years of Experience',
        required: true,
        validation: {
          min: 0,
          max: 50,
        },
        helperText: 'Total years in your field',
      },
      {
        id: 'skills',
        type: 'multiselect',
        label: 'Select Your Top Skills',
        required: true,
        options: [
          'Leadership',
          'Communication',
          'Problem Solving',
          'Technical Expertise',
          'Project Management',
          'Creativity',
          'Analytical Thinking',
          'Collaboration',
        ],
        helperText: 'Select all that apply',
      },
      {
        id: 'priorities',
        type: 'ranking',
        label: 'Rank Your Career Priorities',
        required: true,
        options: [
          'Work-Life Balance',
          'High Salary',
          'Learning & Growth',
          'Impact & Meaning',
          'Job Security',
        ],
        helperText: 'Drag to reorder. Most important at the top.',
      },
      {
        id: 'satisfaction',
        type: 'scale',
        label: 'Current Job Satisfaction',
        required: true,
        validation: {
          min: 0,
          max: 10,
        },
        helperText: '0 = Very Dissatisfied, 10 = Very Satisfied',
      },
    ],
  };

  const handleSave = (data: FormData) => {
    console.log('Form saved:', data);
    setSavedData(data);
    alert('Form saved successfully! Check console for data.');
  };

  const handleAutoSave = (data: FormData) => {
    console.log('Auto-saved:', data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            📝 FormBuilder Demo
          </h1>
          <p className="text-gray-600">
            This demonstrates all the field types available in the FormBuilder component.
            Data auto-saves as you type (2-second debounce).
          </p>
        </div>

        {/* Form */}
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <FormBuilder
            schema={exampleSchema}
            onSave={handleSave}
            onAutoSave={handleAutoSave}
            autoSaveDelay={2000}
          />
        </div>

        {/* Saved Data Display */}
        {savedData && (
          <div className="mt-6 rounded-lg bg-green-50 p-6">
            <h2 className="mb-4 text-xl font-semibold text-green-900">
              ✅ Saved Data
            </h2>
            <pre className="overflow-auto rounded-lg bg-white p-4 text-sm">
              {JSON.stringify(savedData, null, 2)}
            </pre>
          </div>
        )}

        {/* Field Types Reference */}
        <div className="mt-6 rounded-lg bg-blue-50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-blue-900">
            📚 Available Field Types
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-white p-4">
              <h3 className="mb-2 font-semibold">text</h3>
              <p className="text-sm text-gray-600">
                Single-line text input with optional validation
              </p>
            </div>
            <div className="rounded-lg bg-white p-4">
              <h3 className="mb-2 font-semibold">textarea</h3>
              <p className="text-sm text-gray-600">
                Multi-line text area for longer responses
              </p>
            </div>
            <div className="rounded-lg bg-white p-4">
              <h3 className="mb-2 font-semibold">number</h3>
              <p className="text-sm text-gray-600">
                Numeric input with min/max validation
              </p>
            </div>
            <div className="rounded-lg bg-white p-4">
              <h3 className="mb-2 font-semibold">email</h3>
              <p className="text-sm text-gray-600">
                Email input with format validation
              </p>
            </div>
            <div className="rounded-lg bg-white p-4">
              <h3 className="mb-2 font-semibold">multiselect</h3>
              <p className="text-sm text-gray-600">
                Checkbox list for selecting multiple options
              </p>
            </div>
            <div className="rounded-lg bg-white p-4">
              <h3 className="mb-2 font-semibold">ranking</h3>
              <p className="text-sm text-gray-600">
                Drag to reorder items by priority
              </p>
            </div>
            <div className="rounded-lg bg-white p-4">
              <h3 className="mb-2 font-semibold">scale</h3>
              <p className="text-sm text-gray-600">
                Slider for rating on a numeric scale
              </p>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-6 rounded-lg bg-purple-50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-purple-900">
            ✨ FormBuilder Features
          </h2>
          <ul className="space-y-2 text-sm text-purple-800">
            <li>✅ Auto-save with debouncing (prevents excessive saves)</li>
            <li>✅ Real-time validation with error messages</li>
            <li>✅ Required field enforcement</li>
            <li>✅ Min/max length and value validation</li>
            <li>✅ Pattern matching (regex) support</li>
            <li>✅ Helper text for guidance</li>
            <li>✅ Accessible labels and ARIA attributes</li>
            <li>✅ Responsive design (mobile-friendly)</li>
            <li>✅ TypeScript type safety</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
