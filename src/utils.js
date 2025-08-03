const normalizeURL = (url) => {
    const urlObj = new URL(url);
    const normalizedURL = `${urlObj.hostname}${urlObj.pathname}`
    if (normalizedURL.length && normalizedURL.slice(-1) === '/') {
        return normalizedURL.slice(0, -1)
    }
    return normalizedURL
}

export {
    normalizeURL
}