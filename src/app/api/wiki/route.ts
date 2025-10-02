import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic");

    if (!topic) {
        return NextResponse.json({ error: "Please provide a topic to search." }, { status: 400 });
    }

    try {
        // First, search for the topic to get the correct page title
        const searchRes = await fetch(
            `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
                topic
            )}&limit=1&namespace=0&format=json&origin=*`
        );
        const searchData = await searchRes.json();

        if (!searchData || searchData[1].length === 0) {
            return NextResponse.json({ error: `No Wikipedia page found for "${topic}".` }, { status: 404 });
        }

        const pageTitle = searchData[1][0];

        const [extractRes, contentRes] = await Promise.all([
            fetch(
                `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&titles=${encodeURIComponent(
                    pageTitle
                )}&format=json&explaintext&origin=*`
            ),
            fetch(
                `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(
                    pageTitle
                )}&format=json&prop=text&origin=*`
            )
        ]);

        const extractData = await extractRes.json();
        const contentData = await contentRes.json();

        if (contentData.error) {
            return NextResponse.json({ error: `Could not retrieve details for "${pageTitle}".` }, { status: 404 });
        }

        const pageId = Object.keys(extractData.query.pages)[0];
        const extract = extractData.query.pages[pageId].extract;

        let htmlContent = contentData.parse.text["*"];

        // Remove reference links
        htmlContent = htmlContent.replace(/<sup class=\"reference\".*?<\/sup>/g, "");

        // Extract image URLs
        const imageUrls = [];
        const imageRegex = /<img[^>]+src="([^">]+)"/g;
        let match;
        while ((match = imageRegex.exec(htmlContent)) !== null) {
            let imageUrl = match[1];
            if (imageUrl.startsWith("//")) {
                imageUrl = "https" + imageUrl;
            } else if (imageUrl.startsWith("/")) {
                imageUrl = "https://en.wikipedia.org" + imageUrl;
            }
            imageUrls.push(imageUrl);
        }

        return NextResponse.json({
            title: contentData.parse.title,
            summary: extract,
            images: imageUrls,
        });
    } catch (error) {
        console.error("Wikipedia API Error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred while fetching data from Wikipedia." },
            { status: 500 }
        );
    }
}
