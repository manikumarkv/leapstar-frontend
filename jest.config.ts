import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/js-with-babel-esm',
  rootDir: '.',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^[.][.]/config/env(?:[.]js)?$': '<rootDir>/tests/mocks/configEnv.ts',
    '^.+\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^(\\.{1,2}/.*)(?<![cm])\\.js$': '$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }],
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
};

export default config;
