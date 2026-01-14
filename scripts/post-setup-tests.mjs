import fs from "fs";
import path from "path";

copyAclMapping();
copyFixtures();

function copyAclMapping() {
  console.log("Copying ACL mapping for tests...");

  const sourcePath = path.resolve("./src/acl-mapping.json");
  const targetPath = path.resolve("./dist/server/acl-mapping.json");
  const distServerPath = path.dirname(targetPath);

  if (!fs.existsSync(distServerPath)) {
    fs.mkdirSync(distServerPath, { recursive: true });
  }
  fs.copyFileSync(sourcePath, targetPath);

  console.log("Copying ACL mapping completed ✅.");
}

function copyFixtures() {
  console.log("Copying test fixtures...");

  const sourceDir = path.resolve("./tests/fixtures");
  const targetDir = path.resolve("./dist/client/fixtures");

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.cpSync(sourceDir, targetDir, { recursive: true });

  console.log("Copying test fixtures completed ✅.");
}
