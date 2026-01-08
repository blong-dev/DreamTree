// DreamTree Connection Resolver
// Fetches and transforms data based on connection definitions

import type { D1Database } from '@cloudflare/workers-types';
import type {
  ParsedConnection,
  ConnectionMethod,
  ConnectionResult,
  FetchConnectionOptions,
  AutoPopulateParams,
  DataSourceType,
  SOAREDStory,
  RankedSkill,
  FlowActivity,
  Experience,
  CareerOption,
  BudgetData,
} from './types';

/**
 * Parse connection params from JSON string
 */
export function parseConnectionParams(
  method: string,
  paramsJson: string
): ParsedConnection['params'] {
  try {
    return JSON.parse(paramsJson);
  } catch {
    return { instructions: [] };
  }
}

/**
 * Main resolver class for fetching connected data
 */
export class ConnectionResolver {
  constructor(private db: D1Database) {}

  /**
   * Resolve a connection and fetch the relevant data
   */
  async resolve<T = unknown>(
    options: FetchConnectionOptions
  ): Promise<ConnectionResult<T>> {
    const { userId, connectionId } = options;

    // Fetch connection definition
    const connection = await this.db
      .prepare(
        `SELECT id, name, method, params, implementation_notes
         FROM connections WHERE id = ?`
      )
      .bind(connectionId)
      .first<{
        id: number;
        name: string;
        method: string;
        params: string;
        implementation_notes: string;
      }>();

    if (!connection) {
      return {
        connectionId,
        method: 'custom',
        data: null,
        isEmpty: true,
        sourceExercise: null,
        error: `Connection ${connectionId} not found`,
      };
    }

    const method = connection.method as ConnectionMethod;
    const params = parseConnectionParams(method, connection.params);

    // Route to appropriate handler based on method
    switch (method) {
      case 'auto_populate':
      case 'hydrate':
        return this.resolveAutoPopulate<T>(
          userId,
          connectionId,
          params as AutoPopulateParams
        );

      case 'reference_link':
        return this.resolveReferenceLink<T>(connectionId, params);

      case 'custom':
      default:
        // Custom connections return params for tool-specific handling
        return {
          connectionId,
          method: 'custom',
          data: params as T,
          isEmpty: false,
          sourceExercise: null,
        };
    }
  }

  /**
   * Resolve auto_populate and hydrate connections
   */
  private async resolveAutoPopulate<T>(
    userId: string,
    connectionId: number,
    params: AutoPopulateParams
  ): Promise<ConnectionResult<T>> {
    const data = await this.fetchDataSource(userId, params.source, params);

    return {
      connectionId,
      method: 'auto_populate',
      data: data as T,
      isEmpty: !data || (Array.isArray(data) && data.length === 0),
      sourceExercise: params.from_exercise || params.from_module || null,
    };
  }

  /**
   * Resolve reference_link connections (static reference data)
   */
  private async resolveReferenceLink<T>(
    connectionId: number,
    params: unknown
  ): Promise<ConnectionResult<T>> {
    const refParams = params as { target: string; display: string };

    // Reference links point to static data like skills_master
    if (refParams.target === 'skills_master') {
      const skills = await this.db
        .prepare(
          `SELECT id, name, category FROM skills
           WHERE is_custom = 0 AND review_status = 'approved'
           ORDER BY category, name`
        )
        .all();

      return {
        connectionId,
        method: 'reference_link',
        data: skills.results as T,
        isEmpty: skills.results.length === 0,
        sourceExercise: null,
      };
    }

    return {
      connectionId,
      method: 'reference_link',
      data: null,
      isEmpty: true,
      sourceExercise: null,
    };
  }

