import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Unit tests only. End-to-end tests run with Playwright (see playwright.config.js).
    include: ['tests/unit/**/*.test.js'],
  },
});
