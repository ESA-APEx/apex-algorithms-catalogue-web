import { defineConfig, passthroughImageService } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import node from "@astrojs/node";
import markdownIntegration from '@astropub/md';
import { RemarkLinkRewrite } from './src/remark-plugins/link-rewrite';
import { RemarkNormalizeHeadings } from './src/remark-plugins/normalize-headings';
import type { NodeType } from './src/remark-plugins/link-rewrite';

const config = {
  staging: {
    SITE_URL: "https://algorithm-catalogue.apex.esa.int",
    BASE_PATH: "",
    BASE_IMAGE_DESCRIPTION_URL: "https://raw.githubusercontent.com/ESA-APEx/apex_algorithms/main/algorithm_catalog/",
  },
  production: {
    SITE_URL: "https://algorithm-catalogue.apex.esa.int",
    BASE_PATH: "",
    BASE_IMAGE_DESCRIPTION_URL: "https://raw.githubusercontent.com/ESA-APEx/apex_algorithms/main/algorithm_catalog/",
  }
};

const buildTarget = (process.env.BUILD_TARGET ?? "staging") as keyof typeof config;

const {
  SITE_URL,
  BASE_PATH,
  BASE_IMAGE_DESCRIPTION_URL,
} = config[buildTarget];

// https://astro.build/config
export default defineConfig({
  output: 'server',
  site: SITE_URL,
  base: BASE_PATH,
  image: {
    service: passthroughImageService()
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
      theme: 'github-light-default',
    },
    remarkPlugins: [
      [
        RemarkLinkRewrite,
        {
          replacer: (nodeType: NodeType, url: string) => {
            if (nodeType === 'image' && !url.startsWith('https://')) {
              return new URL(url, BASE_IMAGE_DESCRIPTION_URL).href;
            }
            return url;
          }
        }
      ],
      RemarkNormalizeHeadings
    ]
  },
  adapter: node({
    mode: "standalone"
  }),
});