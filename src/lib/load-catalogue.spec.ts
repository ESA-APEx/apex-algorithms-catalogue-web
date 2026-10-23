import fs from "fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  deriveCertificationCategory,
  loadCatalogueData,
  loadCatalogueDetailData,
} from "./load-catalogue";
import type {
  CertificationCategory,
  CertificationMetadata,
} from "../types/models/algorithm";

const categoryCases: {
  certification: CertificationMetadata | undefined;
  expected: CertificationCategory;
}[] = [
  { certification: undefined, expected: "community_contributed" },
  {
    certification: { category: "validated", funding: "esa" },
    expected: "validated",
  },
  {
    certification: { category: "validated", funding: "other" },
    expected: "validated",
  },
  {
    certification: { category: "r_and_d", funding: "esa" },
    expected: "r_and_d",
  },
  {
    certification: { category: "r_and_d", funding: "other" },
    expected: "r_and_d",
  },
];

describe("deriveCertificationCategory", () => {
  it.each(categoryCases)(
    "derives $expected from $certification",
    ({ certification, expected }) => {
      expect(deriveCertificationCategory(certification)).toBe(expected);
    },
  );
});

describe("catalogue certification categories", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(
    categoryCases.flatMap((testCase) =>
      [false, true].map((hasBenchmarks) => ({ ...testCase, hasBenchmarks })),
    ),
  )(
    "attaches $expected in both loaders with benchmarks=$hasBenchmarks and metadata=$certification",
    async ({ certification, expected, hasBenchmarks }) => {
      const record = {
        id: "test-algorithm",
        conformsTo: [],
        properties: { certification },
        links: [],
      };
      const scenarios = hasBenchmarks ? [{ id: "test-scenario" }] : [];
      vi.spyOn(fs, "readdirSync").mockImplementation((directory) =>
        String(directory).endsWith("benchmark_scenarios")
          ? ["scenario.json"] as any
          : ["provider/service/records/algorithm.json"] as any,
      );
      vi.spyOn(fs, "existsSync").mockReturnValue(hasBenchmarks);
      vi.spyOn(fs, "statSync").mockReturnValue({
        isDirectory: () => true,
      } as fs.Stats);
      vi.spyOn(fs, "readFileSync").mockImplementation((file) =>
        JSON.stringify(
          String(file).endsWith("scenario.json") ? scenarios : record,
        ),
      );
      const error = vi.spyOn(console, "error");
      const warn = vi.spyOn(console, "warn");

      // The list loader populates its returned array asynchronously.
      const catalogue = loadCatalogueData();
      const details = await loadCatalogueDetailData();
      await vi.waitFor(() => expect(catalogue).toHaveLength(1));

      for (const entries of [catalogue, details]) {
        expect(entries).toHaveLength(1);
        expect(entries[0].algorithm.certificationCategory).toBe(expected);
        expect(entries[0].algorithm.properties.certification).toEqual(
          certification,
        );
        expect(entries[0].benchmarkScenarios).toEqual(scenarios);
      }
      expect(error).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
    },
  );
});
