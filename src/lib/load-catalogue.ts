import fs from 'fs';
import path from 'path';
import https from 'https';
import {SOURCE_BRANCH} from '../config';
import {type Algorithm, AlgorithmType} from '../types/models/algorithm';
import type {Catalogue} from '../types/models/catalogue';
import type {UDP} from '../types/models/udp';
import type {ApplicationDetails} from "@/types/models/application.ts";
import { isArray } from 'util';
import {markdown} from "@astropub/md";

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


const getAlgorithmType = (algorithm: Algorithm): AlgorithmType => {
    const applicationLink = algorithm.links.find(l => l.rel === 'application')

    if (!applicationLink) {
        return AlgorithmType.NONE
    }

    switch (applicationLink.type) {
        case 'application/cwl+yaml':
            return AlgorithmType.OGC_API_PROCESS;
        case 'application/vnd.openeo+json;type=process':
            return AlgorithmType.OPENEO;
        default:
            return AlgorithmType.NONE
    }
}

const getServiceRecords = (): string[] =>
    fs.readdirSync(CATALOGUE_JSON_DIR, {recursive: true})
        .map((file: string | Buffer) => file.toString())
        .filter((file: string) => file.endsWith('.json') && file.includes('/records'));


export const loadCatalogueData = () => {
    const jsonsInDir = getServiceRecords();

    const data: Algorithm[] = [];

    jsonsInDir.forEach(file => {
        const fileData = fs.readFileSync(path.join(CATALOGUE_JSON_DIR, file));
        const json: Algorithm = JSON.parse(fileData.toString());

        json.type = getAlgorithmType(json);

        data.push(json)
    });

    return data;
}

export const fetchOpenEOApplicationDetails = async (url: string): Promise<undefined | ApplicationDetails> => {
    if (!url) {
        return undefined;
    }

    const udp = await fetchJson(url) as UDP;
    return {
        id: udp.id,
        summary: udp.summary,
        description: udp.description,
        parameters:udp.parameters.map(p => ({
            name: p.name,
            description: p.description.replaceAll('\\n', '<br/>'),
            schema: Array.isArray(p.schema) ?
                p.schema.filter(s => s.type && s.type !== 'null').map(s => !s.subtype ? s.type : `${s.type}/${s.subtype}`).join(', ') :
                (p.schema.subtype ? `${p.schema.type}/${p.schema.subtype}` : p.schema.type),
            optional: p.optional,
            default: !p.default ? undefined : p.default
        }))
    }
}

export const fetchApplicationDetails = async (type: AlgorithmType, url: string): Promise<undefined | ApplicationDetails> => {
    if (!url) {
        return undefined;
    }

    try {
        if (type === AlgorithmType.OPENEO) {
            return fetchOpenEOApplicationDetails(url);
        }  else {
            return undefined;
        }
    } catch (e) {
        console.error(`Could not retrieve application details for ${url} (${type})`, e);
        return undefined;
    }

}

export const loadCatalogueDetailData = async (): Promise<Catalogue[]> => {
    const jsonsInDir = getServiceRecords();

    const data: Catalogue[] = [];

    for (const file of jsonsInDir) {
        try {
            const algorithm = JSON.parse(fs.readFileSync(path.join(CATALOGUE_JSON_DIR, file)).toString()) as Algorithm;
            const applicationUrl = algorithm.links.find(link => link.rel === 'application')?.href

            algorithm.type = getAlgorithmType(algorithm);

            if (applicationUrl) {
                const applicationDetails = await fetchApplicationDetails(algorithm.type, applicationUrl);
                data.push({
                    algorithm,
                    applicationDetails,
                })
            } else {
                data.push({
                    algorithm
                })
            }
        } catch (_err) {
            console.error(`Could not load data for ${file}`, _err);
        }
    }

    return data;
}