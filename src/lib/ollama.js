import ollama from 'ollama'

const getEmbedding = async (chunk) => {
    try {
        const Embed = await ollama.embeddings({
            model: 'nomic-embed-text',
            prompt: chunk
        })
        return Embed.embedding
    } catch (error) {
        console.log("Failed to fetch embed:", err);
    }
}

export {
    getEmbedding
}