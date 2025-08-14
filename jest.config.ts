import { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/apps', '<rootDir>/libs'],
  moduleNameMapper: {
    '^@pantohealth/config$': '<rootDir>/libs/config/src',
    '^@pantohealth/config/(.*)$': '<rootDir>/libs/config/src/$1',
    '^@pantohealth/dtos$': '<rootDir>/libs/dtos/src',
    '^@pantohealth/dtos/(.*)$': '<rootDir>/libs/dtos/src/$1',
  },
  testMatch: ['**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
};

export default config;
