import { AIChat } from "../../../lib/ollama";
import { NextResponse } from "next/server";


export async function POST(req) {
    try {
        const { user, websiteId, query } = await req.json();
        console.log("in api", websiteId, query)
        if (!query || !websiteId) {
            return NextResponse.json({ error: "Missing Input or website" }, { status: 400 });
        }

        const response = await AIChat(user, websiteId, query)

        // Return JSON response
        return NextResponse.json({ response }, { status: 200 });

    } catch (error) {
        console.error("Error in /api/chat:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}