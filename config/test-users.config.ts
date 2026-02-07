export interface TestUser {
  username: string;
  password: string;
  type: 'standard' | 'locked' | 'problem' | 'performance' | 'error' | 'visual';
  description: string;
}

export const TEST_USERS: Record<string, TestUser> = {
  standard: {
    username: process.env.TEST_USER_STANDARD || 'standard_user',
    password: process.env.TEST_PASSWORD || 'secret_sauce',
    type: 'standard',
    description: 'Standard user with full access',
  },
  locked: {
    username: process.env.TEST_USER_LOCKED || 'locked_out_user',
    password: process.env.TEST_PASSWORD || 'secret_sauce',
    type: 'locked',
    description: 'Locked out user - login should fail',
  },
  problem: {
    username: process.env.TEST_USER_PROBLEM || 'problem_user',
    password: process.env.TEST_PASSWORD || 'secret_sauce',
    type: 'problem',
    description: 'Problem user - images are broken',
  },
  performance: {
    username: process.env.TEST_USER_PERFORMANCE || 'performance_glitch_user',
    password: process.env.TEST_PASSWORD || 'secret_sauce',
    type: 'performance',
    description: 'Performance glitch user - slow responses',
  },
  error: {
    username: process.env.TEST_USER_ERROR || 'error_user',
    password: process.env.TEST_PASSWORD || 'secret_sauce',
    type: 'error',
    description: 'Error user - triggers various errors',
  },
  visual: {
    username: process.env.TEST_USER_VISUAL || 'visual_user',
    password: process.env.TEST_PASSWORD || 'secret_sauce',
    type: 'visual',
    description: 'Visual user - UI inconsistencies',
  },
};

export const DEFAULT_USER = TEST_USERS.standard;
