// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e/specs',
  timeout: 30000,
  fullyParallel: true,
  retries: 0,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    // Evidencia obligatoria para el documento de resultados: se guarda
    // siempre, incluso de los CP que pasan.
    screenshot: 'on',
    video: 'on',
    trace: 'on',
  },
  webServer: {
    command: 'npx http-server -p 4173 -c-1 -s .',
    url: 'http://127.0.0.1:4173/index.html',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
  globalSetup: require.resolve('./tests/e2e/global-setup.js'),
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
