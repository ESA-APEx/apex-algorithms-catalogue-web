import { featureflag } from "@/featureflag.config";

type FeatureKey = keyof typeof featureflag.default;

export function isFeatureEnabled(url: string, feature: FeatureKey): boolean {    
    if (url.includes(import.meta.env.STAGING_BASE_URL)) {
        return featureflag.staging[feature] ?? featureflag.default[feature];
    }
    if (url.includes(import.meta.env.PRODUCTION_BASE_URL)) {
        return featureflag.production[feature] ?? featureflag.default[feature];
    }

    return featureflag.default[feature] ?? false;
}