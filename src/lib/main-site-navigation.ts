import * as cheerio from "cheerio";

export const MAIN_SITE_URL = "https://apex.esa.int/";
const CACHE_TTL_MS = 60 * 60 * 1000;
const FAILURE_RETRY_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 3000;

export interface MainSiteNavigation {
  header: string;
  footer: string;
  hamburgerMenu: string;
}

let cache: { value: MainSiteNavigation | null; expiresAt: number } | null =
  null;
let pending: Promise<MainSiteNavigation | null> | null = null;

/**
 * Returns the navigation fragments of the APEx main website, or null when
 * unavailable so callers can fall back to the bundled components.
 */
export async function getMainSiteNavigation(): Promise<MainSiteNavigation | null> {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.value;
  }
  pending ??= fetchMainSiteNavigation()
    .catch((error) => {
      console.warn("Unable to load navigation from main site:", error);
      return null;
    })
    .then((value) => {
      cache = {
        value: value ?? cache?.value ?? null,
        expiresAt: Date.now() + (value ? CACHE_TTL_MS : FAILURE_RETRY_MS),
      };
      return cache.value;
    })
    .finally(() => {
      pending = null;
    });
  return pending;
}

async function fetchMainSiteNavigation(): Promise<MainSiteNavigation> {
  const response = await fetch(MAIN_SITE_URL, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Unexpected status ${response.status}`);
  }
  return parseMainSiteNavigation(await response.text(), MAIN_SITE_URL);
}

export function parseMainSiteNavigation(
  html: string,
  baseUrl: string,
): MainSiteNavigation {
  const $ = cheerio.load(html);
  const extract = (selector: string) => {
    const element = $(selector).first();
    if (element.length === 0) {
      throw new Error(`Element "${selector}" not found`);
    }
    return sanitize(element.html() ?? "", baseUrl);
  };

  return {
    header: extract("header"),
    footer: extract("footer"),
    hamburgerMenu: extract(".js-hamburger-menu"),
  };
}

function sanitize(html: string, baseUrl: string): string {
  const $ = cheerio.load(html, null, false);

  $("script, iframe, object, embed, style, link, meta, base, form").remove();

  $("*").each((_, element) => {
    if (element.type !== "tag") return;
    for (const name of Object.keys(element.attribs)) {
      if (name.toLowerCase().startsWith("on")) {
        $(element).removeAttr(name);
      }
    }
  });

  for (const [selector, attribute] of [
    ["a", "href"],
    ["img", "src"],
  ] as const) {
    $(selector).each((_, element) => {
      const value = $(element).attr(attribute);
      if (!value) return;
      const url = resolveUrl(value, baseUrl);
      if (url) {
        $(element).attr(attribute, url);
      } else {
        $(element).removeAttr(attribute);
      }
    });
  }

  $("img[srcset]").removeAttr("srcset");

  return $.html();
}

function resolveUrl(value: string, baseUrl: string): string | null {
  try {
    const url = new URL(value, baseUrl);
    return ["http:", "https:", "mailto:"].includes(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
}
