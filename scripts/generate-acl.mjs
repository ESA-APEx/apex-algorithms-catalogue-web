import fs from 'fs';
import path from 'path';

const ALGORITHM_CATALOG_DIR = 'contents/apex_algorithms/algorithm_catalog';
const OUTPUT_FILE = 'src/acl-mapping.json';

main();

function main() {
  console.log('Extracting ACL mappings from provider records...');

  const aclMapping = extractAclMapping();

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(aclMapping, null, 2), 'utf-8');

  console.log(`ACL mapping generated successfully! Output file: ${OUTPUT_FILE}`);
}


function extractAclMapping() {
  const aclMapping = {
    acl: {
      admin: [],
    },
    records: {}
  };

  try {
    const providers = fs.readdirSync(ALGORITHM_CATALOG_DIR, { withFileTypes: true });

    for (const provider of providers) {
      if (!provider.isDirectory()) {
        continue;
      }
      const providerDir = path.join(
        ALGORITHM_CATALOG_DIR,
        provider.name,
      );
      const providerRecordPath = path.join(
        providerDir,
        'record.json'
      );

      try {
        const providerRecord = JSON.parse(fs.readFileSync(providerRecordPath, 'utf-8'));
        const acl = providerRecord?.properties?.acl;

        if (acl && Array.isArray(acl.admin)) {
          aclMapping.acl.admin = [...aclMapping.acl.admin, ...acl.admin];
          const recordIds = getAlgorithmRecordIds(provider.name);
          // Assign each algorithm record id with the provider ACL
          for (const recordId of recordIds) {
            if (aclMapping.records[recordId]) {
              aclMapping.records[recordId] = [...aclMapping.records[recordId], ...acl.admin];
            } else {
              aclMapping.records[recordId] = acl.admin;
            }
          }
        } else {
          console.warn(
            `Warning: No ACL found for provider ${provider.name}`
          );
        }
      } catch (error) {
        console.error(
          `Error reading record.json for provider ${provider.name}:`,
          error.message
        );
      }
    }

    return aclMapping;
  } catch (error) {
    console.error('Error reading algorithm catalog directory:', error.message);
    throw error;
  }
}

function getAlgorithmRecordIds(providerDir) {
  try {
    const targetDir = path.join(ALGORITHM_CATALOG_DIR, providerDir);

    const records = fs
      .readdirSync(targetDir, { recursive: true })
      .map((file) => file.toString())
      .filter(
        (file) =>
          file.endsWith(".json") &&
          (file.includes("/records/") || file.includes("\\records\\")), // support linux and windows based path
      );

    const recordIds = [];

    for (const recordFile of records) {
      const recordPath = path.join(targetDir, recordFile);
      const recordContent = fs.readFileSync(recordPath, "utf-8");
      const recordJson = JSON.parse(recordContent);
      recordIds.push(recordJson.id);
    }

    return recordIds;
  } catch (error) {
    console.error(
      `Error reading records for provider ${providerDir}:`,
      error.message
    );
    return [];
  }
}