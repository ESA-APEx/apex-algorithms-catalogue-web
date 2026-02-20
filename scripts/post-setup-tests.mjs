import fs from "fs";
import path from "path";

copyFileSourceToDist(
  "./src/acl-mapping.json",
  "./dist/server/acl-mapping.json",
  "ACL mapping",
);
copyFileSourceToDist(
  "./src/benchmark-mapping.json",
  "./dist/server/benchmark-mapping.json",
  "Benchmark mapping",
);
copyDirSourceToDist(
  "./tests/fixtures",
  "./dist/client/fixtures",
  "test fixtures",
);

function copyFileSourceToDist(sourcePath, targetPath, description) {
  console.log(`Copying ${description} for tests...`);

  const source = path.resolve(sourcePath);
  const target = path.resolve(targetPath);
  const distServerDir = path.dirname(targetPath);

  if (!fs.existsSync(distServerDir)) {
    fs.mkdirSync(distServerDir, { recursive: true });
  }
  fs.copyFileSync(source, target);

  console.log(`Copying ${description} completed ✅.`);
}

function copyDirSourceToDist(sourceDir, targetDir, description) {
  console.log(`Copying ${description} for tests...`);

  const source = path.resolve(sourceDir);
  const target = path.resolve(targetDir);

  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  fs.cpSync(source, target, { recursive: true });

  console.log(`Copying ${description} completed ✅.`);
}
