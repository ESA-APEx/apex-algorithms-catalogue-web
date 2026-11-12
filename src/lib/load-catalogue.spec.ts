import fs from "fs";
import https from "https";
import { EventEmitter } from "events";
import { IncomingMessage } from "http";
import { Socket } from "net";
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

      const catalogue = await loadCatalogueData();
      const details = await loadCatalogueDetailData();

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

  it("waits for remote provider details before returning the catalogue", async () => {
    const record = {
      id: "test-algorithm",
      conformsTo: [],
      properties: {},
      links: [{ rel: "provider", href: "https://example.com/provider.json" }],
    };
    vi.spyOn(fs, "readdirSync").mockReturnValue([
      "provider/service/records/algorithm.json",
    ] as any);
    vi.spyOn(fs, "existsSync").mockReturnValue(false);
    vi.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(record));
    vi.spyOn(https, "get").mockImplementation(((_url, callback) => {
      if (typeof callback !== "function") {
        throw new Error("Expected a response callback");
      }
      const request = new EventEmitter();
      setTimeout(() => {
        const response = new IncomingMessage(new Socket());
        callback(response);
        response.push(JSON.stringify({ properties: { title: "Test Provider" } }));
        response.push(null);
      }, 10);
      return request;
    }) as typeof https.get);

    const catalogue = await loadCatalogueData();

    expect(catalogue).toHaveLength(1);
    expect(catalogue[0].provider?.properties.title).toBe("Test Provider");
  });
});
