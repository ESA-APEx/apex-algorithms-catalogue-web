interface UrlFilterParams {
  query: string;
  sortBy: string;
  filterByLabels: string[];
  filterByLicenses: string[];
  filterByTypes: string[];
  filterByBenchmarkStatus: string[];
  currentPage: number;
}

interface UrlParamConfig {
  query: { key: string; defaultValue: string };
  sortBy: { key: string; defaultValue: string };
  filterByLabels: { key: string; defaultValue: string[] };
  filterByLicenses: { key: string; defaultValue: string[] };
  filterByTypes: { key: string; defaultValue: string[] };
  filterByBenchmarkStatus: { key: string; defaultValue: string[] };
  currentPage: { key: string; defaultValue: number };
}

const DEFAULT_URL_CONFIG: UrlParamConfig = {
  query: { key: "q", defaultValue: "" },
  sortBy: { key: "sort", defaultValue: "name" },
  filterByLabels: { key: "labels", defaultValue: [] },
  filterByLicenses: { key: "licenses", defaultValue: [] },
  filterByTypes: { key: "types", defaultValue: [] },
  filterByBenchmarkStatus: { key: "benchmarkStatus", defaultValue: [] },
  currentPage: { key: "page", defaultValue: 1 },
};

interface ValidationOptions {
  validSortOptions: string[];
  availableLabels: string[];
  availableLicenses: string[];
  availableTypes: string[];
  availableBenchmarkStatuses: string[];
  maxPage?: number;
}

export const getValidatedParamsFromUrl = (
  validationOptions: ValidationOptions,
  config: UrlParamConfig = DEFAULT_URL_CONFIG,
): UrlFilterParams => {
  const urlParams = new URLSearchParams(window.location.search);

  // Parse raw parameters
  const rawParams = {
    query: urlParams.get(config.query.key) || config.query.defaultValue,
    sortBy: urlParams.get(config.sortBy.key) || config.sortBy.defaultValue,
    filterByLabels:
      urlParams.get(config.filterByLabels.key)?.split(",").filter(Boolean) ||
      config.filterByLabels.defaultValue,
    filterByLicenses:
      urlParams.get(config.filterByLicenses.key)?.split(",").filter(Boolean) ||
      config.filterByLicenses.defaultValue,
    filterByTypes:
      urlParams.get(config.filterByTypes.key)?.split(",").filter(Boolean) ||
      config.filterByTypes.defaultValue,
    filterByBenchmarkStatus:
      urlParams
        .get(config.filterByBenchmarkStatus.key)
        ?.split(",")
        .filter(Boolean) || config.filterByBenchmarkStatus.defaultValue,
    currentPage:
      parseInt(
        urlParams.get(config.currentPage.key) ||
          config.currentPage.defaultValue.toString(),
      ) || config.currentPage.defaultValue,
  };

  // Validate against available options
  const validatedParams: UrlFilterParams = {
    query: rawParams.query,
    sortBy: validationOptions.validSortOptions.includes(rawParams.sortBy)
      ? rawParams.sortBy
      : config.sortBy.defaultValue,
    filterByLabels: rawParams.filterByLabels.filter((label) =>
      validationOptions.availableLabels.includes(label),
    ),
    filterByLicenses: rawParams.filterByLicenses.filter((license) =>
      validationOptions.availableLicenses.includes(license),
    ),
    filterByTypes: rawParams.filterByTypes.filter((type) =>
      validationOptions.availableTypes.includes(type),
    ),
    filterByBenchmarkStatus: rawParams.filterByBenchmarkStatus.filter(
      (status) => validationOptions.availableBenchmarkStatuses.includes(status),
    ),
    currentPage:
      validationOptions.maxPage &&
      rawParams.currentPage > validationOptions.maxPage
        ? config.currentPage.defaultValue
        : Math.max(rawParams.currentPage, config.currentPage.defaultValue),
  };

  return validatedParams;
};

export const updateUrlWithParams = (
  params: UrlFilterParams,
  config: UrlParamConfig = DEFAULT_URL_CONFIG,
): void => {
  const urlParams = new URLSearchParams();

  // Only set non-default values to keep URL clean
  if (params.query) {
    urlParams.set(config.query.key, params.query);
  }

  if (params.sortBy && params.sortBy !== config.sortBy.defaultValue) {
    urlParams.set(config.sortBy.key, params.sortBy);
  }

  if (params.filterByLabels.length > 0) {
    urlParams.set(config.filterByLabels.key, params.filterByLabels.join(","));
  }

  if (params.filterByLicenses.length > 0) {
    urlParams.set(
      config.filterByLicenses.key,
      params.filterByLicenses.join(","),
    );
  }

  if (params.filterByTypes.length > 0) {
    urlParams.set(config.filterByTypes.key, params.filterByTypes.join(","));
  }

  if (params.filterByBenchmarkStatus.length > 0) {
    urlParams.set(
      config.filterByBenchmarkStatus.key,
      params.filterByBenchmarkStatus.join(","),
    );
  }

  if (
    params.currentPage &&
    params.currentPage !== config.currentPage.defaultValue
  ) {
    urlParams.set(config.currentPage.key, params.currentPage.toString());
  }

  const newUrl = `${window.location.pathname}${urlParams.toString() ? "?" + urlParams.toString() : ""}`;
  window.history.replaceState(null, "", newUrl);
};

export type { UrlFilterParams, UrlParamConfig, ValidationOptions };
