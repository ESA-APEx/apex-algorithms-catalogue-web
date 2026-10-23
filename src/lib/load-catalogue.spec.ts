import fs from "fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  normalizeCertification,
  loadCatalogueData,
  loadCatalogueDetailData,
} from "./load-catalogue";
import type { CertificationMetadata } from "../types/models/algorithm";

const categoryCases: {
  certification: Partial<CertificationMetadata> | undefined;
  expected: CertificationMetadata;
}[] = [
  {
    certification: undefined,
    expected: { category: "community_contributed", funding: "other" },
  },
  {
    certification: {},
    expected: { category: "community_contributed", funding: "other" },
  },
  {
    certification: { funding: "esa" },
    expected: { category: "community_contributed", funding: "esa" },
  },
  {
    certification: { category: "validated" },
    expected: { category: "validated", funding: "other" },
  },
  {
    certification: { category: "r_and_d" },
    expected: { category: "r_and_d", funding: "other" },
  },
  {
    certification: { category: "community_contributed", funding: "esa" },
    expected: { category: "community_contributed", funding: "esa" },
  },
  {
    certification: { category: "validated", funding: "esa" },
    expected: { category: "validated", funding: "esa" },
  },
  {
    certification: { category: "validated", funding: "other" },
    expected: { category: "validated", funding: "other" },
  },
  {
    certification: { category: "r_and_d", funding: "esa" },
    expected: { category: "r_and_d", funding: "esa" },
  },
  {
    certification: { category: "r_and_d", funding: "other" },
    expected: { category: "r_and_d", funding: "other" },
  },
];

describe("normalizeCertification", () => {
  it.each(categoryCases)(
    "normalizes $certification to $expected",
    ({ certification, expected }) => {
      const original = certification && { ...certification };
      expect(normalizeCertification(certification)).toEqual(expected);
      expect(certification).toEqual(original);
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
        expect(entries[0].algorithm).not.toHaveProperty("certificationCategory");
        expect(entries[0].algorithm.properties.certification).toEqual(expected);
        expect(entries[0].benchmarkScenarios).toEqual(scenarios);
      }
      expect(error).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
    },
  );
});
