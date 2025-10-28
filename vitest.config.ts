/// <reference types="vitest" />
import { loadEnv } from "vite";
import { defaultExclude } from "vitest/config";
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    exclude: [...defaultExclude, "**\/e2e\/**"],
    env: loadEnv("", process.cwd(), ""),
    globalSetup: "./vitest.global.ts",
  },
});
