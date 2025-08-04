import { AIChat } from "../../../lib/ollama";

export async function POST(req) {
    try {
        const { websiteId, query } = await req.json();
        console.log("in api", websiteId, query)
        if (!query || !websiteId) {
            return Response.json({ error: "Missing Input or website" }, { status: 400 });
        }

        const response = await AIChat(websiteId, query)

        // Return JSON response
        return Response.json({ response }, { status: 200 });

    } catch (error) {
        console.error("Error in /api/chat:", error);
        return Response.json({ error: "Server error" }, { status: 500 });
    }
}