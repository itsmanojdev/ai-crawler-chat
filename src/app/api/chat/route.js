import { AIChat } from "../../../lib/ollama";
import { NextResponse } from "next/server";
import userModel from "../../../models/userModel";


export async function POST(req) {
    try {
        const { user, websiteId, query } = await req.json();

        if (typeof user.name !== undefined) {
            const userRec = await userModel.findOne({ _id: user._id });
            userRec.queries = userRec.queries + 1
            await userRec.save()
        } else {
            const userRec = await userModel.findOne({ name: "Guest" });
            userRec.queries = userRec.queries + 1
            await userRec.save()
        }

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