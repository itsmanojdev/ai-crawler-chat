/***********************
 * Takes url and gives url with only domain and the path *
 **********************/
const normalizeURL = (url) => {
    const urlObj = new URL(url);
    const normalizedURL = `${urlObj.hostname}${urlObj.pathname}`
    if (normalizedURL.length && normalizedURL.slice(-1) === '/') {
        return normalizedURL.slice(0, -1)
    }
    return normalizedURL
}

/***********************
 * Get array of chunck from text *
 **********************/
const getChuncks = (text, maxChunkSize = 500, overlap = 50) => {
    const chunks = [];
    let start = 0;

    // If text is not fully parsed
    while (start < text.length) {
        let end = Math.min(start + maxChunkSize, text.length);
        let chunk = text.slice(start, end).trim();

        // Avoid splitting words
        if (end < text.length) {
            const lastSpace = chunk.lastIndexOf(' ');
            if (lastSpace > 0) {
                chunk = chunk.slice(0, lastSpace);
                end = start + lastSpace;
            }
        }

        chunks.push(chunk);
        start = end - overlap; // overlap with previous chunk - to get more semantic searches
    }

    return chunks;
}

export {
    normalizeURL,
    getChuncks
}