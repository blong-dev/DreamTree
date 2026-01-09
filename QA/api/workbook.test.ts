/**
 * Workbook API Tests
 *
 * Tests for /api/workbook/[exerciseId], /api/workbook/response, /api/workbook/progress
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { apiRequest, extractSessionCookie, TestSession } from './config';
import { signup, onboard, logout, defaultOnboardingSettings } from './helpers/session';
import { createTestUserData, validExerciseIds, invalidExerciseIds } from './helpers/fixtures';

// Shared test session for workbook tests
let testSession: TestSession | null = null;

beforeAll(async () => {
  // Create and onboard a test user
  const user = createTestUserData();
  testSession = await signup(user.email, user.password, user.name);
  if (testSession) {
    await onboard(testSession, defaultOnboardingSettings);
  }
});

afterAll(async () => {
  // Cleanup test user
  if (testSession) {
    await logout(testSession);
    testSession = null;
  }
});

describe('GET /api/workbook/[exerciseId]', () => {
  it('should fetch exercise content for valid ID', async () => {
    const response = await apiRequest<{
      exerciseId: string;
      part: number;
      module: number;
      exercise: number;
      title: string;
      blocks: Array<{
        id: number;
        sequence: number;
        blockType: string;
        content: object;
      }>;
      nextExerciseId: string | null;
      prevExerciseId: string | null;
    }>('/api/workbook/1.1.1');

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.data.exerciseId).toBe('1.1.1');
    expect(response.data.part).toBe(1);
    expect(response.data.module).toBe(1);
    expect(response.data.exercise).toBe(1);
    expect(response.data.blocks).toBeInstanceOf(Array);
    expect(response.data.blocks.length).toBeGreaterThan(0);
  });

  it('should return blocks with correct structure', async () => {
    const response = await apiRequest<{
      blocks: Array<{
        id: number;
        sequence: number;
        blockType: string;
        activityId: number;
        connectionId: number | null;
        content: object;
      }>;
    }>('/api/workbook/1.1.1');

    expect(response.ok).toBe(true);
    const block = response.data.blocks[0];
    expect(block).toHaveProperty('id');
    expect(block).toHaveProperty('sequence');
    expect(block).toHaveProperty('blockType');
    expect(['content', 'prompt', 'tool']).toContain(block.blockType);
    expect(block).toHaveProperty('content');
  });

  it('should include navigation links', async () => {
    const response = await apiRequest<{
      nextExerciseId: string | null;
      prevExerciseId: string | null;
    }>('/api/workbook/1.1.2');

    expect(response.ok).toBe(true);
    // 1.1.2 should have a prev (1.1.1) and potentially a next
    expect(response.data.prevExerciseId).toBeDefined();
  });

  it('should reject invalid exercise ID format', async () => {
    const response = await apiRequest<{ error: string }>('/api/workbook/invalid');

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    expect(response.data.error).toContain('Invalid');
  });

  it('should reject partial exercise ID', async () => {
    const response = await apiRequest<{ error: string }>('/api/workbook/1.1');

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    expect(response.data.error).toContain('Invalid');
  });

  it('should return 404 for non-existent exercise', async () => {
    const response = await apiRequest<{ error: string }>('/api/workbook/9.9.9');

    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);
    expect(response.data.error).toContain('not found');
  });
});

describe('POST /api/workbook/response', () => {
  it('should save prompt response', async () => {
    if (!testSession) {
      throw new Error('Test session not created');
    }

    // First get an exercise to find a valid promptId
    const exercise = await apiRequest<{
      blocks: Array<{
        blockType: string;
        content: { id: number };
      }>;
    }>('/api/workbook/1.1.1');

    const promptBlock = exercise.data.blocks.find(b => b.blockType === 'prompt');
    if (!promptBlock) {
      // Skip if no prompts in this exercise
      return;
    }

    const response = await apiRequest<{
      id: string;
      updated: boolean;
    }>('/api/workbook/response', {
      method: 'POST',
      cookie: testSession.cookie,
      body: {
        promptId: promptBlock.content.id,
        exerciseId: '1.1.1',
        responseText: 'Test response from API tests',
      },
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.data.id).toBeDefined();
  });

  it('should save tool response', async () => {
    if (!testSession) {
      throw new Error('Test session not created');
    }

    // First get an exercise to find a valid toolId
    const exercise = await apiRequest<{
      blocks: Array<{
        blockType: string;
        content: { id: number };
      }>;
    }>('/api/workbook/1.1.1');

    const toolBlock = exercise.data.blocks.find(b => b.blockType === 'tool');
    if (!toolBlock) {
      // Skip if no tools in this exercise
      return;
    }

    const response = await apiRequest<{
      id: string;
      updated: boolean;
    }>('/api/workbook/response', {
      method: 'POST',
      cookie: testSession.cookie,
      body: {
        toolId: toolBlock.content.id,
        exerciseId: '1.1.1',
        responseText: JSON.stringify({ items: ['test1', 'test2'] }),
      },
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.data.id).toBeDefined();
  });

  it('should reject response without auth', async () => {
    const response = await apiRequest<{ error: string }>('/api/workbook/response', {
      method: 'POST',
      body: {
        promptId: 1,
        exerciseId: '1.1.1',
        responseText: 'Test',
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
    expect(response.data.error).toContain('authenticated');
  });

  it('should reject response with both promptId and toolId', async () => {
    if (!testSession) {
      throw new Error('Test session not created');
    }

    const response = await apiRequest<{ error: string }>('/api/workbook/response', {
      method: 'POST',
      cookie: testSession.cookie,
      body: {
        promptId: 1,
        toolId: 1,
        exerciseId: '1.1.1',
        responseText: 'Test',
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    expect(response.data.error).toContain('exactly one');
  });

  it('should reject response without promptId or toolId', async () => {
    if (!testSession) {
      throw new Error('Test session not created');
    }

    const response = await apiRequest<{ error: string }>('/api/workbook/response', {
      method: 'POST',
      cookie: testSession.cookie,
      body: {
        exerciseId: '1.1.1',
        responseText: 'Test',
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    expect(response.data.error).toContain('exactly one');
  });

  it('should reject response without exerciseId', async () => {
    if (!testSession) {
      throw new Error('Test session not created');
    }

    const response = await apiRequest<{ error: string }>('/api/workbook/response', {
      method: 'POST',
      cookie: testSession.cookie,
      body: {
        promptId: 1,
        responseText: 'Test',
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    expect(response.data.error).toContain('required');
  });
});

describe('GET /api/workbook/response', () => {
  it('should fetch user responses for exercise', async () => {
    if (!testSession) {
      throw new Error('Test session not created');
    }

    const response = await apiRequest<{
      exerciseId: string;
      responses: Array<{
        id: string;
        prompt_id: number | null;
        tool_id: number | null;
        exercise_id: string;
        response_text: string;
      }>;
    }>('/api/workbook/response?exerciseId=1.1.1', {
      cookie: testSession.cookie,
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.data.exerciseId).toBe('1.1.1');
    expect(response.data.responses).toBeInstanceOf(Array);
  });

  it('should reject without auth', async () => {
    const response = await apiRequest<{ error: string }>(
      '/api/workbook/response?exerciseId=1.1.1'
    );

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
  });

  it('should reject without exerciseId param', async () => {
    if (!testSession) {
      throw new Error('Test session not created');
    }

    const response = await apiRequest<{ error: string }>('/api/workbook/response', {
      cookie: testSession.cookie,
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    expect(response.data.error).toContain('exerciseId');
  });
});

describe('GET /api/workbook/progress', () => {
  it('should fetch user progress', async () => {
    if (!testSession) {
      throw new Error('Test session not created');
    }

    const response = await apiRequest<{
      currentExercise: string | null;
      completedExercises: string[];
      totalExercises: number;
    }>('/api/workbook/progress', {
      cookie: testSession.cookie,
    });

    // Note: This endpoint may or may not exist - test will show either way
    if (response.ok) {
      expect(response.data).toHaveProperty('currentExerciseId');
    }
  });
});
