import { crawl } from "../../lib/crawler";
export async function GET() {
    try {
        await crawl();
        return Response.json({ message: 'Websites Crawled Successfully' });
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}