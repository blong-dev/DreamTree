// Workbook component types

import type { ThemeSettings } from '@/lib/theme';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlockContent = Record<string, any>;

// Re-export ThemeSettings for convenience
export type { ThemeSettings };

export interface ExerciseBlock {
  id: number;
  sequence: number;
  blockType: 'content' | 'prompt' | 'tool';
  activityId: number;
  connectionId: number | null;
  content: BlockContent;
}

export interface ContentData {
  id?: number;
  type?: 'heading' | 'instruction' | 'note' | 'quote' | 'transition' | 'celebration';
  text?: string;
}

export interface PromptData {
  id?: number;
  promptText?: string;
  inputType?: 'text_input' | 'textarea' | 'slider' | 'checkbox' | 'checkbox_group' | 'radio' | 'select';
  inputConfig?: {
    min?: number;
    max?: number;
    step?: number;
    minLabel?: string;
    maxLabel?: string;
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
  };
}

export interface ToolData {
  id?: number;
  name?: string;
  description?: string;
  instructions?: string;
}

export interface ExerciseContent {
  exerciseId: string;
  part: number;
  module: number;
  exercise: number;
  title: string;
  blocks: ExerciseBlock[];
  nextExerciseId: string | null;
  prevExerciseId: string | null;
}

export interface SavedResponse {
  id: string;
  prompt_id: number | null;
  tool_id: number | null;
  exercise_id: string;
  activity_id: string | null;
  response_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkbookMessage {
  id: string;
  type: 'content' | 'prompt' | 'user' | 'tool';
  block?: ExerciseBlock;
  userResponse?: string;
  timestamp: Date;
}

/**
 * Single Page Architecture: Block with response merged in
 * Used by GET /api/workbook and POST /api/workbook/response
 */
export interface BlockWithResponse {
  id: number;
  sequence: number;
  exerciseId: string;
  blockType: 'content' | 'prompt' | 'tool';
  activityId: number;
  connectionId: number | null;
  content: {
    id?: number;
    type?: string;
    text?: string;
    promptText?: string;
    inputType?: string;
    inputConfig?: {
      min?: number;
      max?: number;
      step?: number;
      minLabel?: string;
      maxLabel?: string;
      options?: Array<{ value: string; label: string }>;
      placeholder?: string;
    };
    name?: string;
    description?: string;
    instructions?: string;
  };
  response?: string | null;
  responseId?: string | null;
}
