import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { isFeatureEnabled } from "./featureflag";
import { featureflag } from "@/featureflag.config";

vi.mock("@/featureflag.config", () => ({
  featureflag: {
    default: { featureA: false, featureB: true },
    staging: { featureA: true },
    production: { featureB: false },
  },
}));

describe("isFeatureEnabled", () => {
  const originalStagingBaseUrl = import.meta.env.PUBLIC_STAGING_BASE_URL;
  const originalProductionBaseUrl = import.meta.env.PUBLIC_PRODUCTION_BASE_URL;

  const STAGING_BASE_URL = "https://staging.example.com";
  const PRODUCTION_BASE_URL = "https://example.com";

  beforeAll(() => {
    import.meta.env.PUBLIC_STAGING_BASE_URL = STAGING_BASE_URL;
    import.meta.env.PUBLIC_PRODUCTION_BASE_URL = PRODUCTION_BASE_URL;
  });

  afterAll(() => {
    import.meta.env.PUBLIC_STAGING_BASE_URL = originalStagingBaseUrl;
    import.meta.env.PUBLIC_PRODUCTION_BASE_URL = originalProductionBaseUrl;
  });

  it("should return feature value from staging if URL matches staging base URL", () => {
    expect(
      isFeatureEnabled("https://staging.example.com/path", "featureA"),
    ).toBe(true);
  });

  it("should fall back to default feature flag if not defined in staging", () => {
    expect(
      isFeatureEnabled("https://staging.example.com/path", "featureB"),
    ).toBe(true);
  });

  it("should return feature value from production if URL matches production base URL", () => {
    expect(isFeatureEnabled("https://example.com/path", "featureB")).toBe(
      false,
    );
  });

  it("should fall back to default feature flag if not defined in production", () => {
    expect(isFeatureEnabled("https://example.com/path", "featureA")).toBe(
      false,
    );
  });

  it("should return default feature flag if URL does not match staging or production", () => {
    expect(isFeatureEnabled("https://randomsite.com", "featureA")).toBe(false);
    expect(isFeatureEnabled("https://randomsite.com", "featureB")).toBe(true);
  });
});
