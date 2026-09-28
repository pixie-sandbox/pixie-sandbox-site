import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests (Playwright) — run with `npm run test:e2e`.
 *
 * Builds the site and serves it with `next start`, then drives a real
 * Chromium against it. Spec files are named *.e2e.ts so Jest's default
 * testMatch (*.test.* / *.spec.*) never picks them up, and vice versa.
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT} -H 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
