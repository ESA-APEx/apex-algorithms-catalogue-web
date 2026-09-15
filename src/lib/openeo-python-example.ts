import type { BenchmarkScenario } from "@/types/models/benchmark-scenario";

interface OpenEOPythonExampleInput {
  processId: string;
  udpUrl?: string;
  endpoint?: string;
  benchmarkScenarios: BenchmarkScenario[];
}

const toPythonLiteral = (value: unknown, indent = 0): string => {
  const spacing = " ".repeat(indent);
  const nextSpacing = " ".repeat(indent + 4);

  if (value === null || value === undefined) return "None";
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "number") return Number.isFinite(value) ? `${value}` : "None";
  if (typeof value === "string") return JSON.stringify(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";

    const entries = value
      .map((item) => `${nextSpacing}${toPythonLiteral(item, indent + 4)}`)
      .join(",\n");

    return `[\n${entries}\n${spacing}]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";

    const objectRows = entries
      .map(
        ([key, item]) =>
          `${nextSpacing}${JSON.stringify(key)}: ${toPythonLiteral(item, indent + 4)}`,
      )
      .join(",\n");

    return `{\n${objectRows}\n${spacing}}`;
  }

  return "None";
};

const selectScenarioArguments = (
  scenarios: BenchmarkScenario[],
  processId: string,
): Record<string, unknown> => {
  for (const scenario of scenarios) {
    for (const node of Object.values(scenario.process_graph || {})) {
      const typedNode = node as {
        process_id?: string;
        arguments?: Record<string, unknown>;
      };

      if (typedNode.process_id === processId && typedNode.arguments) {
        return typedNode.arguments;
      }
    }
  }

  const fallbackScenario = scenarios[0];
  if (!fallbackScenario) return {};

  for (const node of Object.values(fallbackScenario.process_graph || {})) {
    const typedNode = node as { arguments?: Record<string, unknown> };
    if (typedNode.arguments) {
      return typedNode.arguments;
    }
  }

  return {};
};

const OUTPUT_FORMAT_BY_EXTENSION: Record<string, string> = {
  json: "JSON",
  csv: "CSV",
  tif: "GTiff",
  tiff: "GTiff",
  nc: "netCDF",
  netcdf: "netCDF",
  parquet: "Parquet",
};

const deriveOutputFormatFromReferenceData = (
  scenarios: BenchmarkScenario[],
): string | undefined => {
  for (const scenario of scenarios) {
    const referenceKeys = Object.keys(scenario.reference_data || {}).filter(k => k != "job-results.json");
    for (const filename of referenceKeys) {
      const extension = filename.split(".").pop()?.toLowerCase();
      if (extension && OUTPUT_FORMAT_BY_EXTENSION[extension]) {
        return OUTPUT_FORMAT_BY_EXTENSION[extension];
      }
    }
  }

  return undefined;
};

const deriveOutputFormat = (scenarios: BenchmarkScenario[]): string => {
  const fromReferenceData = deriveOutputFormatFromReferenceData(scenarios);
  if (fromReferenceData) {
    return fromReferenceData;
  }

  for (const scenario of scenarios) {
    for (const node of Object.values(scenario.process_graph || {})) {
      const typedNode = node as {
        process_id?: string;
        arguments?: Record<string, unknown>;
      };

      if (typedNode.process_id === "save_result") {
        const format = typedNode.arguments?.format;
        if (typeof format === "string" && format.trim()) {
          return format;
        }
      }
    }
  }

  return "JSON";
};

export const generateOpenEOPythonExample = ({
  processId,
  udpUrl,
  endpoint,
  benchmarkScenarios,
}: OpenEOPythonExampleInput): string | undefined => {
  if (!udpUrl || !endpoint || benchmarkScenarios.length === 0) {
    return undefined;
  }

  const benchmarkArgs = selectScenarioArguments(benchmarkScenarios, processId);
  const outFormat = deriveOutputFormat(benchmarkScenarios);

  const parameterLines = Object.entries(benchmarkArgs).map(
    ([name, value]) => `    ${name}=${toPythonLiteral(value, 4)},`,
  );

  const processCall =
    parameterLines.length > 0
      ? [
          "cube = connection.datacube_from_process(",
          `    process_id=${JSON.stringify(processId)},`,
          "    namespace=udp_namespace,",
          ...parameterLines,
          ")",
        ].join("\n")
      : [
          "cube = connection.datacube_from_process(",
          `    process_id=${JSON.stringify(processId)},`,
          "    namespace=udp_namespace,",
          ")",
        ].join("\n");

  return [
    "import openeo",
    "",
    `connection = openeo.connect(${JSON.stringify(endpoint)})`,
    "connection.authenticate_oidc()",
    "",
    `udp_namespace = ${JSON.stringify(udpUrl)}`,
    "",
    processCall,
    "",
    "job = cube.create_job(",
    `    title=${JSON.stringify(`APEx example: ${processId}`)},`,
    `    out_format=${JSON.stringify(outFormat)},`,
    ")",
    "job.start_and_wait()",
    `job.get_results().download_files(${JSON.stringify(`results-${processId}`)})`,
    "",
    `print(${JSON.stringify(`Finished. Downloaded results to ./results-${processId}`)})`,
  ].join("\n");
};
