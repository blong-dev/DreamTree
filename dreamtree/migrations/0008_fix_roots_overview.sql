-- Migration: Fix Roots overview content (BUG-007)
-- The content_block 100001 contained the entire Table of Contents AND Overview
-- text all in one giant "heading" block. This violates the one-at-a-time
-- conversation pattern.
--
-- FIX: Remove the Table of Contents (users navigate via app UI).
-- Keep the Overview introduction as meaningful instruction content.

-- Step 1: Fix content_block 100000 (was multi-line heading, make it clean)
UPDATE content_blocks
SET content = 'Part 1: Roots'
WHERE id = 100000;

-- Step 2: Replace the mega-block with just the Overview introduction
-- Remove TOC, keep the valuable intro paragraphs as instruction type
UPDATE content_blocks
SET content_type = 'instruction',
    content = 'The first part of the tree is the roots. The roots tell us where we came from, where we have been, and what makes us up. Understanding your roots will help them to grow, furthering the stability of your tree, allowing you to reach ever greater heights. Without our roots, we have nothing to hold us up while we reach for the sky.

Roots are hard. Factual and literal, they are a part of history. Now is not the time for conjecture, imagination, or possibilities; those will come into play later. No two root systems look the same, different people have different needs, skills, and preferences, but the basic components are the same.

With this and every activity, be honest with yourself. Honesty is always the answer. Don''t lie and don''t exaggerate. Nobody wins when you lie. Give yourself credit for the things you have done. Acknowledge even the smallest accomplishments.

Life designer Bill Burnett separates our life into four categories: love, health, work, and play. These will be our four primary roots.'
WHERE id = 100001;