  /**
   * Fetch data from a specific source type
   */
  private async fetchDataSource(
    userId: string,
    source: DataSourceType,
    params: AutoPopulateParams
  ): Promise<unknown> {
    switch (source) {
      case 'transferable_skills':
        return this.fetchTransferableSkills(userId, params.filter);

      case 'soft_skills':
        return this.fetchSoftSkills(userId);

      case 'soared_stories':
        return this.fetchSOAREDStories(userId);

      case 'experiences':
      case 'employment_history':
        return this.fetchExperiences(userId, 'job');

      case 'education_history':
        return this.fetchExperiences(userId, 'education');

      case 'flow_tracking':
        return this.fetchFlowActivities(userId, params.filter);

      case 'values_compass':
        return this.fetchValuesCompass(userId);

      case 'career_options':
        return this.fetchCareerOptions(userId);

      case 'budget':
        return this.fetchBudget(userId);

      case 'mbti_code':
        return this.fetchMBTICode(userId);

      case 'life_dashboard':
        return this.fetchLifeDashboard(userId);

      default:
        return null;
    }
  }

  // ============================================================
  // DATA SOURCE FETCHERS
  // ============================================================

  private async fetchTransferableSkills(
    userId: string,
    filter?: string
  ): Promise<RankedSkill[]> {
    let query = `
      SELECT us.id, us.skill_id, s.name, us.category, us.mastery, us.rank
      FROM user_skills us
      JOIN skills s ON us.skill_id = s.id
      WHERE us.user_id = ? AND us.category = 'transferable'
    `;

    if (filter === 'top_10_by_mastery') {
      query += ` ORDER BY us.mastery DESC, us.rank ASC LIMIT 10`;
    } else {
      query += ` ORDER BY us.rank ASC`;
    }

    const result = await this.db.prepare(query).bind(userId).all();

    return result.results.map((row) => ({
      id: row.id as string,
      skillId: row.skill_id as string,
      name: row.name as string,
      category: 'transferable' as const,
      mastery: row.mastery as 1 | 2 | 3 | 4 | 5,
      rank: row.rank as number,
    }));
  }

  private async fetchSoftSkills(userId: string): Promise<RankedSkill[]> {
    const result = await this.db
      .prepare(
        `SELECT us.id, us.skill_id, s.name, us.category, us.mastery, us.rank
         FROM user_skills us
         JOIN skills s ON us.skill_id = s.id
         WHERE us.user_id = ? AND us.category = 'self_management'
         ORDER BY us.rank ASC`
      )
      .bind(userId)
      .all();

    return result.results.map((row) => ({
      id: row.id as string,
      skillId: row.skill_id as string,
      name: row.name as string,
      category: 'self_management' as const,
      mastery: row.mastery as 1 | 2 | 3 | 4 | 5,
      rank: row.rank as number,
    }));
  }

  private async fetchSOAREDStories(userId: string): Promise<SOAREDStory[]> {
    const result = await this.db
      .prepare(
        `SELECT id, experience_id, title, situation, obstacle, action,
                result, evaluation, discovery
         FROM user_stories
         WHERE user_id = ?
         ORDER BY created_at ASC`
      )
      .bind(userId)
      .all();

    return result.results.map((row) => ({
      id: row.id as string,
      experienceId: row.experience_id as string | null,
      title: row.title as string | null,
      situation: row.situation as string,
      obstacle: row.obstacle as string,
      action: row.action as string,
      result: row.result as string,
      evaluation: row.evaluation as string,
      discovery: row.discovery as string,
    }));
  }

  private async fetchExperiences(
    userId: string,
    type?: 'job' | 'education'
  ): Promise<Experience[]> {
    let query = `
      SELECT id, title, organization, experience_type, start_date, end_date, description
      FROM user_experiences
      WHERE user_id = ?
    `;

    if (type) {
      query += ` AND experience_type = '${type}'`;
    }

    query += ` ORDER BY start_date DESC`;

    const result = await this.db.prepare(query).bind(userId).all();

    return result.results.map((row) => ({
      id: row.id as string,
      title: row.title as string,
      organization: row.organization as string | null,
      type: row.experience_type as 'job' | 'education' | 'project' | 'other',
      startDate: row.start_date as string | null,
      endDate: row.end_date as string | null,
      description: row.description as string | null,
    }));
  }

