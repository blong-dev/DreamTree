/**
 * Module 1: Work Factors 1 - Skills and Talents
 * Part 1: Roots (Understanding Your Foundation)
 */

import type { ModuleConfig } from './types';

export const module1: ModuleConfig = {
  id: 1,
  title: 'Work Factors 1 - Skills and Talents',
  part: 1,
  partTitle: 'Roots',
  overview: 'Complete inventory of all skills with mastery assessment',
  estimatedTime: 120, // 2 hours

  exercises: [
    // ============================================
    // EXERCISE 1.1: Transferable Skills Inventory
    // ============================================
    {
      id: '1.1',
      title: 'Transferable Skills Inventory',
      type: 'hybrid',
      estimatedTime: 25,

      instructions: `Let's identify all your transferable skills by exploring your work history.

      We'll have a conversation about your jobs, projects, and courses, then organize everything into a structured list with mastery ratings.`,

      systemPrompt: `You are Bee, a career coach helping the user identify their transferable skills.

**Your Goals:**
1. Have them list all jobs, projects, and courses
2. For each, identify specific tasks they performed
3. Extract skills from those tasks
4. Help them grade their mastery (a-e scale: a=expert, e=beginner)

**Conversational Approach:**
- Ask open-ended questions about their work history
- Follow up on interesting details
- Help them see skills they might overlook
- Encourage specific examples rather than generic descriptions
- Probe deeper: "Tell me more about that project..."

**After 4-6 exchanges covering their work history:**
Say: "Great! I'm seeing a strong pattern here. Let me help you organize these skills into a structured format..."

Then transition to the form with skills you've extracted.

**When all goals are achieved**, end your message with:
[EXERCISE_COMPLETE]`,

      goals: [
        'List all jobs, projects, and courses',
        'Identify tasks performed in each',
        'Extract transferable skills',
        'Grade mastery level for each skill',
      ],

      conversationalGuidelines: `Be warm and encouraging. Help users recognize skills they take for granted. Ask follow-up questions about specific accomplishments.`,

      transitionLogic: {
        minExchanges: 4,
        triggerPhrase: 'organize these skills',
        extractionPrompt: `Based on our conversation, extract all transferable skills mentioned.

For each skill, suggest a mastery level based on:
- a (expert): Deep expertise, could teach others, recognized authority
- b (proficient): High competence, confident in complex situations
- c (competent): Solid ability, handles most situations well
- d (learning): Basic ability, still developing
- e (novice): Just starting, minimal experience

Return a JSON object with skills array.`,
      },

      formSchema: {
        fields: [
          {
            id: 'transferableSkills',
            type: 'textarea',
            label: 'List your transferable skills (one per line)',
            placeholder: 'Communication\nProject Management\nData Analysis\n...',
            required: true,
            validation: {
              minLength: 20,
            },
            helperText: 'List all skills you can apply across different jobs',
          },
          {
            id: 'masteryRatings',
            type: 'textarea',
            label: 'Rate each skill (a=expert, b=proficient, c=competent, d=learning, e=novice)',
            placeholder: 'Communication: b\nProject Management: c\nData Analysis: a\n...',
            required: true,
            helperText: 'Be honest - this helps identify where to focus',
          },
        ],
      },
    },

    // ============================================
    // EXERCISE 1.2: SOARED Stories
    // ============================================
    {
      id: '1.2',
      title: 'SOARED Stories',
      type: 'conversational',
      estimatedTime: 45,

      instructions: `Create 3 powerful stories about your accomplishments using the SOARED framework.

      SOARED stands for:
      - **S**ituation: Set the scene
      - **O**bstacle: What challenge did you face?
      - **A**ction: Step-by-step what you did
      - **R**esult: What happened?
      - **E**valuation: How was it received?
      - **D**iscovery: What did you learn?`,

      systemPrompt: `You are Bee, a career coach helping the user craft impactful SOARED stories.

**Process:**

1. **First, present these 9 challenge prompts** (one at a time):
   a) A time when you had an impact
   b) A time you did something no one else around could have done
   c) A time when you were genuinely excited about your work
   d) A time you overcame a significant obstacle
   e) A time you learned something important
   f) A time you led others or took initiative
   g) A time you solved a difficult problem
   h) A time you received recognition or praise
   i) A time you helped someone or made a difference

2. **Ask them to briefly describe each** (1-2 sentences per prompt)

3. **Then ask:** "Which 3 of these feel most powerful or meaningful to you?"

4. **For each chosen story, walk through SOARED:**
   - Situation: "Set the scene - where were you, what was happening?"
   - Obstacle: "What specific challenge or obstacle did you face?"
   - Action: "Walk me through exactly what you did, step by step"
   - Result: "What was the outcome? Be specific with numbers if possible"
   - Evaluation: "How was this received by others? What feedback did you get?"
   - Discovery: "Looking back, what did you learn or realize from this?"

**Coaching Tips:**
- Ask probing questions to draw out details
- Help them be specific (numbers, names, timelines)
- Encourage vulnerability and honesty
- Identify skills being demonstrated
- One story at a time - don't rush

**After completing 3 stories:**
"These stories showcase your skills beautifully. Let me identify the key skills from each story..."

**When all 3 SOARED stories are complete**, end your message with:
[EXERCISE_COMPLETE]`,

      goals: [
        'Create 3 detailed SOARED stories',
        'Identify skills demonstrated in each',
        'Develop narratives for interviews/resumes',
      ],
    },

    // ============================================
    // EXERCISE 1.3: Skills Ranking
    // ============================================
    {
      id: '1.3',
      title: 'Skills Ranking',
      type: 'form',
      estimatedTime: 15,

      instructions: `From all the skills you've identified, rank your top 10 by importance to your dream career.`,

      formSchema: {
        fields: [
          {
            id: 'topSkills',
            type: 'ranking',
            label: 'Rank your top 10 most important skills',
            required: true,
            options: [
              'Communication',
              'Leadership',
              'Problem Solving',
              'Technical Expertise',
              'Project Management',
              'Creativity',
              'Analytical Thinking',
              'Collaboration',
              'Strategic Thinking',
              'Adaptability',
            ],
            helperText: 'Most important at the top. These will guide your career direction.',
          },
        ],
      },
    },

    // ============================================
    // EXERCISE 1.4: Self-Management Skills (Soft Skills)
    // ============================================
    {
      id: '1.4',
      title: 'Self-Management Skills Assessment',
      type: 'form',
      estimatedTime: 20,

      instructions: `Understand your personality type and identify your strongest soft skills.

      First, take the personality test at **16personalities.com** to get your 4-letter type (e.g., INTJ, ENFP).`,

      formSchema: {
        fields: [
          {
            id: 'personalityType',
            type: 'text',
            label: 'Your personality type (4 letters)',
            placeholder: 'INTJ',
            required: true,
            validation: {
              pattern: '^[IE][NS][TF][JP]$',
            },
            helperText: 'From 16personalities.com (e.g., INTJ, ENFP, ISTJ)',
          },
          {
            id: 'topSoftSkills',
            type: 'multiselect',
            label: 'Select your top 10 soft skills',
            required: true,
            options: [
              'Emotional Intelligence',
              'Active Listening',
              'Empathy',
              'Patience',
              'Flexibility',
              'Time Management',
              'Conflict Resolution',
              'Decision Making',
              'Critical Thinking',
              'Attention to Detail',
              'Work Ethic',
              'Reliability',
              'Positive Attitude',
              'Self-Motivation',
              'Stress Management',
            ],
            helperText: 'Select 10 that best describe you',
          },
        ],
      },
    },

    // ============================================
    // EXERCISE 1.5: Skills with Context
    // ============================================
    {
      id: '1.5',
      title: 'Skills with Context',
      type: 'form',
      estimatedTime: 30,

      instructions: `For your top 10 skills, write descriptions that combine your transferable skills with soft skills and include specific examples.`,

      formSchema: {
        fields: [
          {
            id: 'skillDescriptions',
            type: 'textarea',
            label: 'Describe each of your top 10 skills with examples',
            placeholder: `Project Management (Leadership + Organization): Led a team of 5 to deliver website redesign 2 weeks ahead of schedule, managing $50k budget and coordinating with 3 departments...

[Continue for all 10 skills]`,
            required: true,
            validation: {
              minLength: 200,
            },
            helperText: 'Include numbers, outcomes, and what soft skills you used',
          },
        ],
      },
    },

    // ============================================
    // EXERCISE 1.6: Knowledges
    // ============================================
    {
      id: '1.6',
      title: 'Knowledge Inventory',
      type: 'form',
      estimatedTime: 25,

      instructions: `List all your areas of knowledge - from jobs, education, hobbies, and interests.`,

      formSchema: {
        fields: [
          {
            id: 'professionalKnowledge',
            type: 'textarea',
            label: 'Professional knowledge from all jobs',
            placeholder: 'Marketing automation platforms\nB2B sales processes\nFinancial reporting\n...',
            required: true,
            helperText: 'What do you know from your work experience?',
          },
          {
            id: 'educationalKnowledge',
            type: 'textarea',
            label: 'Knowledge from courses, training, degrees',
            placeholder: 'Statistics and data analysis\nPsychology principles\nGraphic design\n...',
            required: true,
            helperText: 'What did you study or learn formally?',
          },
          {
            id: 'hobbiesAndInterests',
            type: 'textarea',
            label: 'Hobbies and topics you could talk about for hours',
            placeholder: 'Sustainable agriculture\nGame design\nPhotography\n...',
            required: false,
            helperText: 'What fascinates you outside of work?',
          },
          {
            id: 'masteryLevels',
            type: 'textarea',
            label: 'Rate your mastery for each knowledge area (a-e)',
            placeholder: 'Marketing automation: b\nStatistics: c\nSustainable agriculture: d\n...',
            required: true,
            helperText: 'Same scale: a=expert, e=novice',
          },
        ],
      },
    },
  ],

  completionCriteria: {
    allExercisesComplete: true,
    minimumQualityScore: 0.5,
  },

  characterAnalysisTrigger: true,
};
