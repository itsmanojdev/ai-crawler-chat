import { getWebsites } from "./chat";
import puppeteer from 'puppeteer';

export const crawl = async () => {
    let websites = getWebsites();
    const browser = await puppeteer.launch();

    for (let website of websites) {
        const page = await browser.newPage();
        await page.goto(website, { waitUntil: 'networkidle2' });
        const bodyText = await page.evaluate(() => {
            return document.body.innerText;  // extracts all visible text content
        });

        console.log(bodyText);
    }
}