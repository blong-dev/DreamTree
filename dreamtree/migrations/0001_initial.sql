-- DreamTree Database Schema
-- Version: 1.0
-- Tables: 40
-- Created: 2026-01-07

-- ============================================================
-- REFERENCE TABLES (no dependencies)
-- ============================================================

-- 5.1 personality_types (16 MBTI types)
CREATE TABLE personality_types (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    summary TEXT NOT NULL
);

-- 5.2 competencies (15 OECD competencies)
CREATE TABLE competencies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    definition TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('delivery', 'interpersonal', 'strategic')),
    sort_order INTEGER NOT NULL,
    relevant_modules TEXT
);

CREATE INDEX idx_competencies_category ON competencies(category, sort_order);

-- 5.3 competency_levels (75 rows: 15 competencies × 5 levels)
CREATE TABLE competency_levels (
    id TEXT PRIMARY KEY,
    competency_id TEXT NOT NULL,
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
    description TEXT NOT NULL,
    job_context TEXT,
    UNIQUE(competency_id, level),
    FOREIGN KEY (competency_id) REFERENCES competencies(id)
);

CREATE INDEX idx_competency_levels_competency ON competency_levels(competency_id);

-- 6.1 references (bibliography)
CREATE TABLE "references" (
    id TEXT PRIMARY KEY,
    citation_number INTEGER NOT NULL UNIQUE,
    author_surname TEXT NOT NULL,
    full_citation TEXT NOT NULL,
    short_citation TEXT NOT NULL,
    category TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX idx_references_citation_number ON "references"(citation_number);
CREATE INDEX idx_references_author_surname ON "references"(author_surname);

-- ============================================================
-- CORE TABLES
-- ============================================================

-- 2.1 users
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    is_anonymous INTEGER NOT NULL DEFAULT 1,
    workbook_complete INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 5.4 skills (master list + user custom)
CREATE TABLE skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('transferable', 'self_management', 'knowledge') OR category IS NULL),
    is_custom INTEGER NOT NULL DEFAULT 0,
    created_by TEXT,
    review_status TEXT CHECK (review_status IN ('pending', 'approved', 'rejected') OR review_status IS NULL),
    created_at TEXT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_skills_review ON skills(review_status) WHERE is_custom = 1;

