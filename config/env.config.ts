import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export type Environment = 'dev' | 'staging' | 'prod';

export interface EnvironmentConfig {
  baseURL: string;
  apiBaseURL: string;
  timeout: number;
  expectTimeout: number;
  retries: number;
  workers: number;
  headless: boolean;
  slowMo: number;
  screenshotOnFailure: boolean;
  videoOnFailure: boolean;
  traceOnFailure: boolean;
}

const environments: Record<Environment, EnvironmentConfig> = {
  dev: {
    baseURL: process.env.BASE_URL_DEV || 'https://www.saucedemo.com',
    apiBaseURL: process.env.API_BASE_URL || 'https://reqres.in/api',
    timeout: 30000,
    expectTimeout: 10000,
    retries: 1,
    workers: 4,
    headless: true,
    slowMo: 0,
    screenshotOnFailure: true,
    videoOnFailure: true,
    traceOnFailure: true,
  },
  staging: {
    baseURL: process.env.BASE_URL_STAGING || 'https://www.saucedemo.com',
    apiBaseURL: process.env.API_BASE_URL || 'https://reqres.in/api',
    timeout: 30000,
    expectTimeout: 10000,
    retries: 2,
    workers: 4,
    headless: true,
    slowMo: 0,
    screenshotOnFailure: true,
    videoOnFailure: true,
    traceOnFailure: true,
  },
  prod: {
    baseURL: process.env.BASE_URL_PROD || 'https://www.saucedemo.com',
    apiBaseURL: process.env.API_BASE_URL || 'https://reqres.in/api',
    timeout: 45000,
    expectTimeout: 15000,
    retries: 3,
    workers: 2,
    headless: true,
    slowMo: 0,
    screenshotOnFailure: true,
    videoOnFailure: false,
    traceOnFailure: true,
  },
};

export function getEnvConfig(): EnvironmentConfig {
  const env = (process.env.TEST_ENV as Environment) || 'staging';
  const config = environments[env];
  if (!config) {
    throw new Error(
      `Unknown environment: ${env}. Available: ${Object.keys(environments).join(', ')}`,
    );
  }
  return config;
}

export const ENV = getEnvConfig();
