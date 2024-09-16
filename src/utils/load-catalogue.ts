import fs from 'fs';
import path from 'path';
import type { Catalogue } from '../types/models/catalogue';
import type { CatalogueDetail } from '../types/models/catalogue-detail';

const CATALOGUE_JSON_DIR = 'contents/apex_algorithms-main/algorithm_catalog'
const CATALOGUE_DETAIL_JSON_DIR = 'contents/apex_algorithms-main/openeo_udp'

export const loadCatalogueData = () => {
    const jsonsInDir = 
        fs.readdirSync(CATALOGUE_JSON_DIR)
            .filter(file => path.extname(file) === '.json');
    
    const data: Catalogue[] = [];

    jsonsInDir.forEach(file => {
        const fileData = fs.readFileSync(path.join(CATALOGUE_JSON_DIR, file));
        const json = JSON.parse(fileData.toString());
        data.push(json)
    });

    return data;
}

export const loadCatalogueDetailData = () => {
    const jsonsInDir = 
        fs.readdirSync(CATALOGUE_JSON_DIR)
            .filter(file => path.extname(file) === '.json');

    const data: CatalogueDetail[] = [];

    jsonsInDir.forEach(file => {
        try {
            const fileData = fs.readFileSync(path.join(CATALOGUE_DETAIL_JSON_DIR, file));
            const json = JSON.parse(fileData.toString());
            data.push(json)
        } catch (_err) {
            // do nothing
        }
    });

    return data;
}