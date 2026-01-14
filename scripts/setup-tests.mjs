import fs from "fs";
import path from "path";

modifySarCoinJson();
createPrivateAlgorithm();

function modifySarCoinJson() {
  console.log("Modifying sar_coin.json...");
  const filePath = path.resolve(
    "./contents/apex_algorithms/algorithm_catalog/terradue/sar_coin/records/sar_coin.json",
  );
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const jsonData = JSON.parse(fileContent);

  jsonData.links = jsonData.links.filter(
    (link) => !["order", "application"].includes(link.rel),
  );
  jsonData.links.push({
    rel: "application",
    type: "application/cwl+yaml",
    href: "https://raw.githubusercontent.com/eoap/inference-eoap/refs/heads/main/cwl-workflow/stage-and-cog.cwl",
  });

  fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf-8");
  console.log("Modification of sar_coin.json completed ✅.");
}

function createPrivateAlgorithm() {
  console.log("Creating private algorithm...");
  const filePath = path.resolve(
    "./contents/apex_algorithms/algorithm_catalog/vito/biopar/records/biopar.json",
  );
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const jsonData = JSON.parse(fileContent);

  jsonData.properties.visibility = "private";
  jsonData.properties.description =
    "This is a private algorithm for testing purposes.";
  jsonData.properties.title = "Private Algorithm Test";

  fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf-8");
  console.log("Creation of private algorithm complete ✅.");
}
