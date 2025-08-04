import { getWebsites } from "./chat.js"
import puppeteer from 'puppeteer'
import { CRAWL_STATUS, CRAWL_TYPE } from "../constants.js"
import websiteModel from "../models/websiteModel.js";
import { normalizeURL } from "@/utils.js";

let defaultURLs = [
    {
        website_url: "https://course-listing-two.vercel.app/",
        crawl_status: CRAWL_STATUS.PENDING,
        crawl_type: CRAWL_TYPE.DOMAIN
    },
    {
        website_url: "https://www.scrapethissite.com/pages/simple/",
        crawl_status: CRAWL_STATUS.PENDING,
        crawl_type: CRAWL_TYPE.PAGE
    },
    {
        website_url: "https://quotes.toscrape.com/",
        crawl_status: CRAWL_STATUS.PENDING,
        crawl_type: CRAWL_TYPE.PAGE
    }
]

const crawlPage = async (website, baseURL) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const urlObj = new URL(website);

    await page.goto(website, { waitUntil: 'networkidle2' });

    // Download Images

    // Get HyperLinks
    let links = await page.$$eval('a', links => links.map(link => {
        link = link.href
        if (link.startsWith("/")) {
            // Relative url
            return normalizeURL(`${baseURL}${link}`)
        } else {
            // Absolute url
            return normalizeURL(`${link}`)
        }
    }))

    // Filter URLs of same domain
    links.filter(link => {
        let baseURLObj = new URL(baseURL)
        let linkObj = new URL(link)
        return baseURLObj.hostname == linkObj.hostname
    })

    // Get body in text format
    const bodyText = await page.evaluate(() => {
        return document.body.innerText
    });

    let chunck = getChuncks(bodyText)


    return links
}

const crawlWebsite = async (website, crawl_type = CRAWL_TYPE.PAGE) => {
    console.log(`Crawling: ${website}`);
    if (crawl_type == CRAWL_TYPE.DOMAIN) {
        let urls = [website]
        let visitedURL = []
        let crawlLimit = 50

        while (!urls.length && visitedURL.length <= 50) {
            await crawlPage(website)
        }

    } else {

    }
}

export const crawler = async (urls = []) => {
    urls = urls.length ? urls : defaultURLs

    for (let site of urls) {
        website_url = (typeof site === 'object') ? site.website_url : site
        const existing = await websiteModel.findOne({ website_url })

        // If record already exist is the db, check status and crawl accordingly
        if (existing) {
            if (existing.crawl_status === CRAWL_STATUS.COMPLETED) {
                console.log(`Skipping already completed: ${existing.website_url}`)
                continue
            }

            if (existing.crawl_status === CRAWL_STATUS.IN_PROGRESS) {
                console.log(`Still in progress: ${existing.website_url}`)
                continue
            }

            if (existing.crawl_status === CRAWL_STATUS.FAILED) {
                console.log(`Failed previously. Cleaning: ${existing.website_url}`)
                await Embedding.deleteMany({ domain: existing._id })
            }

            // Set to IN_PROGRESS and try crawling
            existing.crawl_status = CRAWL_STATUS.IN_PROGRESS
            await existing.save()

            try {
                await crawlWebsite(existing)
                existing.crawl_status = CRAWL_STATUS.COMPLETED
            } catch (err) {
                console.error(`Crawl failed for ${existing.website_url}: `, err)
                existing.crawl_status = CRAWL_STATUS.FAILED
            }

            await existing.save()
        } else {
            // New entry
            const newWebsite = new Website({
                website_url: website_url,
                crawl_type: (typeof site === 'object') ? site.crawl_type : CRAWL_TYPE.PAGE,
                crawl_status: CRAWL_STATUS.IN_PROGRESS,
            });

            await newWebsite.save()

            try {
                await crawlWebsite(newWebsite)
                newWebsite.crawl_status = CRAWL_STATUS.COMPLETED
            } catch (err) {
                console.error(`Crawl failed for ${site.website_url}: `, err)
                newWebsite.crawl_status = CRAWL_STATUS.FAILED
            }

            await newWebsite.save()
        }
    }
}

(process.argv.length > 2)
    ? crawler(process.argv.slice(2))
    : crawler()
