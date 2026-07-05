import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Carga .env.test si existe; los valores se leen con process.env en los specs
dotenv.config({ path: '.env.test' });

export default defineConfig({
  globalSetup: './tests/global-setup.ts',
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
