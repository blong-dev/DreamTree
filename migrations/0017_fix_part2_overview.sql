-- Migration: Fix Part 2 overview headers (BUG-021)
--
-- Issues found:
-- 1. content_block 100345 has embedded newline: "Part 2: Trunk\nConnecting Your Past to Your Future"
--    Should be: "Part 2: Trunk"
-- 2. content_block 100346 / stem 100479 is a Table of Contents that shouldn't be displayed
--    (Users navigate via app UI, same fix applied to Part 1 in migration 0008)
-- 3. "Overview" subheader exists at sequence 480 - this is correct
--
-- Expected format after fix:
--   Part 2: Trunk (heading)
--   Overview (heading)
--   [content paragraphs...]

-- Step 1: Fix the Part 2 heading - remove embedded subtitle
UPDATE content_blocks
SET content = 'Part 2: Trunk'
WHERE id = 100345;

-- Step 2: Remove the Table of Contents stem row (don't delete content_block, just unlink from stem)
-- This removes it from the workbook flow while preserving the content for reference
DELETE FROM stem WHERE id = 100479;

-- Step 3: Deactivate the TOC content block so it's not used
UPDATE content_blocks
SET is_active = 0
WHERE id = 100346;
