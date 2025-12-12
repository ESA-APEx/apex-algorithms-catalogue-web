import fs from "fs";
import path from "path";
import https from "https";
import type { Platform } from "../types/models/platform";
import { type Algorithm, AlgorithmType } from "../types/models/algorithm";
import type { Catalogue } from "../types/models/catalogue";
import type { UDP } from "../types/models/udp";
import type { ApplicationDetails } from "@/types/models/application.ts";

const CATALOGUE_JSON_DIR = `contents/apex_algorithms/algorithm_catalog`;

const fetchJson = (url: string) => {
  return new Promise<any>((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        // Collect data chunks
        res.on("data", (chunk) => {
          data += chunk;
        });

        // On end, resolve the promise with parsed JSON
        res.on("end", () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(`Error parsing JSON: ${error}`);
          }
        });
      })
      .on("error", (err) => {
        reject(`Error fetching JSON: ${err.message}`);
      });
  });
};

const getAlgorithmType = (algorithm: Algorithm): AlgorithmType => {
  if (algorithm.conformsTo.includes("https://apex.esa.int/core/openeo-udp")) {
    return AlgorithmType.OPENEO;
  } else if (
    algorithm.conformsTo.includes("https://apex.esa.int/core/ogc-api-processes")
  ) {
    return AlgorithmType.OGC_API_PROCESS;
  } else {
    return AlgorithmType.NONE;
  }
};

const getServiceRecords = (): string[] =>
  fs
    .readdirSync(CATALOGUE_JSON_DIR, { recursive: true })
    .map((file: string | Buffer) => file.toString())
    .filter(
      (file: string) =>
        file.endsWith(".json") &&
        (file.includes("/records/") || file.includes("\\records\\")), // support linux and windows based path
    );

export const loadCatalogueData = () => {
  const jsonsInDir = getServiceRecords();

  const data: Omit<Catalogue, 'applicationDetails'>[] = [];

  jsonsInDir.forEach(async (file) => {
    const fileData = fs.readFileSync(path.join(CATALOGUE_JSON_DIR, file));
    const algorithm: Algorithm = JSON.parse(fileData.toString());

    algorithm.type = getAlgorithmType(algorithm);

    const visible = (algorithm.properties?.visibility || "public") === "public";

    const platformLink = algorithm.links.find((link) => link.rel === "platform");
    const platform = await fetchPlatformDetails(platformLink?.href || "", file);

    if (visible) {
      data.push({
        algorithm,
        platform,
      });
    }
  });

  return data;
};

export const fetchOpenEOApplicationDetails = async (
  url: string,
): Promise<undefined | ApplicationDetails> => {
  if (!url) {
    return undefined;
  }

  const udp = (await fetchJson(url)) as UDP;
  return {
    id: udp.id,
    summary: udp.summary,
    description: udp.description,
    parameters: udp.parameters.map((p) => ({
      name: p.name,
      description: p.description.replaceAll("\\n", "<br/>"),
      schema: Array.isArray(p.schema)
        ? p.schema
            .filter((s) => s.type && s.type !== "null")
            .map((s) => (!s.subtype ? s.type : `${s.type}/${s.subtype}`))
            .join(", ")
        : p.schema.subtype
          ? `${p.schema.type}/${p.schema.subtype}`
          : p.schema.type,
      optional: p.optional,
      default: !p.default ? undefined : p.default,
    })),
  };
};

export const fetchApplicationDetails = async (
  type: AlgorithmType,
  url: string,
): Promise<undefined | ApplicationDetails> => {
  if (!url) {
    return undefined;
  }

  try {
    if (type === AlgorithmType.OPENEO) {
      return fetchOpenEOApplicationDetails(url);
    } else {
      return undefined;
    }
  } catch (e) {
    console.error(
      `Could not retrieve application details for ${url} (${type})`,
      e,
    );
    return undefined;
  }
};

export const fetchPlatformDetails = async (
  url: string,
  recordPath: string,
): Promise<undefined | Platform> => {
  if (!url) {
    return undefined;
  }
  try {
    if (url.includes('http')) {
      const platform = (await fetchJson(url)) as Platform;
      return platform;
    }

    const contentRecordDir = path.dirname(path.join(CATALOGUE_JSON_DIR, recordPath))
    // the url might contain a relative path from record json to the platform json file
    const platformFile = fs.readFileSync(path.join(contentRecordDir, url));
    return JSON.parse(platformFile.toString()) as Platform;
  } catch (e) {
    console.error(`Could not retrieve platform details for ${url}`, e);
    return undefined;
  }
};

export const loadCatalogueDetailData = async (): Promise<Catalogue[]> => {
  const jsonsInDir = getServiceRecords();

  const data: Catalogue[] = [];

  for (const file of jsonsInDir) {
    try {
      const algorithm = JSON.parse(
        fs.readFileSync(path.join(CATALOGUE_JSON_DIR, file)).toString(),
      ) as Algorithm;
      const applicationUrl = algorithm.links.find(
        (link) => link.rel === "application",
      )?.href;

      algorithm.type = getAlgorithmType(algorithm);
      let applicationDetails: ApplicationDetails | undefined;
      if (applicationUrl) {
        applicationDetails = await fetchApplicationDetails(
          algorithm.type,
          applicationUrl,
        );
      }

      const platform = algorithm.links.find(
        (link) => link.rel === "platform",
      )?.href;
      let platformDetails: Platform | undefined;
      if (platform) {
        platformDetails = await fetchPlatformDetails(platform, file);
      }

      data.push({
        algorithm,
        applicationDetails,
        platform: platformDetails,
      });

    } catch (_err) {
      console.error(`Could not load data for ${file}`, _err);
    }
  }

  return data;
};
