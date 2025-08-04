import embeddingModel from "../models/embeddingModel.js";
import ollama from 'ollama'
import mongoose from "mongoose";

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

const AIChat = async (user, websiteID, userQuery) => {
    try {
        const embedding = await getEmbedding(userQuery)

        let releventChunks = await embeddingModel.aggregate([
            {
                $vectorSearch: {
                    index: 'vector_index', // index name
                    path: 'embedding',
                    queryVector: embedding,
                    numCandidates: 100, // Number of candidates to consider
                    limit: 2, // Number of results to return
                    filter: {
                        domain: new mongoose.Types.ObjectId(websiteID)
                    }
                }
            }
        ]);
        releventChunks = releventChunks.map(record => record.chunk).join("\n");


        let prompt = `
            Answer the Question only using the content provide.
            ${typeof user.name !== undefined ? `User Name: ${user.name}` : ''}
            Question: ${userQuery}
            content: ${releventChunks}
            `
        console.log('AI');

        const response = await ollama.chat({
            model: 'llama3.2',
            messages: [{ role: 'user', content: prompt }],
        })
        console.log(response.message.content);

        return response.message.content
    } catch (error) {
        console.log("Error while getting AI response: ", error);
    }
}

export {
    getEmbedding,
    AIChat
}