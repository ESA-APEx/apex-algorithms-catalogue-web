import { defineConfig, passthroughImageService } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import node from "@astrojs/node";

const config = {
  staging: {
    SITE_URL: "https://algorithms-catalogue.apex.esa.int",
    BASE_PATH: "/algorithms-catalogue"
  },
  production: {
    SITE_URL: "https://apex.com",
    BASE_PATH: "/algorithms-catalogue"
  }
};

const buildTarget = (process.env.BUILD_TARGET ?? "staging") as keyof typeof config;
const {
  SITE_URL,
  BASE_PATH
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
    react()
  ],
  adapter: node({
    mode: "standalone"
  })
});