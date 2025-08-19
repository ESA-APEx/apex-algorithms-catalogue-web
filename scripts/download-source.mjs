import fs from "fs";
import path from "path";
import { mkdir, rm } from "fs/promises";
import { Readable } from "stream";
import { finished } from "stream/promises";
import unzipper from "unzipper";

const SOURCE_BRANCH = "main";
const REPO_URL = `https://github.com/ESA-APEx/apex_algorithms/archive/refs/heads/${SOURCE_BRANCH}.zip`;
const DOWNLOAD_DIR = "contents";
const REPO_FILENAME = "apex_algorithms-main.zip";

await main();

async function main() {
  await downloadFile(REPO_URL, REPO_FILENAME);
  const downloadedFile = await unzipper.Open.file(
    `${DOWNLOAD_DIR}/${REPO_FILENAME}`,
  );
  await downloadedFile.extract({ path: `${DOWNLOAD_DIR}/` });
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
