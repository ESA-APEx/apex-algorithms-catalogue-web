import fs from "fs";
import path from "path";

const ALGORITHM_CATALOG_DIR = "contents/apex_algorithms/algorithm_catalog";
const OUTPUT_FILE = "src/acl-mapping.json";

main();

function main() {
  console.log("Extracting ACL mappings from provider records...");

  const aclMapping = extractAclMapping();

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(aclMapping, null, 2), "utf-8");

  console.log(
    `ACL mapping generated successfully! Output file: ${OUTPUT_FILE}`,
  );
}

function extractAclMapping() {
  const aclMapping = {
    acl: {
      admin: [],
    },
    records: {},
  };

  try {
    const providers = fs.readdirSync(ALGORITHM_CATALOG_DIR, {
      withFileTypes: true,
    });

    for (const provider of providers) {
      if (!provider.isDirectory()) {
        continue;
      }
      const providerDir = path.join(ALGORITHM_CATALOG_DIR, provider.name);
      const providerRecordPath = path.join(providerDir, "record.json");

      try {
        const providerRecord = JSON.parse(
          fs.readFileSync(providerRecordPath, "utf-8"),
        );
        const acl = providerRecord?.properties?.acl;

        if (acl && Array.isArray(acl.admin)) {
          aclMapping.acl.admin = [...aclMapping.acl.admin, ...acl.admin];
          const scenarioIds = getBenchmarkScenarioIds(provider.name);
          // Assign each benchmark scenario id with the provider ACL
          for (const scenarioId of scenarioIds) {
            if (aclMapping.records[scenarioId]) {
              aclMapping.records[scenarioId] = [
                ...aclMapping.records[scenarioId],
                ...acl.admin,
              ];
            } else {
              aclMapping.records[scenarioId] = acl.admin;
            }
          }
        } else {
          console.warn(`Warning: No ACL found for provider ${provider.name}`);
        }
      } catch (error) {
        console.error(
          `Error reading record.json for provider ${provider.name}:`,
          error.message,
        );
      }
    }

    return aclMapping;
  } catch (error) {
    console.error("Error reading algorithm catalog directory:", error.message);
    throw error;
  }
}

function getBenchmarkScenarioIds(providerDir) {
  try {
    const targetDir = path.join(ALGORITHM_CATALOG_DIR, providerDir);

    const scenarios = fs
      .readdirSync(targetDir, { recursive: true })
      .map((file) => file.toString())
      .filter(
        (file) =>
          file.endsWith(".json") &&
          (file.includes("/benchmark_scenarios/") ||
            file.includes("\\benchmark_scenarios\\")), // support linux and windows based path
      );

    const scenarioIds = [];

    for (const scenarioFile of scenarios) {
      const scenarioPath = path.join(targetDir, scenarioFile);
      const scenarioContent = fs.readFileSync(scenarioPath, "utf-8");
      const scenarioJson = JSON.parse(scenarioContent);
      if (Array.isArray(scenarioJson)) {
        for (const scenario of scenarioJson) {
          scenarioIds.push(scenario.id);
        }
      } else {
        scenarioIds.push(scenarioJson.id);
      }
    }

    return scenarioIds;
  } catch (error) {
    console.error(
      `Error reading benchmark scenarios for provider ${providerDir}:`,
      error.message,
    );
    return [];
  }
}
