const CRAWL_STATUS = {
    PENDING: "Pending",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    FAILED: "Failed"
}

const CRAWL_TYPE = {
    PAGE: "Page",   // Crawl only the provided web page
    DOMAIN: "Domain"    // Crawl entire domain - recursively call all the domain url present it the page
}

const CRAWL_LIMIT = 50

export {
    CRAWL_STATUS,
    CRAWL_TYPE,
    CRAWL_LIMIT
}