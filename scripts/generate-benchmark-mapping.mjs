import fs from "fs";
import path from "path";

const ALGORITHM_CATALOG_DIR = "contents/apex_algorithms/algorithm_catalog";
const OUTPUT_FILE = "src/benchmark-mapping.json";

main();

function main() {
  console.log("Extracting algorithm to benchmark scenario mappings...");

  const algorithmMapping = extractAlgorithmBenchmarkMapping();

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(algorithmMapping, null, 2),
    "utf-8",
  );

  console.log(
    `Algorithm-benchmark mapping generated successfully! Output file: ${OUTPUT_FILE}`,
  );

  const totalAlgorithms = Object.keys(algorithmMapping).length;
  const algorithmsWithBenchmarks = Object.values(algorithmMapping).filter(
    (scenarios) => scenarios.length > 0,
  ).length;
  const totalBenchmarkScenarios = Object.values(algorithmMapping).reduce(
    (sum, scenarios) => sum + scenarios.length,
    0,
  );

  console.log(`Total algorithms found: ${totalAlgorithms}`);
  console.log(
    `Algorithms with benchmark scenarios: ${algorithmsWithBenchmarks}`,
  );
  console.log(`Total benchmark scenarios: ${totalBenchmarkScenarios}`);
}

function extractAlgorithmBenchmarkMapping() {
  const algorithmMapping = {};

  try {
    const providers = fs.readdirSync(ALGORITHM_CATALOG_DIR, {
      withFileTypes: true,
    });

    for (const provider of providers) {
      if (!provider.isDirectory()) {
        continue;
      }

      const providerDir = path.join(ALGORITHM_CATALOG_DIR, provider.name);
      console.log(`Processing provider: ${provider.name}`);

      try {
        const algorithms = fs.readdirSync(providerDir, {
          withFileTypes: true,
        });

        for (const algorithm of algorithms) {
          if (!algorithm.isDirectory()) {
            continue;
          }

          const algorithmDir = path.join(providerDir, algorithm.name);
          console.log(`  Processing algorithm: ${algorithm.name}`);

          const algorithmId = getAlgorithmId(algorithmDir, algorithm.name);
          if (!algorithmId) {
            console.warn(
              `    Warning: No algorithm ID found for ${algorithm.name}`,
            );
            continue;
          }

          const benchmarkScenarioIds = getBenchmarkScenarioIds(algorithmDir);

          algorithmMapping[algorithmId] = benchmarkScenarioIds;

          if (benchmarkScenarioIds.length > 0) {
            console.log(
              `    Mapped ${algorithmId} to ${benchmarkScenarioIds.length} benchmark scenarios: [${benchmarkScenarioIds.join(", ")}]`,
            );
          } else {
            console.log(`    Added ${algorithmId} with no benchmark scenarios`);
          }
        }
      } catch (error) {
        console.error(
          `Error processing provider ${provider.name}:`,
          error.message,
        );
      }
    }

    return algorithmMapping;
  } catch (error) {
    console.error("Error reading algorithm catalog directory:", error.message);
    throw error;
  }
}

function getAlgorithmId(algorithmDir, fallbackName) {
  try {
    const recordsDir = path.join(algorithmDir, "records");

    if (!fs.existsSync(recordsDir)) {
      return null;
    }

    const recordFiles = fs
      .readdirSync(recordsDir)
      .filter((file) => file.endsWith(".json"));

    for (const recordFile of recordFiles) {
      try {
        const recordPath = path.join(recordsDir, recordFile);
        const recordContent = fs.readFileSync(recordPath, "utf-8");
        const recordJson = JSON.parse(recordContent);

        if (recordJson.id) {
          return recordJson.id;
        }
      } catch (error) {
        console.error(
          `Error reading record file ${recordFile}:`,
          error.message,
        );
      }
    }

    return fallbackName;
  } catch (error) {
    console.error(
      `Error getting algorithm ID from ${algorithmDir}:`,
      error.message,
    );
    return fallbackName;
  }
}

function getBenchmarkScenarioIds(algorithmDir) {
  try {
    const benchmarkScenariosDir = path.join(
      algorithmDir,
      "benchmark_scenarios",
    );

    if (!fs.existsSync(benchmarkScenariosDir)) {
      return [];
    }

    const scenarioFiles = fs
      .readdirSync(benchmarkScenariosDir)
      .filter((file) => file.endsWith(".json"));

    const scenarioIds = [];

    for (const scenarioFile of scenarioFiles) {
      try {
        const scenarioPath = path.join(benchmarkScenariosDir, scenarioFile);
        const scenarioContent = fs.readFileSync(scenarioPath, "utf-8");
        const scenarioJson = JSON.parse(scenarioContent);

        if (Array.isArray(scenarioJson)) {
          for (const scenario of scenarioJson) {
            if (scenario.id) {
              scenarioIds.push(scenario.id);
            }
          }
        } else if (scenarioJson.id) {
          scenarioIds.push(scenarioJson.id);
        }
      } catch (error) {
        console.error(
          `Error reading scenario file ${scenarioFile}:`,
          error.message,
        );
      }
    }

    return scenarioIds;
  } catch (error) {
    console.error(
      `Error reading benchmark scenarios from ${algorithmDir}:`,
      error.message,
    );
    return [];
  }
}
