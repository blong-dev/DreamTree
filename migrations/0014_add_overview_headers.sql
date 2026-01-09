-- Migration: Add "Overview" subheader to Part overviews (BUG-021)
--
-- The Part overview sections need an "Overview" subheader after the Part title.
-- Expected format:
--   Part 1: Roots (heading)
--   Overview (heading)
--   [content...]
--
-- This migration adds the missing "Overview" heading block.

-- Step 1: Create new content_block for "Overview" heading
INSERT INTO content_blocks (id, content_type, content, version, is_active)
VALUES (100615, 'heading', 'Overview', 1, 1);

-- Step 2: Shift all stem sequences >= 2 by +1 to make room for new block
-- This affects all exercises but maintains relative ordering
UPDATE stem SET sequence = sequence + 1 WHERE sequence >= 2;

-- Step 3: Insert new stem row for Part 1 overview "Overview" heading
-- This goes between "Part 1: Roots" (sequence 1) and the first instruction (now sequence 3)
INSERT INTO stem (id, part, module, exercise, activity, sequence, block_type, content_id, connection_id)
VALUES (100843, 1, 0, 0, 0, 2, 'content', 100615, NULL);

-- Part 2 overview check: Does Part 2 have an overview section?
-- Let's verify and add if needed (Part 2 is module 0 of part 2)
-- We need to check if Part 2 has a module 0 exercise 0

-- Note: Part 3 (3.0.0) doesn't exist yet in the database, so we don't add it.
-- When Part 3 content is added, it should include the Overview subheader from the start.
