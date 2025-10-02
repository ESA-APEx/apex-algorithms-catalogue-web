import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./process-definition.json";
import YAML from "yaml";
import nodeFetch from "node-fetch";

// Mock YAML parse
vi.mock("yaml", () => ({
  default: {
    parse: vi.fn(),
  },
}));

vi.mock("node-fetch", () => ({
  default: vi.fn(),
}));

describe("API Route: GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if no URL is provided", async () => {
    const request = new Request(
      "http://localhost:4321/api/services/process-definition.json?type=cwl",
    );
    const response = await GET({ request } as any);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json).toEqual({ message: "Parameter URL is required." });
  });

  it("should return 400 if unsupported type is provided", async () => {
    const request = new Request(
      "http://localhost:4321/api/services/process-definition.json?url=http://example.com/file.cwl&type=unknown",
    );
    const response = await GET({ request } as any);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json).toEqual({ message: "Type unknown is not supported." });
  });

  it("should return error message on unauthorized fetch", async () => {
    (nodeFetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      text: vi.fn(),
    });

    const request = new Request(
      "http://localhost:4321/api/services/process-definition?url=http://example.com/file.cwl&type=cwl",
    );
    const response = await GET({ request } as any);

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json).toEqual({
      message:
        "Process definition for url http://example.com/file.cwl is protected.",
    });
  });

  it("should return parsed application details for valid CWL", async () => {
    const mockYaml = {
      $graph: [
        {
          id: "main",
          label: "Test Workflow",
          doc: "A sample workflow.",
          inputs: {
            input1: {
              label: "Input 1",
              doc: "First input",
              type: "string",
            },
          },
        },
      ],
    };

    (nodeFetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue("yaml content"),
    });

    (YAML.parse as jest.Mock).mockReturnValue(mockYaml);

    const request = new Request(
      "http://localhost:4321/api/services/process-definition.json?url=http://example.com/file.cwl&type=cwl",
    );
    const response = await GET({ request } as any);

    expect(response.status).toBe(200);
    const json = await response.json();

    expect(json).toEqual({
      summary: "Test Workflow",
      description: "A sample workflow.",
      parameters: [
        {
          name: "Input 1",
          description: "First input",
          schema: "string",
        },
      ],
    });
  });

  it("should return empty object if $graph.main is missing", async () => {
    const mockYaml = {
      $graph: [{ id: "not-main" }],
    };

    (nodeFetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue("yaml content"),
    });

    (YAML.parse as jest.Mock).mockReturnValue(mockYaml);

    const request = new Request(
      "http://localhost:4321/api/services/process-definition.json?url=http://example.com/file.cwl&type=cwl",
    );
    const response = await GET({ request } as any);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({});
  });

  it("should return 500 if fetch throws error", async () => {
    (nodeFetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    const request = new Request(
      "http://localhost:4321/api/services/process-definition.json?url=http://example.com/file.cwl&type=cwl",
    );
    const response = await GET({ request } as any);

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json).toEqual({
      message:
        "Fetching process definition for url http://example.com/file.cwl has failed.",
    });
  });
});
