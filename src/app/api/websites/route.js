import { CRAWL_STATUS } from "@/constants";
import websiteModel from "../../../models/websiteModel";

export async function GET() {
    let websites = await websiteModel.find({ crawl_status: CRAWL_STATUS.COMPLETED }, '_id website_url')

    return Response.json(websites);
}