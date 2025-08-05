import embeddingModel from "../models/embeddingModel.js"
import ollama from 'ollama'
import mongoose from "mongoose"
import OpenAI from "openai"

const getEmbedding = async (chunk) => {
    try {
        const Embed = await ollama.embeddings({
            model: 'nomic-embed-text',
            prompt: chunk
        })
        return Embed.embedding
    } catch (error) {
        console.log("Failed to fetch embed:", err)
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
                    limit: 10, // Number of results to return
                    filter: {
                        domain: new mongoose.Types.ObjectId(websiteID)
                    }
                }
            }
        ]);
        releventChunks = releventChunks.map(record => record.chunk).join("\n")


        let prompt = `
            Answer the Question only using the content provide.
            ${typeof user.name !== undefined ? `User Name: ${user.name}` : ''}
            Question: ${userQuery}
            content: ${releventChunks}
            `
        console.log('AI')

        const response = await openAIModel(prompt);

        return response
    } catch (error) {
        console.log("Error while getting AI response: ", error)
    }
}

const llamaModel = async (prompt) => {
    const response = await ollama.chat({
        model: 'llama3.2',
        messages: [{ role: 'user', content: prompt }],
    })
    console.log(response.message.content)

    return response.message.content
}

const openAIModel = async (prompt) => {
    const token = process.env.GITHUB_TOKEN
    const endpoint = "https://models.github.ai/inference"
    const model = "openai/gpt-4.1"

    const client = new OpenAI({ baseURL: endpoint, apiKey: token })

    const response = await client.chat.completions.create({
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
        ],
        temperature: 1.0,
        top_p: 1.0,
        model: model
    })

    console.log(response.choices[0].message.content)
    return response.choices[0].message.content
}


export {
    getEmbedding,
    AIChat
}