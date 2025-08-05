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

const CRAWL_LIMIT = 10  // Deep of recursive crawl

const GUEST_ID = "6890dc03237728a70b7b1e6e"

const ALLOWED_IMG_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];


export {
    CRAWL_STATUS,
    CRAWL_TYPE,
    CRAWL_LIMIT,
    GUEST_ID,
    ALLOWED_IMG_TYPES
}