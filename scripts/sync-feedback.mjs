import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createDiscourseClient, reconcileServiceTopics } from "./discourse.mjs";

const catalogueDirectory = "contents/apex_algorithms/algorithm_catalog";
const apiKey = process.env.DISCOURSE_API_KEY;
const apiUsername = process.env.DISCOURSE_API_USERNAME;
const categoryId = Number(process.env.DISCOURSE_CATEGORY_ID);

if (!apiKey || !apiUsername || !Number.isInteger(categoryId) || categoryId <= 0) {
  if (process.env.BUILD_TARGET === "production") {
    throw new Error("Discourse API key, username, and category ID are required");
  }
  console.log("Skipping Discourse feedback sync: forum configuration is missing");
} else {
  const records = findRecordFiles(catalogueDirectory);
  const services = records.flatMap((recordPath) => {
    const record = JSON.parse(fs.readFileSync(recordPath, "utf-8"));
    if ((record.properties?.visibility || "public") !== "public") {
      return [];
    }
    if (!record.id || !record.properties?.title) {
      throw new Error(`Service record is missing an ID or title: ${recordPath}`);
    }
    return [
      {
        id: record.id,
        title: record.properties.title,
        description: (record.properties.description || "").slice(0, 500),
      },
    ];
  });

  if (services.length === 0) {
    throw new Error("No public service records found; refusing to archive topics");
  }

  await reconcileServiceTopics({
    services,
    categoryId,
    catalogueBaseUrl:
      process.env.PUBLIC_PRODUCTION_BASE_URL ||
      "https://algorithm-catalogue.apex.esa.int",
    client: createDiscourseClient({ apiKey, apiUsername }),
  });
  console.log(`Synchronized ${services.length} APEx service feedback topics`);
}

function findRecordFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return findRecordFiles(entryPath);
    }
    return entry.isFile() &&
      entry.name.endsWith(".json") &&
      entryPath.split(path.sep).includes("records")
      ? [entryPath]
      : [];
  });
}
