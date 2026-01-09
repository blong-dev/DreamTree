-- Migration 0006: Add missing connections for data objects
-- These connections enable data flow between exercises in Parts 1-2

-- Connection 100018: MBTI code for personality exercises 1.1.2.2-3
INSERT INTO connections (id, connection_type, data_object, transform, implementation_notes)
VALUES (100018, 'forward', 'hydrate_mbti_personality',
  '{"source": "mbti_code", "from_exercise": "1.1.2.1"}',
  'Fetch MBTI code to filter personality content in subsequent exercises');

-- Connection 100019: Soft skills for 1.1.2e ranking
INSERT INTO connections (id, connection_type, data_object, transform, implementation_notes)
VALUES (100019, 'forward', 'hydrate_soft_skills_ranked',
  '{"source": "soft_skills", "filter": "top_10", "from_module": "1.1.2"}',
  'Fetch top 10 soft skills for final ranking exercise');

-- Connection 100020: Locations for 2.4.2 work needs assessment
INSERT INTO connections (id, connection_type, data_object, transform, implementation_notes)
VALUES (100020, 'forward', 'hydrate_locations',
  '{"source": "locations", "from_exercise": "1.2.1"}',
  'Fetch location preferences for work needs comparison');

-- Connection 100021: Ideal workplace description for 2.4.2
INSERT INTO connections (id, connection_type, data_object, transform, implementation_notes)
VALUES (100021, 'forward', 'hydrate_ideal_workplace',
  '{"source": "lists", "filter": "ideal_workplace", "from_exercise": "1.2.2"}',
  'Fetch ideal workplace criteria for company evaluation');

-- Connection 100022: Ideal people profile for company research
INSERT INTO connections (id, connection_type, data_object, transform, implementation_notes)
VALUES (100022, 'forward', 'hydrate_ideal_people',
  '{"source": "lists", "filter": "ideal_people", "from_exercise": "1.2.3"}',
  'Fetch ideal colleague profile for culture evaluation');

-- Connection 100023: Budget/BATNA for negotiation prep
INSERT INTO connections (id, connection_type, data_object, transform, implementation_notes)
VALUES (100023, 'forward', 'hydrate_budget',
  '{"source": "budget", "from_exercise": "1.2.4"}',
  'Fetch budget data and BATNA for salary negotiation prep');

-- Connection 100024: Work factor rankings for 2.4.2
INSERT INTO connections (id, connection_type, data_object, transform, implementation_notes)
VALUES (100024, 'forward', 'hydrate_work_factors',
  '{"source": "lists", "filter": "work_factors", "from_exercise": "1.3.1"}',
  'Fetch work factor priority rankings for job evaluation');

-- Connection 100025: Work values statement for 2.1.3
INSERT INTO connections (id, connection_type, data_object, transform, implementation_notes)
VALUES (100025, 'forward', 'hydrate_work_values',
  '{"source": "work_values", "from_exercise": "2.1.2"}',
  'Fetch work values statement for compass integration');

-- Connection 100026: Life values statement for 2.1.3
INSERT INTO connections (id, connection_type, data_object, transform, implementation_notes)
VALUES (100026, 'forward', 'hydrate_life_values',
  '{"source": "life_values", "from_exercise": "2.1.2"}',
  'Fetch life values statement for compass integration');

-- Connection 100027: Idea trees for 2.3.2 job combining
INSERT INTO connections (id, connection_type, data_object, transform, implementation_notes)
VALUES (100027, 'forward', 'hydrate_idea_trees',
  '{"source": "idea_trees", "from_exercise": "2.3.1"}',
  'Fetch completed idea trees for job option generation');

-- Connection 100028: Career options for 2.4.x assessment
INSERT INTO connections (id, connection_type, data_object, transform, implementation_notes)
VALUES (100028, 'forward', 'hydrate_career_options',
  '{"source": "career_options", "from_exercise": "2.3.3"}',
  'Fetch three career options for timeline and assessment');

-- Connection 100029: Competency scores for profile building
INSERT INTO connections (id, connection_type, data_object, transform, implementation_notes)
VALUES (100029, 'forward', 'hydrate_competency_scores',
  '{"source": "competency_scores", "from_exercise": "2.5.1"}',
  'Fetch target competency levels for resume/LinkedIn');

-- Connection 100030: Identity story for professional content
INSERT INTO connections (id, connection_type, data_object, transform, implementation_notes)
VALUES (100030, 'forward', 'hydrate_identity_story',
  '{"source": "profile_text", "filter": "identity_story", "from_exercise": "2.5.3"}',
  'Fetch identity story for resume foundation');

-- Connection 100031: All SOARED stories for story-based exercises
INSERT INTO connections (id, connection_type, data_object, transform, implementation_notes)
VALUES (100031, 'forward', 'hydrate_all_stories',
  '{"source": "soared_stories", "from_module": "1.1"}',
  'Fetch all SOARED stories for reuse in Part 2');

-- Connection 100032: Value compass for Part 2 reference
INSERT INTO connections (id, connection_type, data_object, transform, implementation_notes)
VALUES (100032, 'forward', 'hydrate_value_compass',
  '{"source": "values_compass", "from_exercise": "2.1.3"}',
  'Fetch value compass statement for ongoing reference');

-- Connection 100033: Life dashboard for progress tracking
INSERT INTO connections (id, connection_type, data_object, transform, implementation_notes)
VALUES (100033, 'forward', 'hydrate_life_dashboard',
  '{"source": "life_dashboard", "from_exercise": "2.1.1"}',
  'Fetch life dashboard ratings for progress comparison');
