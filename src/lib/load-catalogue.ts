import fs from 'fs';
import path from 'path';
import https from 'https';
import { SOURCE_BRANCH } from '../config';
import type { Algorithm } from '../types/models/algorithm';
import type { Catalogue } from '../types/models/catalogue';
import type { UDP } from '../types/models/udp';

const CATALOGUE_JSON_DIR = `contents/apex_algorithms-${SOURCE_BRANCH}/algorithm_catalog`;

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

export const loadCatalogueData = () => {
    const jsonsInDir = 
        fs.readdirSync(CATALOGUE_JSON_DIR)
            .filter(file => path.extname(file) === '.json');    
   
    const data: Algorithm[] = [];

    jsonsInDir.forEach(file => {
        const fileData = fs.readFileSync(path.join(CATALOGUE_JSON_DIR, file));
        const json: Algorithm = JSON.parse(fileData.toString());

        json.type = !!json.links.find(l => l.rel === 'openeo-process') ? 'openEO' : 'OGC API Process'

        data.push(json)
    });

    return data;
}

export const loadCatalogueDetailData = async () => {
    const jsonsInDir = 
        fs.readdirSync(CATALOGUE_JSON_DIR)
            .filter(file => path.extname(file) === '.json');

    const data: Catalogue[] = [];

    for (const file of jsonsInDir) {
        try {
            const algorithm = JSON.parse(fs.readFileSync(path.join(CATALOGUE_JSON_DIR, file)).toString()) as Algorithm;
            const udpUrl = algorithm.links.find(link => link.rel === 'openeo-process')?.href
            if (udpUrl) {
                const udp = await fetchJson(udpUrl.replace('main', SOURCE_BRANCH)) as UDP;
                data.push({
                  algorithm,
                  udp,
                })
            }
        } catch (_err) {
            // do nothing
        }
    }

    return data;
}