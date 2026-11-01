import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'fs';

// Load local settings from .env if present (built into Node 20.12+, no dotenv needed).
// In CI, set these as environment variables instead.
if (existsSync('.env')) process.loadEnvFile('.env');

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,          // fail CI if a test.only is left in
  retries: isCI ? 2 : 0,     // retry only in CI, so local flakiness stays visible
  workers: isCI ? 1 : undefined,
  timeout: 30_000,           // max time for one test
  expect: { timeout: 5_000 },

  reporter: isCI
    ? [
        ['list'],                                 // readable progress in the CI log
        ['github'],                               // failures shown as annotations on the run page
        // Raw results; the CI "Test report" job merges these from all jobs into one HTML report.
        // REPORT_NAME (set per CI job) keeps the file names unique.
        ['blob', { fileName: `report-${process.env.REPORT_NAME ?? 'tests'}.zip` }],
      ]
    : [
        ['list'],                                 // readable progress in the terminal
        ['html', { open: 'never' }],              // full report: npx playwright show-report
      ],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://automationintesting.online',
    actionTimeout: 10_000,       // fail fast on a click/fill that can't happen
    navigationTimeout: 15_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',  // open with: npx playwright show-trace <path>
  },

  projects: [
    // 1. Runs first: logs in as admin via the API and saves the login for other tests
    {
      name: 'setup',
      testMatch: /setup\/.*\.setup\.ts/,
    },
    // 2. API tests: no browser needed
    {
      name: 'api',
      testDir: './tests/api',
      dependencies: ['setup'],
    },
    // 3. Browser (UI) tests
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
});
