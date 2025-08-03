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

export {
    CRAWL_STATUS,
    CRAWL_TYPE
}