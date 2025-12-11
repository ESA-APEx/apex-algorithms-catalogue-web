import * as dotenv from "dotenv";
import { defineConfig, passthroughImageService } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import node from "@astrojs/node";
import auth from "auth-astro";
import markdownIntegration from "@astropub/md";
import { RemarkNormalizeHeadings } from "./src/remark-plugins/normalize-headings";

dotenv.config();

const PREVIEW_PR_BASE_PATH = process.env.PR_NUMBER
  ? `/pr-preview/pr-${process.env.PR_NUMBER}`
  : "";

const config = {
  local: {
    SITE_URL: "http://localhost:4321",
    BASE_PATH: "/",
  },
  preview: {
    SITE_URL: process.env.PUBLIC_PREVIEW_BASE_URL,
    BASE_PATH: `${process.env.PUBLIC_PREVIEW_BASE_PATH}${PREVIEW_PR_BASE_PATH}`,
  },
  "preview-homepage": {
    SITE_URL: process.env.PUBLIC_PREVIEW_BASE_URL,
    BASE_PATH: process.env.PUBLIC_PREVIEW_BASE_PATH,
  },
  staging: {
    SITE_URL: process.env.PUBLIC_STAGING_BASE_URL,
    BASE_PATH: "/"
  },
  production: {
    SITE_URL: process.env.PUBLIC_PRODUCTION_BASE_URL,
    BASE_PATH: "/",
  },
};

const buildTarget = (process.env.BUILD_TARGET ??
  "local") as keyof typeof config;

const { SITE_URL, BASE_PATH } = config[buildTarget];

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: SITE_URL,
  base: BASE_PATH,
  image: {
    service: passthroughImageService(),
  },
  redirects: {
    "/dashboard/scenarios": "/dashboard",
    "/apps": "/"
  },
  integrations: [
    auth(),
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
