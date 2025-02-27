import { formatDate, compareAsc, add as addDate } from 'date-fns';

const start = '2024-08-01';
const PARQUET_FILE_TEMPLATE = 'https://s3.waw3-1.cloudferro.com/apex-benchmarks/metrics/v1/metrics-merged.parquet/[YEAR]-[MONTH]/part-0.parquet';

let cachedUrls: string[] = [];

const urlExists = async (url: string) => {
    const result = await fetch(url, {method: 'HEAD'});
    return result.ok;
}

export const getUrls = async (): Promise<string[]> => {
    if (cachedUrls.length > 0) {
        return cachedUrls;
    }

    if (PARQUET_FILE_TEMPLATE) {
        let template = PARQUET_FILE_TEMPLATE;
        let cursor = new Date(start);
        const urls: string[] = [];
        const now = new Date();

        while (compareAsc(now, cursor) > 0) {
            const url = template
                .replace('[YEAR]', formatDate(cursor, 'yyyy'))
                .replace('[MONTH]', formatDate(cursor, 'MM'));

            const exists = await urlExists(url);

            if (exists) {
                urls.push(url);
            }
            cursor = addDate(cursor, { months: 1 });
        }

        cachedUrls = urls;
        return urls;
    } else {
        return [];
    }
}