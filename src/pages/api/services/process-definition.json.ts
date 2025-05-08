import nodeFetch from 'node-fetch';
import https from 'https';
import type { ApplicationDetails } from '@/types/models/application';
import type { CwlWorkflow } from '@/types/models/cwl';
import type { APIRoute } from 'astro';
import YAML from 'yaml';

const supportedTypes = ['cwl'];

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    const type = url.searchParams.get('type');

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');


    if (!targetUrl) {
        return new Response(JSON.stringify({ message: 'Parameter URL is required.' }), {
            status: 400,
            headers,
        });
    }

    if (!supportedTypes.includes(type as string)) {
        return new Response(JSON.stringify({ message: `Type ${type} is not supported.` }), {
            status: 400,
            headers,
        })
    }

  try {
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });
        const response = await nodeFetch(targetUrl, { agent });

        // Handle unauthorized or protected files
        if (!response.ok || response.status === 401 || response.status === 403) {
            const message = `Process definition for url ${targetUrl} is protected.`;
            return new Response(JSON.stringify({ message }), {
                status: 401,
                headers,
            });
        }

        const text = await response.text();
        const parsed = YAML.parse(text);
        const cwlGraph = parsed['$graph']?.find((graph: any) => graph.id === 'main') as (CwlWorkflow | undefined);

        if (type === 'cwl' && !!cwlGraph) {
            const details: ApplicationDetails = {
                summary: cwlGraph.label,
                description: cwlGraph.doc,
                parameters: Object.keys(cwlGraph.inputs).map(inputKey => {
                    const parameter = cwlGraph.inputs[inputKey];
                    return {
                        name: parameter.label,
                        description: parameter.doc,
                        schema: parameter.type,
                    };
                }),
            };
            return new Response(JSON.stringify(details), {
                status: 200,
                headers,
            });
        } else {
            return new Response(JSON.stringify({}), {
                status: 200,
                headers,
            })
        }
  } catch (error) {
        const message = `Fetching process definition for url ${targetUrl} has failed.`;
        console.error(message, error);

        return new Response(JSON.stringify({ message }), { 
            status: 500, 
            headers 
        });
  }
};
