// DreamTree Connection Resolver
// Fetches and transforms data based on connection definitions

import type { D1Database } from '@cloudflare/workers-types';
import type {
  ParsedConnection,
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
  } catch (err) {
    console.error('[ConnectionResolver] Failed to parse connection params:', err);
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

    // Fetch connection definition using actual schema columns
    const connection = await this.db
      .prepare(
        `SELECT id, connection_type, data_object, transform, implementation_notes
         FROM connections WHERE id = ?`
      )
      .bind(connectionId)
      .first<{
        id: number;
        connection_type: string;
        data_object: string;
        transform: string;
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

    const connectionType = connection.connection_type;
    const params = parseConnectionParams(connectionType, connection.transform);

    // Route to appropriate handler based on connection_type
    // Map DB connection_type to resolver methods:
    // - 'forward' → fetch and pass user data forward
    // - 'resource' → link to reference data
    // - 'internal' → same-module data reuse (treat as forward)
    // - 'backward' → reverse lookup (treat as forward)
    // - 'framework' → framework reference (treat as custom)
    switch (connectionType) {
      case 'forward':
      case 'internal':
      case 'backward':
        return this.resolveAutoPopulate<T>(
          userId,
          connectionId,
          params as AutoPopulateParams
        );

      case 'resource':
        return this.resolveReferenceLink<T>(connectionId, params);

      case 'framework':
      default:
        // Custom/framework connections return params for tool-specific handling
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

      case 'all_skills':
        return this.fetchAllSkills(userId);

      case 'knowledge_skills':
        return this.fetchKnowledgeSkills(userId);

      case 'soared_stories':
        return this.fetchSOAREDStories(userId);

      case 'experiences':
      case 'all_experiences':
        return this.fetchExperiences(userId);

      case 'employment_history':
        return this.fetchExperiences(userId, 'job');

      case 'education_history':
        return this.fetchExperiences(userId, 'education');

      case 'flow_tracking':
        return this.fetchFlowActivities(userId, params.filter);

      case 'values_compass':
        return this.fetchValuesCompass(userId);

      case 'work_values':
        return this.fetchWorkValues(userId);

      case 'life_values':
        return this.fetchLifeValues(userId);

      case 'career_options':
        return this.fetchCareerOptions(userId);

      case 'locations':
        return this.fetchLocations(userId);

      case 'budget':
        return this.fetchBudget(userId);

      case 'mbti_code':
        return this.fetchMBTICode(userId);

      case 'life_dashboard':
        return this.fetchLifeDashboard(userId);

      case 'competency_scores':
        return this.fetchCompetencyScores(userId);

      case 'idea_trees':
        return this.fetchIdeaTrees(userId);

      case 'lists':
        return this.fetchUserLists(userId, params.filter);

      case 'profile_text':
        return this.fetchProfileText(userId, params.filter);

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
    // Use parameterized query to prevent SQL injection (IMP-037)
    // Type is validated to only allow 'job' or 'education'
    const validTypes = ['job', 'education'] as const;
    const safeType = type && validTypes.includes(type) ? type : null;

    let result;
    if (safeType) {
      result = await this.db
        .prepare(
          `SELECT id, title, organization, experience_type, start_date, end_date, description
           FROM user_experiences
           WHERE user_id = ? AND experience_type = ?
           ORDER BY start_date DESC`
        )
        .bind(userId, safeType)
        .all();
    } else {
      result = await this.db
        .prepare(
          `SELECT id, title, organization, experience_type, start_date, end_date, description
           FROM user_experiences
           WHERE user_id = ?
           ORDER BY start_date DESC`
        )
        .bind(userId)
        .all();
    }

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

  private async fetchAllSkills(userId: string): Promise<RankedSkill[]> {
    const result = await this.db
      .prepare(
        `SELECT us.id, us.skill_id, s.name, us.category, us.mastery, us.rank
         FROM user_skills us
         JOIN skills s ON us.skill_id = s.id
         WHERE us.user_id = ?
         ORDER BY us.category, us.rank ASC`
      )
      .bind(userId)
      .all();

    return result.results.map((row) => ({
      id: row.id as string,
      skillId: row.skill_id as string,
      name: row.name as string,
      category: row.category as 'transferable' | 'self_management' | 'knowledge',
      mastery: row.mastery as 1 | 2 | 3 | 4 | 5,
      rank: row.rank as number,
    }));
  }

  private async fetchKnowledgeSkills(userId: string): Promise<RankedSkill[]> {
    const result = await this.db
      .prepare(
        `SELECT us.id, us.skill_id, s.name, us.category, us.mastery, us.rank
         FROM user_skills us
         JOIN skills s ON us.skill_id = s.id
         WHERE us.user_id = ? AND us.category = 'knowledge'
         ORDER BY us.rank ASC`
      )
      .bind(userId)
      .all();

    return result.results.map((row) => ({
      id: row.id as string,
      skillId: row.skill_id as string,
      name: row.name as string,
      category: 'knowledge' as const,
      mastery: row.mastery as 1 | 2 | 3 | 4 | 5,
      rank: row.rank as number,
    }));
  }

  private async fetchWorkValues(userId: string): Promise<string | null> {
    const result = await this.db
      .prepare(`SELECT work_values FROM user_values WHERE user_id = ?`)
      .bind(userId)
      .first<{ work_values: string | null }>();

    return result?.work_values || null;
  }

  private async fetchLifeValues(userId: string): Promise<string | null> {
    const result = await this.db
      .prepare(`SELECT life_values FROM user_values WHERE user_id = ?`)
      .bind(userId)
      .first<{ life_values: string | null }>();

    return result?.life_values || null;
  }

  private async fetchLocations(userId: string): Promise<Array<{ id: string; name: string; rank: number }>> {
    const result = await this.db
      .prepare(
        `SELECT id, location_name, rank
         FROM user_locations
         WHERE user_id = ?
         ORDER BY rank ASC`
      )
      .bind(userId)
      .all();

    return result.results.map((row) => ({
      id: row.id as string,
      name: row.location_name as string,
      rank: row.rank as number,
    }));
  }

  private async fetchCompetencyScores(
    userId: string
  ): Promise<Array<{ competencyId: number; level: number; notes: string | null }>> {
    const result = await this.db
      .prepare(
        `SELECT competency_id, level, notes
         FROM user_competency_scores
         WHERE user_id = ?
         ORDER BY competency_id ASC`
      )
      .bind(userId)
      .all();

    return result.results.map((row) => ({
      competencyId: row.competency_id as number,
      level: row.level as number,
      notes: row.notes as string | null,
    }));
  }

  private async fetchIdeaTrees(
    userId: string
  ): Promise<Array<{ id: string; title: string; nodes: unknown[]; edges: unknown[] }>> {
    // Fetch trees
    const trees = await this.db
      .prepare(
        `SELECT id, title, created_at
         FROM user_idea_trees
         WHERE user_id = ?
         ORDER BY created_at ASC`
      )
      .bind(userId)
      .all();

    // For each tree, fetch nodes and edges
    const result = await Promise.all(
      trees.results.map(async (tree) => {
        const treeId = tree.id as string;

        const nodes = await this.db
          .prepare(
            `SELECT id, label, x, y, parent_id
             FROM user_idea_nodes
             WHERE tree_id = ?`
          )
          .bind(treeId)
          .all();

        const edges = await this.db
          .prepare(
            `SELECT id, source_node_id, target_node_id
             FROM user_idea_edges
             WHERE tree_id = ?`
          )
          .bind(treeId)
          .all();

        return {
          id: treeId,
          title: tree.title as string,
          nodes: nodes.results,
          edges: edges.results,
        };
      })
    );

    return result;
  }

  private async fetchUserLists(
    userId: string,
    listType?: string
  ): Promise<Array<{ id: string; name: string; type: string; items: Array<{ id: string; content: string; rank: number }> }>> {
    // Use parameterized query to prevent SQL injection (IMP-038)
    // Validate listType against allowed patterns (alphanumeric + underscore only)
    const safeListType = listType && /^[a-zA-Z0-9_]+$/.test(listType) ? listType : null;

    let lists;
    if (safeListType) {
      lists = await this.db
        .prepare(
          `SELECT id, name, list_type
           FROM user_lists
           WHERE user_id = ? AND list_type = ?
           ORDER BY created_at ASC`
        )
        .bind(userId, safeListType)
        .all();
    } else {
      lists = await this.db
        .prepare(
          `SELECT id, name, list_type
           FROM user_lists
           WHERE user_id = ?
           ORDER BY created_at ASC`
        )
        .bind(userId)
        .all();
    }

    // For each list, fetch items
    const result = await Promise.all(
      lists.results.map(async (list) => {
        const listId = list.id as string;

        const items = await this.db
          .prepare(
            `SELECT id, content, rank
             FROM user_list_items
             WHERE list_id = ?
             ORDER BY rank ASC`
          )
          .bind(listId)
          .all();

        return {
          id: listId,
          name: list.name as string,
          type: list.list_type as string,
          items: items.results.map((item) => ({
            id: item.id as string,
            content: item.content as string,
            rank: item.rank as number,
          })),
        };
      })
    );

    return result;
  }

  private async fetchProfileText(
    userId: string,
    field?: string
  ): Promise<Record<string, string | null> | string | null> {
    // If specific field requested, return just that
    if (field) {
      const validFields = [
        'identity_story',
        'allegory',
        'headline',
        'summary',
        'value_proposition',
      ];
      if (!validFields.includes(field)) return null;

      const result = await this.db
        .prepare(`SELECT ${field} FROM user_profile WHERE user_id = ?`)
        .bind(userId)
        .first<Record<string, string | null>>();

      return result?.[field] || null;
    }

    // Otherwise return all profile text fields
    const result = await this.db
      .prepare(
        `SELECT identity_story, allegory, headline, summary, value_proposition
         FROM user_profile WHERE user_id = ?`
      )
      .bind(userId)
      .first<{
        identity_story: string | null;
        allegory: string | null;
        headline: string | null;
        summary: string | null;
        value_proposition: string | null;
      }>();

    if (!result) return null;

    return {
      identityStory: result.identity_story,
      allegory: result.allegory,
      headline: result.headline,
      summary: result.summary,
      valueProposition: result.value_proposition,
    };
  }
}
