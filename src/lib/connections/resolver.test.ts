/**
 * ConnectionResolver Tests
 *
 * Tests for the data connection system that fetches user data for tools.
 * P1 task for AUDIT-001 resolution - blocks B3 (resolver refactor).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectionResolver, parseConnectionParams } from './resolver';

// Mock D1 database
function createMockDb() {
  const mockFirst = vi.fn();
  const mockAll = vi.fn();
  const mockBind = vi.fn();

  const mockPrepare = vi.fn(() => ({
    bind: (...args: unknown[]) => {
      mockBind(...args);
      return {
        first: mockFirst,
        all: mockAll,
      };
    },
    first: mockFirst,
    all: mockAll,
  }));

  return {
    prepare: mockPrepare,
    _mocks: {
      prepare: mockPrepare,
      first: mockFirst,
      all: mockAll,
      bind: mockBind,
    },
  };
}

describe('parseConnectionParams', () => {
  it('parses valid JSON params', () => {
    const params = parseConnectionParams('forward', '{"source": "all_skills", "filter": "top_10"}');
    expect(params).toEqual({ source: 'all_skills', filter: 'top_10' });
  });

  it('returns default on invalid JSON', () => {
    const params = parseConnectionParams('forward', 'invalid json');
    expect(params).toEqual({ instructions: [] });
  });

  it('returns default on empty string', () => {
    const params = parseConnectionParams('forward', '');
    expect(params).toEqual({ instructions: [] });
  });

  it('handles null-ish values in JSON', () => {
    const params = parseConnectionParams('forward', '{"source": null}');
    expect(params).toEqual({ source: null });
  });
});

describe('ConnectionResolver', () => {
  let mockDb: ReturnType<typeof createMockDb>;
  let resolver: ConnectionResolver;

  beforeEach(() => {
    mockDb = createMockDb();
    resolver = new ConnectionResolver(mockDb as unknown as Parameters<typeof ConnectionResolver['prototype']['resolve']>[0]['userId'] extends string ? never : never);
  });

  describe('resolve() - connection not found', () => {
    it('returns error result when connection does not exist', async () => {
      mockDb._mocks.first.mockResolvedValueOnce(null);

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 99999,
      });

      expect(result.connectionId).toBe(99999);
      expect(result.isEmpty).toBe(true);
      expect(result.error).toBe('Connection 99999 not found');
      expect(result.data).toBeNull();
    });
  });

  describe('resolve() - forward connection type', () => {
    it('resolves forward connection with auto_populate', async () => {
      // Mock connection lookup
      mockDb._mocks.first.mockResolvedValueOnce({
        id: 100001,
        connection_type: 'forward',
        data_object: 'skills',
        transform: '{"source": "all_skills"}',
        implementation_notes: '',
      });

      // Mock skills data fetch
      mockDb._mocks.all.mockResolvedValueOnce({
        results: [
          { id: 'sk1', skill_id: 's1', name: 'Leadership', category: 'transferable', mastery: 4, rank: 1 },
          { id: 'sk2', skill_id: 's2', name: 'Communication', category: 'transferable', mastery: 5, rank: 2 },
        ],
      });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100001,
      });

      expect(result.connectionId).toBe(100001);
      expect(result.method).toBe('auto_populate');
      expect(result.isEmpty).toBe(false);
      expect(Array.isArray(result.data)).toBe(true);
      expect((result.data as unknown[]).length).toBe(2);
    });

    it('returns empty result when no data exists', async () => {
      mockDb._mocks.first.mockResolvedValueOnce({
        id: 100002,
        connection_type: 'forward',
        data_object: 'stories',
        transform: '{"source": "soared_stories"}',
        implementation_notes: '',
      });

      mockDb._mocks.all.mockResolvedValueOnce({ results: [] });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100002,
      });

      expect(result.isEmpty).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('resolve() - internal connection type', () => {
    it('treats internal as forward connection', async () => {
      mockDb._mocks.first.mockResolvedValueOnce({
        id: 100003,
        connection_type: 'internal',
        data_object: 'values',
        transform: '{"source": "work_values"}',
        implementation_notes: '',
      });

      mockDb._mocks.first
        .mockResolvedValueOnce(null) // First call is connection lookup (already done)
        .mockResolvedValueOnce({ work_values: 'Growth, Impact, Autonomy' });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100003,
      });

      expect(result.method).toBe('auto_populate');
    });
  });

  describe('resolve() - backward connection type', () => {
    it('treats backward as forward connection', async () => {
      mockDb._mocks.first.mockResolvedValueOnce({
        id: 100004,
        connection_type: 'backward',
        data_object: 'experiences',
        transform: '{"source": "experiences"}',
        implementation_notes: '',
      });

      mockDb._mocks.all.mockResolvedValueOnce({
        results: [
          { id: 'exp1', title: 'Software Engineer', organization: 'TechCo', experience_type: 'job', start_date: '2020-01', end_date: '2024-01', description: 'Built things' },
        ],
      });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100004,
      });

      expect(result.method).toBe('auto_populate');
      expect(result.isEmpty).toBe(false);
    });
  });

  describe('resolve() - resource connection type', () => {
    it('resolves skills_master reference link', async () => {
      mockDb._mocks.first.mockResolvedValueOnce({
        id: 100005,
        connection_type: 'resource',
        data_object: 'skills_reference',
        transform: '{"target": "skills_master", "display": "list"}',
        implementation_notes: '',
      });

      mockDb._mocks.all.mockResolvedValueOnce({
        results: [
          { id: 1, name: 'Problem Solving', category: 'transferable' },
          { id: 2, name: 'Critical Thinking', category: 'transferable' },
        ],
      });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100005,
      });

      expect(result.method).toBe('reference_link');
      expect(result.isEmpty).toBe(false);
      expect((result.data as unknown[]).length).toBe(2);
    });

    it('returns empty for unknown reference target', async () => {
      mockDb._mocks.first.mockResolvedValueOnce({
        id: 100006,
        connection_type: 'resource',
        data_object: 'unknown',
        transform: '{"target": "unknown_table", "display": "list"}',
        implementation_notes: '',
      });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100006,
      });

      expect(result.method).toBe('reference_link');
      expect(result.isEmpty).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe('resolve() - framework connection type', () => {
    it('returns params as data for framework connections', async () => {
      mockDb._mocks.first.mockResolvedValueOnce({
        id: 100007,
        connection_type: 'framework',
        data_object: 'framework_config',
        transform: '{"framework": "SOARED", "version": "1.0"}',
        implementation_notes: '',
      });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100007,
      });

      expect(result.method).toBe('custom');
      expect(result.isEmpty).toBe(false);
      expect(result.data).toEqual({ framework: 'SOARED', version: '1.0' });
    });
  });

  describe('resolve() - unknown connection type', () => {
    it('treats unknown types as custom', async () => {
      mockDb._mocks.first.mockResolvedValueOnce({
        id: 100008,
        connection_type: 'some_new_type',
        data_object: 'data',
        transform: '{"custom": true}',
        implementation_notes: '',
      });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100008,
      });

      expect(result.method).toBe('custom');
    });
  });

  describe('data source fetchers via forward connections', () => {
    // Test each data source type through the resolve() public API

    it('fetches transferable_skills with filter', async () => {
      mockDb._mocks.first.mockResolvedValueOnce({
        id: 100010,
        connection_type: 'forward',
        data_object: 'skills',
        transform: '{"source": "transferable_skills", "filter": "top_10_by_mastery"}',
        implementation_notes: '',
      });

      mockDb._mocks.all.mockResolvedValueOnce({
        results: [
          { id: 'sk1', skill_id: 's1', name: 'Leadership', category: 'transferable', mastery: 5, rank: 1 },
        ],
      });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100010,
      });

      expect(result.isEmpty).toBe(false);
      const skills = result.data as Array<{ name: string; mastery: number }>;
      expect(skills[0].name).toBe('Leadership');
      expect(skills[0].mastery).toBe(5);
    });

    it('fetches soared_stories', async () => {
      mockDb._mocks.first.mockResolvedValueOnce({
        id: 100011,
        connection_type: 'forward',
        data_object: 'stories',
        transform: '{"source": "soared_stories"}',
        implementation_notes: '',
      });

      mockDb._mocks.all.mockResolvedValueOnce({
        results: [
          {
            id: 'story1',
            experience_id: 'exp1',
            title: 'Led Major Project',
            situation: 'Team needed direction',
            obstacle: 'Tight deadline',
            action: 'Created plan',
            result: 'Success',
            evaluation: 'Good',
            discovery: 'Leadership',
          },
        ],
      });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100011,
      });

      const stories = result.data as Array<{ title: string; situation: string }>;
      expect(stories[0].title).toBe('Led Major Project');
      expect(stories[0].situation).toBe('Team needed direction');
    });

    it('fetches employment_history (filtered experiences)', async () => {
      mockDb._mocks.first.mockResolvedValueOnce({
        id: 100012,
        connection_type: 'forward',
        data_object: 'experiences',
        transform: '{"source": "employment_history"}',
        implementation_notes: '',
      });

      mockDb._mocks.all.mockResolvedValueOnce({
        results: [
          { id: 'exp1', title: 'Engineer', organization: 'TechCo', experience_type: 'job', start_date: '2020-01', end_date: null, description: '' },
        ],
      });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100012,
      });

      const experiences = result.data as Array<{ type: string }>;
      expect(experiences[0].type).toBe('job');
    });

    it('fetches flow_tracking with high energy filter', async () => {
      mockDb._mocks.first.mockResolvedValueOnce({
        id: 100013,
        connection_type: 'forward',
        data_object: 'flow',
        transform: '{"source": "flow_tracking", "filter": "high_energy_high_captivation"}',
        implementation_notes: '',
      });

      mockDb._mocks.all.mockResolvedValueOnce({
        results: [
          { id: 'flow1', activity: 'Coding', energy: 2, focus: 5, logged_date: '2024-01-15' },
        ],
      });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100013,
      });

      const activities = result.data as Array<{ activity: string; isHighFlow: boolean }>;
      expect(activities[0].activity).toBe('Coding');
      expect(activities[0].isHighFlow).toBe(true);
    });

    it('fetches values_compass', async () => {
      mockDb._mocks.first
        .mockResolvedValueOnce({
          id: 100014,
          connection_type: 'forward',
          data_object: 'values',
          transform: '{"source": "values_compass"}',
          implementation_notes: '',
        })
        .mockResolvedValueOnce({
          compass_statement: 'I value growth and making an impact',
        });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100014,
      });

      expect(result.data).toBe('I value growth and making an impact');
    });

    it('fetches career_options', async () => {
      mockDb._mocks.first.mockResolvedValueOnce({
        id: 100015,
        connection_type: 'forward',
        data_object: 'careers',
        transform: '{"source": "career_options"}',
        implementation_notes: '',
      });

      mockDb._mocks.all.mockResolvedValueOnce({
        results: [
          { id: 'c1', title: 'Product Manager', description: 'Lead products', rank: 1, coherence_score: 85, work_needs_score: 90, life_needs_score: 80, unknowns_score: 20 },
        ],
      });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100015,
      });

      const careers = result.data as Array<{ title: string; rank: number }>;
      expect(careers[0].title).toBe('Product Manager');
      expect(careers[0].rank).toBe(1);
    });

    it('fetches budget data', async () => {
      mockDb._mocks.first
        .mockResolvedValueOnce({
          id: 100016,
          connection_type: 'forward',
          data_object: 'budget',
          transform: '{"source": "budget"}',
          implementation_notes: '',
        })
        .mockResolvedValueOnce({
          monthly_expenses: 5000,
          annual_needs: 60000,
          hourly_batna: 30,
          benefits_needed: 'Health, 401k',
        });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100016,
      });

      const budget = result.data as { monthlyExpenses: number };
      expect(budget.monthlyExpenses).toBe(5000);
    });

    it('returns null for budget when no data', async () => {
      mockDb._mocks.first
        .mockResolvedValueOnce({
          id: 100017,
          connection_type: 'forward',
          data_object: 'budget',
          transform: '{"source": "budget"}',
          implementation_notes: '',
        })
        .mockResolvedValueOnce(null);

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100017,
      });

      expect(result.data).toBeNull();
      expect(result.isEmpty).toBe(true);
    });

    it('fetches mbti_code', async () => {
      mockDb._mocks.first
        .mockResolvedValueOnce({
          id: 100018,
          connection_type: 'forward',
          data_object: 'personality',
          transform: '{"source": "mbti_code"}',
          implementation_notes: '',
        })
        .mockResolvedValueOnce({
          personality_type: 'INTJ',
        });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100018,
      });

      expect(result.data).toBe('INTJ');
    });

    it('fetches life_dashboard', async () => {
      mockDb._mocks.first
        .mockResolvedValueOnce({
          id: 100019,
          connection_type: 'forward',
          data_object: 'dashboard',
          transform: '{"source": "life_dashboard"}',
          implementation_notes: '',
        })
        .mockResolvedValueOnce({
          life_dashboard_work: 7,
          life_dashboard_play: 5,
          life_dashboard_love: 8,
          life_dashboard_health: 6,
        });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100019,
      });

      const dashboard = result.data as { work: number; play: number };
      expect(dashboard.work).toBe(7);
      expect(dashboard.play).toBe(5);
    });

    it('fetches locations', async () => {
      mockDb._mocks.first.mockResolvedValueOnce({
        id: 100020,
        connection_type: 'forward',
        data_object: 'locations',
        transform: '{"source": "locations"}',
        implementation_notes: '',
      });

      mockDb._mocks.all.mockResolvedValueOnce({
        results: [
          { id: 'loc1', location_name: 'San Francisco', rank: 1 },
          { id: 'loc2', location_name: 'Seattle', rank: 2 },
        ],
      });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100020,
      });

      const locations = result.data as Array<{ name: string }>;
      expect(locations[0].name).toBe('San Francisco');
    });

    it('returns null for unknown data source', async () => {
      mockDb._mocks.first.mockResolvedValueOnce({
        id: 100021,
        connection_type: 'forward',
        data_object: 'unknown',
        transform: '{"source": "nonexistent_source"}',
        implementation_notes: '',
      });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100021,
      });

      expect(result.data).toBeNull();
      expect(result.isEmpty).toBe(true);
    });
  });

  describe('sourceExercise tracking', () => {
    it('extracts from_exercise from params', async () => {
      mockDb._mocks.first.mockResolvedValueOnce({
        id: 100030,
        connection_type: 'forward',
        data_object: 'skills',
        transform: '{"source": "all_skills", "from_exercise": "1.2.3"}',
        implementation_notes: '',
      });

      mockDb._mocks.all.mockResolvedValueOnce({ results: [] });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100030,
      });

      expect(result.sourceExercise).toBe('1.2.3');
    });

    it('extracts from_module when from_exercise not present', async () => {
      mockDb._mocks.first.mockResolvedValueOnce({
        id: 100031,
        connection_type: 'forward',
        data_object: 'skills',
        transform: '{"source": "all_skills", "from_module": "1.2"}',
        implementation_notes: '',
      });

      mockDb._mocks.all.mockResolvedValueOnce({ results: [] });

      const result = await resolver.resolve({
        userId: 'user-123',
        connectionId: 100031,
      });

      expect(result.sourceExercise).toBe('1.2');
    });
  });
});