  private async fetchFlowActivities(
    userId: string,
    filter?: string
  ): Promise<FlowActivity[]> {
    let query = `
      SELECT id, activity, energy, focus, logged_date
      FROM user_flow_logs
      WHERE user_id = ?
    `;

    if (filter === 'high_energy_high_captivation') {
      query += ` AND energy >= 1 AND focus >= 4`;
    }

    query += ` ORDER BY logged_date DESC`;

    const result = await this.db.prepare(query).bind(userId).all();

    return result.results.map((row) => ({
      id: row.id as string,
      activity: row.activity as string,
      energy: row.energy as -2 | -1 | 0 | 1 | 2,
      focus: row.focus as 1 | 2 | 3 | 4 | 5,
      loggedDate: row.logged_date as string,
      isHighFlow: (row.energy as number) >= 1 && (row.focus as number) >= 4,
    }));
  }

  private async fetchValuesCompass(userId: string): Promise<string | null> {
    const result = await this.db
      .prepare(`SELECT compass_statement FROM user_values WHERE user_id = ?`)
      .bind(userId)
      .first<{ compass_statement: string | null }>();

    return result?.compass_statement || null;
  }

  private async fetchCareerOptions(userId: string): Promise<CareerOption[]> {
    const result = await this.db
      .prepare(
        `SELECT id, title, description, rank, coherence_score,
                work_needs_score, life_needs_score, unknowns_score
         FROM user_career_options
         WHERE user_id = ?
         ORDER BY rank ASC`
      )
      .bind(userId)
      .all();

    return result.results.map((row) => ({
      id: row.id as string,
      title: row.title as string,
      description: row.description as string | null,
      rank: row.rank as 1 | 2 | 3,
      coherenceScore: row.coherence_score as number | null,
      workNeedsScore: row.work_needs_score as number | null,
      lifeNeedsScore: row.life_needs_score as number | null,
      unknownsScore: row.unknowns_score as number | null,
    }));
  }

  private async fetchBudget(userId: string): Promise<BudgetData | null> {
    const result = await this.db
      .prepare(
        `SELECT monthly_expenses, annual_needs, hourly_batna, benefits_needed
         FROM user_budget WHERE user_id = ?`
      )
      .bind(userId)
      .first<{
        monthly_expenses: number | null;
        annual_needs: number | null;
        hourly_batna: number | null;
        benefits_needed: string | null;
      }>();

    if (!result || !result.monthly_expenses) return null;

    return {
      monthlyExpenses: result.monthly_expenses,
      annualNeeds: result.annual_needs || 0,
      hourlyBatna: result.hourly_batna || 0,
      benefitsNeeded: result.benefits_needed,
    };
  }

  private async fetchMBTICode(userId: string): Promise<string | null> {
    const result = await this.db
      .prepare(`SELECT personality_type FROM user_settings WHERE user_id = ?`)
      .bind(userId)
      .first<{ personality_type: string | null }>();

    return result?.personality_type || null;
  }

  private async fetchLifeDashboard(
    userId: string
  ): Promise<{ work: number; play: number; love: number; health: number } | null> {
    const result = await this.db
      .prepare(
        `SELECT life_dashboard_work, life_dashboard_play,
                life_dashboard_love, life_dashboard_health
         FROM user_profile WHERE user_id = ?`
      )
      .bind(userId)
      .first<{
        life_dashboard_work: number | null;
        life_dashboard_play: number | null;
        life_dashboard_love: number | null;
        life_dashboard_health: number | null;
      }>();

    if (!result || result.life_dashboard_work === null) return null;

    return {
      work: result.life_dashboard_work,
      play: result.life_dashboard_play || 0,
      love: result.life_dashboard_love || 0,
      health: result.life_dashboard_health || 0,
    };
  }
}
