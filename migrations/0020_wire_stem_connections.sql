-- Wire up all stem connection_ids from planning CSV (stem_UPDATED.csv)
-- This applies the 16 connection_id values specified in the spec

-- Part 1 Module 1 - Transferable Skills exercises
UPDATE stem SET connection_id = 100000 WHERE id = 100028;  -- 1.1.1 activity 2: list_builder hydrate experiences
UPDATE stem SET connection_id = 100001 WHERE id = 100030;  -- 1.1.1 activity 3: list_builder hydrate transferable skills
UPDATE stem SET connection_id = 100002 WHERE id = 100033;  -- 1.1.2 activity 1: prompt hydrate skills for mastery
UPDATE stem SET connection_id = 100003 WHERE id = 100059;  -- 1.1.3 activity 2: soared_form story 1 selection
UPDATE stem SET connection_id = 100004 WHERE id = 100060;  -- 1.1.3 activity 3: soared_form story 2 selection
UPDATE stem SET connection_id = 100005 WHERE id = 100061;  -- 1.1.3 activity 4: soared_form story 3 selection
UPDATE stem SET connection_id = 100006 WHERE id = 100063;  -- 1.1.4: list_builder skills mapping to stories
UPDATE stem SET connection_id = 100012 WHERE id = 100064;  -- 1.1.5: connection row for forward ref
UPDATE stem SET connection_id = 100007 WHERE id = 100067;  -- 1.1.7: ranking_grid top 10 skills

-- Part 1 additional connections
UPDATE stem SET connection_id = 100008 WHERE id = 100109;  -- prompt: MBTI code
UPDATE stem SET connection_id = 100009 WHERE id = 100115;  -- prompt: soft skills ranking
UPDATE stem SET connection_id = 100010 WHERE id = 100131;  -- 1.1.3 activity 1: experiences for knowledge inventory
UPDATE stem SET connection_id = 100011 WHERE id = 100154;  -- 1.2.0: knowledge skills for ideation

-- Part 1 Module 2 - additional
UPDATE stem SET connection_id = 100013 WHERE id = 100206;  -- 1.2.0 activity 1: content forward ref

-- Part 2 connections
UPDATE stem SET connection_id = 100014 WHERE id = 100650;  -- 2.3.1: connection row for flow activities
UPDATE stem SET connection_id = 100015 WHERE id = 100766;  -- 2.5.0: content hydrate for career options
