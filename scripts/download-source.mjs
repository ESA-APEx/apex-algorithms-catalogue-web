import fs from "fs";
import path from "path";
import { mkdir, rm } from "fs/promises";
import { Readable } from "stream";
import { finished } from "stream/promises";
import unzipper from "unzipper";

const SOURCE_REF = process.env.ALGO_REF || "main";
const REPO_URL = `https://github.com/ESA-APEx/apex_algorithms/archive/refs/heads/${SOURCE_REF}.zip`;
const DOWNLOAD_DIR = "contents";
const REPO_FILENAME = `apex_algorithms`;

await main();

async function main() {
  console.log(`Downloading algorithms from ${REPO_URL}`);
  await downloadFile(REPO_URL, `${REPO_FILENAME}.zip`);
  const downloadedFile = await unzipper.Open.file(
    `${DOWNLOAD_DIR}/${REPO_FILENAME}.zip`,
  );
  await downloadedFile.extract({ path: `${DOWNLOAD_DIR}/` });
  console.log(
    "Renaming",
    `${DOWNLOAD_DIR}/${REPO_FILENAME}-${SOURCE_REF}`,
    `${DOWNLOAD_DIR}/${REPO_FILENAME}`,
  );
  fs.renameSync(
    `${DOWNLOAD_DIR}/${REPO_FILENAME}-${SOURCE_REF}`,
    `${DOWNLOAD_DIR}/${REPO_FILENAME}`,
  );
}

async function downloadFile(url, fileName) {
  if (fs.existsSync(DOWNLOAD_DIR)) {
    await rm(DOWNLOAD_DIR, { recursive: true });
  }
  await mkdir(DOWNLOAD_DIR);

  const res = await fetch(url);
  const destination = path.resolve(DOWNLOAD_DIR, fileName);
  const fileStream = fs.createWriteStream(destination, { flags: "wx" });
  await finished(Readable.fromWeb(res.body).pipe(fileStream));
}
