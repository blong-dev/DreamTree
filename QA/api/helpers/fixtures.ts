// Test Data Fixtures

/**
 * Generate unique test user data
 */
export function createTestUserData() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return {
    email: `test-${timestamp}-${random}@dreamtree-qa.test`,
    password: 'TestPassword123!',
    name: `Test User ${timestamp}`,
  };
}

/**
 * Sample prompt responses for testing
 */
export const samplePromptResponses = {
  textarea: 'This is a test response for a textarea prompt.',
  checkbox: true,
  slider: 5,
  radio: 'option_1',
  select: 'selected_option',
};

/**
 * Sample tool responses for testing
 */
export const sampleToolResponses = {
  list_builder: {
    items: ['Item 1', 'Item 2', 'Item 3'],
  },
  ranking_grid: {
    rankings: [
      { id: 1, rank: 1 },
      { id: 2, rank: 2 },
    ],
  },
  soared_form: {
    situation: 'Test situation',
    obstacle: 'Test obstacle',
    action: 'Test action',
    result: 'Test result',
    emotions: 'Test emotions',
    discovered: 'Test discovery',
  },
};

/**
 * Valid exercise IDs for testing
 */
export const validExerciseIds = [
  '1.1.1',
  '1.1.2',
  '1.2.1',
  '2.1.1',
];

/**
 * Invalid exercise IDs for error testing
 */
export const invalidExerciseIds = [
  'invalid',
  '9.9.9',
  '0.0.0',
  'abc.def.ghi',
];
