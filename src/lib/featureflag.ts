import { featureflag } from "@/featureflag.config";

export function isFeatureEnabled(url: string, feature: string): boolean {
  if (url.includes(import.meta.env.PUBLIC_STAGING_BASE_URL)) {
    return featureflag.staging[feature] ?? featureflag.default[feature];
  }
  if (url.includes(import.meta.env.PUBLIC_PRODUCTION_BASE_URL)) {
    return featureflag.production[feature] ?? featureflag.default[feature];
  }

  return featureflag.default[feature] ?? false;
}
