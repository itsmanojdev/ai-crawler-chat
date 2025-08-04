import { getWebsites } from "./chat.js"
import puppeteer from 'puppeteer'
import { CRAWL_LIMIT, CRAWL_STATUS, CRAWL_TYPE } from "../constants.js"
import websiteModel from "../models/websiteModel.js";
import { getChuncks, normalizeURL } from "@/utils.js";
import { getAndSaveEmbeddings } from "./ollama.js";

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

const crawlPage = async (website, baseWebsite, getLinks = false, downloadImgs = false) => {
    let response = {}
    let baseURL = baseWebsite.website_url

    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.goto(website, { waitUntil: 'networkidle2' });

    // Download Images

    // Get HyperLinks
    if (getLinks) {
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

        response.links = links
    }


    // Get body in text format
    const bodyText = await page.evaluate(() => {
        return document.body.innerText
    });

    let chuncks = getChuncks(bodyText)
    getAndSaveEmbeddings(website, baseWebsite, chuncks)

    return response
}

const crawlWebsite = async (website) => {
    if (website.crawl_type == CRAWL_TYPE.DOMAIN) {
        let urls = [website.website_url]
        let visitedURLs = []

        while (!urls.length && visitedURLs.length <= CRAWL_LIMIT) {
            let currWebsite = urls.shift()
            console.log(`Crawling: ${currWebsite}`);
            let crawlResponse = await crawlPage(currWebsite, website, true)
            let links = crawlResponse.links !== undefined ? crawlResponse.links : []

            links.forEach(link => {
                if (!urls.includes(link) && !visitedURLs.includes(link)) {
                    urls.push(link)
                }
            })

            visitedURLs.push(currWebsite)
        }
    } else {
        console.log(`Crawling: ${website.website_url}`);
        await crawlPage(website.website_url, website)
    }
}

export const crawler = async (urls = []) => {
    urls = urls.length ? urls : defaultURLs

    for (let site of urls) {
        website_url = (typeof site === 'object') ? normalizeURL(site.website_url) : normalizeURL(site)
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
