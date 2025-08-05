import { connectdb, disconnectdb } from "./mongodb.js";
import puppeteer from 'puppeteer'
import { CRAWL_LIMIT, CRAWL_STATUS, CRAWL_TYPE } from "../constants.js"
import websiteModel from "../models/websiteModel.js";
import embeddingModel from "../models/embeddingModel.js";
import { getChunks, normalizeURL } from "../utils.js";
import { getEmbedding, getAtlasNomicEmbed } from "./ollama.js";

let defaultURLs = [
    {
        website_url: "https://course-listing-two.vercel.app/courses",
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

/**
 * Crawl a particular web page
 * @param {string} website 
 * @param {object} baseWebsite 
 * @param {boolean} getLinks 
 * @param {boolean} downloadImgs 
 * @returns object with links
 */
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
                return `${baseURL}${link}`

            } else {
                // Absolute url
                return `${link}`
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

    let chunks = getChunks(bodyText)

    await getAndSaveEmbeddings(website, baseWebsite, chunks)

    return response
}

/**
 * Get Embeddings for each chunk and save to DB
 * @param {string} website 
 * @param {object} baseWebsite 
 * @param {[string]} chunks
 */
const getAndSaveEmbeddings = async (website, baseWebsite, chunks) => {
    try {
        if (!Array.isArray(chunks) || chunks.length === 0) {
            console.log("No chunks to embed.");
            return;
        }

        for (let i = 0; i < chunks.length; i++) {
            // let embedding = await getEmbedding(chunks[i]);
            let embedding = await getAtlasNomicEmbed(chunks[i]);

            // Insert into MongoDB
            await embeddingModel.create({
                domain: baseWebsite._id,
                website_url: website,
                chunk_id: i + 1,
                chunk: chunks[i],
                embedding,
            });
        }
    } catch (err) {
        console.log("Failed to embed and store chunks:", err);
    }
}

/**
 * Crawl Website based on crwal_type
 * @param {object} website 
 */
const crawlWebsite = async (website) => {
    if (website.crawl_type == CRAWL_TYPE.DOMAIN) {
        let urls = [website.website_url]
        let visitedURLs = []

        while (urls.length && visitedURLs.length <= CRAWL_LIMIT) {
            let currWebsite = urls[0]
            console.log(`Crawling: ${currWebsite}`);
            let crawlResponse = await crawlPage(currWebsite, website, true)

            let links = crawlResponse.links !== undefined ? crawlResponse.links : []
            links.forEach(link => {
                if (!urls.includes(link) && !visitedURLs.includes(normalizeURL(link))) {
                    urls.push(link)
                }
            })

            urls.shift()
            visitedURLs.push(normalizeURL(currWebsite))
        }
        console.log(`Done Crawling: ${website.website_url}`);

    } else {
        console.log(`Crawling: ${website.website_url}`);
        await crawlPage(website.website_url, website)
        console.log(`Done Crawling: ${website.website_url}`);

    }
}

/**
 * Initialize crawler
 * @param {[string]} urls 
 */
export const crawler = async (urls = []) => {
    urls = urls.length ? urls : defaultURLs

    for (let site of urls) {
        let website_url = (typeof site === 'object') ? site.website_url : site
        try {

            const existing = await websiteModel.findOne({ website_url: { $regex: normalizeURL(website_url), $options: 'i' } })

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
                    await embeddingModel.deleteMany({ domain: existing._id })
                }

                // Set to IN_PROGRESS and try crawling
                existing.crawl_status = CRAWL_STATUS.IN_PROGRESS
                await existing.save()

                try {
                    await crawlWebsite(existing)
                    existing.crawl_status = CRAWL_STATUS.COMPLETED
                } catch (err) {
                    console.error(`Crawl failed for ${existing.website_url}: `, err.message)
                    existing.crawl_status = CRAWL_STATUS.FAILED
                }

                await existing.save()
            } else {
                // New entry
                const newWebsite = new websiteModel({
                    website_url: website_url,
                    crawl_type: (typeof site === 'object') ? site.crawl_type : CRAWL_TYPE.PAGE,
                    crawl_status: CRAWL_STATUS.IN_PROGRESS,
                });

                await newWebsite.save()

                try {
                    await crawlWebsite(newWebsite)
                    newWebsite.crawl_status = CRAWL_STATUS.COMPLETED
                } catch (err) {
                    console.log(`Crawl failed for ${site.website_url}: `, err)
                    newWebsite.crawl_status = CRAWL_STATUS.FAILED
                }

                await newWebsite.save()
            }
        } catch (error) {
            console.log("Error while Crawling at init: ", error.message);
        }
    }
}

await connectdb()

if (process.argv.length > 2) {
    await crawler(process.argv.slice(2))
} else {
    await crawler()
}

disconnectdb()
process.exit()