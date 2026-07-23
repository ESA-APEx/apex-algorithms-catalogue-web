import { describe, expect, it } from "vitest";
import { generateOpenEOPythonExample } from "./openeo-python-example";
import type { BenchmarkScenario } from "@/types/models/benchmark-scenario";

const baseScenario: BenchmarkScenario = {
  id: "my-process",
  type: "openeo",
  description: "Example benchmark",
  backend: "example-backend",
  process_graph: {
    process1: {
      process_id: "my-process",
      arguments: {
        startdate: "2024-01-01",
        enddate: "2024-12-31",
        output: "FAPAR",
      },
      namespace: "https://example.com/udp/my-process.json",
    },
    save1: {
      process_id: "save_result",
      arguments: {
        data: { from_node: "process1" },
        format: "GTiff",
      },
      result: true,
    },
  },
};

describe("generateOpenEOPythonExample", () => {
  it("returns undefined when benchmark data is missing", () => {
    const code = generateOpenEOPythonExample({
      processId: "my-process",
      udpUrl: "https://example.com/udp/my-process.json",
      endpoint: "https://example.com/openeo",
      benchmarkScenarios: [],
    });

    expect(code).toBeUndefined();
  });

  it("generates runnable python using endpoint, udp url and benchmark parameters", () => {
    const code = generateOpenEOPythonExample({
      processId: "my-process",
      udpUrl: "https://example.com/udp/my-process.json",
      endpoint: "https://example.com/openeo",
      benchmarkScenarios: [baseScenario],
    });

    expect(code).toContain('connection = openeo.connect("https://example.com/openeo")');
    expect(code).toContain('udp_namespace = "https://example.com/udp/my-process.json"');
    expect(code).toContain('process_id="my-process"');
    expect(code).toContain('startdate="2024-01-01"');
    expect(code).toContain('enddate="2024-12-31"');
    expect(code).toContain('output="FAPAR"');
    expect(code).toContain('out_format="GTiff"');
  });

  it("serializes benchmark argument values as valid python literals", () => {
    const scenario: BenchmarkScenario = {
      ...baseScenario,
      process_graph: {
        process1: {
          process_id: "my-process",
          arguments: {
            bool_true: true,
            bool_false: false,
            nullable: null,
            numbers: [1, 2],
            geometry: {
              type: "Point",
              coordinates: [1.1, 2.2],
            },
          },
        },
      },
    };

    const code = generateOpenEOPythonExample({
      processId: "my-process",
      udpUrl: "https://example.com/udp/my-process.json",
      endpoint: "https://example.com/openeo",
      benchmarkScenarios: [scenario],
    });

    expect(code).toContain("bool_true=True");
    expect(code).toContain("bool_false=False");
    expect(code).toContain("nullable=None");
    expect(code).toContain("\"coordinates\": [");
  });

  it("derives output format from reference_data file extension", () => {
    const scenario: BenchmarkScenario = {
      ...baseScenario,
      reference_data: {
        "result.tif": "https://example.com/result.tif",
      },
      process_graph: {
        process1: {
          process_id: "my-process",
          arguments: {
            startdate: "2024-01-01",
          },
        },
        save1: {
          process_id: "save_result",
          arguments: {
            format: "JSON",
          },
        },
      },
    };

    const code = generateOpenEOPythonExample({
      processId: "my-process",
      udpUrl: "https://example.com/udp/my-process.json",
      endpoint: "https://example.com/openeo",
      benchmarkScenarios: [scenario],
    });

    expect(code).toContain('out_format="GTiff"');
  });
});
