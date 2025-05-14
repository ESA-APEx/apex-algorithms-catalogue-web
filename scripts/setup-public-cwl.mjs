import fs from 'fs';
import path from 'path';

modifySarCoinJson();

function modifySarCoinJson() {
    console.log('Modifying sar_coin.json...');
    const filePath = path.resolve('./contents/apex_algorithms-main/algorithm_catalog/terradue/sar_coin/records/sar_coin.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    jsonData.links = jsonData.links.filter((link) => !['order', 'application'].includes(link.rel));
    jsonData.links.push({
        rel: 'application',
        type: 'application/cwl+yaml',
        href: 'https://raw.githubusercontent.com/eoap/inference-eoap/refs/heads/main/cwl-workflow/stage-and-cog.cwl',
    })

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
    console.log('Modification of sar_coin.json completed ✅.');
};