/// <reference types="vitest" />
import { defaultExclude } from "vitest/config";
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    exclude: [...defaultExclude, '**\/e2e\/**']
  },
});