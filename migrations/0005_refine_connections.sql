-- Migration 0005: Refine connections 100000-100011 with proper transform params
-- These connections currently have vague "instructions" arrays that need proper source/filter params

-- Connection 100000: Used in 1.1.1.2 for list_builder - needs experiences from 1.1.1.1
UPDATE connections SET
  connection_type = 'forward',
  data_object = 'hydrate_experiences',
  transform = '{"source": "experiences", "from_exercise": "1.1.1.1"}'
WHERE id = 100000;

-- Connection 100001: Used in 1.1.1.3 for list_builder - needs transferable skills
UPDATE connections SET
  connection_type = 'forward',
  data_object = 'hydrate_transferable_skills',
  transform = '{"source": "transferable_skills", "from_exercise": "1.1.1.2"}'
WHERE id = 100001;

-- Connection 100002: Used for skill mastery rating
UPDATE connections SET
  connection_type = 'forward',
  data_object = 'hydrate_skills_for_mastery',
  transform = '{"source": "transferable_skills", "from_exercise": "1.1.1.3"}'
WHERE id = 100002;

-- Connection 100003: SOARED story 1 selection
UPDATE connections SET
  connection_type = 'forward',
  data_object = 'hydrate_soared_story_1',
  transform = '{"source": "soared_stories", "from_exercise": "1.1.1.3", "filter": "index_0"}'
WHERE id = 100003;

-- Connection 100004: SOARED story 2 selection
UPDATE connections SET
  connection_type = 'forward',
  data_object = 'hydrate_soared_story_2',
  transform = '{"source": "soared_stories", "from_exercise": "1.1.1.3", "filter": "index_1"}'
WHERE id = 100004;

-- Connection 100005: SOARED story 3 selection
UPDATE connections SET
  connection_type = 'forward',
  data_object = 'hydrate_soared_story_3',
  transform = '{"source": "soared_stories", "from_exercise": "1.1.1.3", "filter": "index_2"}'
WHERE id = 100005;

-- Connection 100006: Skills mapping to SOARED stories
UPDATE connections SET
  connection_type = 'forward',
  data_object = 'hydrate_stories_for_skills',
  transform = '{"source": "soared_stories", "from_module": "1.1"}'
WHERE id = 100006;

-- Connection 100007: Top 10 transferable skills for bucketing/ranking
UPDATE connections SET
  connection_type = 'forward',
  data_object = 'hydrate_top_skills_for_ranking',
  transform = '{"source": "transferable_skills", "filter": "top_10_by_mastery", "from_module": "1.1"}'
WHERE id = 100007;

-- Connection 100008: MBTI code for personality content
UPDATE connections SET
  connection_type = 'forward',
  data_object = 'hydrate_mbti_code',
  transform = '{"source": "mbti_code", "from_exercise": "1.1.2.1"}'
WHERE id = 100008;

-- Connection 100009: Soft skills for ranking grid
UPDATE connections SET
  connection_type = 'forward',
  data_object = 'hydrate_soft_skills',
  transform = '{"source": "soft_skills", "from_module": "1.1.2"}'
WHERE id = 100009;

-- Connection 100010: Experiences for knowledge inventory editing
UPDATE connections SET
  connection_type = 'forward',
  data_object = 'hydrate_experiences_for_knowledge',
  transform = '{"source": "experiences", "from_module": "1.1"}'
WHERE id = 100010;

-- Connection 100011: Knowledge skills for ideation
UPDATE connections SET
  connection_type = 'forward',
  data_object = 'hydrate_knowledge_skills',
  transform = '{"source": "knowledge_skills", "from_module": "1.1.3"}'
WHERE id = 100011;
