/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    globalSetup: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{js,ts}"],
  },
});
