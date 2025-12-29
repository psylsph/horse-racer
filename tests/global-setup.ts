import { FullConfig } from '@playwright/test';

/**
 * Global setup for Playwright tests
 * This runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Playwright test suite...');
  console.log('📋 Test configuration:', config.projects.map(p => p.name));
  
  // Set environment for testing
  process.env.NODE_ENV = 'test';
}

export default globalSetup;
