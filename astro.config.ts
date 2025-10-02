import { loadEnv } from "vite";
import { defineConfig, passthroughImageService } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import node from "@astrojs/node";
import markdownIntegration from "@astropub/md";
import { RemarkNormalizeHeadings } from "./src/remark-plugins/normalize-headings";

const {
  PUBLIC_PRODUCTION_BASE_URL,
  PUBLIC_STAGING_BASE_URL,
  PUBLIC_PREVIEW_BASE_URL,
} = loadEnv(
  // @ts-expect-error
  process.env.NODE_ENV,
  process.cwd(),
  "",
);

const PREVIEW_BASE_PATH = "/apex-algorithms-catalogue-web";
const PREVIEW_PR_BASE_PATH = process.env.PR_NUMBER
  ? `/pr-preview/pr-${process.env.PR_NUMBER}`
  : "";

const config = {
  preview: {
    SITE_URL: PUBLIC_PREVIEW_BASE_URL,
    BASE_PATH: `${PREVIEW_BASE_PATH}${PREVIEW_PR_BASE_PATH}`,
  },
  staging: {
    SITE_URL: PUBLIC_STAGING_BASE_URL,
    BASE_PATH: "",
  },
  production: {
    SITE_URL: PUBLIC_PRODUCTION_BASE_URL,
    BASE_PATH: "",
  },
};

const buildTarget = (process.env.BUILD_TARGET ??
  "staging") as keyof typeof config;

const { SITE_URL, BASE_PATH } = config[buildTarget];

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: SITE_URL,
  base: BASE_PATH,
  image: {
    service: passthroughImageService(),
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    markdownIntegration(),
    react(),
  ],
  markdown: {
    shikiConfig: {
      theme: "github-light-default",
    },
    remarkPlugins: [RemarkNormalizeHeadings],
  },
  adapter: node({
    mode: "standalone",
  }),
});
