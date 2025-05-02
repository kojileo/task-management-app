const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // next.config.jsとは異なり、テスト環境のNext.jsの設定を提供するため
  dir: './',
});

// Jestに渡すカスタム設定
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // モジュールエイリアスの設定
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/app/api/**/*',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      lines: 50, // ラインカバレッジ目標
      branches: 40, // 分岐カバレッジ目標
      functions: 50,
      statements: 50,
    },
  },
  testMatch: [
    '<rootDir>/src/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.spec.{js,jsx,ts,tsx}',
  ],
};

// createJestConfigは、Next.jsの設定を組み込んだJestの設定を生成します
module.exports = createJestConfig(customJestConfig); 