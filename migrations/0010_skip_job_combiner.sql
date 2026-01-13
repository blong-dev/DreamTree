-- Skip job_combiner tool (100011) until component is built
-- This allows E2E walkthrough to pass while we build the component separately

-- Delete the job_combiner rows from stem
-- We can restore them later when the component is ready

DELETE FROM stem
WHERE content_id = 100011
  AND block_type = 'tool';

-- Verify: SELECT COUNT(*) FROM stem WHERE content_id = 100011;
-- Expected: 0 rows
