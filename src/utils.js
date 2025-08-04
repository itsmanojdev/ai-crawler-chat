/**
 * Takes url and gives url with only domain and the path
 * @param {String} url - website URL
 * @returns - Normalized URL
 */
const normalizeURL = (url) => {
    try {
        const urlObj = new URL(url);
        const normalizedURL = `${urlObj.hostname}${urlObj.pathname}`
        if (normalizedURL.length && normalizedURL.slice(-1) === '/') {
            return normalizedURL.slice(0, -1)
        }
        return normalizedURL
    } catch (error) {
        console.log(`Invalid URL passed: ${url}`);
    }
}

/**
 * Get array of chunk from text
 * @param {string} text 
 * @param {number} maxChunkSize 
 * @param {number} overlap 
 * @returns [string]
 */
const getChunks = (text, maxChunkSize = 500, overlap = 50) => {
    const chunks = [];
    let start = 0, stopFlag = false

    // If text is not fully parsed
    while (start < text.length && !stopFlag) {
        let end = Math.min(start + maxChunkSize, text.length);
        if (end == text.length) {
            stopFlag = true
        }
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
    getChunks
}