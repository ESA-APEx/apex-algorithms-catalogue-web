// Below config are taken from the astro.config.ts.
// This way, the configs are also accessible both for build and client runtime.
export const SITE_URL = import.meta.env.SITE;
export const BASE_PATH =
  import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL;
export const SOURCE_BRANCH = "main"
export const MAIN_SITE_URL = "https://apex.esa.int";
export const BASE_IMAGE_DESCRIPTION_URL = "https://raw.githubusercontent.com/ESA-APEx/apex_algorithms/main/algorithm_catalog/";