/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/modules/core/$1',
    '^@auth/(.*)$': '<rootDir>/src/modules/auth/$1',
    '^@habits/(.*)$': '<rootDir>/src/modules/habits/$1',
    '^@checkin/(.*)$': '<rootDir>/src/modules/check-in/$1',
    '^@commitment/(.*)$': '<rootDir>/src/modules/commitment/$1',
    '^@progression/(.*)$': '<rootDir>/src/modules/progression/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@tasks/(.*)$': '<rootDir>/src/modules/tasks/$1',
    '^@pomodoro/(.*)$': '<rootDir>/src/modules/pomodoro/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { strict: true, jsx: 'react-jsx' } }],
  },
};
