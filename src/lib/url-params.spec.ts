import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getValidatedParamsFromUrl,
  updateUrlWithParams,
  type UrlFilterParams,
  type ValidationOptions,
} from "./url-params";

const validationOptions: ValidationOptions = {
  validSortOptions: ["name"],
  availableLabels: [],
  availableLicenses: [],
  availableTypes: [],
  availableBenchmarkStatuses: [],
  availableCertificationCategories: ["esa-validated", "contributed"],
  availableProviders: [],
  availablePlatforms: [],
};

describe("certification URL parameters", () => {
  const replaceState = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("window", {
      location: { search: "?certification=esa-validated,contributed,invalid", pathname: "/" },
      history: { replaceState },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    replaceState.mockReset();
  });

  it("parses and validates certification filter values", () => {
    expect(getValidatedParamsFromUrl(validationOptions).filterByCertification).toEqual([
      "esa-validated",
      "contributed",
    ]);
  });

  it("serializes certification filters into the shareable URL", () => {
    const params: UrlFilterParams = {
      query: "",
      sortBy: "name",
      filterByLabels: [],
      filterByLicenses: [],
      filterByTypes: [],
      filterByBenchmarkStatus: [],
      filterByCertification: ["esa-validated", "contributed"],
      filterByProviders: [],
      filterByPlatforms: [],
      currentPage: 1,
    };

    updateUrlWithParams(params);

    expect(replaceState).toHaveBeenCalledWith(
      null,
      "",
      "/?certification=esa-validated%2Ccontributed",
    );
  });
});
