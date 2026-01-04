-- ============================================
-- USER DATA TABLES
-- ============================================

-- --------------------------------------------
-- TIER 1: Dedicated tables
-- --------------------------------------------

-- Key outputs, single row per user
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

-- Values statements, referenced in career decisions
CREATE TABLE user_values (
    user_id TEXT PRIMARY KEY,
    work_values TEXT,
    life_values TEXT,
    compass_statement TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Skills with mastery and optional ranking
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

-- SOARED stories
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

-- Jobs, education, projects — resume source
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

-- Junction: experiences ↔ skills
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

-- Ranked location preferences
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

-- Career options with assessment scores
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

-- Budget and BATNA
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

-- Daily flow tracking
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

-- Target companies
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

-- Networking contacts
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

-- Job applications
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

-- Idea tree containers
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

-- Idea nodes (unique per user)
CREATE TABLE user_idea_nodes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(user_id, content),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_idea_nodes_user ON user_idea_nodes(user_id);

-- Idea edges (graph connections per tree)
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


-- --------------------------------------------
-- TIER 2: Generic tables
-- --------------------------------------------

-- Catch-all for text prompt responses
CREATE TABLE user_responses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    prompt_id TEXT NOT NULL,
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

-- Named list containers
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

-- List items with ordering
CREATE TABLE user_list_items (
    id TEXT PRIMARY KEY,
    list_id TEXT NOT NULL,
    content TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (list_id) REFERENCES user_lists(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_list_items_list ON user_list_items(list_id);

-- Checkbox completion tracking
CREATE TABLE user_checklists (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    prompt_id TEXT NOT NULL,
    exercise_id TEXT,
    checked INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id)
);

CREATE INDEX idx_user_checklists_user ON user_checklists(user_id);
CREATE INDEX idx_user_checklists_exercise ON user_checklists(user_id, exercise_id);