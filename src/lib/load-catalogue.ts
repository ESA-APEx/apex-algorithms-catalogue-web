import fs from 'fs';
import path from 'path';
import https from 'https';
import type { Catalogue } from '../types/models/catalogue';
import type { CatalogueDetail } from '../types/models/catalogue-detail';

const CATALOGUE_JSON_DIR = 'contents/apex_algorithms-main/algorithm_catalog'

const fetchJson = (url: string) => {
  return new Promise<any>((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      // Collect data chunks
      res.on('data', (chunk) => {
        data += chunk;
      });

      // On end, resolve the promise with parsed JSON
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(`Error parsing JSON: ${error}`);
        }
      });
    }).on('error', (err) => {
      reject(`Error fetching JSON: ${err.message}`);
    });
  });
}

interface LoadCatalogueData {
    demo: boolean
}

export const loadCatalogueData = ({ demo }: LoadCatalogueData) => {
    let jsonsInDir = 
        fs.readdirSync(CATALOGUE_JSON_DIR)
            .filter(file => path.extname(file) === '.json');
    
    if (demo) {
        const NUM_OF_DUPLICATION = 5
        const originalList = jsonsInDir.splice(0)
        for (let i = 0; i < NUM_OF_DUPLICATION; i++) {
            jsonsInDir = [...jsonsInDir, ...originalList]
        }
    }
    
    const data: Catalogue[] = [];

    jsonsInDir.forEach(file => {
        const fileData = fs.readFileSync(path.join(CATALOGUE_JSON_DIR, file));
        const json = JSON.parse(fileData.toString());
        data.push(json)
    });

    return data;
}

export const loadCatalogueDetailData = async () => {
    const jsonsInDir = 
        fs.readdirSync(CATALOGUE_JSON_DIR)
            .filter(file => path.extname(file) === '.json');

    const data: CatalogueDetail[] = [];

    for (const file of jsonsInDir) {
        try {
            const algorithm = JSON.parse(fs.readFileSync(path.join(CATALOGUE_JSON_DIR, file)).toString()) as Catalogue;
            const udpUrl = algorithm.links.find(link => link.rel === 'openeo-process')?.href
            if (udpUrl) {
                const catalogueDetail = await fetchJson(udpUrl) as CatalogueDetail;
                data.push(catalogueDetail)
            }
        } catch (_err) {
            // do nothing
        }
    }

    return data;
}