import fs from 'fs';
import path from 'path';
import { chromium } from "@playwright/test";
import * as cheerio from 'cheerio';

const MAIN_SITE_URL = 'https://apex-esa.drupal.int.vito.be/';
const HEADER_SELECTOR = 'header';
const FOOTER_SELECTOR = 'footer';
const HEADER_FILENAME = 'NavBar.astro';
const FOOTER_FILENAME = 'Footer.astro';
const DOWNLOAD_DIR = 'src/components/';

await main();

async function main() {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(MAIN_SITE_URL);
    
    const header = await page.locator(HEADER_SELECTOR).first().innerHTML();
    const footer = await page.locator(FOOTER_SELECTOR).first().innerHTML();

    writeToFile(`<nav class="text-white w-full max-w-screen-2xl mx-auto px-4">${resolveExternalUrls(header, MAIN_SITE_URL)}</nav>`, HEADER_FILENAME);
    writeToFile(`<footer class="text-white w-full max-w-screen-2xl mx-auto px-4">${resolveExternalUrls(footer, MAIN_SITE_URL)}</footer>`, FOOTER_FILENAME);

    await browser.close();
}

/**
 * Function to write file.
 * @param {string} content - Content of the file.
 * @param {string} fileName - Filename.
 * @returns void
 */
function writeToFile(content, fileName) {
    const destination = path.resolve(DOWNLOAD_DIR, fileName);
    fs.writeFileSync(destination, content);
}

/**
 * Function to prepend base URL to anchor and image tags that do not start with http or https.
 * @param {string} html - The HTML content to transform.
 * @param {string} baseUrl - The base URL to prepend to relative links.
 * @returns {string} - The transformed HTML content with modified links.
 */
function resolveExternalUrls(html, baseUrl) {
    const $ = cheerio.load(html);

    // Prepend base URL to links that do not start with http or https
    $('a').each((_, element) => {
        const href = $(element).attr('href');
        if (href && !/^https?:\/\//i.test(href)) {
            // Prepend base URL if the link is relative
            $(element).attr('href', new URL(href, baseUrl).href);
        }
    });

    // Prepend base URL to image sources that do not start with http or https
    $('img').each((index, element) => {
        const src = $(element).attr('src');
        if (src && !/^https?:\/\//i.test(src)) {
            // Prepend base URL if the source is relative
            $(element).attr('src', new URL(src, baseUrl).href);
        }
    });

    // Return the modified HTML as a string
    return $.html().replace(/<\/?(html|head|body)[^>]*>/g, '');
}