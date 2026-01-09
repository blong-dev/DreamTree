-- Migration 0007: Update stem connection_ids for tools that need prior data
-- This sets connection_id on tool rows that should receive hydrated data

-- Part 2, Module 3, Exercise 2: Idea Tree needs flow activities (high energy/focus)
UPDATE stem SET connection_id = 100014
WHERE id = '100653'
  AND block_type = 'tool'
  AND content_id = 100010;

-- Part 2, Module 3, Exercise 7: Job Combiner needs idea trees
UPDATE stem SET connection_id = 100027
WHERE id = '100674'
  AND block_type = 'tool'
  AND content_id = 100011;

-- Part 2, Module 4: Career Timeline needs career options
UPDATE stem SET connection_id = 100028
WHERE id = '100702'
  AND block_type = 'tool'
  AND content_id = 100012;

-- Part 1, Module 2: MBTI-related exercises need MBTI code
-- Ranking grid in 1.2 that uses MBTI context
UPDATE stem SET connection_id = 100018
WHERE part = 1
  AND module = 2
  AND block_type = 'tool'
  AND content_id = 100003
  AND connection_id IS NULL;

-- Part 1, Module 2: Budget calculator might need experiences list
UPDATE stem SET connection_id = 100017
WHERE id = '100262'
  AND block_type = 'tool'
  AND content_id = 100005;

-- Part 1, Module 3: Work factor ranking needs skills context
UPDATE stem SET connection_id = 100012
WHERE id = '100286'
  AND block_type = 'tool'
  AND content_id = 100003;

-- Note: Many list_builder instances (100000) don't need connections because they're
-- creating new data, not consuming prior data. Only tools that REUSE earlier data
-- should have connection_id set.