-- 2.2 auth
CREATE TABLE auth (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    password_hash TEXT,
    wrapped_data_key TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_auth_user_id ON auth(user_id);

-- 2.3 emails
CREATE TABLE emails (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    is_active INTEGER NOT NULL DEFAULT 1,
    added_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_emails_user_id ON emails(user_id);

-- 2.4 sessions
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- 2.5 user_settings
CREATE TABLE user_settings (
    user_id TEXT PRIMARY KEY,
    background_color TEXT NOT NULL DEFAULT 'ivory',
    text_color TEXT NOT NULL DEFAULT 'charcoal',
    font TEXT NOT NULL DEFAULT 'inter',
    personality_type TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (personality_type) REFERENCES personality_types(code)
);

-- 2.6 user_modules
CREATE TABLE user_modules (
    user_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    first_completed_at TEXT NOT NULL,
    last_modified_at TEXT NOT NULL,
    PRIMARY KEY (user_id, module_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- USER DATA TABLES (Tier 1)
-- ============================================================

-- 3.1 user_profile
CREATE TABLE user_profile (
    user_id TEXT PRIMARY KEY,
    headline TEXT,
    summary TEXT,
    identity_story TEXT,
    allegory TEXT,
    value_proposition TEXT,
    life_dashboard_work INTEGER CHECK (life_dashboard_work BETWEEN 1 AND 10),
    life_dashboard_play INTEGER CHECK (life_dashboard_play BETWEEN 1 AND 10),
    life_dashboard_love INTEGER CHECK (life_dashboard_love BETWEEN 1 AND 10),
    life_dashboard_health INTEGER CHECK (life_dashboard_health BETWEEN 1 AND 10),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3.2 user_values
CREATE TABLE user_values (
    user_id TEXT PRIMARY KEY,
    work_values TEXT,
    life_values TEXT,
    compass_statement TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3.3 user_skills
CREATE TABLE user_skills (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    category TEXT CHECK (category IN ('transferable', 'self_management', 'knowledge')),
    mastery INTEGER CHECK (mastery BETWEEN 1 AND 5),
    evidence TEXT,
    rank INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);

CREATE INDEX idx_user_skills_user ON user_skills(user_id);
CREATE INDEX idx_user_skills_category ON user_skills(user_id, category);
CREATE INDEX idx_user_skills_rank ON user_skills(user_id, rank) WHERE rank IS NOT NULL;

-- 3.5 user_experiences (before user_stories due to FK)
CREATE TABLE user_experiences (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    organization TEXT,
    experience_type TEXT CHECK (experience_type IN ('job', 'education', 'project', 'other')),
    start_date TEXT,
    end_date TEXT,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_experiences_user ON user_experiences(user_id);
CREATE INDEX idx_user_experiences_type ON user_experiences(user_id, experience_type);

-- 3.4 user_stories
CREATE TABLE user_stories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    experience_id TEXT,
    title TEXT,
    situation TEXT,
    obstacle TEXT,
    action TEXT,
    result TEXT,
    evaluation TEXT,
    discovery TEXT,
    story_type TEXT CHECK (story_type IN ('challenge', 'reframe', 'other')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (experience_id) REFERENCES user_experiences(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_stories_user ON user_stories(user_id);
CREATE INDEX idx_user_stories_type ON user_stories(user_id, story_type);

-- 3.6 user_experience_skills
CREATE TABLE user_experience_skills (
    id TEXT PRIMARY KEY,
    experience_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(experience_id, skill_id),
    FOREIGN KEY (experience_id) REFERENCES user_experiences(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);

CREATE INDEX idx_user_experience_skills_experience ON user_experience_skills(experience_id);
CREATE INDEX idx_user_experience_skills_skill ON user_experience_skills(skill_id);

-- 3.7 user_locations
CREATE TABLE user_locations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    rank INTEGER,
    traits_liked TEXT,
    traits_disliked TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_locations_user ON user_locations(user_id);
CREATE INDEX idx_user_locations_rank ON user_locations(user_id, rank) WHERE rank IS NOT NULL;

-- 3.8 user_career_options
CREATE TABLE user_career_options (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    rank INTEGER CHECK (rank BETWEEN 1 AND 3),
    coherence_score INTEGER,
    work_needs_score INTEGER,
    life_needs_score INTEGER,
    unknowns_score INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_career_options_user ON user_career_options(user_id);

-- 3.9 user_budget (PII - encrypted at rest)
CREATE TABLE user_budget (
    user_id TEXT PRIMARY KEY,
    monthly_expenses INTEGER,
    annual_needs INTEGER,
    hourly_batna INTEGER,
    benefits_needed TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3.10 user_flow_logs
CREATE TABLE user_flow_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    activity TEXT NOT NULL,
    energy INTEGER CHECK (energy BETWEEN -2 AND 2),
    focus INTEGER CHECK (focus BETWEEN 1 AND 5),
    logged_date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_flow_logs_user ON user_flow_logs(user_id);
CREATE INDEX idx_user_flow_logs_date ON user_flow_logs(user_id, logged_date);

-- 3.11 user_companies
CREATE TABLE user_companies (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT,
    research_notes TEXT,
    url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_companies_user ON user_companies(user_id);
CREATE INDEX idx_user_companies_status ON user_companies(user_id, status);

-- 3.12 user_contacts (PII - encrypted at rest)
CREATE TABLE user_contacts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    company_id TEXT,
    name TEXT NOT NULL,
    title TEXT,
    relationship_status TEXT,
    notes TEXT,
    linkedin_url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES user_companies(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_contacts_user ON user_contacts(user_id);
CREATE INDEX idx_user_contacts_company ON user_contacts(company_id);

-- 3.13 user_jobs
CREATE TABLE user_jobs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    company_id TEXT,
    title TEXT NOT NULL,
    posting_url TEXT,
    application_status TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES user_companies(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_jobs_user ON user_jobs(user_id);
CREATE INDEX idx_user_jobs_company ON user_jobs(company_id);
CREATE INDEX idx_user_jobs_status ON user_jobs(user_id, application_status);

-- 3.15 user_idea_nodes (before user_idea_trees due to FK)
CREATE TABLE user_idea_nodes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(user_id, content),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_idea_nodes_user ON user_idea_nodes(user_id);

-- 3.14 user_idea_trees
CREATE TABLE user_idea_trees (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT,
    root_node_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (root_node_id) REFERENCES user_idea_nodes(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_idea_trees_user ON user_idea_trees(user_id);

-- 3.16 user_idea_edges
CREATE TABLE user_idea_edges (
    id TEXT PRIMARY KEY,
    tree_id TEXT NOT NULL,
    from_node_id TEXT NOT NULL,
    to_node_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(tree_id, from_node_id, to_node_id),
    FOREIGN KEY (tree_id) REFERENCES user_idea_trees(id) ON DELETE CASCADE,
    FOREIGN KEY (from_node_id) REFERENCES user_idea_nodes(id) ON DELETE CASCADE,
    FOREIGN KEY (to_node_id) REFERENCES user_idea_nodes(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_idea_edges_tree ON user_idea_edges(tree_id);
CREATE INDEX idx_user_idea_edges_from ON user_idea_edges(from_node_id);
CREATE INDEX idx_user_idea_edges_to ON user_idea_edges(to_node_id);

-- 3.17 user_competency_scores
CREATE TABLE user_competency_scores (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    competency_id TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
    assessed_at TEXT NOT NULL,
    UNIQUE(user_id, competency_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (competency_id) REFERENCES competencies(id)
);

CREATE INDEX idx_user_competency_scores_user ON user_competency_scores(user_id);

-- ============================================================
-- USER DATA TABLES (Tier 2)
-- ============================================================

-- 4.4 tools (before prompts due to FK in connections)
CREATE TABLE tools (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    icon_name TEXT,
    has_reminder INTEGER NOT NULL DEFAULT 0,
    reminder_frequency TEXT CHECK (reminder_frequency IN ('daily', 'weekly', 'monthly') OR reminder_frequency IS NULL),
    reminder_prompt TEXT,
    unlocks_at_exercise TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_tools_name ON tools(name);
CREATE INDEX idx_tools_reminder ON tools(has_reminder, reminder_frequency);

-- 4.2 content_blocks
CREATE TABLE content_blocks (
    id INTEGER PRIMARY KEY,
    content_type TEXT NOT NULL CHECK (content_type IN ('heading', 'instruction', 'note', 'quote', 'transition', 'celebration')),
    content TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_content_blocks_type ON content_blocks(content_type);
CREATE INDEX idx_content_blocks_active ON content_blocks(is_active);

-- 4.3 prompts
CREATE TABLE prompts (
    id INTEGER PRIMARY KEY,
    prompt_text TEXT NOT NULL,
    input_type TEXT NOT NULL CHECK (input_type IN ('text_input', 'textarea', 'slider', 'checkbox', 'checkbox_group', 'radio', 'select')),
    input_config TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_prompts_type ON prompts(input_type);
CREATE INDEX idx_prompts_active ON prompts(is_active);

-- 3.18 user_responses
CREATE TABLE user_responses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    prompt_id INTEGER NOT NULL,
    exercise_id TEXT,
    activity_id TEXT,
    response_text TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id)
);

CREATE INDEX idx_user_responses_user ON user_responses(user_id);
CREATE INDEX idx_user_responses_prompt ON user_responses(user_id, prompt_id);
CREATE INDEX idx_user_responses_exercise ON user_responses(user_id, exercise_id);

-- 3.19 user_lists
CREATE TABLE user_lists (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    context TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_lists_user ON user_lists(user_id);

-- 3.20 user_list_items
CREATE TABLE user_list_items (
    id TEXT PRIMARY KEY,
    list_id TEXT NOT NULL,
    content TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (list_id) REFERENCES user_lists(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_list_items_list ON user_list_items(list_id);

-- 3.21 user_checklists
CREATE TABLE user_checklists (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    prompt_id INTEGER NOT NULL,
    exercise_id TEXT,
    checked INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id)
);

CREATE INDEX idx_user_checklists_user ON user_checklists(user_id);
CREATE INDEX idx_user_checklists_exercise ON user_checklists(user_id, exercise_id);

-- ============================================================
-- CONTENT TABLES
-- ============================================================

-- 4.5 connections
CREATE TABLE connections (
    id INTEGER PRIMARY KEY,
    source_block_id INTEGER,
    target_block_id INTEGER,
    source_location TEXT,
    target_location TEXT,
    connection_type TEXT NOT NULL CHECK (connection_type IN ('forward', 'backward', 'internal', 'resource', 'framework')),
    data_object TEXT,
    source_tool_id INTEGER,
    transform TEXT,
    implementation_notes TEXT,
    FOREIGN KEY (source_block_id) REFERENCES content_blocks(id),
    FOREIGN KEY (target_block_id) REFERENCES content_blocks(id),
    FOREIGN KEY (source_tool_id) REFERENCES tools(id)
);

CREATE INDEX idx_connections_source ON connections(source_block_id);
CREATE INDEX idx_connections_target ON connections(target_block_id);
CREATE INDEX idx_connections_type ON connections(connection_type);

-- 4.1 stem (backbone table)
CREATE TABLE stem (
    id INTEGER PRIMARY KEY,
    part INTEGER NOT NULL,
    module INTEGER NOT NULL,
    exercise INTEGER NOT NULL,
    activity INTEGER NOT NULL,
    sequence INTEGER NOT NULL UNIQUE,
    block_type TEXT NOT NULL CHECK (block_type IN ('content', 'prompt', 'tool')),
    content_id INTEGER,
    connection_id INTEGER,
    FOREIGN KEY (connection_id) REFERENCES connections(id)
);

CREATE INDEX idx_stem_sequence ON stem(sequence);
CREATE INDEX idx_stem_location ON stem(part, module, exercise, activity);
CREATE INDEX idx_stem_block_type ON stem(block_type, content_id);

-- 4.6 data_objects
CREATE TABLE data_objects (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    created_in TEXT NOT NULL,
    reused_in TEXT,
    data_type TEXT NOT NULL,
    implementation_notes TEXT
);

CREATE INDEX idx_data_objects_name ON data_objects(name);

-- 4.7 ongoing_practices
CREATE TABLE ongoing_practices (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    established_in TEXT NOT NULL,
    used_by TEXT,
    frequency TEXT NOT NULL,
    purpose TEXT
);

-- ============================================================
-- ATTRIBUTION TABLES
-- ============================================================

-- 6.2 content_sources
CREATE TABLE content_sources (
    id TEXT PRIMARY KEY,
    exercise_id TEXT NOT NULL,
    reference_id TEXT NOT NULL,
    usage_type TEXT NOT NULL CHECK (usage_type IN ('direct_quote', 'framework', 'concept', 'adaptation', 'inspiration')),
    notes TEXT,
    FOREIGN KEY (reference_id) REFERENCES "references"(id)
);

CREATE INDEX idx_content_sources_exercise ON content_sources(exercise_id);
CREATE INDEX idx_content_sources_reference ON content_sources(reference_id);

-- ============================================================
-- END OF SCHEMA
-- 40 tables created
-- ============================================================
