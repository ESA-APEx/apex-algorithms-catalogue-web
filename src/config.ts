// Below config are taken from the astro.config.ts.
// This way, the configs are also accessible both for build and client runtime.
export const SITE_URL = import.meta.env.SITE;
export const BASE_PATH =
  import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL;
export const SOURCE_BRANCH = "main";
export const MAIN_SITE_URL = "https://apex.esa.int";
export const ALGO_REF = import.meta.env.PUBLIC_ALGO_REF || "main";
export const ALGO_REPO_URL = "https://raw.githubusercontent.com/ESA-APEx/apex_algorithms";
export const RECORD_LINK_BASE_URL = `${ALGO_REPO_URL}/${ALGO_REF}/algorithm_catalog/`;
